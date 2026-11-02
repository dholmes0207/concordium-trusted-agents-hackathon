# Tổng hợp: Concordium Trusted Agents Hackathon (Encode Club) — sau Workshop 01

> Soạn ngày 03/11/2026. Nguồn: video Workshop 01 (02/11, bản mp4 720p — đã chép lời bằng Whisper + đọc slide), 4 PDF trong `Research-Hackathon/`, và research độc lập trên web/GitHub (link ở cuối).
> Bản chép lời tiếng Anh đầy đủ (Whisper, có timestamp): `Workshop01/Workshop-01-transcript-EN.txt`.
> Ký hiệu độ tin cậy: ✅ chính thức (slide/lời ban tổ chức/docs Concordium) · 🟡 nguồn phụ · ❗ khác với bản research cũ.

---

## 1. Một câu tóm tắt

**"Add trust and accountability to the AI agents you already have."** Không phải "xây AI agent trên blockchain", mà là: mang agent bạn đã có (trên bất kỳ stack/chain nào) và cắm thêm lớp **danh tính – trách nhiệm – thanh toán có kiểm chứng** của Concordium.

CTO Peter Marirosans nói rõ trong workshop ✅: *"pick the bits that work well with your current project and plug it in… bring in what you've already got"* — tức là ban tổ chức **muốn thấy tích hợp vào sản phẩm thật**, không ép migrate sang Concordium.

---

## 2. Mốc thời gian chính thức ✅ (slide Encode, Workshop 01)

| Mốc | Thời gian (UTC) | Giờ Việt Nam | Ghi chú |
|---|---|---|---|
| 6 workshop | 2–18/11, **thứ Hai & thứ Tư 15:00** | 22:00 | Có ghi hình, đăng lên trang chương trình |
| Workshop 2 | **Thứ Tư 04/11, 15:00** | 22:00 04/11 | "verifying agents" (theo lời Peter) |
| Bắt đầu build (testnet) | **Thứ Năm 19/11** | | |
| **Checkpoint 1** | **CN 22/11, 23:59** | **06:59 sáng T2 23/11** | Tạo project, thêm team, mô tả ý tưởng. Chưa cần xong |
| Office hours | **Thứ Ba & thứ Sáu 15:00**, 24/11–04/12 | 22:00 | Live hoặc async trên Discord, có người của Concordium |
| Hướng dẫn nộp bài + office hours cuối | **Thứ Ba 08/12** | | |
| **NỘP BÀI CUỐI** | **Thứ Tư 09/12, 23:59** | **06:59 sáng T5 10/12** | Nền tảng **khóa cứng**, nộp trễ = không chấm |
| Chấm điểm | 10–11/12 | | Encode + Concordium xem **từng demo** |

❗ Giles (Encode) nói nhầm miệng "close at midnight on a Sunday", nhưng slide ghi rõ **Wed 9 Dec 23:59 UTC** → tin slide. Bản research cũ ghi "23:59 UTC chưa xác minh" → **nay đã xác minh**.

### Lịch 6 workshop ✅ (slide "The workshop series" — 15:00 UTC = 22:00 giờ VN, đều được ghi hình)
| # | Ngày | Chủ đề | Nội dung |
|---|---|---|---|
| W1 | T2 02/11 | Verify Once. Prove Everywhere. Reveal Nothing | Concordium ID, age check không lưu dữ liệu cá nhân |
| W2 | T4 04/11 | Prove a verified human stands behind your agent | Agent Registry + Verified by Concordium badge, cross-chain |
| W3 | T2 09/11 | Let your agent pay and get paid | x402, Protocol-Level Tokens, sponsored transactions |
| W4 | T4 11/11 | Keep your agent inside the rails, and inside the law | **Protocol-Level Locks, EU AI Act audit trails** |
| W5 | T2 16/11 | Ship to production | Adopting blockchain without crypto |
| W6 | T4 18/11 | Plug into the agent stack you already use | MCP, A2A và framework của bạn |

❗ W4 dạy Protocol-Level Locks dù roadmap đặt mainnet 01/2027 → cần hỏi trong W4 xem testnet/devnet có dùng được Locks trong hackathon không. "EU AI Act audit trails" là một gợi ý use case rõ ràng.

---

## 3. Bài nộp & tiêu chí chấm

### Bài nộp ✅ (slide "What to submit" — Final submission Wed 9 Dec 23:59 UTC)
1. **Description**: đã build gì, hoạt động thế nào, **dùng những thành phần Concordium nào**
2. **Public code repository**
3. **Demo video**: tối đa **3 phút**, cho thấy **luồng chính chạy thật**
4. **CCDExplorer link**: agent, contract hoặc giao dịch của bạn **trên Concordium testnet**
5. **Path to production**: cần những gì để **lên mainnet, đến tay người dùng thật**
6. *Optional*: slide và link live demo

**Requirements** (khung bên phải slide):
- Concordium được **tích hợp vào project hiện có** của bạn, **demo được trên testnet**. Test CCD lấy miễn phí từ faucet.
- Các workshop sẽ chỉ rõ "tích hợp mạnh" trông như thế nào.
- **Mọi link phải public** → repo GitHub đang để private thì phải chuyển sang public trước khi nộp.

→ Bản research cũ đánh dấu các mục này là "nguồn phụ, chưa xác minh" → **nay đã được xác nhận chính thức.**
Slide gốc lưu tại `Workshop01/slides/` (07-encode-what-to-submit.jpg, 04-encode-workshop-series.jpg…).

### Tiêu chí chấm ✅ (thông báo chính thức của Concordium ngày 02/11)
> "Projects will be judged on **integration depth** and a **credible path to production**, not simply transaction counts or the strength of a pitch."

Hệ quả thực tế:
- **Không cày số giao dịch**, không dựa vào pitch đẹp.
- Cần **tích hợp sâu** (nhiều primitive, dùng đúng chỗ, chạy thật trên testnet) + **câu chuyện production đáng tin** (ai dùng, vì sao cần, đi tiếp ra sao).

### Thông báo chính thức cũng nêu những gì người tham gia sẽ làm ✅
- **Verified by Concordium badge** — nối agent với người thật đã xác minh
- **ERC-8004 Agent Card** để đăng ký vào Agent Registry
- **x402** thanh toán, với **phí testnet được sponsor**
- Tùy chọn kết nối qua **MCP hoặc A2A**

→ Đây gần như là "checklist tích hợp" mà ban giám khảo kỳ vọng.

### Giải thưởng ✅
- Winners được xét **grant từ quỹ 75M CCD Grants Program** để đưa dự án thành sản phẩm thật + merch Concordium.
- Không công bố tiền mặt / số giải cụ thể → giải chủ yếu là **cơ hội grant**, nên "path to production" càng quan trọng.

### Đội & điều kiện ✅
- Thi **một mình hoặc theo đội** (thường tới 3–4 người). Đội trưởng tạo project, có **mã mời** cho đồng đội.
- Online, miễn phí, **không cần kinh nghiệm blockchain**, test CCD miễn phí.
- Kết nối Discord trên trang chương trình (kênh hỏi đáp chính).

---

## 4. Kiến thức kỹ thuật từ Workshop 01 ✅

### Concordium tóm tắt
- Layer 1 public, permissionless; **danh tính tích hợp ở tầng protocol**. Mainnet từ 2021.
- **Finality 2–4 giây**, không fork (nếu sự cố thì chain "pause", không rollback).
- **Phí cố định ~1 eurocent/giao dịch** (docs ghi ≈ €0.02 cho Verify & Access), không phụ thuộc giá CCD.
- **Protocol-Level Tokens (PLT)**: token/stablecoin nằm ở protocol, không phải smart contract.
- Smart contract viết bằng **Rust → Wasm**.

### Mô hình danh tính: "Verify once. Prove everywhere. Reveal nothing."
- **Mọi account trên Concordium đều có danh tính thật đứng sau** (người hoặc doanh nghiệp), nhưng chain **không lưu PII**.
- Quy trình: tải Concordium ID App / ví → chọn **IDP** (≈3 IDP cá nhân + 1 IDP doanh nghiệp) → chụp giấy tờ + selfie/liveness → IDP ký "identity object" (đã mã hóa phần định danh bằng khóa của Privacy Guardians) → lưu trên thiết bị.
- Từ identity object có thể: (a) chỉ giữ trong ID App để tạo proof cho website; hoặc (b) tạo account on-chain (ví Concordium, hoặc ví bên thứ 3: Bitcoin.com, Coin98, Ledger, **Tether WDK**) — account chứa *Pedersen commitments* của các thuộc tính.
- Các loại proof: **range** (tuổi > 18), **membership / non-membership** (quốc gia, nhóm), và **reveal** có đồng ý (vd. lộ tên).
- ⚠️ Lưu ý của Peter: proof chỉ an toàn nếu **câu hỏi hợp lý** — hỏi range ngày sinh 1 ngày = lộ luôn ngày sinh. → Có thể là một hướng để làm "policy/guard" cho câu hỏi.

### 4 vai trò — không bên nào lộ được một mình
| Vai trò | Làm gì | Không biết gì |
|---|---|---|
| User | Giữ credential, tạo proof | — |
| ID Provider | Xác minh giấy tờ | Không biết account on-chain |
| Privacy Guardians (3 luật sư) | Giữ key share, **ngưỡng 2-of-3** | Không có raw ID |
| Authority | Cần **lệnh tòa án Thụy Sĩ** để mở | — |

Mỗi account cần một lệnh riêng; nhiều account cùng một danh tính không thể bị liên kết công khai.

### Verify & Access (sản phẩm ra mắt 2025, đã trình bày với Ofcom UK)
1. Website tạo **Verification Request (VRA)**: câu hỏi, cửa sổ hiệu lực, nonce dùng 1 lần, domain
2. VRA được hash và **anchor on-chain**
3. Gửi tới ID App/ví qua **WalletConnect** (QR)
4. App kiểm tra domain + VRA on-chain → **tạo ZK proof trên thiết bị**
5. Verifier kiểm proof: hợp lệ, khớp VRA, đúng câu trả lời, **không bị dùng lại** → cấp quyền, không lưu dữ liệu cá nhân
- Chống replay và dùng proof chéo site, đồng thời có thể audit.
- **Audit anchor**: sau khi kiểm proof xong, merchant ghi thêm một anchor (hash của log xác minh) lên chain → 6 tháng sau vẫn chứng minh được "tôi đã hỏi câu gì, nhận proof gì, vì sao cho vào". Mô hình này đã được trình bày với Ofcom.
- **Domain verification (mới)**: ID App kiểm tra bản ghi DNS có chữ ký Concordium của website, đối chiếu với chain → biết mình đang nói chuyện với đúng site. Workshop 2 sẽ mở rộng sang **xác minh end-to-end với agent** (agent IDP, Agent Card, URL).
- Demo trên `ccd-ui-sdk.netlify.app` ("3P Account Wallet — Demo"): 3 luồng SDK-managed, merchant-managed (backend↔wallet, nhanh hơn) và **consent flow**.

### 💡 Consent proof — gợi ý trực tiếp của CTO cho agent
Ngoài proof thuộc tính, Verify & Access cho phép **yêu cầu người dùng đồng ý một câu cụ thể** (vd. "Tôi đồng ý cho agent mua vé X giá Y"). Người dùng duyệt trong ID App → tạo proof; hash nội dung câu hỏi đã được anchor on-chain, nên **sửa nội dung giữa đường sẽ bị phát hiện** (theo Q&A). Peter nói nguyên văn ý: *với agent, đây là thứ rất mạnh — agent tìm vé, báo giá, bạn consent, anchor lên chain; nếu tranh chấp sau 6 tháng thì có bằng chứng không thể chối cãi.*
→ Đây là primitive **human-in-the-loop có kiểm chứng**, rất hợp với các hướng MandateOS / ProofProcure / AgentGuard (bước "require human approval").

### Veriox — đối tác (không phải sản phẩm Concordium)
`veriox.co.uk` — SaaS giúp merchant gắn Verify & Access nhanh: đăng ký → lấy API key → đặt một **Cloudflare Worker** gọi Veriox → Veriox lo QR, anchor, kiểm proof, lưu audit và trả về true/false. Có demo `demo.veriox.io`. Peter khuyên dùng nếu dự án cần gate một trang web; tuy vậy, tự làm bằng SDK sẽ được tính là "tích hợp sâu" hơn.

### Setup testnet (Peter demo) ✅
- Cài **Concordium Browser Wallet** (hoặc ID App) → chuyển sang **Testnet**.
- Chọn **"Concordium Test IDP"** → điền form thông tin **giả** (quốc gia, ngày sinh, tên…) → tạo account trong vài giây.
- Activity → **Request CCD → nhận ngay 20.000 test CCD**.
- Mainnet chỉ có IDP thật (KYC đầy đủ).
- **Local stack** (`github.com/Concordium/concordium-local-stack`): chạy node devnet + ví + CCDExplorer trên laptop, làm hỏng thì xóa đi dựng lại. Peter gợi ý thử ngay ("challenge" của buổi 1).

### Q&A cuối buổi ✅ (quan trọng)
| Câu hỏi | Trả lời của Peter | Ý nghĩa với đội |
|---|---|---|
| **Được dùng code có từ trước 19/11 không?** | **Được** — "the whole point is to bring your current project and add the Concordium functionality" và chỉ ra nó tốt hơn/làm được gì mới | ✅ Giải quyết câu hỏi mở số 1 của research cũ. Có thể lấy một agent/dự án sẵn có rồi tập trung vào tích hợp |
| Proof không liên kết được → 1 người tạo 10 ví thì có phát hiện được không (nullifier)? | **Chưa** — tính "uniqueness" đang nằm trong nghiên cứu **Identity 2.0** | ⚠️ Hiện **không chống Sybil theo người** được. Đừng thiết kế "1 người = 1 phiếu/1 suất" dựa trên ZK proof; nếu dự án cần thì phải nêu rõ là giới hạn |
| B2B: công ty tự làm IDP cho kỹ sư được không? Khách có xác minh "agent do kỹ sư đã verify của công ty X" mà không biết là ai không? | Cả hai **đều được**. IDP riêng cần **governance committee** duyệt (chỉ dành cho use case đủ lớn). Có thể chứng minh thuộc công ty bằng ZK, company reveal, chứng minh "thuộc IDP X", hoặc **chữ ký trong Agent Card** (sẽ nói ở Workshop 2) | Hướng **agent của nhà cung cấp dịch vụ thao tác trên hạ tầng khách hàng** (B2B accountability) được CTO xác nhận là khả thi |
| Consent message có bị sửa được không? | Không: hash nằm on-chain, ID App và bước verify đều đối chiếu | Consent proof đủ tin cậy để làm bằng chứng tranh chấp |

### Developer Toolkit (slide cuối workshop) ✅
Identity framework · Verify & Access tutorial (age check) · Integrate Concordium ID (ID App hoặc tích hợp IDP trực tiếp) · Local stack (tùy chọn, github.com/Concordium) · SDKs & technical reference. Starter pack trên trang chương trình: setup, SDK, ví, code mẫu, Developer hub, Agent Registry app, repo GitHub examples, CCDExplorer.

---

## 5. Kiểm chứng độc lập — những gì research cũ đúng/sai/thiếu

| Điểm | Research cũ | Kiểm chứng (03/11) |
|---|---|---|
| Timeline 2/11 → 19/11 → 9/12 | Đúng | ✅ Xác nhận + thêm Checkpoint 22/11, judging 10–11/12 |
| Nội dung bài nộp | "Nguồn phụ, chưa xác minh" | ✅ **Đã xác minh** từ slide |
| Tiêu chí chấm | "Chưa có rubric" | ✅ Có câu chính thức: *integration depth + credible path to production* |
| Giải thưởng | "Chưa rõ prize pool" | ✅ Grant từ 75M CCD + merch (không có tiền mặt cụ thể) |
| Team size | Chưa rõ | ✅ Solo hoặc đội ~3–4 |
| Được dùng code có sẵn? | Chưa rõ | ✅ **Được, và còn được khuyến khích** (CTO trả lời trong Q&A) |
| ZK identity chống Sybil? | Không đề cập | ❗ **Chưa có** tính uniqueness/nullifier xuyên account (đang ở Identity 2.0) |
| MCP service | "~35 tools" | ❗ Docs hiện liệt kê **~40 tools**; endpoint `https://agent-registry-mcp.concordium.com/mcp`, hỗ trợ mainnet/testnet/devnet, **không ký giao dịch** (trả payload để ví ký) |
| Protocol-Level Locks | "Testnet giữa tháng 12" | ❗ Concordium đã dời mốc sang **27/01/2027** → **không dùng được trong hackathon** |
| Roadmap | Agent Kit beta giữa tháng 11; MCP Server & Agent ID Service tháng 12 | ✅ Roadmap: "AI Agent Tool Kit" (11/2026), "AI Agent IDP" (11/2026), "Concordium MCP Server" (12/2026), "Concordium Agent ID Service" (12/2026), "AI Agent Assisted Verify & Pay" (01/2027) → **có thể ra trong lúc thi, nhưng đừng phụ thuộc** |
| Số liệu Registry | 3.828 agents, 614k tx, 6 nền tảng | ✅ Khớp bài viết Concordium 20/10 (số tự công bố) |
| Danh sách dự án đã có (XDC AI, AITECH Agent Forge, 8004scan, NewsAgents, DOTDOTDOT, TippingService) | Đúng | ✅ Xác nhận — **tránh làm lại** |

### Thông tin mới chưa có trong research cũ
- **Badge "Verified by Concordium"** chứng minh: agent đã đăng ký, đang active, thuộc một account Concordium có trách nhiệm (đã KYC), và Agent Card công khai **khớp hash on-chain**. Có thể kiểm tra qua REST, MCP (`verify_agent_card`), SDK, hoặc đọc chain trực tiếp. Dạng badge: Base58 ngắn hoặc CAIP-19.
- **Mainnet contracts**: CIS-8004 `<10082,0>`, CIS-8 `<10081,0>`.
- Quy trình đăng ký agent qua MCP: `build_agent_card` → host card (giữ nguyên byte) → `build_register` → ký bằng ví → `verify_agent_card`. Cross-chain thì thêm bước ký CIS-8 bằng ví Ethereum.
- **`@concordium/wdk-wallet-concordium`** (Tether WDK, beta): CCD, PLT, CIS-2, **sponsored PLT transactions** (sender và sponsor ký riêng) → rất hữu ích để agent có ví mà không phải tự viết logic.
- Repo **`concordium-dapp-examples`** có sẵn: `simpleAgeVerification`, `sponsoredTransactions`, `DevnetSponsoredTx`, `signatureProof`, `rbac`, `compliant-reward-distribution`, `locks`, `trackAndTrace`, `eSealing`… → điểm khởi đầu tốt để copy pattern.
- **x402**: docs Concordium hiện chủ yếu mô tả khái niệm (facilitator kiểm ZK proof + thanh toán). **Chưa thấy repo x402 chính thức công khai của Concordium** → chờ Workshop 3 (09/11) để lấy link tutorial/repo; đây là rủi ro kỹ thuật cần theo dõi.
- **Bối cảnh ngành (KYA – Know Your Agent)**: Visa Trusted Agent Protocol (10/2025), Mastercard Agent Pay, Google **AP2** (mandate do người dùng ký cho agent, đã chuyển cho FIDO 04/2026), Skyfire KYAPay. **AP2 giải "agent được phép chi gì", còn KYA giải "agent là ai"** — đúng ranh giới *identity ≠ authority* mà research cũ (MandateOS) đã chỉ ra → hướng này **có cơ sở thị trường thật**.
- **ERC-8004** vẫn ở trạng thái Draft nhưng đã có >170k agents đăng ký trên nhiều chain. Một nghiên cứu thực nghiệm (arXiv 2606.26028) cho thấy phần lớn là đăng ký "rỗng", **chưa có Validation Registry nào chạy trên mainnet**, và khoảng cách giữa "đã xác minh danh tính" và "hành xử trung thực" vẫn còn mở → chỗ cho ý tưởng về **evidence / validation / mandate**.
- Đối thủ công khai đầu tiên thấy được: *SellerPilot* (GitHub) — đem một app phân tích marketplace có sẵn rồi gắn agent registry + x402 + sponsored tx. Đúng kiểu "bring what you have" mà BTC khuyến khích.
- Tiền lệ: tại Encode London 2025, các dự án dùng Concordium ID cho tín dụng DeFi (VeriLoan) và bảng xếp hạng có xác minh (TradeTrackr) đã đoạt giải → **dùng ZK identity cho một use case cụ thể** là hướng từng thắng.

---

## 6. Gợi ý hành động

**Tuần này**
1. Đăng nhập trang chương trình → **tạo project / lấy mã mời** → kết nối Discord.
2. Tham gia **Workshop 2 (T4 04/11, 22:00 giờ VN)** — chủ đề agent IDP + Agent Registry. Hỏi live về: (a) repo/facilitator x402 cho testnet, (b) có bắt buộc deploy smart contract riêng không, (c) tiêu chí "integration depth" cụ thể là gì (dùng bao nhiêu primitive?).
3. Làm "challenge" buổi 1: cài **Browser Wallet** → Testnet → **Concordium Test IDP** → nhận 20.000 test CCD; chạy thử **local stack**; làm tutorial **age check / consent** (copy từ `concordium-dapp-examples/simpleAgeVerification`); **đăng ký 1 agent** qua MCP (`agent-registry-mcp.concordium.com/mcp`) để có giao dịch đầu tiên trên CCDExplorer.
4. Vì **được dùng code có sẵn**: liệt kê các agent/dự án bạn đã có → chọn cái nào "thêm identity/consent/payment có kiểm chứng" thì làm được điều trước đây không làm được. Đây đúng là câu chuyện BTC muốn nghe.

**Trước Checkpoint 22/11**: chốt ý tưởng. Theo tiêu chí "integration depth + path to production", nên chọn ý tưởng dùng **2–4 primitive** (Registry/badge + ZK proof + x402/sponsored tx, MCP/A2A) trong **một workflow có người dùng thật**. Các ứng viên mạnh từ research cũ vẫn đứng vững sau kiểm chứng: **MandateOS** (identity ≠ authority, có AP2/ERC-8226 làm bằng chứng thị trường), **ProofProcure**, **TrustGate**. Tránh: registry/badge clone, age gate chung chung, x402 paywall đơn thuần, news-hash, tipping.

**Không phụ thuộc** vào Protocol-Level Locks (01/2027), và hạn chế phụ thuộc Agent Kit / MCP Server / Agent ID Service (có thể ra giữa cuộc thi) — luôn cần phương án dự phòng bằng Agent Registry MCP + Web SDK hiện có.

---

## Nguồn
- Video Workshop 01 (Encode × Concordium, 02/11/2026) — slide của Giles Mallinson (Encode) và Peter Marirosans (CTO Concordium)
- [Encode — Concordium Trusted Agents Hackathon](https://www.encodeclub.com/programmes/concordium-trusted-agents-hackathon)
- [Thông báo khai mạc (KuCoin/Concordium community)](https://www.kucoin.com/news/community/CCD/6ae85b25bbcb5200074585a9)
- [Concordium — Agent Registry Update Oct 2026](https://www.concordium.com/article/agent-registry-update-october-2026)
- [Concordium Roadmap](https://www.concordium.com/roadmap)
- [Agent Registry docs](https://docs.concordium.com/en/mainnet/technical-reference/agent-registry/index.html) · [MCP service](https://docs.concordium.com/en/mainnet/technical-reference/agent-registry/mcp-service.html) · [Use the Agent Registry](https://docs.concordium.com/en/mainnet/how-to/integrations/agent-registry.html) · [Verified badge](https://docs.concordium.com/en/mainnet/technical-reference/agent-registry/concordium-badge.html)
- [x402 integration](https://docs.concordium.com/en/mainnet/how-to/integrations/x402-integration.html) · [Verify and Access](https://docs.concordium.com/en/mainnet/how-to/concordium-id/verify-and-access/index.html)
- GitHub: [Concordium org](https://github.com/Concordium) (concordium-dapp-examples, tether-wdk-concordium, id-app-sdk, concordium-node-sdk-js)
- [SellerPilot (đội khác)](https://github.com/tareq7/sellerpilot-concordium-trusted-agents-2026)
- KYA/AP2: [eco.com — Know Your Agent](https://eco.com/support/en/articles/14846277-know-your-agent-kya-identity-for-agent-payments), [paz.ai — AP2](https://www.paz.ai/glossary/agent-payments-protocol-ap2)
- ERC-8004: [arXiv 2606.26028](https://arxiv.org/html/2606.26028), [QuickNode guide](https://www.quicknode.com/blog/erc-8004-a-developers-guide-to-trustless-ai-agent-identity)
- Tiền lệ: [Envio — Encode London 2025 winners](https://docs.envio.dev/blog/encode-london-2025)
