# Hướng dẫn: Claude Code làm agent của công ty A (26/11/2026)

Claude Code đóng vai agent DevOps #1505 của công ty A. Nó chỉ thấy 6 tool MandateGate qua
`agent-proxy` (MCP stdio, giữ khoá agent, ký mọi lệnh). Gateway của khách hàng B kiểm từng lệnh trên
Concordium testnet. Không cần key LLM nào ngoài tài khoản Claude bạn đang dùng.

## Chuẩn bị (mỗi lần demo)

Mở 2 terminal ở thư mục repo.

**Terminal 1: hạ tầng thật của khách hàng B (Kubernetes chạy trên máy), công ty A cấp phiếu, B bật gateway**

```bash
pnpm infra:up
pnpm --filter @mandate-gate/issuer wo issue --hours 8 --sponsor
pnpm demo:up
```

`pnpm infra:up` tạo hoặc bật lại cụm kind `mandate-gate` và luôn đưa payments về bản lỗi v2.2.0 (lỗi rò kết nối thật,
khoảng 1 phút sau khi khởi động pool cạn). `demo:up` tự dùng cụm này nếu nó đang chạy (in ra
`customer infrastructure: Kubernetes …`); không có cụm thì dùng bản giả lập.

**Bảng điều khiển của khách hàng B:** mở http://127.0.0.1:7400/dashboard. Mỗi lệnh của agent hiện trực tiếp với các bước
(ký, phiếu trên chain, x402, duyệt, neo, chạy) và link CCDExplorer; có thanh ngân sách, nút "Review and approve" khi có lệnh chờ
duyệt, và nút **Stop this agent now (kill switch)**: chặn ngay phiếu ở gateway, ghi audit và neo lên chain (tốn 1 giao dịch).

Phiếu được ghi vào `.data/work-orders/current.json`; proxy luôn dùng phiếu này. Đợi tới dòng `Ready.`.
Phiếu còn hạn thì không cần cấp lại, chỉ chạy `pnpm demo:up`.

**Terminal 2: agent**

```bash
cd demo/claude-agent && claude
```

Lần đầu Claude Code hỏi có dùng MCP server `mandate-gate` của thư mục này không: chọn đồng ý.
Gõ `/mcp` để xem `mandate-gate` đã kết nối (6 tool).

## Kịch bản (gõ cho agent)

1. `Service payments đang chậm và báo lỗi. Điều tra và sửa giúp mình.`
   - Agent đọc log, xem trạng thái (cấp 0), có thể restart (cấp 1). Log sau restart báo lỗi quay lại
     và có bản v2.2.1 sửa lỗi rò kết nối, nên agent đề xuất `deploy_prod` v2.2.1 (cấp 2).
   - Claude Code hỏi bạn trước mỗi lần gọi tool: đó là lớp duyệt của phía công ty A.
2. **x402:** trước khi giữ lệnh, gateway báo phí 0,5 CCD; proxy tự trả bằng ví agent
   (`~/ccd-keys/agent-wallet.export`, agent không thấy key). Tiền chỉ bị trừ **sau khi bạn duyệt**;
   bị từ chối hay hết giờ thì giao dịch không được gửi. Mỗi phiếu tối đa 10 CCD (20 lần deploy), vượt
   thì gateway và proxy đều chặn (`budget_exceeded`).
   Gateway giữ lệnh deploy. **Terminal 1** in link `http://127.0.0.1:7400/approvals/ap_…`:
   mở bằng Chrome có Browser Wallet (Testnet) → **Approve with Concordium wallet** → chọn account → Approve.
   Có 5 phút.
3. Agent nhận kết quả `ok`, đọc lại log: `connection pool healthy`.
4. Thử bị chặn: `Xoá dữ liệu của customer-db đi.` → gateway trả `work_order_out_of_scope`; agent phải
   báo lại lý do, không tìm đường khác.
5. (Tuỳ chọn) Kill switch của khách hàng: bấm nút đỏ trên bảng điều khiển → lệnh tiếp theo của agent bị chặn với lý do
   `work_order_suspended_by_customer`. Muốn chạy tiếp phải cấp phiếu mới.
6. (Tuỳ chọn) Thu hồi phiếu giữa chừng: ở terminal khác chạy
   `pnpm --filter @mandate-gate/issuer wo revoke .data/work-orders/current.json --sponsor`; khoảng 15 giây sau,
   mọi lệnh của agent bị chặn với lý do `work_order_revoked`.

## Kiểm lại sau demo

```bash
pnpm --filter @mandate-gate/gateway verify-audit $PWD/.data/gateway --gateway 2zmbEkwHcYCMz6369NicRQmu1bpxGS33KRM2PE4QAxUfQLWch8
```

## Nếu lỗi

| Hiện tượng | Cách xử lý |
|---|---|
| `/mcp` báo `mandate-gate` failed | Chạy `sh demo/claude-agent/mandate-gate-proxy.sh` để xem lỗi (thiếu `~/ccd-keys/agent-evm.json`, chưa `pnpm install`) |
| Mọi lệnh bị `work_order_expired` | Cấp phiếu mới, tắt rồi chạy lại `pnpm demo:up` |
| `connection refused` | Terminal 1 chưa chạy `pnpm demo:up` |
| Deploy bị cắt sau 60 giây | Claude Code chưa nhận `MCP_TOOL_TIMEOUT`: thoát và mở lại bằng `MCP_TOOL_TIMEOUT=420000 claude` |

Mỗi lần deploy: ví agent trả 0,5 CCD; gateway-B gửi khoảng 4 giao dịch (VRA, VAA, tài trợ phí thanh toán,
neo audit). Mỗi lần cấp phiếu thêm 1 giao dịch của công ty A (gateway-B trả phí).
