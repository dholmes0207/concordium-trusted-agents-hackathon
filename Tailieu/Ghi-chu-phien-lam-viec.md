# Ghi chú phiên làm việc (03/11 – 20/11/2026)

> Ghi chú ngắn để tiếp tục công việc ở phiên sau. **Bản mới nhất: `Tong-hop-sau-W6.md` (v5, 20/11)**; chi tiết thiết kế L1–L4 vẫn ở `Tong-hop-sau-W4.md`.

## 0b. Quyết định (25/11)

- ✅ **D1:** HolmesGPT là agent chính trong demo; Claude Code chạy song song làm dự phòng (Piotr 24/11: gateway + agent MCP có sẵn là đúng tinh thần "your existing agent").
- D2, D3, D4: đang chốt.

## 0a. Cập nhật 24/11

- Đợt hỏi 2 đã đăng (23:12). Piotr: office hours **bất đồng bộ trên Discord**; tiêu chí chấm chi tiết đã gửi Encode, sắp lên trang programme. Câu 2, 3, 5 và câu Veriff đang chờ (bảng ở `Cau-hoi-Discord.md` mục 5.3).
- Global FinReg testnet: đi được bước 1–3 (công ty giả "Mandate Gate Demo Co., Ltd", file PDF test), **dừng ở bước 4 Veriff (ID + selfie)**. Đề xuất: account cá nhân đóng vai công ty A cho tới khi Piotr trả lời.

- ✅ **Spike S3a đạt** (xem `spikes/s3a/README.md`): Browser Wallet trả lời V&A V1 bằng proof gắn account; `ResourceID` nằm trong anchor VRA; proof mang `credId` cố định; ví không hiện context → **D3 = MVP-C**.

- Project **Mandate Gate** đã tạo, 2 thành viên, challenge "Make your Agents Accountable with Concordium". ✅ **Checkpoint 1 đã nộp 24/11** (thông báo "Your submission has been saved"; nút đổi thành "View / Edit Submission"). Ô "Your idea, in a paragraph" dùng đoạn ở `Discord/Tong-hop-Discord-20-24-11.md` mục 6, có thêm câu mở đầu "Brief: Make your Agents Accountable with Concordium."
- Piotr `@here` 24/11: hỏi ai cần facilitator x402 testnet, EurQ, câu hỏi bị sót. Gợi ý trả lời: `Discord/Tong-hop-Discord-20-24-11.md` mục 4.
- x402 có scheme chính thức `@x402/concordium` (client, server, facilitator) để tự chạy trên testnet.

## 0. Cập nhật 20/11

| | |
|---|---|
| **Workshop** | Đủ 6 buổi; báo cáo W1–W6, slide và transcript trong `Workshop01/` – `Workshop06/` |
| **Trang chủ** | Giải: top 3 mỗi đội 1M CCD + xét grant 75M CCD; tiêu chí: depth of integration, path to production, it works, usefulness |
| **Dashboard** | Chưa tạo project (Checkpoint 1 hạn 06:59 sáng T2 23/11); Discord đã kết nối; PM là Yashar Ajdari |
| **Discord** | Q1 đã có trả lời: Verify & Access V1 **chỉ nhận identity claim**. Q6 (Global FinReg) đóng nhờ W5: testnet tự duyệt |
| **Thiết kế chốt (v5)** | Gateway là MCP server; `agent-proxy` local của A giữ key EVM (CIS-8) và ký request; L3b qua V&A V1 với `ResourceID` = `D`; L3a và x402 là mở rộng |
| **Spike** | Không có kết quả spike S0–S3 trong repo → gộp vào 21–22/11 |
| **Chờ bạn** | Tạo project + Checkpoint 1 · xin danh tính công ty qua Global FinReg Testnet · Node ≥ 22 · chốt D1–D4 (mục 5 của v5) |

## 1. Trạng thái hiện tại

| | |
|---|---|
| **Hướng đã chốt** | **C-lite kết hợp**: agent DevOps của công ty A thao tác trên hạ tầng (mô phỏng) của khách hàng B, qua gateway của B |
| **Kiến trúc** | L1 danh tính agent (CIS-8004, CIS-8, request có chữ ký) · L2 phiếu giao việc (work order + commitment, neo bằng Register Data, thu hồi fail-closed) · L3 phê duyệt (L3a credential nhân viên Web3 ID/CIS-4 + ZKP; L3b người duyệt + consent) · L4 audit (log off-chain, neo hash bằng Register Data) |
| **Scope** | Core MVP (mức sàn) · **Target C-lite Combined** (mục tiêu, có L3a) · C-full (dài hạn) |
| **Bản tổng hợp mới nhất** | `Tong-hop-sau-W4.md` (v4, 12/11) |
| **Workshop đã có báo cáo** | W1, W2, W3, W4 (slide và transcript trong `Workshop01/` – `Workshop04/`) |
| **Repo** | Mọi thay đổi đã merge vào `main` (PR #1 – #5) |

## 2. Testnet (chỉ thông tin công khai)

| Vai trò | Account | Ghi chú |
|---|---|---|
| Identity 1 (trên 18 tuổi, DK) | `3Rgk3fkCJVsyqdpetE7Xq6w8KFhY7RQhQh8na1Qc36b4A26gaw` | Index 19406, 20.000 test CCD |
| Identity 2 (dưới 18 tuổi) | `3Exu4kLu375FiXzUE8rxCjnRcYhxsJZwCoyUqDudHS78hVbkss` | Index 19408, dùng cho case bị từ chối |
| Công ty A (Global FinReg) | Chưa có | ⏸️ Đòi Sign In / KYB; chờ W5 |

- Ví #1 (`38KJ...hW6s`) **đã bỏ** vì lộ seed phrase. Không bao giờ chụp hoặc gửi seed phrase, private key, file `.export`.
- Contract testnet: CIS-8004 `<12802,0>`, CIS-8 `<12801,0>`.
- Browser Wallet có menu "Web3 ID" (bằng chứng một phần cho G1).

## 3. Câu hỏi còn mở

| Mã | Câu hỏi | Cách chốt |
|---|---|---|
| G1.1, G1.2 | Phát hành và chứng minh được credential nhân viên Web3 ID trên testnet không? | Spike S2 |
| G1.3 (AB2) | Account credential và credential nhân viên có chứng minh được là cùng một người không? | Spike S3b; dự phòng: commitment chứa cả hai định danh |
| G1.4 | Phê duyệt gắn đúng hành động; người duyệt có thấy đúng nội dung không? | Spike S3a |
| G2 | Proof lộ định danh nào? | Spike S2, S3a |
| GF | Global FinReg trên testnet | Thu hẹp nhờ Discord (Piotr 11/11): Concordium IdP không có thuộc tính công ty; muốn ZK thông tin công ty phải KYB thật qua Global FinReg testnet. Chờ W5 (16/11) xem có đường nhanh hơn không |
| DA | Agent nền nào? (ứng viên: HolmesGPT, agent nói MCP + MCP server cho Kubernetes) | **Bạn quyết trước 15/11** |
| A2A | Gateway là MCP server hay HTTP proxy | W6 (18/11) |

Đã đóng ở W4: neo audit bằng Register Data (anchor CBOR theo mẫu VRA/VAA); Locks chỉ có trên devnet, không dùng trong demo.

## 4. Việc tiếp theo

| Khi nào | Việc |
|---|---|
| Ngay | Đăng 7 câu hỏi Discord (mục 5 của `Tong-hop-sau-W4.md`); xác nhận đã tạo project trên Encode |
| 12–15/11 | Spike theo thứ tự **S3a → S0 → S1 → S2 → S3b** (mục 7.1) |
| **15/11** | Chốt agent nền, tuyến phê duyệt (MVP-C / MVP-T), cách đạt AB2 |
| **T2 16/11, 22:00** | W5: Ship to production (Global FinReg, LEI) |
| T4 18/11, 22:00 | W6: MCP, A2A |
| **Trước 06:59 T2 23/11** | Checkpoint 1 trên Encode |
| 19/11 → 09/12 | Build L1 → L2 → L4 → L3b → L3a; mốc cắt 30/11 |
| **Trước 06:59 T5 10/12** | Nộp bài (repo phải public) |

Discord: đã đăng Q1 (12/11 22:33), chưa có trả lời; Q6 không cần đăng (xem mục 3–4 của `Cau-hoi-Discord.md`).
Chưa xác nhận đã làm: tạo project trên Encode, chạy demo `ccd-ui-sdk`, cài Node.js.

## 5. Quy trình đã dùng

- **Video workshop:** bạn đưa link Google Drive → tải về → cắt slide bằng ffmpeg → chép lời bằng Whisper → viết báo cáo.
- **Repo:** làm trên branch dựng lại từ `main`, sau đó tạo PR và merge khi bạn yêu cầu.
- **Báo cáo:** bản mới không sửa bản cũ; mỗi bản có mục "thay đổi so với bản trước".
