# Ghi chú phiên làm việc (03/11 – 20/11/2026)

> Ghi chú ngắn để tiếp tục công việc ở phiên sau. **Bản mới nhất: `Tong-hop-sau-W6.md` (v5, 20/11)**; chi tiết thiết kế L1–L4 vẫn ở `Tong-hop-sau-W4.md`.

## 0j. ✅ Trang duyệt 216 KB đã thử với Browser Wallet (26/11, tối)

Phiếu `aa3a7082…` (neo `3f45de1f…0d4b`). Lệnh deploy qua proxy → seq 45 `payment_required` → seq 47 VRA
`1a3f6ee0…a980` → seq 48 duyệt bằng ví (VAA `3d3e692e…f285`) → seq 49 thanh toán 0,5 CCD `d57ad92d…0cec` →
seq 50 allow, neo `7bd7c4d8…1c45` → seq 51 deploy chạy. Ctrl+C neo nốt (`e4613278…ef66`, seq 51);
`verify-audit`: 52 bản ghi, mọi anchor MATCH, RESULT OK. Bundle không WASM dùng được với ví, không cần `MGATE_FULL_BUNDLE`.

## 0i. ✅ Demo đầy đủ với Claude Code + x402 (26/11, 21:25 giờ VN)

Claude Code (thư mục `demo/claude-agent`) nhận câu "Service payments đang chậm và báo lỗi…", tự đọc
status và log, xác định v2.2.0 rò kết nối, gọi `deploy_prod` v2.2.1. Audit log (`.data/gateway`):
seq 25 `payment_required` → proxy tự trả bằng ví agent → seq 28 VRA `b4fadf92…59a8` → seq 29 bạn duyệt
bằng Browser Wallet, VAA `1e77c500…de96` → seq 30 **thanh toán 0,5 CCD** từ ví agent `4WZGyWnH…`
(`0f1a6ba9…1425`, gateway-B trả phí; đã chi 0,5/10 CCD) → seq 31 allow → **neo audit `982d5ba2…cb6d`** →
seq 32 deploy chạy; log sau deploy: pool 6/20, p99 210 ms. Mọi request ghi `runtime=claude-code`.
`verify-audit`: 39 bản ghi nguyên vẹn, anchor seq 31 MATCH. Các lệnh đọc sau đó (seq 33–38) chưa neo vì
gateway chỉ neo trước hành động cấp 2; muốn neo định kỳ thì thêm `"audit": {"intervalSeconds": 300}`.
Hai tình huống bị chặn cũng chạy với Claude Code: seq 42 xoá dữ liệu customer-db → `work_order_out_of_scope`;
thu hồi phiếu `wo_20261126_e652ec` (`wo revoke … --sponsor`) → seq 43 đọc log → `work_order_revoked`.

## 0h. L3 + L4 đã cài (26/11, rạng sáng)

- **Node 22** cho cả repo (`.nvmrc`, `engines`, CI). Shell mới đã dùng 22.23.3; nếu một shell cũ còn Node 20: `nvm use 22`.
- **Độ trễ thu hồi:** follower poll khối finalized theo height mỗi 1 s → khoảng 14,5 s sau khi giao dịch thu hồi finalized (phần còn lại do node). Tạm chấp nhận.
- **L4:** `packages/gateway/src/anchorer.ts`. Trước mọi hành động cấp 2, gateway neo đầu chuỗi audit (`MGATE-AUD {hash, seq}`) bằng gateway-B; neo không finalized → từ chối `audit_anchor_failed`. Kiểm lại: `pnpm --filter @mandate-gate/gateway verify-audit <thư mục audit>` (chỉ đọc chain).
- **L3:** `approvals.ts` (giữ hành động 5 phút, dùng một lần, kiểm commitment người duyệt) + `verifier.ts` (V&A V1 thật: `createAndAnchor` VRA với `ResourceID = D`, `createChecked`, bắt buộc credential gắn account, neo VAA). Trang duyệt: `http://127.0.0.1:<port>/approvals/<id>` (bundle `web/approve.ts`, build bằng esbuild). Mọi giao dịch của gateway-B đi qua một hàng đợi tuần tự (`txqueue.ts`).
- Phiếu giao việc có thể chỉ định người duyệt: `pnpm --filter @mandate-gate/issuer wo issue --approver <credId>`; salt nằm ở `.data/work-orders/<id>.approver-salt`, đưa cho kỹ sư qua link `…/approvals/<id>#salt=<salt>`.
- 38 test offline qua (12 core + 26 gateway, có 8 test L3/L4 với chain giả).
- **Chạy live 26/11 (chưa có người duyệt):** phiếu `wo_20261125_79ccf5` (neo `f3ea07a9…d36b`, gateway-B trả phí), VRA thật `3e8b0b9f…8677` (ResourceID = D, ConnectionID = mã phê duyệt, ContextString = câu đồng ý; trang duyệt tải request thật, không lỗi). Kết quả: logs/restart ok, data_delete bị chặn (ngoài phạm vi), **deploy_prod bị từ chối `approval_timeout`** sau 5 phút (đúng, không ai duyệt), mạo danh và thiếu phiếu bị chặn. Neo audit cuối phiên `85ef4f47…a9b6` (seq 11); `verify-audit` → chuỗi nguyên vẹn, **MATCH**, RESULT OK.
- ✅ **Duyệt live bằng Browser Wallet thành công (26/11, 00:10 giờ VN):** phiếu `wo_20261125_82e94e` (neo `577019fe…9df`). Thứ tự trong audit: seq 8 `approval_requested` (VRA `0ac27871…3227`) → seq 9 `approval` (proof gắn account, issuer `did:ccd:testnet:idp:0`, VAA `ad476804…241d`) → seq 10 quyết định allow → **neo `MGATE-AUD` seq 10 `29908ace…f37d` finalized** → seq 11 deploy chạy. Neo cuối phiên `0bb026b4…05b0` (seq 13). `verify-audit`: chuỗi nguyên vẹn, 2 anchor MATCH, RESULT OK. (Không ghi credential ID vào repo.)
- *(Đã làm)* **Việc bạn cần làm (khoảng 5 phút):** chạy lại lệnh live trong README (`LIVE_APPROVAL=1 …`), mở link in ra bằng Chrome có Browser Wallet (Testnet), bấm **Approve with Concordium wallet**, chọn account, Approve. Gateway sẽ kiểm proof, neo VAA, neo audit rồi mới deploy.

## 0g. ✅ S1 hoàn tất (25/11, tối) — gateway chạy thật với chain

| Bước | Kết quả | Link |
|---|---|---|
| Cấp phiếu `wo_20261125_1e788a` (agent 1505, 5 thao tác, hạn 8 giờ), anchor `MGATE-WO` từ company-A, **gateway-B sponsor phí** | Finalized; company-A trả 0 CCD, gateway-B trả ~5,3 CCD (`sponsorDetails`) | https://ccdexplorer.io/testnet/transaction/ffd8f75ffddebc1719a0d551dc53e1053532b8572c8e74c1687b35b46bd19030 |
| Gateway chạy chế độ chain (kiểm agent on-chain + theo dõi block) | `logs_read`, `service_restart` → ok · `data_delete` → `work_order_out_of_scope` · `deploy_prod` → `approval_required` · mạo danh #601 → `agent_key_owner_differs_from_agent_owner` · thiếu phiếu → `work_order_missing_or_malformed` | `packages/gateway/scripts/testnet-e2e.ts` |
| Thu hồi: anchor `MGATE-WOREV` (company-A tự trả ~4,25 CCD) | Gateway thấy thu hồi rồi từ chối `work_order_revoked`; độ trễ ~20–30 s sau khi finalized (follower đọc từng block, cần tối ưu) | https://ccdexplorer.io/testnet/transaction/aa1cac7f1a2eb1802faedfef223ad35be2c990dba284a978ab33516cbe2c4ab9 |

Công cụ của công ty A: `pnpm --filter @mandate-gate/issuer wo issue [--sponsor]` / `wo revoke <file> [--sponsor]` (phiếu lưu ở `.data/work-orders/`, không commit).
Việc tiếp: tối ưu follower (độ trễ thu hồi xuống vài giây), anchor audit `MGATE-AUD` từ gateway-B (L4), rồi L3 (hàng chờ duyệt + Verify & Access V1).

## 0f. ✅ S0 hoàn tất (25/11, tối)

**Trang agent (GitHub Pages):** https://dholmes0207.github.io/concordium-trusted-agents-hackathon/ — tự kiểm 6 điều trong trình duyệt người xem (registry, Active, URL, SHA-256 tự tính, owner, badge check của Concordium); nguồn ở `site/index.html`, đăng bằng workflow `.github/workflows/pages.yml` (Pages source: GitHub Actions).

| Bước | Kết quả | Link |
|---|---|---|
| Tx 1: CIS-8004 `register` (company-A) | Agent **token 1505**, Active, badge `JyP9Y8gnY2peWyyQMsrAk` | https://ccdexplorer.io/testnet/transaction/105b018650e557f75b1ebd940be2c2f5a2594b84ff2f80c8bd0558b24991bb65 |
| Agent Card | `agent-card/mandate-gate-devops-agent.json` (3.075 byte, SHA-256 `b7242ac8…c0ca`), host bằng raw GitHub; **không được sửa file** | https://raw.githubusercontent.com/dholmes0207/concordium-trusted-agents-hackathon/main/agent-card/mandate-gate-devops-agent.json |
| Tx 2: `setAgentURI` (ghim URL + hash) | OK | https://ccdexplorer.io/testnet/transaction/50eb19421df3173f9b2664f754d8d7a522b1d2aeaae594f53a91b2f583b72eba |
| Tx 3: CIS-8 `registerExternalKey` (key EVM `0xA319…c650`, `eip155:84532`) | OK | https://ccdexplorer.io/testnet/transaction/d219aef839d039136d67160d0053b83c90b7b86fb46c850f3f20fdbea39dd72a |
| Kiểm L1 của gateway | **`ok: true`**, không lý do lỗi | `pnpm --filter spike-s0-agent-key verify-agent 1505 <company-A>` |
| Check badge của Concordium | `badge_valid: true` | `agent-registry-mcp.concordium.com/v1/check-badge/JyP9Y8gnY2peWyyQMsrAk?network=testnet` |
| Mạo danh agent #601 bằng key của mình | Bị chặn: `key_owner_differs_from_agent_owner` | |

agentcards.site không dùng được (CDN esm.sh lỗi 500 với `@concordium/web-sdk@12`), nên chuyển sang hướng B: tự host card trong repo, tự đăng ký bằng script (bạn duyệt 25/11).

## 0e. Account testnet cho demo (25/11)

| Vai trò | Địa chỉ | Index | Ghi chú |
|---|---|---|---|
| **company-A** (owner agent, cấp phiếu giao việc) | `3zKuq9cgzYgSs1cXE2ugGq3WkBNkPsAChj1fLSH8HhoQXoNL6s` | 19840 | Identity 1 (IdP 0), 20.000 CCD test |
| **gateway-B** (anchor audit, sponsor phí) | `2zmbEkwHcYCMz6369NicRQmu1bpxGS33KRM2PE4QAxUfQLWch8` | 19843 | Identity 1 (IdP 0), 20.000 CCD test |
| Key agent (EVM, CIS-8) | `0xA3198Ee065B9f633aa36030C34310836Bf37c650` | — | `~/ccd-keys/agent-evm.json` |

Còn chờ: xuất key 2 account vào `~/ccd-keys/company-A.export`, `~/ccd-keys/gateway-B.export`; mint agent trên agentcards.site bằng company-A.

## 0d. Cập nhật cuối phiên 25/11 (đêm)

| Phần | Trạng thái |
|---|---|
| Repo | **Public**; CI GitHub Actions chạy xanh; license Apache-2.0 |
| Discord | `Tailieu/Discord/` đã **xóa khỏi toàn bộ lịch sử** (git filter-repo, force-push `main` và `claude/charming-clarke-wr8iqq`); bản gốc ở `~/hackathon-private/Discord/`. Lưu ý: GitHub có thể còn giữ commit cũ theo mã SHA một thời gian; ref PR #1–#6 không chứa thư mục này |
| L1 on-chain | ✅ `packages/gateway/src/agents.ts`: agent_of, check_badge, tự tải card và so SHA-256, `owner_of_key` (khôi phục public key từ chữ ký request), owner allow-list; cache 60 s, kiểm lại ngay trước thao tác mức 2. Chạy thật với agent #601 testnet: 5 phép kiểm qua, `key_not_bound` + `owner_not_onboarded` đúng như mong đợi (`pnpm --filter spike-s0-agent-key verify-agent 601`) |
| L2 | ✅ Phiếu giao việc (schema, hash JCS, scope, hạn, rate limit); `MandateIndex` theo dõi block finalized, nhận `MGATE-WO`/`MGATE-WOREV` chỉ từ issuer tin cậy, fail-closed khi quá 30 s không thấy block; proxy mang phiếu theo mỗi request |
| L3 (nền) | ✅ Digest `D`, câu consent theo mẫu cố định, commitment người duyệt. Chưa: hàng chờ duyệt + yêu cầu V&A V1 + VRA (cần key gateway-B) |
| Test | ✅ 30 test offline (12 core + 18 gateway, gồm 10 test L2 với chain giả) |
| Chạy gateway thật | `packages/gateway/gateway.config.example.json` (chế độ chain: `onboardedOwners`, `mandates.trustedIssuers`) |

**Việc kế tiếp khi có account (company-A, gateway-B) và agent đã mint:**
1. `pnpm --filter spike-s0-agent-key cis8 <company-A>` → gửi CIS-8 bằng key company-A (cần thêm bước submit dùng `spikes/s1-anchor/signer.ts`).
2. `verify-agent <tokenId> <company-A>` phải trả `ok: true`.
3. `pnpm --filter spike-s1-anchor anchor --submit company-A.export`; thêm sponsor bởi gateway-B.
4. Công cụ cấp/thu hồi phiếu cho A (CLI: tạo work order JSON + anchor `MGATE-WO`/`MGATE-WOREV`).
5. L3: hàng chờ duyệt (giữ request ≤ 5 phút), trang phê duyệt, yêu cầu V&A V1 (`ResourceID` = D), kiểm presentation.

## 0c. Trạng thái code (cuối ngày 25/11)

| Phần | Trạng thái |
|---|---|
| Monorepo pnpm | `packages/core`, `packages/gateway`, `packages/agent-proxy`, `packages/mock-ops`; `spikes/s0-agent-key`, `spikes/s1-anchor`, `spikes/s3a` |
| L1 (phần không cần chain) | ✅ Envelope ký EIP-191 (`MGATE/v1/request`), kiểm audience/hạn/params/chữ ký; idempotency sống qua restart; giới hạn kích thước body (413) |
| Gateway MCP | ✅ 6 tool (mức 0/1/2); mức 2 tạm trả `approval_required`; agent được ghim trong config cho tới khi có kiểm on-chain (S0) |
| L4 (bản đầu) | ✅ Audit log chuỗi hash + nonce; công cụ kiểm toàn vẹn |
| Test | ✅ 15 test offline (7 core + 8 end-to-end) |
| CI | ⚠️ Workflow `.github/workflows/ci.yml` đã có (chặn file key, typecheck, test; Node 22, pnpm 12.6), chạy local đều qua. **Trên GitHub chưa chạy:** lượt 25/11 bị GitHub từ chối vì *"recent account payments have failed or your spending limit needs to be increased"* (Billing & plans của tài khoản). Cách xử lý: bạn kiểm Billing trong GitHub Settings, hoặc CI sẽ tự chạy miễn phí khi repo chuyển public (07/12) |
| S0 | Key agent đã tạo (`~/ccd-keys/agent-evm.json`, địa chỉ `0xA3198Ee065B9f633aa36030C34310836Bf37c650`); payload CIS-8 dựng thử OK. **Chờ:** account company-A, mint agent trên agentcards.site |
| S1 | Script `anchor.ts` (chạy khô OK, `--submit <file key>` để gửi) và `watch.ts` (theo dõi block, fail-closed). **Chờ:** file key của company-A / gateway-B |
| Đã dọn | Xóa thư mục mẫu `app/`, `contracts/`; README gốc viết lại theo dự án |

**Việc tiếp theo của mình (khi có account và agent):** chạy S0 đầy đủ (gửi CIS-8 bằng key company-A, 5 phép kiểm on-chain, thay agent ghim bằng kiểm chain), chạy S1 (`--submit`, thêm sponsor bởi gateway-B), rồi L2 (phiếu giao việc + thu hồi).

**Đã chốt 25/11 (bạn trả lời "oke cả"):** xóa `app/`/`contracts/` (đã làm theo đề xuất) · license Apache-2.0 · phân loại thao tác mức 0/1/2 · giữ request chờ duyệt 5 phút · x402 0,5 CCD/thao tác mức 2, hạn mức 10 CCD/phiếu · nâng Node 22 · Billing: **repo đã chuyển public 25/11** để CI chạy miễn phí. License Apache-2.0 đã thêm (`LICENSE`).

## 0b. Quyết định (25/11)

- ✅ **D1:** HolmesGPT là agent chính trong demo; Claude Code chạy song song làm dự phòng (Piotr 24/11: gateway + agent MCP có sẵn là đúng tinh thần "your existing agent").
- ✅ **D2:** key EVM (secp256k1) gắn qua CIS-8, namespace `eip155:84532` (Base Sepolia); key nằm trong `agent-proxy`, không trong agent (Piotr 24/11: namespace mainnet hay testnet đều được).
- ✅ **D3:** duyệt bằng Browser Wallet (proof gắn account, đã chạy ở S3a) trước; sau đó thêm **ID App** (consent hiện đúng hành động, kỹ sư reveal họ tên để gắn đúng người) và dùng ID App trong video. Gateway giữ request chờ duyệt tối đa ~5 phút. Bạn **chưa có ID App** → cài và tạo danh tính testnet trước ~02/12.
- ✅ **D4:** x402 bằng CCD test; `agent-proxy` tự trả trong hạn mức ghi trên phiếu giao việc; facilitator tự chạy bằng `@x402/concordium`. Chỉ làm sau khi lõi L1–L4 + Browser Wallet + ID App chạy; tối đa 1,5 ngày.
- Công ty A: tạm dùng account cá nhân (Global FinReg dừng ở bước Veriff).
- Thứ tự ưu tiên khi thiếu thời gian: L1–L4 → duyệt Browser Wallet → ID App → x402.

## 0a. Cập nhật 24/11

- Đợt hỏi 2 đã đăng (23:12). Piotr: office hours **bất đồng bộ trên Discord**; tiêu chí chấm chi tiết đã gửi Encode, sắp lên trang programme. Câu 2, 3, 5 và câu Veriff đang chờ (bảng ở `Cau-hoi-Discord.md` mục 5.3).
- Global FinReg testnet: đi được bước 1–3 (công ty giả "Mandate Gate Demo Co., Ltd", file PDF test), **dừng ở bước 4 Veriff (ID + selfie)**. Đề xuất: account cá nhân đóng vai công ty A cho tới khi Piotr trả lời.

- ✅ **Spike S3a đạt** (xem `spikes/s3a/README.md`): Browser Wallet trả lời V&A V1 bằng proof gắn account; `ResourceID` nằm trong anchor VRA; proof mang `credId` cố định; ví không hiện context → **D3 = MVP-C**.

- Project **Mandate Gate** đã tạo, 2 thành viên, challenge "Make your Agents Accountable with Concordium". ✅ **Checkpoint 1 đã nộp 24/11** (thông báo "Your submission has been saved"; nút đổi thành "View / Edit Submission"). Ô "Your idea, in a paragraph" dùng đoạn ở `~/hackathon-private/Discord/Tong-hop-Discord-20-24-11.md` (chỉ lưu ở máy) mục 6, có thêm câu mở đầu "Brief: Make your Agents Accountable with Concordium."
- Piotr `@here` 24/11: hỏi ai cần facilitator x402 testnet, EurQ, câu hỏi bị sót. Gợi ý trả lời: `~/hackathon-private/Discord/Tong-hop-Discord-20-24-11.md` (chỉ lưu ở máy) mục 4.
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
