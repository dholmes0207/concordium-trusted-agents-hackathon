# Báo cáo Workshop 06: Plug into the agent stack you already use

> **Buổi:** T4 18/11/2026, 15:00 UTC (22:00 giờ VN), khoảng 57 phút. Buổi workshop cuối.
> **Diễn giả:** Doris Benda (trình bày cho Concordium). Điều phối: Yashar Ajdari (Encode).
> **Nguồn:** video ghi lại (`Workshop06/Workshop06.mp4`, chỉ lưu local), 38 ảnh slide trong [Workshop06/slides/](Workshop06/slides/), bản chép lời Whisper [Workshop06/Workshop-06-transcript-EN.txt](Workshop06/Workshop-06-transcript-EN.txt), bản tóm tắt chính thức trên trang programme của Encode (đọc 20/11), tài liệu MCP service và repo `ccd-agent-kit` (đọc 20/11).
> Mốc `[mm:ss]` theo bản chép lời. Bản chép lời tự động có lỗi tên riêng (ví dụ "batch" = badge, "cloud" = Claude, "UP keys" = YubiKey).

---

## 1. Tóm tắt một đoạn

Buổi cuối chỉ cách cắm Concordium vào stack agent sẵn có qua ba giao diện: **MCP** (agent → công cụ), **A2A** (agent → agent) và **x402** (agent → thanh toán). Concordium có **hai MCP server**: bản **hosted** của Agent Registry (chỉ một URL, 41 tool, có indexer, không giữ key) và bản **local `ccd-agent-kit`** (giữ key trên máy bạn; tách *chain client* dựng và gửi giao dịch khỏi *signer* giữ key và **bị khóa cho tới khi người mở**). Bốn demo chạy trong Claude Code và trình duyệt: tra badge, dựng giao dịch mà không ký được, người mở khóa signer rồi agent mới ký và gửi, kiểm một agent qua Agent Card A2A. Buổi kết thúc với quy trình **discover → verify (năm phép kiểm) → pay**, lộ trình và "giờ đầu tiên" của build window.

**Bốn điều quan trọng nhất cho dự án** (điều 4 ở phần hỏi đáp):
1. **"Agent build được nhưng không tiêu được; người mở khóa thì agent mới tiêu"** (slide 19–20). Đây chính là tinh thần L3 (phê duyệt của người) của dự án, ở mức ký giao dịch. Dự án mở rộng nó ra **thao tác off-chain** trên hạ tầng của khách hàng.
2. **Năm phép kiểm cho mọi Agent Card, mọi lần**: trusted registry · active · same URL · same bytes · same owner (slide 29). Dùng làm L1 của gateway.
3. Gateway nên là **MCP server**: mọi agent nói MCP (Claude Code, Cursor, LangChain, OpenAI Agents SDK) cắm vào được mà không phải sửa (slide 14, 16).
4. Một người tham gia hỏi cách **bắt buộc xác nhận bên ngoài model** khi agent chạy tự động; câu trả lời chỉ là "kiểm tay và để ít tiền" [48:40]. Đây đúng là khoảng trống dự án lấp. Encode cũng thông báo **không còn office hours**, chỉ hỏi qua Discord [54:41].

---

## 2. Nội dung theo phần

### 2.1 Ba giao diện, một câu hỏi [00:43–02:48]

Slide 03–04. Mỗi giao diện đều cần biết **ai đứng sau bên kia**:

| Giao diện | Hướng | Ví dụ |
|---|---|---|
| **MCP** | Agent → công cụ | Tra agent, kiểm badge, đọc chain, dựng giao dịch |
| **A2A** | Agent → agent | Tìm agent, đọc Agent Card, giao việc |
| **x402** | Agent → thanh toán | Trả tiền theo request bằng stablecoin (W3) |

*"Concordium adds: an on-chain record of who is accountable for each agent."*

### 2.2 MCP và server hosted của Agent Registry [02:48–23:29]

**MCP là gì** (slide 06): "USB-C cho AI". Không có chuẩn thì 3 agent × 3 công cụ = 9 tích hợp riêng; có MCP thì mỗi bên theo một chuẩn. Server có thể **local** (chương trình trên máy) hoặc **remote** (một URL).

**Luồng hỏi Claude "badge này có hợp lệ không"** (slide 07) [05:09–08:46]: khi khởi động, Claude Code hỏi server danh sách tool (41 tool, tên, mô tả, input) → người dùng hỏi → model chọn tool `check_badge` → Claude Code gọi server → kết quả (valid, active, card không đổi) → model diễn đạt lại. **"Valid"** nghĩa là agent còn Active (chưa revoke) và hash của Agent Card off-chain khớp hash đã ghi on-chain.

**Server hosted** (slide 09) [09:14–13:19]
- URL `agent-registry-mcp.concordium.com/mcp`. **Không giữ key**, nên chỉ đọc chain và **dựng** giao dịch (trả bytes để ví ký).
- Không cần account hay API key; **giới hạn theo IP**.
- Có **indexer** từ genesis tới nay: tìm, liệt kê, lịch sử agent mà không phải tự chạy indexer.
- Có **REST + Swagger** ở `/docs` [11:31–13:19]: demo gọi `check-badge` trả `status: active` và các phép kiểm đều `true`.

**41 tool, năm nhóm** (slide 11)

| Nhóm | Số tool | Ví dụ |
|---|---|---|
| Discovery (cần indexer) | 5 | `list_agents`, `search_agents`, `recent_registrations`, `agent_history` |
| On-chain lookups | 9 | `agent_of`, `agents_by_owner`, `is_active`, `get_agent_wallet` |
| Builders CIS-8004 | 11 | `build_register`, `build_set_agent_uri`, `build_revoke` |
| Builders CIS-8 keys | 5 | `build_cis8_register`, `build_cis8_revoke` |
| Utilities | 11 | `check_badge`, `verify_agent_card`, `get_badge_json`, `build_agent_card` |

*"Always pass network: mainnet, testnet or devnet. The hosted default is mainnet."*

**Demo 1: registry trong Claude Code** (slide 12–13) [14:55–21:34]
- `claude mcp add --transport http concordium-registry https://agent-registry-mcp.concordium.com/mcp`, rồi **khởi động lại Claude Code** để nạp tool.
- Kiểm một badge testnet hợp lệ; kiểm một badge **không hợp lệ**: *"metadata hash is empty"*, card thiếu `tokenAddress`, dữ liệu trong card lệch on-chain [18:38–19:28].
- Hỏi các agent của một owner và bao nhiêu còn Active (cần indexer, nhiều bước); hỏi tổng số agent trên testnet và mainnet, khớp với dashboard.

**Cùng server, mọi framework** (slide 14): LangChain (`langchain-mcp-adapters`), OpenAI Agents SDK (`MCPServerStreamableHttp`), MCP Python SDK.

**Năm điều cần biết trước khi build** (slide 15): luôn truyền `network` · server dùng MCP `2024-11-05`, client hiện tại vẫn kết nối được · Claude Desktop: thêm ở Settings → Connectors · **giới hạn theo IP: gặp HTTP 429 thì chờ rồi thử lại, không gọi trong vòng lặp** · sau `claude mcp add` phải mở phiên mới.

### 2.3 `ccd-agent-kit`: server local, key tách riêng [23:29–33:48]

**Hai MCP server** (slide 16)

| | Agent Registry MCP (hosted) | `ccd-agent-kit` (local) |
|---|---|---|
| Chạy ở | Server của Concordium, chỉ một URL | Máy của bạn, với key của bạn |
| Đọc | Agent, badge, Agent Card | Account, số dư, token, contract, block |
| Ghi | Chỉ **chuẩn bị** giao dịch registry | **Dựng, ký và gửi** mọi giao dịch |
| Dùng khi | Cần tìm hoặc kiểm một agent | Agent phải trả tiền, ký hoặc gửi |
| Cài | Không cần | Build từ mã nguồn |

*"Why the split: hosted = shared indexer, nothing to install. Local = your keys stay with you."*

**Ba bước, key để riêng** (slide 17) [26:38–27:43]: **Build** (chain client đọc số dư, token, contract; dựng giao dịch chưa ký; không giữ key) → **Sign** (signer, phần duy nhất giữ key; **bị khóa, người phải mở**) → **Submit** (chain client gửi; chỉ gửi khi được yêu cầu rõ ràng).

Repo `github.com/Concordium/ccd-agent-kit` (đọc 20/11): Apache-2.0, Node.js ≥ 22, các gói `ccd-config-manager` (mạng, nơi giữ key, **YubiKey**, policy), `ccd-chain-client`, `ccd-signer`, `ccd-id-manager` (tạo và khôi phục danh tính, tạo proof, chuẩn bị mở account), `ccd-skills`. Repo còn mới (vài commit), phát hành qua GitHub Releases.

**Thêm server local** (slide 18): `claude mcp add ccd-chain-client -e CCD_NETWORK=testnet -e CCD_GRPC_ENDPOINT=grpc.testnet.concordium.com:20000 -- …` và `claude mcp add ccd-signer -e CCD_NETWORK=testnet -- …`.

**Demo 2: agent dựng được nhưng không tiêu được** (slide 19) [28:21–31:10]: trong Claude Code: liệt kê token trên testnet, xem số dư CCD của một account, **dựng một lệnh chuyển 0,000001 CCD "không ký, không gửi"**, hỏi signer có key nào. *"The agent built a real transaction. The signer is locked: it cannot sign."*

**Demo 3: người mở khóa, agent mới tiêu** (slide 20) [31:10–33:48]: (1) bảo Claude ký → **bị từ chối `ENCRYPTED_STORAGE_LOCKED`** · (2) terminal: `ccd-config-manager service signer instances` · (3) terminal: `ccd-config-manager service signer unlock --instance <id>` → **hỏi mật khẩu** · (4) bảo Claude ký và gửi · (5) mở giao dịch trên `ccdexplorer.io/testnet`. *"The agent spends only after a human unlocks the signer."*

**Dạy trợ lý code về Concordium** (slide 21): `docs.concordium.com/llms.txt` · Registry MCP · **Skill.md** (skill cho agent của Concordium: khái niệm, công cụ, luật an toàn; tải ở `concordium.com/build/ai-agent-technology`).

### 2.4 A2A [34:24–37:44]

- **A2A: "let agents hire agents"** (slide 22–23): chuẩn mở (v1.0, Linux Foundation, 6 SDK chính thức, hơn 170 đối tác). Ba bước: **Find** (đọc Agent Card: JSON gồm tên, kỹ năng, địa chỉ) → **Ask** (gửi message qua HTTP) → **Get** (agent kia làm và trả kết quả).
- **Card A2A chuẩn và card Concordium** (slide 24): cả hai đều là card A2A v1.0 hợp lệ với cùng các trường lõi (`name`, `description`, `supportedInterfaces`, `capabilities`, `skills`). Phần riêng của Concordium **chỉ là extension badge** (`tokenAddress`, `owner`), cộng `type: …eip-8004#registration-v1` và `registrations`.
- **Demo 4: kiểm một agent trong trình duyệt** (slide 25): tra agent 601 trên chain (`agent-registry-indexer.concordium.com/agents/601?network=testnet`: owner, Active, URL và hash của card) → mở Agent Card → `agent-registry-mcp.concordium.com/v1/check-badge/<badge>` trả `badge_valid: true`. *"The card on the web and the record on chain tell the same story."*

### 2.5 Từ một agent tới nhiều agent: discover, verify, pay [37:44–41:56]

**Số liệu 12/11/2026** (slide 27): mainnet **5.136 agent**; testnet **1.167**; một owner testnet có **4 trên 148** card hợp lệ (đa số thiếu hash hoặc card đã đổi). *"Registered is not the same as verified. Check every card, every time."*

**Bước 1: discover** (slide 28): `search_agents`, `list_agents` (lọc Active / Revoked, owner), `agents_by_owner`, `recent_registrations`, `agent_history`. REST indexer: `agent-registry-indexer.concordium.com`.

**Bước 2: luôn chạy năm phép kiểm** (slide 29)

| # | Phép kiểm | Nghĩa |
|---|---|---|
| 1 | Trusted registry | Badge trỏ tới contract registry được tin |
| 2 | Active | Chain xác nhận agent tồn tại và chưa bị revoke |
| 3 | Same URL | URL vừa tải đúng là URL ghi on-chain |
| 4 | Same bytes | SHA-256 của card vừa tải bằng hash on-chain |
| 5 | Same owner | Owner ghi trong card là owner on-chain |

**Rồi thêm luật riêng** (slide 30): **owner allow-list** (chỉ làm việc với owner đã biết, ví dụ đội của mình) · **recent changes** (`agent_history`: owner mới hoặc URL card mới thì xem lại) · **re-check before big actions** (trạng thái có thể đổi). *"The registry gives facts. Your agent decides."*

**Bước 3: pay** (slide 31): **x402** (bên bán báo giá, bên mua ký thanh toán, bên bán thực hiện) · **stablecoin có sẵn trong chain** (PLT euro hoặc USD; account có danh tính mới giữ được) · **ZK proof** (giá có thể kèm yêu cầu proof, ví dụ trên 18 tuổi; bên bán biết có / không, không biết ID).

### 2.6 Lộ trình [41:56–44:58]

**Đã có** (slide 33): AI Agent Registry · Verified by Concordium Badge · hơn 200 mạng · Registry MCP + xác minh A2A · Concordium MCP Server · x402 Payment Flows.

**Sắp tới** (slide 34, *"targets, not promises"*)

| Thời điểm | Mục | Mô tả |
|---|---|---|
| 11/2026 | **AI Agent Tool Kit** | SDK và ví dụ cho các tính năng agent mới |
| 11/2026 | **AI Agent ID** | Agent chứng minh các chi tiết chọn lọc từ ID của bạn |
| 12/2026 | Agent ID Service | Dịch vụ danh tính đã xác minh mà agent tự dùng được |
| 01/2027 | Protocol-Level Locks | Token nằm trong account của bạn, khóa cho một nơi nhận |
| 01/2027 | Verify & Pay | Agent xác minh bằng ID của bạn và trả từ tiền đã khóa |
| 02/2027 | **Concordium Signer** | Ký mà key không nằm trong agent |

**Stack của bạn với Concordium** (slide 35): agent (LangChain, OpenAI Agents SDK, Claude Code, Cursor) · giao diện (MCP registry và agent kit, card A2A v1.0, thanh toán x402) · Concordium (Agent Registry + badge, verified ID, stablecoin PLT, sponsored transactions).

**Giờ đầu tiên của build window** (slide 36): (1) thêm registry MCP (một lệnh) · (2) đăng ký agent trên `testnet-agent-registry.concordium.com` · (3) xuất bản card có badge (`build_agent_card` hoặc `get_badge_json`, rồi ghim) · (4) kiểm agent khác bằng năm phép kiểm trước khi gọi · (5) trả bằng stablecoin test qua x402 (W3).

**Developer toolkit** (slide 37): Agent Registry MCP · MCP service docs · Agent Card and badge · Use the Agent Registry · Docs for AI tools (`llms.txt`) · `ccd-agent-kit` · A2A spec · MCP.

---

## 3. Hỏi đáp [46:28–56:56]

| Câu hỏi | Trả lời | Liên quan |
|---|---|---|
| "Valid" có nói gì về địa chỉ nhận tiền của agent không? Nếu card đổi địa chỉ thanh toán thì `check_badge` có báo không hợp lệ? [46:36] | Doris không chắc. Phép kiểm so **owner** trong card với owner on-chain; địa chỉ thanh toán có thể không gắn với owner và vẫn đổi được. Nên tự xem implementation | Nếu làm x402: gateway tự kiểm `agentWallet` on-chain (`get_agent_wallet`), không tin card |
| REST chỉ GET/POST, có chỉnh biến được không? [47:29] | Endpoint là GET/POST; tham số có kiểu (true/false, số) | — |
| ⭐ Skill.md bảo "xác nhận trước khi dựng payload thay đổi trạng thái", nhưng agent chạy tự động thì không ai xác nhận. **Có cách khuyến nghị nào để bắt buộc luật đó bên ngoài model** (hook ký phía client trước khi gửi, hoặc policy ký trong lộ trình)? [48:40] | Chưa có cơ chế cụ thể. Lời khuyên: kiểm tay giao dịch lớn; với giao dịch nhỏ thì cho agent bỏ qua bước xác nhận **và chỉ để rất ít tiền** trong account agent dùng | ⭐ **Đúng khoảng trống dự án lấp:** gateway bắt buộc luật **ngoài model**, phê duyệt gắn đúng hành động. Dẫn câu này trong bài nộp |
| Agent trả nhau bằng stablecoin trên testnet được chưa? [49:33] | **Được**, PLT đã chạy trên testnet và cả mainnet; agent có địa chỉ on-chain nên trả nhau được | x402 (mở rộng) |
| Concordium có gì đặc biệt? (phần thêm của Doris) [50:23–54:25] | **Scheduled transfer** (tiền về theo lịch; liên quan tới Locks sắp có) · **alias account** (nhiều địa chỉ cùng trỏ về một account, sàn hay dùng cho từng người nạp) | Path to production |
| ⭐ **Office hours** [54:33–54:58] | Yashar: *"we're not going to be having office hours anymore"*; mọi câu hỏi đặt trên **Discord**, đội Concordium và Encode trả lời | ⚠️ Trang chủ vẫn ghi office hours T3, T6 từ 24/11. Coi như **không có**; hỏi trên Discord |
| Ngoài hackathon có cơ hội làm với Concordium không? [55:03] | Liên hệ trên Discord; có grant program; có thể ứng tuyển | — |
| Có cách kiểm **chất lượng công việc** của agent đã đăng ký không, hay phải tự đánh giá? [55:37] | **Phải tự đánh giá.** Concordium không biết agent làm gì off-chain; cần hệ thống chấm riêng | Gateway + audit trả lời "agent đã làm gì, ai cho phép" phía khách hàng |

**Nhắc lại cuối buổi** [56:13]: Checkpoint 1 là CN 22/11; tự làm một mình hay theo đội đều phải nộp, chỉ cần bản nháp; có vấn đề thì liên hệ Encode.

---

## 4. Tác động lên dự án

| Mục | Trước W6 | Sau W6 |
|---|---|---|
| **A2A: gateway là MCP server hay HTTP proxy** | Chờ W6 | ✅ **MCP server.** Agent nói chuyện với `agent-proxy` local của A qua MCP; proxy ký request và chuyển tới gateway của B |
| **L1** | 5 phép kiểm tự đặt | Dùng đúng **năm phép kiểm của Concordium** + luật riêng: **owner allow-list** (chỉ account công ty A), **xem `agent_history`**, **kiểm lại trước thao tác mức 2** |
| **Key của agent** | Trong agent | Đặt trong **proxy** tách khỏi agent; có thể dùng `ccd-signer` cho các giao dịch on-chain của A (cấp và thu hồi phiếu) để **A phải mở khóa** mới ký được |
| **Demo** | Agent nền chưa chốt | **Claude Code** làm agent trong demo, giống cách Concordium demo; thêm một agent khác để chứng minh "agent nào cũng được" |
| **Tra cứu** | MCP hosted | REST `GET /v1/check-badge/{badge}` để đối chiếu; đọc chain trực tiếp khi ra quyết định; **không gọi lặp** (429) |
| **Agent Card** | | Xuất bản card A2A v1.0 có extension badge; card khai `skills` là các thao tác DevOps mà gateway cho phép |
| **Thông điệp bài nộp** | | Câu hỏi [48:40] cho thấy Concordium **chưa có** cách bắt buộc xác nhận bên ngoài model cho agent chạy tự động. MandateGate là câu trả lời ở tầng gateway |
| **Hỗ trợ** | Office hours T3, T6 | ⚠️ Encode nói không còn office hours; dùng Discord #general |
| **Path to production** | | **Concordium Signer (02/2027)** giữ key agent · **AI Agent ID (11/2026)** cho agent chứng minh chi tiết từ ID của owner · Verify & Pay + Locks cho phần tiền |

---

## 5. Link trong buổi

| Chủ đề | Link |
|---|---|
| Registry MCP (hosted) | `agent-registry-mcp.concordium.com/mcp` · REST/Swagger `agent-registry-mcp.concordium.com/docs` |
| Tài liệu MCP service | `docs.concordium.com/en/mainnet/technical-reference/agent-registry/mcp-service.html` |
| Indexer | `agent-registry-indexer.concordium.com` |
| Agent Registry (testnet) | `testnet-agent-registry.concordium.com` |
| `ccd-agent-kit` | `github.com/Concordium/ccd-agent-kit` |
| Docs cho AI | `docs.concordium.com/llms.txt` · Skill.md ở `concordium.com/build/ai-agent-technology` |
| A2A | `a2a-protocol.org/latest/specification` |
| MCP | `modelcontextprotocol.io` |
| Claude Code MCP | `code.claude.com/docs/en/mcp` |
| Lộ trình | `concordium.com/roadmap` |
