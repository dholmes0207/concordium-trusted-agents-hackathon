# Tổng hợp sau Workshop 03 (v2): mô hình tin cậy, Approval Binding và kế hoạch kiểm chứng

> **Ngày soạn:** 11/11/2026 (trước W4)
> **Quan hệ với v1:** bản này thay `Tong-hop-sau-W3.md` (v1, 10/11) làm bản mới nhất. v1 giữ nguyên để đối chiếu.
> **Điều không đổi:** hướng **C-lite kết hợp** và kiến trúc **4 lớp L1–L4**.
> **Điều thay đổi:** sửa và bổ sung theo 10 vấn đề bạn nêu ngày 11/11, sau khi đối chiếu từng điểm với tài liệu kỹ thuật của Concordium (mục 2.5).
> **Ký hiệu:** ✅ đã xác nhận trong workshop · 📄 theo tài liệu chính thức, chưa thử thực tế · ⚠️ cần kiểm chứng hoặc rủi ro · ⏸️ tạm dừng · ⭐ quan trọng
> Mốc `[mm:ss]` ghi kèm tên buổi, ví dụ W2 [64:05].

**Thuật ngữ dùng trong bản này**

| Thuật ngữ | Nghĩa |
|---|---|
| Work order (phiếu giao việc) | Văn bản công ty A cấp cho agent: được làm gì, cho ai, đến khi nào. Đây là lớp **L2** |
| L3a | Xác minh nhân viên: ZK proof trên credential do A cấp (Web3 ID / CIS-4) |
| L3b | Phê duyệt của con người: người có thẩm quyền chấp thuận một hành động cụ thể |
| Presentation | Gói bằng chứng mà ví tạo ra để trả lời một yêu cầu xác minh |
| `credId` | Mã credential của một account Concordium; biết `credId` là biết account |
| Approval digest | Mã băm đại diện cho đúng một lần phê duyệt (mục 3.5) |

Trong bản đánh giá v2 ngày 06/11 và các trao đổi trước, "(a)" là credential CIS-4 và "(b)" là phiếu giao việc. Từ bản này, phiếu giao việc gọi là L2, còn L3a và L3b là **hai chức năng trong cùng lớp L3**, không phải hai lớp mới.

---

## 0. Tóm tắt một trang

| | |
|---|---|
| **Cuộc thi** | Concordium Trusted Agents Hackathon (Encode × Concordium). Thi solo được. Nộp bài trước **06:59 sáng T5 10/12** (giờ VN) |
| **Chấm điểm** | Depth of integration · credible path to production · it works · usefulness |
| **Hướng đã chốt** | ⭐ **C-lite kết hợp**: agent DevOps của công ty A thao tác trên hạ tầng (mô phỏng) của khách hàng B, qua gateway của B |
| **Chuỗi mục tiêu** | Verified Agent → Verified Organization → Valid Delegation → Verified Employee → Valid Consent → Authorized Execution → Verifiable Audit |
| **Mới ở v2** | 5 câu hỏi xác minh độc lập (không gộp thành `verified = true`) · **Approval Binding** · request có chữ ký chống replay · thu hồi phiếu giao việc độc lập · audit tách "quyết định" và "kết quả thực thi" · mục **Security & Trust Model** · kế hoạch kiểm chứng có điều kiện hoàn thành |
| **Phát hiện từ tài liệu** | ID App **không** tạo được proof gắn với account · agent NFT **chuyển chủ được** · badge **không** chứng minh KYB · CIS-8 chỉ chứng minh kiểm soát key **lúc đăng ký** · Register Data là loại giao dịch để neo hash (≤ 256 byte) |
| **Việc phải quyết** | Tuyến phê duyệt (mục 3.5, sau spike S3) · agent nền (mục 3.9), hạn **15/11** |
| **Mốc gần nhất** | **Tối nay T4 11/11, 22:00: W4** · T2 16/11: W5 (Global FinReg) · 23/11: Checkpoint 1 |

---

## 0.1 Thay đổi so với v1

### Đánh giá 10 vấn đề bạn nêu

| # | Vấn đề | Đánh giá | Thay đổi trong v2 | Mục |
|---|---|---|---|---|
| 1 | Commitment ≠ ZKP | **Đồng ý.** v1 viết commitment "giữ ẩn danh khi không dùng được CIS-4" nhưng không nói rõ khi đó tư cách nhân viên chỉ còn là lời xác nhận của A | Tách ba vai trò: commitment = chỉ định và truy trách nhiệm; ZKP = chứng minh tư cách; consent = chấp thuận hành động | 3.4, 4.9 |
| 2 | Liên kết ZKP ↔ Commitment ↔ Consent | **Đồng ý, ưu tiên số 1.** Có một điều chỉnh (xem dưới) | Thêm 5 điều kiện ràng buộc AB1–AB5 và hai phương án MVP | 3.5 |
| 3 | Agent Badge ≠ Verified Company | **Đồng ý.** Tài liệu badge ghi: badge chứng minh agent *"is owned by an accountable Concordium account"*, không nói gì về KYB | Tách Agent Verification và Organization Verification | 3.3, 3.4, 3.6 |
| 4 | Delegation Revocation | **Đồng ý** | Ba công tắc thu hồi độc lập; cơ chế cho MVP và hướng nâng cấp | 3.4, 4.7 |
| 5 | CIS-4 và Verify & Access | **Đồng ý.** Đã đối chiếu tài liệu, trả lời được một phần | Tách G1 thành G1.1–G1.4 kèm bằng chứng hiện có | 2.5, 5 |
| 6 | Privacy / G2 | **Đồng ý.** Tài liệu trả lời được phần lớn | Bảng "B thấy gì" theo từng loại bằng chứng; mục tiêu privacy viết lại | 3.2, 4.8 |
| 7 | Audit L4 | **Đồng ý**, có điều chỉnh (xem dưới) | Log có cấu trúc off-chain + neo hash; tách bản ghi quyết định và bản ghi thực thi | 3.4 |
| 8 | Replay Protection | **Đồng ý.** Spec CIS-8 xác nhận: chữ ký CIS-8 chỉ chứng minh kiểm soát key lúc đăng ký | Request envelope có chữ ký, nonce, hạn, audience | 3.4, 3.6 |
| 9 | Scope quá rộng | **Đồng ý.** v1 viết "7–9 thành phần đáp ứng tốt depth of integration": bỏ câu này | Chia lõi / có điều kiện / tùy chọn; mỗi thành phần phải trả lời một câu hỏi xác minh | 3.7, 3.8 |
| 10 | Chưa chọn agent nền | **Đồng ý** | Tiêu chí chọn, điểm tích hợp, ứng viên, hạn quyết định | 3.9 |

### Bốn chỗ mình điều chỉnh so với đề xuất của bạn

1. **Approval Service tin cậy không phải lúc nào cũng cần.** Tài liệu Verify & Access ghi: xác minh gắn với account *"must be done through a wallet app, as the ID App does not have access to accounts"*. Vì vậy:
   - Nếu kỹ sư duyệt bằng **ID App**, proof không gắn với account, B không có gì để đối chiếu với commitment → cần Approval Service tin cậy, đúng như bạn đề xuất.
   - Nếu kỹ sư duyệt bằng **ví có account**, proof lộ `credId` → B tự kiểm được ràng buộc bằng mật mã, không cần tin thêm bên nào.
   Chọn tuyến nào phụ thuộc kết quả spike S3 (mục 3.5).
2. **Bên xác minh proof nên là gateway của B**, không phải dịch vụ của A. Proof của Concordium kiểm chứng công khai được, nên B tự chạy verifier thì không phải tin ai về tính hợp lệ của proof. A chỉ còn được tin ở đúng một điểm (nếu dùng Approval Service): "người tạo proof là kỹ sư được chỉ định".
3. **Register Data, Memo và Merkle root không cùng loại.** Register Data và Memo là *cách neo*; Merkle root là *nội dung được neo* khi gom lô. Đề xuất: Register Data là cách neo chính, memo chỉ dùng khi có thanh toán, Merkle root dùng cho production.
4. **Kiểm chứng sớm, build muộn.** Thứ tự build vẫn là L1 → L2 → L4 → L3b → L3a. Nhưng vì G1.3 và G1.4 quyết định thiết kế Approval Binding, phần CIS-4 cần một spike giới hạn thời gian **ngay tuần này**, dù code chính thức của L3a viết sau cùng.

### Bảng tra mục (theo danh sách "các mục cần sửa trực tiếp")

| Mục trong v1 | Mục trong v2 |
|---|---|
| 3.2 Bài toán | 3.2 |
| 3.3 Thiết kế 4 lớp | 3.3 (năm câu hỏi), 3.4 (bốn lớp), 3.5 (Approval Binding) |
| 3.4 Demo | 3.6 |
| 3.5 Mapping | 3.7 |
| 4 Điểm còn mở | 5 |
| 6 Kế hoạch | 7 |
| 8 Rủi ro | 9 |
| Mục mới: Security & Trust Model | 4 |

### Giữ nguyên

Hướng C-lite kết hợp · use case Enterprise DevOps giữa A và B · kiến trúc L1–L4 · giữ cả ZKP, commitment và consent · agent chạy off-chain, gateway của B tự kiểm policy · hạ tầng của B là mô phỏng · không phụ thuộc Agent IDP và Protocol-Level Locks · thứ tự build L1 → L2 → L4 → L3, nâng L3 bằng CIS-4 sau cùng · C-full là hướng dài hạn.

---

## 1. Thể lệ và mốc thời gian

| Ngày (giờ VN) | Sự kiện | Trạng thái |
|---|---|---|
| 02/11, 04/11, 09/11 | W1, W2, W3 | ✅ Có báo cáo |
| **T4 11/11, 22:00** | **W4**: Protocol-Level Locks, EU AI Act Điều 12 | ⏳ Tối nay |
| **T2 16/11, 22:00** | **W5**: Ship to production (Global FinReg và LEI, sponsored transactions, ví) | ⏳ |
| T4 18/11, 22:00 | W6: MCP, A2A, Agent Card | ⏳ |
| T5 19/11 | Mở giai đoạn build | |
| **06:59 sáng T2 23/11** | **Checkpoint 1** | ⏳ |
| 24/11 – 08/12 | Office hours T3 và T6, 22:00 | |
| **06:59 sáng T5 10/12** | **Nộp bài cuối** | |

- **Yêu cầu tối thiểu:** chạy trên testnet; dùng **có ý nghĩa ít nhất một** thành phần Concordium.
- **Bài nộp:** mô tả · repo public · video ≤ 3 phút · link CCDExplorer · path to production.
- **Chấm:** depth of integration (*how meaningfully*) · credible path to production · it works · usefulness.
- **Giải:** cơ hội nhận grant từ quỹ 75M CCD + merch; không có giải tiền mặt.

---

## 2. Kiến thức từ 3 workshop

### 2.1 Workshop 1 (02/11): danh tính và ZK proof

| Điều quan trọng | Nguồn |
|---|---|
| Mọi account đều có danh tính thật đứng sau, chain không lưu PII; một danh tính tạo được nhiều account không liên kết công khai được | W1 [13:47–14:05] |
| ZK proof: range, membership / non-membership, reveal có đồng ý. Câu hỏi quá hẹp có thể làm lộ thông tin | W1 [19:10–20:30] |
| Privacy Guardians: 3 luật sư, ngưỡng 2-of-3, chỉ mở danh tính khi có lệnh tòa Thụy Sĩ | W1 [22:37–25:48] |
| Verify & Access: VRA (yêu cầu neo on-chain) → ví tạo ZK proof → verifier kiểm → audit anchor | W1 [26:14–33:08] |
| ⭐ Consent proof: đồng ý một câu cụ thể; hash nội dung nằm on-chain, sửa giữa đường sẽ bị phát hiện | W1 [38:58–40:05], [51:26–52:16] |
| Domain verification: ID App kiểm bản ghi DNS có chữ ký Concordium | W1 [42:53–44:28] |
| Chưa có tính duy nhất (uniqueness) xuyên account | W1 [48:46–49:24] |
| Được dùng code có sẵn | W1 [50:51–51:22] |

### 2.2 Workshop 2 (04/11): agent được xác minh

| Điều quan trọng | Nguồn |
|---|---|
| Registry = CIS-8004 (NFT cho agent) + CIS-8 (liên kết key ngoài) + Agent Card (JSON chuẩn A2A, hash neo on-chain) | W2 slide 05–09 |
| ⭐ Badge **không** chứng minh quyền chi tiêu/hành động, chất lượng code, uy tín doanh nghiệp | W2 slide 10 |
| ⭐ 3 loại key: identity credential · agent signing key CIS-8 (**không có quyền chi tiền**) · transaction key | W2 slide 14 |
| Một owner nhiều agent; xác minh A2A bằng ký nonce mới | W2 slide 15 |
| Nhìn account là biết IDP nào đã cấp danh tính | W2 [23:30–24:26] |
| Agent IDP đang ở devnet, không phụ thuộc | W2 slide 11 |
| ⭐ Điều giám khảo muốn thấy: anchor on-chain, use case thật, ZK thuộc tính, thanh toán, consent | W2 [64:05–66:03] |

### 2.3 Workshop 3 (09/11): agent trả tiền và nhận tiền

| Điều quan trọng | Nguồn |
|---|---|
| PLT là tài sản gắn sẵn trong protocol; chỉ account đã xác minh danh tính mới giữ được | W3 slide 05 |
| ⭐ Sponsored transactions ở tầng protocol (từ 03/2026), cho mọi loại giao dịch | W3 slide 11 |
| x402: buyer, seller API, facilitator; chưa có facilitator công khai | W3 slide 21–23 |
| ⭐ Spend controls của x402 chỉ là "soft"; Protocol-Level Locks (01/2027) mới cưỡng chế on-chain | W3 [~40:00–41:00] |
| Memo trên giao dịch chuyển token; dữ liệu lớn thì neo hash | W3 slide 30, [49:08–49:40] |
| Roadmap: EURQ (12/2026) · Locks và Verify & Pay cho agent (01/2027) · Concordium Signer (02/2027) | W3 slide 28 |
| Global FinReg trên testnet *đáng ra* nhanh (diễn giả không chắc) | W3 [53:38–54:53] |

### 2.4 Bản đồ thành phần theo trạng thái

| Thành phần | Trạng thái | Dùng trong dự án |
|---|---|---|
| Agent Registry CIS-8004, badge, MCP hosted | ✅ Testnet: contract `<12802,0>` | L1 |
| CIS-8 External Key Registry | ✅ Testnet: contract `<12801,0>`; spec còn là draft | L1 |
| Concordium ID, Verify & Access, consent, VRA/VAA | ✅ Testnet | L3b |
| Register Data | 📄 Loại giao dịch chuẩn, ≤ 256 byte | L2, L4 |
| Web3 ID / CIS-4 | 📄 Có công cụ testnet (issuer frontend, proof explorer, verifier) đang phản hồi ngày 11/11; ví của bạn có menu "Web3 ID" | L3a |
| Sponsored transactions | ✅ Testnet | Tùy chọn (phí) |
| Company ID qua Global FinReg | ⏸️ Testnet đòi Sign In / KYB; chờ W5 | Organization Verification |
| PLT / x402 | ✅ Testnet, phải tự chạy facilitator | Tùy chọn |
| Agent IDP | ❌ Devnet | Không dùng |
| Protocol-Level Locks, Verify & Pay cho agent, Concordium Signer | ❌ 2027 | Path to production |

### 2.5 Kết quả đối chiếu tài liệu (11/11) 📄

Tất cả các dòng dưới đây lấy từ tài liệu chính thức, **chưa thử thực tế**. Link ở cuối file.

| Chủ đề | Tài liệu ghi gì | Hệ quả |
|---|---|---|
| **Agent NFT** (CIS-8004) | Là token CIS-2: *"agents can be transferred, burned"*. Trường `owner` *"changes on transfer"*. Owner có thể cấp quyền cho **operator** để revoke hoặc đổi URL/hash của card. Trạng thái: Active hoặc Revoked | Gateway phải kiểm **owner hiện tại** ở mỗi phiên, không kiểm một lần rồi tin mãi |
| **Quyền admin của registry** | Có entrypoint chỉ dành cho admin: nâng cấp contract, chuyển NFT cưỡng bức | Bên vận hành registry (Concordium) là một bên được tin |
| **Badge** | Kiểm tra badge chứng minh agent *"is registered, is currently active, is owned by an accountable Concordium account"* và card đúng hash. *"A verifier decides which registries it trusts"* | Badge không chứng minh KYB. Gateway phải **ghim** contract registry được tin |
| **Agent Card** | Trường `provider.organization` là thông tin trong card | Tên tổ chức trong card do chủ agent tự khai, không phải bằng chứng |
| **CIS-8** | Đăng ký chứng minh account kiểm soát key ngoài bằng chữ ký trên một thông điệp có tiền tố `CIS-8/v1/canonical`. Thông điệp *"MUST NOT include a nonce or expiry"*. Ai có private key đều đăng ký lại key đó dưới account khác được (bản ghi cũ bị thay thế) | CIS-8 chỉ chứng minh kiểm soát key **lúc đăng ký**. Cần chữ ký mới ở mỗi request. Phải kiểm owner của key vẫn trùng owner của agent |
| **Verify & Access: hai kiểu xác minh** | *Against an ID*: làm được bằng ID App hoặc ví. *Against an account*: *"must be done through a wallet app, as the ID App does not have access to accounts"* | ID App không tạo được proof gắn account. Đây là gốc rễ của vấn đề Approval Binding |
| **SDK cho Verify & Access (V1)** | Yêu cầu gồm nonce 32 byte, context string, resource ID; được neo on-chain. Verifier chọn claim *identity* (*"not tied to a specific account"*, *"more privacy-preserving"*), *account*, hoặc để ví chọn. Trang này chỉ mô tả claim trên identity/account | ⚠️ Không thấy claim trên credential Web3 ID trong giao thức V1 |
| **Web3 ID (giao thức cũ, v0)** | Dùng với Concordium Wallet for Web. Presentation gắn với một `challenge` 32 byte. *"The presentation can combine requirements for account credentials and verifiable credentials."* Ví dụ nêu credential về *employment history* | Một presentation chứa được cả proof trên account lẫn proof trên credential nhân viên, cùng gắn một challenge |
| **Định danh lộ ra trong proof** | Proof trên account mang `did:ccd:<mạng>:cred:<credId>`. Proof trên credential Web3 ID mang `did:ccd:<mạng>:sci:<contract>/credentialEntry/<public key của holder>` | B thấy một định danh giả ổn định, không thấy tên |
| **CIS-4** | Mã credential = public key Ed25519 của holder. Có `valid_from`, `valid_until`, `credentialStatus` (Active, Revoked, Expired, NotActivated). Thu hồi bởi issuer, holder hoặc revocation authority. Mỗi registry chỉ chứa một loại credential | Thu hồi và hết hạn của credential nhân viên có sẵn trong chuẩn |
| **Verifier** | Verifier service mã nguồn mở, tự chạy bằng Docker. Dùng bản hosted thì *"you trust Concordium when verifying proofs"* | Gateway của B nên tự chạy verifier |
| **Audit của Verify & Access** | Bản ghi VAR lưu off-chain (không chứa PII), hash neo on-chain bằng VAA; mỗi anchor khoảng €0,02 | Đúng mẫu "log off-chain + neo hash" bạn đề xuất cho L4 |
| **Register Data** | Loại giao dịch ghi một mảng byte lên chain, *"commonly used to anchor a hash"*, tối đa 256 byte | Cách neo chính cho L2 và L4 |
| **Company ID** | Thuộc tính: `legalName`, `legalCountry`, `businessNumber` (bắt buộc), `lei`, `registrationAuth` (tùy chọn) | Organization Verification dùng reveal `legalName` hoặc `lei` |

---

## 3. Hướng đã chốt: C-lite kết hợp ⭐

### 3.1 Quá trình chốt

| Mốc | Quyết định |
|---|---|
| Sau W1 | 3 hướng A, B, C |
| Sau W2 | v1: gộp A+B; v2: chọn C-lite có điều kiện; sau đó gộp hai bản C-lite |
| Sau W3 (10/11) | Giữ hướng; thêm sponsored transactions, memo, Locks vào path to production |
| **11/11 (bản này)** | Giữ hướng; bổ sung tính đúng đắn của chuỗi xác minh và ủy quyền |

### 3.2 Bài toán

Công ty A cung cấp dịch vụ vận hành. Agent DevOps của A thao tác trên hạ tầng của khách hàng B. B cần biết chắc năm điều (mục 3.3), và cần bằng chứng kiểm toán cho mọi thao tác.

**Mục tiêu về quyền riêng tư là tiết lộ có chọn lọc (selective disclosure), không phải ẩn danh tuyệt đối:**
- B chỉ nhận thông tin cần cho quyết định: agent nào, công ty nào, phạm vi nào, có người đủ tư cách duyệt hay không.
- B **không** biết tên hay giấy tờ của kỹ sư.
- Tùy tuyến phê duyệt, B có thể thấy một **định danh giả** (`credId` hoặc public key của credential), liên kết được giữa các lần duyệt.
- A luôn biết kỹ sư là ai. Cơ quan có thẩm quyền có thể mở danh tính đứng sau một account qua Privacy Guardians.
- Dữ liệu neo on-chain là công khai: ai gửi, lúc nào, bao nhiêu lần (mục 4.8).

### 3.3 Năm câu hỏi xác minh độc lập

Gateway của B trả lời riêng từng câu. **Không gộp thành một trạng thái `verified = true`.**

| | Câu hỏi | Bằng chứng | Điểm tin cậy gốc B phải ghim |
|---|---|---|---|
| **V1 Agent** | Agent có tồn tại, đang Active, card đúng hash, và **đang** kiểm soát key không? | CIS-8004, CIS-8, chữ ký mới trên request | Contract registry được tin |
| **V2 Organization** | Owner hiện tại của agent có đúng là công ty A không? A có phải pháp nhân đã KYB không? | Owner == account A; IDP của account; reveal `legalName` / `lei` | Account của A (ghi trong hợp đồng dịch vụ) |
| **V3 Delegation** | Agent có phiếu giao việc hợp lệ: đúng người cấp, đúng agent, đúng nơi nhận, còn hạn, chưa thu hồi, đúng phạm vi? | Work order + anchor của A + trạng thái thu hồi | Account của A |
| **V4 Employee** | Người duyệt có tư cách do A cấp, còn hiệu lực không? | ZK proof trên credential CIS-4 + trạng thái trong registry | Registry credential của A |
| **V5 Consent** | Đúng hành động này đã được người có thẩm quyền chấp thuận chưa? | Presentation gắn với approval digest | Danh sách IDP được chấp nhận; quy tắc ràng buộc (3.5) |

Kết quả gateway trả về có dạng:

```json
{
  "decision": "allow | deny | needs_approval",
  "checks": {
    "agent": "pass", "organization": "pass", "delegation": "pass",
    "employee": "pass | fail | not_required | not_available",
    "consent": "pass | fail | not_required"
  },
  "reasons": ["mã lý do nếu có"]
}
```

### 3.4 Thiết kế bốn lớp (đã sửa)

#### L1: Agent Identity

**Giữ nguyên:** CIS-8004, CIS-8, Agent Card.

**Gateway kiểm, trực tiếp trên chain:**
1. Badge trỏ tới **contract registry đã ghim** (testnet `<12802,0>`); không chấp nhận registry lạ.
2. Trạng thái agent là Active.
3. Hash của Agent Card đang được phục vụ trùng `metadata_hash` on-chain.
4. Key CIS-8 gắn với agent đang Active, và **owner của key trùng owner của agent** (phát hiện trường hợp key bị đăng ký lại dưới account khác).
5. Request mang **chữ ký mới** của key đó (chứng minh agent kiểm soát key ngay lúc này).

**Bổ sung:**
- **Owner binding:** owner hiện tại phải trùng account A đã ghim. Kiểm ở mỗi phiên, vì NFT chuyển chủ được.
- **Không đồng nhất với KYB:** L1 chỉ trả lời V1. V2 kiểm riêng (mục 3.6).
- **Chống replay:** request envelope bên dưới.

**Request envelope (mọi request của agent):**

```text
AgentRequest = { v, audience, work_order_hash, action, resource, params_hash,
                 request_id (ngẫu nhiên 128 bit), issued_at, expires_at (≤ 60 giây), key_id }
signature    = Ký bằng key CIS-8 trên: "CLITE-GW/v1/request" ‖ dạng chuẩn hóa của AgentRequest
```

Gateway kiểm: chữ ký đúng key của agent · `audience` đúng là mình · còn hạn · `request_id` chưa từng thấy (lưu đến khi hết hạn) · cùng `request_id` thì trả lại đúng kết quả cũ, không thực thi lần hai.

Hai lưu ý khi ký:
- Tiền tố phải **khác** `CIS-8/v1/canonical`, để chữ ký lúc chạy không bao giờ dùng lại được làm bằng chứng đăng ký CIS-8.
- Nếu key của agent là key EVM (cũng ký được giao dịch trên chain khác), chỉ ký thông điệp có tiền tố theo đúng scheme đã đăng ký (ví dụ `ethereum-personal-sign`), không ký chuỗi 32 byte thô.

#### L2: Delegation (Signed Work Order + Commitment)

**Giữ nguyên:** phiếu giao việc do A cấp, kèm commitment về kỹ sư phụ trách.

**Mandate schema (bản nháp):**

```json
{
  "v": 1,
  "id": "wo_<định danh duy nhất>",
  "issuer":   "<account của A, dạng CAIP-10>",
  "audience": "<định danh gateway của B>",
  "agent":    { "tokenAddress": "<badge>", "key": "<public key CIS-8>" },
  "scope":    { "actions": ["logs.read", "service.restart"],
                "resources": ["env:staging/*"],
                "limits": { "maxPerHour": 20 } },
  "approval": { "requiredFor": ["deploy.prod", "data.delete"],
                "rolePolicy": "devops-oncall",
                "approverCommitment": "<sha256>" },
  "notBefore": "...", "expiresAt": "...",
  "nonce": "<ngẫu nhiên>"
}
```

`wo_hash` = SHA-256 của dạng JSON chuẩn hóa (JCS, RFC 8785).

**A ủy quyền bằng cách nào:** account của A gửi một giao dịch Register Data chứa `wo_hash`. Giao dịch đó chính là chữ ký của A, có thời điểm, và ai cũng kiểm được: đúng account gửi, đúng nội dung, đã finalized. Agent mang theo mã giao dịch này cùng phiếu.

**Gateway kiểm (V3):** anchor do đúng account A gửi · `agent` trùng agent đang gọi và key đang ký · `audience` đúng là mình · trong khoảng `notBefore`–`expiresAt` · chưa bị thu hồi · thao tác nằm trong `scope` **và** trong trần quyền mà B cho phép A.

**Thu hồi độc lập.** Ba công tắc, mỗi cái tắt một thứ khác nhau:

| Công tắc | Tắt cái gì | Cơ chế |
|---|---|---|
| Thu hồi **agent** | Mọi hoạt động của agent đó | `revoke` trên CIS-8004 |
| Thu hồi **credential** | Khả năng duyệt của một người | Thu hồi trong registry CIS-4 |
| Thu hồi **work order** | Đúng một lần ủy quyền | Xem bảng dưới |

| Cách thu hồi work order | Cơ chế | Độ trễ | Công sức | Dùng khi |
|---|---|---|---|---|
| **R1** | A gửi Register Data "thu hồi `wo_hash`" rồi báo mã giao dịch cho gateway; gateway xác minh giao dịch. Có thể thêm: gateway tự theo dõi giao dịch của account A | Vài giây nếu thông báo tới; tệ nhất bằng thời hạn của phiếu | Thấp | **MVP** |
| **R2** | Sổ trạng thái on-chain theo chuẩn CIS-4: mỗi work order là một bản ghi có `valid_until` và trạng thái thu hồi; gateway hỏi trạng thái ở mỗi request | ≈ thời gian finality | Trung bình; mỗi bản ghi cần một key Ed25519 riêng | Nâng cấp, nếu spike S2 đạt ⚠️ |
| **R3** | Contract nhỏ tự viết (đăng ký, thu hồi, hỏi trạng thái theo hash) | ≈ thời gian finality | Cao (Rust, deploy) | Chỉ khi còn thời gian |

Ở mọi phương án, phiếu có **thời hạn ngắn** (giờ hoặc ngày), để độ trễ thu hồi luôn có giới hạn trên.

**Commitment làm được gì và không làm được gì:**

`approverCommitment = SHA-256("clite/approver/v1" ‖ định danh người duyệt ‖ salt)`, với salt ngẫu nhiên ≥ 128 bit do A giữ.

| Commitment **làm được** | Commitment **không làm được** |
|---|---|
| Cam kết trước A đã chỉ định ai, A không đổi được về sau | Chứng minh người đó là nhân viên hợp lệ |
| Giấu định danh người được chỉ định với người ngoài (nếu salt đủ ngẫu nhiên và được giữ kín) | Chứng minh người đó còn tư cách tại thời điểm duyệt |
| Cho phép mở ra khi cần: cho B lúc duyệt, hoặc cho bên thứ ba khi tranh chấp | Tự nó chứng minh người đã duyệt chính là người được chỉ định |

Nếu chỉ có L2 mà không có L3a, tư cách của người duyệt là **lời xác nhận có chữ ký của A**, không phải bằng chứng B tự kiểm được.

#### L3a: Employee Verification (Web3 ID / CIS-4 + ZKP)

**Giữ nguyên:** A cấp credential cho kỹ sư; kỹ sư tạo ZK proof.

**Bổ sung:**
- **Credential:** A triển khai một registry CIS-4 cho một loại credential (ví dụ "DevOpsEngineer"), thuộc tính gợi ý: `role`, `customer`. Credential có hạn và thu hồi được.
- **Xác minh:** gateway của B tự chạy verifier; kiểm statement (ví dụ `role` thuộc tập `{devops-oncall}`), kiểm trạng thái credential trong registry là Active.
- **Issuer trust:** B chỉ chấp nhận credential từ **đúng registry của A đã ghim**. Liên hệ giữa registry đó và account của A phải kiểm được (account tạo contract trùng account A).
- **Privacy:** proof lộ public key của holder (mã credential) và địa chỉ registry; không lộ tên. Muốn giảm khả năng liên kết giữa các khách hàng thì cấp credential riêng cho từng khách hàng.
- **Proof binding:** challenge của presentation phải bằng approval digest (mục 3.5).

#### L3b: Human Approval (Concordium ID + Consent)

**Giữ nguyên:** thao tác rủi ro cần người duyệt.

**Bổ sung:**
- Consent phải gắn với: tóm tắt hành động cho người đọc, hash của request, hash của work order, nơi nhận, hạn, nonce. Tất cả gói trong approval digest.
- Phê duyệt **không mở rộng được phạm vi**: nó chỉ kích hoạt một thao tác đã nằm sẵn trong `approval.requiredFor` của phiếu.
- Luôn kèm ít nhất một statement khi xin consent (bản test của ID App có lỗi hiển thị với consent trống, W2 [08:36–09:17]).
- Có hai tuyến giao thức với ưu nhược khác nhau; xem 3.5.

#### L4: Audit

**Giữ nguyên:** neo hash on-chain.

**Bổ sung:**
- **Log có cấu trúc, lưu off-chain** tại gateway của B (JSON, mỗi bản ghi chứa hash của bản ghi trước). Các loại bản ghi:

| Loại | Nội dung |
|---|---|
| `request` | Hash của request đã ký, thời điểm nhận |
| `decision` | allow / deny / needs_approval, kết quả năm phép kiểm, mã lý do, tham chiếu bằng chứng |
| `approval` | Approval digest, hash của presentation, mã giao dịch VRA/VAA nếu có |
| `execution` | Bắt đầu / thành công / thất bại, hash của kết quả |
| `revocation` | Thông báo thu hồi đã nhận và đã xác minh |

- **"Được phép" khác "đã thực hiện thành công":** `decision` và `execution` là hai bản ghi riêng. Một thao tác được phép có thể thất bại hoặc không chạy.
- **Neo:** Register Data chứa một nhãn phiên bản, số thứ tự và hash của bản ghi mới nhất (dưới 256 byte). Trong demo neo sau mỗi thao tác để có link CCDExplorer. Trong production gom lô và neo Merkle root.
- **Biên nhận:** gateway trả cho agent một biên nhận có chữ ký (quyết định, hash bản ghi, mã giao dịch neo). Nhờ đó A cũng giữ bằng chứng, không bên nào chối được.
- **Kiểm tra toàn vẹn:** một công cụ đọc log, tính lại chuỗi hash và so với các anchor on-chain. Sửa một dòng log thì công cụ báo lệch.
- **Bảo vệ metadata:** chỉ neo hash hoặc gốc lô. Không ghi tên thao tác, tên khách hàng, định danh kỹ sư dạng đọc được lên chain.

| Cách neo | Bản chất | Dùng khi |
|---|---|---|
| **Register Data** | Loại giao dịch riêng để ghi ≤ 256 byte; không chuyển tiền | **Chính**: work order, thu hồi, audit |
| Memo | Chuỗi kèm một lệnh chuyển CCD hoặc PLT | Chỉ khi có thanh toán thật |
| VRA / VAA | Anchor do verifier của Verify & Access tạo | Tự có khi L3b đi qua Verify & Access; ghi mã giao dịch vào log |
| Merkle root | Nội dung được neo khi gom lô, vẫn gửi bằng Register Data | Production: giảm phí, giấu tần suất |

### 3.5 Approval Binding ⭐ (ưu tiên số 1)

**Vấn đề:** ZK proof hợp lệ, commitment hợp lệ và consent hợp lệ khi đứng riêng chưa chứng minh chúng thuộc cùng một người có thẩm quyền và cùng một hành động.

**Năm điều kiện một lần phê duyệt phải thỏa:**

| | Điều kiện | Nghĩa |
|---|---|---|
| **AB1** | Ràng buộc hành động | Mọi bằng chứng phê duyệt gắn với cùng một approval digest |
| **AB2** | Ràng buộc chủ thể | Consent và ZK proof do cùng một chủ thể tạo ra |
| **AB3** | Ràng buộc thẩm quyền | Chủ thể đó được duyệt cho đúng phiếu này: mở đúng commitment, và/hoặc có credential thỏa vai trò phiếu yêu cầu |
| **AB4** | Tính mới | Digest dùng một lần, còn hạn |
| **AB5** | Ràng buộc agent | Request được duyệt đúng là request do key của agent ghi trong phiếu ký |

**Approval digest:**

```text
D = SHA-256( dạng chuẩn hóa của {
      v, audience, work_order_hash, request_hash,
      action_summary,   // câu ngắn cho người đọc, ví dụ "Restart service payments trên B/prod"
      nonce, expires_at } )
```

AB1, AB4 và AB5 đạt được **ngay từ cách xây dựng**: gateway tự tính `D` từ request nó đang giữ, rồi yêu cầu mọi bằng chứng mang đúng `D` (trong context của yêu cầu xác minh hoặc trong challenge). Đây là lời giải cho G1.4. Phần khó là AB2 và AB3.

**Giao thức nào làm được gì** 📄

| Khả năng | Verify & Access qua **ID App** | Verify & Access qua **ví có account** | **Web3 ID presentation** (Wallet for Web) |
|---|---|---|---|
| Đã thấy chạy | ✅ W1, W2 | ⚠️ Chưa thấy | 📄 Có tài liệu và công cụ testnet |
| Proof gắn account (lộ `credId`) | ❌ | 📄 Có | 📄 Có |
| Câu consent hiện trong ứng dụng | ✅ | ⚠️ Chưa rõ | ❌ Challenge là chuỗi 32 byte; câu mô tả phải hiện trên trang phê duyệt |
| Tự neo VRA/VAA | ✅ | 📄 Có | ❌ Tự neo ở L4 |
| Kèm credential Web3 ID trong cùng yêu cầu | ⚠️ Không thấy trong tài liệu | ⚠️ Không thấy | 📄 Có |

**Hai phương án cho MVP:**

| | **MVP-C**: ràng buộc bằng mật mã | **MVP-T**: Approval Service tin cậy (đề xuất của bạn) |
|---|---|---|
| Kỹ sư duyệt bằng | Ví có account | ID App |
| B thấy gì về người duyệt | Một định danh giả (`credId`), không thấy tên | Không thấy gì |
| AB2 | Chỉ có một presentation, hoặc cùng `credId` ở cả hai | Approval Service của A xác nhận |
| AB3 | B tự kiểm: salt được gửi kèm proof, B tính lại commitment từ `credId` | Approval Service của A xác nhận |
| B phải tin thêm | Không | Khóa và tính toàn vẹn của Approval Service |
| Truy trách nhiệm người duyệt | Có: account có danh tính đứng sau, mở được bằng thủ tục pháp lý | ⚠️ Dựa vào hồ sơ của A; proof không mang định danh để đối chiếu |
| Câu consent hiện trong ứng dụng, có VRA/VAA | Phụ thuộc ví (cột 2 hoặc 3 ở bảng trên) | Có |

**Nếu chọn MVP-T, Approval Service phải thỏa:**
- Chạy ở phía A, **tách khỏi agent** (khác tiến trình, khác key). Agent không ký được thay nó.
- Ký một xác nhận gồm `D`, `wo_hash`, kết quả và thời điểm, bằng key mà B đã ghim.
- Gửi kèm presentation gốc. Gateway của B **vẫn tự xác minh proof** và chỉ tin A ở một điểm: người tạo proof là kỹ sư được chỉ định.
- Giới hạn phải nói rõ: ở MVP-T, commitment chỉ chứng minh A đã chỉ định ai, không chứng minh được người đó là người đã duyệt.

**Cách chọn sau spike S3:**

| Kết quả spike | Chọn |
|---|---|
| Ví có account trả lời được yêu cầu Verify & Access gắn account **và** hiện câu consent | Tốt nhất: L3b qua ví đó (đủ consent, anchor, `credId`); L3a qua Web3 ID presentation trên cùng account; AB2 bằng `credId` trùng nhau |
| Chỉ Web3 ID presentation chạy được | **MVP-C**: một presentation chứa proof trên account (và sau này cả credential nhân viên), challenge = `D`; câu mô tả hiện trên trang phê duyệt; tự neo ở L4 |
| Chỉ ID App chạy được | **MVP-T** |

Dù chọn tuyến nào, gateway nhận cùng một cấu trúc `ApprovalEvidence`, nên đổi tuyến về sau không phải viết lại gateway.

**Phương án nâng cao (sau hackathon):**
- Verify & Access hỗ trợ claim trên credential Web3 ID trong cùng yêu cầu có consent.
- Credential nhân viên mang một thuộc tính ràng buộc với account của kỹ sư, để chứng minh credential và consent thuộc cùng chủ thể bằng statement "thuộc tập". ⚠️ Mới là ý tưởng; thuộc tính chuỗi có giới hạn độ dài.
- Verify & Pay cho agent, Protocol-Level Locks, Concordium Signer.

**Giới hạn chung:** ràng buộc "cùng một presentation" chứng minh cùng một ví nắm cả hai credential tại lúc đó. Nó không ngăn được hai người cố ý thông đồng, và không chứng minh người duyệt đã hiểu nội dung.

### 3.6 Luồng demo (đã sửa)

```text
Agent ──request có chữ ký (request_id, hạn, audience)──▶ Gateway của B

 ① V1 Agent         registry đã ghim → Active → hash card → key CIS-8 còn thuộc owner
                    → chữ ký đúng → request_id chưa dùng, còn hạn
 ② V2 Organization  owner hiện tại == account A đã ghim
                    (onboarding một lần: IDP doanh nghiệp + reveal legalName / LEI)
 ③ V3 Delegation    anchor của A → đúng agent → đúng audience → còn hạn
                    → chưa thu hồi → trong scope và trong trần quyền của B
 ④ Phân loại        mức 0–1: chạy · mức 2: cần duyệt
 ⑤ V4 + V5          [ZK proof credential] + consent, cùng digest D, đúng người được chỉ định
 ⑥ Thực thi         gọi hạ tầng mô phỏng của B → ghi kết quả
 ⑦ Audit            log request, decision, approval, execution → neo hash
                    → trả biên nhận có chữ ký cho agent
```

**Về bước ② trên testnet:** Global FinReg đang tạm dừng, nên demo có thể phải dùng một account cá nhân đóng vai công ty A. Khi đó chỉ chứng minh được "owner trùng account đã ghim". Bài nộp phải ghi rõ điều này, và nêu phần còn thiếu (IDP doanh nghiệp, reveal `legalName` / `lei`) là việc của mainnet hoặc sau W5.

**Phân loại thao tác:**

| Mức | Ví dụ | Xử lý |
|---|---|---|
| 0 | Đọc log, xem trạng thái | Chạy nếu trong phạm vi phiếu |
| 1 | Restart, scale (đảo ngược được) | Chạy nếu trong phạm vi và trong giới hạn tần suất |
| 2 | Deploy production, xóa dữ liệu, đổi quyền truy cập | **Bắt buộc có người duyệt** cho từng thao tác |
| Ngoài phạm vi | Bất kỳ thao tác nào không có trong phiếu | Từ chối; phê duyệt cũng không cứu được, phải có phiếu mới |

**Negative test cases:**

| # | Tình huống | Bị chặn ở |
|---|---|---|
| 1 | Chữ ký bằng key khác (agent mạo danh) | V1 |
| 2 | Agent đã bị revoke | V1 |
| 3 | Agent Card bị sửa, hash lệch | V1 |
| 4 | Key CIS-8 bị đăng ký lại dưới account khác | V1 |
| 5 | Gửi lại một request cũ, hoặc request hết hạn | V1 (replay) |
| 6 | Agent đã chuyển sang owner khác | V2 |
| 7 | Work order hết hạn | V3 |
| 8 | Work order bị thu hồi | V3 |
| 9 | Work order của agent khác, hoặc cấp cho gateway khác | V3 |
| 10 | Thao tác ngoài phạm vi | V3 |
| 11 | Credential từ registry khác (sai issuer) | V4 |
| 12 | Credential bị thu hồi hoặc hết hạn | V4 |
| 13 | Consent không khớp: digest của request khác, hoặc dùng lại lần duyệt cũ | V5 |
| 14 | Người duyệt không phải người được chỉ định | Approval Binding |
| 15 | Kỹ sư từ chối | V5 |
| 16 | Sửa một dòng trong audit log | Công cụ kiểm tra toàn vẹn |

Video demo chỉ cần 3–4 tình huống (gợi ý: 1, 8, 10, 13). Số còn lại chạy bằng test tự động. SDK có hàm tạo presentation từ seed, nên có thể viết một "ví giả" cho test tự động ⚠️ cần thử.

### 3.7 Ánh xạ thành phần (đã sửa)

Tiêu chí là *"how meaningfully"*, không phải số lượng. Mỗi thành phần phải trả lời một câu hỏi xác minh cụ thể.

| Nhóm | Thành phần | Trả lời câu hỏi |
|---|---|---|
| **Lõi** | Agent Registry CIS-8004 + badge + Agent Card | V1: agent có thật, đang Active, card không bị sửa |
| **Lõi** | CIS-8 key binding | V1: agent nào đang nói |
| **Lõi** | Concordium ID proof kèm consent | V5: người có danh tính đã chấp thuận đúng hành động này |
| **Lõi** | Register Data | V3 và L4: A đã ủy quyền gì, lúc nào; log không bị sửa |
| **Có điều kiện** (sau spike S2) | Web3 ID / CIS-4 | V4: người duyệt có tư cách do A cấp, chưa bị thu hồi |
| **Có điều kiện** (sau W5) | Company ID qua Global FinReg | V2: owner là pháp nhân đã KYB |
| Tùy chọn | Sponsored transactions | Agent và kỹ sư không cần giữ CCD |
| Tùy chọn | x402 / PLT | B trả phí dịch vụ cho A theo thao tác |

MCP hosted của Agent Registry dùng để tra cứu cho tiện, nhưng gateway đọc thẳng chain khi ra quyết định (tài liệu ghi dịch vụ hosted là *"a convenience, not an authority"*).

### 3.8 Giới hạn scope

**MVP phải có:** L1 đủ 5 phép kiểm + request có chữ ký · L2 với R1 · L4 · L3b theo một tuyến · 4 negative test trong video.

**Chỉ làm khi MVP đã chạy:** L3a · sổ trạng thái on-chain (R2) · Company ID · sponsored transactions.

**Không làm trong hackathon:** x402 (trừ khi dư thời gian) · Agent IDP · Locks · contract tự viết.

**Mốc cắt:** nếu đến 30/11 chưa xong L3b thì bỏ L3a, giữ L1, L2, L4, L3b.

Quy mô: 1 công ty A, 1 agent, 1–2 kỹ sư, 1 khách hàng B, 4–5 loại thao tác. Policy là luật cứng dạng JSON.

### 3.9 Agent nền và hạ tầng mô phỏng

**Điểm tích hợp là ranh giới gọi công cụ.** Agent không gọi thẳng hạ tầng của B mà gọi qua gateway (MCP server hoặc HTTP proxy). Agent chỉ cần thêm một lớp ký request, giữ key CIS-8 và mang theo phiếu giao việc. Nhờ vậy phần lõi của agent không phải viết lại.

**Tiêu chí chọn agent nền:**
1. Mã nguồn mở, giấy phép cho phép sửa.
2. Có sẵn các thao tác vận hành tách theo mức rủi ro (đọc log, restart, deploy, xóa).
3. Gọi công cụ qua MCP hoặc HTTP.
4. Chạy được với hạ tầng giả trên một máy.
5. Bạn hiểu đủ để kể câu chuyện "trước và sau khi có Concordium".

**Ứng viên (cần tự đánh giá, thông tin từ kết quả tìm kiếm, chưa kiểm tra repo):**

| Ứng viên | Mô tả | Lưu ý |
|---|---|---|
| HolmesGPT | Agent SRE mã nguồn mở, dự án CNCF Sandbox, giấy phép Apache-2.0; mặc định chỉ đọc, có bộ công cụ remediation qua MCP | Python; gateway đứng ở vị trí MCP server cho phần remediation |
| Một agent nói MCP + MCP server cho Kubernetes có sẵn | Ví dụ `mcp-server-kubernetes` | Gateway bọc quanh MCP server |
| Agent của bạn, nếu có | | Đúng tinh thần thể lệ nhất |

**Hạ tầng mô phỏng của B:** vài service giả và một "ops API" (logs, restart, deploy, delete) chạy bằng Docker Compose, đứng sau gateway. Không cần cluster thật.

**Hạn quyết định: 15/11.**

### 3.10 Path to production và C-full

- **Khách hàng:** nhà cung cấp dịch vụ vận hành và khách hàng doanh nghiệp của họ.
- **Động lực:** EU AI Act (Điều 12, Điều 26(6)). Chỉ nói "hướng tới hỗ trợ tuân thủ".
- **Khác biệt với Microsoft Entra Agent ID / AWS:** xuyên tổ chức, kiểm chứng công khai, tiết lộ có chọn lọc.
- **C-full (dài hạn):** ràng buộc phê duyệt hoàn toàn bằng mật mã · sổ trạng thái on-chain cho work order · Locks thay giới hạn tự kiểm · Verify & Pay cho agent · Concordium Signer giữ key ngoài agent · Company ID thật trên mainnet · EURQ cho thanh toán dịch vụ.

---

## 4. Security & Trust Model (mục mới)

### 4.1 Các bên

| Bên | Vai trò |
|---|---|
| Công ty A | Chủ sở hữu agent; cấp credential cho nhân viên; cấp và thu hồi phiếu giao việc |
| Agent của A | Gửi request có chữ ký; không có quyền chi tiền, không tự duyệt được |
| Kỹ sư của A | Duyệt thao tác rủi ro bằng ví của mình |
| Công ty B | Chủ hạ tầng; vận hành gateway; giữ audit log |
| Concordium | Vận hành chain, registry, IDP |

### 4.2 Mô hình đe dọa

**Trong phạm vi:**
- Agent mạo danh (không có badge, sai key).
- Agent bị chiếm quyền hoặc bị lừa (prompt injection), cố làm thao tác ngoài phạm vi hoặc thao tác rủi ro chưa được duyệt.
- Key của agent bị lộ và bị dùng ở nơi khác hoặc về sau.
- Phát lại request hoặc lần phê duyệt đã bắt được.
- Người không còn tư cách (đã nghỉ việc) hoặc người ngoài tìm cách duyệt.
- Phiếu giao việc còn sống sau khi hợp đồng kết thúc.
- Một trong hai bên sửa audit log sau sự việc.

**Ngoài phạm vi (phải nói rõ trong bài nộp):**
- Công ty A cố ý làm sai ở cấp doanh nghiệp. A luôn tự cấp được phiếu cho agent của mình; thứ bảo vệ B là trần quyền B đặt ra và audit.
- Gateway của B bị chiếm quyền.
- Thiết bị hoặc ví của kỹ sư bị chiếm quyền; kỹ sư thông đồng với kẻ tấn công.
- Bên vận hành registry hoặc IDP làm sai.
- Tính đúng đắn của việc agent làm **bên trong** một thao tác đã được phép. Gateway cấp quyền cho thao tác, không bảo đảm kết quả.
- Tấn công từ chối dịch vụ.

### 4.3 B tự kiểm được gì, phải tin gì

| Khẳng định | B tự kiểm | B phải tin |
|---|---|---|
| Agent đã đăng ký, Active, card đúng hash | ✅ Đọc chain | Contract registry và admin của nó |
| Agent đang giữ key | ✅ Chữ ký trên request | |
| Owner của agent là account A | ✅ Đọc chain | Account A được ghi đúng trong hợp đồng dịch vụ |
| A là pháp nhân đã KYB | ✅ IDP của account + reveal `legalName` / `lei` | IDP doanh nghiệp (Global FinReg) |
| A đã cấp phiếu này, chưa thu hồi | ✅ Giao dịch của account A | Thông báo thu hồi tới nơi (với R1) |
| Người duyệt có credential còn hiệu lực | ✅ ZK proof + trạng thái registry | Registry đó đúng là của A; A cấp credential đúng người |
| Người duyệt là người được chỉ định | ✅ ở MVP-C · ❌ ở MVP-T | Ở MVP-T: Approval Service của A |
| Người duyệt đã chấp thuận đúng hành động | ✅ Digest `D` trong proof | Ví hoặc trang phê duyệt hiển thị đúng nội dung |
| Log không bị sửa sau khi neo | ✅ So hash | |
| Log đúng và đủ ngay từ lúc ghi | ❌ | Gateway của chính B; bù bằng request có chữ ký và biên nhận gửi cho A |

### 4.4 B tin issuer nào và vì sao

| Thứ B ghim trong cấu hình | Lý do tin |
|---|---|
| Contract CIS-8004 và CIS-8 chính thức trên testnet | Do Concordium vận hành; tài liệu công bố |
| Account của A | Ghi trong hợp đồng dịch vụ giữa A và B |
| Registry credential của A | Do account của A tạo ra (kiểm được trên chain) |
| Danh sách IDP được chấp nhận | Testnet: Concordium testnet IP. Mainnet: IDP thật |
| (MVP-T) Key của Approval Service | A công bố cho B khi ký hợp đồng |

### 4.5 A có quyền ký những phiếu nào

- Chỉ **account của A đã ghim** mới cấp và thu hồi được phiếu.
- Phạm vi trong phiếu phải nằm trong **trần quyền** B cấu hình cho A. Phần vượt trần bị bỏ qua.
- Phiếu luôn có hạn, có `audience`, và gắn với đúng một agent.

### 4.6 Tách khóa

| Khóa | Dùng để | Nguyên tắc |
|---|---|---|
| Key của account A | Đăng ký agent, cấp và thu hồi phiếu | Dùng thưa; không nằm trong agent |
| Key issuer credential của A | Cấp credential nhân viên | Tách khỏi agent |
| Key CIS-8 của agent | Ký request | Không có quyền chi tiền; lộ thì revoke agent |
| Key của Approval Service (MVP-T) | Ký xác nhận phê duyệt | Khác tiến trình, khác key với agent |
| Ví của kỹ sư | Tạo proof và consent | Trên thiết bị của kỹ sư |
| Key account của gateway B | Neo audit, tạo VRA/VAA | Giữ ở server của B |
| Key sponsor (nếu dùng) | Trả phí | Chỉ ở server; giới hạn tần suất; theo dõi số dư |

Không key nào được commit vào repo. Repo đã chặn `.env`, `*.export`, `*wallet*.json`.

### 4.7 Thu hồi độc lập

Ba công tắc ở mục 3.4 (agent, credential, work order) hoạt động riêng rẽ. Độ trễ:

| Thu hồi | B thấy sau |
|---|---|
| Agent (CIS-8004) | Lần đọc chain kế tiếp (mỗi phiên hoặc mỗi request) |
| Credential (CIS-4) | Lần xác minh proof kế tiếp |
| Work order, cách R1 | Vài giây nếu thông báo tới; tệ nhất bằng thời hạn của phiếu |
| Work order, cách R2 / R3 | Lần đọc trạng thái kế tiếp |

### 4.8 Dữ liệu ở đâu, ai thấy gì

| Dữ liệu | Ở đâu | Ai thấy |
|---|---|---|
| Agent NFT, owner, trạng thái, hash card, key | On-chain | Mọi người |
| Hash phiếu giao việc, thông báo thu hồi | On-chain | Mọi người (chỉ là hash) |
| Bản ghi credential: public key của holder, hạn, trạng thái | On-chain | Mọi người; lộ số credential A đã cấp và các lần thu hồi |
| VRA/VAA, anchor audit | On-chain | Mọi người (hash); lộ account gửi, thời điểm, tần suất |
| Nội dung phiếu giao việc | Off-chain, A và B | A, B, agent |
| Salt của commitment, danh sách nhân viên | Off-chain, A | A (và B khi mở commitment ở MVP-C) |
| Audit log, presentation | Off-chain, B | B; A giữ biên nhận |
| Tên, giấy tờ của kỹ sư | Ví của kỹ sư, IDP | Không tới B |

**B thấy gì theo từng loại bằng chứng (G2):**

| Bằng chứng | B thấy | Liên kết được |
|---|---|---|
| Proof gắn identity (ID App) | IDP đã cấp, kết quả statement | 📄 Không gắn account; ⚠️ chưa rõ còn định danh ổn định nào khác |
| Proof gắn account | Thêm `credId`, suy ra account | Có, theo account; không lộ tên |
| Proof trên credential Web3 ID | Registry, public key của holder | Có, theo credential |
| Chữ ký của agent | Public key CIS-8, token agent | Có, chủ ý |

### 4.9 Giới hạn của từng công cụ

| Công cụ | Giới hạn |
|---|---|
| **Commitment** | Chỉ giấu được khi salt đủ ngẫu nhiên và kín. Không chứng minh tư cách. Mở ra cần A hợp tác |
| **ZK proof** | Chỉ chứng minh statement và việc nắm credential tại lúc tạo proof. Proof gắn account hoặc credential vẫn lộ định danh giả. Câu hỏi quá hẹp làm lộ thông tin. Không chứng minh người duyệt hiểu nội dung |
| **Badge** | Owner là account có danh tính đứng sau; không phải bằng chứng KYB, không phải quyền hạn |
| **CIS-8** | Chứng minh kiểm soát key lúc đăng ký, không phải lúc chạy |
| **Audit anchor** | Chứng minh toàn vẹn và thời điểm; không chứng minh nội dung đúng hay đủ |
| **Approval Service (MVP-T)** | Là một điểm tin cậy; hỏng thì ràng buộc cá nhân mất |

---

## 5. Những điểm còn mở

| Mã | Câu hỏi | Ưu tiên | Bằng chứng hiện có | Cách chốt |
|---|---|---|---|---|
| **G1.1** | Phát hành được Employee Credential bằng Web3 ID trên testnet không? | P0 | 📄 Issuer frontend testnet đang phản hồi; ví có menu Web3 ID; tài liệu nêu ví dụ *employment history* | Spike S2 |
| **G1.2** | Tạo và xác minh được ZK proof từ credential đó không? | P0 | 📄 Proof explorer và verifier testnet đang phản hồi | Spike S2 |
| **G1.3** | Liên kết được proof với consent của cùng chủ thể không? | P0 ⭐ | 📄 Web3 ID presentation: gộp được account credential và credential nhân viên trong một presentation. 📄 Verify & Access: ID App không có account; không thấy claim Web3 ID | Spike S3 + hỏi Discord → chọn MVP-C hay MVP-T |
| **G1.4** | Liên kết được approval với work order cụ thể không? | P0 ⭐ | ✅ Về thiết kế: digest `D` chứa `wo_hash` và `request_hash`. ✅ W1: nội dung consent được neo, sửa sẽ bị phát hiện | Spike S3: xác nhận context/challenge nằm trong proof |
| **G2** | Proof và audit lộ định danh, metadata nào? | P0 | 📄 Trả lời được phần lớn (mục 4.8). ⚠️ Còn: proof gắn identity có định danh ổn định nào không | Spike S3: đọc JSON của presentation |
| **GF** | Global FinReg chạy trên testnet không? | P1 | ⏸️ Đòi Sign In / KYB. W3: *đáng ra* nhanh | W5 (16/11), Discord |
| **L4** | Register Data, Memo hay Merkle root? | P1 | 📄 Register Data là cách neo chuẩn; Verify & Access dùng đúng mẫu log off-chain + anchor | W4 (tối nay) + spike S1 |
| **DA** | Agent nền nào? | P0 | Có tiêu chí và ứng viên (mục 3.9) | Bạn quyết trước **15/11** |

**Câu hỏi nên đăng Discord (tiếng Anh):**

```text
Hi team, questions for an enterprise agent-delegation build on testnet:
1. Verify & Access (V1 requests): can a request include claims over a Web3 ID (CIS-4)
   credential, or only identity/account claims?
2. Can the Concordium Wallet for Web answer a Verify & Access request with *account* claims,
   and does it display the context/consent text to the user?
3. How is the consent text carried in a request (context string?), and is it covered by
   the VRA hash and by the presentation?
4. For identity-based proofs from the ID App: does the presentation carry any stable
   identifier, or is it fully unlinkable?
5. Are the testnet Web3 ID issuer frontend and proof explorer still supported with the
   current Wallet for Web?
6. Global FinReg (Business ID) on testnet asks for sign-in / full KYB. Is there a test
   company or test login for the hackathon?
Thanks!
```

---

## 6. Những gì đã làm được

| Hạng mục | Trạng thái |
|---|---|
| Báo cáo W1, W2, W3; slide và transcript 3 buổi | ✅ |
| Hai bản đánh giá chốt hướng; lộ trình học; checklist | ✅ |
| Ví #2 trên testnet; Identity 1 (trên 18 tuổi, DK), account `3Rgk…6gaw`, 20.000 test CCD | ✅ |
| Identity 2 (dưới 18 tuổi), account `3Exu…Vbkss` | ✅ |
| Phát hiện ví có menu Web3 ID | ✅ |
| Đối chiếu 10 vấn đề với tài liệu Concordium (11/11) | ✅ Mục 2.5 |
| Global FinReg | ⏸️ |
| Tạo project trên Encode; đăng câu hỏi Discord; chạy demo `ccd-ui-sdk`; cài Node.js | ⚠️ Chưa xác nhận |

**Bài học vận hành:** không chụp hoặc gửi seed phrase · "Duplicate idCredPub" nghĩa là đang dùng lại seed cũ · ví tự khóa giữa chừng thì làm trong chế độ Fullscreen · trang web bên ngoài có thể chứa prompt injection nhắm vào agent.

---

## 7. Kế hoạch

**Nguyên tắc: kiểm chứng sớm, build muộn.** Mỗi spike có giới hạn thời gian và điều kiện hoàn thành. Hết thời gian mà chưa đạt thì ghi kết quả "không đạt" và đi tiếp theo phương án dự phòng.

### 7.1 Spike kiểm chứng (12–15/11)

| Spike | Việc | Giới hạn | Hoàn thành khi | Trả lời |
|---|---|---|---|---|
| **S0** | Đăng ký một agent (tạm dùng account cá nhân), gắn key CIS-8; viết script đọc chain và kiểm 5 điều của L1; ký và kiểm một request | 1 ngày | Script in kết quả 5 phép kiểm cho agent của bạn, và từ chối khi ký bằng key khác | L1 khả thi |
| **S1** | Gửi một giao dịch Register Data chứa một hash; đọc lại theo mã giao dịch; kiểm account gửi và nội dung | 0,5 ngày | Có link CCDExplorer; script xác minh chạy đúng | L4, cách cấp phiếu |
| **S2** | Web3 ID: tạo registry bằng issuer frontend, cấp một credential vào ví, tạo proof bằng proof explorer, xác minh bằng verifier, thu hồi rồi thử lại | 1 ngày | Có câu trả lời có / không cho G1.1 và G1.2, kèm ảnh chụp và mã giao dịch | G1.1, G1.2 |
| **S3** | Tuyến phê duyệt: (a) lấy một presentation gắn account từ Wallet for Web với challenge tự chọn, đọc JSON; (b) lấy một consent qua ID App, đọc JSON; (c) thử cho ví có account trả lời yêu cầu Verify & Access | 1 ngày | Biết proof lộ gì; biết challenge/context nằm ở đâu trong proof; chọn được MVP-C hoặc MVP-T | G1.3, G1.4, G2 |

### 7.2 Mốc quyết định

| Ngày | Quyết định |
|---|---|
| **11/11 (W4)** | Cách neo audit; Locks có bản testnet/devnet trước 09/12 không |
| **15/11** | Agent nền (DA); tuyến phê duyệt (MVP-C / MVP-T); L3a là lõi hay phần mở rộng |
| **16/11 (W5)** | Global FinReg: tạo account công ty A thật hay giữ account đóng vai |
| **18/11 (W6)** | Gateway là MCP server hay HTTP proxy |
| **Trước 23/11** | Checkpoint 1: cập nhật mô tả trên Encode |

### 7.3 Build (19/11 → 09/12)

| Thời gian | Lớp | Hoàn thành khi |
|---|---|---|
| 19–22/11 | **L1** + request envelope | Negative test 1–6 đều bị từ chối trong test tự động |
| 23–26/11 | **L2** (cấp, kiểm, thu hồi theo R1) | Negative test 7–10 bị từ chối; cấp và thu hồi có link CCDExplorer |
| 27–29/11 | **L4** | Mỗi request có đủ bản ghi decision và execution; có anchor; công cụ kiểm tra phát hiện log bị sửa |
| 30/11–03/12 | **L3b** + Approval Binding | Thao tác mức 2 bị chặn cho đến khi có phê duyệt; negative test 13–15 bị từ chối |
| 04–05/12 | **L3a** (nếu S2 đạt và còn thời gian) | Negative test 11–12 bị từ chối |
| 06–07/12 | Video, `README.md`, `docs/`, chuyển repo sang public | Video ≤ 3 phút có luồng chính và 3–4 tình huống bị từ chối; mọi link mở được ở cửa sổ ẩn danh |
| 08–09/12 | Dự phòng, nộp sớm | Nộp trước tối 09/12 giờ VN |

Tài liệu thiết kế (`docs/architecture.md` với sơ đồ 4 lớp và mục 4 của file này, `docs/path-to-production.md`) viết trong 16–18/11.

---

## 8. Kế hoạch học

Giữ nguyên `Lo-trinh-hoc-va-tham-khao.md`. Bổ sung theo bản này:

| Chủ đề | Đọc | Dùng cho |
|---|---|---|
| Chuẩn hóa JSON để băm và ký | JCS (RFC 8785) | Work order, request, digest |
| Token ủy quyền có audience, hạn, định danh | JWT (RFC 7519) các trường `aud`, `exp`, `nbf`, `jti`; RFC 8693 | Mandate schema |
| Ký thông điệp có tách miền | EIP-191, EIP-712; phần "Canonical signed message" của CIS-8 | Request envelope |
| Thu hồi | Mô hình trạng thái của CIS-4; so với danh sách thu hồi kiểu CRL | L2, L3a |
| Mô hình đe dọa | STRIDE (mức tổng quan) | Mục 4 |

---

## 9. Rủi ro

| Rủi ro | Mức | Giảm thiểu |
|---|---|---|
| Chưa chọn agent nền | **Cao** | Quyết trước 15/11 theo tiêu chí ở 3.9 |
| Công cụ Web3 ID trên testnet không chạy với ví hiện tại | Trung bình–Cao | Spike S2 giới hạn 1 ngày; L3a là phần có điều kiện |
| Không đạt ràng buộc bằng mật mã, phải dùng MVP-T | Trung bình | Nêu rõ giả định tin cậy; gateway vẫn tự xác minh proof |
| Giả định tin cậy không được viết ra, bài nộp bị xem là nói quá | Trung bình | Đưa mục 4 vào `docs/architecture.md`; `README.md` ghi rõ phần mô phỏng |
| Scope quá rộng cho solo | Trung bình–Cao | Mục 3.8; mốc cắt 30/11 |
| Global FinReg không dùng được trên testnet | Trung bình | Account cá nhân đóng vai A, ghi rõ giới hạn |
| Lộ metadata qua anchor on-chain | Thấp–Trung bình | Chỉ neo hash; production gom lô |
| Lộ key (gateway, sponsor, Approval Service, export ví) | Trung bình | Tách khóa (4.6); không commit; chỉ dùng testnet |
| Demo cần người thao tác ví thật | Trung bình | Quay sớm; test tự động cho phần còn lại |
| CIS-8 còn là draft; registry có thể được nâng cấp | Thấp | Ghim contract; chạy lại test trước khi quay video |
| Faucet hoặc ví testnet lỗi gần hạn | Trung bình | Đã có 20.000 test CCD; nộp sớm |

---

## 10. Chỉ mục tài liệu

| Muốn tìm | Đọc |
|---|---|
| Bản tổng hợp trước | `Tong-hop-sau-W3.md` (v1) |
| Chi tiết từng buổi | `Bao-cao-Workshop01.md`, `Bao-cao-Workshop02.md`, `Bao-cao-Workshop03.md` |
| Vì sao chọn C-lite | `Danh-gia-chot-huong-sau-W2-v2.md` |
| Học gì | `Lo-trinh-hoc-va-tham-khao.md` |
| Việc cần làm, nhật ký testnet | `Checklist-sau-W2.md` |
| Slide, transcript | `Workshop01/`, `Workshop02/`, `Workshop03/` |

## Nguồn đã đối chiếu ngày 11/11

- Agent Registry: [CIS-8004](https://docs.concordium.com/en/mainnet/technical-reference/agent-registry/cis-8004.html) · [CIS-8 (spec)](https://proposals.concordium.com/CIS/cis-8.html) · [Verified by Concordium badge](https://docs.concordium.com/en/mainnet/technical-reference/agent-registry/concordium-badge.html) · [Agent Card](https://docs.concordium.com/en/mainnet/technical-reference/agent-registry/agent-card.html) · [MCP service](https://docs.concordium.com/en/mainnet/technical-reference/agent-registry/mcp-service.html) (địa chỉ contract testnet lấy từ công cụ `contract_info`)
- Verify & Access: [How it works](https://docs.concordium.com/en/mainnet/how-to/concordium-id/verify-and-access/how-it-works.html) · [Select verification method](https://docs.concordium.com/en/mainnet/how-to/concordium-id/verify-and-access/select-verification-method.html) · [Select Identity Provider](https://docs.concordium.com/en/mainnet/how-to/concordium-id/verify-and-access/select-identity-provider.html) · [Integrate verification flow](https://docs.concordium.com/en/mainnet/how-to/concordium-id/verify-and-access/integrate-verification-flow.html) · [SDK: Verifiable presentations (V1)](https://docs.concordium.com/concordium-node-sdk-js/12.0.0/pages/verifiable-presentations.html)
- Web3 ID: [Create proofs](https://docs.concordium.com/en/mainnet/how-to/web3-id/create-proofs.html) · [Web3 ID issuers](https://docs.concordium.com/en/mainnet/how-to/web3-id/issuer.html) · [CIS-4 (spec)](https://proposals.concordium.com/CIS/cis-4.html) · [SDK: module web3-id](https://docs.concordium.com/concordium-node-sdk-js/12.0.0/modules/web3_id.html) · công cụ testnet: [issuer frontend](https://web3id-issuer-frontend.testnet.concordium.com/), [proof explorer](https://web3id-proof-explorer.testnet.concordium.com/)
- Khác: [Transactions (Register Data)](https://docs.concordium.com/en/mainnet/learn/transactions/index.html) · [ID attributes reference (Company ID)](https://docs.concordium.com/en/mainnet/technical-reference/id-attributes-reference.html)
- Agent nền: [CNCF: HolmesGPT](https://www.cncf.io/blog/2026/01/07/holmesgpt-agentic-troubleshooting-built-for-the-cloud-native-era/)
