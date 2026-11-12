# Tổng hợp sau Workshop 04 (v4): chốt audit, định vị Locks, bổ sung yêu cầu log

> **Ngày soạn:** 12/11/2026 (sau W4, trước W5)
> **Quan hệ với các bản trước:** bản này thay `Tong-hop-sau-W3-v3.md` làm bản mới nhất. Các bản v1–v3 giữ nguyên để đối chiếu.
> **Điều không đổi:** hướng **C-lite kết hợp**, kiến trúc **4 lớp L1–L4**, năm phép kiểm V1–V5, Approval Binding AB1–AB5, ba mức Core MVP / Target / C-full, thứ tự build, spike S0–S3. Số mục giữ như v3, riêng mục 2 thêm **2.4 Workshop 4** (các mục 2.4, 2.5 cũ thành 2.5, 2.6).
> **Điều thay đổi:** cập nhật theo Workshop 04 (11/11). Chi tiết buổi học ở `Bao-cao-Workshop04.md`. Các mục sửa: 0, 0.1, 1, 2.4 (mới), 2.5, 3.4 (L1, L4), 3.6, 3.10, 4.8, 4.9, 5, 7.1, 7.2, 8, 9.
> **Ký hiệu:** ✅ đã xác nhận trong workshop · 📄 theo tài liệu chính thức, chưa thử thực tế · ⚠️ cần kiểm chứng hoặc rủi ro · ⏸️ tạm dừng · ⭐ quan trọng
> Mốc `[mm:ss]` ghi kèm tên buổi, ví dụ W4 [52:55].

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
| Register Data | Loại giao dịch Concordium ghi tối đa 256 byte lên chain, dùng để neo hash |
| CBOR | Định dạng mã hóa nhị phân gọn (RFC 8949); VRA/VAA dùng nó cho nội dung anchor |

Trong bản đánh giá v2 ngày 06/11 và các trao đổi trước, "(a)" là credential CIS-4 và "(b)" là phiếu giao việc. Từ bản này, phiếu giao việc gọi là L2, còn L3a và L3b là **hai chức năng trong cùng lớp L3**, không phải hai lớp mới.

---

## 0. Tóm tắt một trang

| | |
|---|---|
| **Cuộc thi** | Concordium Trusted Agents Hackathon (Encode × Concordium). Thi solo được. Nộp bài trước **06:59 sáng T5 10/12** (giờ VN) |
| **Chấm điểm** | Depth of integration · credible path to production · it works · usefulness |
| **Hướng đã chốt** | ⭐ **C-lite kết hợp**: agent DevOps của công ty A thao tác trên hạ tầng (mô phỏng) của khách hàng B, qua gateway của B |
| **Chuỗi mục tiêu** | Verified Agent → Verified Organization → Valid Delegation → Verified Employee → Valid Consent → Authorized Execution → Verifiable Audit |
| **W4 đóng được** | **L4:** Register Data là cách neo được khuyến nghị; định dạng anchor theo mẫu VRA/VAA · **Locks:** chỉ có trên devnet, testnet/mainnet từ 01/2027, nên không dùng trong demo |
| **W4 bổ sung** | Trường log theo EU AI Act Điều 12(2) · tách dữ liệu cá nhân để xóa được theo GDPR · hai bài học hardening từ đợt audit CertiK · thiết kế "sẵn sàng cho lock" cho phần thanh toán |
| **Vẫn mở** | G1.1–G1.4, G2 (cần spike) · Global FinReg (W5) · agent nền (hạn **15/11**) · giao tiếp A2A (W6) |
| **Trạng thái của MVP-C** | Vẫn là **ứng viên**, chờ spike S3 |
| **Mốc gần nhất** | **15/11:** chốt agent nền và tuyến phê duyệt · **T2 16/11, 22:00: W5** · T4 18/11: W6 · **23/11: Checkpoint 1** |

---

## 0.1 Thay đổi so với v3

### W4 trả lời được gì cho những điểm còn mở

| Điểm mở trong v3 | W4 trả lời | Trạng thái mới |
|---|---|---|
| **L4:** Register Data, Memo hay Merkle root? | ✅ Diễn giả khuyến nghị Register Data cho audit trail, *"created exactly for this kind of use case… very cheap"* [52:55–53:21]. VRA/VAA của Verify & Access cũng là Register Data, nội dung CBOR `{hash, type, version}` | **Đóng.** Register Data là cách neo chính; anchor của dự án theo cùng mẫu CBOR |
| **Mốc 11/11:** Locks có bản testnet/devnet trước 09/12 không? | ✅ Simple Locks có trên **devnet** (protocol 11); testnet/mainnet dự kiến **01/2027**, Enhanced Locks **03/2027**, thiết kế còn đổi [05:47–06:37] | **Đóng.** Không dùng Locks trong demo (bài nộp phải chạy trên testnet). Giữ ở path to production |
| G1.1–G1.4, G2 | Không được nhắc tới | Vẫn mở; cần spike S2, S3 |
| GF: Global FinReg | Không được nhắc tới | Vẫn mở; W5 (16/11) có tài liệu riêng |
| DA: agent nền | Không | Vẫn mở; hạn 15/11 |
| Câu hỏi về memo (độ dài) | Không | Không còn cần: dự án neo bằng Register Data |

### Những gì W4 bổ sung vào thiết kế

| # | Bổ sung | Nguồn | Mục |
|---|---|---|---|
| 1 | Anchor theo mẫu CBOR `{hash, type, version}` với type riêng của dự án; gateway nhận ra sự kiện thu hồi nhờ type | W4 slide 24 | 3.4 (L4, L2) |
| 2 | Trường log theo Điều 12(2): phiên bản model, nhiệm vụ và người giao, công cụ và quyết định, lỗi, từ chối, can thiệp của con người | W4 slide 16 | 3.4 (L1, L4) |
| 3 | Mỗi bản ghi có **nonce ngẫu nhiên** trước khi băm | W4 slide 17 | 3.4 (L4) |
| 4 | **Tách dữ liệu cá nhân** ra khỏi bản ghi trong chuỗi hash, để xóa được theo GDPR mà không phá chuỗi | W4 slide 18 | 3.4 (L4), 4.8 |
| 5 | Liên kết anchor **tường minh** (chain không tự liên kết VRA với VAA) | W4 [28:42–28:52] | 3.4 (L4), 4.9 |
| 6 | Không để log thành công cụ DoS: gộp các lần từ chối, không neo từng lần từ chối | W4 slide 47 | 3.4 (L4), 3.6 |
| 7 | Giới hạn kích thước mọi đầu vào không tin cậy trước khi phân tích | W4 slide 50 | 3.4 (L1), 3.6 |
| 8 | Phần thanh toán (nếu làm x402) thiết kế "sẵn sàng cho lock" | W4 slide 13 | 3.10 |
| 9 | Phạm vi EU AI Act: chỉ rủi ro cao, từ 2/12/2027; nói đúng khi nào use case thuộc diện này | W4 slide 15 | 3.10 |

### Một nhận xét về Locks so với thiết kế C-lite

Simple Lock và phiếu giao việc (L2) có cùng cấu trúc: chủ tạo và cấp, agent chỉ được làm trong giới hạn, có hạn dùng, **không sửa được sau khi tạo** (muốn đổi thì thu hồi và cấp mới), ai cũng dọn được khi hết hạn. Điều này củng cố thiết kế L2. Khác biệt: Lock là **cưỡng chế on-chain cho thanh toán PLT**; phiếu giao việc là **ủy quyền cho thao tác vận hành**, được gateway của B cưỡng chế off-chain. Vì vậy Locks không thay được L2, chỉ bổ sung cho phần thanh toán.

### Giữ nguyên

Hướng C-lite kết hợp · use case Enterprise DevOps A → B · kiến trúc L1–L4 · V1–V5 · AB1–AB5 · ZKP + commitment + consent · gateway của B tự kiểm policy · MVP-C / MVP-T · agent chạy off-chain · hạ tầng B mô phỏng · không phụ thuộc Agent IDP và Locks · thứ tự build L1 → L2 → L4 → L3b → L3a · spike S0–S3 · C-full là hướng dài hạn.

Bảng đánh giá các đợt góp ý trước nằm ở mục 0.1 của v2 và v3.

---

## 1. Thể lệ và mốc thời gian

| Ngày (giờ VN) | Sự kiện | Trạng thái |
|---|---|---|
| 02/11, 04/11, 09/11, 11/11 | W1, W2, W3, W4 | ✅ Có báo cáo |
| **15/11** | Hạn chốt agent nền và tuyến phê duyệt | ⏳ |
| **T2 16/11, 22:00** | **W5**: Ship to production, adopting blockchain without crypto (Global FinReg và LEI, ví, sponsored transactions) | ⏳ |
| T4 18/11, 22:00 | W6: MCP, A2A, Agent Card | ⏳ |
| T5 19/11 | Mở giai đoạn build | |
| **06:59 sáng T2 23/11** | **Checkpoint 1** | ⏳ |
| 24/11 – 08/12 | Office hours T3 và T6, 22:00 | |
| **06:59 sáng T5 10/12** | **Nộp bài cuối** | |

- **Yêu cầu tối thiểu:** chạy trên testnet; dùng **có ý nghĩa ít nhất một** thành phần Concordium.
- **Bài nộp:** mô tả · repo public · video ≤ 3 phút · link CCDExplorer · path to production.
- **Chấm:** depth of integration (*how meaningfully*) · credible path to production · it works · usefulness.
- **Giải:** cơ hội nhận grant từ quỹ 75M CCD + merch. **Cập nhật W4** [57:24–57:52]: sẽ có **CCD thưởng cho top 3**, và quyền xét grant **có lẽ dành cho hạng nhất**. ⚠️ Chưa chính thức; Encode sẽ thông báo trên Discord và bản tin tuần.

---

## 2. Kiến thức từ 4 workshop

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

### 2.4 Workshop 4 (11/11): giữ agent trong khuôn khổ và trong luật

| Điều quan trọng | Nguồn |
|---|---|
| Hôm nay giới hạn cứng duy nhất là **số dư account của agent**. Spend controls của x402, allow/deny list của token, sponsor từ chối ký đều không phải giới hạn cứng cho ngân sách của bạn | W4 slide 04 |
| **Protocol-Level Locks**: Simple Locks 01/2027, Enhanced Locks 03/2027; **hiện chỉ có trên devnet**; thiết kế còn đổi | W4 slide 05–06, [05:47–06:37] |
| Simple Lock: tiền nằm trong account của chủ; chỉ gửi cho recipients đã liệt kê, trong hạn, tới số đã khóa; năm thao tác cần grant; không sửa được; hết hạn thì ai cũng cancel được | W4 slide 07–10 |
| Chuẩn bị ngay: account riêng số dư nhỏ cho agent · spend controls x402 · danh sách đối tác trong cấu hình | W4 slide 13 |
| EU AI Act Điều 12: **chỉ hệ thống rủi ro cao**, từ **2/12/2027**, giữ log ≥ 6 tháng; *"Most agents are not high-risk"* | W4 slide 15 |
| Trường log theo Điều 12(2): khi nào, agent, model · nhiệm vụ và người giao · công cụ và quyết định · thanh toán · lỗi, từ chối, can thiệp | W4 slide 16 |
| Log off-chain, hash kèm nonce on-chain; xóa log và nonce là hash hết ý nghĩa | W4 slide 17–18 |
| ⭐ **Register Data được khuyến nghị cho audit trail**; VRA/VAA cũng là Register Data, CBOR `{hash, type, version}` | W4 slide 23–24, [52:55–53:21] |
| Đợt audit CertiK: 13 phát hiện, không phát hiện nào lấy được tiền; bài học về giới hạn kích thước đầu vào và log gây DoS | W4 slide 25–29, 31–54 |

### 2.5 Bản đồ thành phần theo trạng thái

| Thành phần | Trạng thái | Dùng trong dự án |
|---|---|---|
| Agent Registry CIS-8004, badge, MCP hosted | ✅ Testnet: contract `<12802,0>` | L1 |
| CIS-8 External Key Registry | ✅ Testnet: contract `<12801,0>`; spec còn là draft | L1 |
| Concordium ID, Verify & Access, consent, VRA/VAA | ✅ Testnet | L3b |
| Register Data | ✅ Loại giao dịch chuẩn, ≤ 256 byte; W4 khuyến nghị cho audit trail và demo trên testnet | L2, L4 |
| Web3 ID / CIS-4 | 📄 Có công cụ testnet (issuer frontend, proof explorer, verifier) đang phản hồi ngày 11/11; ví của bạn có menu "Web3 ID" | L3a |
| Sponsored transactions | ✅ Testnet | Tùy chọn (phí) |
| Company ID qua Global FinReg | ⏸️ Testnet đòi Sign In / KYB; chờ W5 | Organization Verification |
| PLT / x402 | ✅ Testnet, phải tự chạy facilitator | Tùy chọn |
| Agent IDP | ❌ Devnet | Không dùng |
| Protocol-Level Locks | ❌ Chỉ devnet (protocol 11); Simple 01/2027, Enhanced 03/2027 (W4) | Path to production (thanh toán) |
| Verify & Pay cho agent, Concordium Signer | ❌ 2027 | Path to production |

### 2.6 Kết quả đối chiếu tài liệu (11/11) 📄

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
| 11/11 (v3) | Giữ hướng; siết holder binding, consent binding, schema phiếu, thu hồi, audit |
| **12/11 (v4, bản này)** | Giữ hướng; cập nhật theo W4: chốt Register Data, định dạng anchor, trường log, GDPR, Locks |

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
                 agent_runtime: { model, version },   // tự khai, chỉ để log (W4 slide 16)
                 request_id (ngẫu nhiên 128 bit), issued_at, expires_at (≤ 60 giây) }
signature    = Ký bằng key CIS-8 trên: "CLITE-GW/v1/request" ‖ dạng chuẩn hóa của AgentRequest
```

Gateway kiểm: chữ ký đúng key của agent · `audience` đúng là mình · còn hạn.

**Giới hạn kích thước trước khi phân tích** (bài học từ đợt audit, W4 slide 50): đặt trần cho kích thước request, phiếu giao việc, presentation, JSON và CBOR; không cấp phát bộ nhớ theo con số do bên gửi khai. Vượt trần thì từ chối ngay, không phân tích tiếp.

`agent_runtime` do agent tự khai, gateway **không tin** nó để ra quyết định; nó chỉ được ghi vào log để đáp ứng mục đích 12(2)(a) "phát hiện thay đổi đáng kể".

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
| Sự kiện thu hồi | Giao dịch Register Data do **account A** gửi, nội dung CBOR có `type: "CLITE-WOREV"` và `wo_hash`, đã finalized (định dạng ở mục L4) |
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

**Giữ nguyên:** log có cấu trúc off-chain, neo hash bằng **Register Data** (W4 xác nhận đây là cách được khuyến nghị).

**Các loại bản ghi** (mỗi bản ghi chứa hash của bản ghi trước):

| Loại | Nội dung | Mục đích theo Điều 12(2) (W4 slide 16) |
|---|---|---|
| `request` | Hash của request đã ký, thời điểm nhận, agent, `agent_runtime` (model, phiên bản) | (a) phát hiện rủi ro và thay đổi đáng kể |
| `decision` | allow / deny / needs_approval, kết quả năm phép kiểm, mã lý do, work order (nhiệm vụ và người giao) | (a), (c) |
| `approval` | Approval digest, kết quả phê duyệt, mã giao dịch VRA/VAA nếu có | (a) can thiệp của con người |
| `execution` | Bắt đầu / thành công / thất bại, hash của kết quả | (a), (b) |
| `revocation` | Sự kiện thu hồi đã đọc từ chain | (c) |
| `payment` (nếu làm x402) | Số tiền, người nhận, mã giao dịch | (b), (c) |

**Mỗi bản ghi có một nonce ngẫu nhiên ≥ 128 bit** trước khi băm (W4 slide 17). Nhiều bản ghi có nội dung đoán được (ví dụ "deny" cho một request đã biết); không có nonce thì ai có hash cũng thử ra được nội dung.

**Tách dữ liệu cá nhân (để xóa được theo GDPR):**

| Phần | Chứa gì | Có xóa được không |
|---|---|---|
| **Bản ghi trong chuỗi** | Các trường ở bảng trên **trừ** dữ liệu cá nhân, cộng `pii_ref = SHA-256(pii_blob ‖ pii_nonce)` | Không; đây là thứ được neo |
| **`pii_blob`** | Định danh của người duyệt (`credId`, public key của credential), salt của commitment, presentation đầy đủ, các giá trị đã reveal | **Có**: khi hết thời hạn lưu, xóa `pii_blob` và `pii_nonce` |

Chuỗi hash và các anchor vẫn kiểm được sau khi xóa, vì bản ghi trong chuỗi không đổi. Chỉ phần dữ liệu cá nhân không còn chứng minh lại được. Tạm đặt thời hạn lưu ≥ 6 tháng theo mốc của Điều 26(6) ⚠️ (dự án không tư vấn pháp lý).

**Định dạng anchor** (theo mẫu VRA/VAA, W4 slide 24): Register Data chứa CBOR

```text
{ "type": "CLITE-AUD" | "CLITE-WO" | "CLITE-WOREV", "version": 1,
  "hash": <32 byte>, "seq": <số thứ tự, chỉ với CLITE-AUD> }
```

| Type | Ai gửi | Hash của |
|---|---|---|
| `CLITE-WO` | Account A | Work order (`wo_hash`) |
| `CLITE-WOREV` | Account A | Work order bị thu hồi |
| `CLITE-AUD` | Account gateway B | Bản ghi mới nhất trong chuỗi (hoặc gốc lô) |

Toàn bộ dưới 256 byte. Nhờ có `type`, gateway lọc được sự kiện thu hồi khi theo dõi chain (mục L2). Cần kiểm chứng trong spike S1 ⚠️.

**Liên kết tường minh:** chain không tự liên kết các anchor (VRA và VAA chỉ *"very likely belong together"* vì cùng người gửi và gần thời điểm, W4 [28:42–28:52]). Vì vậy:
- Bản ghi `approval` ghi rõ mã giao dịch VRA/VAA.
- Mỗi `CLITE-AUD` chứa hash của bản ghi mới nhất, bản ghi đó chứa hash của bản ghi trước: một anchor bao luôn toàn bộ lịch sử trước nó.

**Ba trạng thái, không gộp:**

```text
Execution Completed  →  Audit Recorded  →  Anchor Finalized
(thao tác đã chạy)      (đã ghi log bền)    (giao dịch neo đã finalized)
```

Một hành động chỉ được gọi là "có bằng chứng on-chain" khi đã tới **Anchor Finalized**.

**Quy tắc xử lý:**

| Tình huống | Xử lý |
|---|---|
| Không ghi được bản ghi `decision` | **Không thực thi** (fail-closed) |
| Thao tác mức 2 | **Neo bản ghi `decision` và chờ finalized rồi mới thực thi** |
| Thực thi xong, ghi `execution` lỗi | Thử ghi lại; trong lúc đó không nhận thao tác mới của agent này |
| Thực thi xong, giao dịch neo thất bại hoặc chưa finalized | `anchor_status` = `pending` / `submitted` / `finalized` / `failed`; hàng đợi tự gửi lại; một anchor thành công về sau bao luôn các bản ghi trước |
| Tồn đọng anchor vượt ngưỡng | Dừng thao tác mức 2 cho đến khi neo được |
| **Nhiều request bị từ chối liên tiếp** (có thể là tấn công) | **Không neo từng lần.** Ghi log gộp (đếm theo agent, mã lý do, khoảng thời gian); không ghi nguyên dữ liệu do bên gửi cung cấp; anchor kế tiếp bao luôn bản ghi gộp (bài học "log thành DoS", W4 slide 47) |
| Biên nhận trả cho agent | Ghi **đúng trạng thái**: biên nhận tạm (đã ghi log, chưa neo) và biên nhận cuối (kèm mã giao dịch đã finalized) |
| Gateway khởi động lại | Đọc hàng đợi, neo tiếp những bản ghi còn `pending` |

**Các phần khác:**
- **Biên nhận có chữ ký** của gateway giúp A cũng giữ bằng chứng.
- **Công cụ kiểm tra toàn vẹn** tính lại chuỗi hash và so với anchor on-chain; báo riêng những bản ghi chưa được anchor nào bao phủ, và những `pii_blob` đã bị xóa.
- **Bảo vệ metadata:** chỉ neo hash hoặc gốc lô; không ghi tên thao tác, tên khách hàng, định danh kỹ sư dạng đọc được lên chain.

| Cách neo | Bản chất | Dùng khi |
|---|---|---|
| **Register Data** | Loại giao dịch riêng để ghi ≤ 256 byte; không chuyển tiền; được khuyến nghị cho audit (W4) | **Chính**: work order, thu hồi, audit |
| Memo | Chuỗi kèm một lệnh chuyển CCD hoặc PLT | Chỉ khi có thanh toán thật |
| VRA / VAA | Anchor do verifier của Verify & Access tạo (cũng là Register Data) | Tự có khi L3b đi qua Verify & Access |
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
| **23** | Request, presentation hoặc CBOR quá lớn hoặc hỏng | L1: từ chối trước khi phân tích, không cấp phát theo kích thước do bên gửi khai |
| **24** | Gửi dồn dập request sai để làm đầy log | L4: log gộp, không neo từng lần, gateway vẫn phục vụ request hợp lệ |

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
- **EU AI Act, nói đúng phạm vi** (W4 slide 15): Điều 12 chỉ áp dụng cho hệ thống AI **rủi ro cao**, từ **2/12/2027**, log giữ ≥ 6 tháng. *"Most agents are not high-risk."* Agent DevOps **chỉ có thể** thuộc diện rủi ro cao khi B vận hành **hạ tầng trọng yếu** ⚠️ (cần đánh giá pháp lý). Cách nói trong bài nộp: dự án **ghi log theo đúng các mục đích của Điều 12(2)** và **hướng tới hỗ trợ** khách hàng thuộc diện rủi ro cao; với các khách hàng còn lại, đây là thực hành tốt có chi phí thấp. Không nói "đạt chuẩn EU AI Act".
- **Khác biệt với Microsoft Entra Agent ID / AWS:** xuyên tổ chức, kiểm chứng công khai, tiết lộ có chọn lọc.
- **Nền tảng:** đợt audit chain của CertiK (12/2025 – 05/2026): 13 phát hiện, không phát hiện nào lấy được tiền; báo cáo công khai (W4 slide 25–27).
- **Thanh toán (nếu làm x402), thiết kế "sẵn sàng cho lock"** (W4 slide 13):

| Hôm nay | Từ 01/2027 (Simple Locks) |
|---|---|
| Agent có account riêng, số dư nhỏ, key riêng; tiền của A ở account khác | A tạo lock, fund, cấp **send grant** cho agent; A giữ release |
| Spend controls của x402 (token được phép, trần mỗi lần trả) | Số tiền khóa trong lock |
| Danh sách người nhận được phép lưu trong cấu hình | `recipients` của lock |
| Hạn dùng của phiếu giao việc | `expiry` của lock |

Lock không sửa được sau khi tạo, giống phiếu giao việc: muốn đổi thì release hoặc cancel rồi tạo lock mới.

- **Enhanced Locks (03/2027):** một smart contract trả lời có/không cho từng thao tác chi tiêu (hạn mức theo ngày, điều kiện thời gian). Đây là đường để một phần policy của gateway (phần liên quan tới tiền) chuyển lên chain.
- **C-full (dài hạn):** ràng buộc phê duyệt hoàn toàn bằng mật mã · sổ trạng thái on-chain cho work order · Locks cho thanh toán · Verify & Pay cho agent · Concordium Signer giữ key ngoài agent · Company ID thật trên mainnet · EURQ cho thanh toán dịch vụ.

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
| Audit log (bản ghi trong chuỗi, không chứa dữ liệu cá nhân) | Off-chain, B | B; A giữ biên nhận |
| `pii_blob`: định danh người duyệt, salt, presentation | Off-chain, B, có thời hạn lưu | B; **xóa được** khi hết hạn lưu mà không phá chuỗi hash (mục 3.4, L4) |
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
| **Audit anchor** | Chứng minh toàn vẹn và thời điểm của những gì **đã neo xong**; không chứng minh nội dung đúng hay đủ. Chain không tự liên kết các anchor với nhau; liên kết phải nằm trong nội dung đã neo |
| **Xóa theo GDPR** | Hash trên chain không xóa được; chỉ hết ý nghĩa khi nonce thật sự ngẫu nhiên và không bị lộ (W4 slide 18). Không phải tư vấn pháp lý |
| **Locks (sau này)** | Chỉ cưỡng chế thanh toán PLT; không thay được ủy quyền cho thao tác vận hành |
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
| ~~**L4**~~ | ~~Register Data, Memo hay Merkle root?~~ | ✅ | **Đóng ở W4:** Register Data được khuyến nghị cho audit; anchor CBOR theo mẫu VRA/VAA | Spike S1 kiểm định dạng |
| ~~**LK**~~ | ~~Locks có dùng được trước 09/12 không?~~ | ✅ | **Đóng ở W4:** chỉ devnet; testnet/mainnet 01/2027 | Không dùng trong demo |
| **EU** | Use case có thuộc diện "rủi ro cao" của EU AI Act không? | P2 | W4: chỉ rủi ro cao, ví dụ hạ tầng trọng yếu; *"most agents are not high-risk"* | Ghi đúng phạm vi trong path to production (3.10); không cần chốt trước khi build |
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
| Đối chiếu 10 vấn đề với tài liệu Concordium (11/11) | ✅ Mục 2.6 |
| Rà lại thiết kế theo 9 điểm góp ý về v2 (11/11) | ✅ v3 |
| Báo cáo Workshop 04; cập nhật thiết kế theo W4 (12/11) | ✅ `Bao-cao-Workshop04.md`, bản này |
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
| **S1** | Gửi Register Data chứa **CBOR `{type, version, hash}`** (mẫu VRA/VAA) bằng ví dụ `v2_register_data.rs` của Rust SDK hoặc bản tương đương trong JS SDK; đọc lại theo mã giao dịch; kiểm account gửi và nội dung. **Thêm:** theo dõi block finalized để bắt Register Data có `type` cho trước của một account; mô phỏng anchor thất bại (thiếu CCD, giao dịch hết hạn) và mất kết nối node; thử xóa một `pii_blob` rồi chạy công cụ kiểm tra toàn vẹn | 0,5–1 ngày | Có link CCDExplorer hiển thị đúng CBOR; script bắt được sự kiện từ chain trong vài giây; gateway giả từ chối khi dữ liệu quá cũ; anchor lỗi được ghi `failed` và neo lại được; chuỗi hash vẫn kiểm được sau khi xóa `pii_blob` | L4, R1, test 21, 22, 24 |
| **S2** | Web3 ID: tạo registry, cấp credential vào ví, tạo proof, xác minh, thu hồi rồi thử lại. **Thêm:** đọc presentation thật để ghi lại định danh của holder và mọi dữ liệu lộ ra | 1 ngày | Trả lời có / không cho G1.1, G1.2; có danh sách trường lộ ra trong presentation | G1.1, G1.2, G2 |
| **S3b** | Approval với hai credential: (a) presentation hỗn hợp từ **cùng một ví**; (b) presentation hỗn hợp ghép account credential của ví 1 với credential nhân viên của ví 2 (dựng bằng SDK); (c) thử cách (ii): cả hai định danh mở đúng một commitment | 1 ngày | Biết verifier **chấp nhận hay từ chối** trường hợp hai holder; chọn được cách đạt AB2; chọn MVP-C hoặc MVP-T | G1.3, AB2, test 18 |

Kết quả mỗi spike ghi vào `Checklist-sau-W2.md`: đạt hay không, bằng chứng (ảnh, mã giao dịch, đoạn JSON), và quyết định kéo theo.

### 7.2 Mốc quyết định

| Ngày | Quyết định |
|---|---|
| ~~11/11 (W4)~~ | ✅ **Đã chốt:** neo audit bằng Register Data, anchor CBOR theo mẫu VRA/VAA · Locks chỉ có trên devnet, không dùng trong demo |
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

Giữ nguyên `Lo-trinh-hoc-va-tham-khao.md`. Bổ sung theo v3 và v4:

| Chủ đề | Đọc | Dùng cho |
|---|---|---|
| Chuẩn hóa JSON để băm và ký | JCS (RFC 8785) | Work order, request, digest |
| Token ủy quyền có audience, hạn, định danh | JWT (RFC 7519) các trường `aud`, `exp`, `nbf`, `jti`; RFC 8693 | Mandate schema |
| Ký thông điệp có tách miền | EIP-191, EIP-712; phần "Canonical signed message" của CIS-8 | Request envelope |
| Thu hồi | Mô hình trạng thái của CIS-4; so với danh sách thu hồi kiểu CRL | L2, L3a |
| Mô hình đe dọa | STRIDE (mức tổng quan) | Mục 4 |
| **Định dạng anchor** | CBOR (RFC 8949); `concordium-base/.../web3id/v1/anchor.rs`; ví dụ `concordium-rust-sdk/examples/v2_register_data.rs` | L4, spike S1 |
| **Ghi log theo luật** | EU AI Act Điều 12, 19, 26 (CELEX 32024R1689); Regulation 2026/1744 cho mốc ngày | L4, path to production |
| **Blockchain và GDPR** | EDPB Guidelines 02/2025 về blockchain (tr. 12); GDPR Điều 17 | Tách dữ liệu cá nhân ở L4 |
| **Locks** | Code Simple Locks trên nhánh `release/p11` của `concordium-base` và `concordium-node` | Path to production |
| **Hardening** | Báo cáo audit CertiK (trang security của Concordium); bộ slide phụ của W4 | Gateway |

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
| Xung đột giữa anchor không xóa được và quyền xóa dữ liệu (GDPR) | Trung bình | Tách `pii_blob` có nonce riêng; chỉ neo bản ghi không chứa dữ liệu cá nhân |
| Bài nộp nói quá về EU AI Act | Trung bình | Nói đúng phạm vi (3.10); không dùng từ "đạt chuẩn" |
| Log bị dùng để tấn công từ chối dịch vụ, hoặc làm tốn phí neo | Thấp–Trung bình | Giới hạn kích thước đầu vào; gộp log từ chối; không neo từng lần từ chối |
| Trình bày Locks như tính năng đã chạy | Thấp | Ghi rõ "devnet, dự kiến 01/2027" ở mọi chỗ nhắc tới |

---

## 10. Chỉ mục tài liệu

| Muốn tìm | Đọc |
|---|---|
| Các bản tổng hợp trước | `Tong-hop-sau-W3-v3.md` (v3, đánh giá 9 điểm góp ý về v2) · `Tong-hop-sau-W3-v2.md` (v2, đánh giá 10 vấn đề của đợt góp ý đầu) · `Tong-hop-sau-W3.md` (v1) |
| Chi tiết từng buổi | `Bao-cao-Workshop01.md` đến `Bao-cao-Workshop04.md` |
| Vì sao chọn C-lite | `Danh-gia-chot-huong-sau-W2-v2.md` |
| Học gì | `Lo-trinh-hoc-va-tham-khao.md` |
| Việc cần làm, nhật ký testnet | `Checklist-sau-W2.md` |
| Slide, transcript | `Workshop01/` đến `Workshop04/` |

## Nguồn

- Workshop 04: `Bao-cao-Workshop04.md`, `Workshop04/slides/`, `Workshop04/Workshop-04-transcript-EN.txt`

### Nguồn đã đối chiếu ngày 11/11

- Agent Registry: [CIS-8004](https://docs.concordium.com/en/mainnet/technical-reference/agent-registry/cis-8004.html) · [CIS-8 (spec)](https://proposals.concordium.com/CIS/cis-8.html) · [Verified by Concordium badge](https://docs.concordium.com/en/mainnet/technical-reference/agent-registry/concordium-badge.html) · [Agent Card](https://docs.concordium.com/en/mainnet/technical-reference/agent-registry/agent-card.html) · [MCP service](https://docs.concordium.com/en/mainnet/technical-reference/agent-registry/mcp-service.html) (địa chỉ contract testnet lấy từ công cụ `contract_info`)
- Verify & Access: [How it works](https://docs.concordium.com/en/mainnet/how-to/concordium-id/verify-and-access/how-it-works.html) · [Select verification method](https://docs.concordium.com/en/mainnet/how-to/concordium-id/verify-and-access/select-verification-method.html) · [Select Identity Provider](https://docs.concordium.com/en/mainnet/how-to/concordium-id/verify-and-access/select-identity-provider.html) · [Integrate verification flow](https://docs.concordium.com/en/mainnet/how-to/concordium-id/verify-and-access/integrate-verification-flow.html) · [SDK: Verifiable presentations (V1)](https://docs.concordium.com/concordium-node-sdk-js/12.0.0/pages/verifiable-presentations.html)
- Web3 ID: [Create proofs](https://docs.concordium.com/en/mainnet/how-to/web3-id/create-proofs.html) · [Web3 ID issuers](https://docs.concordium.com/en/mainnet/how-to/web3-id/issuer.html) · [CIS-4 (spec)](https://proposals.concordium.com/CIS/cis-4.html) · [SDK: module web3-id](https://docs.concordium.com/concordium-node-sdk-js/12.0.0/modules/web3_id.html) · [SDK: kiểu VerifiablePresentationV1](https://docs.concordium.com/concordium-node-sdk-js/11.1.0-alpha.2/types/wasm.VerifiablePresentationV1.JSON.html) · [SDK: ConcordiumGRPCClient](https://docs.concordium.com/concordium-node-sdk-js/12.0.0/classes/grpc.ConcordiumGRPCClient.html) · công cụ testnet: [issuer frontend](https://web3id-issuer-frontend.testnet.concordium.com/), [proof explorer](https://web3id-proof-explorer.testnet.concordium.com/)
- Khác: [Transactions (Register Data)](https://docs.concordium.com/en/mainnet/learn/transactions/index.html) · [ID attributes reference (Company ID)](https://docs.concordium.com/en/mainnet/technical-reference/id-attributes-reference.html)
- Agent nền: [CNCF: HolmesGPT](https://www.cncf.io/blog/2026/01/07/holmesgpt-agentic-troubleshooting-built-for-the-cloud-native-era/)
