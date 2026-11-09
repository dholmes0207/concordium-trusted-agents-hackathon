# Checklist sau Workshop 02 (Hướng C-lite kết hợp)

> Soạn ngày 07/11/2026, lưu ngày 09/11/2026. Gộp từ `Checklist-chuan-bi-tam.md` (bản sau W1, giữ nguyên) và quyết định sau W2: **C-lite bản kết hợp 4 lớp**
> (L1 danh tính agent · L2 phiếu giao việc · L3 người duyệt · L4 audit). Chi tiết xem `Danh-gia-chot-huong-sau-W2-v2.md`.
> Bỏ khỏi bản cũ: "chuẩn bị câu hỏi cho W2" (W2 đã qua), "chốt hướng A/B/C" (đã thay bằng C-lite, quyết định cuối vào 11/11).

## Giai đoạn 0: Việc tồn từ checklist cũ

- [x] Kết nối Discord
- [ ] **Tạo project trên trang Encode** (bắt buộc trước Checkpoint 1)
- [ ] Browser Wallet → Testnet → Test IDP: tạo **2 identity cá nhân** (một trên 18 tuổi, một dưới 18 tuổi) → tạo account → **Request CCD**. Faucet từng sập trong W2, nên xin dự trữ ngay
  - [x] Ví #2 trên Testnet, Identity 1 (trên 18 tuổi), account, nhận 20.000 CCD (09/11)
  - [x] Identity 2 (dưới 18 tuổi) (09/11)
  - [x] Account cho Identity 2 (09/11), đã kiểm tra đúng identity
- [ ] **Tạo identity doanh nghiệp bằng Global FinReg** trên testnet (đóng vai công ty A) (W2 [04:03])
- [ ] Cài ID App, chuyển sang Testnet, chạy lại 3 luồng demo trên `ccd-ui-sdk.netlify.app` (W1 [38:40–42:50])
- [ ] Thử **consent kèm statement "trên 18 tuổi"** trong cùng một yêu cầu (W2 [09:15–09:39]); đây là nền của L3
- [ ] Cài Node.js ≥ 18, Git
- [ ] Làm Verify & Access tutorial (`simpleAgeVerification`), dùng lại cho L3
- [ ] *(Hạ ưu tiên)* Local Stack

## Giai đoạn 1: Kiểm chứng và làm phần dùng chung (07–10/11)

### Kiểm chứng G1/G2

- [ ] Đăng 3 câu hỏi lên Discord:

```text
Hi team, a few questions on Web3 ID for an enterprise agent-delegation use case:
1. Does the Concordium ID App / Browser Wallet (testnet, current version) still hold
   Web3 ID verifiable credentials (CIS-4) and generate proofs over them?
2. Can a single Verify & Access request combine a Concordium ID statement,
   a Web3 ID (CIS-4) credential statement, and a consent message?
3. Does a Verify & Access proof reveal the prover's account address or credential ID
   to the verifier?
Thanks!
```

- [ ] Thử theo docs **Web3 ID issuer** trên testnet: deploy registry CIS-4, cấp 1 credential vào ví, thử tạo proof
- [ ] ⭐ **Chốt dự án có sẵn để gắn vào** (agent DevOps, bot vận hành, công cụ nội bộ…)

### Lớp L1 (dùng chung cho mọi phương án)

- [ ] Đăng ký agent cho **account Global FinReg** trên `testnet-agent-registry.concordium.com` hoặc qua MCP (`agent-registry-mcp.concordium.com/mcp`)
- [ ] Host Agent Card (GitHub raw hoặc agentcards.site), cập nhật URL + hash, thử verification URL
- [ ] Gắn key CIS-8 cho agent, thử **ký nonce và kiểm tra** (challenge–response)
- [ ] Thử **revoke** một agent phụ để có sẵn case bị từ chối
- [ ] Lưu mọi link CCDExplorer vào `docs/concordium-integration.md`

## Mốc workshop (22:00 giờ VN)

- [ ] **T2 09/11, W3** (thanh toán): quyết định có đưa x402 vào làm phần mở rộng không
- [ ] **T4 11/11, W4** (Locks, EU AI Act audit trails): ⭐ **quyết định có thêm lớp (a) CIS-4 vào L3 không**; chốt cách làm audit trail cho L4
- [ ] T2 16/11, W5 (Ship to production): lấy ý cho path to production
- [ ] T4 18/11, W6 (MCP, A2A): chốt cách agent giao tiếp với gateway

## Giai đoạn 2: Thiết kế (12–18/11)

- [ ] Thiết kế **phiếu giao việc (L2)**: key agent, khách hàng B, phạm vi, hạn dùng, **commitment** về kỹ sư phụ trách; cách neo hash và cách thu hồi
- [ ] Viết policy cho gateway: thao tác nào tự chạy, thao tác nào cần kỹ sư duyệt
- [ ] Điền `docs/architecture.md` với sơ đồ 4 lớp
- [ ] Viết nháp `docs/path-to-production.md`: thị trường MSP/DevOps, EU AI Act, khác biệt với Microsoft Entra / AWS

## Checkpoint 1: trước 06:59 sáng T2 23/11

- [ ] Cập nhật mô tả ý tưởng trên trang Encode (C-lite, kèm domain của dự án có sẵn)

## Giai đoạn 3: Build (19/11 → 09/12)

- [ ] Build theo thứ tự **L1 → L2 → L4 → L3** (Concordium ID + consent) → **cuối cùng nâng L3 lên CIS-4** nếu chốt dùng (a)
- [ ] Dựng hạ tầng giả của B (vài endpoint) và gateway
- [ ] Chuẩn bị đủ case bị từ chối: agent mạo danh, sai key, kỹ sư đã nghỉ việc, thao tác ngoài phạm vi, kỹ sư từ chối duyệt
- [ ] Hỏi trong office hours T3 và T6 khi bị kẹt
- [ ] Quay video ≤ 3 phút sớm (`docs/demo-script.md`)
- [ ] Hoàn thiện `README.md` và các file `docs/`
- [ ] Quyết định có giữ `Tailieu/` khi public không, rồi **chuyển repo sang public**
- [ ] **Nộp trước 06:59 sáng T5 10/12**, nên nộp sớm vài giờ

## Nhật ký thông tin testnet

Chỉ ghi thông tin **công khai** (địa chỉ account, hash giao dịch, link CCDExplorer). **Không bao giờ** ghi seed phrase, private key hay file export ví vào đây.

| Vai trò | Identity (IDP) | Địa chỉ account | Ghi chú |
|---|---|---|---|
| Kỹ sư (trên 18 tuổi) | Concordium testnet IP ("Identity 1"), **ví #2** | `3Rgk3fkCJVsyqdpetE7Xq6w8KFhY7RQhQh8na1Qc36b4A26gaw` | Account index 19406. Có 20.000 CCD (09/11). [CCDExplorer](https://ccdexplorer.io/testnet/account/3Rgk3fkCJVsyqdpetE7Xq6w8KFhY7RQhQh8na1Qc36b4A26gaw) |
| ~~Kỹ sư (trên 18 tuổi), ví #1~~ | ~~Concordium testnet IP~~ | ~~`38KJ...hW6s`~~ **bỏ, không dùng** | Ví #1 bị lộ seed phrase (09/11) |
| Kỹ sư (dưới 18 tuổi) | Concordium testnet IP ("Identity 2"), ví #2 | `3Exu4kLu375FiXzUE8rxCjnRcYhxsJZwCoyUqDudHS78hVbkss` | Account index 19408, 0 CCD. Dùng cho case bị từ chối. Đã kiểm tra trong ví: account nằm dưới Identity 2 (nhãn "Identity 1" trên CCDExplorer không phải tên trong ví). [CCDExplorer](https://ccdexplorer.io/testnet/account/3Exu4kLu375FiXzUE8rxCjnRcYhxsJZwCoyUqDudHS78hVbkss) |
| Công ty A | Global FinReg (Business ID) | | |

### Dữ liệu giả đã nhập vào form Concordium testnet IP

Toàn bộ là dữ liệu thử nghiệm, không phải giấy tờ thật. Ghi lại để biết identity nào trả lời được câu hỏi nào khi test proof.

| Trường | Identity #1 (trên 18 tuổi) | Identity #2 (dưới 18 tuổi, dự kiến) |
|---|---|---|
| Fail identity | Không tích | Không tích |
| Identity expiry | 12/2027 | 12/2027 |
| First name / Last name | DHolmes / Leo (nickname) | (tên giả khác, ví dụ Minor / Tester) |
| Sex | 1 (male) | 0 |
| Date of birth | 19990812 | 20120601 |
| Country of residence / Nationality | DK / DK | DK / DK |
| Document type / number / issuer | 1 (passport) / 13118023 / DK | 1 / 67890 / DK |
| Document issued at / expires at | 20200101 / 20300101 | 20200101 / 20300101 |
| National id no / Tax id no | N-8023 / T-1311 | N-5678 / T-5678 |

## Lịch sử thực hiện

| Ngày | Việc | Kết quả |
|---|---|---|
| 09/11 | Cài Concordium Wallet (Browser Wallet) trên Ubuntu, tạo ví mới, chuyển sang Testnet | ✅ Thấy danh sách IDP testnet: Concordium testnet IP, Digital Trust Solutions TestNet, Global FinReg (Business ID), Dataspike |
| 09/11 | Phát hiện: **Global FinReg (Business ID) có sẵn trong Browser Wallet**, không bắt buộc dùng ID App | ℹ️ |
| 09/11 | Điền form Concordium testnet IP cho identity #1 (trên 18 tuổi), bản cập nhật: expiry 12/2027, sex 1, số giấy tờ mới | ✅ Submit xong |
| 09/11 | Identity #1 hiển thị là "Identity 1 — Verified by Concordium testnet IP" (Passport, 13118023) | ✅ |
| 09/11 | Bấm Create Concordium Account cho Identity 1 | ⏳ "Account Creation in Progress", địa chỉ `38KJ...hW6s`, số dư 0.00 CCD |
| 09/11 | Account của Identity 1 tạo xong: các nút Buy/Receive/Send/Stake/Activity đã dùng được; ví nhắc "Backup Your Wallet" | ✅ Số dư 0.00 CCD |
| 09/11 | ⚠️ **Seed phrase của ví #1 bị lộ** (ảnh chụp màn hình gửi vào chat). Quyết định: **bỏ ví #1** và toàn bộ identity/account trong đó, xóa extension, tạo ví mới | ❌ Ví #1 không dùng nữa |
| 09/11 | Xóa và cài lại extension, làm lại các bước | ❌ Lỗi **"Duplicate idCredPub"**. Nghi ngờ ví mới vẫn dùng seed phrase cũ (khôi phục ví #1), nên credential key trùng với account đã có trên chain |
| 09/11 | Tạo ví #2 với seed phrase mới (đã chép ra giấy), tạo lại Identity 1 bằng dữ liệu giả cũ, Create account | ✅ Địa chỉ mới `3Rgk...6gaw` (khác ví #1, xác nhận là ví mới). Số dư 0.00 CCD |
| 09/11 | Request CCD | ✅ Số dư 20.000 CCD, đã kiểm tra trên CCDExplorer testnet (account index 19406, IDP: Concordium testnet IP) |
| 09/11 | ⭐ Phát hiện cho G1: menu Browser Wallet (bản hiện tại, testnet) có mục **"Web3 ID"**, nên phía người giữ credential CIS-4 được hỗ trợ trong Browser Wallet. Còn cần kiểm chứng: Verify & Access có yêu cầu được proof trên Web3 ID không, ID App có hỗ trợ không | ℹ️ Menu gồm: Identities, Accounts, Seed phrase, Passcode, Web3 ID, Stake, Network, About, Restore, NFT |
| 09/11 | Tạo identity #2 qua menu Identities | ❌ Lỗi "SeedPhrase should not be retrieved without unlocking the wallet": ví đã tự khóa giữa chừng. Cách xử lý: mở lại ví, nhập passcode, làm lại ở chế độ Fullscreen |
| 09/11 | Tạo identity #2 (dưới 18 tuổi) sau khi mở khóa ví | ✅ Identity 2 đã tạo; chờ địa chỉ account |
| 09/11 | Tạo account cho Identity 2 | ✅ `3Exu…Vbkss`, index 19408, 0 CCD. ⚠️ CCDExplorer hiện nhãn "Identity 1", cần đối chiếu trong ví |
| 09/11 | Kiểm tra trong ví: account `3Exu…` nằm dưới Identity 2 | ✅ Nhãn "Identity 1" trên CCDExplorer không phản ánh tên identity trong ví |
| | Tiếp theo: Global FinReg (công ty A) → chạy demo `ccd-ui-sdk.netlify.app` → đăng câu hỏi Discord | |

| Việc | Link CCDExplorer / ghi chú |
|---|---|
| Nhận test CCD | [Account Identity 1 trên CCDExplorer](https://ccdexplorer.io/testnet/account/3Rgk3fkCJVsyqdpetE7Xq6w8KFhY7RQhQh8na1Qc36b4A26gaw); giao dịch thấy trên trang: `41837ab6c4b33b5b81c834c3388e0fba65a213a76ce8b3c8fccf03cdcb617c8c` (chưa xác định loại) |
| Đăng ký agent | |
