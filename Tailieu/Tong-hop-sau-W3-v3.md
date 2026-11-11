# Tổng hợp sau Workshop 03 (v3): siết Approval Binding, phiếu giao việc, thu hồi và audit

> **Ngày soạn:** 11/11/2026 (trước W4)
> **Quan hệ với các bản trước:** bản này thay `Tong-hop-sau-W3-v2.md` làm bản mới nhất. v1 và v2 giữ nguyên để đối chiếu.
> **Điều không đổi:** hướng **C-lite kết hợp**, kiến trúc **4 lớp L1–L4**, năm phép kiểm V1–V5, cấu trúc AB1–AB5, thứ tự build, bốn spike S0–S3. **Số mục giữ nguyên như v2.**
> **Điều thay đổi:** sửa 5 vấn đề chính và 4 điểm bổ sung bạn nêu sau khi đọc v2 (mục 0.1). Các mục viết lại: 3.4, 3.5, 3.8, 4.3, 4.7, 4.9, 7.1, 9.
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
| Approval digest (`D`) | Mã băm đại diện cho đúng một lần phê duyệt (mục 3.5) |
| Approval Evidence | Bằng chứng phê duyệt: presentation gắn với `D`, đã qua đủ các phép kiểm ràng buộc |
| Verifiable Consent | Approval Evidence, cộng với việc nội dung người duyệt nhìn thấy cũng được chứng minh |
| Holder | Người giữ một credential trong ví |
| Fail-closed | Khi không xác minh được thì từ chối, không cho qua |

Trong bản đánh giá v2 ngày 06/11 và các trao đổi trước, "(a)" là credential CIS-4 và "(b)" là phiếu giao việc. Từ bản này, phiếu giao việc gọi là L2, còn L3a và L3b là **hai chức năng trong cùng lớp L3**, không phải hai lớp mới.

---

## 0. Tóm tắt một trang

| | |
|---|---|
| **Cuộc thi** | Concordium Trusted Agents Hackathon (Encode × Concordium). Thi solo được. Nộp bài trước **06:59 sáng T5 10/12** (giờ VN) |
| **Chấm điểm** | Depth of integration · credible path to production · it works · usefulness |
| **Hướng đã chốt** | ⭐ **C-lite kết hợp**: agent DevOps của công ty A thao tác trên hạ tầng (mô phỏng) của khách hàng B, qua gateway của B |
| **Chuỗi mục tiêu** | Verified Agent → Verified Organization → Valid Delegation → Verified Employee → Valid Consent → Authorized Execution → Verifiable Audit |
| **Hai câu hỏi lớn nhất** | (1) Người có Employee Credential hợp lệ có đúng là người đã duyệt không? (2) Lần duyệt đó có đúng là cho hành động gateway thực thi không? |
| **Mới ở v3** | AB2 chuyển thành **điều kiện phải kiểm chứng** · tách **ZK Presentation / Approval Evidence / Verifiable Consent** · schema phiếu giao việc sửa để consent không mở rộng được quyền · thu hồi **fail-closed** có chính sách về độ mới · ba mức **Core MVP / Target / C-full** · ba trạng thái audit |
| **Trạng thái của MVP-C** | Mới là **ứng viên**. Chỉ được tuyên bố đạt sau khi spike S3 kiểm chứng holder binding và consent binding |
| **Việc phải quyết** | Tuyến phê duyệt (sau S3) · agent nền, hạn **15/11** |
| **Mốc gần nhất** | **Tối nay T4 11/11, 22:00: W4** · T2 16/11: W5 (Global FinReg) · 23/11: Checkpoint 1 |

---

## 0.1 Thay đổi so với v2

### Đánh giá 9 điểm bạn nêu

| # | Vấn đề | Đánh giá | Thay đổi trong v3 | Mục |
|---|---|---|---|---|
| 1 | Same-holder binding (AB2) | **Đồng ý.** v2 ghi AB2 đạt ở MVP-C khi "chỉ có một presentation". Điều đó chỉ đúng khi presentation chứa **một** credential. Với presentation hỗn hợp, tài liệu gọi loại proof này là *"weak linking proof"*, và mình không tìm được tài liệu nào nói nó chứng minh hai credential thuộc cùng holder | AB2 ghi là "chưa xác nhận"; thêm kiểm thử hai holder vào S3; thêm một cách đạt AB2 không phụ thuộc giao thức | 3.5, 7.1 |
| 2 | Consent binding | **Đồng ý.** `challenge = D` chỉ chứng minh proof được tạo cho `D`, không chứng minh người duyệt đã thấy nội dung | Tách ba khái niệm; quy định được phép dùng từ nào trong bài nộp; kiểm chứng phần hiển thị trong S3 | 3.5 |
| 3 | Work Order Schema | **Đồng ý, đây là lỗi của v2.** `approval.requiredFor` liệt kê thao tác không có trong `scope.actions` | Yêu cầu phê duyệt trở thành thuộc tính của từng thao tác trong scope, nên luôn là tập con | 3.4 (L2) |
| 4 | Revocation R1 | **Đồng ý.** R1 ở v2 dựa vào thông báo của A, lỗi thì gateway vẫn cho qua | Gateway tự đồng bộ từ chain; chính sách độ mới; fail-closed | 3.4 (L2), 4.7 |
| 5 | Scope | **Đồng ý.** v2 để L3a ngoài "MVP phải có", dễ hiểu thành bỏ ZKP | Ba mức: Core MVP, Target C-lite Combined, C-full | 3.8 |
| 6 | Định danh agent | **Đồng ý** | Network, registry, token ID, key đầy đủ | 3.4 (L1, L2) |
| 7 | Idempotency nguyên tử | **Đồng ý** | Giữ chỗ `request_id` bằng thao tác nguyên tử trước khi thực thi | 3.4 (L1) |
| 8 | Định danh trong commitment | **Đồng ý** | Bảng định danh theo tuyến; quy trình mở commitment | 3.4 (L2) |
| 9 | Lỗi khi neo audit | **Đồng ý** | Ba trạng thái; ghi log trước khi thực thi; neo lại; biên nhận ghi đúng trạng thái | 3.4 (L4) |

### Ba điểm mình bổ sung thêm

1. **Một cách đạt AB2 không cần giao thức chứng minh cùng holder.** A đưa **cả hai định danh** của kỹ sư (mã credential của account và public key của credential nhân viên) vào cùng một commitment trong phiếu. B kiểm cả hai proof mở đúng commitment đó. Khi ấy việc "hai định danh thuộc cùng một người" dựa trên chữ ký của A trên phiếu, là thứ B đã tin sẵn, và không cần Approval Service chạy trực tuyến.
2. **Nội dung phê duyệt phải sinh từ trường có cấu trúc, và nên hiển thị ở phía người duyệt.** Câu mô tả không được là văn bản tự do. Nếu ví không hiện nội dung, trang hiển thị nên do A phục vụ (bên người duyệt tin), tự tính lại `D` từ các trường nhìn thấy trước khi gọi ví.
3. **Với thao tác mức 2, neo bản ghi quyết định trước rồi mới thực thi.** Finality chỉ vài giây, đổi lại mọi thao tác rủi ro đều có dấu vết on-chain kể cả khi gateway hỏng giữa chừng.

**Về thứ tự spike:** S3 quan trọng nhất, nhưng phần kiểm thử hai holder cần có credential từ S2. Vì vậy chia S3 thành S3a (làm ngay) và S3b (sau S2); xem 7.1.

### Bảng tra mục

| Yêu cầu chỉnh | Mục trong v3 |
|---|---|
| L1: định danh agent, idempotency nguyên tử | 3.4 (L1) |
| L2: schema, commitment, thu hồi R1 | 3.4 (L2) |
| L4: trạng thái anchor, xử lý lỗi | 3.4 (L4) |
| AB2 chưa xác nhận; proof khác consent | 3.5 |
| Điều kiện để tuyên bố MVP-C | 3.5 |
| Core MVP / Target / C-full | 3.8 |
| Giả định về độ mới của dữ liệu thu hồi và giao diện phê duyệt | 4.3, 4.7, 4.9 |
| Kiểm thử mới trong S0–S3 | 7.1 |
| Ba rủi ro mới | 9 |

Bảng đánh giá 10 vấn đề của đợt góp ý trước nằm trong v2, mục 0.1.

### Giữ nguyên

Hướng C-lite kết hợp · use case Enterprise DevOps A → B · kiến trúc L1–L4 · năm phép kiểm V1–V5 · cấu trúc AB1–AB5 · giữ cả ZKP, commitment và consent · gateway của B tự kiểm policy · hai phương án MVP-C / MVP-T · agent chạy off-chain · hạ tầng B mô phỏng · Register Data là cách neo chính · không phụ thuộc Agent IDP và Protocol-Level Locks · thứ tự build L1 → L2 → L4 → L3b → L3a · spike S0–S3 · C-full là hướng dài hạn.

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
| **Theo dõi chain** | SDK có hàm lấy các block đã finalized và sự kiện giao dịch trong từng block | Gateway tự phát hiện được sự kiện thu hồi, không cần chờ A báo |
| **Presentation hỗn hợp** | SDK mô tả proof liên kết trong presentation là *"weak linking proof"* | ⚠️ Không có tài liệu nào nói nó chứng minh hai credential thuộc cùng holder |
| **Company ID** | Thuộc tính: `legalName`, `legalCountry`, `businessNumber` (bắt buộc), `lei`, `registrationAuth` (tùy chọn) | Organization Verification dùng reveal `legalName` hoặc `lei` |

---

## 3. Hướng đã chốt: C-lite kết hợp ⭐

### 3.1 Quá trình chốt

| Mốc | Quyết định |
|---|---|
| Sau W1 | 3 hướng A, B, C |
| Sau W2 | v1: gộp A+B; v2: chọn C-lite có điều kiện; sau đó gộp hai bản C-lite |
| Sau W3 (10/11) | Giữ hướng; thêm sponsored transactions, memo, Locks vào path to production |
| 11/11 (v2) | Giữ hướng; bổ sung tính đúng đắn của chuỗi xác minh và ủy quyền |
| **11/11 (v3, bản này)** | Giữ hướng; siết holder binding, consent binding, schema phiếu, thu hồi, audit |

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

**Định danh agent đầy đủ.** Một agent được xác định bởi cả bốn thành phần, không chỉ bởi token ID:

```json
"agent": {
  "network":  "ccd:4221332d34e1694168c2a0c0b3fd0f27",
  "registry": { "index": 12802, "subindex": 0 },
  "tokenId":  "<số u64>",
  "key": {
    "keyRegistry": { "index": 12801, "subindex": 0 },
    "namespace":   "<chuỗi kiểu CAIP của chain ngoài>",
    "keyType":     "ed25519 | secp256k1-compressed",
    "publicKey":   "<hex>",
    "proofScheme": "<scheme đã dùng khi đăng ký CIS-8>"
  }
}
```

Cùng một token ID có thể tồn tại ở mạng khác hoặc registry khác. Gateway so **từng trường** với cấu hình đã ghim và với dữ liệu trên chain.

**Gateway kiểm, trực tiếp trên chain:**
1. `network` và `registry` trùng với registry đã ghim; không chấp nhận registry lạ.
2. Trạng thái agent là Active.
3. Hash của Agent Card đang được phục vụ trùng `metadata_hash` on-chain.
4. Key CIS-8 gắn với agent đang Active, và **owner của key trùng owner của agent**.
5. Request mang **chữ ký mới** của đúng key đó.

**Owner binding:** owner hiện tại phải trùng account A đã ghim. Kiểm ở mỗi phiên, vì NFT chuyển chủ được. L1 chỉ trả lời V1; KYB thuộc V2.

**Request envelope:**

```text
AgentRequest = { v, audience, agent, work_order_hash, action, resource, params_hash,
                 request_id (ngẫu nhiên 128 bit), issued_at, expires_at (≤ 60 giây) }
signature    = Ký bằng key CIS-8 trên: "CLITE-GW/v1/request" ‖ dạng chuẩn hóa của AgentRequest
```

Gateway kiểm: chữ ký đúng key của agent · `audience` đúng là mình · còn hạn.

Hai lưu ý khi ký:
- Tiền tố phải **khác** `CIS-8/v1/canonical`, để chữ ký lúc chạy không dùng lại được làm bằng chứng đăng ký CIS-8.
- Với key EVM, chỉ ký thông điệp có tiền tố theo đúng scheme đã đăng ký, không ký chuỗi 32 byte thô.

**Idempotency có tính nguyên tử cho `request_id`:**

| Bước | Quy tắc |
|---|---|
| Giữ chỗ | Ghi `request_id` vào kho bền vững bằng **một thao tác nguyên tử** (chèn với ràng buộc duy nhất). Chỉ request chèn thành công mới được đi tiếp |
| Request trùng đến đồng thời | Chèn thất bại → trả "đang xử lý" hoặc kết quả đã có; **không bao giờ thực thi lần hai** |
| Trạng thái | `reserved → executing → done` (hoặc `failed`); ghi kèm hash của request để phát hiện cùng `request_id` nhưng khác nội dung (từ chối) |
| Thời gian lưu | Ít nhất đến `expires_at` cộng độ lệch đồng hồ cho phép; phải sống qua lần khởi động lại gateway |

Approval digest cũng được "tiêu" bằng thao tác nguyên tử cùng kiểu: một lần phê duyệt chỉ dùng cho đúng một lần thực thi.

#### L2: Delegation (Signed Work Order + Commitment)

**Giữ nguyên:** phiếu giao việc do A cấp, kèm commitment về kỹ sư phụ trách.

**Mandate schema (đã sửa):**

```json
{
  "v": 1,
  "id": "wo_<định danh duy nhất>",
  "issuer":   { "network": "ccd:…", "account": "<account của A>" },
  "audience": { "network": "ccd:…", "gateway": "<định danh gateway của B>" },
  "agent":    { "…": "định danh đầy đủ như ở L1" },
  "scope": {
    "actions": [
      { "action": "logs.read",       "resources": ["env:staging/*"], "approval": "none" },
      { "action": "service.restart", "resources": ["env:staging/*"], "approval": "none", "maxPerHour": 20 },
      { "action": "deploy.prod",     "resources": ["svc:payments"],  "approval": "required" }
    ]
  },
  "approval": { "rolePolicy": "devops-oncall",
                "commitmentScheme": "clite/approver/v2",
                "approverCommitment": "<sha256>" },
  "notBefore": "…", "expiresAt": "…",
  "nonce": "<ngẫu nhiên>"
}
```

Yêu cầu phê duyệt giờ là **thuộc tính của từng thao tác trong scope**. Tập thao tác cần duyệt vì thế luôn là tập con của scope, không thể viết ra một phiếu mâu thuẫn như ở v2.

**Quy tắc cấp quyền:**
1. Thao tác **không có trong `scope.actions`** → từ chối, **dù có consent hợp lệ**. Muốn làm thì phải có phiếu mới.
2. Thao tác có `approval: "required"` → chỉ chạy khi có phê duyệt hợp lệ cho đúng request đó.
3. Policy của B chỉ được **nâng** yêu cầu (ví dụ bắt duyệt cả thao tác phiếu ghi `none`), không bao giờ hạ.
4. Quyền hiệu lực = phiếu ∩ trần quyền B cấu hình cho A.

`wo_hash` = SHA-256 của dạng JSON chuẩn hóa (JCS, RFC 8785).

**A ủy quyền bằng cách nào:** account của A gửi một giao dịch Register Data chứa `wo_hash`. Agent mang theo mã giao dịch này cùng phiếu. Gateway kiểm: đúng account gửi, đúng nội dung, đã finalized.

**Gateway kiểm (V3):** anchor do đúng account A gửi · `agent` trùng agent đang gọi và key đang ký · `audience` đúng là mình · trong khoảng `notBefore`–`expiresAt` · **trạng thái thu hồi được xác nhận là còn mới** · thao tác thỏa bốn quy tắc trên.

**Ba công tắc thu hồi độc lập:**

| Công tắc | Tắt cái gì | Cơ chế |
|---|---|---|
| Thu hồi **agent** | Mọi hoạt động của agent đó | `revoke` trên CIS-8004 |
| Thu hồi **credential** | Khả năng duyệt của một người | Thu hồi trong registry CIS-4 |
| Thu hồi **work order** | Đúng một lần ủy quyền | R1 bên dưới; R2, R3 là hướng nâng cấp |

**Thu hồi work order theo R1 (đã sửa: kéo là chính, fail-closed):**

| Thành phần | Quy định |
|---|---|
| Sự kiện thu hồi | Giao dịch Register Data do **account A** gửi, chứa nhãn thu hồi và `wo_hash`, đã finalized |
| Đồng bộ | Gateway **tự theo dõi các block đã finalized** và đọc mọi Register Data của account A. SDK có hàm lấy block finalized và sự kiện giao dịch trong block 📄; cần thử trong S1 ⚠️ |
| Mốc đồng bộ | Gateway lưu `synced_until`: thời điểm của block finalized mới nhất đã xử lý |
| Chính sách độ mới | Trước khi cho phép, bắt buộc `bây giờ − synced_until ≤ ngưỡng`. Gợi ý: 30 giây cho thao tác mức 2, 120 giây cho mức 0–1 |
| **Fail-closed** | Quá ngưỡng, hoặc không truy cập được node → **từ chối** với mã lý do `revocation_status_stale`. Không bao giờ "không biết thì cho qua" |
| Khởi động lại | Gateway bắt kịp từ mốc đã lưu rồi mới nhận request |
| Thông báo trực tiếp từ A | Chỉ để **nhanh hơn**. Gateway vẫn xác minh giao dịch. Mất thông báo không làm mất an toàn |
| Xác nhận cho A | Gateway ghi bản ghi `revocation` và trả biên nhận có chữ ký, để A biết B đã áp dụng |
| Thời hạn phiếu | Ngắn (giờ hoặc ngày), là lớp bảo vệ thứ hai |

Hai giới hạn phải ghi rõ: thu hồi có hiệu lực từ lúc giao dịch finalized; thao tác **đang chạy** tại thời điểm đó không bị ngắt.

| Hướng nâng cấp | Cơ chế | Dùng khi |
|---|---|---|
| **R2** | Sổ trạng thái on-chain theo chuẩn CIS-4; gateway hỏi trạng thái ở mỗi request | Spike S2 đạt ⚠️ |
| **R3** | Contract nhỏ tự viết | Còn thời gian |

**Commitment: đưa định danh nào vào hash**

Nguyên tắc: định danh trong commitment phải là **đúng thứ xuất hiện trong presentation** mà gateway nhận được. Chốt sau S2 và S3, khi đã đọc JSON thật.

| Tuyến | Định danh đưa vào commitment |
|---|---|
| L3b bằng proof gắn account, chưa có L3a | Mã credential của account (`credId`) |
| Target: L3b + L3a | **Cả hai**: `credId` và cặp (registry, public key của holder) của credential nhân viên |
| MVP-T | Định danh do A chọn; không mở cho B |

```text
approverCommitment = SHA-256( "clite/approver/v2" ‖ dạng chuẩn hóa của
    { ids: [ {type:"account-cred", network, credId},
             {type:"web3id", registry, holderKey} ] } ‖ salt )
```

**Quy trình mở commitment:**

| Bước | Ai | Làm gì |
|---|---|---|
| Tạo | A | Sinh salt ngẫu nhiên ≥ 128 bit, **riêng cho từng phiếu**; lưu salt ít nhất bằng thời gian lưu audit |
| Giao | A → kỹ sư | Salt đến tay kỹ sư qua kênh nội bộ của A, kèm yêu cầu phê duyệt |
| Mở cho B (MVP-C) | Kỹ sư → gateway | Salt gửi cùng presentation. Gateway lấy định danh **từ presentation** (không lấy từ dữ liệu do người gửi tự khai), tính lại và so với phiếu |
| Lưu | B | Ghi salt vào bản ghi `approval` off-chain để về sau chứng minh lại được |
| Tranh chấp | A hoặc B → bên phân xử | Công bố định danh và salt; bên phân xử tính lại và so với `wo_hash` đã neo |

Mã credential của account là dữ liệu công khai trên chain, nên **salt là thứ duy nhất giữ kín** người được chỉ định. Không dùng lại salt, không ghi salt lên chain.

**Commitment làm được gì và không làm được gì:**

| Commitment **làm được** | Commitment **không làm được** |
|---|---|
| Cam kết trước A đã chỉ định ai, A không đổi được về sau | Chứng minh người đó là nhân viên hợp lệ |
| Giấu định danh người được chỉ định với người ngoài | Chứng minh người đó còn tư cách tại thời điểm duyệt |
| Cho phép mở ra khi cần | Tự nó chứng minh người đã duyệt chính là người được chỉ định |

Nếu chỉ có L2 mà không có L3a, tư cách của người duyệt là **lời xác nhận có chữ ký của A**, không phải bằng chứng B tự kiểm được.

#### L3a: Employee Verification (Web3 ID / CIS-4 + ZKP)

- **Credential:** A triển khai một registry CIS-4 cho một loại credential, thuộc tính gợi ý: `role`, `customer`. Credential có hạn và thu hồi được.
- **Xác minh:** gateway của B tự chạy verifier; kiểm statement; kiểm trạng thái credential trong registry là Active.
- **Issuer trust:** B chỉ chấp nhận credential từ **đúng registry của A đã ghim**; liên hệ giữa registry và account A phải kiểm được trên chain.
- **Privacy:** proof lộ public key của holder và địa chỉ registry; không lộ tên. Dữ liệu lộ thực tế phải đọc từ presentation thật trong S2.
- **Proof binding:** challenge của presentation phải bằng approval digest.
- **Holder binding:** việc credential này và account credential thuộc cùng một người **chưa được xác nhận** (mục 3.5).

#### L3b: Human Approval (Concordium ID + Consent)

- Phê duyệt gắn với approval digest (mục 3.5).
- Phê duyệt **không mở rộng được phạm vi**: nó chỉ kích hoạt một thao tác đã có trong `scope.actions` với `approval: "required"`.
- Luôn kèm ít nhất một statement khi xin consent (bản test của ID App có lỗi hiển thị với consent trống, W2 [08:36–09:17]).
- Một presentation gắn với `D` là **bằng chứng phê duyệt**, chưa chắc là **consent kiểm chứng được**; xem 3.5.

#### L4: Audit

**Giữ nguyên:** log có cấu trúc off-chain, neo hash bằng Register Data.

**Các loại bản ghi** (mỗi bản ghi chứa hash của bản ghi trước):

| Loại | Nội dung |
|---|---|
| `request` | Hash của request đã ký, thời điểm nhận |
| `decision` | allow / deny / needs_approval, kết quả năm phép kiểm, mã lý do, tham chiếu bằng chứng |
| `approval` | Approval digest, hash của presentation, salt đã mở, mã giao dịch VRA/VAA nếu có |
| `execution` | Bắt đầu / thành công / thất bại, hash của kết quả |
| `revocation` | Sự kiện thu hồi đã đọc từ chain |

**Ba trạng thái, không gộp:**

```text
Execution Completed  →  Audit Recorded  →  Anchor Finalized
(thao tác đã chạy)      (đã ghi log bền)    (giao dịch neo đã finalized)
```

Một hành động chỉ được gọi là "có bằng chứng on-chain" khi đã tới **Anchor Finalized**.

**Quy tắc xử lý:**

| Tình huống | Xử lý |
|---|---|
| Không ghi được bản ghi `decision` | **Không thực thi** (fail-closed). Log phải ghi được trước khi thao tác chạy |
| Thao tác mức 2 | **Neo bản ghi `decision` và chờ finalized rồi mới thực thi** |
| Thực thi xong, ghi `execution` lỗi | Thử ghi lại; trong lúc đó không nhận thao tác mới của agent này |
| Thực thi xong, giao dịch neo thất bại hoặc chưa finalized | Bản ghi mang `anchor_status` = `pending` / `submitted` / `finalized` / `failed`. Hàng đợi tự gửi lại. Vì mỗi anchor chứa hash của bản ghi mới nhất trong chuỗi, **một anchor thành công về sau bao luôn các bản ghi trước nó** |
| Tồn đọng anchor vượt ngưỡng (số bản ghi hoặc thời gian) | Dừng thao tác mức 2 cho đến khi neo được |
| Biên nhận trả cho agent | Ghi **đúng trạng thái**: biên nhận tạm (đã ghi log, chưa neo) và biên nhận cuối (kèm mã giao dịch đã finalized) |
| Gateway khởi động lại | Đọc hàng đợi, neo tiếp những bản ghi còn `pending` |

**Các phần khác:**
- **Biên nhận có chữ ký** của gateway giúp A cũng giữ bằng chứng.
- **Công cụ kiểm tra toàn vẹn** tính lại chuỗi hash và so với anchor on-chain; báo riêng những bản ghi chưa được anchor nào bao phủ.
- **Bảo vệ metadata:** chỉ neo hash hoặc gốc lô; không ghi tên thao tác, tên khách hàng, định danh kỹ sư dạng đọc được lên chain.

| Cách neo | Bản chất | Dùng khi |
|---|---|---|
| **Register Data** | Loại giao dịch riêng để ghi ≤ 256 byte; không chuyển tiền | **Chính**: work order, thu hồi, audit |
| Memo | Chuỗi kèm một lệnh chuyển CCD hoặc PLT | Chỉ khi có thanh toán thật |
| VRA / VAA | Anchor do verifier của Verify & Access tạo | Tự có khi L3b đi qua Verify & Access |
| Merkle root | Nội dung được neo khi gom lô, vẫn gửi bằng Register Data | Production |

### 3.5 Approval Binding ⭐ (ưu tiên số 1)

**Hai câu hỏi phải trả lời được:**
1. Người có Employee Credential hợp lệ có đúng là người đã duyệt không? (holder binding)
2. Lần duyệt đó có đúng là cho hành động gateway thực thi, và người duyệt có thấy đúng nội dung đó không? (consent binding)

#### Ba khái niệm phải tách

| Khái niệm | Chứng minh điều gì | **Không** chứng minh điều gì |
|---|---|---|
| **ZK Presentation** | Người giữ credential thỏa các statement, tại lúc tạo proof, cho một challenge hoặc context cụ thể | Người đó thấy gì trên màn hình; họ là ai trong phiếu giao việc |
| **Approval Evidence** | Một hoặc nhiều presentation gắn với đúng digest `D`, và gateway đã kiểm đủ AB1–AB5 | Người duyệt đã đọc và hiểu đúng nội dung hành động |
| **Verifiable Consent** | Approval Evidence, **cộng với** việc nội dung người duyệt nhìn thấy được hiển thị bởi một thành phần họ tin và chính nội dung đó nằm trong phần được chứng minh | Người duyệt không bị ép buộc; giá trị pháp lý đầy đủ |

**Quy định về cách gọi tên trong code, tài liệu và bài nộp:** chỉ dùng "verifiable consent" khi đã kiểm chứng được phần hiển thị. Trước đó dùng "approval evidence".

#### Năm điều kiện và trạng thái hiện tại

| | Điều kiện | Nghĩa | Trạng thái |
|---|---|---|---|
| **AB1** | Ràng buộc hành động | Mọi bằng chứng gắn với cùng digest `D` | Đạt theo cách xây dựng; S3 xác nhận `D` thực sự nằm trong proof |
| **AB2** | Ràng buộc chủ thể | Consent và ZK proof do cùng một chủ thể tạo ra | ⚠️ **Chưa xác nhận.** Phải kiểm chứng |
| **AB3** | Ràng buộc thẩm quyền | Chủ thể đó được duyệt cho đúng phiếu này | Phụ thuộc AB2 và định danh trong commitment |
| **AB4** | Tính mới | Digest dùng một lần, còn hạn | Đạt theo cách xây dựng (tiêu digest nguyên tử, mục 3.4) |
| **AB5** | Ràng buộc agent | Request được duyệt là request do key của agent trong phiếu ký | Đạt theo cách xây dựng |

#### Approval digest

```text
D = SHA-256( dạng chuẩn hóa của {
      v, audience, agent, work_order_hash, request_hash,
      action, resource, params_hash,     // các trường có cấu trúc của hành động
      nonce, expires_at } )
```

Câu mô tả cho người đọc (ví dụ "Deploy service payments lên B/prod") **được sinh từ các trường `action`, `resource` bằng một mẫu cố định**, không phải văn bản tự do. Nhờ vậy ai có các trường này cũng dựng lại được đúng câu đó và đúng `D`.

#### AB2: ba cách đạt, theo thứ tự ưu tiên

| Cách | Cơ chế | B phải tin thêm | Trạng thái |
|---|---|---|---|
| **(i) Giao thức chứng minh cùng holder** | Một presentation hỗn hợp (account credential + credential nhân viên) mà việc xác minh **thất bại** nếu hai credential thuộc hai người khác nhau | Không | ⚠️ Chưa biết. Tài liệu gọi là *"weak linking proof"*. Kiểm bằng test hai holder trong S3b |
| **(ii) Chỉ định cả hai định danh** | Phiếu giao việc cam kết **cả** `credId` lẫn public key của credential nhân viên. B kiểm cả hai proof mở đúng commitment | Chỉ chữ ký của A trên phiếu (đã tin sẵn) | Làm được nếu cả hai định danh lộ ra trong presentation 📄; xác nhận trong S2, S3 |
| **(iii) Approval Service của A** | Dịch vụ của A xác nhận hai bằng chứng thuộc cùng kỹ sư được chỉ định | Khóa và tính toàn vẹn của dịch vụ đó | Luôn làm được; là MVP-T |

Trường hợp chỉ có **một** credential trong phê duyệt (Core MVP, chưa có L3a) thì AB2 không phát sinh: chỉ có một chủ thể.

Giới hạn còn lại ở cả ba cách: không ngăn được hai người cố ý thông đồng.

#### Consent binding: nội dung người duyệt nhìn thấy

`challenge = D` bảo đảm proof được tạo cho `D`. Nó không bảo đảm màn hình hiện đúng hành động ứng với `D`.

| Nơi hiển thị nội dung | Ai phải tin ai | Được gọi là |
|---|---|---|
| **Trong ví hoặc ID App**, và chính văn bản đó được neo và nằm trong proof (Verify & Access, W1 [51:26–52:16]) | Người duyệt tin ứng dụng ví của mình | Verifiable Consent, **sau khi S3 xác nhận** ứng dụng hiện đúng văn bản đã neo |
| **Trang do A phục vụ**, tự tính lại `D` từ các trường đang hiển thị rồi mới gọi ví | Người duyệt tin trang của chính công ty mình | Approval Evidence có hiển thị do bên duyệt kiểm soát |
| **Trang do B phục vụ** | Người duyệt phải tin B | Approval Evidence; yếu nhất khi tranh chấp |

Điều log chứng minh được về sau: **nội dung nào đã được gắn với `D`**. Log không chứng minh được màn hình đã hiện gì, trừ khi phần hiển thị thuộc về ví.

#### Giao thức nào làm được gì 📄

| Khả năng | Verify & Access qua **ID App** | Verify & Access qua **ví có account** | **Web3 ID presentation** (Wallet for Web) |
|---|---|---|---|
| Đã thấy chạy | ✅ W1, W2 | ⚠️ Chưa thấy | 📄 Có tài liệu và công cụ testnet |
| Proof gắn account (lộ `credId`) | ❌ | 📄 Có | 📄 Có |
| Nội dung hiện trong ứng dụng | ✅ | ⚠️ Chưa rõ | ❌ Challenge là chuỗi 32 byte |
| Tự neo VRA/VAA | ✅ | 📄 Có | ❌ Tự neo ở L4 |
| Kèm credential Web3 ID trong cùng yêu cầu | ⚠️ Không thấy trong tài liệu | ⚠️ Không thấy | 📄 Có, nhưng holder binding chưa xác nhận |

#### Hai phương án, và điều kiện để tuyên bố

| | **MVP-C** (ứng viên): ràng buộc bằng mật mã | **MVP-T**: Approval Service tin cậy |
|---|---|---|
| Kỹ sư duyệt bằng | Ví có account | ID App |
| B thấy gì về người duyệt | Định danh giả, không thấy tên | Không thấy gì |
| AB2 | Cách (i) hoặc (ii) | Cách (iii) |
| AB3 | B tự kiểm bằng cách mở commitment | Approval Service xác nhận |
| Consent | Tùy nơi hiển thị (bảng trên) | Verifiable Consent nếu S3 xác nhận phần hiển thị của ID App |
| B phải tin thêm | Không | Approval Service của A |

**MVP-C chỉ được tuyên bố là đạt khi cả bốn điều sau có kết quả từ S3:**
1. Presentation thật chứa `D` ở vị trí verifier kiểm (AB1).
2. Định danh trong presentation đúng là thứ đã đưa vào commitment, và gateway lấy nó từ phần đã được xác minh (AB3).
3. Với presentation hỗn hợp: test hai holder cho kết quả rõ ràng. Nếu verifier chấp nhận hai holder khác nhau thì phải dùng cách (ii).
4. Biết chắc người duyệt nhìn thấy nội dung ở đâu, và gọi tên bằng chứng đúng theo bảng consent binding.

Thiếu điều nào thì ghi rõ điều đó là giả định, hoặc chuyển sang MVP-T.

**Nếu chọn MVP-T, Approval Service phải:** chạy ở phía A, tách khỏi agent (khác tiến trình, khác key) · ký xác nhận gồm `D`, `wo_hash`, kết quả, thời điểm bằng key B đã ghim · gửi kèm presentation gốc để gateway của B **vẫn tự xác minh proof**. Ở MVP-T, commitment chỉ chứng minh A đã chỉ định ai, không chứng minh người đó là người đã duyệt.

**Cách chọn sau spike S3:**

| Kết quả | Chọn |
|---|---|
| Ví có account trả lời được Verify & Access gắn account **và** hiện đúng nội dung | Tốt nhất: L3b qua ví đó; L3a qua Web3 ID presentation; AB2 bằng cách (i) hoặc (ii) |
| Chỉ Web3 ID presentation chạy được | MVP-C với Approval Evidence; nội dung hiện trên trang do A phục vụ; tự neo ở L4 |
| Chỉ ID App chạy được | MVP-T |

Gateway nhận cùng một cấu trúc `ApprovalEvidence` ở mọi tuyến, nên đổi tuyến không phải viết lại gateway.

**Phương án nâng cao (sau hackathon):** Verify & Access nhận claim trên credential Web3 ID trong cùng yêu cầu có consent · credential nhân viên mang thuộc tính ràng buộc với account của kỹ sư ⚠️ · Verify & Pay cho agent, Protocol-Level Locks, Concordium Signer.

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
| 9 | Work order của agent khác, registry khác, mạng khác, hoặc cấp cho gateway khác | V3 |
| 10 | Thao tác ngoài phạm vi | V3 |
| 11 | Credential từ registry khác (sai issuer) | V4 |
| 12 | Credential bị thu hồi hoặc hết hạn | V4 |
| 13 | Consent không khớp: digest của request khác, hoặc dùng lại lần duyệt cũ | V5 |
| 14 | Người duyệt không phải người được chỉ định | Approval Binding (AB3) |
| 15 | Kỹ sư từ chối | V5 |
| 16 | Sửa một dòng trong audit log | Công cụ kiểm tra toàn vẹn |
| **17** | Hai request trùng `request_id` gửi **đồng thời** | L1: chỉ một lần thực thi |
| **18** | Presentation hỗn hợp: account credential của người này, credential nhân viên của người khác | Approval Binding (AB2) |
| **19** | Consent hợp lệ cho một thao tác **không có trong phiếu** | V3: từ chối dù có consent |
| **20** | Nội dung hiển thị cho người duyệt khác nội dung gắn với `D` | Consent binding (kiểm tay trong S3) |
| **21** | Gateway mất đồng bộ trạng thái thu hồi, hoặc không truy cập được node | V3: fail-closed |
| **22** | Thực thi xong nhưng giao dịch neo thất bại | L4: biên nhận ghi "chưa neo", tự neo lại, không báo "đã có bằng chứng on-chain" |

Video demo chỉ cần 3–4 tình huống (gợi ý: 1, 8, 13, 19). Số còn lại chạy bằng test tự động. SDK có hàm tạo presentation từ seed, nên có thể viết một "ví giả" cho test tự động; đây cũng là cách dựng test 18 ⚠️ cần thử.

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

### 3.8 Scope: ba mức

| Mức | Gồm | Vai trò |
|---|---|---|
| **Core MVP** | L1 (đủ phép kiểm, request có chữ ký, idempotency) · L2 (schema mới, R1 fail-closed) · L4 (ba trạng thái) · L3b theo một tuyến, với Approval Evidence | **Mức sàn**: bản nộp được nếu mọi phần có điều kiện đều thất bại |
| **Target: C-lite Combined** | Core MVP **+ L3a** (Employee Credential + ZK proof) + AB2 đạt bằng cách (i) hoặc (ii) | **Mục tiêu chính của dự án**, đúng với hướng đã chốt. Có điều kiện kỹ thuật: S2 và S3 phải đạt |
| **C-full** | Target + ràng buộc phê duyệt hoàn toàn trong một yêu cầu Verify & Access · sổ trạng thái on-chain · Locks · Verify & Pay cho agent · Concordium Signer · Company ID trên mainnet | Dài hạn; đưa vào path to production |

**L3a không bị hạ xuống "tùy chọn".** Nó là phần làm nên chữ "kết hợp". Nó đứng cuối thứ tự build vì phụ thuộc kết quả kiểm chứng, không phải vì kém quan trọng.

**Cách đi:**
- Spike S2 và S3 chạy **trước** khi build, để biết Target có khả thi không.
- Nếu S2 hoặc S3 không đạt: nộp Core MVP, và ghi rõ trong bài nộp rằng L3a đã được thiết kế nhưng chưa chạy, kèm lý do kỹ thuật.
- **Mốc cắt:** đến 30/11 chưa xong L3b thì dừng ở Core MVP.

**Chỉ làm khi Target đã chạy:** Company ID · sponsored transactions · R2.
**Không làm trong hackathon:** x402 (trừ khi dư thời gian) · Agent IDP · Locks · contract tự viết.

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
| A đã cấp phiếu này | ✅ Giao dịch của account A | |
| Phiếu **chưa bị thu hồi** | ✅ Nếu dữ liệu thu hồi còn mới | **Node mà gateway đọc trả đúng và đủ các block đã finalized; đồng hồ của gateway đúng** |
| Người duyệt có credential còn hiệu lực | ✅ ZK proof + trạng thái registry | Registry đó đúng là của A; A cấp credential đúng người |
| Credential và account thuộc cùng một người | ⚠️ Chưa xác nhận; cách (ii) thì ✅ | Ở cách (ii): chữ ký của A trên phiếu. Ở cách (iii): Approval Service |
| Người duyệt là người được chỉ định | ✅ ở MVP-C · ❌ ở MVP-T | Ở MVP-T: Approval Service của A |
| Proof được tạo cho đúng hành động | ✅ Digest `D` trong proof | |
| Người duyệt **đã thấy đúng nội dung** | ❌ B không tự kiểm được | **Thành phần hiển thị**: ví, hoặc trang phê duyệt và bên phục vụ trang đó |
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

### 4.7 Thu hồi độc lập và độ mới của dữ liệu

Ba công tắc ở mục 3.4 (agent, credential, work order) hoạt động riêng rẽ.

| Thu hồi | B thấy sau | Khi không xác minh được |
|---|---|---|
| Agent (CIS-8004) | Lần đọc chain kế tiếp (mỗi phiên hoặc mỗi request) | Từ chối |
| Credential (CIS-4) | Lần xác minh proof kế tiếp | Từ chối phê duyệt |
| Work order, R1 | Tối đa bằng ngưỡng độ mới (gợi ý 30 giây cho mức 2, 120 giây cho mức 0–1) | **Từ chối** (`revocation_status_stale`) |
| Work order, R2 / R3 | Lần đọc trạng thái kế tiếp | Từ chối |

**Giả định về độ mới:**
- Gateway chỉ coi trạng thái "chưa thu hồi" là đúng trong ngưỡng độ mới kể từ block finalized gần nhất đã xử lý.
- Nguồn dữ liệu là node Concordium mà gateway kết nối. Node sai hoặc bị cô lập thì gateway có thể không thấy sự kiện thu hồi; giảm thiểu bằng cách chạy node riêng hoặc đối chiếu hai nguồn (production).
- Đồng hồ của gateway phải đúng trong phạm vi độ lệch cho phép.
- Đánh đổi: fail-closed làm giảm tính sẵn sàng khi node chậm. Với thao tác rủi ro, đó là lựa chọn đúng.

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
| **Commitment** | Chỉ giấu được khi salt đủ ngẫu nhiên và kín. Không chứng minh tư cách. Mở ra cần có salt; A mất salt thì không mở được |
| **ZK proof** | Chỉ chứng minh statement và việc nắm credential tại lúc tạo proof. Proof gắn account hoặc credential vẫn lộ định danh giả. Câu hỏi quá hẹp làm lộ thông tin |
| **Presentation hỗn hợp** | Chưa có tài liệu xác nhận nó chứng minh hai credential thuộc cùng holder |
| **Presentation gắn với `D`** | Chứng minh proof được tạo cho `D`; không chứng minh người duyệt thấy đúng nội dung |
| **Giao diện phê duyệt** | Là một điểm tin cậy. Nếu nội dung hiện ngoài ví, bên phục vụ trang có thể hiện sai |
| **Badge** | Owner là account có danh tính đứng sau; không phải bằng chứng KYB, không phải quyền hạn |
| **CIS-8** | Chứng minh kiểm soát key lúc đăng ký, không phải lúc chạy |
| **Thu hồi R1** | Đúng trong ngưỡng độ mới; không ngắt thao tác đang chạy |
| **Audit anchor** | Chứng minh toàn vẹn và thời điểm của những gì **đã neo xong**; không chứng minh nội dung đúng hay đủ |
| **Approval Service (MVP-T)** | Là một điểm tin cậy; hỏng thì ràng buộc cá nhân mất |

---

## 5. Những điểm còn mở

| Mã | Câu hỏi | Ưu tiên | Bằng chứng hiện có | Cách chốt |
|---|---|---|---|---|
| **G1.1** | Phát hành được Employee Credential bằng Web3 ID trên testnet không? | P0 | 📄 Issuer frontend testnet đang phản hồi; ví có menu Web3 ID; tài liệu nêu ví dụ *employment history* | Spike S2 |
| **G1.2** | Tạo và xác minh được ZK proof từ credential đó không? | P0 | 📄 Proof explorer và verifier testnet đang phản hồi | Spike S2 |
| **G1.3** | Liên kết được proof với consent của cùng chủ thể không? | P0 ⭐ | 📄 Một Web3 ID presentation gộp được account credential và credential nhân viên. ⚠️ **Chưa có tài liệu nào xác nhận hai proof đó thuộc cùng holder.** 📄 ID App không có account | Spike S3b (test hai holder) + hỏi Discord → chọn cách đạt AB2 |
| **G1.4** | Liên kết được approval với work order và hành động cụ thể không? Người duyệt có thấy đúng nội dung không? | P0 ⭐ | ✅ Về thiết kế: `D` chứa `wo_hash`, `request_hash` và các trường của hành động. ✅ W1: nội dung consent được neo. ⚠️ Chưa biết ví hiển thị gì | Spike S3a: xác nhận `D` nằm trong proof và ghi lại phần hiển thị |
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
7. In a Web3 ID presentation that combines an account credential and a Web3 ID credential,
   does verification prove that both belong to the same holder, or only that both proofs
   share the same challenge ("weak linking")?
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
| Rà lại thiết kế theo 9 điểm góp ý về v2 (11/11) | ✅ Bản này |
| Global FinReg | ⏸️ |
| Tạo project trên Encode; đăng câu hỏi Discord; chạy demo `ccd-ui-sdk`; cài Node.js | ⚠️ Chưa xác nhận |

**Bài học vận hành:** không chụp hoặc gửi seed phrase · "Duplicate idCredPub" nghĩa là đang dùng lại seed cũ · ví tự khóa giữa chừng thì làm trong chế độ Fullscreen · trang web bên ngoài có thể chứa prompt injection nhắm vào agent.

---

## 7. Kế hoạch

**Nguyên tắc: kiểm chứng sớm, build muộn.** Mỗi spike có giới hạn thời gian và điều kiện hoàn thành. Hết thời gian mà chưa đạt thì ghi kết quả "không đạt" và đi tiếp theo phương án dự phòng.

### 7.1 Spike kiểm chứng (12–15/11)

Thứ tự đề xuất: **S3a → S0 → S1 → S2 → S3b.** S3 là spike quan trọng nhất; S3a không phụ thuộc gì nên làm trước, S3b cần credential từ S2.

| Spike | Việc | Giới hạn | Hoàn thành khi | Trả lời |
|---|---|---|---|---|
| **S3a** | Approval với một credential: (a) lấy presentation gắn account từ Wallet for Web với challenge tự chọn, đọc JSON; (b) lấy một consent qua ID App, đọc JSON; (c) thử cho ví có account trả lời yêu cầu Verify & Access; (d) **ghi lại chính xác ví và ID App hiển thị gì**, có đúng nội dung gắn với `D` không; thử sửa nội dung sau khi neo | 1 ngày | Biết `D` nằm ở đâu trong proof; biết định danh nào lộ ra; có ảnh chụp màn hình phê duyệt ở từng tuyến | G1.4, G2, consent binding |
| **S0** | Đăng ký agent (tạm dùng account cá nhân), gắn key CIS-8; script kiểm các điều của L1; ký và kiểm request. **Thêm:** gửi hai request trùng `request_id` đồng thời; chuyển agent sang account thứ hai rồi kiểm lại | 1 ngày | Script từ chối khi sai key; hai request trùng chỉ thực thi một lần; sau khi chuyển owner, phép kiểm V2 thất bại | L1, test 6 và 17 |
| **S1** | Gửi Register Data chứa một hash; đọc lại theo mã giao dịch; kiểm account gửi và nội dung. **Thêm:** theo dõi block finalized để bắt Register Data của một account; mô phỏng anchor thất bại (thiếu CCD, giao dịch hết hạn) và mất kết nối node | 0,5–1 ngày | Có link CCDExplorer; script bắt được sự kiện từ chain trong vài giây; gateway giả từ chối khi dữ liệu quá cũ; anchor lỗi được ghi `failed` và neo lại được | L4, R1, test 21 và 22 |
| **S2** | Web3 ID: tạo registry, cấp credential vào ví, tạo proof, xác minh, thu hồi rồi thử lại. **Thêm:** đọc presentation thật để ghi lại định danh của holder và mọi dữ liệu lộ ra | 1 ngày | Trả lời có / không cho G1.1, G1.2; có danh sách trường lộ ra trong presentation | G1.1, G1.2, G2 |
| **S3b** | Approval với hai credential: (a) presentation hỗn hợp từ **cùng một ví**; (b) presentation hỗn hợp ghép account credential của ví 1 với credential nhân viên của ví 2 (dựng bằng SDK); (c) thử cách (ii): cả hai định danh mở đúng một commitment | 1 ngày | Biết verifier **chấp nhận hay từ chối** trường hợp hai holder; chọn được cách đạt AB2; chọn MVP-C hoặc MVP-T | G1.3, AB2, test 18 |

Kết quả mỗi spike ghi vào `Checklist-sau-W2.md`: đạt hay không, bằng chứng (ảnh, mã giao dịch, đoạn JSON), và quyết định kéo theo.

### 7.2 Mốc quyết định

| Ngày | Quyết định |
|---|---|
| **11/11 (W4)** | Cách neo audit; Locks có bản testnet/devnet trước 09/12 không |
| **15/11** | Agent nền (DA); tuyến phê duyệt (MVP-C / MVP-T); cách đạt AB2; Target có khả thi không |
| **16/11 (W5)** | Global FinReg: tạo account công ty A thật hay giữ account đóng vai |
| **18/11 (W6)** | Gateway là MCP server hay HTTP proxy |
| **Trước 23/11** | Checkpoint 1: cập nhật mô tả trên Encode |

### 7.3 Build (19/11 → 09/12)

| Thời gian | Lớp | Hoàn thành khi |
|---|---|---|
| 19–22/11 | **L1** + request envelope | Negative test 1–6 và 17 đều qua trong test tự động |
| 23–26/11 | **L2** (cấp, kiểm, thu hồi theo R1) | Negative test 7–10, 19 và 21 đều qua; cấp và thu hồi có link CCDExplorer |
| 27–29/11 | **L4** | Mỗi request có đủ bản ghi decision và execution; ba trạng thái được ghi đúng; negative test 16 và 22 đều qua |
| 30/11–03/12 | **L3b** + Approval Binding | Thao tác mức 2 bị chặn cho đến khi có phê duyệt; negative test 13–15 đều qua; test 20 đã kiểm tay |
| 04–05/12 | **L3a** (mục tiêu Target; cần S2 và S3b đạt) | Negative test 11, 12 và 18 đều qua |
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
| **Same-holder binding không đạt ở mức giao thức** | **Cao** | Test hai holder trong S3b; dự phòng cách (ii), rồi cách (iii) |
| **Nội dung hiển thị cho người duyệt không khớp nội dung gắn với `D`** | **Cao** | Sinh câu mô tả từ trường có cấu trúc; ưu tiên hiển thị trong ví; nếu không thì trang do A phục vụ; gọi đúng tên bằng chứng |
| **Gateway không biết phiếu đã bị thu hồi** | Trung bình–Cao | Đồng bộ từ chain; ngưỡng độ mới; fail-closed; thời hạn phiếu ngắn |
| Công cụ Web3 ID trên testnet không chạy với ví hiện tại | Trung bình–Cao | S2 giới hạn 1 ngày; nếu không đạt thì nộp Core MVP và ghi rõ |
| Không đạt MVP-C, phải dùng MVP-T | Trung bình | Nêu rõ giả định tin cậy; gateway vẫn tự xác minh proof |
| Giả định tin cậy không được viết ra, bài nộp bị xem là nói quá | Trung bình | Đưa mục 4 vào `docs/architecture.md`; dùng đúng thuật ngữ ở 3.5 |
| Scope quá rộng cho solo | Trung bình–Cao | Ba mức ở 3.8; mốc cắt 30/11 |
| Anchor thất bại làm log và chain lệch nhau | Trung bình | Ba trạng thái; hàng đợi neo lại; dừng thao tác mức 2 khi tồn đọng |
| Fail-closed làm demo bị chặn khi node testnet chậm | Trung bình | Quay video sớm; ngưỡng cấu hình được; có sẵn node dự phòng |
| Global FinReg không dùng được trên testnet | Trung bình | Account cá nhân đóng vai A, ghi rõ giới hạn |
| Lộ metadata qua anchor on-chain | Thấp–Trung bình | Chỉ neo hash; production gom lô |
| Lộ key (gateway, sponsor, Approval Service, export ví) hoặc salt | Trung bình | Tách khóa (4.6); không commit; chỉ dùng testnet |
| Demo cần người thao tác ví thật | Trung bình | Quay sớm; test tự động cho phần còn lại |
| CIS-8 còn là draft; registry có thể được nâng cấp | Thấp | Ghim contract; chạy lại test trước khi quay video |
| Faucet hoặc ví testnet lỗi gần hạn | Trung bình | Đã có 20.000 test CCD; nộp sớm |

---

## 10. Chỉ mục tài liệu

| Muốn tìm | Đọc |
|---|---|
| Các bản tổng hợp trước | `Tong-hop-sau-W3-v2.md` (v2, có bảng đánh giá 10 vấn đề của đợt góp ý đầu) · `Tong-hop-sau-W3.md` (v1) |
| Chi tiết từng buổi | `Bao-cao-Workshop01.md`, `Bao-cao-Workshop02.md`, `Bao-cao-Workshop03.md` |
| Vì sao chọn C-lite | `Danh-gia-chot-huong-sau-W2-v2.md` |
| Học gì | `Lo-trinh-hoc-va-tham-khao.md` |
| Việc cần làm, nhật ký testnet | `Checklist-sau-W2.md` |
| Slide, transcript | `Workshop01/`, `Workshop02/`, `Workshop03/` |

## Nguồn đã đối chiếu ngày 11/11

- Agent Registry: [CIS-8004](https://docs.concordium.com/en/mainnet/technical-reference/agent-registry/cis-8004.html) · [CIS-8 (spec)](https://proposals.concordium.com/CIS/cis-8.html) · [Verified by Concordium badge](https://docs.concordium.com/en/mainnet/technical-reference/agent-registry/concordium-badge.html) · [Agent Card](https://docs.concordium.com/en/mainnet/technical-reference/agent-registry/agent-card.html) · [MCP service](https://docs.concordium.com/en/mainnet/technical-reference/agent-registry/mcp-service.html) (địa chỉ contract testnet lấy từ công cụ `contract_info`)
- Verify & Access: [How it works](https://docs.concordium.com/en/mainnet/how-to/concordium-id/verify-and-access/how-it-works.html) · [Select verification method](https://docs.concordium.com/en/mainnet/how-to/concordium-id/verify-and-access/select-verification-method.html) · [Select Identity Provider](https://docs.concordium.com/en/mainnet/how-to/concordium-id/verify-and-access/select-identity-provider.html) · [Integrate verification flow](https://docs.concordium.com/en/mainnet/how-to/concordium-id/verify-and-access/integrate-verification-flow.html) · [SDK: Verifiable presentations (V1)](https://docs.concordium.com/concordium-node-sdk-js/12.0.0/pages/verifiable-presentations.html)
- Web3 ID: [Create proofs](https://docs.concordium.com/en/mainnet/how-to/web3-id/create-proofs.html) · [Web3 ID issuers](https://docs.concordium.com/en/mainnet/how-to/web3-id/issuer.html) · [CIS-4 (spec)](https://proposals.concordium.com/CIS/cis-4.html) · [SDK: module web3-id](https://docs.concordium.com/concordium-node-sdk-js/12.0.0/modules/web3_id.html) · [SDK: kiểu VerifiablePresentationV1](https://docs.concordium.com/concordium-node-sdk-js/11.1.0-alpha.2/types/wasm.VerifiablePresentationV1.JSON.html) · [SDK: ConcordiumGRPCClient](https://docs.concordium.com/concordium-node-sdk-js/12.0.0/classes/grpc.ConcordiumGRPCClient.html) · công cụ testnet: [issuer frontend](https://web3id-issuer-frontend.testnet.concordium.com/), [proof explorer](https://web3id-proof-explorer.testnet.concordium.com/)
- Khác: [Transactions (Register Data)](https://docs.concordium.com/en/mainnet/learn/transactions/index.html) · [ID attributes reference (Company ID)](https://docs.concordium.com/en/mainnet/technical-reference/id-attributes-reference.html)
- Agent nền: [CNCF: HolmesGPT](https://www.cncf.io/blog/2026/01/07/holmesgpt-agentic-troubleshooting-built-for-the-cloud-native-era/)
