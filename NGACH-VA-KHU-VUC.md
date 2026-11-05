# Chọn ngách và khu vực cho kênh YouTube (không giới hạn ở hoạt hình)

Ngày 05/11/2026. Viết cho bạn (chủ kênh).
**[Nguồn]** = có trích dẫn (phần lớn là blog hoặc công cụ phân tích bên thứ ba; số liệu doanh thu dao động rất mạnh giữa các nguồn). **[Đề xuất]** = ý kiến của tôi.
Doanh thu thật của kênh chỉ biết được trong YouTube Studio, mục Doanh thu theo khu vực địa lý. Mọi con số dưới đây chỉ để **so sánh tương đối**.

---

## 1. Hai yếu tố quyết định doanh thu: ngách và khu vực

**Theo ngách** [Nguồn: blog niche/RPM 2026, số liệu không đồng nhất]
RPM là số tiền kênh nhận được trên 1.000 lượt xem.

| Ngách | RPM ước tính (USD / 1.000 lượt xem) | Ghi chú |
|---|---|---|
| Tài chính cá nhân, đầu tư | ~15–30 | Cao nhất, nhưng thuộc nhóm nội dung "ảnh hưởng tới tiền bạc", phải cực kỳ chính xác |
| Kinh doanh, case study doanh nghiệp | ~8–20 | |
| Công nghệ, AI (giải thích, hướng dẫn) | ~5–12 | Cạnh tranh cao, thay đổi nhanh |
| Lịch sử, địa lý bằng hoạt hình hoặc bản đồ | khá cao (được xếp nhóm trên) | Kiểu "phim tài liệu" đã bão hoà trong giới kênh tự động hoá |
| Hoạt hình nói chung | ~7 (một nguồn) | Trẻ em thì thấp hơn nhiều |
| Truyện kinh dị | ~4–8, nhưng lượt xem lớn | |

**Theo khu vực của người xem** [Nguồn: blog CPM/RPM theo quốc gia]

| Khu vực / ngôn ngữ | RPM ước tính | Quy mô |
|---|---|---|
| Mỹ (tiếng Anh) | ~7,5–12 | Cao nhất; tiếng Anh còn kéo được người xem ở Anh, Canada, Úc |
| Đức | ~6–10,5 | Cần tiếng Đức |
| Nhật | tầm trung (CPM ~3–15, nguồn gộp) | Chưa có số riêng đáng tin |
| Brazil | tầm trung–thấp | Shorts đang bùng nổ (5 kênh Brazil trong top 50 thế giới, 1/2026) |
| Mexico / Mỹ Latinh | thấp (CPM ~1,5–1,8 cho nội dung chung) | Khán giả tiếng Tây Ban Nha rất đông |
| Ấn Độ | rất thấp (RPM < 1) | Chiếm ~24% khán giả Shorts toàn cầu |
| Indonesia, Việt Nam | nhóm thấp nhất | |

**Kết luận [Đề xuất]:** muốn doanh thu cao thì **tiếng Anh + ngách giải thích (kinh doanh / kinh tế / công nghệ / "cái này hoạt động thế nào")**. Các thị trường đông như Ấn Độ, Indonesia, Mỹ Latinh cho lượt xem nhiều nhưng tiền ít.

---

## 2. Bộ công cụ hiện có hợp với ngách nào

Bộ Lemo-Opuscar có 66 phong cách; nhóm hợp với ngách thu cao:

| Phong cách có sẵn | Hợp với ngách |
|---|---|
| **Data Storytelling** (kể chuyện bằng dữ liệu), **Data Physicalization** (dữ liệu thành vật thể: chồng xu, khối) | Kinh tế, tài chính, kinh doanh |
| **Exploded Teardown** (mổ xẻ sản phẩm), **Glass Product Render**, **Blueprint** (bản vẽ kỹ thuật) | "Bên trong một món đồ có gì", kỹ thuật, công nghệ |
| **Isometric Infographic** | Quy trình, chuỗi cung ứng, "nhà máy làm ra X như thế nào" |
| **Satellite Briefing**, **Transit Map**, **Archive Light Table** | Địa lý, lịch sử, hạ tầng (lưu ý luật vẽ bản đồ của thư viện, mục 5) |
| **Dark Tech Keynote**, **Living Screencast** | Công nghệ, AI, phần mềm |
| **Visual Investigation**, **Halftone Dossier** | Phân tích sự kiện, "hồ sơ" doanh nghiệp, bí ẩn |

**Lợi thế kỹ thuật lớn nhất của tiếng Anh** [Đã thấy trên máy bạn]:
- Giọng đọc **Kokoro tiếng Anh** chạy offline, giấy phép Apache 2.0, nhiều giọng tự nhiên. Tốt hơn hẳn 2 giọng tiếng Nhật của edge-tts.
- Kiểm tra giọng bằng Whisper tiếng Anh, so khớp từng từ, chính xác hơn tiếng Nhật.
- Tôi viết và kiểm tra kịch bản tiếng Anh ở mức bản ngữ. Tiếng Nhật thì vẫn cần người bản ngữ đọc lại.
- Lưu ý: Kokoro cần Python 3.12 hoặc 3.13 (máy bạn đang có 3.14). Cài thêm một bản Python là xong.

---

## 3. Ba hướng kênh đề xuất (xếp theo thứ tự tôi khuyên)

### A. "The economics of everyday things": kinh tế của đồ vật thường ngày  ⭐
- **Nội dung:** mỗi video trả lời một câu hỏi đời thường bằng số liệu thật. Ví dụ: vì sao vé máy bay rẻ hơn khi đặt sớm, một ly cà phê 5 USD thì tiền đi đâu, vì sao siêu thị đặt sữa ở cuối cửa hàng, vì sao giá trứng tăng.
- **Ngách:** kinh doanh + kinh tế, RPM thuộc nhóm cao, **không phải lời khuyên đầu tư** nên ít rủi ro pháp lý hơn tài chính cá nhân.
- **Phong cách nhà:** Data Storytelling + Data Physicalization (đồng xu, hộp, khối dữ liệu). Chọn **một** phong cách làm thương hiệu.
- **Định dạng:** video dài 8–12 phút là sản phẩm chính (giờ xem, tiền quảng cáo); 2–3 Shorts cắt từ mỗi video để kéo người xem.
- **Vì sao hợp:** mỗi video là một nghiên cứu mới (quy trình FACTS.md có nguồn cho từng con số mà tôi đã làm với tập "tóc anime"), nên khó bị coi là sản xuất hàng loạt. Nội dung không lỗi thời, xem lại được lâu.

### B. "How it's made / What's inside": bên trong một món đồ
- **Nội dung:** mổ xẻ từng món đồ (bút bi, khoá cửa, tai nghe, thang máy) và giải thích cơ chế.
- **Ngách:** khoa học, kỹ thuật, công nghệ (RPM tầm trung–cao).
- **Phong cách:** Exploded Teardown / Blueprint, hình rất đẹp và rất đặc trưng.
- **Rủi ro:** không được vẽ logo hay thương hiệu thật (luật của thư viện), nên chỉ vẽ sản phẩm "chung chung".

### C. "Business case files": hồ sơ doanh nghiệp
- **Nội dung:** câu chuyện thành công hoặc thất bại của một ngành hay một mô hình kinh doanh.
- **Ngách:** RPM ~8–20.
- **Phong cách:** Halftone Dossier hoặc Visual Investigation.
- **Rủi ro:** kể về công ty thật thì được nêu tên trong lời thoại, nhưng **không dùng logo hay hình ảnh thương hiệu** (luật của thư viện), và phải dẫn nguồn chặt.

**Hoạt hình anime (Yuzu, thám tử) [Đề xuất]:** giữ làm dự án phụ hoặc kênh thứ hai sau khi kênh chính đã ổn, đúng như bạn nhận xét về doanh thu.

---

## 4. So sánh nhanh

| | A. Kinh tế đồ vật | B. Bên trong món đồ | C. Hồ sơ doanh nghiệp | Anime thám tử (JP) |
|---|---|---|---|---|
| RPM ước tính | cao | trung–cao | cao | thấp–trung |
| Hợp công cụ sẵn có | rất hợp | rất hợp | hợp | hợp |
| Giọng đọc | Kokoro EN (tốt) | Kokoro EN | Kokoro EN | 2 giọng edge-tts / VOICEVOX |
| Rủi ro "nội dung lặp lại" | thấp nếu nghiên cứu thật | thấp | thấp | trung bình |
| Rủi ro sai thông tin | trung bình (cần nguồn) | thấp | cao (công ty thật) | gần như không |
| Công sức mỗi video | cao (video dài + nghiên cứu) | cao | cao | trung bình |

---

## 5. Lưu ý chung

- **Chính sách "nội dung không chân thực":** kênh không lộ mặt + giọng máy + cùng một khuôn chính là kiểu bị nhắm tới; có thể **tắt kiếm tiền cả kênh** [Nguồn: tài liệu YouTube qua báo chí]. Cách giữ an toàn: mỗi video là nghiên cứu thật, có góc nhìn riêng, có nguồn; không đăng ồ ạt.
- **Luật vẽ bản đồ của thư viện** (hướng địa lý / lịch sử): không vẽ biên giới trừ khi chủ đề nói về biên giới; nếu khung hình có Trung Quốc thì phải vẽ đầy đủ theo bản đồ tiêu chuẩn của Trung Quốc. Tránh chủ đề lãnh thổ tranh chấp.
- **Video dài là nguồn tiền chính:** đường 4.000 giờ xem khả thi hơn đường 10 triệu lượt xem Shorts (xem KE-HOACH-KENH.md). Shorts dùng để kéo người đăng ký.
- **Thử trước khi cam kết:** làm **1 video dài + 3 Shorts** cho hướng được chọn, đăng, đo 2–3 tuần rồi mới quyết làm tiếp.

---

## 6. Nguồn

- RPM theo ngách: [Fliki](https://fliki.ai/blog/best-faceless-youtube-niches), [ClipSpeed](https://www.clipspeed.ai/blog/faceless-youtube-niches-2026.html), [FluxNote – highest RPM faceless niches](https://fluxnote.io/guides/highest-rpm-faceless-youtube-niches-2026), [OutlierKit – most profitable niches](https://outlierkit.com/blog/most-profitable-youtube-niches), [EasyViral](https://easyviral.ai/blog/15-faceless-youtube-channel-ideas-ranked-by-rpm-2026), [Autonolab – faceless animation](https://blog.autonolab.com/niches/2026-01-01-faceless-youtube-animation/), [Autonolab – history](https://blog.autonolab.com/niches/2025-12-10-faceless-youtube-history/)
- RPM / CPM theo quốc gia: [upGrowth](https://upgrowth.in/youtube-cpm-by-country-global-comparison-2026/), [FluxNote – RPM by country](https://fluxnote.io/guides/youtube-rpm-by-country), [YTFace](https://ytface.com/cpm-rates-by-country), [FluxNote – LatAm](https://fluxnote.io/guides/youtube-latam-rpm-rates-2026), [Wild and Free Tools](https://www.wildandfreetools.com/blog/youtube-rpm-by-country/)
- Thị trường: [AIR – ngôn ngữ phổ biến trên YouTube](https://air.io/en/audience-growth/what-are-the-most-popular-languages-on-youtube), [Bloomberg Línea – Reino Infantil](https://www.bloomberglinea.com/estilo-de-vida/argentina-reino-infantil-lidera-youtube-en-espanol-con-5600-millones-de-vistas-en-lo-que-va-de-2026/), [Metricool – xu hướng YouTube 2026](https://metricool.com/pt/tendencias-youtube/), [Amra & Elma – thống kê Shorts](https://www.amraandelma.com/best-youtube-shorts-statistics/), [Tubefilter – top 50 kênh](https://www.tubefilter.com/2026/01/20/top-50-most-subscribed-youtube-channels-week-of-01-18-2026/), [HypeAuditor – hoạt hình Brazil](https://hypeauditor.com/es/top-youtube-animation-brazil/), [The News Lens – Indonesia](https://www.thenewslens.com/article/267355), [Korea Times – webtoon short-form](https://www.koreatimes.co.kr/amp/lifestyle/trends/20250903/korean-webtoon-giants-turn-comics-into-videos-to-capture-short-form-generation)
- Hoạt hình trên YouTube: [YouTube Culture & Trends – indie animation](https://blog.youtube/culture-and-trends/independent-animation-trends-report/), [Tubefilter](https://www.tubefilter.com/2026/04/09/youtube-culture-trends-original-animated-series-digital-circus-hazbin-hotel/), [Cartoon Brew](https://www.cartoonbrew.com/distribution/youtube-animation-report-259897.html)
- Ấn Độ: [vidIQ – Nani Story TV](https://vidiq.com/youtube-stats/channel/@nanistorytv/about/index.md), [Qoruz – Moral Stories Hindi Kahaniya](https://qoruz.com/Moral_Stories_Hindi_Kahaniya/youtube)
