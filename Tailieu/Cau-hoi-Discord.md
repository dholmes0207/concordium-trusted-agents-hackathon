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
| 1 | Q1 | 12/11 | ⏳ Đang hỏi | | G1.3 | |
| 2 | Q7 | | ⬜ Chưa hỏi | | G1.3 / AB2 | |
| 3 | Q3 | | ⬜ Chưa hỏi | | G1.4 | |
| 4 | Q2 | | ⬜ Chưa hỏi | | G1.4, MVP-C/T | |
| 5 | Q4 | | ⬜ Chưa hỏi | | G2 | |
| 6 | Q5 | | ⬜ Chưa hỏi | | G1.1, G1.2 | |
| 7 | Q6 | | ⬜ Chưa hỏi | | GF | |

**Trạng thái:** ⬜ chưa hỏi · ⏳ đang hỏi · ✅ đã có câu trả lời · ➖ bỏ (đã được trả lời ở nơi khác)

Nếu câu trả lời trước đã trả lời luôn câu sau, đánh dấu câu sau là ➖ và ghi nguồn.
