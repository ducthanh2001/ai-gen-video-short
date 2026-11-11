# Hướng dẫn viết kịch bản cuốn hút và không "giọng AI"

Ngày 10/11/2026. Viết cho bạn (chủ kênh), dùng làm quy trình cho mọi tập.
**[Nguồn]** = có trích dẫn. **[Đề xuất]** = ý kiến của tôi, phần lớn lấy từ kiến thức chung về nghề viết, **chưa kiểm chứng bằng nghiên cứu**. Phần "hệ thống viết" lấy từ skill `lemo-plus` bạn đã có (viết lại từ dự án cinecode, giấy phép MIT).

**Thành thật về giới hạn:** lượt research web về nghề viết lời kể thu được chủ yếu là blog thực hành, **không có nghiên cứu hay phân tích kênh tài liệu cụ thể**. Con số như "nhắc lại sau mỗi 2–3 phút" hay "130–150 từ mỗi phút" là quy tắc kinh nghiệm. Tôi dùng chúng để khởi đầu, bạn đo lại bằng biểu đồ giữ chân của chính kênh.

---

## 1. Nguyên tắc gốc: AI viết nháp, con người quyết định

Kịch bản nghe giống AI khi **không có quan điểm, không có chi tiết chỉ người đọc nguồn mới biết, nhịp câu đều đều**. Vì vậy phần việc không giao được cho AI là:
1. **Câu hỏi của tập** (vì sao tập này đáng xem).
2. **Quan điểm** (bạn nghĩ gì về chuyện này).
3. **Chi tiết cụ thể từ nguồn gốc** (một dòng thơ, một con số, một chi tiết lạ trên hiện vật).
4. **Duyệt cuối bằng tai**: đọc to và cắt.

---

## 2. Nguồn tư liệu để viết (và chỗ tìm)

**Văn bản gốc, bản dịch cũ đã hết bản quyền** [Nguồn: kết quả tìm kiếm]:
- **Hesiod, *Theogony*** (bản dịch Evelyn-White, Loeb 1914): có trên **theoi.com** và **Perseus Digital Library**. Trang theoi.com ghi nguồn là tập Loeb 57, Heinemann, London 1914. Bản năm 1914 thường thuộc phạm vi công cộng tại Mỹ, **bạn tự kiểm tra theo nước của bạn**.
- Perseus còn cho đọc theo số dòng (dạng citable), tiện ghi "Theogony, lines 120–155" trên màn hình.

**Nguồn khác tôi biết nhưng chưa kiểm tra trực tiếp lần này** (bạn tự xác minh trước khi dùng):
- *Apollodorus, Library* (bản dịch Frazer 1921), Homer (*Iliad*, *Odyssey*), Ovid (*Metamorphoses*), *Homeric Hymns*.
- **Theoi.com** (thư viện thần thoại có chú thích từng nguồn cổ), **Beazley Archive Pottery Database** (Oxford, tra bình gốm theo cảnh vẽ).
- Sách học giả: Mary Beard, Emily Wilson (bản dịch *Odyssey*), Robin Lane Fox, và các giáo trình thần thoại. **Chỉ dùng để hiểu, diễn đạt lại bằng lời của bạn, không chép.**

**Quy tắc:**
- Mỗi tập có **một gói nguồn** (source packet) trước khi viết: 1 văn bản gốc, 1–2 nguồn học giả, 1 hiện vật.
- Bản dịch hiện đại (Wilson, Fagles…) còn bản quyền: **không trích dài**, chỉ nói ý.
- Mọi dữ kiện vào `FACTS.md`: cột Claim · Source (link) · Status (confirmed / unconfirmed / unreachable) · mã dòng lời kể. Dữ kiện không xác nhận được thì **cắt hoặc nói rõ "theo…"**.

---

## 3. Quy trình mỗi tập (từ skill lemo-plus, mục "writer pass")

```
1. Gói nguồn: văn bản gốc + học giả + hiện vật.
2. Mười góc kể (riêng tư): bỏ 3 góc đầu (hiển nhiên), giữ 3 góc "bất ngờ mà đúng".
3. Chọn 1 góc, ghi lý do một dòng.
4. Năm dòng: tình huống · mong muốn · xung đột · thay đổi · kết quả.
5. Viết cú ngoặt: "Trước: … / Sau: …".
6. Viết câu kết TRƯỚC, rồi mọi thứ cần cho nó được cài trong 1/3 đầu.
7. Show, don't tell: lời kể không mô tả hình, mà thêm điều hình không nói được.
8. Ngân sách từ: 110–140 từ/phút cho video kể chuyện dài, tính cả khoảng nghỉ.
9. Chạy words_check.py (xem mục 5).
10. Đọc to, bấm giờ, CẮT 30%.
11. Đưa cho một "người xem lạ" (agent mới) đọc nguội để tìm chỗ không hiểu.
12. Bạn duyệt bản tiếng Việt, rồi mới thu giọng.
```

---

## 4. Cuốn hút: mở đầu, nhịp và vòng lặp mở

**Mở đầu 30–60 giây (video trên 5 phút)** [lemo-plus; blog thực hành cũng đồng ý]:
- **0–5 giây:** một câu hoặc hình phá khuôn (mâu thuẫn, khoảnh khắc từ sau của câu chuyện).
- **5–30 giây:** vì sao câu hỏi quan trọng, **một dữ kiện cứng**. Truyện bắt đầu chạy trước giây thứ 30.
- Hook là **một câu hỏi**, không phải thông tin. Lời hứa ở hook phải được trả ở cuối, đừng "hứa quá".

**Vòng lặp mở (curiosity map)**: lập bảng trong `TREATMENT.md`: mỗi câu hỏi mở ở giây nào, trả ở giây nào. Tối đa **hai câu hỏi lớn mở cùng lúc**, có một lần "lật" (reveal) mỗi 60–90 giây, không trả điều chưa ai muốn biết. Blog thực hành khuyên 1–2 vòng lặp mở mỗi video, nhiều hơn làm người xem mất tin.

**Nhịp:** gắn nhãn từng đoạn là *nhanh / thở / lặng*, không ba đoạn cùng loại liên tiếp. Khi giọng nghỉ, hình gánh. Cả hai cùng nghỉ là khoảng chết, trừ khi cố ý.

**Kết tập:** trả lời hoặc đảo ngược câu hỏi mở đầu. **Tease tập sau là một câu hỏi và một hình, không tóm tắt.** Không kết bằng khẩu hiệu hay "đó là tất cả".

---

## 5. Danh sách tránh "giọng AI"

**Từ sáo và cấu trúc đặc trưng AI** [Nguồn: kết quả tìm kiếm cho danh sách từ, kèm danh sách của lemo-plus]:
- Từ hay bị gắn nhãn: *delve, tapestry, realm, leverage, seamless, robust, testament, multifaceted, myriad, pivotal, landscape (nghĩa bóng)*.
- Cấu trúc: "không chỉ X mà còn Y" / "it's not X, it's Y", chuyển ý rập khuôn (*Furthermore, Moreover*), nhịp câu đều, "at its core", "the real question", mở bằng "Imagine…", "Here's the thing", "Have you ever…".
- Sáo ngữ thần thoại: *a tapestry of gods and mortals, timeless tale, eternal struggle, the rest is history*.
- **Không dùng dấu gạch ngang dài (—) trong lời kể.** Thay bằng dấu phẩy, chấm hoặc xuống dòng. Công cụ kiểm tra sẽ báo lỗi.
- **Lưu ý từ nguồn:** máy dò AI không đáng tin và hay gắn nhãn nhầm cả văn người viết. **Mục tiêu là viết tốt hơn, không phải qua mặt máy dò.**

**Chạy kiểm tra:**
```
python C:/Users/PC/.claude/skills/lemo-plus/scripts/words_check.py <thư mục tập>
```
Thoát mã 0 mới được thu giọng.

---

## 6. Kỹ thuật viết cho thần thoại [Đề xuất, kiến thức chung, chưa kiểm chứng bằng nguồn]

1. **Viết cho tai, không cho mắt.** Câu ngắn, từ cụ thể, danh từ và động từ mạnh. Mỗi dòng một ý.
2. **Lối kể của người hát rong.** Thần thoại gốc là truyền khẩu: lặp có chủ đích, danh hiệu đi kèm tên ("Zeus, người gom mây"), một điệp khúc quay lại. Dùng tiết chế, **không** lạm dụng thành văn nhái cổ.
3. **Kịch tính nằm ở chỗ nguồn mâu thuẫn.** "Hesiod nói A, nhưng một bình gốm vẽ B." Đây là thứ tóm tắt chung chung không có, và là điểm khác biệt của kênh.
4. **Chi tiết chỉ người đọc nguồn biết.** Một dòng thơ, tên người thợ gốm, một vết nứt trên hiện vật. Mỗi tập cần ít nhất 3 chi tiết kiểu này.
5. **Xen "chuyện" và "nghĩ".** Kể một cảnh cụ thể, rồi một câu bình luận ngắn của bạn, rồi cảnh tiếp. (Đây là cấu trúc kể chuyện phổ biến trong nghề phát thanh; tôi nhớ từ kiến thức chung, chưa tra nguồn.)
6. **Quan điểm riêng.** Mỗi tập có một câu thể hiện bạn nghĩ gì ("Tôi nghĩ người Hy Lạp thờ một vị thần soán ngôi vì…"). Đừng để lời kể trung lập vô vị.
7. **Cụ thể thay vì tính từ.** "Mười năm bị nuốt trong bụng cha" mạnh hơn "số phận bi thảm".
8. **Cảnh trước, giải thích sau.** Đưa người nghe vào khoảnh khắc, rồi mới nói bối cảnh.
9. **Âm thanh quyết định nhịp.** Câu dài rồi câu cực ngắn. Một dòng "ngắt" sau điểm lật.

---

## 7. Giọng đọc và phát âm

- **Chọn giọng trước khi viết xong** để nhịp câu đúng. Tốc độ: kể chuyện 1,5–2,0 từ/giây, Kokoro tốc độ 0,92–0,95 khoảng 2,3 từ/giây. Giọng bạn đã chọn (`af_heart`, tốc độ 0,95) luôn thắng, nhưng thử thêm 2 giọng nam Anh (ví dụ `bm_george`, `bm_fable`; chạy `tts.py` với tên lạ để thấy danh sách) trên cùng một đoạn.
- **Bảng phát âm bắt buộc.** Tên Hy Lạp là chỗ TTS sai nhiều nhất. Khởi đầu bảng (cách đọc IPA, **bạn kiểm lại bằng từ điển trước khi dùng**):

| Tên | Cách đọc gợi ý |
|---|---|
| Persephone | pər-SEF-uh-nee |
| Hephaestus | hih-FEES-tus |
| Prometheus | pruh-MEE-thee-us |
| Cronus | KROH-nus |
| Aeschylus | ESS-kuh-lus |
| Ouranos | OOR-uh-nos |

- Kiểm tra pipeline có hỗ trợ từ điển phát âm không (xem `tools/narrate.py`) trước khi dựa vào nó.
- Sau khi thu: chạy `asr_lines.py` (Whisper đọc lại) để so với kịch bản, bắt từ đọc sai.

---

## 8. Rủi ro lớn: bạn viết tiếng Anh nhưng khó tự nghe lỗi

Bạn không phải người bản ngữ nên khó thấy câu gượng. Giảm bằng:
1. **Đọc nguội bằng agent mới**: đưa cho một agent chỉ `TREATMENT.md` và `lines.json`, hỏi ai là "he", "it", câu nào dựa vào lý do chưa được nói, câu nào treo lửng.
2. **ASR vòng tròn**: giọng TTS → Whisper → so với kịch bản.
3. **Người bản ngữ đọc bản cuối** cho 3 tập đầu (nhờ bạn bè hoặc thuê chỉnh sửa theo giờ; mình không kiểm tra giá cụ thể). Họ sẽ chỉ ra câu "nghe như dịch" hay "nghe như AI". Sau 3 tập, bạn nhận ra mẫu lỗi và ít phải nhờ hơn.
4. **Bản tiếng Việt song song** để bạn duyệt ý trước khi duyệt giọng.

---

## 9. Danh sách kiểm tra trước khi thu giọng

- [ ] Gói nguồn đủ, `FACTS.md` không còn dòng "unconfirmed" chưa xử lý.
- [ ] Hook là câu hỏi, truyện chạy trước giây 30.
- [ ] Bảng vòng lặp mở: không quá 2 câu hỏi lớn mở cùng lúc.
- [ ] Có ít nhất 1 chỗ "nguồn mâu thuẫn" và 3 chi tiết cụ thể từ nguồn.
- [ ] Có 1 câu quan điểm của bạn.
- [ ] Đã đọc to, cắt 30%, ghi số từ trước/sau trong `TREATMENT.md`.
- [ ] `words_check.py` thoát mã 0 (không dấu gạch ngang, sáo ngữ đã xử lý).
- [ ] Bảng phát âm cập nhật.
- [ ] Đã đọc nguội bằng agent mới, đã sửa chỗ hỏng.
- [ ] Bạn đã duyệt bản tiếng Việt.
- [ ] Tease tập sau là một câu hỏi và một hình.

---

## 10. Việc cần bạn quyết định

1. Có dùng người bản ngữ đọc 3 tập đầu không (tốn tiền hoặc nhờ người quen)?
2. Thử 3 giọng đọc (ít nhất một giọng nam) trên đoạn mở đầu tập 1?
3. Đồng ý mỗi tập phải có câu quan điểm của bạn (tôi sẽ đề xuất 2–3 phương án để bạn chọn, không tự quyết thay)?
