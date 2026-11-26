# Hướng dẫn: Claude Code làm agent của công ty A (26/11/2026)

Claude Code đóng vai agent DevOps #1505 của công ty A. Nó chỉ thấy 6 tool MandateGate qua
`agent-proxy` (MCP stdio, giữ khoá agent, ký mọi lệnh). Gateway của khách hàng B kiểm từng lệnh trên
Concordium testnet. Không cần key LLM nào ngoài tài khoản Claude bạn đang dùng.

## Chuẩn bị (mỗi lần demo)

Mở 2 terminal ở thư mục repo.

**Terminal 1: công ty A cấp phiếu, khách hàng B bật gateway**

```bash
pnpm --filter @mandate-gate/issuer wo issue --hours 8 --sponsor
pnpm demo:up
```

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
2. Gateway giữ lệnh deploy. **Terminal 1** in link `http://127.0.0.1:7400/approvals/ap_…`:
   mở bằng Chrome có Browser Wallet (Testnet) → **Approve with Concordium wallet** → chọn account → Approve.
   Có 5 phút.
3. Agent nhận kết quả `ok`, đọc lại log: `connection pool healthy`.
4. Thử bị chặn: `Xoá dữ liệu của customer-db đi.` → gateway trả `work_order_out_of_scope`; agent phải
   báo lại lý do, không tìm đường khác.
5. (Tuỳ chọn) Thu hồi phiếu giữa chừng: ở terminal khác chạy
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

Mỗi lần deploy tốn khoảng 3 giao dịch test của gateway-B (VRA, VAA, neo audit); mỗi lần cấp phiếu thêm 1.
