# Checklist chuẩn bị (bản tạm, soạn sau Workshop 01)

> Soạn ngày 03/11/2026, sau Workshop 01. Đây là bản tạm: một số mục sẽ đổi sau các workshop tiếp theo.
> Mốc `[mm:ss]` là thời điểm trong video Workshop 01 (xem `Workshop01/Workshop-01-transcript-EN.txt`).
> Mục ghi *(đề xuất)* là gợi ý thêm, không có trong video.

## 1. Các mốc sắp tới (giờ Việt Nam)

| Ngày | Sự kiện | Việc cần làm |
|---|---|---|
| Trước T4 04/11 | Trước Workshop 2 | Xong Nhóm A, B, C |
| T4 04/11, 22:00 | W2: Agent Registry + badge "Verified by Concordium" | Tham gia trực tiếp, hỏi các câu ở Nhóm F |
| 05–08/11 | | Nhóm D, E |
| T2 09/11, 22:00 | W3: x402, PLT, sponsored transactions | |
| T4 11/11, 22:00 | W4: Protocol-Level Locks, EU AI Act audit trails | |
| T2 16/11, 22:00 | W5: Ship to production | |
| T4 18/11, 22:00 | W6: MCP, A2A, agent framework | |
| T5 19/11 | Bắt đầu giai đoạn build | |
| **06:59 sáng T2 23/11** | **Checkpoint 1** | Tạo project, thêm team, mô tả ý tưởng |
| Từ 24/11 | Office hours T3 & T6, 22:00 | |
| **06:59 sáng T5 10/12** | **Nộp bài cuối** (nền tảng khóa cứng) | |

Nguồn: slide 03, 04, 05, 10 và video [00:27–02:39].

## 2. Checklist

### Nhóm A: Tài khoản và lịch

- [x] Kết nối Discord [03:59–04:08]
- [ ] Đăng nhập trang programme của Encode và **tạo project**. Thi solo thì không cần mã mời; mô tả ý tưởng ghi sơ bộ trước, sửa sau được [01:50–02:39], slide 10
- [ ] Đưa các workshop còn lại vào lịch (22:00 giờ VN). Lỡ buổi nào thì xem bản ghi trên trang programme [01:26–01:40], [04:09–04:16]

### Nhóm B: Ví Testnet

- [ ] Cài **Concordium Browser Wallet** (Chrome/Brave/Edge/Opera), tạo passcode, **lưu 24 từ seed phrase ở nơi an toàn** [45:21–45:39]
- [ ] Chuyển network sang **Testnet** (giao diện màu xanh lá) [47:04–47:20]
- [ ] Chọn **Concordium Test IDP**, điền form thông tin giả. Tạo 2 identity: một **trên 18 tuổi**, một **dưới 18 tuổi** để test trường hợp bị từ chối [45:47–46:29]
- [ ] Bấm **Create account** để có địa chỉ account [46:29–46:47]
- [ ] Vào Activity, bấm **Request CCD** để nhận khoảng 20.000 test CCD [46:47–46:56]
- [ ] Dán địa chỉ account vào **CCDExplorer testnet** để xem giao dịch đầu tiên *(đề xuất)*

### Nhóm C: ID App và thử lại demo của CTO

- [ ] Cài **Concordium ID App** trên điện thoại, chuyển sang Testnet, tạo identity bằng Test IDP [40:11–40:20], [44:43–44:50], [47:06–47:09]
- [ ] Mở `ccd-ui-sdk.netlify.app` trên máy tính và chạy lại 3 luồng [38:40–38:56]:
  - [ ] ① SDK flow (trình duyệt tự kết nối) [40:27–41:22]
  - [ ] ② Merchant backend flow, proof "trên 18 tuổi" [41:25–41:54]
  - [ ] ③ Consent flow: tự gõ một câu, quét QR, kiểm tra đúng nội dung, approve [41:54–42:50]
- [ ] Quét lại thêm một lần và để ý nhãn **"domain verified"** ở đầu màn hình ID App [42:53–43:52]
- [ ] Xem lại đoạn giải thích VRA và audit anchor [26:14–32:46]

### Nhóm D: Môi trường dev

- [ ] Cài **Node.js ≥ 18** và Git; nếu định viết smart contract thì cài thêm Rust và `cargo-concordium` *(đề xuất)*
- [ ] Cài Docker rồi chạy **Concordium Local Stack** (`github.com/Concordium/concordium-local-stack`): node DevNet, ví, CCDExplorer trên máy [47:59–48:31], [52:43]
- [ ] Mở **Developer Toolkit** (slide 29): Identity framework, Verify & Access tutorial, Integrate Concordium ID, Local stack, SDKs & technical reference [45:21], [47:46–47:53]

Lưu ý: giao dịch trên Local Stack **không hiện trên CCDExplorer testnet**, nên link nộp bài phải lấy từ testnet.

### Nhóm E: Tự build luồng xác minh đầu tiên

CTO: *"Why don't you have a go? Try to build a site, use Veriox if you want, or build it yourself, use our SDKs"* [47:38–47:46].

- [ ] Làm theo **Verify & Access tutorial** (age check), hoặc copy `simpleAgeVerification` từ repo `concordium-dapp-examples` (slide 29, repo là *đề xuất*)
- [ ] Mở rộng sang **consent request**, ghi nhận và tìm anchor trên CCDExplorer [38:56–39:18]
- [ ] *(Tùy chọn)* Xem **Veriox** (`veriox.co.uk`, `demo.veriox.io`) để so sánh; tự làm bằng SDK thể hiện integration depth tốt hơn [33:08–35:56]
- [ ] **Đăng ký thử 1 agent** qua Agent Registry MCP (`agent-registry-mcp.concordium.com/mcp`), nên làm sau W2 *(đề xuất)*

### Nhóm F: Chuẩn bị cho W2 và chốt ý tưởng

- [ ] Đọc trước tài liệu Agent Registry và Verified badge; W2 sẽ chỉ cách xác minh end-to-end agent, owner, card và URL [43:54–44:25]
- [ ] Xem lại Q&A về **IDP doanh nghiệp và chữ ký trong Agent Card** [49:30–50:48]
- [ ] Câu hỏi cho W2: cơ cấu giải và mức grant, "integration depth" cụ thể là gì, repo x402 cho testnet, có cần smart contract riêng không *(đề xuất)*
- [ ] **Liệt kê agent/dự án đang có**: được dùng code có sẵn, miễn chỉ ra Concordium giúp nó làm được điều gì mới [50:51–51:22]
- [ ] Chốt hướng trước 22/11 (A: Agent Consent / B: Trust Gateway / C: Enterprise Delegation), xem `Bao-cao-Workshop01.md` mục X *(đề xuất)*

## 3. Kết quả nên có trước tối 04/11

- [ ] Có project trên trang Encode
- [ ] Browser Wallet ở Testnet, có account và test CCD
- [ ] ID App đã chạy thành công cả 3 luồng demo, kể cả consent
- [ ] Có sẵn danh sách câu hỏi cho W2
