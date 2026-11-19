# Báo cáo Workshop 05: Ship to production, adopting blockchain without crypto

> **Buổi:** T2 16/11/2026, 15:00 UTC (22:00 giờ VN), khoảng 49 phút.
> **Diễn giả:** Doris Benda (Blockchain Security Engineer, ChainSecurity; trình bày cho Concordium). Điều phối: Yashar Ajdari (Encode).
> **Nguồn:** video ghi lại (`Workshop05/Workshop05.mp4`, chỉ lưu local), 29 ảnh slide trong [Workshop05/slides/](Workshop05/slides/), bản chép lời Whisper [Workshop05/Workshop-05-transcript-EN.txt](Workshop05/Workshop-05-transcript-EN.txt), bản tóm tắt chính thức trên trang programme của Encode (đọc ngày 20/11).
> Mốc thời gian `[mm:ss]` lấy theo bản chép lời. Bản chép lời tự động có lỗi tên riêng (ví dụ "Finnewegg" = Global FinReg, "lay" = LEI, "Defense" = Dfns, "CK proof" = ZK proof, "fafian access" = Verify and Access).

---

## 1. Tóm tắt một đoạn

Buổi này trả lời ba câu hỏi khi đưa một sản phẩm blockchain tới người không biết crypto: **ai là doanh nghiệp đứng sau** (danh tính công ty qua Global FinReg, LEI), **ai giữ private key** (server của bạn, ví của người dùng, hay wallet-as-a-service như Dfns), và **người dùng nhìn thấy gì** (app mang thương hiệu của bạn, dùng SDK ví của Concordium hoặc Tether WDK). Ba demo đều chạy trên testnet: xin danh tính công ty, tra danh sách identity provider, và tạo ZK proof bằng Web3 ID Proof Explorer.

**Ba điều quan trọng nhất cho dự án:**
1. **Global FinReg trên testnet tự duyệt** hồ sơ công ty (không kiểm giấy tờ), chỉ cần điền thông tin công ty nghe hợp lý; vẫn có chút thao tác tay [19:38–20:30]. Điểm mở **GF** gần như đóng.
2. **Chỉ số identity provider khác nhau giữa testnet và mainnet** (Global FinReg: 4 trên testnet, 3 trên mainnet). Verifier có thể chỉ nhận proof từ IdP chọn trước, ví dụ chỉ Global FinReg cho doanh nghiệp [20:55–21:51].
3. Có người hỏi đúng bài toán của bạn: **dùng CIS-8 / CIS-8004 để xác thực request của một AI agent bên ngoài gọi vào API hoặc MCP của mình được không?** Doris: **được**; endpoint kiểm agent đã đăng ký, link metadata còn sống, hash không đổi, và có danh tính thật (cá nhân hoặc doanh nghiệp) đứng sau [39:55–40:46].

---

## 2. Nội dung theo phần

### 2.1 Mở đầu: người dùng không hiểu crypto [00:15–02:56]

Slide 02–03. Mục tiêu: người dùng không cần biết ví, seed phrase hay blockchain. Sponsored transactions cũng thuộc chủ đề này nhưng đã nói ở W3 nên bỏ qua [02:08–02:27]. Lợi thế của Concordium: **mọi account đều có danh tính đã xác minh đứng sau** [02:32–02:46].

### 2.2 Ai là doanh nghiệp đứng sau? [02:56–25:44]

**Identity rồi mới tới account** (slide 05) [03:00–07:12]
- Ví gửi yêu cầu tới identity provider (IdP) ngoài chain; IdP kiểm giấy tờ, trả **identity object** về ví. Identity object nằm trong ví, không lên chain.
- Mỗi lần tạo account là một giao dịch on-chain. Giao dịch này chỉ chứa **Pedersen commitment** cho từng thuộc tính ("một điểm trông như ngẫu nhiên trên đường cong elliptic"), dùng về sau cho ZK proof. Không có dữ liệu cá nhân trên chain.
- Doris mở CCDScan cho thấy tab Credentials của một account chỉ liệt kê **thuộc tính nào đã được commit**, không có giá trị.

**Hai loại danh tính** (slide 06) [07:23–08:48]: cá nhân (hộ chiếu, bằng lái, hoặc ID số như MitID, BankID ở Bắc Âu) và **pháp nhân** (giấy tờ đăng ký kinh doanh không quá 3 tháng, cộng chủ sở hữu hoặc người có thẩm quyền ký, cũng phải xác minh danh tính).

**Identity provider trên mainnet** (slide 07): Notabene, Digital Trust Solutions (cá nhân), **Global FinReg** (công ty).

**Thuộc tính** (slide 08–09) [11:01–14:21]

| Danh tính | Bắt buộc | Tùy chọn | Loại proof |
|---|---|---|---|
| Cá nhân | Họ tên, ngày sinh, quốc tịch, loại giấy tờ | Số giấy tờ, nơi cấp, ngày giấy tờ, nước cư trú, giới tính, mã số thuế | Reveal (mọi trường); **range** (ngày sinh, ngày giấy tờ); **set / not-set** (quốc tịch, nước…) |
| Công ty | `legalName`, `legalCountry`, `businessNumber` | `lei`, `registrationAuth` | Reveal (mọi trường); set chỉ cho `legalCountry`; **không có range** |

**LEI và các luồng của Global FinReg** (slide 10–11) [14:26–17:18]

| Tình huống | Thời gian tới danh tính đã xác minh |
|---|---|
| Đã có LEI với Global FinReg | Ngay lập tức |
| Chưa có LEI | LEI trong khoảng 1 giờ, rồi xác minh danh tính |
| Có LEI ở nhà cung cấp khác | Chuyển LEI sang Global FinReg trong 3–5 ngày, rồi xác minh |
| Không muốn LEI | Khoảng 12 giờ (duyệt tay) |

So sánh: onboarding doanh nghiệp ở ngân hàng thường 90–120 ngày. Global FinReg là đại lý đăng ký LEI, không phải bên cấp LEI. LEI tra cứu được trên trang GLEIF.

**Demo 1: xin danh tính công ty** (slide 12–13) [09:13–10:45, 17:42–20:30]
- Browser Wallet → Identities → "+" → chọn **Global FinReg Testnet** ("Business ID") → chuyển sang trang của Global FinReg (không do Concordium vận hành).
- Trang có "fast track" (tạo LEI mới hoặc chuyển LEI) và "standard process" (nộp giấy tờ, không lấy LEI).
- ⭐ **Trên testnet** [19:38–20:30]: *"they will just say, okay, fine, we don't check the documents. We just issue that company to you"*. Vẫn phải điền form và chờ một chút; nên điền **một công ty nghe hợp lý**, quá vô lý thì không tự duyệt được.

**Demo 2: tra danh sách identity provider** (slide 14) [20:36–22:56]

| | Mainnet | Testnet |
|---|---|---|
| Danh sách | `wallet-proxy.mainnet.concordium.software/v2/ip_info` | `wallet-proxy.testnet.concordium.com/v2/ip_info` |
| Chỉ số | 1 Notabene · 2 Digital Trust Solutions · **3 Global FinReg** | 0 Concordium testnet IP · 3 Digital Trust Solutions TestNet · **4 Global FinReg Testnet** · 5 Dataspike |

*"Why the index matters: your app can accept proofs only from chosen providers, e.g. only Global FinReg for companies."* Khi chuyển từ testnet sang mainnet phải đổi chỉ số. IdP chỉ được thêm, không bị ghi đè.

**Demo 3: ZK proof bằng Web3 ID Proof Explorer** (slide 15–16) [22:58–25:38]
- Trang `web3id-proof-explorer.testnet.concordium.com`, nối Browser Wallet ở testnet, danh tính giả từ "Concordium testnet IP".
- Các bước: reveal `firstName` (ra "John"), range tuổi trên 18, set quốc tịch EU.
- Màn hình proof (slide 16): `Presentation Context` (chuỗi hex), `Issuer: did:ccd:testnet:idp:0`, `Credential Subject ID: did:ccd:testnet:cred:…`, proof `ConcordiumZKProofV3`.
- Doris chạy **cả hai luồng**: luồng cũ (Web3 ID, không cần anchor) và luồng **Verify & Access** mới, có **giao dịch anchor trên chain** trước khi tạo proof [24:21–25:35].
- Ở phần Q&A [41:17–42:25], Doris mở proof thô của luồng mới: `ConcordiumVerifiablePresentationV1`, `presentationContext` loại `ConcordiumContextInformationV1` với `given` = **Nonce, ConnectionID, ResourceID** và `requested` = **BlockHash**; credential loại `ConcordiumIdBasedCredential`; `issuer: did:ccd:testnet:idp:0`; `validFrom` / `validUntil`; statement `AttributeInRange` cho `dob`. Doris gọi đó là *"Concordium weak linking proof"*.

### 2.3 Ai giữ private key? [25:44–34:12]

Slide 17–21. Ba mô hình: **server của bạn** (không tự giữ), **ví của người dùng** (người dùng phải hiểu seed phrase), **wallet-as-a-service** ở giữa.

- **Multi-sig có sẵn trong giao thức** (slide 18) [26:13–28:02]: một account có nhiều credential (người hoặc công ty, mỗi credential do IdP xác minh), mỗi credential có nhiều key; account đặt ngưỡng. Ví dụ: account công ty có 3 giám đốc, 2 trên 3 phải ký. Trên mainnet có account 7 credential, cần 3 chữ ký. Tạo bằng Desktop Wallet hoặc `concordium-client`. **Không cần smart contract.**
- **Dfns** (slide 19–20) [28:06–31:06]: wallet-as-a-service, giữ key bằng **MPC** (chia key qua nhiều node). App dựng giao dịch bằng Concordium SDK → gọi API Dfns để ký (key không rời Dfns) → app tự gửi lên node. Có ví dụ chính thức trong repo `dfns-sdk-ts`.
- **Hai cách tích hợp ví** (slide 21) [32:40–34:12]: **Connect** (Browser Wallet API cho web, WalletConnect cho ví mobile) hoặc **Integrate** (đưa module Concordium vào ví của bạn; phần khó nhất là tạo danh tính và account; có thể dùng ID App làm bước trung gian).
- **Ví đã hỗ trợ Concordium** (slide 22): Bitcoin.com Wallet (tạo account, giữ và gửi CCD, **Verify & Access**), Coin98 (thêm PLT stablecoin), Ledger Live (ví cứng), Concordium mobile wallet và Wallet for Web (đủ mọi tính năng).

### 2.4 Người dùng nhìn thấy gì? [34:12–38:28]

Slide 23–28.
- **SDK ví của Concordium**: TypeScript (web; Browser Wallet dùng chính SDK này), Kotlin (Android), Swift (iOS, macOS). Làm được: dẫn xuất key từ seed, tạo và khôi phục danh tính, mở account, ký và gửi giao dịch, ZK proof.
- **Tether WDK** (Wallet Development Kit): mã nguồn mở, mỗi chain một module, **stateless** (key không rời app). Module Concordium `@concordium/wdk-wallet-concordium@0.1.0` đang **beta**: dẫn xuất key từ seed, số dư CCD và token, chuyển, báo phí, ký và kiểm thông điệp.
- **Lộ trình WDK** (slide 27, *"targets"*): **V1.0 (11/2026)** tạo account qua Concordium ID App · **V2.0 (12/2026)** tạo account và danh tính ngay trong ví · **V3.0 (01/2027)** đủ Concordium ID: proof, **Verify & Access, human consent**.
- **Developer toolkit** (slide 28): hướng dẫn Company identity, LEI (GLEIF), Dfns, Build a wallet, WDK module, Wallet for developers.

---

## 3. Hỏi đáp [38:36–cuối]

| Câu hỏi | Trả lời | Liên quan |
|---|---|---|
| Có thể chỉ nhận proof từ một IdP nhất định không? [38:50] | Được, tùy app. Ví dụ dịch vụ chỉ cho doanh nghiệp thì lọc theo chỉ số của Global FinReg; các IdP đều là công ty uy tín | V2 (Organization) |
| Lấy slide ở đâu? [39:38] | Tùy Concordium có công khai hay không | — |
| ⭐ Dùng CIS-8 hoặc CIS-8004 để **xác thực request của AI agent bên ngoài gọi vào API / MCP của mình** được không? [39:55] | **Được.** Endpoint kiểm agent đã đăng ký on-chain, link metadata còn sống, hash chưa đổi từ lúc đăng ký, và có danh tính thật (cá nhân hoặc doanh nghiệp) đứng sau account | **Đúng lõi L1 của dự án** |
| App kiểm "trên 18 tuổi" thì nhận lại gì? [40:50] | ZK proof: statement range trên `dob` (cận dưới, cận trên) và proof; không có ngày sinh thật. Doris mở proof thô (mục 2.2, Demo 3) | G2 |
| Người ngoài EU, ở Mỹ hay nước đang phát triển dùng được không? [42:35] | Testnet: dùng gì cũng được vì danh tính giả. Mainnet: hầu hết các nước được hỗ trợ (trừ vài nước như Triều Tiên); Global FinReg hoạt động toàn cầu, hỗ trợ công ty Mỹ | — |
| Luồng presentation mới có thay luồng cũ không? Ai trả phí giao dịch anchor, có sponsor được không? [43:29] | Ví **vẫn hỗ trợ cả hai luồng**: luồng cũ không anchor và luồng Verify & Access cần anchor. Có thể sau này chỉ còn luồng mới. Phí anchor thường do bên chạy backend (merchant) trả. ⭐ **Mọi loại giao dịch đều sponsor được**, kể cả anchor (giao dịch **Register Data**); khi được sponsor, CCDScan hiện thêm trường *sponsor* [44:11–45:12] | L3, L4, chi phí |
| Sponsor `init` contract bị node từ chối trên testnet? [45:14] | Doris nghĩ mọi loại đều được, có thể là lỗi hoặc ngoại lệ với deploy module; nên báo Concordium trên Discord | Không dùng contract tự viết |
| Mọi thứ trong buổi có dùng cho hackathon được không? [46:30] | Được, các frontend đều mở. Có thêm công cụ deploy contract và **wallet test bench** (có phần thử sponsored transaction) | Spike |
| App cho người chưa từng dùng crypto: ai làm bước identity provider, người dùng hay doanh nghiệp làm hộ? [47:24] | Thường **người dùng phải tự làm**, vì doanh nghiệp không có quyền giữ dữ liệu hộ chiếu (ngoại lệ hiếm, ví dụ hãng bay) | Kỹ sư duyệt phải có danh tính riêng |

---

## 4. Tác động lên dự án

| Mục | Trước W5 | Sau W5 |
|---|---|---|
| **GF (Global FinReg trên testnet)** | ⏸️ Đòi Sign In / KYB, chờ W5 | **Gần đóng.** Testnet tự duyệt khi điền công ty hợp lý. Việc của bạn: tạo danh tính "công ty A" bằng **Global FinReg Testnet** (chỉ số 4), mở account công ty từ đó. Nếu không tự duyệt trong 1–2 ngày thì quay về phương án account cá nhân đóng vai A |
| **V2 (Organization)** | Chỉ kiểm được "owner trùng account đã ghim" | Gateway có thể **chỉ nhận proof của IdP chỉ số 4 (testnet) / 3 (mainnet)** và reveal `legalName` (và `lei` nếu có) |
| **L1** | Thiết kế | Được diễn giả xác nhận là cách dùng đúng của CIS-8 / CIS-8004 |
| **G2 (định danh trong proof)** | Chưa rõ với proof gắn identity | Proof V1 gắn identity (`ConcordiumIdBasedCredential`) mang `issuer` (IdP) và `validFrom`/`validUntil`; context gồm Nonce, ConnectionID, ResourceID, BlockHash. Cần spike để biết có định danh ổn định nào không |
| **Consent / context** | Chưa rõ câu consent nằm ở đâu | Context V1 có **ResourceID** và **ConnectionID** do verifier đặt: chỗ tự nhiên để đặt digest `D` của hành động |
| **Phí giao dịch** | Sponsored transactions là tùy chọn | Gateway (B) hoặc A có thể **sponsor anchor Register Data** cho kỹ sư và agent: thêm một thành phần Concordium với chi phí nhỏ |
| **Path to production** | | Multi-sig giao thức cho account công ty A (nhiều giám đốc) · Dfns giữ key agent bằng MPC · WDK V3 (01/2027) đưa Verify & Access và human consent vào ví nhúng |

---

## 5. Link trong buổi

| Chủ đề | Link |
|---|---|
| Company identity | `docs.concordium.com/en/mainnet/tutorials/company-identity/company-identities.html` |
| Thuộc tính ID | `docs.concordium.com/en/mainnet/technical-reference/id-attributes-reference.html` |
| Chọn identity provider | `docs.concordium.com/en/mainnet/how-to/concordium-id/verify-and-access/select-identity-provider.html` |
| Danh sách IdP | `wallet-proxy.testnet.concordium.com/v2/ip_info` (testnet), `wallet-proxy.mainnet.concordium.software/v2/ip_info` |
| Web3 ID Proof Explorer | `web3id-proof-explorer.testnet.concordium.com` |
| Global FinReg, LEI | `concordium.com/article/concordium-global-finreg-lei-corporate-identity` · GLEIF `search.gleif.org` |
| Multi-sig | `docs.concordium.com/en/mainnet/technical-reference/concordium-client/multi-sig.html` |
| Dfns | `docs.dfns.co`, ví dụ `github.com/dfns/dfns-sdk-ts` (examples/libs/concordium/basic) |
| Build a wallet | `docs.concordium.com/en/mainnet/how-to/integrations/wallet-sdk/wallet-sdk.html` |
| Tether WDK | `docs.wdk.tether.io`, module `github.com/Concordium/tether-wdk-concordium` |
| Lộ trình | `concordium.com/roadmap` |
