# CONCORDIUM TRUSTED AGENTS HACKATHON
## Báo cáo Workshop #4: *Keep your agent inside the rails, and inside the law*

**Ngày:** Thứ Tư 11/11/2026, 15:00 UTC (22:00 giờ VN), dài 58 phút
**Diễn giả:** Doris Benda (Blockchain Security Engineer @ ChainSecurity, trước đây là kỹ sư của Concordium); Giles Mallinson (Encode) dẫn chương trình
**Nguồn:** 54 ảnh trong `Workshop04/slides/` (`01–30` bộ slide chính có xen màn hình demo, `31–54` bộ slide phụ về các lỗi trong đợt audit), transcript `Workshop04/Workshop-04-transcript-EN.txt` (Whisper).
**Ký hiệu:** ✅ chính thức (slide hoặc lời diễn giả) · ⚠️ rủi ro hoặc cần hỏi lại · ⭐ áp dụng trực tiếp cho dự án (C-lite)
Mốc `[mm:ss]` là thời điểm trong video. Tên slide là tên file trong `Workshop04/slides/` (số trang in trên slide có thể khác).

---

## 0. TL;DR: 8 điều quan trọng nhất

1. **Hôm nay, giới hạn chi tiêu cứng duy nhất của agent là số dư trong account của nó.** Spend controls của x402 mất tác dụng khi agent hoặc key bị chiếm; allow/deny list bảo vệ token chứ không bảo vệ ngân sách của bạn; sponsor từ chối ký chỉ là chính sách off-chain. ✅ (slide 04)
2. **Protocol-Level Locks:** *"Spend limits the chain enforces."* **Simple Locks dự kiến 01/2027, Enhanced Locks 03/2027.** Hiện **chỉ có trên devnet** (protocol 11), **chưa có trên testnet**, thiết kế còn có thể đổi. ✅ (slide 05–06, [05:47–06:37])
3. **Simple Lock:** tiền **nằm yên trong account của chủ**, chỉ gửi được cho người nhận đã liệt kê, chỉ trong hạn, chỉ tới số đã khóa. Năm thao tác (create, fund, send, release, cancel), mỗi thao tác cần đúng *grant*. **Không sửa được sau khi tạo.** Hết hạn thì ai cũng cancel được, tiền về chủ. ✅ (slide 07–10)
4. **Chuẩn bị cho Locks ngay từ bây giờ:** cho agent một account riêng số dư nhỏ · dùng spend controls của x402 · chỉ trả cho danh sách đối tác cấu hình sẵn (sau này thành `recipients` của lock). ✅ (slide 13)
5. **EU AI Act Điều 12:** chỉ áp dụng cho **hệ thống AI rủi ro cao**, từ **2/12/2027** (2/8/2028 với AI trong sản phẩm theo luật an toàn EU), lưu log **ít nhất 6 tháng**. *"Most agents are not high-risk. Logging is still good practice."* ✅ (slide 15)
6. **Log off-chain, chỉ neo hash lên chain, hash kèm nonce ngẫu nhiên.** Muốn xóa theo GDPR thì xóa log và nonce: hash trên chain còn đó nhưng không còn liên kết được với gì. ✅ (slide 17–18)
7. ⭐ **Register Data là loại giao dịch được khuyến nghị cho audit trail** (*"created exactly for this kind of use case… very cheap"*). VRA và VAA của Verify & Access cũng chính là Register Data, nội dung mã hóa CBOR dạng `{hash, type, version}`. ✅ (slide 23–24, Q&A [52:55–53:21])
8. **Đợt audit CertiK (12/2025 – 05/2026):** 13 phát hiện, 2 nghiêm trọng (làm chain dừng), **không phát hiện nào lấy được tiền**; đã sửa hết trừ một số được "acknowledged". Bài học: **giới hạn kích thước dữ liệu không tin cậy** và **đừng để log thành công cụ DoS**. ✅ (slide 25–29, 31–54)

**Cập nhật giải thưởng** [57:24–57:52]: sẽ có **CCD thưởng cho top 3**, và **quyền xét grant có lẽ dành cho hạng nhất**. Giles nói sẽ xác nhận trên Discord và trong bản tin tuần. ⚠️ Chưa chính thức.

---

## 1. Hôm nay cái gì giới hạn agent? ✅ (slide 04, [02:53–05:44])

| Cơ chế | Ai kiểm soát | Giới hạn thật sự |
|---|---|---|
| Account riêng của agent, số dư nhỏ | Bạn, chain cưỡng chế | Không tiêu quá số đang có |
| Spend controls của x402 | Code của chính agent | **Mất tác dụng nếu agent hoặc key bị chiếm** |
| Allow/deny list, pause của token | Bên phát hành token | Bảo vệ token, **không bảo vệ ngân sách của bạn** |
| Sponsor từ chối ký kèm | Server của sponsor | Chính sách off-chain |

*"Today the only hard limit is the balance of the agent's account."*

---

## 2. Protocol-Level Locks ✅ (slide 05–13, [05:47–17:26])

### 2.1 Lộ trình

| | Simple Locks | Enhanced Locks |
|---|---|---|
| Dự kiến | **01/2027** | **03/2027** |
| Luật | **Cố định**: ai được nhận, token nào, đến khi nào, khóa bao nhiêu | **Tự viết**: một smart contract trả lời có/không cho từng thao tác: hạn mức, hạn mức theo ngày, điều kiện thời gian |
| Tiền nằm ở | Account của chủ | Account của chủ |
| Hiện có ở | **Devnet** (protocol 11) | Chưa |

*"The design is still subject to change."* ⚠️

### 2.2 Một lock gồm gì (slide 08, theo code devnet hiện tại)

| Trường | Nghĩa |
|---|---|
| `recipients` | Các account được nhận tiền từ lock, hoặc "any" |
| `tokens` | Các PLT được khóa. **Không dùng cho token smart contract CIS-2** |
| `expiry` | Sau thời điểm này: không gửi được nữa, ai cũng cancel được |
| `grants` | Account nào được fund, send, release, cancel |
| `keep_alive` | Giữ lock sau khi hết tiền. Mặc định: không |
| `memo` | Ghi chú tùy chọn |
| `metadata` | Dữ liệu tùy chọn cho ứng dụng |

### 2.3 Năm thao tác (slide 09)

| Thao tác | Ai được làm | Tác dụng |
|---|---|---|
| `create` | Bất kỳ ai | Đặt recipients, tokens, expiry, grants |
| `fund` | Có fund grant | Khóa token **của chính người fund** |
| `send` | Có send grant | Gửi cho một recipient đã liệt kê |
| `release` | Có release grant | Giải phóng một phần hoặc toàn bộ token của một người fund |
| `cancel` | Có cancel grant, **hoặc bất kỳ ai sau khi hết hạn** | Giải phóng toàn bộ, xóa lock |

*"After expiry, fund, send and release are rejected. Only cancel works, and anyone can run it."* Nhờ vậy tiền không bao giờ bị kẹt vĩnh viễn [12:02–12:08].

### 2.4 Ba quy tắc thêm (slide 10)

1. **Send là một lần chuyển token:** pause, allow list, deny list vẫn được kiểm cho người gửi và người nhận.
2. **Không sửa được:** recipients, expiry, grants cố định từ lúc tạo. Muốn đổi thì release hoặc cancel rồi tạo lock mới.
3. **Đã khóa là khóa:** chính chủ cũng không tiêu được phần đã khóa cho tới khi release hoặc cancel.

### 2.5 So với `approve()` của ERC-20 (slide 11)

| | ERC-20 `approve()` | Simple Lock |
|---|---|---|
| Token nằm ở | Account của chủ | Account của chủ |
| Ai nhận được | Bất kỳ địa chỉ nào | Chỉ recipients đã liệt kê (hoặc "any") |
| Đến khi nào | Không hạn, tới khi `approve(0)` | Có hạn, đặt lúc tạo |
| Có được dành riêng không | Không: chủ vẫn tiêu trước được | **Có**: không nằm trong số dư khả dụng |
| Ai làm gì | Mỗi spender: chỉ chuyển, tới hạn mức | Mỗi account có grant: fund, send, release, cancel |
| Ai cưỡng chế | Code của từng token | **Protocol, giống nhau cho mọi PLT** |

### 2.6 Vòng đời lock cho agent (slide 12)

`create` (chủ) → `fund` (chủ, ví dụ 100 EUDemo) → `send` (**agent**, gửi nhiều lần tới khi hết 100) → `release` (chủ, lấy lại phần thừa).

*"If the agent is compromised: at most 100 EUDemo, only to Seller B, only until 31 January 2027."*

### 2.7 Chuẩn bị ngay bây giờ (slide 13, [16:30–17:26])

| Việc | Sau này thay bằng |
|---|---|
| Cho agent account riêng, số dư nhỏ, key riêng; tiền của chủ để chỗ khác | Lock do chủ fund |
| Spend controls của x402: token được phép, trần mỗi lần trả | Số tiền khóa và grant |
| Danh sách đối tác được trả lưu trong cấu hình | `recipients` của lock |

---

## 3. Log và EU AI Act ✅ (slide 14–18, [17:26–21:49])

*"Locks prevent, logs prove."* Lock ngăn agent tiêu sai; log chứng minh agent đã làm gì.

### 3.1 Điều 12 (slide 15)

| | |
|---|---|
| Nội dung | *"High-risk AI systems shall technically allow for the automatic recording of events (logs) over the lifetime of the system."* |
| Áp dụng cho | **Chỉ hệ thống rủi ro cao**, ví dụ tuyển dụng, chấm điểm tín dụng, **hạ tầng trọng yếu** |
| Từ khi nào | **2/12/2027**; 2/8/2028 với AI trong sản phẩm theo luật an toàn EU (máy móc, thiết bị y tế) |
| Giữ bao lâu | **Ít nhất 6 tháng**; provider và deployer giữ log |
| Nhận định | *"Most agents are not high-risk. Logging is still good practice, and cheap to add now."* |

Nguồn trên slide: văn bản AI Act (CELEX 32024R1689, Điều 12, 19, 26) và **Regulation 2026/1744** cho các mốc ngày (CELEX 32026R1744). Diễn giả nhấn mạnh đây không phải tư vấn pháp lý.

### 3.2 Nên log gì cho mỗi hành động của agent (slide 16)

| Trường log | Mục đích theo Điều 12(2) |
|---|---|
| Khi nào, agent nào, phiên bản model nào | 12(2)(a): phát hiện rủi ro và thay đổi đáng kể |
| Nhiệm vụ, và ai giao | 12(2)(c): giám sát của deployer |
| Công cụ đã gọi và quyết định đã đưa ra | 12(2)(a): phát hiện rủi ro |
| Thanh toán: lock, số tiền, người nhận, mã giao dịch | 12(2)(b): giám sát sau khi đưa ra thị trường; 12(2)(c) |
| Lỗi, từ chối, can thiệp của con người | 12(2)(a); 12(2)(b) |

### 3.3 Dữ liệu cá nhân ở ngoài chain (slide 17–18)

| Off-chain | On-chain |
|---|---|
| Bản log: prompt, đầu vào, kết quả, người liên quan, **cộng một nonce ngẫu nhiên**. Bạn kiểm soát quyền truy cập và việc xóa | **Chỉ hash**, tính kèm nonce để không ai đoán được log bằng cách thử. Chứng minh log không bị sửa sau khi ghi |

**Xóa vẫn làm được:** khi hết thời hạn lưu, xóa log và nonce; hash trên chain không xóa được nhưng *"can't be linked to anything or checked again"*. Chỉ đúng khi nonce thật sự ngẫu nhiên và không bao giờ bị lộ. Nguồn: EDPB Guidelines 02/2025 về blockchain (tr. 12), GDPR Điều 17.

---

## 4. Demo neo log bằng Register Data ✅ (slide 19–24, [21:49–28:58])

- **Demo 1 (CLI, Rust SDK):** neo hash 32 byte của một log lên testnet bằng ví dụ `v2_register_data.rs` của `concordium-rust-sdk`:
  ```bash
  cargo run -- --node https://grpc.testnet.concordium.com:20000 --account ./agent.export --data ./agent-log.hash
  ```
  Diễn giả copy ví dụ rồi nhờ coding agent dựng khung project quanh nó. File `agent.export` chứa private key xuất từ Browser Wallet ⚠️.
- **Demo 2 (trang web):** "Concordium RegisterData Simple Application" (trang demo trên github.io): kết nối ví, nhập dữ liệu, trang băm SHA-256 rồi ghi hash lên chain; có nút đọc lại dữ liệu theo mã giao dịch. CCDExplorer cần vài giây mới hiện giao dịch.
- **Verify & Access đã dùng chính cơ chế này** (slide 23–24):

| Anchor | Lúc nào | Nội dung |
|---|---|---|
| **CCDVRA** (Verification Request Anchor) | Trước khi tạo proof | Hash của yêu cầu proof: đã hỏi gì, lúc nào. Ví kiểm anchor này còn mới |
| **CCDVAA** (Verification Audit Anchor) | Sau khi kiểm proof | Hash của bản ghi xác minh: đã chạy, kết quả không bị sửa |

Cả hai là Register Data, nội dung mã hóa **CBOR** dạng `{"hash": "…", "type": "CCDVRA" | "CCDVAA", "version": 1}`. Ví dụ trên testnet cách nhau 8 giây. Diễn giả nói hai anchor *"very likely belong together"* vì **cùng người gửi và gần thời điểm**: chain không tự liên kết chúng với nhau.

---

## 5. Đợt audit bảo mật của chain ✅ (slide 25–29, 31–54, [29:17–49:30])

- **CertiK, grey box**, 12/2025 – 05/2026, trên một bản sao của mạng (không tấn công mạng thật). Phạm vi: node, consensus, networking. Kịch bản: tràn giao dịch, thông điệp hỏng, chia mạng, contract độc hại. Có giới hạn thời gian, theo kịch bản, không đảm bảo 100%.
- Báo cáo PDF có trên trang security của Concordium. Một đợt audit khác về **ví và IDP** sẽ công bố sau khi sửa xong.

| Mức | Số lượng | Trạng thái |
|---|---|---|
| Critical | 2 | Đã sửa. Từ chối dịch vụ |
| High | 3 | 2 đã sửa, 1 acknowledged |
| Medium | 2 | Đã sửa. Kiểm soát truy cập |
| Low | 2 | Acknowledged |
| Informational | 4 | Đã sửa |

*"The serious ones could stall the chain. None could take funds."* "Acknowledged" là quyết định có chủ ý không sửa, không phải đã sửa.

**Bài học từ các phát hiện (slide phụ 31–54):**

| Phát hiện | Bài học | Áp dụng cho gateway của dự án |
|---|---|---|
| Hàng đợi P2P và backpressure | Tách hàng đợi, có cơ chế chống tràn | Giới hạn tần suất, hàng đợi có giới hạn |
| Block đầu (genesis) không có block cha | Luôn test hai đầu của chain | Test với dữ liệu biên: block đầu, block chưa finalized |
| Một dòng log lặp lại theo mỗi peer lỗi | Log có thể thành công cụ DoS; gộp lỗi lặp lại thay vì log từng cái | **Không log nguyên dữ liệu do kẻ tấn công gửi; gộp các lần từ chối** |
| Trường độ dài do kẻ tấn công khai | **Không cấp phát bộ nhớ theo con số không tin cậy**; đặt trần và đọc dần tới trần | **Giới hạn kích thước request, presentation, JSON, CBOR trước khi phân tích** |

---

## 6. Q&A ✅ ([49:37–55:51])

| Câu hỏi | Trả lời | Hàm ý |
|---|---|---|
| Có blacklist/whitelist peer không? | Không; có soft ban và hard ban với peer cư xử xấu. Khó phân biệt peer độc hại với peer chỉ chậm | — |
| Locks ngăn agent tiêu quá thế nào? Vượt hạn mức thì sao? | Đặt hạn mức thấp (ví dụ 10 EUDemo). Tới hạn mức thì chain **không cho** agent lấy thêm. Có thể giữ ví chính nhiều tiền và cấp lock nhỏ cho từng agent | Locks là cưỡng chế on-chain, nhưng **chỉ cho thanh toán PLT** |
| Audit trail giúp tuân thủ EU AI Act thế nào, ghi gì? | Ghi gì là do bạn chọn. **Khuyến nghị dùng Register Data**, *"created exactly for this kind of use case… very cheap"* | ⭐ Xác nhận lựa chọn L4 của dự án |
| Không giỏi blockchain có build được không? | Với hackathon thì được: Claude và các coding agent đủ tốt, code của Concordium mở trên GitHub. Lên production thì nên hiểu blockchain và có kỹ sư | — |

**Buổi kế tiếp:** Workshop 5, **thứ Hai 16/11, 22:00 giờ VN**: *Ship to production: adopting blockchain without crypto*. Workshop 6 vào thứ Tư 18/11, sau đó là tuần build.

---

## 7. Tác động đến dự án (C-lite)

| Mục trong `Tong-hop-sau-W3-v3.md` | W4 cho biết | Thay đổi |
|---|---|---|
| L4: neo bằng gì | Register Data được khuyến nghị; mẫu CBOR `{hash, type, version}` như VRA/VAA | Chốt Register Data; dùng type riêng cho anchor của dự án |
| L4: nội dung log | Bảng trường log theo Điều 12(2) | Bổ sung phiên bản model, nhiệm vụ và người giao, lỗi và từ chối |
| L4: dữ liệu cá nhân | Log off-chain, hash kèm nonce, xóa log và nonce khi hết hạn lưu | Tách phần dữ liệu cá nhân khỏi bản ghi trong chuỗi hash |
| Locks | Chỉ devnet; testnet/mainnet 01/2027 (Simple), 03/2027 (Enhanced) | Không dùng trong demo; thiết kế "sẵn sàng cho lock"; đưa vào path to production |
| Path to production | Hầu hết agent không phải rủi ro cao; hạ tầng trọng yếu là ví dụ rủi ro cao | Nói đúng phạm vi: agent DevOps chỉ có thể thuộc nhóm rủi ro cao khi B vận hành hạ tầng trọng yếu |
| Hardening gateway | Bài học từ đợt audit | Giới hạn kích thước đầu vào; không để log thành DoS |
| G1.x, G2, Global FinReg, agent nền | Không được nhắc tới | Vẫn mở |

Chi tiết cập nhật nằm trong `Tong-hop-sau-W4.md`.

---

## Nguồn

- Slide `Workshop04/slides/` và transcript `Workshop04/Workshop-04-transcript-EN.txt`
- Link trên slide: code Simple Locks trong `concordium-base` và `concordium-node` (nhánh `release/p11`) · ví dụ `concordium-rust-sdk/examples/v2_register_data.rs` · tutorial Verify & Access · `concordium-base/.../web3id/v1/anchor.rs` · AI Act (CELEX 32024R1689) · Regulation 2026/1744 · EDPB Guidelines 02/2025 · GDPR Điều 17
