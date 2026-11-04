# CONCORDIUM TRUSTED AGENTS HACKATHON
## Báo cáo Workshop #2: *Prove a verified human stands behind your agent*

**Ngày:** Thứ Tư 04/11/2026, 15:00 UTC (22:00 giờ VN), dài 67 phút
**Diễn giả:** Peter Marirosans (CTO Concordium); Giles Mallinson (Encode) dẫn chương trình
**Nguồn:** video ghi lại (`Workshop02/Workshop-02-Hackathon-Encoder.mp4`, chỉ có ở máy local), transcript Whisper (`Workshop02/Workshop-02-transcript-EN.txt`), 25 ảnh slide/demo (`Workshop02/slides/`), tin nhắn chat do bạn chép lại, cùng kiểm chứng trên web.
**Ký hiệu:** ✅ chính thức (slide hoặc lời CTO) · 🟡 nguồn phụ / chưa xác minh · ⚠️ rủi ro hoặc cần hỏi lại

---

## 0. TL;DR: 7 điều quan trọng nhất

1. **Agent giữ nguyên chain đang chạy** (Ethereum, Solana hay Web2), chỉ thêm lớp danh tính chủ sở hữu có kiểm chứng của Concordium. Không cần migrate. ✅
2. **Registry = CIS-8004 (NFT agent) + CIS-8 (liên kết key ngoài) + Agent Card (JSON chuẩn A2A, hash lưu on-chain).** Badge "Verified by Concordium" được ghi vào `capabilities.extensions` của Agent Card. ✅
3. **Badge chỉ trả lời "ai đứng sau agent", KHÔNG trả lời "agent được phép làm gì".** Slide 10 ghi rõ badge *không* chứng minh quyền chi tiêu/hành động, độ an toàn của code, hay uy tín doanh nghiệp. **Đây chính là khoảng trống dành cho dự án.** ✅
4. **Ba loại key với ba quyền khác nhau:** identity credential (ai chịu trách nhiệm), agent signing key CIS-8 (agent nào đang nói, *mặc định không có quyền chi tiền*), transaction key (ai chuyển được tiền). `agentWallet` chỉ là địa chỉ nhận thanh toán. ✅
5. **Một người có thể sở hữu nhiều agent riêng biệt** (ví dụ 256 NFT). Xác minh A2A theo kiểu challenge–response: agent ký nonce mới bằng key CIS-8 riêng của nó, bên kia đối chiếu với NFT và Agent Card. ✅
6. **Agent IDP** (agent nhận *một phần* danh tính được người dùng ủy quyền, ví dụ chỉ ngày sinh) đang ở **devnet / đang phát triển**. Slide ghi rõ *"not a production capability to depend on today"*. ⚠️
7. **Câu trả lời của CTO về tiêu chí chấm "ngoài badge":** anchor bằng chứng on-chain, use case thật giữa *agent của doanh nghiệp* ↔ *agent của cá nhân*, có kèm thanh toán + consent. Ví dụ ông đưa ra là agent đi chợ hộ người dùng. ✅

---

## 1. Đầu buổi: trả lời 3 câu hỏi còn tồn từ Workshop 1 ✅

| Câu hỏi | Trả lời |
|---|---|
| Agent có chứng minh được "trên 18 tuổi" mà không lộ dữ liệu khác không? | **Có**, thông qua Agent IDP (mục 4). Cách làm chi tiết sẽ có ở các buổi sau |
| Privacy Guardians là ai, có tự ý mở danh tính được không? | Là **các luật sư có hợp đồng ràng buộc pháp lý** với quy trình cố định. Chỉ hành động khi có phán quyết của tòa và lệnh (warrant) |
| Agent đã có địa chỉ Ethereum/Solana thì cần gì để liên kết với Concordium ID? | Dùng **CIS-8** (mục 3) |

**Demo lại Verify & Access trên Android** (do buổi 1 lỗi chia sẻ màn hình):
- ID App testnet có hai lựa chọn: *Business* (IDP **Global FinReg**) và *Individual*. Testnet mặc định dùng **Concordium Test IDP**, nơi bạn điền form thông tin giả.
- **Một ví có thể chứa nhiều identity.** Nếu một identity không đáp ứng câu hỏi (ví dụ chưa đủ 18 tuổi, hoặc thiếu thuộc tính), nút xác nhận bị vô hiệu hóa và người dùng chọn identity khác.
- Luồng merchant-backend (server↔server) **nhanh hơn** luồng do trình duyệt điều khiển.
- Màn hình hiển thị dấu ✓ **domain verified**: domain đang hỏi proof được ký bởi đúng account yêu cầu.
- ⚠️ Lỗi UI đã biết của bản test: consent request **không kèm câu hỏi tuổi** vẫn cho phép chọn identity chưa đủ tuổi. Không có lỗ hổng vì không có proof nào được yêu cầu, nhưng **nếu demo consent thì nên luôn kèm một statement**.

---

## 2. Vấn đề: agent hành động, nhưng ai đứng sau? ✅ (slide 04)

Bản thân một URL, một cái tên hay một agent card **không tạo ra trách nhiệm giải trình**. Cần trả lời được 4 câu hỏi:

| Câu hỏi | Cơ chế của Concordium |
|---|---|
| Ai sở hữu agent? | Người/doanh nghiệp chịu trách nhiệm (account Concordium có danh tính) |
| Agent có thật không? | Danh tính trên chain có thể chứng minh, kèm trạng thái live/active |
| Agent làm được gì? | Capabilities và endpoints công bố trong Agent Card |
| Có tin được card không? | Nội dung card neo vào **hash bất biến** on-chain |

**Phép so sánh của Peter:** badge "Verified by Concordium" giống **ổ khóa HTTPS** trên trình duyệt. Thấy badge là biết có thực thể chịu trách nhiệm đứng sau, và *bất kỳ ai cũng tự kiểm chứng được*.

---

## 3. Kiến trúc Agent Registry ✅ (slide 05–09)

### 3.1 Các thành phần
| Thành phần | Vai trò |
|---|---|
| **Owner** | Account người/doanh nghiệp đã xác minh trên Concordium |
| **CIS-8004** | Mint **NFT không thể thay thế** cho agent; account ký giao dịch mint. Dựa trên ERC-8004 nhưng **không cần reputation registry** vì đã có identity ở tầng protocol |
| **CIS-8** | **External Key Registry**: chứng minh bằng mật mã rằng tại thời điểm đăng ký, *cùng một người* nắm cả key ngoài (ETH/SOL/…) lẫn account Concordium (ký chéo, smart contract kiểm chữ ký) |
| **Agent Card** | JSON công khai, **tương thích A2A**: `name`, `description`, `skills`, `capabilities.extensions`, `registrations`. Hash SHA-256 được lưu on-chain |
| **Badge** | Nằm trong `capabilities.extensions` (extension *Concordium badge v1*): token CIS-2 ở dạng CAIP-19, account, địa chỉ contract, **verification URL** (dán vào là ra trạng thái verify) |

Câu chốt trên slide 09: *"ERC-8004 là phép so sánh hữu ích về khả năng tương tác, không phải điểm khởi đầu."*

### 3.2 Một registry, nhiều môi trường (slide 07)
Ethereum (key EVM) · Solana (key Ed25519) · Concordium (account native + identity) → cùng ghi vào **một bản ghi CIS-8004 + CIS-8**.
- UI Registry hiện hỗ trợ **226 chain**. Nếu tính cả các chain đăng ký CIS-8 qua MCP (những chain không có ví ký trên UI), con số lên **~290–300 nền tảng**.

### 3.3 Badge chứng minh gì, và không chứng minh gì (slide 10) ⭐
| ✅ CÓ THỂ xác minh | ❌ KHÔNG tự động chứng minh |
|---|---|
| Account chủ sở hữu và trạng thái active | **Quyền chi tiêu hoặc hành động** |
| Tính toàn vẹn của Agent Card | **Độ an toàn / chất lượng code** |
| Liên kết mật mã với key ngoài | **Uy tín / độ đáng tin của doanh nghiệp** |

> *"Identity is foundational. Permissions and agent behaviour still need controls."*
> → Concordium **mời người thi xây lớp permissions/behaviour** ở phía trên. Điều này củng cố hướng **MandateOS / AgentGuard / ProofProcure** trong research cũ.

Agent có thể bị **revoke** (chỉ chủ sở hữu, phải ký). Sau khi revoke, mọi lần kiểm badge đều fail.

---

## 4. Agent IDP: mảnh ghép tiếp theo ⚠️ (slide 11)

**Luồng:**
1. Người dùng bảo agent: "tự xin một Concordium badge đi".
2. Agent tìm Agent IDP trên mạng Concordium (qua **MCP**). IDP trả về **một link cho người dùng**.
3. Người dùng mở link (trên server của Agent IDP, không phải của agent hay Concordium) → kết nối ID App/ví qua QR/deep link → **chọn đúng thuộc tính muốn tiết lộ** (ví dụ chỉ ngày sinh).
4. Agent IDP ký một identity object **chỉ chứa các thuộc tính đã tiết lộ** và giao cho agent.
5. Agent dùng object đó để **tự tạo account Concordium**, tự đăng ký vào registry, tự tạo Agent Card, và **tự sinh ZK proof** (ví dụ "người tôi đại diện trên 18 tuổi").

**Ý nghĩa:**
- Agent **không bao giờ nhận toàn bộ danh tính**. Nếu agent bị chiếm quyền, kẻ tấn công cũng chỉ có phần đã tiết lộ.
- **Phân biệt được account của agent với account của người**: mỗi account ghi rõ IDP đã cấp, nên nhìn chain là biết account nào do Agent IDP cấp. Thông tin này dùng được để đặt guardrail kiểu "agent đang tiêu tiền hay người đang tiêu tiền". Sau này protocol sẽ bổ sung metadata rõ hơn.

**Trạng thái:** slide ghi **"DEVNET / IN DEVELOPMENT"**, *"Development preview — not a production capability to depend on today."* Peter nói sẽ có buổi riêng hướng dẫn tương tác với Agent IDP.
→ ⚠️ **Đừng đặt Agent IDP làm đường găng (critical path)** của dự án. Nếu dùng thì phải có phương án dự phòng (agent dùng account của chủ sở hữu, hoặc chỉ dùng badge + CIS-8).

---

## 5. Cấu trúc account và ba loại key ✅ (slide 13–15) ⭐

### 5.1 Một ID → 26 account → nhiều credential → nhiều key (slide 13)
- **1 verified ID** tạo được **tối đa 26 account**, địa chỉ khác nhau và **không liên kết công khai được** (chỉ thiết bị của bạn biết).
- Mỗi account có **nhiều account credential**. Mỗi credential có **tối đa 255–256 transaction key**, với ngưỡng **M-of-N** (ví dụ 2-of-3 để ký).
- Với agent: có thể chọn account riêng biệt cho từng agent, hoặc dùng chung một owner. Key CIS-8 của agent tách khỏi key giao dịch của account.

### 5.2 Ba key, ba quyền (slide 14)
| | Identity credential | **Agent signing key** | Transaction key |
|---|---|---|---|
| Trả lời | *Ai chịu trách nhiệm?* | *Agent nào đang nói?* | *Ai chuyển được tiền?* |
| Là gì | Danh tính do IDP cấp | **Key ngoài CIS-8** | Key ký giao dịch của account native |
| Chức năng | Liên kết owner ↔ người/doanh nghiệp đã xác minh | Chứng minh quyền sở hữu key bằng một **A2A challenge mới** | Ký giao dịch theo ngưỡng của account |
| Ghi chú | **Luôn riêng tư** | **Mặc định không có quyền chi tiền** | **Chuyển được tiền** |

- **`agentWallet`** = *địa chỉ nhận thanh toán* trong CIS-8004/ERC-8004, **không phải key xác thực**. Ví có thể nằm ở chain khác (ví dụ Ethereum) trong khi badge nằm trên Concordium.
- Security scheme của A2A Agent Card mô tả cách xác thực; CIS-8 gắn đúng key của agent vào badge.

### 5.3 Một owner, nhiều agent có thể xác minh riêng (slide 15)
```
ONE VERIFIED OWNER ACCOUNT  (ví dụ 256 agent NFT)
 ├─ Agent A: External key A (CIS-8) → NFT A / badge A → Agent Card A (URL + hash)
 ├─ Agent B: External key B (CIS-8) → NFT B / badge B → Agent Card B
 └─ ...
A2A challenge–response:  B ký nonce mới  →  verify với CIS-8 key B  →  khớp NFT B + Agent Card B
```
→ **Xác định chính xác agent nào**, không chỉ "thuộc owner nào". Peter nói hackathon *không cần* tới 256 agent, *"trừ khi use case của bạn thật sự cần, và khi đó tôi rất muốn xem"*.

> 💡 **Hệ quả thiết kế (least privilege):** agent chỉ giữ CIS-8 signing key (dùng để chứng minh danh tính, không chi được tiền). Tiền nằm ở transaction key hoặc ví riêng, có giới hạn và yêu cầu consent. Bị lộ key của agent thì thiệt hại được khoanh vùng. Cấu trúc này hợp với mọi ý tưởng kiểu "mandate / spending policy".

---

## 6. Live demo ✅ (slide 18–25)

### 6.1 Agent Registry testnet: `testnet-agent-registry.concordium.com`
- Dashboard lúc demo: **999 agent**, 876 active, 212 cross-chain, 123 đã revoke. Agent đăng ký trong buổi trở thành **Agent #1000**.
- Có thể **đăng ký trực tiếp trên UI** (native hoặc cross-chain, chọn chain, kết nối ví EVM để ký CIS-8).
- Trang chi tiết agent hiển thị: token ID, owner, thời gian đăng ký, metadata URL, hash, các entry CIS-8 (public key, loại chữ ký như *Ethereum personal sign*, network), trạng thái.
- **Đăng ký trên mainnet qua form được sponsor**, nên *không cần giữ CCD*. Đây là cách nhanh nhất cho agent đang chạy trên ETH/SOL: vào Registry (mainnet) → Cross-chain → chọn chain → ký bằng ví EVM → nhận badge. Vẫn cần có Concordium ID (testnet: Test IDP; mainnet: KYC thật).

### 6.2 8004scan (`8004scan.io`)
- Explorer cho agent ERC-8004 (mainnet và testnet), khoảng 1,84 triệu agent được hiển thị.
- **Giai đoạn 1 (hiện tại):** quét các registry đã tích hợp; agent card nào có badge Concordium thì hiện "Verified by Concordium".
- **Giai đoạn 2 (sắp tới):** đọc trực tiếp registry của Concordium.

### 6.3 agentcards.site (đối tác)
- *"Host your agent's card. Prove it's yours."* Hosting Agent Card chuyên cho Concordium: mint card thành NFT CIS-8004, hash ghi lúc mint, URL ổn định `agentcards.site/<owner>/<slug>.json`.
- Có **MCP** (`/mcp`) và REST (`POST /host`, `GET /quota/:owner`). **10 card miễn phí** cho mỗi account, sau đó trả theo credit. *(Chi tiết lấy từ website, nguồn ngoài.)*
- Trong demo, ChatGPT tự chọn agentcards.site để host card thay vì GitHub.

### 6.4 Đăng ký agent bằng MCP ngay trong ChatGPT
- Dùng **MCP hosted** (`agent-registry-mcp.concordium.com/mcp`, **40 tool**). ChatGPT **tự tìm và dùng được mà không cần cài plugin**.
- **Sau này** sẽ có **MCP dạng npm** để cài vào dự án.
- Luồng demo (agent "Bob, trợ lý lịch họp", testnet, không dùng external key):
  1. MCP sinh **payload CIS-8004 register**. MCP **không ký**; payload hiện lên ví trình duyệt để người dùng ký.
  2. Nhận badge → MCP sinh **đoạn JSON badge** → chèn vào `capabilities.extensions` của Agent Card.
  3. Host card (GitHub raw hoặc agentcards.site) → MCP tính hash → giao dịch **update URL + hash**, người dùng ký tiếp.
  4. Dán **verification URL** để xem trạng thái verify.
- Bước cập nhật URL sang GitHub bị kẹt trong demo, nhưng Peter khẳng định luồng này đã từng chạy thành công.
- Peter nói thêm: với badge, agent còn có thể làm **ZK reveal** (ví dụ "tôi là trợ lý của Pete"), nhờ đó bên kia biết chắc mình đang đặt lịch với đúng người.

### 6.5 Developer Toolkit: Agent Registry (slide 17)
Agent Registry app · How to use the registry · CIS-8 + CIS-8004 · Verified badge reference · **Hosted MCP service** (tools, REST verification, setup) · 8004scan.

---

## 7. Q&A cuối buổi ✅

| Câu hỏi | Trả lời của Peter | Hàm ý |
|---|---|---|
| Agent đã live trên ETH/Solana: cách nhanh nhất để có badge trong tuần này? | Không muốn dùng MCP thì vào **Agent Registry UI → mainnet → cross-chain**, ký bằng ví EVM. Đăng ký mainnet **được sponsor phí**. Vẫn cần Concordium ID | Có thể có badge thật trên mainnet sớm, rất có ích cho "path to production" |
| Discord / sự kiện? | Link có trên concordium.com (X, LinkedIn, Discord, Telegram). Có thể có mặt ở Devcon | — |
| **Ngoài badge, giám khảo muốn thấy gì?** | *"We're all about accountability… dropping anchors on chain."* Trên testnet, dựng **doanh nghiệp qua Global FinReg** có agent hành động thay doanh nghiệp, ở đầu kia là **agent hành động thay cá nhân**, hai bên nói chuyện với nhau trong một **use case thật có lợi cho con người**. Ví dụ: agent **đi chợ hộ**: (a) người dùng cần biết đang mua đúng siêu thị thật chứ không phải agent mạo danh; (b) siêu thị cần tự động kiểm chứng giỏ hàng có rượu thì người đứng sau agent đã **trên 18 tuổi**. Thêm **thanh toán** thì càng tốt. Thêm **consent anchor** ("tôi đồng ý cho giao dịch này") thì tuyệt vời | ⭐ **Đây gần như là gợi ý đề bài.** Hai chiều xác minh + ZK thuộc tính + thanh toán + consent, tất cả có anchor on-chain |

**Buổi kế tiếp:** Workshop 3, **thứ Hai 09/11, 15:00 UTC (22:00 giờ VN)**, do **Doris** trình bày: *Let your agent pay and get paid* (x402, PLT, sponsored tx). Encode sẽ gửi email cập nhật hàng tuần.

---

## 8. Tin nhắn chat trong buổi 🟡 (bạn chép lại, của *một người thi khác*)

Toàn bộ là câu hỏi của **Mohammed (dự án "Trifecta Checker")**. Transcript **không ghi lại câu trả lời** cho các câu hỏi này; Peter nói sẽ gom câu hỏi chat lại để trả lời sau. Mình coi đây là **dữ liệu tham khảo**, không phải hướng dẫn chính thức.

**Dự án của họ:** một "gatekeeper" chặn **"lethal trifecta"** (agent cùng lúc có *dữ liệu riêng tư* + *nội dung không tin cậy* + *gửi request ra ngoài*) bằng HTTP **403**, đang chạy trên Vercel. Họ muốn kết hợp với kiểm tra badge Concordium trước mỗi request ra ngoài, và biến nó thành **MCP server** để ChatGPT/Claude gọi.
→ **Đối thủ cùng hướng "agent firewall / policy gate"** (gần ý tưởng AgentGuard). Nếu chọn hướng này, cần khác biệt rõ ràng (ví dụ: mandate có chữ ký của chủ, giới hạn chi tiêu, consent anchor, audit trail).

**Những gì rút ra được từ các câu hỏi đó:**
| Thông tin | Đánh giá |
|---|---|
| **Testnet faucet bị sập** trong buổi (ví testnet, Discord, ccdscan) | 🟡 Rủi ro thật: **xin test CCD sớm và dự trữ**; tận dụng sponsored transactions |
| Flow họ mô tả: 1 owner → tạo external key B (CIS-8) → mint NFT/badge B gắn đúng key → Agent Card B có URL + hash → A2A: ký nonce bằng key B | ✅ **Khớp đúng slide 15.** Đây là cách hiểu đúng |
| Tách key: credential giữ riêng tư; key CIS-8 chỉ dùng cho A2A, không có quyền chi; transaction key chỉ dùng khi có phê duyệt; `agentWallet` có thể là account khác | ✅ **Khớp slide 14** (`agentWallet` = địa chỉ thanh toán, không phải key xác thực) |
| Agent Web2 (Vercel) có đăng ký được không? Agent Card để ở GitHub raw hay IPFS? | ✅ Được: demo dùng **GitHub raw**, hoặc **agentcards.site**. Yêu cầu là URL công khai và **byte không đổi** so với hash |
| `trust.concordium.express` | ⚠️ **Chưa xác minh**: trang trả về 401, không có trong docs chính thức. **Đừng dùng hay nhập key** khi chưa được Concordium xác nhận |
| "5 tool" (build_agent_card, build_agent_badge, check_badge…) | 🟡 Không khớp con số **40 tool** của MCP chính thức, có thể là một GPT hoặc MCP khác |

*(Mình không đưa địa chỉ ví và DID của người đó vào báo cáo để tránh lộ thông tin khi repo chuyển public.)*

---

## 9. Cập nhật so với các báo cáo trước

| Điểm | Trước đây | Sau Workshop 2 |
|---|---|---|
| Số tool MCP | 35 (research cũ) → ~40 (docs) | ✅ **40 tool** (Peter xác nhận khi demo) |
| Agent Kit / MCP npm | Roadmap 11–12/2026 | ✅ MCP hosted dùng được ngay; **bản npm "sau này"** |
| Agent IDP | Roadmap "AI Agent IDP 11/2026" | ⚠️ **Devnet / đang phát triển**, không nên phụ thuộc |
| Chain được hỗ trợ | "200+" | ✅ **226 trên UI, ~290–300 nếu tính qua MCP** |
| Phí đăng ký | Chưa rõ | ✅ **Mainnet qua form được sponsor** |
| Phân biệt account agent và account người | Chưa biết | ✅ Đã làm được nhờ IDP cấp (Agent IDP); sau này có thêm metadata |
| Tiêu chí chấm | "integration depth + path to production" | ✅ Bổ sung: **accountability anchors + use case thật giữa agent doanh nghiệp và agent cá nhân + thanh toán + consent** |

---

## 10. Gợi ý hành động trước Workshop 3 (09/11)

1. **Xin test CCD ngay** (Browser Wallet → Testnet → Test IDP → Request CCD), vì faucet có thể sập lại. Tạo thêm **một identity doanh nghiệp qua Global FinReg** trên testnet nếu ý tưởng có phía merchant.
2. **Tự làm lại demo của Peter:** đăng ký một agent trên `testnet-agent-registry.concordium.com` → host Agent Card (GitHub raw hoặc agentcards.site) → cập nhật URL + hash → thử verification URL. Kết nối MCP `agent-registry-mcp.concordium.com/mcp` vào Claude/ChatGPT. Mỗi bước để lại **link CCDExplorer** đúng như bài nộp yêu cầu.
3. **Thử A2A challenge–response với key CIS-8** (agent ký nonce, bên kia verify). Đây là "integration depth" thật, hơn hẳn việc chỉ gắn badge.
4. **Định hướng ý tưởng:** gợi ý của CTO (agent của doanh nghiệp ↔ agent của cá nhân, hai chiều xác minh, ZK thuộc tính, thanh toán, consent anchor) cộng với khoảng trống ở slide 10 (badge ≠ quyền hạn) **trùng khớp với MandateOS / ProofProcure**. Nên chốt hướng trước Checkpoint 1 (22/11).
5. **Câu hỏi nên mang tới W3/office hours:** x402 facilitator trên testnet là gì; có sponsored tx cho CIS-8004 trên testnet không; ngày phát hành bản npm của MCP; Agent IDP trên devnet có dùng được để demo không.

---

## Nguồn
- Video, transcript và slide Workshop 02 (Encode × Concordium, 04/11/2026)
- [Concordium Agent Registry (testnet)](https://testnet-agent-registry.concordium.com) · [Agent Registry docs](https://docs.concordium.com/en/mainnet/technical-reference/agent-registry/index.html) · [MCP service](https://docs.concordium.com/en/mainnet/technical-reference/agent-registry/mcp-service.html) · [Verified badge](https://docs.concordium.com/en/mainnet/technical-reference/agent-registry/concordium-badge.html)
- [agentcards.site](https://agentcards.site) (đối tác, thông tin từ website)
- [8004scan](https://8004scan.io)
