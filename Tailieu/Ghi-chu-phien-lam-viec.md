# Ghi chú phiên làm việc (03/11 – 12/11/2026)

> Ghi chú ngắn để tiếp tục công việc ở phiên sau. Chi tiết đầy đủ nằm trong `Tong-hop-sau-W4.md`.

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
| GF | Global FinReg trên testnet | W5 (16/11), Discord |
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

Chưa xác nhận đã làm: tạo project trên Encode, đăng câu hỏi Discord, chạy demo `ccd-ui-sdk`, cài Node.js.

## 5. Quy trình đã dùng

- **Video workshop:** bạn đưa link Google Drive → tải về → cắt slide bằng ffmpeg → chép lời bằng Whisper → viết báo cáo.
- **Repo:** làm trên branch dựng lại từ `main`, sau đó tạo PR và merge khi bạn yêu cầu.
- **Báo cáo:** bản mới không sửa bản cũ; mỗi bản có mục "thay đổi so với bản trước".
