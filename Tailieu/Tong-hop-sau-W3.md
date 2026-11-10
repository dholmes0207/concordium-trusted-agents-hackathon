# Tổng hợp sau Workshop 03: tiến độ, kiến thức 3 buổi, hướng đã chốt và kế hoạch

> **Ngày soạn:** 10/11/2026 (sau W3, trước W4)
> **Vai trò của file:** bản tổng hợp mới nhất, thay cho việc phải đọc lần lượt các file cũ. Các file cũ **giữ nguyên**, file này dẫn link tới chúng ở mục 9.
> **Ký hiệu:** ✅ đã xác nhận · ⚠️ cần kiểm chứng / rủi ro · ⏸️ tạm dừng · ⭐ quan trọng cho dự án
> Mốc `[mm:ss]` ghi kèm tên buổi, ví dụ W2 [64:05].

---

## 0. Tóm tắt một trang

| | |
|---|---|
| **Cuộc thi** | Concordium Trusted Agents Hackathon (Encode × Concordium): *"Add trust and accountability to the AI agents you already have."* Thi solo được. Nộp bài trước **06:59 sáng T5 10/12** (giờ VN) |
| **Chấm điểm** | 4 tiêu chí: **depth of integration**, **credible path to production**, **it works** (demo end-to-end), **usefulness** |
| **Đã học** | W1 danh tính và ZK proof · W2 Agent Registry, badge, 3 loại key · W3 stablecoin, sponsored transactions, x402 |
| **Hướng đã chốt** | ⭐ **C-lite bản kết hợp**: agent của công ty A (nhà cung cấp dịch vụ) thao tác trên hạ tầng của khách hàng B, qua một gateway kiểm **4 lớp**: L1 danh tính agent · L2 phiếu giao việc · L3 người duyệt · L4 audit |
| **Còn mở** | G1 (công ty xác nhận nhân viên bằng gì), G2 (proof có lộ account không), Global FinReg trên testnet, **dự án có sẵn để gắn vào** |
| **Đã làm** | 8 tài liệu nghiên cứu và báo cáo; ví testnet với 2 identity cá nhân, 1 account có 20.000 test CCD |
| **Mốc gần nhất** | **T4 11/11 (W4):** quyết định có thêm lớp CIS-4 vào L3 không, chốt cách làm audit · **T2 16/11 (W5):** Global FinReg và LEI · **23/11:** Checkpoint 1 |

---

## 1. Thể lệ và mốc thời gian (cập nhật theo trang programme của Encode)

### 1.1 Mốc

| Ngày (giờ VN) | Sự kiện | Trạng thái |
|---|---|---|
| T2 02/11, 22:00 | Khai mạc + W1: Verify Once. Prove Everywhere. Reveal Nothing | ✅ Đã xem, có báo cáo |
| T4 04/11, 22:00 | W2: Prove a verified human stands behind your agent | ✅ Đã xem, có báo cáo |
| T2 09/11, 22:00 | W3: Let your agent pay and get paid | ✅ Đã xem, có báo cáo |
| **T4 11/11, 22:00** | **W4: Keep your agent inside the rails, and inside the law** (Protocol-Level Locks, EU AI Act Điều 12) | ⏳ |
| **T2 16/11, 22:00** | **W5: Ship to production** (Global FinReg và LEI, Dfns, Tether WDK, sponsored transactions) | ⏳ |
| T4 18/11, 22:00 | W6: Plug into the agent stack you already use (MCP, A2A, Agent Card) | ⏳ |
| T5 19/11 | Mở giai đoạn build | |
| **06:59 sáng T2 23/11** | **Checkpoint 1**: tạo project, thêm team, chia sẻ ý tưởng | ⏳ |
| 24/11 – 08/12 | Office hours T3 và T6, 22:00 | |
| **06:59 sáng T5 10/12** | **Nộp bài cuối** (nền tảng khóa cứng) | |
| 10–11/12 | Chấm điểm | |

### 1.2 Yêu cầu và bài nộp ✅

- **Yêu cầu tối thiểu:** chạy trên **testnet**; dùng **có ý nghĩa ít nhất một** thành phần Concordium (Concordium ID / Verify & Access, Agent Registry + badge, x402, PLT, sponsored transactions, hoặc Agent Registry MCP).
- **Bài nộp:** mô tả (đã build gì, chạy thế nào, dùng thành phần nào) · repo **public** · video **≤ 3 phút** cho thấy luồng chính chạy thật · link **CCDExplorer** (agent, contract hoặc giao dịch trên testnet) · **path to production** · tùy chọn slide và live demo.
- **Giải:** cơ hội nhận grant từ quỹ 75M CCD Grants Program + merch. Không có giải tiền mặt, chưa công bố cơ cấu giải.
- Trang programme liệt kê sẵn 5 hướng gợi ý: gắn badge + ERC-8004 + x402 vào agent có sẵn · agent được xác minh kiểm badge của nhau qua MCP/A2A · gate dịch vụ bằng thuộc tính đã chứng minh · agent trả tiền cho nhau qua x402 · **audit trail hỗ trợ EU AI Act Điều 12 kèm đường pháp lý từ agent về chủ sở hữu chịu trách nhiệm**. Hướng C-lite nằm giữa hướng thứ 2 và thứ 5.

---

## 2. Kiến thức từ 3 workshop

### 2.1 Workshop 1 (02/11): danh tính và ZK proof

| Điều quan trọng | Nguồn |
|---|---|
| Mọi account Concordium đều có danh tính thật đứng sau (người hoặc doanh nghiệp), nhưng chain **không lưu PII**. Một danh tính tạo được nhiều account không liên kết công khai được | W1 [13:47–14:05] |
| ZK proof: **range** (trên 18 tuổi), **membership / non-membership** (quốc gia), **reveal** có đồng ý. Câu hỏi quá hẹp có thể làm lộ thông tin | W1 [19:10–20:30] |
| **Privacy Guardians**: 3 luật sư, ngưỡng 2-of-3, chỉ mở danh tính khi có lệnh tòa Thụy Sĩ | W1 [22:37–25:48] |
| **Verify & Access**: VRA (yêu cầu xác minh neo on-chain) → ID App tạo ZK proof → verifier kiểm → **audit anchor** (hash log neo on-chain) | W1 [26:14–33:08] |
| ⭐ **Consent proof**: người dùng đồng ý một câu cụ thể, hash nội dung nằm on-chain, sửa giữa đường sẽ bị phát hiện. CTO gợi ý dùng cho agent | W1 [38:58–40:05], [51:26–52:16] |
| **Domain verification**: ID App kiểm bản ghi DNS có chữ ký Concordium | W1 [42:53–44:28] |
| Doanh nghiệp đủ lớn có thể chạy IDP riêng (cần governance committee duyệt); chứng minh thuộc công ty được bằng ZK, company reveal, hoặc chữ ký trong Agent Card | W1 [49:30–50:48] |
| **Chưa có tính duy nhất (uniqueness) xuyên account** (Identity 2.0 còn nghiên cứu) → chưa chống Sybil theo người | W1 [48:46–49:24] |
| **Được dùng code có sẵn**, và đó chính là tinh thần cuộc thi | W1 [50:51–51:22] |

### 2.2 Workshop 2 (04/11): agent được xác minh

| Điều quan trọng | Nguồn |
|---|---|
| Agent **giữ nguyên chain đang chạy**, chỉ thêm lớp danh tính chủ sở hữu | W2 [02:29–02:55] |
| **Registry = CIS-8004** (NFT cho agent, account owner ký) **+ CIS-8** (liên kết key ngoài ETH/SOL…) **+ Agent Card** (JSON chuẩn A2A, hash neo on-chain). Badge nằm trong `capabilities.extensions` | W2 slide 05–09 |
| ⭐ **Badge chứng minh** owner + trạng thái active, toàn vẹn Agent Card, liên kết key ngoài. **Không chứng minh** quyền chi tiêu/hành động, chất lượng code, uy tín doanh nghiệp. *"Permissions and agent behaviour still need controls."* | W2 slide 10, [18:37–19:30] |
| ⭐ **3 loại key**: identity credential (ai chịu trách nhiệm, luôn riêng tư) · **agent signing key CIS-8** (agent nào đang nói, **không có quyền chi tiền**) · transaction key (ai chuyển được tiền). `agentWallet` chỉ là địa chỉ nhận thanh toán | W2 slide 14 |
| Một owner sở hữu nhiều agent, mỗi agent có key CIS-8 riêng; xác minh A2A bằng **ký nonce mới** | W2 slide 15 |
| Agent IDP (agent nhận một phần danh tính) đang ở **devnet**, *"not a production capability to depend on today"* | W2 slide 11 |
| Agent Registry testnet: `testnet-agent-registry.concordium.com`; MCP hosted 40 tool tại `agent-registry-mcp.concordium.com/mcp`, **không tự ký** (trả payload để ví ký); đăng ký mainnet qua form **được sponsor** | W2 [32:19–34:43], [41:24], [49:22] |
| ⭐ **Câu trả lời của CTO về điều giám khảo muốn thấy**: anchor on-chain, use case thật giữa **agent doanh nghiệp (Global FinReg) và agent cá nhân**, có ZK thuộc tính, thanh toán và consent | W2 [64:05–66:03] |

### 2.3 Workshop 3 (09/11): agent trả tiền và nhận tiền

| Điều quan trọng | Nguồn |
|---|---|
| **PLT** là tài sản gắn sẵn trong protocol, số dư nằm trong account, **chỉ account đã xác minh danh tính mới giữ được**, có allow/deny list và governance account | W3 slide 05, [04:51–14:10] |
| Stablecoin thử nghiệm: **100 EUDemo** tại `allowlist.testnet.concordium.com`, cần identity test có quốc tịch EU | W3 slide 06, 32 |
| ⭐ **Sponsored transactions ở tầng protocol từ 03/2026, cho mọi loại giao dịch**: sender ký hành động, sponsor ký và trả phí, chain kiểm cả hai | W3 slide 11 |
| Chạy sponsor an toàn: kiểm trước khi ký · key chỉ ở server, rate-limit · theo dõi số dư | W3 slide 17 |
| **x402**: buyer (client), seller API (server), facilitator (kiểm + sponsor). Cài `@x402/concordium`. **Chưa có facilitator công khai: seller tự chạy** | W3 slide 21–23 |
| ⭐ **Spend controls của x402 hiện chỉ là "soft"** (code agent tự kiểm); **Protocol-Level Locks** (01/2027) sẽ đưa giới hạn lên chain | W3 [~40:00–41:00] |
| ⭐ **Memo** trên giao dịch chuyển token chứa mã đơn hoặc hash → *"auditable purchase log"*; dữ liệu lớn thì **neo hash** | W3 slide 30, [49:08–49:40] |
| **Roadmap**: EURQ mainnet (12/2026) · Protocol-Level Locks (01/2027) · Verify & Pay cho agent (01/2027) · **Concordium Signer** giữ key tách khỏi agent (02/2027) | W3 slide 28 |
| Global FinReg: trên testnet *đáng ra* nhanh; trên mainnet là KYB thật. Diễn giả không chắc chắn | W3 [53:38–54:53] |
| SDK hỗ trợ tốt nhất: **TypeScript (Web SDK) và Rust** | W3 [49:40–50:50] |

### 2.4 Bản đồ thành phần Concordium theo trạng thái

| Thành phần | Trạng thái | Dùng trong dự án |
|---|---|---|
| Concordium ID, Test IDP, ZK proof | ✅ Testnet | L3 |
| Verify & Access, consent proof, audit anchor | ✅ Testnet | L3, L4 |
| Agent Registry CIS-8004, CIS-8, badge, MCP hosted | ✅ Testnet (CIS-8 còn là draft) | L1 |
| Sponsored transactions (protocol) | ✅ Testnet | Phí cho agent và kỹ sư |
| PLT / EUDemo, memo | ✅ Testnet | L4 (memo), mở rộng thanh toán |
| x402 + `@x402/concordium` | ✅ Testnet, phải tự chạy facilitator | Mở rộng |
| Web3 ID / CIS-4 | ⚠️ Có trong docs, Browser Wallet có menu "Web3 ID"; chưa rõ Verify & Access hỗ trợ | L3 (lớp a) |
| Global FinReg (Business ID) | ⏸️ Testnet đòi Sign In / KYB; chờ W5 | Công ty A |
| Agent IDP | ❌ Devnet, không phụ thuộc | Không dùng |
| Protocol-Level Locks, Verify & Pay cho agent, Concordium Signer | ❌ 2027 | Path to production |

---

## 3. Hướng đã chốt: C-lite bản kết hợp ⭐

### 3.1 Quá trình chốt

| Mốc | Quyết định | File |
|---|---|---|
| Sau W1 | 3 hướng: A (Agent Consent), B (Trust Gateway), C (Enterprise Delegation) | `Bao-cao-Workshop01.md` mục X |
| Sau W2 (v1) | Đề xuất gộp A+B (MandateOS), loại C vì quá nặng cho solo | `Danh-gia-chot-huong-sau-W2.md` |
| Sau W2 (v2) | Bạn nghiêng về C → chọn **C-lite có điều kiện**, A+B làm dự phòng | `Danh-gia-chot-huong-sau-W2-v2.md` |
| Sau W2 (trao đổi thêm) | **Gộp 2 bản C-lite**: dùng cả (a) credential CIS-4 và (b) phiếu giao việc, vì chúng trả lời 2 câu hỏi khác nhau | File này, mục 3.3 |
| Sau W3 | Giữ nguyên hướng; bổ sung sponsored transactions, memo cho L4, Locks vào path to production | File này |

### 3.2 Bài toán

Công ty A cung cấp dịch vụ vận hành (MSP / DevOps). **Agent của A thao tác trên hạ tầng của khách hàng B** (deploy, restart, đọc log, đổi cấu hình). B cần biết chắc:
1. Agent **đúng là của A**, không phải agent mạo danh.
2. Có **một nhân viên đã xác minh của A chịu trách nhiệm**, nhưng B **không cần biết người đó là ai**.
3. Agent **chỉ làm đúng phạm vi** được giao, và quyền **thu hồi được**.
4. Mọi thao tác **có bằng chứng kiểm toán**, dùng được khi tranh chấp và hướng tới EU AI Act Điều 12.

Đây là đúng tình huống một người tham dự hỏi CTO ở W1 [49:30–50:48], và CTO trả lời *"both are possible"*. Badge của Concordium giải quyết ý 1, nhưng slide 10 của W2 nói rõ badge **không** giải quyết ý 3. Đó là khoảng trống dự án lấp vào.

### 3.3 Thiết kế 4 lớp

```text
L1  Danh tính agent    badge CIS-8004 + key CIS-8, owner = công ty A          (có sẵn, W2)
L2  Phiếu giao việc    A ký: {key của agent, khách hàng B, phạm vi,           ← (b), tự xây
                         hạn dùng, commitment về kỹ sư phụ trách}
                         → neo hash on-chain (memo), A thu hồi được
L3  Người duyệt        thao tác rủi ro → kỹ sư duyệt trên ID App/ví:          ← (a) nếu có, dự phòng bằng
                         proof "nhân viên hợp lệ của A, vai trò X, chưa bị       Concordium ID + consent
                         thu hồi" + câu consent chứa mã thao tác và hash phiếu
L4  Audit              hash log từng thao tác neo on-chain (memo hoặc         (W1, W3; chờ W4)
                         Merkle root)
```

**Vì sao dùng cả (a) và (b):**

| | (a) Credential CIS-4 | (b) Phiếu giao việc do công ty ký |
|---|---|---|
| Trả lời | *Người này có phải nhân viên hợp lệ của A?* | *Agent được giao làm gì, cho ai, đến khi nào?* |
| Thời hạn | Dài, theo hợp đồng lao động | Ngắn, theo từng hợp đồng dịch vụ |
| Thu hồi khi | Nhân viên nghỉ việc | Hết việc hoặc đổi phạm vi |
| Ngoài đời giống | Thẻ nhân viên | Phiếu giao việc |

**Giữ ẩn danh ngay cả khi (a) không dùng được:** phiếu giao việc không ghi tên kỹ sư, chỉ ghi **commitment** = hash(account kỹ sư + chuỗi bí mật A giữ). Bình thường B không biết là ai; khi tranh chấp, A công bố chuỗi bí mật để ai cũng kiểm được. Cùng tinh thần với Privacy Guardians.

**Bổ sung từ W3:**
- Công ty A chạy **sponsor** (protocol-level) để agent và kỹ sư không cần giữ CCD.
- L4 ghi **hash phiếu giao việc + mã thao tác vào memo**, tra được trên CCDExplorer.
- **Gateway của B tự kiểm phạm vi**, không tin giới hạn agent tự khai (vì spend controls hiện chỉ là "soft").

### 3.4 Luồng demo và các case bị từ chối

```text
Agent DevOps của A ──yêu cầu thao tác──▶ Gateway của B
   ① badge active, owner = A (ZK reveal tên công ty)     ← chặn agent mạo danh / badge đã revoke
   ② challenge–response bằng key CIS-8                   ← chặn agent sai key
   ③ phiếu giao việc hợp lệ, chưa thu hồi, đúng phạm vi  ← chặn kỹ sư đã nghỉ, thao tác ngoài phạm vi
   ④ thao tác rủi ro → kỹ sư duyệt (1 lần quét QR)       ← chặn khi kỹ sư từ chối
   ⑤ audit anchor                                         ← bằng chứng cho mọi thao tác
```

### 3.5 Ánh xạ thành phần

| Thành phần Concordium | Lớp | Trạng thái |
|---|---|---|
| Identity doanh nghiệp (Global FinReg) | A | ⏸️ |
| Agent Registry CIS-8004 + Agent Card + badge, ZK reveal tên công ty | L1 | ✅ |
| CIS-8 + challenge–response | L1 | ✅ |
| Phiếu giao việc + commitment, neo hash | L2 | Tự xây |
| Web3 ID / CIS-4 **hoặc** Concordium ID + consent | L3 | ⚠️ / ✅ |
| Verify & Access (consent + statement) | L3 | ✅ |
| Memo / audit anchor | L4 | ✅ |
| Sponsored transactions | Phí | ✅ |
| MCP / A2A | Gateway | ✅ MCP; A2A chờ W6 |
| x402 (B thu phí A theo thao tác) | Mở rộng | Tùy chọn |

Tổng cộng **7–9 thành phần** trong một luồng, đáp ứng tốt tiêu chí *depth of integration*.

### 3.6 Giới hạn scope (thi solo)

- 1 công ty A, 1 agent, 1–2 kỹ sư, 1 khách hàng B, khoảng 3–4 loại thao tác.
- Hạ tầng của B là **mô phỏng** (một service giả có vài endpoint).
- Policy dùng luật cứng (JSON), không để AI tự quyết.
- **Không dùng** Agent IDP, Protocol-Level Locks.
- **Thứ tự build:** L1 → L2 → L4 → L3 (Concordium ID + consent) → **nâng L3 lên CIS-4 sau cùng**, nếu kịp.

### 3.7 Path to production (định hướng)

- **Khách hàng:** nhà cung cấp dịch vụ vận hành và khách hàng doanh nghiệp của họ.
- **Động lực:** EU AI Act (Điều 12 ghi log, Điều 26(6) deployer lưu log ít nhất 6 tháng). Chỉ nói "hướng tới hỗ trợ tuân thủ".
- **Khác biệt với Microsoft Entra Agent ID / AWS:** họ quản lý agent **trong một tổ chức**; dự án làm việc **xuyên tổ chức**, **kiểm chứng công khai**, có **ZK**.
- **Lộ trình nâng cấp theo roadmap Concordium:** Locks (01/2027) thay giới hạn tự kiểm · Verify & Pay cho agent (01/2027) · Concordium Signer (02/2027) · EURQ (12/2026) cho thanh toán dịch vụ.

---

## 4. Những điểm còn mở và mốc quyết định

| # | Câu hỏi | Ảnh hưởng | Bằng chứng hiện có | Cách giải / mốc |
|---|---|---|---|---|
| **G1** | Công ty xác nhận nhân viên bằng gì? Verify & Access có yêu cầu được proof trên Web3 ID (CIS-4)? | Có lớp (a) hay chỉ (b) | ✅ Browser Wallet có menu "Web3 ID" (09/11) | Hỏi Discord; thử Web3 ID issuer; **quyết định 11/11 (W4)** |
| **G2** | Proof có lộ địa chỉ account / credential ID không? | Mức ẩn danh của L3 | Chưa có | Hỏi Discord |
| **GF** | Global FinReg trên testnet sao đòi Sign In / KYB? | Account của công ty A | W3 Q&A: testnet *đáng ra* nhanh | **W5 (16/11)** có tài liệu riêng; dự phòng: tạm dùng account cá nhân đóng vai A |
| **DA** | ⭐ **Dự án có sẵn nào để gắn vào?** | Thể lệ yêu cầu "integrated into your existing project" | Chưa có | **Cần bạn quyết trước 23/11** |
| L4 | Neo audit bằng memo hay cách khác? Memo dài tối đa bao nhiêu? | Thiết kế L4 | W3: memo, neo hash | W4 (11/11) |
| A2A | Agent giao tiếp với gateway theo chuẩn nào? | Gateway | W2: Agent Card chuẩn A2A | W6 (18/11) |

---

## 5. Những gì đã làm được

### 5.1 Tài liệu (đều nằm trong `Tailieu/`, đã merge vào `main`)

| Tài liệu | Nội dung |
|---|---|
| `Tong-hop-Workshop01-va-Hackathon.md` | Tổng hợp thể lệ và W1, kiểm chứng research cũ |
| `Bao-cao-Workshop01.md` | Báo cáo W1 (đã hiệu đính theo slide) |
| `Bao-cao-Workshop02.md` | Báo cáo W2 |
| `Bao-cao-Workshop03.md` | Báo cáo W3 |
| `Danh-gia-chot-huong-sau-W2.md` / `-v2.md` | Hai bản đánh giá chốt hướng |
| `Lo-trinh-hoc-va-tham-khao.md` | Lộ trình học |
| `Checklist-chuan-bi-tam.md` / `Checklist-sau-W2.md` | Checklist và nhật ký testnet |
| `Workshop01/`, `Workshop02/`, `Workshop03/` | Slide (30 + 25 + 36) và transcript của cả 3 buổi |

### 5.2 Môi trường testnet

| Việc | Kết quả |
|---|---|
| Browser Wallet trên Ubuntu, mạng Testnet | ✅ Ví #2 (ví #1 bỏ vì lộ seed phrase) |
| Identity 1 (trên 18 tuổi, DK) + account | ✅ `3Rgk3fkCJVsyqdpetE7Xq6w8KFhY7RQhQh8na1Qc36b4A26gaw`, index 19406, **20.000 test CCD** |
| Identity 2 (dưới 18 tuổi) + account | ✅ `3Exu4kLu375FiXzUE8rxCjnRcYhxsJZwCoyUqDudHS78hVbkss`, index 19408 |
| Global FinReg (Business ID) cho công ty A | ⏸️ Đòi Sign In / KYB |
| Phát hiện: Browser Wallet có menu Web3 ID | ✅ Bằng chứng một phần cho G1 |
| Kết nối Discord | ✅ |
| Tạo project trên Encode, đăng câu hỏi Discord, chạy demo `ccd-ui-sdk`, cài Node.js | ⚠️ Chưa xác nhận |

### 5.3 Bài học vận hành

- **Không bao giờ chụp hoặc gửi seed phrase**; ví bị lộ thì bỏ hẳn, vì identity và account sinh từ seed.
- Lỗi **"Duplicate idCredPub"** nghĩa là đang dùng lại seed cũ.
- Lỗi **"SeedPhrase should not be retrieved without unlocking the wallet"**: ví tự khóa giữa chừng → mở khóa, làm trong chế độ **Fullscreen**.
- CCDExplorer có thể hiển thị nhãn identity khác với tên trong ví; kiểm trong ví mới chính xác.
- Trang web bên ngoài có thể chứa **prompt injection** nhắm vào AI agent (đã gặp trên CCDExplorer): đúng loại rủi ro dự án cần tính tới.

---

## 6. Kế hoạch tiếp theo

| Thời gian | Việc |
|---|---|
| **10–11/11** (trước W4) | Đăng câu hỏi G1/G2/Global FinReg lên Discord · tạo project trên Encode · chạy demo `ccd-ui-sdk` (có consent kèm statement) · nhận 100 EUDemo (Identity 1 là DK) |
| **T4 11/11 (W4)** | ⭐ Quyết định lớp (a) CIS-4 · chốt cách làm L4 · hỏi Locks có bản testnet/devnet trước 09/12 không |
| 12–15/11 | Lớp L1: đăng ký agent, host Agent Card, thử challenge–response CIS-8, thử revoke · thử Web3 ID issuer · **chốt dự án có sẵn** |
| **T2 16/11 (W5)** | Global FinReg và LEI → tạo account công ty A · lấy ý cho path to production |
| 16–18/11 | Thiết kế L2 (schema phiếu giao việc, commitment, thu hồi) · policy gateway · `docs/architecture.md` · nháp `docs/path-to-production.md` |
| **T4 18/11 (W6)** | Chốt giao tiếp A2A / MCP giữa agent và gateway |
| **Trước 23/11** | **Checkpoint 1**: cập nhật mô tả ý tưởng trên Encode |
| 19/11 → 09/12 | Build L1 → L2 → L4 → L3 → nâng L3 lên CIS-4 · hạ tầng giả của B · 5 case bị từ chối · quay video sớm · hoàn thiện `README.md` và `docs/` · chuyển repo sang public · **nộp sớm** |

Chi tiết từng ô trong `Checklist-sau-W2.md`.

---

## 7. Kế hoạch học (tóm tắt từ `Lo-trinh-hoc-va-tham-khao.md`)

| Mảng | Đọc tối thiểu | Dùng cho |
|---|---|---|
| ⭐ Delegation và authorization | Confused Deputy · Macaroons · RFC 8693 (delegation và impersonation) · UCAN | L2 |
| ⭐ Verifiable credential và ZK | W3C VC Data Model 2.0 · commitment · docs Web3 ID và CIS-4 | L2 (commitment), L3 |
| ⭐ Log chống sửa | Certificate Transparency (RFC 9162): Merkle tree, inclusion proof | L4 |
| Bối cảnh agent identity | OpenID Foundation *Identity Management for Agentic AI* · Microsoft Entra Agent ID | Path to production |
| An ninh agent | Lethal trifecta · OWASP Agentic AI | Trust model, lý do cần người duyệt |
| EU AI Act | Điều 12, 19, 26(6) | Path to production, L4 |
| Giao thức | A2A spec · MCP Authorization | Gateway (W6) |
| **Mới từ W3** | Spec x402 trên Concordium (9 quy tắc của facilitator) · tutorial sponsored transactions · `docs.concordium.com/llms.txt` | Phí, mở rộng thanh toán |

**Lịch:** trước W4 học delegation, CT và EU AI Act; 12–15/11 học VC, commitment, Web3 ID; 16–18/11 học A2A, MCP auth; từ 19/11 đọc docs Concordium theo thứ tự build.

---

## 8. Rủi ro chính

| Rủi ro | Mức | Giảm thiểu |
|---|---|---|
| Chưa có dự án có sẵn để gắn vào | **Cao** | Quyết trước 23/11; phương án: fork một agent vận hành mã nguồn mở |
| Global FinReg không dùng được trên testnet | Trung bình | Chờ W5; dự phòng: account cá nhân đóng vai công ty A |
| Web3 ID / CIS-4 không được Verify & Access hỗ trợ | Trung bình | Lớp (b) + commitment vẫn giữ ẩn danh |
| Scope quá rộng cho solo | Trung bình–Cao | Đúng thứ tự build; cắt CIS-4 và x402 nếu thiếu thời gian |
| Demo cần người quét QR thật | Trung bình | Quay sớm, mirror màn hình điện thoại; luôn kèm statement khi xin consent |
| Faucet / ví testnet lỗi gần deadline | Trung bình | Dự trữ CCD (đã có 20.000), nộp sớm |
| Nhiều đội cùng làm theo ví dụ của CTO | Thấp | C-lite là B2B, ít trùng |

---

## 9. Chỉ mục tài liệu

| Muốn tìm | Đọc |
|---|---|
| Thể lệ, lịch, bài nộp | `Tong-hop-Workshop01-va-Hackathon.md`, mục 1 file này |
| Chi tiết từng buổi | `Bao-cao-Workshop01.md`, `Bao-cao-Workshop02.md`, `Bao-cao-Workshop03.md` |
| Vì sao chọn C-lite | `Danh-gia-chot-huong-sau-W2-v2.md`, mục 3 file này |
| Học gì | `Lo-trinh-hoc-va-tham-khao.md` |
| Việc cần làm, nhật ký testnet | `Checklist-sau-W2.md` |
| Slide, transcript | `Workshop01/`, `Workshop02/`, `Workshop03/` |
| Research trước cuộc thi | `Research-Hackathon/` |
