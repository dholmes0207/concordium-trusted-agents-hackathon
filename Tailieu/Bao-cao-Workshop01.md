# CONCORDIUM TRUSTED AGENTS HACKATHON
## Báo cáo tổng hợp các cập nhật sau Workshop #1

**Workshop:** Verify Once. Prove Everywhere. Reveal Nothing.
**Ngày tổ chức:** 02/11/2026
**Diễn giả:** Giles Mallinson (Encode) phần thể lệ; Peter, CTO của Concordium, phần kỹ thuật
**Nguồn phân tích:** Video workshop (53 phút), bản transcript tiếng Anh (`Workshop01/Workshop-01-transcript-EN.txt`) và 30 slide trích từ video (`Workshop01/slides/`)
**Ngày tổng hợp:** 03/11/2026 (đã hiệu đính lại theo slide)

> **Ghi chú hiệu đính.** So với bản nháp đầu, bản này đã:
> (1) chốt giờ deadline, timeline và lịch workshop theo slide của Encode (slide 03, 04, 05, 07);
> (2) bổ sung yêu cầu nộp bài chi tiết, giải thưởng, quy định thi solo và tiêu chí chấm chính thức;
> (3) tách lại timestamp của mục "dùng codebase có sẵn";
> (4) sửa tên đối tác thành Veriox, thêm lưu ý về Ofcom và Protocol-Level Locks;
> (5) bổ sung góp ý chiến lược ở mục X.
> Nội dung lấy **ngoài workshop** được đánh dấu *(nguồn ngoài)*.

---

# I. TỔNG QUAN: CHÚNG TA BIẾT THÊM ĐƯỢC NHỮNG GÌ?

Sau khi đối chiếu video, transcript và slide, mình nhận thấy Workshop #1 đã cung cấp nhiều thông tin quan trọng hơn so với phần mô tả chương trình ban đầu.

Đặc biệt, workshop không chỉ giới thiệu công nghệ mà còn **làm rõ cách Concordium muốn developer xây dựng dự án, những khả năng đã có thể thử nghiệm, và những hướng phát triển của Trusted AI Agents**.

Mình chia các cập nhật thành 5 nhóm:

| Nhóm | Nội dung mới được làm rõ | Mức độ quan trọng |
|---|---|---|
| 1. Hackathon | Quy định về codebase, đội, lịch trình, submission, giải thưởng và cách tích hợp Concordium | Rất cao |
| 2. Công nghệ Concordium | Identity, ZKP, Privacy Guardians, Verify & Access | Rất cao |
| 3. Agent Infrastructure | Agent Identity, Agent Registry, domain verification và consent | Rất cao |
| 4. Developer Experience | SDK, ví, Test IDP, testnet, Local Stack và demo thực tế | Cao |
| 5. Q&A và roadmap | Enterprise IDP, xác minh Agent giữa các tổ chức, Identity 2.0 | Rất cao |

Một thông điệp nổi bật từ workshop là:

**Concordium muốn các developer sử dụng những khả năng về danh tính, xác minh và trách nhiệm giải trình để bổ sung giá trị cho ứng dụng đang xây dựng.**

Cần phân biệt ba mức độ xác nhận, được dùng xuyên suốt báo cáo:

- **Đã được trình diễn:** Có demo cụ thể trong workshop.
- **Được ban tổ chức/CTO công bố hoặc xác nhận:** Có trên slide hoặc được nói rõ, nhưng chưa chắc đã được demo.
- **Đang nghiên cứu hoặc sẽ giới thiệu:** Chưa đủ căn cứ để coi là tính năng sẵn sàng cho hackathon.

---

# II. UPDATE VỀ HACKATHON: THỂ LỆ, TIMELINE VÀ ĐỊNH HƯỚNG

## 1. Cấu trúc 6 tuần của hackathon

**Timestamp: 00:00–02:40 · Slide 03, 04, 05**

### Timeline chính thức (slide 03 "How the six weeks run")

| Giai đoạn | Thời gian (UTC) | Giờ Việt Nam | Nội dung |
|---|---|---|---|
| Weeks 1–3 | 02–18/11, thứ Hai & thứ Tư 15:00 | 22:00 | Sáu workshop trực tiếp với đội Concordium, đều được ghi hình |
| Weeks 4–6 | Từ thứ Năm 19/11 | | Tích hợp Concordium vào dự án. Office hours thứ Ba & thứ Sáu 15:00 UTC |
| **Checkpoint 1** | **CN 22/11, 23:59** | **06:59 sáng T2 23/11** | Tạo project, thêm team, chia sẻ ý tưởng |
| **Final Submission** | **T4 09/12, 23:59** | **06:59 sáng T5 10/12** | Nộp từ trang project. Nền tảng khóa cứng tại deadline |
| Judging | 10–11/12 | | Encode và Concordium xem **từng demo**, công bố winners sau đó |

**Về hai điểm mâu thuẫn trong lời nói:**
- Tại [00:27] Giles nói "from now, the 2nd of November until the 8th of November". Slide ghi rõ **Weeks 1–3: 2–18 Nov**, nên "8th" là nói nhầm.
- Tại [01:12–01:15] Giles nói "9th of December … submissions always close at midnight on a Sunday". Slide 03, 05 và 07 đều ghi **Wed 9 Dec, 23:59 UTC**, nên lấy slide làm căn cứ.

### Lịch 6 workshop (slide 04 "The workshop series")

| Workshop | Ngày (22:00 giờ VN) | Chủ đề | Nội dung |
|---|---|---|---|
| W1 | T2 02/11 | Verify Once. Prove Everywhere. Reveal Nothing | Concordium ID, age check không cần dữ liệu cá nhân |
| W2 | T4 04/11 | Prove a verified human stands behind your agent | Agent Registry + Verified by Concordium badge, cross-chain |
| W3 | T2 09/11 | Let your agent pay and get paid | x402, Protocol-Level Tokens, sponsored transactions |
| W4 | T4 11/11 | Keep your agent inside the rails, and inside the law | Protocol-Level Locks, EU AI Act audit trails |
| W5 | T2 16/11 | Ship to production | Adopting blockchain without crypto |
| W6 | T4 18/11 | Plug into the agent stack you already use | MCP, A2A và framework của bạn |

### Checkpoint 1 dùng để làm gì?

Theo slide 05: *"It doesn't need to be finished. It tells us and Concordium what you're building so we can support you during the build weeks."* Đây không phải vòng loại mà là bước đăng ký ý tưởng để được hỗ trợ.

---

## 2. UPDATE QUAN TRỌNG: Được phép sử dụng dự án và codebase có sẵn

**Timestamp: 50:51–51:22 (Q&A về codebase); 06:13–06:59 (kiến trúc hybrid)**

Đây là một trong những thông tin quan trọng nhất đối với chiến lược hackathon.

Trong Q&A [50:51], người tham dự hỏi liệu có thể sử dụng codebase được phát triển trước ngày 19/11 hay không. CTO trả lời:

> *"the whole point of this hackathon, to be honest, is to bring your current project and add the functionality that you need from Concordium into it … has basically helped it become better or do something that it couldn't do before."*

Slide 07 cũng ghi trong khung Requirements: *"Concordium is integrated into your existing project"*.

**Như vậy, chủ đích của cuộc thi không phải bắt buộc xây dựng mọi thứ từ con số không.**

Ở một đoạn khác [06:13–06:59], CTO nói ứng dụng *"doesn't have to be on the Concordium chain … your application could be wherever it is and then you integrate the Concordium ecosystem"*, tức là kiến trúc hybrid được chấp nhận.

Đối với dự án của chúng ta, điều này có nghĩa:

| Thành phần | Cách tiếp cận phù hợp |
|---|---|
| AI Agents | Có thể sử dụng framework hiện có |
| Multi-Agent Orchestration | Không nhất thiết phải xây dựng từ đầu |
| Frontend | Có thể dùng React, Next.js hoặc công nghệ quen thuộc |
| Backend | Có thể sử dụng Node.js, Python hoặc stack phù hợp |
| Database | Có thể sử dụng cơ sở dữ liệu ngoài blockchain |
| Identity và Verification | Tích hợp khả năng của Concordium |
| Agent Registry | Nghiên cứu và tích hợp thành phần Concordium tương ứng |
| Accountability | Sử dụng cơ chế xác minh và audit phù hợp |

Điều chúng ta cần chứng minh là **Concordium giúp ứng dụng tốt hơn hoặc làm được điều mà trước đây ứng dụng chưa làm được**.

### Tác động tới hướng Multi-Agent

Trước workshop, chúng ta có thể đặt câu hỏi: *Có cần xây dựng một hệ thống Multi-Agent chạy hoàn toàn trên blockchain không?*

Sau workshop, câu trả lời rõ ràng hơn: **Không cần.**

Chúng ta có thể phát triển một hệ thống Multi-Agent off-chain và chỉ dùng Concordium ở những nơi cần bằng chứng danh tính, liên kết Agent, xác minh, sự chấp thuận hoặc kiểm toán. Đây là lựa chọn kiến trúc giúp giảm đáng kể phạm vi phát triển.

---

## 3. Yêu cầu submission

**Timestamp: 02:56–03:23 · Slide 07 "What to submit"**

| Thành phần | Nội dung (theo slide 07) |
|---|---|
| Description | Đã build gì, hoạt động thế nào và **dùng những thành phần Concordium nào** |
| Public code repository | Repo công khai (GitHub được) |
| Demo video | **Tối đa 3 phút**, cho thấy **luồng chính chạy thật** |
| CCDExplorer link | Agent, contract hoặc giao dịch của bạn **trên Concordium testnet** |
| Path to production | Cần những gì để lên mainnet, đến tay người dùng thật |
| Optional | Slide và link live demo |

**Requirements** (khung bên phải slide 07):
- Concordium được **tích hợp vào project hiện có**, **demo được trên testnet**. Test CCD lấy miễn phí từ faucet.
- Các workshop sẽ chỉ rõ "tích hợp mạnh" trông như thế nào.
- **Mọi link phải public.** Repo đang để private phải chuyển sang public trước khi nộp.

Giles có nói các yêu cầu này *"subject to change"* [02:58], nên cần theo dõi email và trang programme đến tuần nộp bài (hướng dẫn nộp bài chính thức vào thứ Ba 08/12).

Điểm mình chú ý nhất là **Path to Production**. Ban tổ chức muốn người tham gia suy nghĩ xa hơn một bản demo kỹ thuật: *Ai sẽ sử dụng nó, tại sao họ cần nó và sản phẩm có thể vận hành thực tế như thế nào?*

### Hệ quả

Ngay từ giai đoạn chọn ý tưởng phải có:

**Problem → Solution → Concordium Integration → Working Demo (testnet) → Production Path**

---

## 4. Đội thi, giải thưởng và tiêu chí chấm

### Đội thi

**Timestamp: 02:11–02:33**

- Thi **một mình hoặc theo đội**. Giles: *"we have teams that have up to three or four [members], but if you're building on your own, that's fine. Particularly if you're learning."*
- Đội trưởng tạo project trên trang programme và có **mã mời** để chia sẻ cho đồng đội.
- Kết nối Discord trên trang programme để hỏi đáp.

### Giải thưởng

**Timestamp: 03:24–03:33 · Slide 08 "Keep building after the hackathon"**

| Giải | Nội dung |
|---|---|
| Grant | *"Winners can get a grant from Concordium's 75M CCD Grants Program to turn their project into a live product."* |
| Merch | *"+ Concordium merch"* |

Lưu ý:
- **Không có giải tiền mặt** và **chưa công bố cơ cấu giải**: số đội thắng, hạng nhất/nhì/ba, giải theo track, mức grant cho mỗi đội.
- 75M CCD là **tổng quỹ grant chung** của Concordium, không phải prize pool của hackathon. Thắng cho cơ hội được xét grant (*"can get"*), không phải số tiền cố định.
- Vì phần thưởng là grant để đưa sản phẩm lên production, `docs/path-to-production.md` cũng chính là bản nháp hồ sơ xin grant.
- *(Transcript Whisper ghi nhầm thành "75 CCD"; slide ghi đúng 75M.)*

### Tiêu chí chấm *(nguồn ngoài: thông báo chính thức của Concordium ngày 02/11, không có trong workshop)*

> "Projects will be judged on **integration depth** and a **credible path to production**, not simply transaction counts or the strength of a pitch."

Hệ quả: không cày số giao dịch, không dựa vào pitch đẹp. Cần tích hợp sâu (nhiều primitive, dùng đúng chỗ, chạy thật trên testnet) cộng với câu chuyện production đáng tin.

---

# III. UPDATE VỀ CÔNG NGHỆ: CONCORDIUM THỰC SỰ CUNG CẤP NHỮNG GÌ?

## 5. Concordium được định hướng là một lớp Identity và Accountability

**Timestamp: 06:13–10:24**

CTO giới thiệu Concordium là một blockchain Layer 1 công khai, permissionless, với Identity được tích hợp ở cấp protocol. Developer có thể xây dựng ứng dụng ở bất kỳ đâu và chọn các công cụ xác minh hoặc Agent Toolkit từ hệ sinh thái Concordium.

| Công nghệ | Thông tin từ workshop | Ý nghĩa |
|---|---|---|
| Blockchain | Public, permissionless Layer 1; thành lập 2018, mainnet 2021 | Có thể triển khai và xác minh công khai |
| Identity | Tích hợp ở cấp protocol | Tài khoản được tạo dựa trên danh tính đã xác minh |
| Finality | Khoảng 2–4 giây; không fork, nếu sự cố thì chain tạm dừng | Phù hợp với luồng xác minh tương tác, không lo rollback |
| Fees | Neo theo Eurocent, không phụ thuộc giá CCD | Giúp lập kế hoạch chi phí |
| Native Tokens | Protocol-Level Tokens ra mắt năm 2025, không nằm trong smart contract | Hỗ trợ stablecoin và thanh toán |
| Protocol-Level Locks | Được nhắc ở [07:29], sẽ dạy ở W4 | Xem lưu ý bên dưới |
| Smart Contracts | Rust → Wasm | Có thể viết logic tùy chỉnh |
| ZKP | Tạo bằng chứng từ thuộc tính danh tính | Hạn chế việc tiết lộ dữ liệu |
| Agent Toolkits | Hướng tích hợp dành cho Agent | Hỗ trợ xây dựng Trusted Agents |

**Về phí:** CTO nói *"a transaction is a Eurocent"* ở mức tổng quan. Không nên hiểu mọi thao tác hoặc smart contract đều có cùng một mức phí; chi phí thực tế vẫn cần đo theo loại giao dịch.

**Về Protocol-Level Locks** *(nguồn ngoài)*: roadmap Concordium đã dời mốc ra mắt sang **27/01/2027**. Cần hỏi ở W4 xem testnet/devnet có dùng được trong hackathon không. Trước khi có xác nhận, **không đưa vào critical path**.

**Nhận định:** Concordium không nhất thiết là nơi thực thi toàn bộ quá trình suy luận của AI Agent. Vai trò đáng nghiên cứu hơn là lớp xác minh danh tính và trách nhiệm giải trình cho những hoạt động mà Agent thực hiện.

---

## 6. Concordium ID: Xác minh một lần và chứng minh nhiều lần

**Timestamp: 10:57–19:10**

Trong mô hình trực tuyến truyền thống, người dùng phải liên tục gửi giấy tờ, hình ảnh hoặc thông tin cá nhân mỗi khi dùng dịch vụ mới. Concordium đề xuất tái sử dụng danh tính đã xác minh để tạo bằng chứng phù hợp với yêu cầu của từng ứng dụng.

### Quy trình được CTO mô tả

```text
                 USER
                   |
                   v
          Concordium ID App
                   |
                   v
          Choose Identity Provider
                   |
                   v
       Identity Verification
       - Document verification
       - Selfie / Liveness
       - Attribute extraction
                   |
                   v
          Signed Identity Object
                   |
          +--------+---------+
          |                  |
          v                  v
    Store locally       Create Concordium
    in ID App           Blockchain Account
          |                  |
          v                  v
     Generate Proofs    Use wallet to interact
                       with the blockchain
```

Một số điểm quan trọng:

1. Identity Provider (IDP) là bên thực hiện xác minh giấy tờ và danh tính.
2. Concordium Foundation không trực tiếp nhận giấy tờ của người dùng.
3. Người dùng nhận Identity Object đã được IDP ký và bảo vệ bằng cơ chế mật mã (phần định danh được mã hóa bằng khóa của Privacy Guardians).
4. Có thể dùng Concordium ID App mà không cần tạo tài khoản blockchain.
5. Khi tạo tài khoản, chỉ các cam kết mật mã của thuộc tính được đưa vào, không đưa giấy tờ lên chain. *"The chain doesn't store any PII"* [13:52].

### Cá nhân và doanh nghiệp

CTO cho biết có khoảng **ba IDP xác minh cá nhân và một IDP cho doanh nghiệp** [13:09].

| Human Identity | Business Identity |
|---|---|
| Xác minh cá nhân | Xác minh tổ chức |
| Chứng minh tuổi hoặc thuộc tính cá nhân | Chứng minh một chủ thể doanh nghiệp |
| Nền tảng cho xác thực người dùng | Tiềm năng làm nền tảng cho Agent thuộc doanh nghiệp |

**Lưu ý:** Xác minh doanh nghiệp không tự động chứng minh một Agent cụ thể được doanh nghiệp đó ủy quyền. Vẫn cần một cơ chế liên kết và cấp quyền. Đây là phân biệt cực kỳ quan trọng đối với hướng Cross-Organization Multi-Agent.

---

## 7. Zero-Knowledge Proof là cơ chế chứng minh điều kiện

**Timestamp: 19:10–20:30; 25:49–26:14**

| Loại | Ví dụ |
|---|---|
| Range Proof | Chứng minh đã đủ tuổi theo ngưỡng |
| Membership Proof | Chứng minh thuộc một nhóm quốc gia |
| Non-membership Proof | Chứng minh không thuộc một nhóm xác định |
| Attribute Reveal | Tiết lộ một thuộc tính cụ thể khi đồng ý (ví dụ tên thật) |

Không phải mọi yêu cầu xác minh đều phải ẩn thuộc tính; Concordium hỗ trợ cả luồng tiết lộ có đồng ý.

### Cảnh báo từ CTO

Nếu website kiểm tra ngày sinh trong một khoảng quá hẹp, kết quả bằng chứng có thể làm lộ thông tin nhạy cảm dù không gửi trực tiếp ngày sinh.

**ZKP bảo vệ dữ liệu trong phạm vi mệnh đề được chứng minh, nhưng không thể tự ngăn mọi hình thức suy luận thông tin từ câu hỏi.**

Với Agent Systems tự động yêu cầu credentials, cần kiểm soát cả nội dung câu hỏi xác minh, không chỉ kiểm tra bằng chứng hợp lệ hay không.

---

## 8. Privacy Guardians: Cân bằng quyền riêng tư và accountability

**Timestamp: 20:32–25:48**

| Thành phần | Trách nhiệm |
|---|---|
| User | Giữ và sử dụng credential |
| Identity Provider | Xác minh danh tính ban đầu |
| Privacy Guardians | Ba luật sư giữ key share, tham gia giải mã định danh |
| Legal Authority | Yêu cầu xử lý thông tin theo quy trình pháp lý |

### Cơ chế được trình bày

Mô hình **2-of-3 Privacy Guardians**: cần **lệnh của tòa án Thụy Sĩ** [23:08–23:11], và ít nhất hai trong ba luật sư phải tham gia giải mã [23:29]. Sau đó, cơ quan điều tra dùng thông tin đã giải mã để yêu cầu IDP liên quan xác định danh tính thực tế.

```text
Verified Identity
       |
       v
Encrypted Identity Identifier
       |
       v
Blockchain Account
       |
       | Legal disclosure request (Swiss court order)
       v
Privacy Guardians (2-of-3)
       |
       | Threshold decryption
       v
Identity Provider Reference
       |
       v
Identity Provider
       |
       v
Real-world Identity
```

IDP không biết địa chỉ tài khoản nào được tạo từ danh tính họ xác minh. Người quan sát blockchain cũng không thể liên kết các tài khoản được tạo từ cùng một danh tính. Mỗi account cần một lệnh riêng.

### Ý nghĩa đối với hệ thống Agent

Nguyên tắc rút ra: **một thành phần không nên tự động nắm toàn bộ quyền xác minh, quyền quyết định và khả năng truy xuất dữ liệu nhạy cảm.**

Tuy nhiên, Privacy Guardians là cơ chế cho danh tính blockchain và lawful disclosure; nó không phải hệ thống phê duyệt hành động AI Agent có sẵn.

---

# IV. UPDATE VỀ VERIFY & ACCESS, CONSENT VÀ AGENT TRUST

Workshop cung cấp ba khả năng đáng chú ý: **xác minh thuộc tính, ghi nhận bằng chứng về sự chấp thuận và xác minh mối liên kết với domain**.

## 9. Verify & Access: Xác minh kèm bằng chứng kiểm toán

**Timestamp: 26:14–33:08**

### Kiến trúc tổng thể

```text
                APPLICATION
                     |
                     v
          Create Verification Request
                     |
                     v
            VRA (On-chain)
       Verification Request Anchor
                     |
                     v
            Generate QR Code
                     |
                     v
              USER ID APP
                     |
              User Approval
                     |
                     v
              Generate ZKP
                     |
                     v
             Send Proof Back
                     |
                     v
             VERIFIER SERVICE
                     |
           +---------+---------+
           |                   |
           v                   v
      Valid Proof         Invalid Proof
           |                   |
           v                   v
      Grant Access         Reject
           |
           v
       Audit Record
        (Off-chain)
           |
           v
      Hash Audit Record
           |
           v
     Audit Anchor (On-chain)
```

Các trường thông tin trong **Verification Request Anchor (VRA)**:

| Trường thông tin | Chức năng |
|---|---|
| Verification Question | Điều kiện cần chứng minh |
| Validity Window | Giới hạn thời gian hiệu lực (có thể chỉ vài phút) |
| One-time-use value | Ngăn tái sử dụng yêu cầu |
| Requesting Domain | Website đưa ra yêu cầu |
| On-chain Anchor | Cơ sở đối chiếu và kiểm toán |

Sau khi người dùng tạo bằng chứng, verifier đối chiếu với yêu cầu ban đầu. Nếu thành công, ứng dụng cấp quyền truy cập, lưu audit ở backend và ghi một anchor (hash của log) lên chain.

**Khác biệt quan trọng:** Blockchain không chứa toàn bộ ZKP hay lịch sử xác minh, chỉ chứa giá trị băm để kiểm tra tính toàn vẹn. CTO nhấn mạnh không đưa proof lên chain để tránh *"zero-knowledge proof leakage"* [30:01–30:06].

### Tại sao đây là một update lớn?

Trước workshop: `Input → Verify Identity → True/False`

Kiến trúc thực tế: `Request → Bind Context → Generate Proof → Verify → Decide → Audit`

Khác biệt nằm ở khả năng **kiểm toán quá trình xác minh**, không chỉ nhận một kết quả boolean.

### Về Ofcom

**Timestamp: 29:15–33:05**

CTO kể Concordium đã trình bày Verify & Access với Ofcom (Anh) khi quy định age verification có hiệu lực năm 2025. Ông nói rõ Ofcom *"don't approve things … they're not that kind of a body"*, nhưng xác nhận cách tiếp cận *"is within their guidelines"* [29:27–29:37].

Ở [32:55] ông lại nói *"that is the proof that has been verified by Ofcom"*, tức là tự mâu thuẫn trong lời nói. Vì vậy chỉ nên diễn đạt là **"được Ofcom xem xét và nằm trong guideline"**, không viết **"được Ofcom chứng nhận"**.

### Ứng dụng vào AI Agents

Khi Agent muốn truy cập dịch vụ của một tổ chức khác, Trust Gateway có thể kiểm tra danh tính hoặc credential thích hợp thay vì chỉ kiểm tra API key. Khi có tranh chấp, hệ thống có thể đối chiếu: yêu cầu nào đã được đưa ra, điều kiện nào đã được kiểm tra, kết quả được ghi nhận thế nào, và bản ghi kiểm toán hiện tại có còn khớp với anchor ban đầu không.

**Lưu ý kỹ thuật:** Audit anchor chứng minh tính toàn vẹn của dữ liệu được neo, không tự động chứng minh nội dung ban đầu là sự thật. Đây là phân tích kiến trúc của mình, không phải tính năng Agent Gateway đã được demo.

---

## 10. UPDATE RẤT QUAN TRỌNG: Verifiable Consent cho AI Agents

**Timestamp: 38:56–42:50**

Nếu phải chọn một phát hiện có giá trị nhất từ Workshop #1, mình chọn **Consent Verification**. Hệ thống không chỉ chứng minh thuộc tính danh tính, mà còn ghi nhận sự chấp thuận đối với một câu cụ thể, được log bằng anchor giống Verify & Access.

### Ví dụ CTO đưa ra [39:34–40:05]

> *"I'm an agent, I need to do this thing. You asked me to book tickets. I found you these tickets. Here is the price … You consented me going ahead and buying this … should anything be disputed six months from now? Well, we can come back and say, look, this is where you agreed to this."*

### Luồng ứng dụng đề xuất

```text
                 USER
                   |
                   | "Find tickets"
                   v
                AI AGENT
                   |
                   v
            Search / Planning
                   |
                   v
             Proposed Action
                   |
                   v
             Consent Request
                   |
                   v
            Concordium ID App
                   |
             User Reviews
                   |
             +-----+------+
             |            |
             v            v
          Approve       Reject
             |
             v
       Verifiable Consent
             |
             v
          AI AGENT
             |
             v
       Execute Action
             |
             v
         Audit Record
```

Đây là kiến trúc có thể xây từ cơ chế được trình bày, không phải luồng AI Agent đã được demo.

### Điều gì đã được trình diễn?

CTO nhập một thông điệp consent tùy chỉnh trên giao diện demo, gửi yêu cầu, quét QR bằng ID App, kiểm tra đúng nội dung vừa nhập và approve; giao diện báo hoàn tất [41:54–42:50]. Như vậy **khả năng yêu cầu và ghi nhận consent đã được trình diễn**.

### Vì sao consent phù hợp với AI Agents?

Agent có thể đề xuất hành động, nhưng không đồng nghĩa người dùng đã trao quyền thực hiện mọi hành động.

| Hành động của Agent | Yêu cầu xác minh có thể cần |
|---|---|
| Tóm tắt tài liệu công khai | Có thể không cần consent riêng |
| Truy cập tài liệu nội bộ | Cần authorization phù hợp |
| Gửi dữ liệu cho tổ chức khác | Có thể cần xác nhận theo chính sách |
| Ký kết hoặc chấp thuận một giao dịch | Cần xác nhận rõ nội dung |
| Hành động vượt phạm vi ủy quyền | Phải bị từ chối hoặc yêu cầu phê duyệt mới |

Vấn đề cốt lõi là **delegated authority**: quyền mà con người hoặc tổ chức trao cho Agent, và giới hạn của quyền đó.

### Lưu ý về giá trị pháp lý

Consent anchor là bằng chứng kỹ thuật rằng một yêu cầu và kết quả đã được ghi nhận. Nó không tự động chứng minh người dùng hiểu đầy đủ, không bị ép buộc, hoặc đáp ứng mọi điều kiện pháp lý của hợp đồng. Sản phẩm thực tế vẫn cần chính sách phê duyệt theo loại hành động.

### Lưu ý khi demo

Consent bắt buộc người thật quét QR bằng ID App. Điều này hợp với mô hình human-in-the-loop, nhưng video demo 3 phút cần chuẩn bị kỹ (ví dụ mirror màn hình điện thoại) và khó tự động hóa hoàn toàn.

---

## 11. Consent có cơ chế kiểm tra tính toàn vẹn

**Timestamp: 51:26–52:17**

Câu hỏi Q&A: nếu một bên thay đổi nội dung consent trong quá trình truyền thì sao?

CTO giải thích: hash của nội dung câu hỏi đã nằm trong anchor on-chain. Khi ID App nhận yêu cầu, nó kiểm tra ngay; nếu nội dung bị sửa trong lúc truyền qua WalletConnect hoặc trên thiết bị, app sẽ báo không khớp. Kể cả khi ID App bị xâm phạm, bước verify phía sau cũng có thể phát hiện tùy theo thành phần bị xâm phạm. *"There's a fair amount of safeguards in there."*

### Ý nghĩa kỹ thuật

- **Consent thông thường:** ứng dụng ghi trong database rằng người dùng đã nhấn Agree.
- **Verifiable Consent:** nội dung yêu cầu và bằng chứng có thể đối chiếu qua cơ chế mật mã và bản ghi kiểm toán.

Một consent có thể kiểm toán cần gắn với **đúng nội dung người dùng được yêu cầu chấp thuận**. Nếu chỉ lưu `approved = true` mà không liên kết với nội dung và ngữ cảnh, giá trị bằng chứng yếu hơn rất nhiều.

Transcript không đủ để khẳng định cơ chế này chống được mọi tình huống thiết bị bị xâm phạm.

---

## 12. Domain Verification và xác minh Agent Endpoint

**Timestamp: 42:53–44:28**

CTO trình diễn tính năng mới của ID App: hiển thị domain đã được xác minh. App kiểm tra DNS của URL xem có bản ghi được Concordium ký không, rồi đối chiếu với chain.

```text
         User / AI Client
                 |
                 v
        Connect to Service
                 |
                 v
          Service Domain
                 |
                 v
        DNS Verification Data
                 |
                 v
       Concordium Verification
                 |
                 v
          Identity Binding
                 |
          +------+------+
          |             |
          v             v
       Matched       Not Matched
```

### CTO hé lộ nội dung Workshop #2

CTO nói phần "agent IDP" và "agent registry" sẽ cho thấy cách xác minh end-to-end rằng *"I am indeed talking to the right agent. It is indeed backed by who I think it should be backed by and the card is valid and that the URL is valid"* [44:04–44:17]. (Ông nói "tomorrow" nhưng Workshop #2 là thứ Tư 04/11.)

| Thành phần | Cần xác minh |
|---|---|
| Agent Identity | Agent nào đang tương tác? |
| Agent Ownership | Agent được gắn với chủ thể nào? |
| Agent Card | Metadata Agent có hợp lệ không? |
| Agent URL | Endpoint có khớp thông tin đã đăng ký không? |
| Trust Chain | Các mối liên kết có đối chiếu được không? |

### Liên hệ với CIS-8004

Một Agent Registry là nơi công bố thông tin về Agent, nhưng để có chuỗi tin cậy hoàn chỉnh, ứng dụng còn phải biết thông tin đó có liên kết hợp lệ với chủ thể và endpoint hay không.

```text
       Agent Registry
             |
             v
         Agent Card
             |
             v
       Agent Owner Binding
             |
             v
       Endpoint Verification
             |
             v
          Agent API
```

Mô hình này cần kiểm chứng tiếp bằng tài liệu và Workshop #2.

**Agent Card hợp lệ không có nghĩa mọi phản hồi của Agent đều đáng tin.** Xác minh nguồn gốc khác với xác minh chất lượng hoặc tính đúng đắn của hành vi.

---

# V. UPDATE TỪ LIVE DEMO: CÔNG NGHỆ NÀO ĐÃ HOẠT ĐỘNG?

## 13. Demo xác minh thuộc tính

**Timestamp: 40:30–41:54**

Demo chạy trên trang `ccd-ui-sdk.netlify.app`.

### Luồng A: Browser-based (SDK) Verification

Người dùng quét QR bằng ID App, app hiển thị câu hỏi cần chứng minh, người dùng chọn danh tính và trượt để approve; website báo *"verification complete"* [40:38–41:22]. Transcript không nói rõ câu hỏi ở luồng này là gì.

### Luồng B: Backend-based Verification

Merchant backend xử lý kết nối. Câu hỏi hiện lên là *"prove that you're over 18"* [41:39], người dùng approve và vào được site. CTO nhận xét kết nối backend-to-backend qua WalletConnect nhanh hơn.

### Điều gì được xác nhận?

| Khả năng | Trạng thái sau Workshop #1 |
|---|---|
| Tạo verification request | Đã demo |
| Kết nối ID App qua QR code | Đã demo |
| Hiển thị yêu cầu xác minh | Đã demo |
| Người dùng approve | Đã demo |
| Tạo và gửi bằng chứng | Được mô tả, demo xác minh thành công |
| Website nhận kết quả | Đã demo |
| Backend verification | Đã demo |
| Consent request | Đã demo |
| Domain verified indicator | Đã demo |
| Agent-to-Agent verification | Chưa demo trong Workshop #1 |

**Human Identity Verification và Consent là hai nhóm khả năng đã có demo trực tiếp.** Phần Agent-to-Agent cần chờ Workshop #2 hoặc tự kiểm chứng SDK.

---

## 14. Công cụ tích hợp của đối tác Veriox

**Timestamp: 33:08–35:56**

CTO giới thiệu **Veriox** (`veriox.co.uk`, demo tại `demo.veriox.io`), một đối tác giúp website tích hợp Verify & Access nhanh. Merchant đăng ký, lấy API key, đặt một **Cloudflare Worker** gọi Veriox. Veriox lo khởi tạo verification journey, tạo QR, làm việc với hạ tầng Concordium, kiểm tra proof, quản lý audit và trả kết quả về cho ứng dụng.

CTO nhấn mạnh đây là dịch vụ của **đối tác**, không phải sản phẩm của Concordium. *(Transcript Whisper ghi nhầm thành "veryox" / "variops".)*

| Phương án | Ưu điểm | Hạn chế |
|---|---|---|
| Dùng Veriox | Tích hợp nhanh, giảm công vận hành | Phụ thuộc dịch vụ bên ngoài; ít thể hiện "integration depth" |
| Tự xây bằng SDK | Hiểu sâu cơ chế, kiểm soát kiến trúc | Tốn công phát triển và kiểm thử hơn |

### Nhận định

Vì giám khảo chấm integration depth, và vì mục tiêu của chúng ta là học sâu về Trust Infrastructure, nên ít nhất phải tự xây một luồng xác minh đơn giản bằng SDK. Không cần tự triển khai giao thức mật mã, nhưng phải hiểu cách tạo request, xác minh bằng chứng, liên kết kết quả với quyết định cấp quyền và lưu audit.

---

# VI. UPDATE VỀ DEVELOPER TOOLING

## 15. Thiết lập môi trường

**Timestamp: 45:21–48:31**

### 15.1. Concordium Browser Wallet

Ví trình duyệt để tạo và quản lý tài khoản Concordium. Cả Browser Wallet và ID App đều có nút chọn network; phải chuyển sang **testnet** để dùng CCD miễn phí.

### 15.2. Test Identity Provider

Trên testnet có **Concordium Test IDP**: điền form với thuộc tính giả (quốc gia, ngày sinh, tên…) để tạo danh tính thử nghiệm, rồi tạo account trong vài giây. Đây là credential thử nghiệm, không có giá trị như danh tính thật. Mainnet chỉ có các IDP chính thức với KYC đầy đủ.

### 15.3. Testnet CCD

Trong demo, CTO vào Activity → Request CCD và nhận ngay **20.000 test CCD** [46:47–46:53]. Con số này phản ánh luồng faucet lúc demo, không phải cam kết mọi tài khoản đều nhận cùng số lượng.

### 15.4. Local Stack

CTO khuyến khích thử ngay ("challenge" của buổi 1). Local Stack (`github.com/Concordium/concordium-local-stack`) dựng trên laptop:

| Thành phần | Mục đích |
|---|---|
| Local Concordium Node | Thử nghiệm tương tác blockchain |
| DevNet Environment | Môi trường phát triển riêng |
| Wallet | Tạo và dùng tài khoản thử nghiệm |
| CCDExplorer | Quan sát giao dịch và dữ liệu |

Lợi ích lớn: làm hỏng thì xóa đi dựng lại.

### Nên dùng Testnet hay Local DevNet?

| Mục đích | Môi trường |
|---|---|
| Học cấu trúc tài khoản và giao dịch | Local DevNet |
| Thử nghiệm smart contract | Local DevNet, sau đó Testnet |
| Thử nghiệm giao diện ví | Testnet |
| Tích hợp nhiều dịch vụ | Testnet |
| Chuẩn bị demo hackathon | Testnet |
| CCDExplorer link cho submission | **Testnet** (bắt buộc theo slide 07) |

Giao dịch trên Local DevNet không xuất hiện trên CCDExplorer công khai của testnet, nên không dùng được làm bằng chứng nộp bài.

---

# VII. NHỮNG THÔNG TIN MỚI TỪ Q&A

## 16. Identity 2.0 và bài toán tính duy nhất

**Timestamp: 48:46–49:24**

Câu hỏi: proof không liên kết được, vậy một người tạo 10 ví thì có phát hiện được không (nullifier)?

CTO trả lời: tính duy nhất giữa các tài khoản đang được thiết kế trong **Identity 2.0**, một nhánh nghiên cứu của science team, nhằm cấp cho mỗi danh tính một *"zero-knowledge proof uniqueness value"* áp dụng được cho mọi account tạo từ danh tính đó.

**Trạng thái: đang nghiên cứu, chưa có API/SDK.** Hiện **không chống Sybil theo người** được. Không thiết kế "1 người = 1 phiếu/1 suất" dựa trên ZK proof trong MVP; nếu dự án cần thì phải nêu rõ là giới hạn.

---

## 17. Doanh nghiệp có thể vận hành Identity Provider riêng

**Timestamp: 49:30–50:48**

### Tình huống

Công ty A cung cấp dịch vụ kỹ thuật cho công ty B. Agent của A cần thao tác trên hạ tầng của B. B muốn xác minh Agent được hỗ trợ bởi một kỹ sư đã xác minh của A, mà không cần biết kỹ sư đó là ai.

### Câu trả lời của CTO

*"So both are possible."*
- Doanh nghiệp đủ lớn có thể chạy IDP riêng, nhưng cần **chữ ký của governance committee** để thêm IDP vào chain. Concordium muốn giữ IDP là các máy chủ xác minh thật sự, trừ khi use case đủ lớn.
- Dù xác minh qua IDP công khai hay nội bộ, đều chứng minh được thuộc công ty bằng ZK: company reveal, proof "thuộc IDP X", hoặc **chữ ký trong Agent Card** (sẽ nói ở Workshop #2).

### Đánh giá

Đây là cập nhật **rất quan trọng**: bài toán xác minh Agent giữa hai tổ chức là tình huống thực tế do người tham dự đưa ra và được CTO xác nhận là khả thi.

Nhưng còn một khoảng cách: **được xác minh là kỹ sư của A không đồng nghĩa được phép thay đổi mọi hệ thống của B.** Vẫn cần lớp authorization và chính sách cấp quyền.

```text
Verified Engineer
       |
       v
Organization A
       |
       v
Registered Agent
       |
       v
Delegated Permission
       |
       v
Organization B Policy Check
       |
       v
Allowed Operation
```

Đây có thể là cơ sở của hướng **Enterprise Agent Delegation**.

---

# VIII. NHỮNG GIỚI HẠN VÀ RỦI RO

## 18. Chống tái sử dụng bằng chứng không đồng nghĩa chống mọi hình thức giả mạo

| Bài toán | Khả năng được workshop đề cập |
|---|---|
| Replay Attack | Có cơ chế hạn chế tái sử dụng yêu cầu hoặc bằng chứng (nonce, validity window) |
| Cross-domain Reuse | Yêu cầu được liên kết với domain |
| Malicious but Valid Agent | Chưa có giải pháp được trình diễn |

Một Agent có danh tính hợp lệ vẫn có thể vượt quyền hoặc gửi thông tin sai. Trust Infrastructure cần thêm chính sách về quyền truy cập, thời hạn ủy quyền và kiểm soát hành động.

## 19. Audit Anchor không thay thế hệ thống lưu trữ và kiểm toán đầy đủ

Bản ghi gốc vẫn nằm ở backend; chain chỉ giữ hash. Khi triển khai thực tế phải bảo đảm bản ghi gốc được lưu giữ, truy xuất và đối chiếu được. Blockchain giúp phát hiện thay đổi đối với dữ liệu đã neo, nhưng không chứng minh dữ liệu gốc được ghi trung thực: đây là khác biệt giữa **data integrity** và **data correctness**.

## 20. Phụ thuộc vào roadmap

| Thành phần | Trạng thái | Khuyến nghị |
|---|---|---|
| Identity 2.0 (uniqueness) | Đang nghiên cứu | Không dùng |
| Protocol-Level Locks | Mốc mainnet dời sang 27/01/2027 *(nguồn ngoài)* | Hỏi ở W4; không đưa vào critical path |
| Agent Kit, MCP Server, Agent ID Service | Roadmap 11–12/2026 *(nguồn ngoài)* | Có thể ra giữa cuộc thi; luôn có phương án dự phòng bằng Agent Registry MCP + Web SDK hiện có |
| x402 | Chưa thấy repo chính thức *(nguồn ngoài)* | Chờ W3 (09/11) |

---

# IX. TÁC ĐỘNG CỦA WORKSHOP #1 ĐẾN CHIẾN LƯỢC DỰ ÁN

## 21. Hướng Cross-Organization Multi-Agent cần định nghĩa lại phạm vi

Trước Workshop #1, hướng nghiên cứu là **Cross-Organization Multi-Agent + Trust Infrastructure**, tương đối rộng.

Sau Workshop #1: **vấn đề khó nhất không nằm ở việc khiến hai Agent giao tiếp được với nhau, mà ở việc xác định khi nào chúng được phép tin tưởng và thực hiện yêu cầu của nhau.**

### Trust Architecture được cập nhật

```text
              HUMAN / ORGANIZATION
                       |
                       v
                Identity Layer
                 Concordium ID
                       |
                       v
                Agent Identity
                Agent Registry
                       |
                       v
             Agent Ownership Binding
                       |
                       v
             Endpoint Verification
                       |
                       v
               Authorization
                       |
                       v
                 AI AGENT
                       |
                       v
               Proposed Action
                       |
                       v
              Consent / Approval
                       |
                       v
                  Execution
                       |
                       v
                Audit Evidence
```

Sơ đồ trên là kiến trúc đề xuất, kết hợp khả năng của Workshop #1 với phần cần tìm hiểu ở Workshop #2. Nó **không phải framework Concordium đã công bố**.

| Layer | Công nghệ liên quan | Trạng thái hiểu biết hiện tại |
|---|---|---|
| Human Identity | Concordium ID | Đã được giải thích và trình diễn |
| Organization Identity | Identity Provider | CTO xác nhận khả năng |
| Agent Identity | Agent Registry | Được giới thiệu, chờ Workshop #2 |
| Endpoint Verification | DNS + Concordium | Đã demo một phần |
| Authorization | Application Policy | Cần tự thiết kế |
| Consent | Verify & Access | Đã được trình diễn |
| Payment | x402, PLT, sponsored tx | Chờ Workshop #3 |
| Execution | AI Agent Framework | Ngoài phạm vi Workshop #1 |
| Audit | On-chain Anchors | Đã được giải thích |

---

# X. CÁC HƯỚNG DỰ ÁN ĐƯỢC CẬP NHẬT SAU WORKSHOP

Workshop #1 giúp hình thành ba hướng cụ thể hơn. Hướng A và B gần trùng với **MandateOS** và **TrustGate** trong research trước cuộc thi (`Research-Hackathon/`), tức là hai nguồn độc lập cùng củng cố các hướng này.

## Hướng A: Verifiable Agent Consent (≈ MandateOS)

**Bài toán:** AI Agent thực hiện nhiệm vụ thay người dùng nhưng thiếu cơ chế chứng minh người dùng đã chấp thuận một hành động cụ thể.

**Giải pháp:** Agent đề xuất hành động, người dùng xác nhận qua Concordium ID App, hệ thống lưu bằng chứng trước khi thực thi.

**Đánh giá:** **Khả thi cao cho hackathon**, vì consent đã được demo. Phần khó là liên kết consent với đúng hành động, thời hạn và phạm vi thực thi.

**Lưu ý về integration depth:** nếu chỉ có consent, tích hợp sẽ khá mỏng. Nên ghép thêm Agent Registry + Verified badge (W2) và x402 hoặc sponsored transactions (W3) để có 3 primitive trong cùng một workflow. Quy mô này vẫn vừa sức nếu thi solo.

## Hướng B: Cross-Organization Agent Trust Gateway (≈ TrustGate)

**Bài toán:** Agent của tổ chức A cần dùng dịch vụ của tổ chức B nhưng hai bên không mặc định tin nhau.

**Giải pháp:** Trust Gateway xác minh Agent, kiểm tra quan hệ với chủ sở hữu, đánh giá quyền truy cập và cho phép hoặc từ chối yêu cầu.

**Đánh giá:** **Tiềm năng học hỏi cao** về Agent Registry, Identity Binding, Authorization và kiểm toán. Mức khả thi phụ thuộc công cụ Agent Registry sẽ được làm rõ ở Workshop #2.

## Hướng C: Privacy-Preserving Enterprise Agent Delegation

**Bài toán:** Tổ chức muốn chứng minh Agent hoạt động dưới trách nhiệm của một nhân viên hoặc bộ phận hợp lệ mà không lộ toàn bộ thông tin cá nhân.

**Giải pháp:** Kết hợp identity credentials, Agent Registry và delegation policies.

**Đánh giá:** **Chiều sâu nghiên cứu lớn nhưng độ khó cao**: có thể cần issuer phù hợp, thiết kế credential, cơ chế thu hồi quyền và chính sách tổ chức. Chưa chắc phù hợp cho MVP đầu tiên.

### So sánh ba hướng

| Tiêu chí | Agent Consent | Trust Gateway | Enterprise Delegation |
|---|---|---|---|
| Phù hợp với Workshop #1 | Rất cao | Cao | Cao |
| Phụ thuộc Workshop #2 | Thấp–Trung bình | Cao | Cao |
| Độ phức tạp MVP | Trung bình | Trung bình–Cao | Cao |
| Vừa sức nếu thi solo | Cao | Trung bình (nếu giới hạn phạm vi) | Thấp |
| Integration depth tiềm năng | Trung bình (cao nếu ghép Registry + x402) | Cao | Rất cao |
| Học về ZKP và Identity | Cao | Cao | Rất cao |
| Học về Agent Registry | Trung bình | Rất cao | Rất cao |
| Học về authorization | Cao | Rất cao | Rất cao |
| Học về Multi-Agent | Trung bình | Rất cao | Cao |
| Khả năng demo dễ hiểu | Cao | Cao nếu giới hạn phạm vi | Trung bình |

Bảng trên là đánh giá kỹ thuật của mình, không phải tiêu chí chính thức.

**Sau Workshop #1, ưu tiên giữ Hướng A và B để nghiên cứu tiếp, coi Hướng C là khả năng mở rộng.** Lý do không phải Hướng C thiếu giá trị, mà vì chưa kiểm chứng đủ các dependency.

---

# XI. NHỮNG CÔNG VIỆC NÊN THỰC HIỆN SAU WORKSHOP #1

## 22. Việc có thể bắt đầu ngay

| Ưu tiên | Công việc | Kết quả kỳ vọng |
|---|---|---|
| P0 | Tạo/tham gia project trên trang programme, kết nối Discord | Sẵn sàng cho Checkpoint 1 |
| P0 | Thiết lập Concordium Browser Wallet và testnet | Có tài khoản thử nghiệm |
| P0 | Dùng Test IDP, nhận test CCD | Có danh tính mẫu và CCD để kiểm thử |
| P0 | Tìm hiểu Verify & Access | Hiểu request, proof, verifier và audit |
| P1 | Thử nghiệm luồng ZKP (`concordium-dapp-examples/simpleAgeVerification`) | Xác minh được một thuộc tính mẫu |
| P1 | Thử nghiệm Consent | Ghi nhận một yêu cầu chấp thuận |
| P1 | Kiểm tra giao dịch trên CCDExplorer testnet | Hiểu dữ liệu nào được ghi on-chain |
| P2 | Khởi tạo Local Stack | Có môi trường nghiên cứu riêng |
| P2 | Đọc tài liệu Agent Registry | Chuẩn bị cho Workshop #2 |

Nên cố gắng tự chạy ít nhất một luồng xác minh, vì đây là cách nhanh nhất để biết công nghệ hoạt động thực tế ra sao.

## 23. Câu hỏi mang sang Workshop #2 (T4 04/11, 22:00 giờ VN)

| Câu hỏi | Tại sao quan trọng? |
|---|---|
| Agent Identity được phát hành và quản lý như thế nào? | Xác định Agent cụ thể |
| Agent Registry liên kết với chủ sở hữu ra sao? | Xác minh trách nhiệm |
| Agent Card và endpoint được kiểm tra như thế nào? | Hạn chế tin sai nguồn |
| Agent có thể được ủy quyền tự động không? | Delegated authorization |
| Quyền của Agent được thu hồi như thế nào? | Kiểm soát vòng đời quyền |
| Agent có thể dùng credential/ZKP mà không cần người dùng xác nhận từng lần không? | Khả năng tự động hóa |
| "Integration depth" cụ thể là gì (bao nhiêu primitive, có cần smart contract riêng không)? | Định hướng phạm vi |
| Cơ cấu giải: bao nhiêu đội thắng, mức grant, có giải theo track không? | Chiến lược dự thi |
| Repo/facilitator x402 cho testnet ở đâu? | Rủi ro kỹ thuật cho W3 |

---

# XII. TỔNG HỢP CÁC UPDATE QUAN TRỌNG NHẤT

| # | Update sau Workshop #1 | Trạng thái | Tác động |
|---|---|---|---|
| 1 | Được mang codebase có sẵn vào hackathon | CTO xác nhận, slide 07 | Không cần xây từ đầu |
| 2 | Ứng dụng không cần chạy toàn bộ trên Concordium | CTO xác nhận | Kiến trúc hybrid |
| 3 | Được thi solo hoặc đội 3–4 người | Encode xác nhận | Linh hoạt nhân sự |
| 4 | Sáu workshop 02–18/11, có chủ đề cụ thể | Slide 03, 04 | Kế hoạch học tập |
| 5 | Checkpoint 1: CN 22/11, 23:59 UTC | Slide 05 | Đăng ý tưởng và nhóm |
| 6 | Final submission: T4 09/12, 23:59 UTC, nền tảng khóa cứng | Slide 03, 05, 07 | Nộp sớm |
| 7 | Judging 10–11/12, xem từng demo | Slide 03 | Demo phải chạy thật |
| 8 | Bài nộp: description, repo public, video ≤ 3 phút, CCDExplorer testnet, path to production | Slide 07 | Checklist nộp bài |
| 9 | Giải: cơ hội grant từ quỹ 75M CCD + merch, không có tiền mặt | Slide 08 | Path to production = hồ sơ grant |
| 10 | Chấm theo integration depth + credible path to production | Thông báo chính thức *(nguồn ngoài)* | Ưu tiên tích hợp sâu |
| 11 | Identity tích hợp ở protocol | CTO giải thích | Nền tảng xác minh chủ thể |
| 12 | Có IDP cho cá nhân (≈3) và doanh nghiệp (1) | CTO giới thiệu | Use case B2B |
| 13 | ZKP từ thuộc tính danh tính | CTO giải thích và demo | Xác minh riêng tư |
| 14 | Privacy Guardians 2-of-3, cần lệnh tòa Thụy Sĩ | CTO giải thích | Mô hình accountability |
| 15 | Verify & Access dùng VRA và audit anchor | CTO giải thích | Bằng chứng kiểm toán |
| 16 | Cơ chế hạn chế tái sử dụng proof | CTO giải thích | Bảo vệ quy trình xác minh |
| 17 | Consent Verification | Đã trình diễn | Agent Approval Layer |
| 18 | ID App kiểm tra domain qua DNS | Đã trình diễn | Endpoint verification |
| 19 | Đối tác Veriox hỗ trợ tích hợp | CTO giới thiệu | Rút ngắn thời gian (nhưng kém "sâu") |
| 20 | Test IDP, testnet faucet, Local Stack | CTO hướng dẫn | Dễ bắt đầu |
| 21 | Doanh nghiệp vận hành IDP riêng khi governance duyệt | CTO xác nhận | Hướng Enterprise Identity |
| 22 | Identity 2.0 nghiên cứu uniqueness | Đang nghiên cứu | Không phụ thuộc trong MVP |
| 23 | Agent Registry và Agent Identity giải thích ở W2 | CTO thông báo | Trọng tâm Workshop #2 |

---

# XIII. KẾT LUẬN: WORKSHOP #1 ĐÃ THAY ĐỔI NHỮNG GÌ?

### 1. Thể lệ đã rõ ràng

Timeline, deadline, yêu cầu nộp bài, quy định đội và giải thưởng đều đã có trên slide chính thức. Developer được khuyến khích tận dụng dự án hiện có và chọn những thành phần Concordium mang lại giá trị thực tế, giúp giảm rủi ro phải xây một sản phẩm quá lớn trong thời gian ngắn.

### 2. Đã có công nghệ cụ thể để thử nghiệm

Identity Verification, ZKP, Verify & Access và Consent đều đã có luồng demo thực tế, cùng các công cụ thử nghiệm. **Đã có đủ cơ sở để bắt đầu một prototype về Identity và Consent**, ngay cả trước khi kết thúc chuỗi workshop.

### 3. Hướng Multi-Agent + Trust Infrastructure có thêm cơ sở kỹ thuật

Domain verification, liên kết Agent với chủ sở hữu và câu hỏi Enterprise Agent trong Q&A cho thấy các vấn đề chúng ta quan tâm nằm gần trọng tâm công nghệ được giới thiệu. Tuy nhiên, Agent Identity, Agent Registry, delegated authorization và Agent-to-Agent verification vẫn cần nghiên cứu tiếp.

---

## Đánh giá cuối cùng

**Workshop #1 đã giúp chuyển từ nghiên cứu ý tưởng ở cấp khái niệm sang xác định những thành phần kỹ thuật có thể triển khai và kiểm chứng.**

Câu hỏi *"Làm thế nào để xây dựng một hệ thống Multi-Agent đáng tin cậy giữa các tổ chức?"* đã có thể phân rã thành:

**Identity → Agent Ownership → Endpoint Verification → Authorization → Consent → Payment → Execution → Audit**

Mỗi thành phần đều có thể là một bài toán kỹ thuật riêng với giả thuyết và thử nghiệm rõ ràng.

Hướng hành động phù hợp nhất hiện nay:

**Thực hành Verify & Access và Consent từ Workshop #1, dùng Workshop #2 (04/11) để đánh giá khả năng kết hợp Agent Registry với xác minh, authorization và audit, rồi Workshop #3 (09/11) để chốt phần thanh toán.** Sau đó chọn giữa **Verifiable Agent Consent**, **Cross-Organization Agent Trust Gateway** hoặc một hướng khác, và chốt trước **Checkpoint 1 (22/11)**.
