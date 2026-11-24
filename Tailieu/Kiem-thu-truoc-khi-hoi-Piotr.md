# Tự kiểm trước khi trả lời `@here` của Piotr (24/11/2026)

> Piotr hỏi (24/11, 20:34 giờ VN): ai cần facilitator x402 testnet, ai cần EurQ testnet, còn câu hỏi nào bị sót.
> Mục tiêu: tự kiểm những gì kiểm được, chỉ hỏi Piotr phần thật sự cần đội Concordium.
> Cách kiểm: đọc chain testnet bằng `@concordium/web-sdk` 12.0.3 (chỉ đọc), đọc mã và README của `@x402/concordium` 2.32.0, gọi REST công khai của Agent Registry vài lần. Không dùng key, không gửi giao dịch.

---

## 1. Kết quả

| Câu hỏi | Kết quả tự kiểm | Còn cần Piotr? |
|---|---|---|
| **Facilitator x402 testnet** | ✅ **Tự chạy được.** Gói `@x402/concordium` có đủ client, server, facilitator. Facilitator nhận giao dịch V1 sponsored do client ký, kiểm 9 luật (đúng người gửi, đúng sponsor, đúng người nhận, đúng số tiền, đúng loại tài sản, hạn ≤ 10 phút, chữ ký, chỉ một thao tác…), ký phần sponsor, gửi và chờ finalized. Testnet: `ccd:4221332d34e1694168c2a0c0b3fd0f27`, `grpc.testnet.concordium.com:20000`. Chỉ cần **một account testnet có CCD làm facilitator** (trả phí thay) | **Không**, trừ khi muốn dùng facilitator hosted cho tiện |
| **Trả bằng gì** | ✅ x402 Concordium hỗ trợ **CCD** và **PLT**. Dùng CCD test là đủ cho demo | Không |
| **EURQ trên testnet** | ⚠️ EURQ (Quantoz) testnet chỉ có **tổng cung 1.000 EURQ**, nằm ở account governance, **không có allow-list** (chỉ deny-list) → chỉ người giữ governance chuyển cho được | **Có**, nếu muốn trả bằng EUR. Phương án khác: **EUDemo** (có allow-list, xin ở `allowlist.testnet.concordium.com`, cần proof quốc tịch EU; testnet IdP cho khai quốc tịch tùy ý), hoặc **EURR / USDR** (StablR, cung lớn, không allow-list, nhưng không có faucet công khai) |
| **Rate limit MCP hosted** | ✅ REST hoạt động **không cần xác thực**: `GET agent-registry-mcp.concordium.com/v1/check-badge/<account hoặc badge>?network=testnet` trả đủ 15 phép kiểm (`hash_matches_on_chain`, `owner_matches`, `contracts_match`…). 5 lần gọi `/healthz` cách nhau 1 giây đều 200, **không có header báo giới hạn**. Không thử gọi dồn để tìm ngưỡng | Chỉ nếu muốn biết con số. Gateway vẫn đọc chain trực tiếp và cache, nên không phụ thuộc |
| **V&A V1 nhận loại claim nào** | ✅ Trong SDK, `SubjectClaims = IdentityClaims` (khớp câu trả lời Q1). Nhưng mỗi claim có `source: 'identityCredential' \| 'accountCredential'`: **giao thức cho phép proof gắn account** | Không |
| **Proof lộ định danh nào (G2)** | ✅ Proof **gắn identity**: `credentialSubject.id` là *"identity disclosure information also acts as ephemeral ID"* → **ID tạm thời, không ổn định**, không gắn được với người cụ thể. Proof **gắn account**: `credentialSubject.id` là **DID của account credential** (ổn định) → dùng được cho commitment trong phiếu giao việc (AB3) | Không |
| **Chỗ đặt digest `D` và câu consent** | ✅ Context V1 có các nhãn `ContextString`, `ResourceID`, `ConnectionID`, `Nonce`, `BlockHash`, `PaymentHash`; SDK có `createSimpleContext(nonce, connectionId, resourceId, contextString?)`. Đặt `ResourceID = D`, `ContextString` = câu mô tả hành động | Không |
| **Browser Wallet có trả lời yêu cầu V1 gắn account không, và hiện gì cho người dùng** | ⏳ **Chưa kiểm được** (cần ví của bạn) | **Chỉ hỏi nếu tự thử thất bại** (mục 2) |

## 2. Việc bạn tự thử (khoảng 10 phút): spike S3a rút gọn

Dùng Proof Explorer testnet giống demo W5, không cần code:

1. Mở `web3id-proof-explorer.testnet.concordium.com`, kết nối **Browser Wallet** ở chế độ **testnet**.
2. Chọn luồng **Verify & Access mới (có anchor)**, loại nguồn **Account** (không phải Identity).
3. Thêm một statement, ví dụ "reveal firstName" hoặc "age ≥ 18".
4. Nếu trang cho điền context: đặt **ResourceID** = một chuỗi dễ nhận, ví dụ `deploy.prod:svc:payments:test1`.
5. Bấm tạo proof. **Chụp màn hình popup của ví**: ví có hiện ResourceID / context không, hiện câu chữ gì.
6. Sau khi có proof: bấm xem proof, **Copy Raw Data**, dán vào file `~/ccd-proof-test.json` (ngoài repo). Không dán seed phrase hay key.
7. Gửi mình ảnh chụp và nói file đã lưu; mình đọc và ghi kết quả vào checklist.

| Kết quả | Ý nghĩa | Tuyến phê duyệt |
|---|---|---|
| Ví trả lời được proof gắn account **và** hiện context | Tốt nhất | MVP-C: `D` trong proof, `credId` mở commitment |
| Ví trả lời được nhưng **không hiện** context | Được, nhưng gọi là "approval evidence" | MVP-C, trang của A hiển thị hành động |
| Ví **không** trả lời được proof gắn account | Chỉ có proof gắn identity (ID tạm thời) | MVP-T (Approval Service của A) → lúc đó mới hỏi Piotr |

## 3. Tin trả lời Piotr (rút gọn sau khi tự kiểm)

Chỉ hỏi phần thật sự cần. Chọn một trong hai:

**A. Nếu muốn trả phí bằng EUR (D4 = x402 với EURQ):**

```text
Hi @Piotr from Concordium, Mandate Gate here. We'll run our own x402 facilitator with
@x402/concordium, so no API key needed. Could we get a small amount of EURQ on testnet
for one account? We'll DM you the address. Thanks!
```

**B. Nếu trả bằng CCD test:** không cần trả lời `@here`; chỉ đăng khi spike S3a ở mục 2 thất bại:

```text
Hi @Piotr from Concordium, Mandate Gate here. Does the Concordium Wallet for Web answer
Verify & Access V1 requests with accountCredential claims? We tried the testnet proof
explorer and <describe what happened>. Thanks!
```

Địa chỉ ví gửi qua DM, không đăng công khai.
