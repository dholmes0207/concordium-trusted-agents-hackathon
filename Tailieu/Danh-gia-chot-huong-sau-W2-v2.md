# Đánh giá chốt hướng nghiên cứu sau Workshop 02 (v2)

> **Ngày soạn:** 06/11/2026
> **Thay đổi so với v1** (`Danh-gia-chot-huong-sau-W2.md`, giữ nguyên không sửa): v1 đề xuất gộp Hướng A + B (MandateOS) và loại Hướng C. Bạn nghiêng về **Hướng C**, nên v2 đánh giá lại Hướng C bằng dữ kiện W2, thêm một mảnh mới chưa có trong các báo cáo trước (**Web3 ID / CIS-4**), đề xuất phiên bản **C-lite** làm được khi thi solo, và đặt các mốc kiểm chứng để quyết định.
> **Nguồn:** `Bao-cao-Workshop01.md`, `Bao-cao-Workshop02.md`, transcript và slide hai buổi, research trong `Research-Hackathon/`, docs Concordium về Web3 ID và CIS-4. Mốc `[mm:ss]` là của **video Workshop 02**, trừ khi ghi rõ W1.
> **Ký hiệu:** ✅ đã xác nhận · ⚠️ cần kiểm chứng · ❌ loại

---

## 0. Kết luận ngắn

1. **Hướng C chưa đủ rõ để chốt ngay, nhưng đã rõ hơn nhiều so với sau W1.** W2 giải quyết được phần lớn hạ tầng mà C cần: danh tính doanh nghiệp trên testnet, một công ty sở hữu nhiều agent, tách key theo quyền, ZK reveal tên công ty.
2. **Còn 2 câu hỏi quyết định (G1, G2)**, đều kiểm chứng được trong khoảng 1 tuần:
   - **G1:** Công ty xác nhận "người này là nhân viên của tôi" bằng cơ chế nào? Ứng viên mạnh nhất là **Web3 ID / CIS-4**: có trong docs chính thức nhưng workshop chưa nhắc, và chưa rõ ID App bản 2026 có hỗ trợ không.
   - **G2:** Proof của nhân viên có lộ địa chỉ account không, tức là ẩn danh thật hay chỉ ẩn danh giả (pseudonymous)?
3. **Đề xuất: chọn C có điều kiện, theo phiên bản C-lite** (agent DevOps của công ty A thao tác trên hạ tầng của khách hàng B). **Quyết định cuối vào T4 11/11 (W4)**, trước Checkpoint 1.
4. **Phương án dự phòng là A+B (MandateOS) từ v1.** Khoảng 70% thành phần dùng chung (registry, badge, CIS-8, consent, audit anchor), nên có thể bắt tay làm ngay mà ít phải bỏ đi về sau.
5. **Vẫn còn thiếu:** dự án có sẵn để gắn vào. Thể lệ yêu cầu *"Concordium is integrated into your existing project"* (slide 07, W1). Với Hướng C, lý tưởng là một agent DevOps hoặc IT ops, hoặc một công cụ nội bộ.

---

## 1. Hướng C là gì

**Bài toán** (đúng tình huống một người tham dự hỏi CTO ở W1 [49:30–49:50]): công ty A cung cấp dịch vụ kỹ thuật cho công ty B. Agent của A cần thao tác trên hạ tầng của B. B muốn chắc chắn rằng:
- agent đúng là của A, không phải agent mạo danh;
- có một **nhân viên đã xác minh của A** chịu trách nhiệm cho agent đó, nhưng B **không cần biết người đó là ai**;
- agent chỉ làm đúng phạm vi đã được ủy quyền, và quyền có thể bị thu hồi;
- mọi thao tác đều có bằng chứng kiểm toán.

CTO trả lời *"So both are possible"* và nêu các cách: ZK proof thuộc công ty, company reveal, proof "thuộc IDP X", hoặc **chữ ký trong Agent Card** (W1 [49:52–50:46]).

---

## 2. W2 đã làm rõ những gì cho Hướng C

| Điều Hướng C cần | W2 trả lời | Nguồn | Trạng thái |
|---|---|---|---|
| Danh tính doanh nghiệp trên testnet | Có sẵn IDP doanh nghiệp **Global FinReg**, nên không cần tự chạy IDP (việc đó cần governance committee duyệt, W1 [50:02–50:18]) | [04:03] | ✅ |
| Chứng minh agent thuộc công ty X | NFT của agent nằm trong account công ty; **ZK reveal tên công ty** để khớp chữ ký → account → NFT → agent → công ty | [13:17–13:32] | ✅ |
| Một công ty có nhiều agent, phân biệt từng agent | Một owner sở hữu nhiều agent NFT; mỗi agent có **key CIS-8 riêng** và chứng minh bằng challenge–response | Slide 15, [28:16–29:43] | ✅ |
| Agent thao tác hạ tầng nhưng không được chi tiền | **Key CIS-8 mặc định không có quyền chi tiền**, tách khỏi transaction key | Slide 14, [29:48–31:01] | ✅ |
| Phân biệt account của agent và của người | Mỗi account ghi rõ IDP đã cấp, nhìn chain là biết | [23:30–24:26] | ✅ |
| Thu hồi agent | Owner ký **revoke**, mọi lần kiểm badge sau đó đều fail | [34:17–34:43] | ✅ (chỉ thu hồi cả agent) |
| Ủy quyền theo từng nhân viên, theo phạm vi | **Không có sẵn.** Slide 10: badge *không* chứng minh quyền hành động | Slide 10 | ⭐ Phải tự xây (giá trị riêng của dự án) |
| Nhân viên giao một phần danh tính cho agent | **Agent IDP**, nhưng đang ở **devnet**, *"not a production capability to depend on today"* | Slide 11, [19:58] | ❌ Không phụ thuộc |
| Hướng compliance | W4 có chủ đề **"EU AI Act audit trails"** | Slide 04, W1 | ✅ (chờ nội dung W4) |

---

## 3. Hai câu hỏi còn mở

### G1. Công ty xác nhận "người này là nhân viên của tôi" bằng cách nào?

Concordium ID **không có thuộc tính "nơi làm việc"**. Thuộc tính do IDP cấp gồm tên, ngày sinh, quốc tịch, giấy tờ… Đây là mắt xích cốt lõi của Hướng C.

| Cách | Mô tả | Ưu | Nhược | Trạng thái |
|---|---|---|---|---|
| **(a) Web3 ID / CIS-4** | Công ty A làm **issuer**: deploy một credential registry (chuẩn CIS-4), cấp credential "kỹ sư của A" (vai trò, khách hàng được phép, hạn dùng) vào ví nhân viên. Nhân viên tạo **ZK proof** trên credential. CIS-4 có cơ chế **thu hồi** (revocation authority ký thông điệp thu hồi) | Giữ được ZK, thu hồi chuẩn, dùng đúng primitive của Concordium nên integration depth cao | Phải tự dựng issuer (contract, metadata, backend); docs ghi issuer phải tự vận hành service vì cần private key và trả phí | ⚠️ Có trong docs chính thức (CIS-4 finalized 10/2023), **workshop chưa nhắc**. Chưa rõ **ID App / Browser Wallet bản 2026 có giữ và tạo proof cho credential này không**, và **Verify & Access có yêu cầu được loại proof này không** |
| **(b) Delegation tự viết** | Công ty A dùng account của mình ký một văn bản ủy quyền cho account hoặc key CIS-8 của nhân viên (phạm vi, khách hàng B, hạn dùng), neo hash on-chain; thu hồi bằng một bản ghi revoke | Luôn làm được với công cụ đã thấy ở W1/W2 | **Mất phần ZK** (B thấy được account nhân viên); phải tự định nghĩa format, tự xử lý thu hồi | ✅ Làm được |
| (c) IDP riêng của công ty | Công ty chạy IDP riêng cho nhân viên | Mạnh nhất về lý thuyết | Cần governance committee duyệt | ❌ Loại |

**Hệ quả:** nếu (a) dùng được, Hướng C mạnh và khác biệt rõ. Nếu chỉ có (b), Hướng C vẫn làm được, nhưng chữ "privacy-preserving" yếu đi và hướng này gần với "B + delegation" hơn.

### G2. "Không biết nhân viên là ai" ở mức nào?

Cần biết proof từ ID App có lộ **địa chỉ account** hoặc credential ID của nhân viên không.
- **Nếu có:** B không biết tên thật, nhưng nhận ra được cùng một người qua nhiều lần (ẩn danh giả). Với B2B, mức này thường chấp nhận được, nhưng bài nộp phải mô tả đúng.
- **Nếu không:** B chỉ biết "một nhân viên hợp lệ của A". Đây là mức ẩn danh mạnh nhất.

Lưu ý thêm từ W1 [48:46–49:24]: Concordium **chưa có tính duy nhất (uniqueness) xuyên account** (Identity 2.0 còn đang nghiên cứu). Một người có thể có nhiều account, nên nếu cần "mỗi nhân viên một lượt" thì phải dựa vào credential do công ty cấp, không dựa vào Concordium ID.

### Những phần phải tự xây, bất kể G1 và G2

- **Authorization phía B:** chính sách thao tác nào được phép, với agent nào, trong phạm vi nào.
- **Thu hồi quyền của từng nhân viên** (nếu đi theo (b)).
- **Audit trail** cho từng thao tác.

Đây chính là phần giá trị riêng của dự án, tương đương mandate và policy engine ở hướng A+B.

---

## 4. C-lite: phiên bản làm được khi thi solo

### 4.1 Kịch bản

Công ty A là nhà cung cấp dịch vụ vận hành (MSP / DevOps). Agent DevOps của A thao tác trên hạ tầng của khách hàng B (deploy, restart service, đọc log, chỉnh cấu hình). B đặt một **gateway** (API proxy hoặc MCP server) trước hạ tầng của mình.

```text
CÔNG TY A (Global FinReg)                     CÔNG TY B (khách hàng)
 ├─ sở hữu Agent DevOps                          └─ Gateway trước hạ tầng của B
 │   (badge CIS-8004 + key CIS-8)                    kiểm tra theo thứ tự:
 └─ ủy quyền cho Kỹ sư (Test IDP):                  ① badge active, owner = A
     credential CIS-4 (a) hoặc delegation (b)          (ZK reveal tên công ty)
     phạm vi: khách hàng B, loại thao tác, hạn      ② challenge–response bằng key CIS-8
                                                     ③ ủy quyền hợp lệ, chưa thu hồi, đúng phạm vi
 Agent ──── yêu cầu thao tác ────────────────▶     ④ thao tác rủi ro (deploy prod, xóa DB):
                                                        kỹ sư duyệt qua ID App
                                                        (consent + proof, một lần quét QR)
                                                     ⑤ audit anchor cho từng thao tác
                                                        (hướng EU AI Act audit trail)
```

Bước ④ dựa vào chi tiết W2: consent và statement **ghép được trong cùng một yêu cầu** [09:15–09:39]. Khi demo, **luôn kèm ít nhất một statement**, vì bản test ID App có lỗi UI ở consent không kèm statement [08:36–09:17].

### 4.2 Trường hợp bị từ chối nên có trong video

| Trường hợp | Bị chặn ở bước |
|---|---|
| Agent mạo danh, không có badge hoặc badge đã revoke | ① |
| Agent có badge nhưng không ký được nonce (key bị đổi) | ② |
| Kỹ sư đã nghỉ việc, credential hoặc delegation đã bị thu hồi | ③ |
| Thao tác nằm ngoài phạm vi (ví dụ chỉ được đọc log mà lại đòi xóa DB) | ③ |
| Thao tác rủi ro nhưng kỹ sư từ chối trên ID App | ④ |

### 4.3 Ánh xạ sang primitive của Concordium

| Primitive | Dùng ở | Trạng thái |
|---|---|---|
| Identity doanh nghiệp Global FinReg | Phía A | ✅ testnet |
| Agent Registry CIS-8004 + Agent Card + badge | ① | ✅ UI + MCP hosted (40 tool) |
| ZK reveal tên công ty | ① | ✅ CTO mô tả [13:17–13:32] |
| CIS-8 key binding + A2A challenge–response | ② | ✅ slide 15 |
| Web3 ID credential (CIS-4) **hoặc** delegation tự viết | ③ | ⚠️ G1 |
| Verify & Access: consent + statement | ④ | ✅ đã demo ở W1, W2 |
| Audit anchor | ⑤ | ✅ W1 [29:40–32:46]; chờ W4 cho phần audit trail |
| x402 / PLT (tùy chọn: B trả phí dịch vụ cho A theo thao tác) | Mở rộng | ❓ chờ W3 |
| MCP / A2A | Gateway | ✅ MCP hosted; A2A chờ W6 |

Tổng cộng **6–8 primitive** trong cùng một workflow.

### 4.4 Giới hạn scope để làm solo được

- **1 công ty A, 1 agent, 1–2 kỹ sư, 1 khách hàng B**, khoảng 3–4 loại thao tác.
- Hạ tầng của B là **mô phỏng** (một service giả có vài endpoint), không cần hạ tầng thật.
- Policy dùng luật cứng đơn giản (JSON), không dùng AI để ra quyết định.
- **Không dùng Agent IDP** và **không dùng Protocol-Level Locks** (mốc dời sang 01/2027).
- Thanh toán x402 chỉ là mục mở rộng, làm sau khi luồng chính chạy xong.

---

## 5. So sánh lại các hướng

Thang điểm 1–5, cùng 6 tiêu chí như v1 (T1 integration depth · T2 path to production · T3 khớp gợi ý CTO · T4 lấp khoảng trống slide 10 · T5 làm được solo · T6 khác biệt đối thủ).

| Tiêu chí | C (bản đầy đủ, v1) | **C-lite, G1 = (a)** | **C-lite, G1 = (b)** | A+B (MandateOS) |
|---|---|---|---|---|
| T1 Integration depth | 4 | **5** | 4 | 5 |
| T2 Path to production | 4 | **5** | 5 | 4 |
| T3 Khớp gợi ý CTO | 3 | 4 | 4 | 5 |
| T4 Lấp khoảng trống slide 10 | 4 | 5 | 5 | 5 |
| T5 Làm được solo | 2 | 3 | **3–4** | 3–4 |
| T6 Khác biệt đối thủ | 4 | **5** | 4 | 4 |
| **Tổng** | 21 | **27** | 25–26 | 26–27 |

**Giải thích các điểm thay đổi so với v1:**
- **T2 tăng cho C-lite:** có thị trường rõ (MSP, DevOps, outsourcing) và có động lực compliance (EU AI Act, W4).
- **T3 = 4 chứ không phải 5:** ví dụ CTO đưa ra ở W2 là agent doanh nghiệp ↔ agent **cá nhân** [64:39–64:53], còn C là doanh nghiệp ↔ doanh nghiệp. Bù lại, chính tình huống B2B này đã được CTO xác nhận khả thi ở W1.
- **T5 tăng từ 2 lên 3–4:** nhờ Global FinReg có sẵn, scope được thu gọn, và không phụ thuộc Agent IDP.
- **T6 cao:** ít đội chọn B2B hơn so với ví dụ đi chợ hộ của CTO.

**Kết luận bảng:** C-lite ngang hoặc nhỉnh hơn A+B **nếu G1 = (a)**. Nếu chỉ có (b), hai hướng gần như ngang nhau, và nên chọn theo dự án có sẵn của bạn.

---

## 6. Rủi ro riêng của Hướng C

| Rủi ro | Mức | Giảm thiểu |
|---|---|---|
| Web3 ID / CIS-4 không được ID App hoặc Verify & Access bản 2026 hỗ trợ | **Cao** (quyết định G1) | Hỏi Discord ngay; thử docs Web3 ID issuer trên testnet; dự phòng (b) |
| Dựng issuer CIS-4 tốn thời gian (contract, metadata, backend) | Trung bình | Dùng công cụ issuer có sẵn của Concordium nếu còn chạy; giới hạn 1 loại credential |
| Path to production bị so với **Microsoft Entra / AWS**, vốn quản lý danh tính agent rất mạnh *bên trong* một tổ chức | Trung bình | Nhấn mạnh lợi thế **xuyên tổ chức**, **kiểm chứng công khai** (B không cần tin hệ thống của A), **ZK** (không lộ nhân viên) |
| Demo trông "khô" hơn kịch bản mua sắm | Thấp–Trung bình | Chọn thao tác dễ hiểu (deploy prod, xóa dữ liệu); có hình ảnh rõ cho các bước bị chặn |
| Thiếu dự án có sẵn phù hợp | Trung bình | Xem mục 8 |
| Testnet faucet hoặc ví lỗi gần deadline | Trung bình | Xin dự trữ test CCD ngay; quay demo sớm |

---

## 7. Kế hoạch kiểm chứng và mốc quyết định

| Khi nào | Việc | Phục vụ |
|---|---|---|
| **Ngay tuần này** | Hỏi trên Discord: (1) ID App / Browser Wallet testnet có giữ và tạo proof cho **Web3 ID credential (CIS-4)** không; Verify & Access có yêu cầu được loại proof này không; (2) proof có lộ địa chỉ account hoặc credential ID không | G1, G2 |
| 06–10/11 | Thử theo docs **Web3 ID issuer** trên testnet: deploy registry, cấp 1 credential vào ví, thử tạo proof | G1 |
| 06–10/11 | Làm các phần **dùng chung với A+B**: tạo identity doanh nghiệp Global FinReg, đăng ký agent cho account đó, host Agent Card, thử challenge–response CIS-8, thử consent kèm statement. **Xin dự trữ test CCD** | Cả hai hướng |
| **T2 09/11 (W3)** | Nghe phần thanh toán; quyết định có đưa x402 vào làm mục mở rộng không | Mở rộng |
| **T4 11/11 (W4)** | ⭐ **Quyết định cuối.** G1 = (a) thì chọn **C-lite**. Chỉ có (b) thì so C-lite với A+B theo dự án có sẵn. Nghe thêm phần EU AI Act audit trails để chốt bước ⑤ | Chốt hướng |
| 12–18/11 | Viết bản nháp schema credential/delegation, policy của gateway, sơ đồ vào `docs/architecture.md` | Chuẩn bị build |
| **T4 18/11 (W6)** | Chốt giao tiếp A2A giữa agent và gateway | Gateway |
| **Trước 06:59 sáng T2 23/11** | **Checkpoint 1**: đăng ý tưởng | Thể lệ |

---

## 8. Việc cần bạn quyết: dự án có sẵn

| Phương án | Ví dụ cho Hướng C | Đánh giá |
|---|---|---|
| **1. Dự án/agent bạn đang có** | Agent DevOps, bot vận hành, công cụ nội bộ, agent hỗ trợ khách hàng doanh nghiệp | ⭐ Tốt nhất: đúng tinh thần thể lệ, có câu chuyện "trước và sau khi có Concordium" |
| **2. Fork một agent mã nguồn mở** | Một agent vận hành hạ tầng hoặc ChatOps có sẵn | Chấp nhận được; nói rõ phần nào là code gốc, phần nào là tích hợp |
| **3. Viết mới từ đầu** | | Rủi ro bị xem là không phải "existing project" |

Domain của dự án sẽ quyết định **credential/delegation chứa gì**, **gateway bảo vệ thao tác nào**, và **khách hàng trong path to production là ai**.

---

## Nguồn

- Báo cáo trong repo: `Danh-gia-chot-huong-sau-W2.md` (v1), `Bao-cao-Workshop01.md`, `Bao-cao-Workshop02.md`, `Tong-hop-Workshop01-va-Hackathon.md`
- Transcript W2: [04:03] Global FinReg · [08:36–09:39] consent và statement · [13:17–13:32] ZK reveal tên công ty · [18:37–19:30] badge làm được / không làm được · [19:39–25:40] Agent IDP · [23:30–24:26] phân biệt account agent và người · [26:28–31:48] cấu trúc account và ba loại key · [34:17–34:43] revoke · [64:05–66:03] câu trả lời về tiêu chí chấm
- Transcript W1: [48:46–49:24] Identity 2.0 · [49:30–50:48] IDP doanh nghiệp, ZK proof thuộc công ty, chữ ký trong Agent Card · [50:51–51:22] dùng dự án có sẵn
- Slide W2: 10, 11, 14, 15 · Slide W1: 04, 07
- Concordium: [Web3 ID issuers](https://docs.concordium.com/en/mainnet/how-to/web3-id/issuer.html) · [CIS-4: Credential Registry Standard](https://proposals.concordium.com/CIS/cis-4.html) · [Identity on Concordium](https://docs.concordium.com/en/mainnet/how-to/web3-id/index.html) · [concordium-rust-sdk cis4.rs](https://docs.rs/crate/concordium-rust-sdk/latest/source/src/cis4.rs)
- Research: `Research-Hackathon/` (enterprise agent delegation, so sánh với Microsoft Entra và AWS)
