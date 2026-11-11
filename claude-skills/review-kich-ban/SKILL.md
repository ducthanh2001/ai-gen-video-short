---
name: review-kich-ban
description: Review và chấm kịch bản (video dài, Shorts, phim ngắn) theo tiêu chí câu chuyện, giọng nói tự nhiên, dấu vết AI, hook và TTS. Dùng ngay sau khi gen kịch bản hoặc khi nói 'review/check kịch bản'.
---

# Review kịch bản (script QA)

Mục tiêu: biến kịch bản AI vừa gen thành kịch bản nghe như một người cụ thể đang kể chuyện, có cấu trúc giữ người xem, và không lộ dấu vết máy viết. Skill này chỉ review và sửa; không đổi sự kiện, số liệu hay ý chính trừ khi người dùng yêu cầu.

## Khi nào chạy
- Ngay sau khi viết xong một kịch bản, trước khi đưa người dùng duyệt hoặc đưa vào pipeline dựng/TTS. Tự chạy bước này, không chờ được nhắc.
- Khi người dùng dán kịch bản và hỏi "có giống AI viết không", "review", "check giọng", "nghe máy móc quá".

## Đầu vào cần biết (tự suy ra từ ngữ cảnh, chỉ hỏi nếu thiếu thật sự)
Thể loại (explainer dài / Shorts / phim ngắn không lời), độ dài mục tiêu, có voiceover không, giọng TTS dùng, ngôn ngữ, tiêu đề + thumbnail (kịch bản phải giữ đúng lời hứa của chúng), đối tượng người xem.

## Quy trình
1. Đọc kịch bản từng câu như đang nói thành tiếng.
2. Chấm 4 nhóm tiêu chí bên dưới, mỗi tiêu chí 0 / 1 / 2 (0 = lỗi rõ, 1 = tạm được, 2 = tốt). Bỏ qua tiêu chí không áp dụng (ví dụ nhóm B và TTS với phim không lời).
3. Chọn tối đa 10 dòng lỗi nặng nhất: trích dòng gốc → vì sao có vấn đề → bản sửa. Ưu tiên lỗi lớn (cấu trúc, hook, lời hứa) trước lỗi nhỏ (từ ngữ).
4. Kết luận: PASS / SỬA NHẸ / VIẾT LẠI PHẦN X.
5. Nếu được phép, trả bản đã sửa. Mỗi chỗ sửa phải giữ nguyên sự kiện. Không sửa quá tay: giữ lại chút không hoàn hảo của lời nói.
6. Kiểm tra lại bản sửa bằng chính các tiêu chí này một lần nữa; sửa xong không được đẻ ra tell mới.

## Nhóm A. Câu chuyện
- A1 Lời hứa và một ý chính. Nói được cốt lõi của kịch bản trong một câu. Hook và tiêu đề hứa gì thì phần thân trả đúng cái đó, không lạc sang chủ đề khác.
- A2 Câu hỏi và câu trả lời. Mở một câu hỏi ngay từ đầu; mỗi phần vừa đóng một câu hỏi cũ vừa mở câu hỏi mới. Phần nào chỉ liệt kê thông tin mà không có câu hỏi dẫn thì viết lại.
- A3 Chuyện xảy ra xen với ý nghĩa của nó. Phải có những khoảnh khắc suy ngẫm trả lời "vì sao tôi nên nghe cái này". Không toàn sự kiện, không toàn bình luận.
- A4 Ai muốn gì, rủi ro gì. Có nhân vật (người trong lịch sử, hay chính người xem tò mò) với mục tiêu và cái giá nếu thất bại. Nhân vật phải bị thử thách, không giải quyết vấn đề quá dễ.
- A5 Leo thang. Mỗi phần mới thay đổi cái gì đó (mức cược, bất ngờ, đảo chiều). Phần giữa không nhắc lại lời hứa ở đầu.
- A6 Cụ thể. Tên riêng, con số, đồ vật, chi tiết giác quan. Chi tiết lạ, đặc thù mới là thứ mô hình ít sinh ra.
- A7 Cho xem, đừng giải thích. Không giải thích cảm xúc, không nói lại điều hình ảnh đã cho thấy. Với phim không lời, thông tin đi bằng hình và chữ rất ngắn.
- A8 Kết. Trả lời câu hỏi đã mở, có một điểm thật sự mới. Không đúc kết sáo, không mở chủ đề mới ở câu cuối.

## Nhóm B. Giọng nói tự nhiên (bỏ qua nếu không có lời)
- B1 Viết cho tai: câu ngắn, mỗi câu một ý, dùng rút gọn (it's, don't), cho phép mảnh câu, được bắt đầu bằng But/So, từ ngắn và cụ thể.
- B2 Test đọc to: không chỗ vấp, hụt hơi, lặp âm, câu nhiều mệnh đề. Ước lượng thời lượng với khoảng 125–150 từ/phút và so với độ dài mục tiêu.
- B3 Nhịp không đều: câu dài ngắn xen kẽ, có câu 1–3 từ giữa các câu dài; đoạn không đều tăm tắp 3–4 câu.
- B4 Có giọng một người: có quan điểm, nhận xét ngoài lề, đôi khi ngập ngừng hoặc tự sửa. Không cân bằng hai phía ở mọi chỗ. Persona nhất quán từ đầu đến cuối và giữa các video của cùng kênh.

## Nhóm C. Dấu vết AI
Đếm mật độ, không cấm tuyệt đối: một lần dùng chưa nói lên điều gì, tổ hợp nhiều tell trong một đoạn ngắn mới đáng ngờ. Danh sách từ vựng đổi nhanh theo đời model; cấu trúc câu bền hơn từ ngữ nên ưu tiên soi cấu trúc.
- C1 Đối lập phủ định: "It's not X, it's Y", "not just X but Y", "No X. No Y. Just Z."
- C2 Bộ ba máy móc: luôn liệt kê đúng 3, thường là 3 tính từ gần nghĩa.
- C3 Tự hỏi tự đáp theo khuôn: "The result? Devastating.", "Here's the thing.", "Let that sink in."
- C4 Phóng đại ý nghĩa và từ sáo: "stands as a testament", "plays a vital role", "tapestry", "delve", "pivotal", "it's worth noting", "in a world where", "game-changer".
- C5 Câu đúc kết cuối đoạn, chuyển ý đều đặn kiểu moreover/furthermore/ultimately.
- C6 Đối xứng và cân bằng: "While X is true, Y…", "Whether you're A or B…"; mọi đoạn cùng độ dài, cùng chất lượng.
- C7 Thân mật giả: "Imagine…" mở bài, "you" dày đặc, từ nhấn một chữ ("Simple.", "Seriously.").
- C8 Mơ hồ trá hình: "experts say", "studies show" không nêu nghiên cứu nào, nguồn không tên, số liệu tròn mơ hồ. Hoặc nêu tên và nguồn cụ thể, hoặc bỏ.
- C9 Dấu câu và định dạng: em dash dày, emoji, markdown, ngoặc, bullet trong lời thoại.

Ngưỡng gợi ý (heuristic của skill này, không phải chuẩn nghiên cứu): C1, C2, C3 mỗi loại xuất hiện từ 2 lần trở lên trong kịch bản dài (hoặc 1 lần trong Shorts dưới 60 giây) thì xem là "giọng AI rõ" và phải viết lại phần đó.

## Nhóm D. Phù hợp nền tảng và pipeline
- D1 Hook: câu đầu cụ thể, ngắn (khoảng 10 từ trở xuống), vào thẳng tình huống hoặc câu hỏi. Không "Hey guys", không giới thiệu bản thân, không tease mơ hồ. Shorts: 2 giây đầu phải có hình và câu khiến người ta dừng lại.
- D2 Giữ chân: open loop xuyên suốt, tease phần tiếp theo trước khi cho xem; mỗi phần dài kết bằng một câu hỏi mở dẫn sang phần sau; có re-hook khi chuyển phần. Pattern interrupt phải có mục đích (đổi thông tin hoặc hình), không phải trang trí. Không áp con số giây cố định vì các nguồn mâu thuẫn nhau.
- D3 Khớp hình: mỗi beat có hình minh hoạ rõ; lời không lặp lại điều hình đã cho thấy. Dùng bố cục hai cột (lời / hình) nếu cần.
- D4 Sẵn sàng cho TTS: số và ký hiệu viết như cách đọc; tên lạ viết phiên âm hoặc chỉ dùng một lần rồi dùng đại từ; dấu chấm = dừng hẳn, gạch ngang = ngắt, ba chấm = ngập ngừng, dấu phẩy = lấy hơi; chia đoạn ngắn; không markdown, emoji, ngoặc.
- D5 Sự thật: ngày tháng, con số, sự kiện kiểm chứng được; không bịa trích dẫn; tách "sử liệu ghi" khỏi "suy đoán". Nghi ngờ thì đánh dấu để kiểm tra, không tự thêm chi tiết nghe có vẻ hợp lý.

## Định dạng báo cáo
1. Bảng điểm: nhóm → tiêu chí → 0/1/2 → ghi chú 1 dòng.
2. Tối đa 10 lỗi nặng nhất: dòng gốc | vấn đề | bản sửa.
3. Kết luận: PASS / SỬA NHẸ / VIẾT LẠI PHẦN X + 2–3 việc nên làm đầu tiên.
4. Bản kịch bản đã sửa (nếu được phép), không kèm giải thích dài.

Người dùng đọc tiếng Việt: báo cáo viết tiếng Việt, còn dòng trích và bản sửa giữ nguyên ngôn ngữ của kịch bản.
