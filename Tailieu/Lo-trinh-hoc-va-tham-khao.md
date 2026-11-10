# Lộ trình học, đọc và tham khảo cho dự án (Hướng C-lite)

> **Ngày soạn:** 09/11/2026
> **Mục đích:** vừa học vừa thi, **ưu tiên kiến thức mới**: những khái niệm nền dùng được lâu dài, không chỉ để qua cuộc thi.
> **Bối cảnh dự án:** C-lite bản kết hợp 4 lớp (xem `Danh-gia-chot-huong-sau-W2-v2.md` và phần trao đổi về bản kết hợp):
> **L1** danh tính agent (badge CIS-8004 + key CIS-8) · **L2** phiếu giao việc do công ty ký (delegation + commitment) · **L3** người duyệt (Verify & Access, consent, credential CIS-4) · **L4** audit anchor.
> **Ký hiệu:** ⭐ nên học sâu (kiến thức mới, giá trị lâu dài) · 🔧 đọc khi cần dùng · ⚠️ lưu ý độ tin cậy hoặc phiên bản

---

## 0. Tóm tắt

1. **Ba mảng kiến thức mới đáng học nhất**, cũng là ba mảng quyết định chất lượng dự án:
   - **Delegation và authorization**: capability, confused deputy, macaroon, UCAN, token exchange. Đây là nền lý thuyết cho L2.
   - **Verifiable credential và ZK selective disclosure**: VC 2.0, commitment, sigma protocol, range proof. Đây là nền cho L3.
   - **Tamper-evident logging**: Merkle tree, Certificate Transparency. Đây là nền cho L4.
2. **Mảng bối cảnh** giúp viết path to production thuyết phục: bức tranh agent identity (OpenID Foundation, Microsoft Entra Agent ID, ERC-8004), an ninh agent (lethal trifecta, OWASP), và EU AI Act về logging.
3. **Docs Concordium** là phần bắt buộc nhưng đọc theo lớp, đúng lúc cần. Không cần đọc hết.
4. **Phát hiện mới khi research:**
   - **Web3 ID chạy trong Concordium Wallet for Web (browser wallet)** theo docs. Như vậy G1 đã có câu trả lời một phần (phía người giữ credential); còn ID App thì chưa rõ.
   - JS SDK đã có `VerificationRequestV1` / `VerifiablePresentationV1`, nên đọc để biết một yêu cầu ghép được những gì.
   - **CIS-8 mới ở trạng thái draft** (tạo 21/05/2026), có thể còn thay đổi.
   - **Trang x402 của Concordium còn mỏng**, chưa có tài liệu facilitator. Đúng như rủi ro đã ghi.

---

## 1. Kiến thức nền mới (ưu tiên cao nhất)

### 1.1 ⭐ Delegation và authorization, nền cho L2 (phiếu giao việc)

Câu hỏi trung tâm của dự án là *"agent được phép làm gì, ai cho phép, thu hồi thế nào"*. Đây là một lĩnh vực có lịch sử lâu, có nhiều bài học đã được đúc kết, và cũng là thứ slide 10 của W2 nói Concordium **chưa** làm.

| Thứ tự | Tài liệu | Học được gì | Áp dụng vào dự án |
|---|---|---|---|
| 1 | **The Confused Deputy** (Norm Hardy, 1988) | Một chương trình có quyền rộng bị lừa dùng quyền đó thay cho kẻ khác | Agent chính là "deputy" điển hình. Đây là lý do gateway của B phải kiểm **phạm vi ủy quyền**, không chỉ kiểm danh tính |
| 2 | **Capability Myths Demolished** (Miller, Yee, Shapiro, 2003) | Khác biệt giữa mô hình ACL ("ai được làm gì") và capability ("ai cầm token thì làm được") | Chọn mô hình cho phiếu giao việc: phiếu là một capability gắn với key của agent |
| 3 | ⭐ [**Macaroons**](https://research.google/pubs/macaroons-cookies-with-contextual-caveats-for-decentralized-authorization-in-the-cloud/) (Google, NDSS 2014) | Token có **caveat**: người giữ chỉ thu hẹp được quyền, không mở rộng được. Xây bằng chuỗi HMAC | Ý tưởng **attenuation**: phiếu giao việc chỉ được thu hẹp (ví dụ chỉ đọc log), không được nới ra |
| 4 | ⭐ [**UCAN spec**](https://github.com/ucan-wg/spec) (v1.0.0-rc.1) | Delegation phi tập trung, chuỗi delegation chính là nhật ký nguồn gốc, có revocation | Mẫu gần nhất cho L2: delegation có chữ ký, thu hẹp được, kiểm tra offline. ⚠️ Còn là release candidate |
| 5 | **OAuth 2.0 Token Exchange, RFC 8693** | Phân biệt **delegation** (claim `act`: agent hành động *thay* ai) và **impersonation** (agent *giả làm* ai) | Thuật ngữ chuẩn khi viết bài và path to production. Agent của dự án là delegation, không phải impersonation |
| 6 | **Rich Authorization Requests, RFC 9396** | Mô tả quyền chi tiết bằng JSON có cấu trúc thay vì chuỗi scope | Gợi ý format cho trường "phạm vi" trong phiếu giao việc |
| 7 | 🔧 **Cedar** (ngôn ngữ policy của AWS, mã nguồn mở) | Viết policy dạng khai báo, có thể phân tích và chứng minh | Có thể dùng làm policy engine cho gateway thay vì tự viết luật bằng if/else |

**Đọc tối thiểu:** 1, 3, 5. Đọc thêm 4 nếu muốn thiết kế L2 thật chặt.

### 1.2 ⭐ Verifiable credential và ZK selective disclosure, nền cho L3

| Thứ tự | Tài liệu | Học được gì | Áp dụng |
|---|---|---|---|
| 1 | ⭐ [**W3C Verifiable Credentials Data Model v2.0**](https://www.w3.org/TR/vc-data-model-2.0/) | Mô hình 3 bên: issuer, holder, verifier; credential, presentation, trạng thái và thu hồi | Credential "kỹ sư của A" ở L3 là một VC. Web3 ID của Concordium đi theo mô hình này. ⚠️ Kết quả tìm kiếm chỉ thấy bản Candidate Recommendation Draft (02/2025); kiểm tra trạng thái hiện tại trên w3.org |
| 2 | **SD-JWT** (IETF OAuth WG) | Selective disclosure bằng hash, không dùng ZK | So sánh để hiểu vì sao ZK của Concordium mạnh hơn (không liên kết được giữa các lần chứng minh) |
| 3 | ⭐ **Commitment** (hash commitment, Pedersen commitment) | "Cam kết" một giá trị mà không lộ nó, sau đó mở ra để kiểm tra | **Dùng trực tiếp** cho trường "kỹ sư phụ trách" trong phiếu giao việc (L2). Account Concordium cũng lưu thuộc tính danh tính dưới dạng Pedersen commitment (W1) |
| 4 | **Sigma protocol, range proof**: Boneh & Shoup, *A Graduate Course in Applied Cryptography* (sách miễn phí), chương về sigma protocol | Cách chứng minh "tôi biết bí mật" hoặc "giá trị nằm trong khoảng" mà không lộ giá trị | Hiểu proof "trên 18 tuổi" thật sự làm gì ở bên dưới. Đọc phần ý tưởng, không cần đọc chứng minh |
| 5 | Cảnh báo của CTO ở W1 về câu hỏi quá hẹp | ZK chỉ bảo vệ trong phạm vi mệnh đề được hỏi | Gateway không được hỏi những câu làm lộ danh tính kỹ sư |

**Đọc tối thiểu:** 1 (phần mô hình và thuật ngữ), 3.

### 1.3 ⭐ Tamper-evident logging, nền cho L4 (audit)

| Tài liệu | Học được gì | Áp dụng |
|---|---|---|
| ⭐ **Certificate Transparency v2, RFC 9162** | Log chỉ ghi thêm, dùng Merkle tree; *inclusion proof* (bản ghi có trong log) và *consistency proof* (log không bị viết lại) | Thay vì neo từng bản ghi audit, có thể gom nhiều bản ghi vào Merkle tree rồi **chỉ neo root**: rẻ hơn, và vẫn chứng minh được từng bản ghi |
| **Efficient Data Structures for Tamper-Evident Logging** (Crosby & Wallach, USENIX Security 2009) | Nền lý thuyết của log chống sửa | Đọc nếu muốn hiểu sâu |
| Verify & Access audit anchor (W1 [29:40–32:46]) | Cách Concordium làm: hash log neo on-chain | Mẫu cơ bản cho L4 |

Nhớ phân biệt **data integrity** (dữ liệu không bị sửa sau khi neo) với **data correctness** (dữ liệu đúng ngay từ đầu). Phân biệt này đã ghi trong báo cáo W1.

---

## 2. Bối cảnh ngành, dùng cho path to production

### 2.1 Bức tranh agent identity

| Tài liệu | Vì sao cần đọc |
|---|---|
| ⭐ [**Identity Management for Agentic AI**](https://openid.net/new-whitepaper-tackles-ai-agent-identity-challenges/) (OpenID Foundation, 10/2025, [arXiv 2510.25819](https://arxiv.org/html/2510.25819v1)) | Lập luận rằng OAuth/OIDC hiện tại **không đủ cho agent xuyên tổ chức**; delegation cần luồng *on-behalf-of* rõ ràng; cảnh báo chuỗi sub-agent không có cơ chế thu hẹp quyền. **Đây chính là khoảng trống Hướng C lấp vào.** Nên trích trong bài nộp |
| [**Authenticated Delegation and Authorized AI Agents**](https://arxiv.deeppaper.ai/papers/2501.09674v1) (arXiv 2501.09674) | Đề xuất mở rộng OAuth/OIDC với credential cho agent, cho delegation có xác thực, có ủy quyền và có kiểm toán. Rất gần với thiết kế L2 |
| [**Microsoft Entra Agent ID**](https://learn.microsoft.com/en-us/entra/agent-id/what-are-agent-identities) | Đối thủ lớn nhất. Agent identity là một service principal đặc biệt, có blueprint và vòng đời. **Chỉ trong một tenant** (single-tenant). Đây là điểm để khẳng định lợi thế xuyên tổ chức của Concordium |
| **ERC-8004** (eips.ethereum.org) | Chuẩn mà CIS-8004 dựa vào. Nắm khác biệt: Concordium có danh tính ở tầng protocol nên không cần reputation registry (W2 [12:41–13:02]) |
| [**The Concordium Agent Registry Is Live**](https://www.concordium.com/article/the-concordium-agent-registry-is-live-the-accountability-layer-erc-8004-doesnt-have) | Cách Concordium tự định vị so với ERC-8004 |
| KYA, AP2, Visa TAP | Đã tóm tắt trong `Tong-hop-Workshop01-va-Hackathon.md` mục 5. Ý chính: *AP2 trả lời "agent được chi gì", KYA trả lời "agent là ai"* |

### 2.2 An ninh của agent

| Tài liệu | Vì sao cần đọc |
|---|---|
| ⭐ **The lethal trifecta** (Simon Willison, simonwillison.net, 06/2025) | Agent nguy hiểm khi cùng lúc có dữ liệu riêng tư, nội dung không tin cậy và khả năng gửi dữ liệu ra ngoài. Một đội thi khác (Trifecta Checker) xây quanh ý này. Đọc để hiểu đối thủ và để gateway của bạn nói được *vì sao* thao tác rủi ro cần người duyệt |
| **OWASP: Agentic AI Threats and Mitigations** và **OWASP Top 10 for LLM Applications** | Danh mục mối đe dọa có tên gọi chuẩn (prompt injection, excessive agency…). Dùng cho phần trust model trong `docs/architecture.md` |

### 2.3 EU AI Act về logging (chủ đề W4, 11/11)

| Điều | Nội dung | Áp dụng |
|---|---|---|
| [**Điều 12**](https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-12) | Hệ thống AI rủi ro cao phải **có khả năng tự động ghi log** suốt vòng đời. Log phục vụ phát hiện rủi ro, giám sát sau khi đưa ra thị trường, và giám sát vận hành | L4 giúp *deployer* (công ty B) có log chống sửa |
| Điều 19 | Nghĩa vụ lưu log của **provider** | |
| Điều 26(6) | **Deployer** phải lưu log do hệ thống tạo ra **ít nhất 6 tháng** | Câu chuyện bán hàng cho B: "audit trail của bạn có bằng chứng on-chain" |

⚠️ Chưa có tiêu chuẩn kỹ thuật chính thức cho logging theo Điều 12 (các bản nháp prEN 18229-1 và ISO/IEC DIS 24970 đang soạn). Ngày áp dụng cho nhóm rủi ro cao còn tranh luận. **Chỉ nói "hướng tới hỗ trợ tuân thủ", không nói "đạt chuẩn EU AI Act".** Dẫn văn bản gốc trên EUR-Lex hoặc AI Act Service Desk, không dẫn blog của vendor.

---

## 3. Giao thức agent

| Tài liệu | Ưu tiên | Áp dụng |
|---|---|---|
| ⭐ **A2A Protocol specification** (a2a-protocol.org, repo `a2aproject/A2A`) | Cao | Agent Card, `securitySchemes`, **card có chữ ký**. Badge Concordium nằm trong `capabilities.extensions` của card. Bên thứ ba cảnh báo card có thể bị giả, nên cần kiểm tra chữ ký: đây chính là chỗ CIS-8004 + hash on-chain phát huy tác dụng. ⚠️ Kiểm tra trường cụ thể trên spec gốc |
| ⭐ [**MCP Authorization**](https://modelcontextprotocol.io/specification/draft/basic/authorization) | Cao nếu gateway là MCP server | MCP server đóng vai OAuth 2.1 resource server; dùng Protected Resource Metadata (RFC 9728). ⚠️ Có nhiều phiên bản spec (2025-03-26, 2025-06-18, 2026-07-28, draft) với yêu cầu khác nhau; chọn đúng phiên bản |
| Agent Registry MCP (40 tool) | Cao | `agent-registry-mcp.concordium.com/mcp`, xem docs MCP service ở mục 4 |

W6 (18/11) sẽ nói về MCP và A2A. Đọc A2A spec trước để hỏi được câu cụ thể.

---

## 4. Docs Concordium theo từng lớp

### L1: Danh tính agent

- 🔧 [Agent Registry](https://docs.concordium.com/en/mainnet/technical-reference/agent-registry/index.html) (tổng quan; mainnet CIS-8 `<10081,0>`, CIS-8004 `<10082,0>`)
- 🔧 [CIS-8004: Agent Registry](https://docs.concordium.com/en/mainnet/technical-reference/agent-registry/cis-8004.html)
- ⭐ [CIS-8: External Key Registry](https://docs.concordium.com/en/mainnet/technical-reference/agent-registry/cis-8.html) và [bản proposal](https://proposals.concordium.com/CIS/cis-8.html). Đọc kỹ phần canonical bytes và luồng ký, vì đây là nền của challenge–response. ⚠️ Còn là draft (tạo 21/05/2026)
- 🔧 Verified badge reference và MCP service: link trong `Bao-cao-Workshop02.md`
- 🔧 Registry testnet: `testnet-agent-registry.concordium.com`

### L2: Phiếu giao việc

- Không có primitive sẵn (slide 10 W2), nên dùng kiến thức ở mục 1.1 và 1.2.
- 🔧 Nếu tự viết contract để lưu và thu hồi phiếu: [Smart contract quick start](https://docs.concordium.com/en/mainnet/tutorials/quick-start.html), [piggy bank tutorial](https://docs.concordium.com/en/mainnet/tutorials/piggy-bank/writing.html), [`concordium-std`](https://docs.rs/concordium-std), repo [`concordium-rust-smart-contracts`](https://github.com/Concordium/concordium-rust-smart-contracts). ⚠️ Phiên bản `concordium-std` và `cargo-concordium` phải khớp nhau; không build bản deploy với feature `debug`.

### L3: Người duyệt

- ⭐ [Verify & Access: How it works](https://docs.concordium.com/en/mainnet/docs/concordium-id/verify-and-access/how-it-works.html) và [Additional steps](https://docs.concordium.com/en/mainnet/tutorials/verify-access/additional-steps.html)
- ⭐ [Web3 ID: Identity on Concordium](https://docs.concordium.com/en/mainnet/how-to/web3-id/index.html), [Issuers](https://docs.concordium.com/en/mainnet/how-to/web3-id/issuer.html), [Create proofs](https://docs.concordium.com/en/mainnet/how-to/web3-id/create-proofs.html), [Web3 ID trong Wallet for Web](https://docs.concordium.com/en/mainnet/docs/guides/wallet.html)
- ⭐ [CIS-4: Credential Registry Standard](https://proposals.concordium.com/CIS/cis-4.html): `credentialEntry`, trạng thái, `issuer`, thu hồi bằng chữ ký
- 🔧 [JS SDK: Verifiable presentations](https://docs.concordium.com/concordium-node-sdk-js/12.0.0/pages/verifiable-presentations.html) (`VerificationRequestV1`, `VerifiablePresentationV1`). ⚠️ Tên API khác nhau giữa các phiên bản 11.x và 12.x
- 🔧 Hosted verifier của Concordium: tiện, nhưng docs ghi rõ dùng nó nghĩa là **tin Concordium** khi kiểm proof. Để thể hiện integration depth, nên tự chạy verifier.

### L4: Audit

- Audit anchor trong Verify & Access (link ở L3), cộng với mục 1.3.
- Chờ W4 (11/11) cho phần "EU AI Act audit trails".

### Mở rộng: thanh toán (W3, 09/11)

- 🔧 [Concordium x402 integration](https://docs.concordium.com/en/mainnet/docs/integration/x402%20integration/x402-integration.html). ⚠️ Trang còn mỏng, phần "Executing Payment and Access" chưa có nội dung, chưa có docs facilitator
- 🔧 [x402: Facilitator](https://docs.x402.org/core-concepts/facilitator) (docs chung, không riêng Concordium)
- 🔧 `@concordium/wdk-wallet-concordium` cho sponsored PLT (phương án dự phòng)

---

## 5. Lịch học đề xuất

Nguyên tắc: **học khái niệm trước buổi workshop liên quan, đọc docs đúng lúc build lớp đó.**

| Thời gian | Học | Mục |
|---|---|---|
| **09–11/11** (trước W4) | ⭐ Confused Deputy · ⭐ Macaroons · RFC 8693 phần delegation và impersonation · ⭐ Certificate Transparency (phần Merkle tree, inclusion proof) · EU AI Act Điều 12 và 26(6) | 1.1, 1.3, 2.3 |
| **12–15/11** | ⭐ VC Data Model 2.0 (mô hình, thuật ngữ) · ⭐ Commitment · Docs Web3 ID và CIS-4 (để chốt G1) · OpenID Foundation whitepaper | 1.2, 2.1, 4 (L3) |
| **16–18/11** (trước W6) | ⭐ A2A spec · MCP Authorization · UCAN · lethal trifecta và OWASP agentic | 1.1, 2.2, 3 |
| **19/11 → build** | Docs Concordium theo thứ tự build L1 → L2 → L4 → L3 · Cedar nếu dùng làm policy engine · Rust contract nếu cần | 4 |
| Song song | Sigma protocol và range proof (Boneh & Shoup) khi có thời gian | 1.2 |

---

## 6. Từ học đến bài nộp

| Kiến thức | Thể hiện ở đâu trong bài nộp |
|---|---|
| Confused deputy, delegation khác impersonation | `README.md` phần *The problem*; `docs/architecture.md` phần trust model |
| Macaroon / UCAN (attenuation) | Thiết kế phiếu giao việc L2 |
| Commitment | Trường kỹ sư phụ trách trong L2: ẩn danh nhưng mở ra được khi có tranh chấp |
| VC / Web3 ID / CIS-4 | Lớp L3 |
| Merkle tree / CT | L4: neo root thay vì từng bản ghi |
| OpenID whitepaper, Entra Agent ID | `docs/path-to-production.md`: khoảng trống của thị trường và đối thủ |
| EU AI Act Điều 12, 26(6) | `docs/path-to-production.md`: động lực compliance của khách hàng B |
| Lethal trifecta, OWASP | Lý do vì sao thao tác rủi ro cần người duyệt |

---

## Nguồn đã kiểm tra khi soạn

- Concordium: [Agent Registry](https://docs.concordium.com/en/mainnet/technical-reference/agent-registry/index.html) · [CIS-8 docs](https://docs.concordium.com/en/mainnet/technical-reference/agent-registry/cis-8.html) · [CIS-8 proposal](https://proposals.concordium.com/CIS/cis-8.html) · [CIS-8004](https://docs.concordium.com/en/mainnet/technical-reference/agent-registry/cis-8004.html) · [CIS-4](https://proposals.concordium.com/CIS/cis-4.html) · [Web3 ID](https://docs.concordium.com/en/mainnet/how-to/web3-id/index.html) · [Web3 ID issuers](https://docs.concordium.com/en/mainnet/how-to/web3-id/issuer.html) · [Create proofs](https://docs.concordium.com/en/mainnet/how-to/web3-id/create-proofs.html) · [Wallet for Web và Web3 ID](https://docs.concordium.com/en/mainnet/docs/guides/wallet.html) · [Verify & Access how it works](https://docs.concordium.com/en/mainnet/docs/concordium-id/verify-and-access/how-it-works.html) · [JS SDK verifiable presentations](https://docs.concordium.com/concordium-node-sdk-js/12.0.0/pages/verifiable-presentations.html) · [x402 integration](https://docs.concordium.com/en/mainnet/docs/integration/x402%20integration/x402-integration.html) · [Smart contract quick start](https://docs.concordium.com/en/mainnet/tutorials/quick-start.html) · [concordium-std](https://docs.rs/concordium-std) · [concordium-rust-smart-contracts](https://github.com/Concordium/concordium-rust-smart-contracts) · [Agent Registry is live](https://www.concordium.com/article/the-concordium-agent-registry-is-live-the-accountability-layer-erc-8004-doesnt-have)
- Authorization: [Macaroons (Google Research)](https://research.google/pubs/macaroons-cookies-with-contextual-caveats-for-decentralized-authorization-in-the-cloud/) · [UCAN spec](https://github.com/ucan-wg/spec)
- Agent identity: [OpenID Foundation whitepaper](https://openid.net/new-whitepaper-tackles-ai-agent-identity-challenges/) · [arXiv 2510.25819](https://arxiv.org/html/2510.25819v1) · [Authenticated Delegation and Authorized AI Agents](https://arxiv.deeppaper.ai/papers/2501.09674v1) · [Microsoft Entra Agent ID](https://learn.microsoft.com/en-us/entra/agent-id/what-are-agent-identities)
- Giao thức: [MCP Authorization](https://modelcontextprotocol.io/specification/draft/basic/authorization) · [A2A security schemes (docs.rs)](https://docs.rs/a2a-protocol-types/0.3.1/a2a_protocol_types/security) · [x402 facilitator](https://docs.x402.org/core-concepts/facilitator)
- Credential: [W3C VC Data Model v2.0](https://www.w3.org/TR/vc-data-model-2.0/)
- EU AI Act: [Điều 12 (AI Act Service Desk)](https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-12) · [Help Net Security: logging requirements](https://www.helpnetsecurity.com/2026/04/16/eu-ai-act-logging-requirements/)
- Các tài liệu kinh điển (Confused Deputy, Capability Myths Demolished, RFC 8693, RFC 9396, RFC 9162, Crosby & Wallach, Boneh & Shoup, lethal trifecta, OWASP, Cedar) chưa mở lại khi soạn; tìm theo tên.
