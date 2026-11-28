# Câu hỏi Discord và theo dõi câu trả lời

> **Soạn ngày:** 12/11/2026. Nguồn: mục 5 của `Tong-hop-sau-W4.md`.
> **Cách dùng:** hỏi **từng câu một** trên Discord của Encode, theo thứ tự ở mục 1. Mỗi câu đã được viết lại để **tự đứng được** (người trả lời không cần đọc câu trước).
> Khi có câu trả lời, gửi lại nội dung hoặc ảnh chụp để cập nhật bảng theo dõi (mục 3), `Checklist-sau-W2.md` và bản tổng hợp mới nhất.
> Mình không đăng thay bạn được: phiên làm việc không có connector Discord, và tự động hóa bằng tài khoản cá nhân vi phạm điều khoản của Discord.

---

## 1. Thứ tự hỏi

Hỏi các câu quan trọng nhất trước; các câu cùng chủ đề đặt cạnh nhau.

| Lượt | Mã | Chủ đề | Lý do xếp ở đây |
|---|---|---|---|
| 1 | Q1 | Verify & Access có nhận claim trên credential Web3 ID không | Quyết định có gộp xác minh nhân viên và phê duyệt trong một lần quét được không |
| 2 | Q7 | Presentation hỗn hợp có chứng minh cùng một người không | Cùng chủ đề với Q1; quyết định cách đạt AB2 |
| 3 | Q3 | Câu consent nằm ở đâu, có được neo và chứng minh không | Quyết định G1.4 |
| 4 | Q2 | Browser Wallet có trả lời yêu cầu gắn account và hiện consent không | Tiếp nối Q3; quyết định tuyến MVP-C / MVP-T |
| 5 | Q4 | Proof từ ID App có lộ định danh ổn định không | Mức ẩn danh của người duyệt (G2) |
| 6 | Q5 | Công cụ Web3 ID trên testnet còn chạy không | Tự kiểm được trong spike S2 nên để sau |
| 7 | Q6 | Global FinReg trên testnet | W5 (16/11) có tài liệu riêng; nếu W5 đã trả lời thì bỏ |

**Câu quan trọng nhất:** Q1, Q7, Q3. Chúng quyết định thiết kế Approval Binding.

---

## 2. Nội dung từng câu (tiếng Anh, copy để đăng)

### Lượt 1 · Q1: claim trên credential Web3 ID

```text
Verify & Access (V1 requests): can a request include claims over a Web3 ID (CIS-4)
credential, or only identity/account claims?
```

Tiếng Việt: một yêu cầu Verify & Access bản V1 có đòi được proof trên credential Web3 ID (CIS-4) không, hay chỉ trên identity/account?
Mở: **G1.3**.

### Lượt 2 · Q7: cùng một người (same-holder)

```text
In a Web3 ID presentation that combines an account credential and a Web3 ID (CIS-4)
credential, does verification prove that both credentials belong to the same holder, or only
that both proofs share the same challenge ("weak linking")?
```

Tiếng Việt: khi một presentation gộp account credential và credential Web3 ID, việc xác minh có chứng minh cả hai thuộc cùng một người không, hay chỉ chứng minh hai proof dùng chung challenge?
Mở: **G1.3 / AB2**.

### Lượt 3 · Q3: câu consent

```text
How is the consent text carried in a Verify & Access (V1) request — is it the context string?
And is that text covered by the VRA hash and by the resulting presentation, so the verifier
can check the user approved exactly that text?
```

Tiếng Việt: câu consent được đưa vào yêu cầu ở đâu (context string?), và có nằm trong hash của VRA và trong proof không, để bên xác minh kiểm được người dùng đã đồng ý đúng câu đó?
Mở: **G1.4**.

### Lượt 4 · Q2: Browser Wallet và consent

```text
Can the Concordium Wallet for Web (browser extension) answer a Verify & Access request with
*account* claims, and does it show the context/consent text to the user before they approve?
```

Tiếng Việt: Browser Wallet có trả lời được yêu cầu Verify & Access gắn với account không, và có hiện câu consent cho người dùng trước khi họ đồng ý không?
Mở: **G1.4**, chọn **MVP-C / MVP-T**.

### Lượt 5 · Q4: định danh trong proof từ ID App

```text
For identity-based proofs created by the Concordium ID App in a Verify & Access flow: does the
resulting presentation carry any stable identifier (for example a credential ID), or is it
fully unlinkable across verifications?
```

Tiếng Việt: proof tạo từ ID App (gắn identity) có mang định danh ổn định nào không, hay hoàn toàn không liên kết được giữa các lần xác minh?
Mở: **G2**.

### Lượt 6 · Q5: công cụ Web3 ID trên testnet

```text
Are the testnet Web3 ID issuer frontend (web3id-issuer-frontend.testnet.concordium.com) and
proof explorer (web3id-proof-explorer.testnet.concordium.com) still supported with the
current Concordium Wallet for Web?
```

Tiếng Việt: issuer frontend và proof explorer Web3 ID trên testnet còn chạy với bản Browser Wallet hiện tại không?
Mở: **G1.1, G1.2**.

### Lượt 7 · Q6: Global FinReg trên testnet

```text
Global FinReg (Business ID) on testnet asks me to sign in or go through full KYB with real
corporate documents. Is there a test company or test login we should use for the hackathon?
(Peter suggested setting up a company via Global FinReg on testnet in Workshop 2.)
```

Tiếng Việt: Global FinReg trên testnet đòi đăng nhập hoặc KYB bằng giấy tờ thật. Có công ty test hay tài khoản test cho hackathon không?
Mở: **GF**.

---

## 3. Bảng theo dõi

| Lượt | Mã | Ngày hỏi | Trạng thái | Câu trả lời tóm tắt | Điểm mở được đóng | Việc kéo theo |
|---|---|---|---|---|---|---|
| 1 | Q1 | 12/11 22:33 | ✅ Đã có trả lời (Piotr, 16/11) | **"only identity/claims!"**: V&A V1 không nhận claim trên credential Web3 ID | G1.3 (phần giao thức) | L3a phải đi Web3 ID presentation riêng; xem `Tong-hop-sau-W6.md` |
| 2 | Q7 | | ⬜ Chưa hỏi (chỉ cần nếu làm L3a) | | G1.3 / AB2 | |
| 3 | Q3 | | ⬜ Chưa hỏi | | G1.4 | |
| 4 | Q2 | | ⬜ Chưa hỏi | | G1.4, MVP-C/T | |
| 5 | Q4 | | ⬜ Chưa hỏi | | G2 | |
| 6 | Q5 | | ⬜ Chưa hỏi | | G1.1, G1.2 | |
| 7 | Q6 | | ✅ Đóng (W5: Global FinReg testnet tự duyệt) | Piotr (11/11, trả lời KinganLogicLogan): trên testnet dùng IdP nào cũng được. Concordium IdP cấp ngay, tự điền thuộc tính, nhưng **chưa có thuộc tính công ty**. Muốn ZK trên thông tin công ty thì phải qua **Global FinReg testnet** như bình thường. Phần "có công ty/tài khoản test không" đã có Arome hỏi (10/11), chưa ai trả lời | GF (một phần) | Theo dõi thread của Arome và W5 (16/11); không đăng câu trùng |

**Trạng thái:** ⬜ chưa hỏi · ⏳ đang hỏi · ✅ đã có câu trả lời · ➖ bỏ (đã được trả lời ở nơi khác)

Nếu câu trả lời trước đã trả lời luôn câu sau, đánh dấu câu sau là ➖ và ghi nguồn.

---

## 4. Thông tin rút ra từ kênh #general (đến 12/11 22:33)

Nguồn: bản xuất toàn bộ kênh, lưu ở `~/hackathon-private/Discord/general-den-2026-11-12.md` (chỉ lưu ở máy) (59 tin, giờ UTC+7).

### 4.1. Liên quan trực tiếp tới dự án

| Thông tin | Nguồn | Tác động |
|---|---|---|
| Global FinReg testnet: Concordium IdP không có thuộc tính công ty; muốn chứng minh thông tin công ty bằng ZK thì phải KYB qua Global FinReg testnet (Arome cho biết cần giấy tờ thật và khoảng 1 ngày duyệt tay) | Piotr 11/11; Arome 10/11 | **GF:** giữ phương án dự phòng "account cá nhân đóng vai công ty A" (`Tong-hop-sau-W4.md` dòng 640). Chỉ thử KYB thật nếu W5 không đưa ra cách nhanh hơn |
| Cập nhật Agent Card / `setAgentURI` cho agent đã đăng ký: kết nối ví vào agentcards.site để kiểm hash và cập nhật | Piotr 06/11 | **L1:** có công cụ chính thức được khuyên dùng để ghim hash Agent Card. MCP hosted chỉ dựng payload, không ký |
| Ví mobile qua WalletConnect báo "Unsupported method" khi ký `setAgentURI`; dùng **browser wallet** | Frits (x402 Doctor) 04/11 | Dùng Browser Wallet cho mọi thao tác ký trong demo |
| Hosted MCP trên testnet có 2 lỗi, ID App có 1 lỗi chặn (chi tiết gửi riêng cho Piotr, không công khai) | assymetricthinker 06/11 | Spike S0/S1: nếu MCP trả kết quả lạ, nghi lỗi phía MCP trước; ghi lại để hỏi |
| Không thấy nút xin test CCD → ví chưa ở testnet | Arome 10/11 | Ghi chú cho checklist ví |
| Build chính thức từ tuần 4 (19/11) | Giles 02/11 | Spike trước 19/11 vẫn ổn; code nộp bài nên có commit từ 19/11 trở đi |

### 4.2. Dự án khác có phần chồng lấn (để làm rõ điểm khác biệt)

| Dự án | Làm gì | Chồng lấn với mình |
|---|---|---|
| **ProofPath** (Rik) | Middleware "evidence assurance": gom bằng chứng về danh tính và thẩm quyền agent, thanh toán, settlement thành manifest di động; có nhắc truy vết theo EU AI Act | **L4 audit** và phần "thẩm quyền". Điểm khác của mình: phê duyệt gắn đúng hành động (L3, Approval Binding) và gateway fail-closed, không chỉ thu thập bằng chứng sau sự việc |
| **x402 Doctor** (Frits, mainnet agent #5120) | Trước khi agent trả tiền x402, kiểm badge Concordium của bên bán và xem `payTo` có đúng của agent đó không | Ít chồng lấn (mảng thanh toán). Có trang ghim Agent Card, nhưng nên ưu tiên agentcards.site do Concordium giới thiệu |
| **TrustAuto AI** (Sams01) | Trợ lý chẩn đoán xe, định gắn danh tính agent | Không chồng lấn |
| Tool Offer / FAHCE (KinganLogicLogan), merchant agent (Arome), supplier agent CIS-3 (xoxoubaibe) | Agent thương mại cần danh tính doanh nghiệp | Cùng vướng Global FinReg; câu trả lời cho họ cũng áp dụng cho mình |

### 4.3. Câu hỏi của người khác đang chờ trả lời (theo dõi giúp, không cần hỏi lại)

- Có công ty / tài khoản test Global FinReg cho hackathon không (Arome, 10/11) → liên quan **GF**.
- Concordium có xác minh được quyền của agent hành động thay mặt công ty mà không lộ dữ liệu không (Marwan, 02/11) → liên quan **L2/L3** của mình. Nếu có trả lời, đọc kỹ.
- Agent ký CIS-3 tự động, backend tự sponsor tx, Concordium có facilitator x402 dùng chung không (xoxoubaibe, 10/11).
- Ngày phát hành Agent Kit beta (xoxoubaibe, 10/11).

### 4.4. Cảnh báo

- Tin của Tareq ngày 12/11 ("$50.00 reward" + link agentrouter.org) có dấu hiệu spam / lừa đảo. **Không bấm.**
- Chỉ ký giao dịch trên trang do Concordium giới thiệu (agentcards.site, registry chính thức) và chỉ dùng ví testnet.

---

## 5. Đợt hỏi 2 (soạn 24/11, sau spike S3a)

### 5.1 Đã tự trả lời được, không cần hỏi

| Câu hỏi | Tự kiểm bằng | Kết quả |
|---|---|---|
| Facilitator x402 testnet | Gói `@x402/concordium` | Tự chạy được (cần 1 account testnet có CCD) |
| Trả x402 bằng gì | README gói | CCD test là đủ; EURQ testnet chỉ 1.000 do bên phát hành giữ |
| V&A V1 gắn account, ví hiện gì, ResourceID có được neo không | Spike S3a (`spikes/s3a/`) | Có; ví không hiện context; ResourceID nằm trong anchor VRA |
| CIS-8 có nhận key EVM không (D2) | Schema tool `build_cis8_canonical_bytes` / `owner_of_key` của MCP hosted | Có: `secp256k1-uncompressed` + `ethereum-personal-sign`, namespace dạng CAIP (`eip155:<id>`) |
| Có verifier V1 hosted trên testnet không | Mã nguồn Proof Explorer (`concordium-web3id/test-tools/proof-explorer`) | Có (`/verifiable-presentations/verify`); SDK cũng tự kiểm được, nên gateway không phụ thuộc |
| Rate limit MCP hosted | Gọi REST vài lần | Không có header giới hạn; gateway đọc chain trực tiếp nên không phụ thuộc |

### 5.2 Nên hỏi (một tin, tag Piotr và Yashar)

| # | Câu hỏi | Vì sao không tự trả lời được | Ảnh hưởng |
|---|---|---|---|
| 1 | Tiêu chí chấm chi tiết (Piotr hứa 17/11) bao giờ có | Chỉ ban tổ chức biết | Ưu tiên phần nào (payments, số thành phần) |
| 2 | Bài thi là **lớp xác minh (gateway MCP)** demo với **agent MCP có sẵn** (Claude Code) có đúng tinh thần "your existing agent" không | Cách hiểu của giám khảo | D1 |
| 3 | Agent testnet gắn key EVM qua CIS-8 nên dùng namespace chain mainnet trong `chains.json` (vd `eip155:8453`) hay chain testnet (`eip155:84532`) có được badge coi là hợp lệ | `chains.json` chỉ có mainnet; không rõ `check_badge` xử lý namespace testnet thế nào | D2 |
| 4 | Office hours T3/T6 còn diễn ra không (trang chủ vẫn ghi, W6 nói không) | Thông tin lịch | Kế hoạch hỏi đáp |
| 5 (tùy chọn) | Ví có kế hoạch hiển thị `ContextString` cho người dùng khi duyệt V1 không | Lộ trình sản phẩm | Cách gọi "approval evidence" hay "verifiable consent" |

```text
Hi @Piotr from Concordium @Yashar, Mandate Gate here (an MCP gateway that checks an agent's
badge, a signed work order and a human approval before the agent can act on a customer's
infrastructure). We tested the V1 flow on testnet (account credential, Browser Wallet), and
it works well. A few questions:
1) When will the detailed judging criteria be shared?
2) Our entry is a verification layer: an existing MCP agent (e.g. Claude Code) calls tools
   through our gateway, unchanged. Does that fit "your existing agent" for judging?
3) For a testnet agent with an EVM key bound via CIS-8, should the key namespace be a
   mainnet chain from chains.json (e.g. eip155:8453) or a testnet chain (eip155:84532)?
   Will check_badge treat both as valid?
4) Are the Tue/Fri office hours still running? The site lists them, but Workshop 6 said
   questions should go to Discord.
5) (Optional) Any plan for the wallet to show the ContextString to the user when they
   approve a V1 request?
Thanks!
```

### 5.3 Theo dõi đợt hỏi 2 (đăng 24/11, 23:12 giờ VN)

| # | Câu hỏi | Trạng thái | Trả lời (Piotr, 24/11 23:24) |
|---|---|---|---|
| 1 | Tiêu chí chấm chi tiết | ✅ Đã trả lời | Đã gửi tiêu chí chi tiết cho Encode. **Đã có trên trang programme (xem 28/11):** không chấm số giao dịch; 4 tiêu chí: Depth of integration (identity, Agent Registry, agent payments) · Credible path to production · It works (demo end-to-end) · Usefulness. Judging 10–11/12 |
| 2 | Gateway + agent MCP có sẵn có đúng "your existing agent" | ✅ Đã trả lời (23:46) | **"yes"** |
| 3 | Namespace EVM cho agent testnet (`eip155:8453` hay `eip155:84532`) | ✅ Đã trả lời (23:46) | **"either should be good"** |
| 4 | Office hours | ✅ Đã trả lời | **Office hours làm bất đồng bộ trên Discord** (không có buổi live) |
| 5 | Ví hiện `ContextString` | ✅ Đã trả lời (23:46) | **"at some point, but currently the ID App is the place to demo consent flows"** → ví sẽ hiện về sau; hiện tại demo consent bằng **ID App** |
| 6 | Global FinReg testnet đòi Veriff (ID + selfie); có cách test không (đăng 23:33) | ⏳ Chờ (đến 28/11 chưa có trả lời, không có DM) | Piotr hỏi lại "Are there any pending questions?" (28/11 00:16 VN) → nên nhắc lại câu này |
