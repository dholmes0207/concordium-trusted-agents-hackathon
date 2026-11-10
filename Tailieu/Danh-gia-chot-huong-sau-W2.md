# Đánh giá chốt hướng nghiên cứu sau Workshop 02

> **Ngày soạn:** 05/11/2026
> **Câu hỏi cần trả lời:** Thông tin đến hết Workshop 02 đã đủ để chốt hướng nghiên cứu chưa?
> **Nguồn:** `Bao-cao-Workshop01.md`, `Bao-cao-Workshop02.md`, transcript và slide của cả hai buổi, research trong `Research-Hackathon/`. Mốc `[mm:ss]` trong báo cáo này là của **video Workshop 02** (`Workshop02/Workshop-02-transcript-EN.txt`), trừ khi ghi rõ W1.
> Báo cáo này **không sửa** các báo cáo cũ; nó chỉ tổng hợp và ra quyết định.

---

## 0. Kết luận ngắn

1. **Đủ để chốt HƯỚNG, chưa đủ để chốt SCOPE kỹ thuật.** Workshop 02 trả lời được câu hỏi lớn nhất còn mở sau W1 (agent được xác minh thế nào, giữa các agent với nhau ra sao), và CTO đã nói khá rõ giám khảo muốn thấy gì. Phần còn thiếu (thanh toán, audit trail, MCP/A2A) chỉ ảnh hưởng đến *cách làm*, không làm đổi *hướng*.
2. **Hướng đề xuất: gộp Hướng A (Agent Consent) và Hướng B (Trust Gateway) thành một**, tạm gọi là **MandateOS: ủy quyền có kiểm chứng cho giao dịch agent ↔ agent**. Agent của người dùng và agent của doanh nghiệp xác minh lẫn nhau, mọi hành động phải nằm trong một *mandate* do người dùng cấp, hành động vượt ngưỡng cần consent qua ID App, và tất cả để lại anchor on-chain.
3. **Bỏ Hướng C (Enterprise Delegation)** khỏi MVP. Giữ lại một phần ý tưởng: bên doanh nghiệp dùng identity Global FinReg trên testnet.
4. **Còn một việc phải làm trước khi chốt hẳn:** thể lệ yêu cầu *"Concordium is integrated into your existing project"* (slide 07, W1). Cần xác định **dự án/agent có sẵn nào** sẽ được gắn hướng này vào (mục 6).

---

## 1. Tiêu chí dùng để đánh giá

| # | Tiêu chí | Nguồn |
|---|---|---|
| T1 | **Integration depth**: nhiều primitive, dùng đúng chỗ, chạy thật trên testnet | Thông báo chính thức 02/11 |
| T2 | **Credible path to production**: có người dùng thật, đi tiếp ra mainnet được | Thông báo chính thức 02/11, slide 07 W1 |
| T3 | **Khớp điều CTO nói muốn thấy**: anchor on-chain, agent doanh nghiệp ↔ agent cá nhân, ZK thuộc tính, thanh toán, consent | Q&A [64:05–66:03] |
| T4 | **Lấp đúng khoảng trống Concordium chưa làm**: badge không chứng minh quyền chi tiêu/hành động | Slide 10, [18:37–19:30] |
| T5 | **Làm được solo trong ~3 tuần build** (19/11 → 09/12), không phụ thuộc tính năng chưa ra | Thể lệ, slide 11 |
| T6 | **Khác biệt với đối thủ đã thấy** (Trifecta Checker, SellerPilot) | `Bao-cao-Workshop02.md` mục 8, `Tong-hop-...md` |

---

## 2. Workshop 02 đã trả lời được những câu hỏi nào từ W1?

Sáu câu hỏi mang từ W1 (`Bao-cao-Workshop01.md` mục 23):

| Câu hỏi từ W1 | Trả lời ở W2 | Trạng thái |
|---|---|---|
| Agent Identity được phát hành và quản lý thế nào? | Đăng ký vào **CIS-8004** → mint NFT cho agent, account của owner ký. Agent Card (JSON chuẩn A2A) được neo bằng hash on-chain [12:33–14:00] | ✅ Đã rõ |
| Agent Registry liên kết với chủ sở hữu ra sao? | NFT nằm trong account Concordium có danh tính của owner. Có thể **ZK reveal** tên công ty hoặc tên người để chứng minh "agent này là của X" [13:17–13:32], [56:24–57:02] | ✅ Đã rõ |
| Agent Card và endpoint được kiểm tra thế nào? | Hash của card nằm on-chain; badge có **verification URL**; bên kia đối chiếu badge, owner, trạng thái active (slide 12). Agent chứng minh "đúng là tôi" bằng **ký nonce mới bằng key CIS-8** (slide 14, 15) | ✅ Đã rõ |
| Agent có được ủy quyền tự động không? | **Không có sẵn.** Slide 10: badge *"does not automatically prove permission to spend or act"*. *"Permissions and agent behaviour still need controls."* | ⭐ Đây là khoảng trống, dự án phải tự xây |
| Quyền của Agent được thu hồi thế nào? | Chỉ có **revoke cả agent** (owner ký, badge fail ngay) [34:17–34:43]. Không có thu hồi từng quyền nhỏ | 🟡 Một phần; quyền chi tiết phải tự xây |
| Agent có tự dùng credential/ZKP mà không cần người duyệt từng lần không? | Có, qua **Agent IDP** (người dùng chỉ tiết lộ một vài thuộc tính cho agent). Nhưng slide 11 ghi **"DEVNET / IN DEVELOPMENT … not a production capability to depend on today"** [19:58], [25:26–25:40] | ⚠️ Có nhưng không được phụ thuộc |

Thêm hai thông tin W2 làm thay đổi đánh giá:

- **Consent và statement ghép được trong cùng một yêu cầu.** Ở [09:15–09:39], CTO bật thêm điều kiện "trên 18 tuổi" vào consent request, và identity không đạt bị từ chối ngay. Một lần quét QR có thể vừa xin consent vừa xin ZK proof.
- **Phân biệt được account của agent và account của người** dựa trên IDP đã cấp [23:30–24:26]. CTO gợi ý dùng điều này làm guardrail kiểu "agent đang tiêu tiền hay người đang tiêu tiền".

---

## 3. Đánh giá lại ba hướng với dữ kiện mới

### Hướng A: Verifiable Agent Consent

- **Điểm cộng mới:** consent được demo lại thành công trên Android, và ghép được với statement [07:41–09:39].
- **Điểm trừ:** nếu chỉ có consent thì tích hợp mỏng (T1 yếu), và không có phần "agent ↔ agent" mà CTO nhắc tới (T3 thiếu một nửa).
- **Lưu ý kỹ thuật:** bản test ID App có lỗi UI: consent **không kèm statement** vẫn cho chọn identity chưa đủ tuổi [08:36–09:17]. Khi demo, **luôn kèm ít nhất một statement**.

### Hướng B: Cross-Organization Agent Trust Gateway

- **Điểm cộng mới:** W2 cung cấp gần đủ công cụ: resolve badge/owner/active (slide 12), challenge–response bằng key CIS-8 (slide 15), MCP hosted 40 tool chạy được ngay [41:24], [57:53–58:11]. Rủi ro "phụ thuộc W2" trong bảng của W1 **đã hết**.
- **Điểm trừ:** nếu chỉ là cổng kiểm badge thì dễ thành "registry/badge clone", hướng research đã khuyên tránh. Đã có đối thủ cùng kiểu "gatekeeper" (Trifecta Checker, chặn bằng HTTP 403) (T6 yếu).

### Hướng C: Privacy-Preserving Enterprise Delegation

- **Điểm cộng mới:** testnet có sẵn IDP doanh nghiệp **Global FinReg** [04:03], nên không cần tự chạy IDP riêng (vốn cần governance committee duyệt, W1 [49:52–50:18]).
- **Điểm trừ:** phần "ủy quyền theo từng nhân viên" cần credential riêng và cơ chế thu hồi; cách làm agent tự giữ một phần danh tính lại dựa vào Agent IDP (devnet). Quá nặng cho solo (T5 yếu).

### Bảng chấm (đánh giá của mình, thang 1–5)

| Tiêu chí | A: Consent | B: Gateway | C: Enterprise | **A+B gộp** |
|---|---|---|---|---|
| T1 Integration depth | 2 | 3 | 4 | **5** |
| T2 Path to production | 3 | 3 | 4 | **4** |
| T3 Khớp gợi ý CTO | 3 | 3 | 3 | **5** |
| T4 Lấp khoảng trống slide 10 | 4 | 2 | 4 | **5** |
| T5 Làm được solo | 5 | 4 | 2 | **3–4** (nếu giữ scope chặt) |
| T6 Khác biệt đối thủ | 3 | 2 | 4 | **4** |
| **Tổng** | 20 | 17 | 21 | **26–27** |

Hướng C có điểm tổng không thấp, nhưng **T5 = 2** là điểm chặn: làm không kịp thì các điểm khác không còn ý nghĩa.

---

## 4. Hướng đề xuất: MandateOS (gộp A + B)

### 4.1 Bài toán

Agent đã có danh tính (badge), nhưng **danh tính không phải quyền hạn** (slide 10). Khi agent của người dùng giao dịch với agent của doanh nghiệp:
- Người dùng cần biết agent kia **đúng là của doanh nghiệp thật**, không phải agent mạo danh.
- Doanh nghiệp cần biết agent này **đang hành động thay một người thật**, người đó **đủ điều kiện** (ví dụ trên 18 tuổi) và **đã cho phép** đúng giao dịch này.
- Cả hai cần **bằng chứng không chối cãi được** khi có tranh chấp sau vài tháng.

Đây gần như nguyên văn ví dụ đi chợ hộ mà CTO đưa ra [65:08–66:03], và cũng là hướng MandateOS trong research trước cuộc thi (tách *identity* khỏi *authority*, có AP2 của Google làm bằng chứng thị trường).

### 4.2 Luồng chính (demo trên testnet)

```text
NGƯỜI DÙNG (Test IDP)                         DOANH NGHIỆP (Global FinReg)
      │ ① cấp mandate: ngân sách, danh mục,           │
      │   merchant đã verify, hạn dùng                │
      │   (người dùng ký, hash neo on-chain)          │
      ▼                                               ▼
 AGENT CÁ NHÂN  ──── ② tra registry: badge, owner, active ────▶  AGENT DOANH NGHIỆP
 (badge + key CIS-8)  ◀── ③ challenge–response nonce hai chiều ──▶ (badge + key CIS-8)
      │                                               │
      │ ④ báo giá / giỏ hàng                          │
      │◀──────────────────────────────────────────────┘
      │
      ├─ ⑤ Policy engine kiểm tra mandate:
      │     trong ngưỡng → tự chạy
      │     vượt ngưỡng / hàng có giới hạn tuổi → cần người duyệt
      │
      ├─ ⑥ Verify & Access: MỘT yêu cầu gồm
      │     consent "Tôi đồng ý cho agent mua X giá Y tại Z" + statement "trên 18 tuổi"
      │     → người dùng quét QR bằng ID App → ZK proof + consent (VRA anchor)
      │
      ├─ ⑦ Thanh toán: x402 / PLT / sponsored tx  (chờ W3)
      │
      └─ ⑧ Audit anchor: hash của log (mandate, proof, consent, payment)
            → link CCDExplorer để nộp bài
```

**Trường hợp bị từ chối nên có trong video** (`docs/demo-script.md`):
- Agent mạo danh không có badge, hoặc badge đã revoke, nên bị chặn ở bước ②.
- Giỏ hàng vượt ngân sách trong mandate, nên bị chặn ở bước ⑤.
- Identity dưới 18 tuổi, nên không tạo được proof ở bước ⑥.

### 4.3 Ánh xạ sang primitive của Concordium

| Primitive | Dùng ở bước | Đã có trên testnet? |
|---|---|---|
| Agent Registry CIS-8004 + Agent Card + badge (cho **cả hai** agent) | ② | ✅ UI + MCP hosted |
| CIS-8 key binding + A2A challenge–response | ③ | ✅ (slide 15) |
| Verify & Access: ZK statement + consent | ⑥ | ✅ đã demo ở W1 và W2 |
| Identity doanh nghiệp (Global FinReg) | phía doanh nghiệp | ✅ testnet |
| Audit anchor / VRA anchor | ⑥, ⑧ | ✅ (W1 [29:40–32:46]) |
| x402 / PLT / sponsored transactions | ⑦ | ❓ chờ W3 (09/11) |
| MCP / A2A | ②, ③ | ✅ MCP hosted; A2A chờ W6 (18/11) |

Tổng cộng **6–7 primitive trong cùng một workflow**, so với 2–4 primitive mà research cũ coi là "tích hợp mạnh".

### 4.4 Phần tự xây (giá trị riêng của dự án)

Đây là phần Concordium nói rõ là chưa có (slide 10), nên cũng là điểm khác biệt:

1. **Mandate**: một JSON có cấu trúc (ngân sách, danh mục, danh sách merchant đã verify hoặc điều kiện "phải có badge", hạn dùng, ngưỡng cần consent), do người dùng ký và neo hash on-chain. *(Cách neo cụ thể, bằng giao dịch đăng ký dữ liệu hay smart contract nhỏ, còn phải kiểm chứng.)*
2. **Policy engine**: kiểm từng hành động của agent theo mandate, quyết định cho chạy, xin consent, hay chặn.
3. **Tách key theo least privilege** đúng slide 14: agent chỉ giữ key CIS-8 (không có quyền chi tiền); tiền nằm ở transaction key hoặc ví riêng có giới hạn.
4. **Audit trail** gom mandate, proof, consent, payment vào một log, rồi neo hash.

### 4.5 Khác biệt với đối thủ đã thấy

| Đối thủ | Họ làm | MandateOS khác ở chỗ |
|---|---|---|
| Trifecta Checker (chat W2) | Chặn request nguy hiểm bằng HTTP 403, kiểm badge | Không chỉ chặn: có **mandate do người dùng ký**, ngân sách, consent anchor, xác minh **hai chiều** |
| SellerPilot (GitHub) | Gắn registry + x402 + sponsored tx vào app phân tích marketplace | Trọng tâm là **ủy quyền và bằng chứng tranh chấp**, không chỉ là thanh toán |
| Đội làm theo đúng ví dụ đi chợ của CTO | Nhiều khả năng sẽ có | Chọn **domain gắn với dự án có sẵn của bạn** thay vì copy nguyên ví dụ siêu thị (mục 6) |

### 4.6 Giới hạn scope để làm solo được

- Chỉ **2 agent** (một cá nhân, một doanh nghiệp), **1 luồng mua**.
- Policy engine dùng luật cứng đơn giản, không dùng AI để ra quyết định.
- **Không dùng Agent IDP**: ZK proof đi qua ID App của người dùng (bước ⑥). Agent IDP chỉ là mục mở rộng nếu devnet ổn.
- **Không dùng Protocol-Level Locks** (mốc dời sang 01/2027).

---

## 5. Những gì chưa đủ dữ kiện, và khi nào sẽ rõ

| Chưa rõ | Ảnh hưởng | Khi nào rõ | Phương án dự phòng |
|---|---|---|---|
| x402 trên testnet: facilitator, repo mẫu | Bước ⑦ | **W3, T2 09/11** | Sponsored PLT transfer qua `@concordium/wdk-wallet-concordium` |
| Cách neo mandate và audit log tốt nhất | Bước ①, ⑧ | W4, T4 11/11 (EU AI Act audit trails) | Neo hash bằng giao dịch đơn giản trước, chuẩn hóa sau |
| Protocol-Level Locks có dùng được không | Có thể thay một phần policy engine | W4 | Policy engine off-chain |
| A2A: chuẩn giao tiếp giữa hai agent | Bước ②, ③ | W6, T4 18/11 | HTTP + Agent Card JSON tự viết |
| Agent IDP trên devnet có ổn định không | Mục mở rộng | Buổi riêng CTO hứa [25:26–25:37] | Bỏ qua, dùng ID App |
| Testnet faucet từng sập trong buổi W2 | Toàn bộ demo | Ngay bây giờ | **Xin test CCD sớm và dự trữ** |

Không mục nào ở trên làm đổi hướng. Nếu W3 cho thấy x402 chưa dùng được, hướng vẫn đứng; chỉ đổi cách thanh toán.

---

## 6. Việc cần bạn quyết: gắn vào dự án có sẵn nào?

Thể lệ ghi *"Concordium is integrated into your existing project"* (slide 07, W1), và CTO nói *"the whole point … is to bring your current project"* (W1 [50:51–51:22]). Đây là thông tin còn thiếu duy nhất để chốt hẳn.

| Phương án | Ví dụ | Đánh giá |
|---|---|---|
| **1. Dự án/agent bạn đang có** | Bất kỳ agent nào bạn đã build: trợ lý mua sắm, bot đặt lịch, agent xử lý đơn hàng… | ⭐ Tốt nhất: đúng tinh thần thể lệ, có câu chuyện "trước và sau khi có Concordium" |
| **2. Fork một agent mã nguồn mở có sẵn** | Một shopping/booking agent trên framework phổ biến | Chấp nhận được; phải nói rõ phần nào là code gốc, phần nào là tích hợp |
| **3. Viết agent mới từ đầu** | Demo đi chợ hộ | Rủi ro: dễ bị xem là không phải "existing project", và trùng ví dụ của CTO |

Domain của dự án có sẵn sẽ quyết định **mandate chứa gì** và **khách hàng của path to production là ai**.

---

## 7. Kế hoạch từ nay đến Checkpoint 1

| Ngày | Việc |
|---|---|
| 05–08/11 | Xong Nhóm B, C trong `Checklist-chuan-bi-tam.md` (ví, Test IDP, ID App, consent + statement). **Xin dự trữ test CCD.** Tạo thêm identity doanh nghiệp bằng Global FinReg |
| 05–08/11 | Làm lại demo W2: đăng ký **2 agent** (cá nhân và doanh nghiệp) trên `testnet-agent-registry.concordium.com` hoặc qua MCP, host Agent Card, thử verification URL. Thử ký và kiểm nonce bằng key CIS-8 |
| 05–08/11 | Chốt dự án có sẵn (mục 6) |
| **T2 09/11** | W3: chốt cách thanh toán (bước ⑦) |
| **T4 11/11** | W4: chốt cách neo mandate và audit (bước ①, ⑧) |
| 12–18/11 | Viết bản nháp mandate schema, policy engine, sơ đồ kiến trúc vào `docs/architecture.md` |
| **T4 18/11** | W6: chốt giao tiếp A2A |
| **Trước 06:59 sáng T2 23/11** | **Checkpoint 1**: đăng ý tưởng MandateOS kèm domain của dự án có sẵn |

---

## 8. Rủi ro chính

| Rủi ro | Mức | Giảm thiểu |
|---|---|---|
| Scope quá rộng cho solo | Cao | Giữ đúng mục 4.6; mục nào chưa xong ở W3/W4 thì cắt, không kéo dài |
| x402 chưa có trên testnet | Trung bình | Dự phòng bằng sponsored PLT |
| Demo cần người quét QR thật | Trung bình | Quay video trước, mirror màn hình điện thoại; luôn kèm statement để tránh lỗi UI |
| Faucet hoặc ví testnet lỗi gần deadline | Trung bình | Dự trữ CCD, quay demo sớm, nộp sớm |
| Nhiều đội làm cùng ví dụ của CTO | Trung bình | Gắn vào domain của dự án có sẵn; nhấn mạnh mandate và audit |
| Đối thủ "gatekeeper" làm trước | Thấp–Trung bình | Khác biệt bằng mandate do người dùng ký và xác minh hai chiều |

---

## Nguồn

- `Bao-cao-Workshop01.md`, `Bao-cao-Workshop02.md`, `Tong-hop-Workshop01-va-Hackathon.md`
- Transcript W2: [04:03] Global FinReg · [07:41–09:39] consent + statement · [12:33–17:15] CIS-8004, CIS-8 · [18:37–19:30] badge làm được / không làm được · [19:39–25:40] Agent IDP · [26:28–31:48] cấu trúc account và ba loại key · [34:17–34:43] revoke · [41:24] 40 tool MCP · [49:22–49:27] đăng ký mainnet được sponsor · [56:24–57:02] ZK reveal · [57:53–58:19] MCP hosted và npm · [64:05–66:03] câu trả lời về tiêu chí chấm
- Slide W2: 10 (badge làm được / không làm được), 11 (Agent IDP), 12 (A2A trust), 14 (ba loại key), 15 (một owner nhiều agent)
- Slide W1: 07 (What to submit và Requirements)
- Research: `Research-Hackathon/` (MandateOS, TrustGate, ProofProcure)
