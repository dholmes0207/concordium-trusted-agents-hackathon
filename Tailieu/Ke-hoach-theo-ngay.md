# Kế hoạch research và thực hiện theo ngày (13/11 → 10/12/2026)

> **Soạn ngày:** 12/11/2026. Dựa trên `Tong-hop-sau-W4.md` (v4) và `Ghi-chu-phien-lam-viec.md`.
> **Giờ:** giờ Việt Nam. Workshop và office hours lúc 22:00.
> **Cách chia việc:**
> - **Mình làm:** research, viết code và script, viết tài liệu, báo cáo workshop, cập nhật checklist.
> - **Bạn làm:** những việc cần ví và danh tính của bạn (ký giao dịch, quét QR, xuất key testnet), các quyết định, việc trên Encode và Discord.
> **Nguyên tắc:** mỗi ngày có **điều kiện hoàn thành**. Không đạt thì ghi "không đạt" kèm lý do vào checklist và đi tiếp theo phương án dự phòng, không kéo dài.

---

## 0. Chuẩn bị chung (cần trước ngày 14/11)

| Việc | Ai | Vì sao |
|---|---|---|
| Xác nhận Node.js ≥ 18 và Git trên máy Ubuntu | Bạn | Các script spike chạy trên máy bạn, nơi có Browser Wallet |
| Tạo **account thứ ba** dưới Identity 1, đặt tên "gateway-B" (đóng vai gateway của B) | Bạn | Tách account gửi anchor khỏi account đóng vai công ty A |
| Thư mục ngoài repo để giữ file `.export` của testnet, ví dụ `~/ccd-keys/` | Bạn | **Không bao giờ** để key trong repo hay gửi vào chat |

Mã nguồn spike đặt trong `spikes/` của repo. Key nằm ngoài repo, script đọc qua biến môi trường.

---

## 1. Tuần kiểm chứng (13/11 → 18/11)

### T6 13/11: chuẩn bị spike, đăng câu hỏi

| Mình làm | Bạn làm |
|---|---|
| Research API yêu cầu proof của Browser Wallet (Web3 ID presentation với challenge tự chọn) và luồng Verify & Access V1 trong Web SDK | Đăng 7 câu hỏi Discord (mục 5 của `Tong-hop-sau-W4.md`) |
| Dựng `spikes/` (TypeScript): trang **S3a** gửi yêu cầu proof với challenge = `D`, in JSON của presentation; script tính `D` từ một request mẫu | Tạo project trên Encode nếu chưa có |
| Viết hướng dẫn chạy S3a từng bước | Làm phần "Chuẩn bị chung" ở trên |

**Hoàn thành khi:** có trang S3a chạy được ở máy local; câu hỏi đã đăng lên Discord.

### T7 14/11: S3a và S0

| Mình làm | Bạn làm |
|---|---|
| Đọc JSON presentation bạn gửi lại: `D` nằm ở đâu, định danh nào lộ ra | **Chạy S3a:** lấy proof gắn account từ Browser Wallet; lấy một consent qua ID App; **chụp màn hình phê duyệt** ở cả hai |
| Viết script **S0**: sinh key ed25519 cho agent; dựng canonical bytes CIS-8 (qua MCP); đọc chain kiểm 5 điều của L1; ký và kiểm request envelope; test idempotency với hai request đồng thời | Đăng ký agent trên testnet registry bằng account đóng vai A; ký giao dịch CIS-8 |

**Hoàn thành khi:** biết `D` nằm trong proof hay không (G1.4); có danh sách định danh lộ ra (G2); script S0 từ chối request ký bằng key khác; hai request trùng chỉ chạy một lần.

### CN 15/11: S1 và mốc quyết định ⭐

| Mình làm | Bạn làm |
|---|---|
| Viết script **S1**: gửi Register Data chứa CBOR `{type, version, hash}`; đọc lại; theo dõi block finalized để bắt anchor có `type` cho trước; mô phỏng anchor thất bại | Chạy S1 bằng account gateway-B, gửi lại mã giao dịch |
| Viết **bản ghi quyết định**: so sánh ứng viên agent nền theo 5 tiêu chí (mục 3.9); đề xuất tuyến phê duyệt dựa trên S3a | **Quyết định agent nền** |
| Cập nhật `Checklist-sau-W2.md` với kết quả S3a, S0, S1 | |

**Hoàn thành khi:** có link CCDExplorer của anchor CBOR; có quyết định agent nền; có quyết định tạm về tuyến phê duyệt (chốt hẳn sau S3b).

### T2 16/11: S2 và Workshop 5

| Mình làm | Bạn làm |
|---|---|
| Hướng dẫn **S2**: tạo registry CIS-4 bằng issuer frontend testnet, cấp credential "DevOpsEngineer" | Chạy S2: cấp credential vào ví, tạo proof bằng proof explorer, xác minh, thu hồi rồi thử lại |
| Sau W5: tải video từ link Drive, cắt slide, chép lời, viết `Bao-cao-Workshop05.md` | **22:00: tham gia W5**; hỏi về Global FinReg trên testnet; gửi link Drive của video |

**Hoàn thành khi:** trả lời có/không cho G1.1, G1.2; biết cách tạo identity doanh nghiệp trên testnet (GF).

### T3 17/11: S3b và tài liệu thiết kế

| Mình làm | Bạn làm |
|---|---|
| Viết script **S3b**: presentation hỗn hợp từ cùng một ví, và ghép từ hai ví khác nhau (dựng bằng SDK); thử cách (ii) mở commitment | Chạy S3b (cần credential từ S2 và Identity 2 làm "người thứ hai") |
| Viết `docs/architecture.md`: sơ đồ 4 lớp, mục Security & Trust Model | Tạo account công ty A bằng Global FinReg nếu W5 chỉ cách được |

**Hoàn thành khi:** biết verifier chấp nhận hay từ chối trường hợp hai holder; **chốt tuyến phê duyệt (MVP-C/MVP-T) và cách đạt AB2**; chốt Target có khả thi không.

### T4 18/11: Workshop 6 và tổng hợp v5

| Mình làm | Bạn làm |
|---|---|
| Viết nháp `docs/path-to-production.md` | **22:00: tham gia W6**; gửi link Drive của video |
| Sau W6: `Bao-cao-Workshop06.md`; chốt gateway là MCP server hay HTTP proxy; viết **`Tong-hop-sau-W6.md` (v5)** với kết quả mọi spike | |

**Hoàn thành khi:** có v5 với mọi câu hỏi G1.x, G2, GF, DA, A2A đã có câu trả lời hoặc phương án dự phòng.

---

## 2. Tuần build 1 (19/11 → 25/11): L1, L2, Checkpoint 1

| Ngày | Mình làm | Bạn làm | Hoàn thành khi |
|---|---|---|---|
| **T5 19/11** | Khung gateway; hạ tầng mô phỏng của B (Docker Compose); điểm tích hợp với agent nền | Chạy được khung trên máy | Agent gọi được hạ tầng giả **qua** gateway |
| T6 20/11 | **L1** đủ phép kiểm, request envelope, idempotency, giới hạn kích thước | Ký đăng ký agent chính thức | Negative test 1–6, 17, 23 qua |
| T7 21/11 | **L2:** schema work order, cấp (Register Data), kiểm tra | Ký giao dịch cấp phiếu bằng account A | Cấp phiếu có link CCDExplorer |
| **CN 22/11** | **L2:** thu hồi R1 (theo dõi chain, fail-closed); soạn nội dung Checkpoint 1 | **Nộp Checkpoint 1 trên Encode trước 06:59 sáng T2 23/11** (nên nộp tối CN) | Negative test 7–10, 19, 21 qua; Checkpoint 1 đã nộp |
| T2 23/11 | **L4:** log có cấu trúc, nonce, `pii_blob`, chuỗi hash | — | Có đủ bản ghi request, decision, execution |
| **T3 24/11** | **L4:** anchor CBOR, ba trạng thái, hàng đợi neo lại, log gộp từ chối | **22:00: office hours đầu tiên** (mang câu hỏi còn kẹt) | Negative test 22, 24 qua |
| T4 25/11 | **L4:** biên nhận có chữ ký, công cụ kiểm tra toàn vẹn | — | Negative test 16 qua; xóa `pii_blob` không phá chuỗi |

## 3. Tuần build 2 (26/11 → 02/12): L3b, Approval Binding, L3a

| Ngày | Mình làm | Bạn làm | Hoàn thành khi |
|---|---|---|---|
| T5 26/11 | **L3b:** luồng phê duyệt theo tuyến đã chốt; trang phê duyệt | Thử duyệt bằng ví hoặc ID App | Thao tác mức 2 bị chặn khi chưa duyệt |
| **T6 27/11** | **Approval Binding:** digest `D`, mở commitment, tiêu digest nguyên tử | **Office hours** | Negative test 13–15 qua; test 20 kiểm tay |
| T7 28/11 | Hoàn thiện L3b; test end-to-end đầu tiên | Chạy end-to-end | Một thao tác mức 2 đi trọn L1 → L4 |
| CN 29/11 | Đệm cho phần trễ | — | — |
| **T2 30/11** | ⭐ **Mốc cắt:** chưa xong L3b thì dừng ở Core MVP | Quyết định có làm L3a không | Ghi rõ quyết định |
| **T3 01/12** | **L3a:** kiểm credential CIS-4 trong gateway (nếu S2, S3b đạt) | **Office hours** | Negative test 11, 12 qua |
| T4 02/12 | **L3a:** AB2 theo cách đã chốt | Duyệt bằng ví có credential | Negative test 18 qua |

## 4. Tuần hoàn thiện (03/12 → 10/12)

| Ngày | Mình làm | Bạn làm | Hoàn thành khi |
|---|---|---|---|
| T5 03/12 | Chạy lại toàn bộ test; hardening | — | Mọi test tự động qua |
| **T6 04/12** | `README.md`, `docs/concordium-integration.md` (đủ link CCDExplorer), `docs/demo-script.md` | **Office hours cuối** | Tài liệu đủ các mục bài nộp |
| T7 05/12 | Rà bài nộp theo `docs/submission-checklist.md`; kịch bản video | Tập demo | — |
| **CN 06/12** | Hỗ trợ sửa lỗi khi quay | **Quay video ≤ 3 phút** | Có video bản 1 |
| T2 07/12 | Rà repo trước khi public: không key, không seed, quyết định giữ `Tailieu/` hay không | Chuyển repo sang **public**; mở mọi link ở cửa sổ ẩn danh | Mọi link mở được |
| **T3 08/12** | Đệm | Buổi hướng dẫn nộp bài + office hours | — |
| **T4 09/12** | — | **Nộp bài trên Encode, mục tiêu trước 22:00 giờ VN** | Đã nộp |
| T5 10/12 | — | Hạn cứng **06:59 sáng** | — |

---

## 5. Research xen kẽ (theo `Lo-trinh-hoc-va-tham-khao.md`)

| Ngày | Chủ đề | Dùng cho |
|---|---|---|
| 13–14/11 | Verify & Access V1, Web3 ID presentation, CIS-4 | S2, S3 |
| 15/11 | CBOR (RFC 8949), Register Data, `anchor.rs` | S1, L4 |
| 17/11 | JCS (RFC 8785), JWT `aud`/`exp`/`jti`, EIP-191 | L1, L2 |
| 18/11 | A2A spec, MCP Authorization | Gateway (W6) |
| 23/11 | EDPB Guidelines 02/2025, GDPR Điều 17 | L4 |
| 04/12 | EU AI Act Điều 12, Microsoft Entra Agent ID | Path to production |

---

## 6. Cách theo dõi tiến độ

- Kết quả mỗi ngày ghi vào `Checklist-sau-W2.md` (đạt / không đạt, bằng chứng, quyết định kéo theo).
- Sau mỗi workshop: báo cáo mới. Sau W6: bản tổng hợp v5.
- Mỗi cuối tuần (15/11, 22/11, 29/11, 06/12): rà kế hoạch, dời việc trễ, cắt scope nếu cần.
