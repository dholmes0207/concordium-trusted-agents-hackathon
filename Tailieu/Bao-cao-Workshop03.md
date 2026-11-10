# CONCORDIUM TRUSTED AGENTS HACKATHON
## Báo cáo Workshop #3: *Let your agent pay and get paid*

**Ngày:** Thứ Hai 09/11/2026, 15:00 UTC (22:00 giờ VN), dài 60 phút
**Diễn giả:** Doris Benda (Blockchain Security Engineer @ ChainSecurity, trước đây là kỹ sư của Concordium); Giles Mallinson (Encode) dẫn chương trình
**Nguồn:** video replay trên trang programme của Encode (YouTube nhúng), 36 slide và màn hình demo cắt từ video (`Workshop03/slides/`), transcript tiếng Anh (`Workshop03/`), các tài liệu đính kèm của buổi.
**Ký hiệu:** ✅ chính thức (slide hoặc lời diễn giả) · 🟡 nguồn phụ / chưa xác minh · ⚠️ rủi ro hoặc cần hỏi lại · ⭐ áp dụng trực tiếp cho dự án (Hướng C-lite)
Mốc `[mm:ss]` là thời điểm trong video.

---

## 0. TL;DR: 8 điều quan trọng nhất

1. **Buổi này chia 3 phần** (slide 03): tiền agent dùng được (stablecoin dạng PLT), bỏ phí cho người dùng (sponsored transactions), và thanh toán theo từng request qua HTTP (x402). Thêm roadmap và Q&A. Mọi demo đều chạy trên **testnet**. ✅
2. **PLT (Protocol-Level Token) không phải smart contract**: là tài sản gắn sẵn trong protocol như CCD, số dư nằm ngay trong account, **chỉ account đã xác minh danh tính mới giữ được**, và chỉ issuer được duyệt mới phát hành được. ✅ (slide 05)
3. **Sponsored transactions có ở tầng protocol từ 03/2026, dùng cho mọi loại giao dịch**: người gửi ký hành động, sponsor ký và trả phí bằng CCD, chain kiểm cả hai chữ ký nên **không bên nào sửa được giao dịch**. Không nhầm với chuẩn cũ CIS-3 chỉ dùng cho smart contract. ✅ (slide 11) ⭐
4. **x402 có 3 bên: buyer (client), seller API (server), facilitator (kiểm tra + sponsor)**. Cài `@x402/concordium`. **Chưa có facilitator công khai của Concordium: seller phải tự chạy.** x402 là chuẩn mở của Linux Foundation; Concordium tham gia từ 23/09/2026. ✅ (slide 22) ⚠️
5. **Spend controls trong x402 hiện chỉ là "soft"**: kiểm ở code phía client, nếu agent bị chiếm quyền thì vô dụng. **Protocol-Level Locks (dự kiến 01/2027)** sẽ đưa giới hạn chi tiêu lên chain. ✅ [~41:00] ⭐
6. **Memo trên giao dịch chuyển token** chứa được chuỗi bất kỳ (mã đơn hàng, số hóa đơn). Slide gợi ý *"An auditable purchase log: put the order ID in the payment memo. Match it on the explorer."* ✅ (slide 30) ⭐ → dùng được cho lớp L4.
7. **Roadmap** (slide 28, *"Dates can move"*): EURQ trên mainnet (12/2026), Protocol-Level Locks (01/2027), Verify & Pay cho agent (01/2027), **Concordium Signer: giữ key tách khỏi agent** (02/2027). ✅ ⭐
8. **Q&A về Global FinReg**: trên **testnet** việc tạo Business ID *đáng ra* nhanh như Test IDP; trên **mainnet** là KYB thật, mất thời gian. Diễn giả không chắc chắn. ⚠️ Khớp với lỗi bạn gặp hôm 09/11 → chờ **Workshop 5 (16/11)**, buổi có tài liệu "Global FinReg and LEI corporate identity".

---

## 1. Ví dụ xuyên suốt: "Ai trả cái gì?" ✅ (slide 04, [03:12–04:47])

Agent A (người mua) mua một chai rượu của Agent B (siêu thị online):

| | Agent A (buyer) | Agent B (supermarket) |
|---|---|---|
| Ví | 10 EURR (stablecoin), **0 CCD** | 0 EURR, 1234 CCD |
| Làm gì | ① đặt hàng, ② **ký thanh toán** | ③ **ký kèm (co-sign), gửi lên chain, trả phí bằng CCD**, ④ giao hàng |

Tất cả nằm trong **một giao dịch duy nhất trên Concordium**: 10 EURR đi từ A sang B, phí (ví dụ 6,5 CCD) do B trả. Người mua không cần có CCD, vốn là rào cản lớn với người mới.

---

## 2. Phần 1: Stablecoin dạng PLT ✅ (slide 05–09, [04:51–16:42])

### 2.1 PLT khác token smart contract thế nào (slide 05)

| | ERC-20 / SPL / CIS-2 | **PLT trên Concordium** |
|---|---|---|
| Mô hình | Một chương trình có bảng số dư | Tài sản gắn sẵn, giống CCD |
| Số dư nằm ở | Bộ nhớ của contract | **Trong account của bạn** |
| Ai giữ được | Mọi địa chỉ, kể cả contract | **Chỉ account đã xác minh danh tính** |
| Phát hành | Ai cũng deploy được code mới | **Chỉ issuer được duyệt, không có code mới** |

- Code PLT viết một lần trong node, nên không cần audit lại cho từng token. Mỗi token mới chỉ khác tham số. [07:04–07:36]
- Phát hành trên mainnet phải xin Concordium Foundation (`concordium.com/plt`). Trên testnet điền form, **duyệt thủ công nên phải xin sớm**. (slide 05, 32)
- **Token ID là duy nhất toàn chain**, để tránh nhầm lẫn. [14:37–14:52]

### 2.2 Allow list và deny list [09:57–10:30]

- **Allow list:** mỗi lần chuyển, cả người gửi và người nhận **phải** nằm trong danh sách.
- **Deny list:** mỗi lần chuyển, cả hai **không được** nằm trong danh sách.
- **Governance account** là account quyền cao nhất: thêm/xóa khỏi danh sách, và có thể **pause** token. (slide 08)

### 2.3 Demo: nhận stablecoin thử nghiệm (slide 06–07, [08:07–14:10])

- Vào `allowlist.testnet.concordium.com`: kết nối ví → **chứng minh quốc tịch EU bằng ZK proof** → nhận **100 EUDemo**.
- Phía sau là **một giao dịch gồm 3 thao tác**, chạy nguyên tử (một thao tác lỗi thì cả giao dịch bị hủy): thêm account vào allow list, mint 100 EUDemo, chuyển vào ví.
- Trên CCDExplorer, loại giao dịch là `token update` (PLT), khác với `contract update` (smart contract token).
- Thông báo lỗi "Error checking status" trong demo là do một số indexer đang tạm dừng; token vẫn về sau khi refresh. [11:49–12:09]
- ⭐ **Identity 1 của bạn có quốc tịch DK (EU), nên nhận được EUDemo.** Người không ở EU cũng nhận được: trên testnet cứ tạo identity giả với một nước EU. [47:53–48:51]

### 2.4 Gửi stablecoin bằng Web SDK v12 (slide 09, [15:35–16:42])

```ts
const token = await Token.fromId(grpc, TokenId.fromString('EUDemo'));
await Token.transfer(token, sender, {
  recipient: AccountAddress.fromBase58(SELLER),
  amount: TokenAmount.fromDecimal('0.25', token.info.state.decimals),
  memo: CborMemo.fromString('order-42'),
}, signer);
```

- EUDemo có **6 chữ số thập phân**: 0,25 EUDemo được gửi đi dưới dạng `250000`. (slide 08)
- Ví dụ chạy đầy đủ: `github.com/Concordium/concordium-node-sdk-js/tree/main/examples/nodejs/plt`.
- Ở bước này, **người gửi vẫn phải trả phí** → phần 2 giải quyết.

---

## 3. Phần 2: Sponsored transactions ✅ (slide 10–18, [16:42–27:50])

### 3.1 Cơ chế (slide 11)

| Sender | Sponsor | Concordium |
|---|---|---|
| **Ký hành động**, trả số tiền chính, **không trả phí** | **Ký kèm**, trả phí bằng CCD | **Kiểm cả hai chữ ký** |

- **Có trong protocol từ 03/2026, dùng cho mọi loại giao dịch** (chuyển tiền, delegation, gọi smart contract…).
- **Không** phải chuẩn cũ "smart contract sponsored transactions" (CIS-3), vốn chỉ dùng cho smart contract và không còn được khuyên dùng. [17:52–18:27]
- Vì cả hai cùng ký nên **không bên nào sửa được giao dịch** sau khi bên kia đã ký.

### 3.2 Ai ký trước? (slide 12, [18:41–19:20])

| Kiểu | Thứ tự | Dùng khi |
|---|---|---|
| App có ví | **Sponsor ký trước** (backend), người dùng ký sau và gửi lên chain | Ứng dụng web có người dùng cầm ví |
| **Agent (x402)** | **Sender ký trước**, sponsor ký sau và gửi lên chain | Agent tự trả tiền, facilitator lo phí |

### 3.3 Code (slide 13–14, [19:26–21:20])

- **Backend (sponsor):** tạo giao dịch `tokenUpdate`, thêm metadata (sender, nonce, hạn dùng `TransactionExpiry.futureMinutes(5)`), thêm `addSponsor(SPONSOR_ADDRESS)`, ký bằng key của sponsor, chuyển sang JSON gửi cho ví.
- **Ví / agent:** `Transaction.signableFromJSON(...)` rồi `provider.sendSponsoredTransaction(account, tx)`. Phí hiện là 0 trong ví.
- **Backend nên tự tạo giao dịch**; nếu nhận giao dịch từ front end hay từ agent thì **phải kiểm thao tác đúng như mong đợi trước khi ký**, nếu không sẽ bị lợi dụng rút cạn ví. [19:45–20:11]
- Tutorial: `docs.concordium.com/en/mainnet/tutorials/protocol-level-sponsored-transactions/...` · App demo đầy đủ: `github.com/Concordium/concordium-dapp-examples/tree/main/DevnetSponsoredTx`.

### 3.4 Đang chạy thật (slide 15–16)

- **Agent Registry:** đăng ký agent **không cần CCD**, vì Concordium chạy sẵn một sponsor service. (khớp với W2: đăng ký mainnet qua form được sponsor)
- **XDC AI** cũng dùng sponsor cho bước đăng ký của người bán.

### 3.5 Chạy sponsor an toàn: 3 quy tắc (slide 17, [22:24–23:18])

| Quy tắc | Nội dung |
|---|---|
| **Check before signing** | Chỉ ký kèm giao dịch thanh toán do mình tạo ra hoặc đã kiểm kỹ |
| **Protect the key** | Key chỉ ở server, **không bao giờ ở front end hay trong repo**; rate-limit theo người dùng |
| **Watch the balance** | Sponsor hết CCD là mọi người dùng bị chặn cùng lúc; cần cơ chế nạp thêm |

### 3.6 Demo: chuyển tiền có sponsor, chạy local (slide 18, [23:49–27:50])

```bash
yarn run-example transactions/sponsored/ccd-transfer.ts \
  --endpoint grpc.testnet.concordium.com:20000 --secure \
  --sender-wallet-file sender.export \
  --sponsor-wallet-file sponsor.export \
  --amount 1 --recipient $RECIPIENT
```

- File `.export` lấy từ Browser Wallet: Accounts → Private key → nhập lại mật khẩu → **Export**. File này **chứa private key**. ⚠️ (repo đã chặn `*.export` trong `.gitignore`)
- Kết quả: phí của người gửi = 0; phí thật nằm ở trường `sponsor → cost` trong summary của giao dịch. CCDExplorer có **biểu tượng riêng cho giao dịch được sponsor**.
- Diễn giả dùng code agent để sửa dependency khi copy ví dụ từ SDK. [24:30–25:20]

---

## 4. Phần 3: x402 ✅ (slide 19–27, [27:50–43:00])

### 4.1 Vì sao agent cần cách trả tiền mới (slide 20)

| Cách cũ (cho người) | Cách mới (cho agent) |
|---|---|
| Đăng ký, API key, nhập thẻ | **Chính request tự trả tiền** |
| Phí thẻ khoảng €0,25 | **Phí giao dịch khoảng €0,016** |
| Thanh toán mất vài ngày | **Final trong vài giây** |

HTTP 402 *"Payment Required"* đã được dành sẵn từ 1997 nhưng gần như chưa dùng, cho tới khi có agent. (slide 19)

### 4.2 x402 trong 4 bước (slide 21)

1. Buyer: `GET /forecast`
2. Seller trả **402**: *price is 0.01 EUDemo*
3. Buyer gọi lại `GET /forecast` kèm **giao dịch thanh toán đã ký**
4. Seller trả **200: dữ liệu + biên nhận**

Luồng thật có thêm facilitator và blockchain ở phía sau. Spec: `github.com/x402-foundation/x402` (thư mục `specs/`), phần riêng của Concordium: `specs/schemes/exact/scheme_exact_concordium.md`.

### 4.3 Ba bên (slide 22–23)

| Bên | Vai trò | Package |
|---|---|---|
| **Client: buyer agent** | Tạo và ký thanh toán | `@x402/fetch` + `@x402/concordium/exact/client` |
| **Server: seller API** | Đòi thanh toán cho mỗi request | `@x402/express` + `@x402/concordium/exact/server` |
| **Facilitator: checker + sponsor** | Kiểm thanh toán, **trả phí**, gửi lên chain | `@x402/core` + `@x402/concordium/exact/facilitator` |

- Package chung `@x402/*` là phần chuẩn cho mọi chain; `@x402/concordium` là plug-in riêng của Concordium.
- ⚠️ **"There is no public Concordium facilitator yet: the seller runs its own."**
- **Một thanh toán, hai chữ ký** (slide 23): buyer ký lệnh chuyển 0,01 EUDemo (không cần CCD); facilitator ký kèm với tư cách sponsor, trả phí bằng CCD và gửi lên chain.

### 4.4 Code của từng bên (slide 24–26)

- **Seller:** `paymentMiddleware` với `scheme: 'exact'`, `network: TESTNET` (dạng CAIP-2: `ccd:` + genesis hash), `payTo`, `price: { amount: '10000', asset: 'EUDemo' }` (0,01 EUDemo). Có thể khai giá bằng USD nếu có bộ chuyển đổi.
- **Facilitator:** chạy dịch vụ riêng **giữ key của sponsor**, mở `POST /verify`, `/settle`, `GET /supported`. **Dùng account riêng cho sponsor và nạp test CCD.**
- **Buyer:** `x402Client` đăng ký `'ccd:*'` với `ExactConcordiumScheme({ accountAddress, signer })`, **`setSpendControls`** (ví dụ chỉ EUDemo, tối đa 1 EUDemo mỗi lần), rồi `wrapFetchWithPayment(fetch, client)`. *"The buyer needs the stablecoin, but no CCD."*

### 4.5 ⭐ Spend controls hiện chỉ là "soft" [~40:00–41:00]

Spend controls của client x402 là **chính sách do code của agent tự kiểm**. Nếu agent bị chiếm quyền thì giới hạn này không còn tác dụng. Concordium định đưa giới hạn chi tiêu lên chain bằng **Protocol-Level Locks**, khi đó chain sẽ tự cưỡng chế. Cho tới lúc đó: *"add soft controls now, later replace them with locks"*.

→ Đây chính là lý do lớp L2 (phiếu giao việc) và gateway của dự án phải **kiểm ở phía bên nhận** (bên B), không tin vào giới hạn mà agent tự khai.

### 4.6 Facilitator kiểm gì trước khi trả phí (slide 27)

Spec có **9 quy tắc**, gom thành 3 câu hỏi:

| | Kiểm |
|---|---|
| **WHO: đúng người** | Sender hợp lệ; sponsor ghi trong giao dịch đúng là facilitator này |
| **WHAT: đúng giá** | Đúng người nhận, đúng số tiền, đúng token, **chỉ một lệnh chuyển** |
| **WHEN: còn hạn và có chữ ký** | Chưa hết hạn; chữ ký của sender hợp lệ |

### 4.7 Tra cứu nhanh (slide 35–36)

- **Payment requirements** seller gửi kèm 402: `scheme: "exact"`, `network: "ccd:4221332d34e1694168c2a0c0b3fd0f27"`, `amount: "10000"`, `asset: "EUDemo"`, `payTo`, `maxTimeoutSeconds: 300`, `extra: { feePayer: <facilitator account> }`.
- **Lỗi facilitator hay gặp:**

| Lỗi | Cách sửa |
|---|---|
| `amount_mismatch` | Dùng đơn vị nguyên tử: 0,01 EUDemo = `"10000"` |
| `recipient_mismatch` | Trả đúng account `payTo` trong 402 |
| `sponsor_as_sender` | Buyer và sponsor phải là hai account khác nhau |
| `transaction_expired` | Tạo thanh toán ngay trước khi gửi |
| `submission_failed` | Kiểm số dư CCD của sponsor |

---

## 5. Verify & Access và Verify & Pay ✅ (slide 29, [43:00–44:30])

| Verify & Access (W1) | **Verify & Pay** |
|---|---|
| ① App xin proof (ví dụ trên 18 tuổi) | ① Seller xin **thanh toán + proof** |
| ② Ví gửi ZK proof, app kiểm rồi cho vào | ② Buyer chứng minh và trả tiền; seller kiểm cả hai rồi mới giao hàng |

*"In both, the seller learns only 'over 18'. Never the name or the birth date."* Verify & Pay cho agent dùng cùng Locks dự kiến 01/2027.

---

## 6. Roadmap ✅ (slide 28, [41:00–43:00]) ⭐

*"What comes next for agent payments. Dates can move."*

| Thời gian | Hạng mục | Nội dung | Liên quan dự án |
|---|---|---|---|
| 12/2026 | **EURQ trên mainnet** | Stablecoin euro có giấy phép MiCA | Path to production: B thu phí dịch vụ bằng EURQ |
| 01/2027 | **Protocol-Level Locks** | Tiền nằm ở bên trả cho tới khi việc xong | Thay giới hạn "soft" bằng giới hạn on-chain |
| 01/2027 | **Verify & Pay cho agent** | Chứng minh bằng ID của chủ sở hữu, trả từ một lock | Gộp L3 (proof) và thanh toán |
| 02/2027 | **Concordium Signer** | **Giữ key tách khỏi agent** | Khớp nguyên tắc "agent key không có quyền chi tiền" (W2 slide 14) |

Cả 4 mục đều **sau hackathon** → không đưa vào critical path, nhưng nên đưa vào `docs/path-to-production.md`.

---

## 7. Gợi ý ý tưởng của diễn giả ✅ (slide 30, [44:30–46:00])

| Nhãn | Ý tưởng | Liên hệ C-lite |
|---|---|---|
| PAY PER CALL | API của agent có giá x402 trên một endpoint | Mở rộng: B thu phí A theo từng thao tác |
| NO FEE PROMPTS | Sponsor giao dịch đầu tiên của người dùng | ⭐ Công ty A sponsor phí cho agent và kỹ sư |
| VERIFY & PAY | Shop có giới hạn tuổi | — |
| TRUSTED SELLERS | Chỉ trả tiền cho agent có badge | ⭐ Gateway của B kiểm badge của agent A (L1) |
| **RECEIPTS** | **Nhật ký mua hàng kiểm toán được: mã đơn trong memo** | ⭐ L4: ghi mã thao tác / hash phiếu giao việc vào memo |
| **BUDGETS** | **Agent mua hàng có giới hạn: account riêng, số dư nhỏ, spend controls, log mọi thanh toán** | ⭐ Khớp least privilege và L2 |

---

## 8. Q&A ✅ ([46:04–58:50])

| Câu hỏi | Trả lời | Hàm ý |
|---|---|---|
| Lấy USDR/EURR trên **mainnet** để thử? | Mainnet không có faucet vì là tiền thật; có thể hỏi đội, nhưng Concordium không giữ nhiều | Demo trên testnet bằng EUDemo |
| Concordium muốn làm lớp identity cho mọi chain, hay muốn agent settle trên Concordium? | **Cả hai.** Giữ agent ở chain cũ, dùng CIS-8 để gắn key và dùng lớp identity; hoặc build thẳng trên Concordium | Khớp W2 |
| Người ngoài EU có lấy được EUDemo không? | **Được.** Trên testnet tạo identity giả bằng Concordium testnet IP với một nước EU | Identity 1 của bạn (DK) đã đủ điều kiện |
| Giao dịch "dài" (ví dụ chờ tạo báo cáo AI) có vừa một giao dịch không? | Dữ liệu lớn thì **neo hash** (256 bit). Hạn của giao dịch mặc định 5 phút, có thể đặt dài hơn nếu backend xử lý lâu | Áp dụng cho L4: neo hash log, không neo log |
| SDK cho ngôn ngữ nào? | Hỗ trợ tốt nhất: **JS/TS (Web SDK) và Rust**. Go và Python do cộng đồng, ít được duy trì | Chọn TypeScript cho dự án |
| Concordium có chạy facilitator công khai không? | Chưa chắc; hoan nghênh cộng đồng tự chạy. Facilitator công khai phải có tiền và dễ bị rút cạn, nên Concordium chỉ chạy sponsor riêng cho Agent Registry | Tự chạy facilitator nếu dùng x402 |
| Giám khảo có đánh giá cao triển khai mainnet hơn testnet? | Diễn giả **không phải giám khảo**, không trả lời được | Bám tiêu chí chính thức |
| **Global FinReg: đợi xác minh 24 giờ, email báo thiếu proof** | Có thể bạn đang ở **mainnet** (KYB thật). **Trên testnet, Global FinReg đáng ra nhanh như tạo identity thường.** Mainnet thì chậm vì có người kiểm giấy tờ thật | ⚠️ Bạn đang ở testnet mà vẫn gặp màn KYB đòi Sign In. Chờ **W5 (16/11)** hoặc hỏi Discord |
| Xin slide? | Giles sẽ hỏi Concordium để đăng slide | Đã có bản cắt từ video trong `Workshop03/slides/` |

**Buổi kế tiếp:** Workshop 4, **thứ Tư 11/11, 15:00 UTC (22:00 giờ VN)**: *Keep your agent inside the rails, and inside the law* (Protocol-Level Locks, EU AI Act Điều 12). (slide 31)

---

## 9. Bộ công cụ testnet ✅ (slide 32–34)

| Thứ | Cách lấy |
|---|---|
| Ví + identity test | Wallet for Web trên testnet, IDP "Concordium testnet IP" |
| Test CCD | Ví: Activity → Request CCD (20.000 CCD) |
| Stablecoin test | 100 EUDemo tại `allowlist.testnet.concordium.com` (cần quốc tịch EU trên identity test) |
| Token riêng | Form xin phát hành PLT; **duyệt thủ công, xin sớm** |
| Testnet network id | `ccd:4221332d34e1694168c2a0c0b3fd0f27` |

**Developer Toolkit (slide 33):** `@x402/concordium` · spec x402 trên Concordium (9 quy tắc của facilitator) · PLT với Web SDK · Set up a sponsor service · ví dụ sponsored transactions (Node SDK) · `DevnetSponsoredTx` dApp · **`docs.concordium.com/llms.txt`**: toàn bộ docs trong một file, để đưa cho coding agent.

---

## 10. Tác động đến dự án (Hướng C-lite) ⭐

| Lớp | Workshop 3 bổ sung gì | Việc cần làm |
|---|---|---|
| **L1** danh tính agent | Đăng ký Agent Registry trên testnet được sponsor (không cần CCD) | Không đổi |
| **L2** phiếu giao việc | Spend controls của x402 chỉ là "soft" → giới hạn phải được **bên nhận (gateway của B)** kiểm; Locks (01/2027) là đường nâng cấp | Ghi Locks vào path to production |
| **L3** người duyệt | Verify & Pay = proof + thanh toán trong cùng luồng | Theo dõi Verify & Pay cho agent (01/2027) |
| **L4** audit | **Memo** trên giao dịch chứa mã đơn hoặc hash, tra được trên CCDExplorer; dữ liệu lớn thì **neo hash** | Thiết kế L4: ghi hash phiếu giao việc + mã thao tác vào memo |
| **Phí** | Sponsored transactions ở tầng protocol cho mọi loại giao dịch | Công ty A chạy sponsor cho agent và kỹ sư, theo 3 quy tắc an toàn (mục 3.5) |
| **Mở rộng** | x402 với 3 bên, tự chạy facilitator | Tùy chọn: B thu phí A theo thao tác bằng EUDemo |
| **Path to production** | EURQ (12/2026), Locks và Verify & Pay (01/2027), Concordium Signer (02/2027) | Đưa vào `docs/path-to-production.md` |

### Câu hỏi nên mang tới W4 (11/11) và office hours

1. Protocol-Level Locks có bản testnet hoặc devnet trước 09/12 không?
2. Memo của giao dịch dài tối đa bao nhiêu byte? Có cách nào neo một hash mà không cần chuyển token không?
3. Global FinReg trên testnet: tại sao vẫn đòi Sign In / KYB? (Hoặc chờ W5, 16/11.)
4. Sponsor service có chạy được cho các giao dịch CIS-8004 / CIS-8 mà agent tự gửi không?

---

## Nguồn

- Video replay Workshop 3 trên trang programme của Encode: `encodeclub.com/programmes/concordium-trusted-agents-hackathon/events/workshop-3-pay-and-get-paid`
- 36 slide và màn hình demo cắt từ video: `Workshop03/slides/`
- Transcript: `Workshop03/` (xem `Tailieu/README.md`)
- Tài liệu đính kèm của buổi: PLT tutorial · PLT with the Web SDK · Request PLT issuance (testnet) · x402 integration on Concordium · Concordium joins the x402 Foundation · x402 repository (GitHub) · Sponsored transactions concept và tutorial · Set up a sponsor service · Agent-to-agent settlement
