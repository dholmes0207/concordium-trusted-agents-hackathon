# Tổng hợp sau Workshop 06 (v5): đủ dữ liệu 6 buổi, chốt thiết kế, kế hoạch build

> **Soạn ngày:** 20/11/2026 (ngày thứ 2 của build window).
> **Nguồn mới so với v4:** Workshop 05 ([Bao-cao-Workshop05.md](Bao-cao-Workshop05.md)), Workshop 06 ([Bao-cao-Workshop06.md](Bao-cao-Workshop06.md)), trang programme và dashboard trên Encode (đọc 20/11 bằng Claude in Chrome), Discord #general và #announcements 13–20/11 (`~/hackathon-private/Discord/Tong-hop-Discord-13-20-11.md` (chỉ lưu ở máy)), tài liệu MCP service và repo `ccd-agent-kit` (đọc 20/11).
> **Bản trước:** [Tong-hop-sau-W4.md](Tong-hop-sau-W4.md) (v4, 12/11). Thiết kế chi tiết L1–L4, mô hình đe dọa, 24 negative test **vẫn giữ nguyên ở v4** trừ những gì mục 4 của bản này sửa.
> **Ký hiệu:** ✅ đã xác nhận · 📄 có trong tài liệu, chưa thử · ⚠️ chưa chắc · ⭐ quan trọng.

---

## 0. Trả lời nhanh: đã đủ để bắt đầu build chưa?

**Đủ.** Sáu workshop đã xong, trang chủ đã công bố giải và tiêu chí, Discord đã trả lời câu hỏi quan trọng nhất (Q1). Không còn câu hỏi nào chặn việc viết code cho L1, L2, L4.

**Còn ba việc phải làm trong 48 giờ tới, trước khi build phần phê duyệt:**

| # | Việc | Ai | Hạn |
|---|---|---|---|
| 1 | **Nộp Checkpoint 1** trên Encode (tạo project, thêm đồng đội, mô tả ý tưởng). Nội dung soạn sẵn ở [Checkpoint1-goi-y.md](Checkpoint1-goi-y.md) | Bạn | **Trước tối CN 22/11** (hạn cứng 06:59 sáng T2 23/11) |
| 2 | **Chốt 4 quyết định** ở mục 5 (agent nền, cách agent ký, tuyến phê duyệt, phần mở rộng) | Bạn (mình đề xuất sẵn) | T7 21/11 |
| 3 | **Spike S3a rút gọn**: một yêu cầu Verify & Access V1 có `ResourceID` = digest `D`, ghi lại ví / ID App hiển thị gì | Bạn chạy, mình viết code | CN 22/11 |

**Thực tế cần nói thẳng:** kế hoạch v4 dành 13–18/11 cho spike S0–S3, nhưng repo **không có kết quả spike nào** (không có thư mục `spikes/`, checklist không ghi kết quả). Bản này coi như spike chưa chạy và **gộp spike vào 3 ngày đầu build** (mục 6).

---

## 1. Tình hình thực tế cuộc thi (20/11)

### 1.1 Trang programme (encodeclub.com)

| Mục | Nội dung hiện tại | Khác với trước |
|---|---|---|
| **Giải thưởng** | **Top 3 mỗi đội 1M CCD** (tổng 3M CCD), cộng đủ điều kiện xét **Grants Program 75M CCD** | Trước chỉ ghi "sẽ công bố"; W4 nói "CCD cho top 3, grant có lẽ cho hạng nhất". **Nay rõ: cả 3 đội đều được xét grant** |
| **Tiêu chí chấm** | (1) **Depth of integration**: dùng danh tính Concordium, Agent Registry và **agent payments** sâu đến đâu · (2) **Credible path to production** · (3) **It works**: demo end-to-end rõ ràng · (4) **Usefulness**: vấn đề thật cho người hoặc agent thật | Thêm hai tiêu chí "It works" và "Usefulness". Không chấm theo số giao dịch |
| **Yêu cầu** | Chạy trên **testnet**; dùng **có ý nghĩa ít nhất một** thành phần: Concordium ID / Verify & Access, Agent Registry + badge, x402, PLT, sponsored transactions, Agent Registry MCP server | Giữ nguyên |
| **Bài nộp** | Mô tả, repo public, video ≤ 3 phút, link CCDExplorer, path to production | Giữ nguyên |
| **Brief** | *"Take an AI agent you already run… make it accountable. It should be able to prove that a verified human stands behind it, pay and get paid on its own, and leave a record."* | ⚠️ Brief nhắc cả **"pay and get paid"**: payments nằm trong tiêu chí 1 |
| **Gợi ý hướng** (không phải track) | Existing agent · Verified agents (MCP/A2A) · Private verified users · Agent commerce · **Accountable agents** (audit EU AI Act Điều 12, *"a lawful route from an agent back to an accountable owner"*) | Hướng của bạn khớp "Accountable agents" + "Verified agents" |
| **Lịch** | Build từ T5 19/11 · **Checkpoint 1: CN 22/11 23:59 UTC** · Office hours T3 và T6 lúc 15:00 UTC (22:00 VN), **24/11 → 08/12** · Nộp bài T4 09/12 23:59 UTC · Chấm 10–11/12 | ⚠️ **Cuối W6, Yashar nói không còn office hours**, mọi câu hỏi đặt trên Discord (W6 [54:33–54:58]). Trang chủ chưa sửa. Kế hoạch coi như **không có office hours** |
| **Starter pack** | Developer hub, quick start contract, faucet, ví, dApp examples, Web SDK, Agent Registry app + technical reference, CCDExplorer, **AI agent technology overview** | Mới: trang "AI agent technology overview" (`concordium.com/build/ai-agent-technology`) |
| **FAQ: Checkpoint 1** | *"create your project on the platform, add your team and share a short description… It doesn't need to be finished"* | |
| **FAQ: hỗ trợ** | Trong tuần build, hỏi đội Concordium ở **#general** trên Discord của Encode; **phản hồi checkpoint cũng ở đó** | |
| **FAQ: trễ hạn** | Không chấm bài nộp trễ; nền tảng khóa đúng hạn | |
| **Bản ghi + tóm tắt** | Cả 6 buổi có "View Event Replay" và "Summary" | |

### 1.2 Dashboard của bạn (đã xem, không thay đổi gì)

| Mục | Trạng thái |
|---|---|
| Checkpoint 1/2 | **Chưa có project.** Đồng hồ đếm ngược tới 06:59 sáng T2 23/11 (giờ VN). Form: Project Name, Description (tùy chọn), Project Image (tùy chọn); hoặc Join bằng Team Join Code |
| Checkpoint 2/2 (Final) | Các ô: Description · Code · Demo Video · **Testnet link** · **Which Concordium (components)** · **Your path to mainnet** · Slides (tùy chọn) · Live Demo (tùy chọn). Hạn 06:59 sáng T5 10/12 |
| Discord | **Đã kết nối** |
| Programme Manager | **Yashar Ajdari** (yashar@encode.club, Discord `yasharencode`) |

### 1.3 Discord 13–20/11 (chi tiết ở `~/hackathon-private/Discord/Tong-hop-Discord-13-20-11.md` (chỉ lưu ở máy))

| Thông tin | Tác động |
|---|---|
| ⭐ **Q1 có trả lời: Verify & Access V1 chỉ nhận claim trên identity, không nhận credential Web3 ID** (Piotr, 16/11) | L3a không gộp được vào cùng một yêu cầu V&A với consent |
| Concordium tìm *"the cross-chain/external aspect"*: agent hoặc giải pháp đã có ở chain khác, dùng Concordium làm lớp xác minh | Định vị bài thi theo hướng này (mục 4.1) |
| *"the more the better!"* khi được hỏi nên dùng nhiều thành phần hay làm sâu một thứ | Thêm sponsored transactions; cân nhắc x402 |
| Danh tính testnet giả **chấp nhận được** | Không bị chặn bởi KYC thật |
| Facilitator x402 của Concordium cấp **theo API key khi xin** | x402 khả thi nếu muốn làm |
| Tiêu chí chi tiết sẽ công bố (Piotr 17/11: "probably this week") | ⚠️ Theo dõi; chưa thấy đến 20/11 |
| Grant: không có đơn riêng, Concordium liên hệ sau hackathon | |
| Dự án chồng lấn nhiều nhất vẫn là **ProofPath** (đã ra SDK) | Khác biệt: chặn **trước** khi thực thi + phê duyệt gắn đúng hành động |
| W6 Q&A: người tham gia hỏi cách **bắt buộc xác nhận bên ngoài model** cho agent chạy tự động; Concordium chỉ khuyên "kiểm tay, để ít tiền" | Đây là **khoảng trống dự án lấp**; dẫn trong mô tả và video |

---

## 2. Kiến thức từ 6 workshop (một bảng)

| Buổi | Chủ đề | Điều dùng trực tiếp trong dự án |
|---|---|---|
| W1 (02/11) | Concordium ID, ZK proof, Verify & Access | Consent của người duyệt; context được neo bằng VRA; không giữ dữ liệu cá nhân |
| W2 (04/11) | Agent Registry, CIS-8004, CIS-8, badge, Agent Card, MCP hosted | L1: danh tính agent, key ngoài, kiểm badge |
| W3 (09/11) | PLT, sponsored transactions, x402 | Phí giao dịch do bên khác trả; thanh toán (tùy chọn) |
| W4 (11/11) | Protocol-Level Locks (devnet), EU AI Act Điều 12, Register Data, audit CertiK | L4: log off-chain + neo Register Data dạng CBOR; Locks chỉ vào path to production |
| **W5 (16/11)** | Danh tính công ty (Global FinReg, LEI), giữ key (multi-sig, Dfns), ví thương hiệu (SDK, Tether WDK), Proof Explorer | **Global FinReg testnet tự duyệt** · lọc proof theo chỉ số IdP · **anchor Register Data sponsor được** · Q&A xác nhận dùng CIS-8/CIS-8004 để xác thực request agent gọi API/MCP |
| **W6 (18/11)** | MCP (hosted + `ccd-agent-kit` local), A2A, discover → verify → pay, lộ trình | **Năm phép kiểm agent** · REST `/v1/check-badge` · **"agent build được nhưng không tiêu được; người mở khóa signer thì agent mới tiêu"** · A2A card có extension badge · AI Agent Tool Kit / AI Agent ID ra 11/2026 |

### 2.1 Điểm mới quan trọng nhất của W5

1. **Global FinReg Testnet (chỉ số IdP 4)** không kiểm giấy tờ: điền một công ty nghe hợp lý thì được cấp danh tính doanh nghiệp. Mainnet là chỉ số 3.
2. Verifier có thể **chỉ nhận proof từ IdP chọn trước** (ví dụ chỉ Global FinReg cho doanh nghiệp).
3. Thuộc tính công ty: `legalName`, `legalCountry`, `businessNumber` (bắt buộc), `lei`, `registrationAuth` (tùy chọn); reveal được mọi trường, set-proof cho `legalCountry`.
4. Proof V1 gắn identity: `ConcordiumVerifiablePresentationV1`, context `ConcordiumContextInformationV1` với **Nonce, ConnectionID, ResourceID** (bên verifier đặt) và **BlockHash**; credential `ConcordiumIdBasedCredential`, `issuer: did:ccd:testnet:idp:<n>`.
5. **Mọi loại giao dịch đều sponsor được**, kể cả Register Data.
6. Multi-sig có sẵn trong giao thức (ví dụ 2/3 giám đốc ký cho account công ty); Dfns giữ key bằng MPC.

### 2.2 Điểm mới quan trọng nhất của W6

1. **Hai MCP server:** hosted Agent Registry (`agent-registry-mcp.concordium.com/mcp`, 41 tool, không giữ key, giới hạn theo IP, có REST + Swagger ở `/docs`) và **`ccd-agent-kit`** chạy local (chain-client không giữ key + **signer bị khóa**; người phải chạy `ccd-config-manager service signer unlock` thì agent mới ký được).
2. **Năm phép kiểm cho mọi Agent Card, mọi lần:** trusted registry · active · same URL · same bytes (SHA-256) · same owner. Sau đó thêm luật riêng: owner allow-list, xem `agent_history`, kiểm lại trước hành động lớn.
3. **A2A card** là JSON chuẩn A2A v1.0; phần Concordium chỉ là **extension badge** (`tokenAddress`, `owner`).
4. Số liệu 12/11: mainnet 5.136 agent; testnet 1.167; một owner testnet có **4 trên 148 card hợp lệ**. *"Registered is not the same as verified. Check every card, every time."*
5. Q&A [48:40]: chưa có cách khuyến nghị để **bắt buộc xác nhận ngoài model** khi agent chạy tự động (chỉ "kiểm tay, để ít tiền"). Cuối buổi: **không còn office hours**, hỏi qua Discord.
6. **Lộ trình (targets):** AI Agent Tool Kit (11/2026) · **AI Agent ID** (11/2026: agent chứng minh chi tiết chọn lọc từ ID của bạn) · Agent ID Service (12/2026) · Protocol-Level Locks (01/2027) · Verify & Pay (01/2027) · **Concordium Signer** (02/2027: ký mà key không ở trong agent).
7. **Giờ đầu tiên của build:** thêm MCP registry → đăng ký agent trên testnet → xuất bản card có badge → kiểm agent khác bằng năm phép kiểm → trả tiền bằng stablecoin test qua x402.

---

## 3. Các điểm mở: trạng thái sau v5

| Mã | Câu hỏi | v4 | **v5** | Còn phải làm |
|---|---|---|---|---|
| **G1.1, G1.2** | Phát hành và chứng minh credential nhân viên Web3 ID trên testnet | Mở | 📄 W5 dùng Proof Explorer testnet với Browser Wallet chạy bình thường (với credential danh tính); credential CIS-4 chưa ai thử | Chỉ cần nếu làm L3a (mở rộng) |
| **G1.3** (AB2) | Gộp proof credential nhân viên và consent của cùng một người | Mở | ✅ **Đóng phần giao thức:** V&A V1 **không** nhận claim Web3 ID (Piotr). Không gộp được trong một yêu cầu V&A | Nếu làm L3a: dùng Web3 ID presentation riêng + commitment (cách ii) |
| **G1.4** | Phê duyệt gắn đúng hành động; người duyệt thấy gì | Mở | 📄 Context V1 có `ResourceID`, `ConnectionID` do verifier đặt và nằm trong proof (W5). Chưa biết ví/ID App **hiển thị** gì | **Spike S3a** (CN 22/11) |
| **G2** | Proof lộ định danh nào | Mở một phần | 📄 Proof V1 gắn identity mang `issuer` (IdP) và khoảng hiệu lực; proof gắn account mang `did:ccd:…:cred:<credId>` | Đọc JSON thật trong S3a |
| **GF** | Global FinReg trên testnet | ⏸️ | ✅ **Đóng:** testnet tự duyệt (W5). Chỉ số 4 | Bạn tạo danh tính "công ty A" (mục 6, ngày 20/11) |
| **DA** | Agent nền | Hạn 15/11 (đã trễ) | Đề xuất ở mục 5 | **Bạn chốt 21/11** |
| **A2A** | Gateway là MCP server hay HTTP proxy | Chờ W6 | ✅ **MCP server** (W6: MCP là giao diện agent → tool; A2A là agent → agent) | — |
| EU | Use case có thuộc diện rủi ro cao không | P2 | Giữ nguyên | Ghi đúng phạm vi trong path to production |

---

## 4. Thiết kế chốt (thay đổi so với v4)

### 4.1 Định vị bài thi

> **MandateGate**: cổng kiểm soát giúp **AI DevOps agent của công ty A** (bất kỳ agent nào nói MCP, ở bất kỳ chain nào) được thao tác trên hạ tầng của **khách hàng B** mà B không phải tin mù: B kiểm **agent là ai** (Agent Registry + badge + key CIS-8), **ai ủy quyền và cho làm gì** (phiếu giao việc neo on-chain, thu hồi được), **người nào đã duyệt đúng thao tác rủi ro này** (Concordium ID / Verify & Access, không lộ dữ liệu cá nhân), và **còn lại bằng chứng** (log neo on-chain theo mục đích của EU AI Act Điều 12).

Tên "MandateGate" là gợi ý; đổi được.

**Khớp tiêu chí chấm:**

| Tiêu chí | Bài thi đáp ứng bằng |
|---|---|
| Depth of integration | Agent Registry + badge (5 phép kiểm, đọc chain) · CIS-8 · Concordium ID / Verify & Access (consent gắn hành động) · Company ID qua Global FinReg · Register Data · Sponsored transactions · (mở rộng) x402 |
| Path to production | Global FinReg mainnet (chỉ số 3) · multi-sig account công ty · Dfns hoặc Concordium Signer giữ key agent · Locks cho phần tiền · lộ trình AI Agent ID |
| It works | Demo end-to-end trên testnet: agent thật (Claude Code hoặc agent DevOps mã nguồn mở) gọi tool qua gateway, 1 luồng thành công + 3–4 luồng bị chặn |
| Usefulness | Nhà cung cấp dịch vụ vận hành (MSP) cho agent vào hạ tầng khách hàng là bài toán thật; agent nói MCP ngày càng nhiều |

### 4.2 Kiến trúc (đã sửa)

```text
 Agent bất kỳ nói MCP          Máy của A                     Phía B
 (Claude Code / HolmesGPT…)
        │ MCP (stdio)
        ▼
 ┌────────────────────┐  HTTPS, request có chữ ký  ┌─────────────────────────┐    ┌──────────────┐
 │ agent-proxy (của A)│ ─────────────────────────▶ │ MandateGate (MCP server)│ ─▶ │ Ops API giả  │
 │ giữ key CIS-8 của  │ ◀───── biên nhận có ký ─── │ L1 → L2 → L3 → thực thi │    │ (Docker)     │
 │ agent, ký request, │                            │ → L4                    │    └──────────────┘
 │ mang phiếu giao việc│                           └───────────┬─────────────┘
 └────────────────────┘                                        │ đọc chain, gửi anchor (sponsor)
                                                                ▼
                                          Concordium testnet: CIS-8004, CIS-8, Register Data,
                                          VRA/VAA, danh tính (IdP 0 cá nhân, IdP 4 công ty)
                    Kỹ sư của A ──(ví / ID App)── trang phê duyệt ──▶ Verify & Access V1
```

**Thay đổi chính so với v4:**

| # | Thay đổi | Lý do |
|---|---|---|
| 1 | **Gateway là MCP server** (streamable HTTP). Agent nói chuyện với một **`agent-proxy` chạy local của A** qua stdio; proxy giữ key, ký từng request và chuyển tới gateway | W6: MCP là giao diện agent → tool. Agent **không phải sửa** ("plug into the stack you already use"); key không nằm trong agent, đúng tinh thần `ccd-agent-kit` và Concordium Signer |
| 2 | **Key của agent là key EVM (secp256k1)**, gắn vào agent qua CIS-8 với namespace `eip155:<chain>` (chain có trong `agent-registry.concordium.com/chains.json`) | Piotr: Concordium tìm phần **cross-chain**. Cùng một agent giữ một danh tính trên chain EVM và trên Concordium ⚠️ kiểm trong S0 rằng CIS-8 testnet nhận secp256k1 |
| 3 | **L1 dùng đúng "năm phép kiểm" của W6** + kiểm chữ ký request bằng key CIS-8 + owner của key trùng owner của agent | Khớp cách Concordium khuyến nghị; đọc chain trực tiếp, REST `check-badge` chỉ để đối chiếu |
| 4 | **V2 (Organization):** account A tạo từ danh tính **Global FinReg Testnet**; onboarding một lần bằng proof reveal `legalName` chỉ nhận IdP chỉ số 4 | GF đã đóng (W5) |
| 5 | **L3b (phê duyệt):** yêu cầu **Verify & Access V1**, `ResourceID` = `D` (digest của hành động), consent text sinh từ mẫu cố định. Kỹ sư duyệt bằng ví | Q1: V1 chỉ nhận identity claim; context V1 có chỗ cho `D` |
| 6 | **L3a (credential nhân viên Web3 ID) chuyển xuống "mở rộng"**, chỉ làm khi lõi xong trước 03/12; nếu làm thì đi đường Web3 ID presentation riêng + commitment (cách ii của v4) | Q1 đóng cửa cách gộp; thời gian còn 19 ngày |
| 7 | **Gateway (B) sponsor phí** cho anchor của A (phiếu, thu hồi) và của chính nó | W5: Register Data sponsor được; thêm một thành phần Concordium thật sự có ích (A không cần giữ CCD) |
| 8 | **Tùy chọn x402:** B tính phí A cho mỗi thao tác mức 2 bằng stablecoin test qua facilitator của Concordium (xin API key) | Brief nhắc "pay and get paid"; tiêu chí 1 nhắc "agent payments". Chỉ làm nếu lõi xong |

### 4.3 Approval Binding (đơn giản hóa cho tuyến chính)

| | Tuyến chính (L3b qua V&A V1) |
|---|---|
| Kỹ sư duyệt bằng | Ví có danh tính (Browser Wallet), proof gắn **account** nếu ví hỗ trợ; nếu chỉ có proof gắn identity thì dùng ID App |
| Gắn hành động (AB1) | `ResourceID` = `D`; gateway kiểm `D` trong presentation khớp request đang chờ |
| Gắn chủ thể (AB3) | Proof gắn account → `credId` mở đúng `approverCommitment` trong phiếu. Proof gắn identity → **không** gắn được người cụ thể bằng mật mã; khi đó dùng Approval Service của A (MVP-T của v4) |
| Tính mới (AB4) | Nonce 32 byte do gateway sinh; `D` dùng một lần |
| Gọi tên bằng chứng | "Approval evidence". Chỉ gọi "verifiable consent" khi S3a xác nhận ví hiện đúng nội dung đã neo |

**Spike S3a quyết định nhánh nào.** Kết quả ghi vào `Checklist-sau-W2.md`.

### 4.4 Những gì giữ nguyên từ v4

L2 (schema phiếu giao việc, quy tắc cấp quyền, thu hồi R1 fail-closed, commitment), L4 (bản ghi, nonce, tách `pii_blob`, anchor CBOR `CLITE-*`, ba trạng thái), mô hình đe dọa (mục 4 của v4), 24 negative test (mục 3.6 của v4), path to production (mục 3.10 của v4, bổ sung mục 4.2 ở trên).

---

## 5. Bốn quyết định cần bạn chốt (hạn T7 21/11)

| # | Quyết định | Đề xuất của mình | Phương án khác |
|---|---|---|---|
| D1 | **Agent nền** | **Claude Code làm agent trong demo** (judge quen, W6 demo bằng chính nó), và chứng minh "bất kỳ agent MCP nào" bằng một test với agent thứ hai (HolmesGPT hoặc một agent LangChain nhỏ) | Chỉ HolmesGPT (Python, nặng hơn) · agent tự viết |
| D2 | **Agent ký bằng gì** | Key **EVM secp256k1** gắn qua CIS-8 với namespace của một chain trong `chains.json` (ví dụ `eip155:8453`, Base) để có phần cross-chain. Danh sách 292 chain **chỉ có namespace mainnet**, không có testnet EVM (kiểm 20/11); một địa chỉ EVM dùng được trên mọi chain EVM nên demo không cần giao dịch trên Base | Key ed25519 (đơn giản hơn, mất phần cross-chain) |
| D3 | **Tuyến phê duyệt** | V&A V1 qua ví, chờ S3a; dự phòng MVP-T | ID App làm chính |
| D4 | **Phần mở rộng** (chỉ một, sau 03/12) | **x402 thu phí thao tác mức 2** (tiêu chí nhắc "agent payments") | L3a credential nhân viên (đúng câu chuyện hơn nhưng rủi ro kỹ thuật cao) |

**Ngôn ngữ:** TypeScript cho gateway, proxy, trang phê duyệt và script (Web SDK `@concordium/web-sdk`, MCP SDK TypeScript). Node ≥ 22 (yêu cầu của `ccd-agent-kit`).

---

## 6. Kế hoạch chi tiết (20/11 → 10/12)

**Quy ước:** giờ Việt Nam. **Mình** = Claude (code, script, tài liệu, báo cáo). **Bạn** = việc cần ví, danh tính, ký giao dịch, quyết định, Encode, Discord. **ĐĐ** = đồng đội (gợi ý: trang phê duyệt, hạ tầng giả, video; điều chỉnh khi đồng đội vào). Mỗi ngày có **điều kiện hoàn thành**; không đạt thì ghi lý do vào checklist và đi tiếp theo dự phòng.

### Tuần 0: khởi động và spike rút gọn (20/11 → 22/11)

| Ngày | Mình | Bạn | ĐĐ | Hoàn thành khi |
|---|---|---|---|---|
| **T6 20/11** (hôm nay) | Báo cáo W5, W6, bản v5 này; gợi ý Checkpoint 1 · Dựng khung monorepo: `gateway/`, `agent-proxy/`, `mock-ops/`, `approval-web/`, `scripts/`, `spikes/` | **Tạo project trên Encode** (hoặc để CN) · **Xin danh tính "công ty A" bằng Global FinReg Testnet** trong Browser Wallet (điền công ty nghe hợp lý) · Cài **Node ≥ 22**, pnpm, Docker | Đọc `Tong-hop-sau-W6.md`, W6 slide 16–20 | Khung repo build được; yêu cầu Global FinReg đã gửi |
| **T7 21/11** | **Spike S0:** sinh key secp256k1; dựng canonical bytes CIS-8 qua MCP; script đăng ký agent và kiểm 5 phép · **Spike S1:** Register Data CBOR, đọc lại, theo dõi block finalized, thử **sponsor** | **Chốt D1–D4** · Ký giao dịch đăng ký agent và CIS-8 trên testnet (account công ty A nếu đã có, không thì account cá nhân) | `mock-ops/`: 4–5 thao tác giả (logs, restart, scale, deploy, delete) bằng Docker Compose | Agent có trên testnet registry, `check-badge` hợp lệ; có link CCDExplorer của anchor CBOR; biết sponsor được hay không |
| **CN 22/11** | **Spike S3a:** trang gửi yêu cầu V&A V1 với `ResourceID` = `D`; script đọc presentation, tìm `D`, liệt kê định danh lộ ra · Viết bản ghi quyết định | **Chạy S3a** bằng Browser Wallet (và ID App nếu được); **chụp màn hình phê duyệt** · ⭐ **Nộp Checkpoint 1** (nên trước 22:00) | Vào project bằng Team Join Code; kết nối Discord | Checkpoint 1 đã nộp; biết `D` có trong proof không, ví hiện gì; chọn nhánh L3b |

### Tuần 1: L1, L2 (23/11 → 29/11)

| Ngày | Mình | Bạn | ĐĐ | Hoàn thành khi |
|---|---|---|---|---|
| T2 23/11 | **Gateway L1:** MCP server; request envelope; kiểm chữ ký key CIS-8; 5 phép kiểm từ chain; ghim registry; idempotency `request_id`; giới hạn kích thước | — | Nối `mock-ops` sau gateway | Negative test 1, 2, 3, 5, 17, 23 qua |
| **T3 24/11** | **agent-proxy:** MCP stdio, ký request, mang phiếu; nối Claude Code → proxy → gateway → mock-ops | **Đăng câu hỏi Discord** (S3a còn kẹt, rate limit MCP cho demo); 22:00 xem #announcements phòng khi office hours vẫn diễn ra | Viết test end-to-end khung | Claude Code gọi được `logs.read` qua gateway; request giả mạo bị chặn |
| T4 25/11 | **L1 hoàn thiện:** key CIS-8 bị đăng ký lại, agent đổi owner (V2), owner phải là account công ty A (V2 onboarding: proof reveal `legalName` từ IdP 4) | Chuyển agent sang account thứ hai để test 6, rồi chuyển lại | — | Negative test 4, 6 qua; V2 dùng danh tính công ty |
| T5 26/11 | **L2:** schema phiếu, JCS, công cụ cấp phiếu cho A (CLI), anchor `CLITE-WO` (sponsor bởi B) | Ký giao dịch cấp phiếu bằng account A | — | Cấp phiếu có link CCDExplorer |
| **T6 27/11** | **L2:** kiểm phiếu (V3), quy tắc scope, trần quyền B | Hỏi Discord nếu kẹt | Trang CLI/web nhỏ cho A cấp và thu hồi phiếu | Negative test 7, 9, 10, 19 qua |
| T7 28/11 | **L2:** thu hồi R1: theo dõi chain, `synced_until`, fail-closed | Ký giao dịch thu hồi | — | Negative test 8, 21 qua |
| CN 29/11 | Đệm; rà lại tuần; cập nhật checklist | Rà tiến độ cùng mình | — | Lõi L1 + L2 chạy end-to-end |

### Tuần 2: L4, L3b (30/11 → 05/12)

| Ngày | Mình | Bạn | ĐĐ | Hoàn thành khi |
|---|---|---|---|---|
| **T2 30/11** ⭐ mốc cắt | **L4:** chuỗi bản ghi, nonce, `pii_blob`, anchor `CLITE-AUD` sponsor, ba trạng thái, hàng đợi neo lại | **Quyết định:** nếu L1 + L2 chưa xong thì bỏ mọi phần mở rộng | — | Bản ghi đủ request, decision, execution |
| **T3 01/12** | **L4:** biên nhận có chữ ký, công cụ kiểm tra toàn vẹn, log gộp từ chối | Hỏi Discord nếu kẹt | — | Negative test 16, 22, 24 qua |
| T4 02/12 | **L3b:** gateway tạo yêu cầu V&A V1 (`ResourceID` = `D`), chờ phê duyệt, kiểm presentation, tiêu `D` nguyên tử | Thử duyệt bằng ví | **Trang phê duyệt** (hiện thao tác, tính lại `D`, gọi ví) | Thao tác mức 2 bị chặn khi chưa duyệt |
| T5 03/12 | **Approval Binding:** mở commitment (`credId`) hoặc Approval Service (MVP-T) theo kết quả S3a | Duyệt và từ chối thử | Hoàn thiện trang phê duyệt | Negative test 13, 14, 15 qua; test 20 kiểm tay |
| **T6 04/12** | **Phần mở rộng D4** (x402 hoặc L3a) nếu lõi xong; không thì sửa lỗi | Hỏi Discord những gì còn mơ hồ về bài nộp | Tập kịch bản demo | Lõi chạy trọn L1 → L4 cho một thao tác mức 2 |
| T7 05/12 | Chạy lại toàn bộ test; hardening; `README.md`, `docs/architecture.md`, `docs/concordium-integration.md` (đủ link CCDExplorer) | Rà tài liệu | Kịch bản video theo `docs/demo-script.md` | Mọi test tự động qua; tài liệu đủ các ô của Checkpoint 2 |

### Tuần 3: hoàn thiện và nộp (06/12 → 10/12)

| Ngày | Mình | Bạn | ĐĐ | Hoàn thành khi |
|---|---|---|---|---|
| CN 06/12 | `docs/path-to-production.md`; hỗ trợ khi quay | Chạy demo | **Quay video ≤ 3 phút** | Có video bản 1 |
| T2 07/12 | Rà repo trước khi public: không key, không seed, **bỏ `Tailieu/Discord/`**, quyết định giữ `Tailieu/` hay không | **Chuyển repo sang public**; mở mọi link ở cửa sổ ẩn danh | Sửa video nếu cần | Mọi link mở được khi chưa đăng nhập |
| **T3 08/12** | Đệm | Theo dõi #announcements (trang chủ ghi "final walkthrough"; có thể bị hủy cùng office hours) | — | — |
| **T4 09/12** | Soạn sẵn nội dung từng ô của Checkpoint 2 | **Nộp bài trên Encode, mục tiêu trước 22:00** | — | Đã nộp |
| T5 10/12 | — | Hạn cứng **06:59 sáng** | — | — |

### 6.1 Cắt scope khi trễ (theo thứ tự)

1. Bỏ phần mở rộng D4 (x402 / L3a).
2. Bỏ agent thứ hai; chỉ demo bằng Claude Code.
3. L3b đi MVP-T (Approval Service của A) thay vì mở commitment.
4. Bỏ sponsor; A và B tự trả phí.
5. **Không bao giờ cắt:** L1 (5 phép kiểm + chữ ký), L2 (phiếu + thu hồi fail-closed), L4 (anchor), video, link CCDExplorer.

### 6.2 Video 3 phút (khung)

| Thời gian | Cảnh |
|---|---|
| 0:00–0:20 | Vấn đề: agent của MSP vào hạ tầng khách hàng, khách hàng không biết agent là ai, ai cho phép |
| 0:20–0:45 | Claude Code (agent) đọc log qua MandateGate: thành công; hiện 5 phép kiểm + phiếu giao việc |
| 0:45–1:30 | Agent xin deploy production: bị giữ lại; kỹ sư duyệt bằng ví (Verify & Access); thực thi; biên nhận |
| 1:30–2:15 | Bị chặn: agent mạo danh (key khác) · phiếu bị thu hồi · consent cho thao tác khác · thao tác ngoài phạm vi |
| 2:15–2:40 | CCDExplorer: agent, phiếu `CLITE-WO`, anchor audit, VRA/VAA, giao dịch được sponsor |
| 2:40–3:00 | Path to production: Global FinReg mainnet, multi-sig, Concordium Signer, Locks |

---

## 7. Rủi ro

| Rủi ro | Mức | Cách xử lý |
|---|---|---|
| Spike chưa chạy, thời gian còn 19 ngày | Cao | Gộp spike vào 3 ngày đầu; cắt scope theo mục 6.1 |
| Browser Wallet không trả lời V&A V1 bằng proof gắn account | Trung bình | MVP-T: Approval Service của A |
| CIS-8 testnet không nhận secp256k1 như mong đợi | Thấp–trung bình | Dùng ed25519; nói phần cross-chain qua badge |
| MCP hosted bị giới hạn tần suất khi demo | Trung bình | Gateway đọc chain trực tiếp; cache kết quả 5 phép kiểm theo phiên; không gọi lặp |
| Global FinReg testnet không tự duyệt | Thấp | Account cá nhân đóng vai A, ghi rõ giới hạn |
| Hosted MCP có lỗi đã được báo (06/11) | Thấp | Đối chiếu với đọc chain; báo Piotr nếu gặp |
| Tiêu chí chi tiết công bố muộn và khác dự kiến | Trung bình | Theo dõi #announcements; rà lại bài vào 05/12 |
| Bạn và đồng đội chưa chia việc rõ | Trung bình | Chia theo cột ĐĐ ở mục 6; họp ngắn mỗi tối T3 và T6 |
| Không còn office hours; câu trả lời trên Discord chậm (Piotr thường trả lời sau 1–4 ngày) | Trung bình | Hỏi sớm, mỗi câu tự đứng được; không chờ câu trả lời mới làm, luôn có phương án dự phòng |

---

## 8. Việc cần làm ngay hôm nay (20/11)

- [ ] **Bạn:** đọc [Checkpoint1-goi-y.md](Checkpoint1-goi-y.md), chọn tên, tạo project trên Encode, gửi Team Join Code cho đồng đội.
- [ ] **Bạn:** Browser Wallet (testnet) → Identities → "+" → **Global FinReg Testnet** → điền một công ty nghe hợp lý → chờ duyệt.
- [ ] **Bạn:** kiểm `node -v` (cần ≥ 22), `pnpm -v`, `docker -v`.
- [ ] **Bạn:** trả lời 4 quyết định D1–D4 (mục 5), có thể chỉ cần "đồng ý đề xuất".
- [ ] **Mình:** dựng khung monorepo và viết spike S0, S1 khi bạn đồng ý D1, D2.

---

## 9. Chỉ mục tài liệu mới

| File | Nội dung |
|---|---|
| [Bao-cao-Workshop05.md](Bao-cao-Workshop05.md) | Báo cáo W5 |
| [Bao-cao-Workshop06.md](Bao-cao-Workshop06.md) | Báo cáo W6 |
| [Checkpoint1-goi-y.md](Checkpoint1-goi-y.md) | Nội dung điền Checkpoint 1 |
| `~/hackathon-private/Discord/Tong-hop-Discord-13-20-11.md` (chỉ lưu ở máy) | Discord 13–20/11 |
| [Workshop05/slides/](Workshop05/slides/), [Workshop06/slides/](Workshop06/slides/) | Slide W5 (29 ảnh), W6 (38 ảnh) |
| [Workshop05/Workshop-05-transcript-EN.txt](Workshop05/Workshop-05-transcript-EN.txt), [Workshop06/Workshop-06-transcript-EN.txt](Workshop06/Workshop-06-transcript-EN.txt) | Bản chép lời |
