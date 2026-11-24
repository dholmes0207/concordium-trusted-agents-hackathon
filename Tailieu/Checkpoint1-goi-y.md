# Gợi ý điền Checkpoint 1: Create your project, add your team & share your idea

> **Soạn ngày:** 20/11/2026.
> **Hạn:** ~~CN 22/11~~ → **đã lùi sang T4 25/11, 23:59 UTC = 06:59 sáng T5 26/11 giờ VN** (dashboard, xem 24/11).
> ✅ **Đã nộp Checkpoint 1 ngày 24/11** (sửa được qua "View / Edit Submission").
> **Cập nhật 24/11 (trước khi nộp):** project **Mandate Gate** đã tạo, có 2 thành viên, Discord đã kết nối. **Còn thiếu:** chọn challenge (Add Challenge) và điền ô **"Challenge"** (2–3 câu) rồi bấm **Submit Now**. Nội dung copy ở `~/hackathon-private/Discord/Tong-hop-Discord-20-24-11.md` (chỉ lưu ở máy), mục 6.
> **Nơi điền:** encodeclub.com → My Dashboard → Concordium Trusted Agents Hackathon (trang `my-programmes/concordium-trusted-agents-hackathon`) → khung **"Join or Create a Project"**.
> **Tình trạng 20/11 (đã kiểm bằng Claude in Chrome, chỉ xem):** bạn **chưa tạo project**; Discord **đã kết nối**; ô checkpoint ghi *"No submission requirements set for this checkpoint"*.
> Mình không điền hay bấm "Create Project" thay bạn. Bạn copy nội dung dưới đây và tự tạo.

---

## 1. Form có những trường nào

| Trường | Bắt buộc | Gợi ý |
|---|---|---|
| **Project Name** | Có | Xem mục 2 |
| **Description** | Không (nhưng Checkpoint 1 yêu cầu "share your idea") | Xem mục 3. Viết tiếng Anh, vì giám khảo đọc tiếng Anh |
| **Project Image** | Không | JPG / PNG / GIF. Có thể để trống; nếu muốn, dùng một sơ đồ đơn giản "Agent → Gateway → Concordium" |

Sau khi tạo project, trang sẽ có **mã mời đội (Team Join Code)**. Gửi mã này cho đồng đội để họ vào mục **"Join an Existing Project"** và nhập mã. Không đăng mã lên kênh công khai.

---

## 2. Tên project (chọn một)

| Tên | Ý nghĩa | Nhận xét |
|---|---|---|
| ⭐ **MandateGate** | "Cổng" kiểm tra **ủy quyền** (mandate) của agent trước khi cho thao tác | Ngắn, nói đúng lõi dự án (L2 work order + gateway). **Khuyến nghị** |
| AgentPass Gateway | Agent phải có "giấy thông hành" mới qua cổng | Dễ hiểu, hơi chung chung |
| Accountable Ops Agent | Nhấn mạnh agent DevOps có trách nhiệm giải trình | Khớp chữ "Accountable" trong brief, nhưng dài |

Có thể đổi tên sau khi tạo project.

---

## 3. Mô tả (copy, tiếng Anh)

### Bản ngắn (khoảng 110 từ, khuyến nghị cho Checkpoint 1)

```text
MandateGate lets a company's AI DevOps agent act on a customer's infrastructure without the
customer trusting it blindly. Every tool call goes through the customer's gateway, which checks
on Concordium testnet that:
1) the agent is registered in the Agent Registry, carries a valid Verified by Concordium badge,
   and signs each request with its CIS-8-bound key (an EVM key, so the same agent keeps one
   identity across chains);
2) the agent's owner issued a signed, revocable work order, anchored on-chain with Register Data;
3) risky actions (deploy, delete) are approved by a named engineer for that exact action, with a
   Concordium ID / Verify & Access proof that reveals no personal data.
Every request, decision, approval and execution is logged off-chain and anchored on-chain,
following EU AI Act Article 12 record-keeping purposes.
```

### Thêm một dòng trạng thái (tùy chọn)

```text
Status: design and verification spikes done; building on Concordium testnet since 19 Nov.
Team: 2 builders.
```

Chỉ ghi "spikes done" nếu các spike S0–S3 đã thật sự chạy. Nếu chưa, dùng:

```text
Status: design done; building on Concordium testnet from 19 Nov.
```

### Vì sao viết như vậy

| Câu trong mô tả | Khớp với gì của ban tổ chức |
|---|---|
| "AI DevOps agent… customer's infrastructure" | *Usefulness*: vấn đề thật, người dùng thật (nhà cung cấp dịch vụ vận hành và khách hàng doanh nghiệp) |
| Agent Registry, badge, CIS-8, Verify & Access, Register Data | *Depth of integration*: dùng danh tính, Agent Registry; Piotr: *"the more the better"* |
| "EVM key… one identity across chains" | Piotr (16–19/11): Concordium tìm *"the cross-chain/external aspect"* |
| "approved by a named engineer for that exact action" | W6: *"the agent spends only after a human unlocks"*; W4: audit là bằng chứng sau sự việc, còn gateway là chốt chặn trước |
| "EU AI Act Article 12 record-keeping purposes" | Hướng "Accountable agents" trong brief. Không ghi "compliant" (W4 nhắc chỉ hệ thống rủi ro cao mới thuộc diện) |

---

## 4. Thêm đồng đội

1. Bạn tạo project trước.
2. Trang project hiện **Team Join Code**. Gửi riêng cho đồng đội.
3. Đồng đội đăng nhập Encode, mở trang programme, vào **"Join an Existing Project"**, nhập mã, bấm **"Join Project"**.
4. Đồng đội nên **kết nối Discord** ở cùng trang (mục "Discord Integration") để nhận role và vào kênh của hackathon.
5. Có thể thêm người sau Checkpoint 1; thể lệ ghi "add your team (or go solo)".

---

## 5. Sau khi tạo project

- [ ] Mở lại trang dashboard, kiểm tra ô Checkpoint 1/2 đã nhận project chưa.
- [ ] Gửi mã mời cho đồng đội; đồng đội vào được project.
- [ ] Ghi tên project chính thức vào `README.md` của repo (mình làm khi bạn chốt tên).
- [ ] (Tùy chọn) Đăng 2–3 dòng giới thiệu ở #general hoặc #team-formation. Không bắt buộc.

**Checkpoint 2/2 (nộp bài cuối, hạn 06:59 sáng T5 10/12 giờ VN)** gồm các ô: Description · Code · Demo Video · Testnet link · Which Concordium (components) · Your path to mainnet · Slides (tùy chọn) · Live Demo (tùy chọn).
