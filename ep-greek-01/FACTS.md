# FACTS: Tập 1 "Why Zeus Swallowed His Wife"

Viết cho bạn (chủ kênh). Nghiên cứu và đối chiếu ngày 10/11/2026.
Trạng thái: **OK** = đã đọc trong nguồn gốc · **OK-2** = nguồn thứ cấp đáng tin hoặc suy luận từ hai đoạn · **CALC** = ta tự tính (cách tính ghi rõ) · **HEDGED** = lời kể nói rõ mức chắc chắn · **INTERP** = diễn giải của kênh, lời kể không nói như lời nguồn.
Mọi câu có trong `SCRIPT.md` (có cột nguồn từng câu). Văn bản đã tải về `research/source-text/` để đọc lại.

## Cách đối chiếu đã làm
1. Đọc **toàn bộ** các đoạn Theogony dùng trong lời kể, từ file `theogony-evelyn-white.txt` (không viết từ trí nhớ).
2. Một người kiểm tra độc lập (agent riêng) đối chiếu từng câu với văn bản gốc, Pausanias và ảnh bình. Kết quả: **1 lỗi thật** (ai đưa hòn đá), nhiều chỗ quá lời (ngai vàng, "tiêu diệt", "chính xác vì sao"…), tất cả đã sửa.
3. Một người đọc "khán giả lạ" tìm chỗ khó hiểu (tên Heaven/Earth gây nhầm, hai lần giải thoát bị lẫn…). Đã sửa.
4. Chạy `words_check.py`: 0 dấu gạch ngang, 0 dấu hiệu "giọng AI".
5. **Chưa** làm: người có chuyên môn cổ điển đọc lại; đối chiếu bản Hy Lạp gốc. Lời kể dựa vào **một bản dịch** (Evelyn-White 1914), nên mọi nghĩa như "pressed", "sounds the gods understood" phụ thuộc vào bản dịch đó.

---

## A. Nguồn chính
**Hesiod, *Theogony*, bản dịch H. G. Evelyn-White (Loeb 1914)**, đọc tại https://theoi.com/Text/HesiodTheogony.html (cũng có ở Perseus Digital Library). Số dòng trong ngoặc vuông là số dòng Hy Lạp. Dưới đây dùng khoảng dòng theo từng đoạn của bản dịch.

| Câu | Dữ kiện | Nguồn (Theogony) | TT |
|---|---|---|---|
| h1, e6 | Zeus nuốt Metis khi bà "sắp sinh" Athena (suy ra: đang mang thai) | 886–890 | OK |
| h2, e7 | Lý do nêu rõ: "no other should hold royal sway over the eternal gods in place of Zeus" | 891–894 | OK |
| h3, e1 | Chiến tranh Titan mười năm; Typhoeus bị hạ; các thần "pressed" Zeus làm vua | 636–638; 820–868; 881–885 | OK |
| a2 | Chaos trước, rồi Earth, rồi Heaven "equal to herself, to cover her on every side" | 116–133 | OK |
| a3 | Titan: 11 tên trong danh sách 134–138 + Cronos = **12 (ta đếm)**; 3 Cyclopes (Brontes, Steropes, Arges) "gave Zeus the thunder and made the thunderbolt"; 3 Hundred-Handers (Cottus, Briareos, Gyes), "an hundred arms... fifty heads" | 134–153 | OK, CALC (con số 12) |
| a4 | Heaven ghét ba người này nhất; "hide them all away in a secret place of Earth so soon as each was born" | 147–162 | OK |
| a5–a7 | Earth làm lưỡi hái, kể kế hoạch cho các con trai; Cronos, "youngest" và "wily", nhận; phục kích; Heaven đến ban đêm; Cronos ra tay | 134–138; 163–206 | OK |
| a7, e3 | "Cronos takes his father's place": Hesiod **không** nói thẳng ở cảnh này rằng Cronos thành vua; ta nói "thế chỗ", và dòng 485 gọi Cronos là "earlier king of the gods" | 173–206; 485 | OK-2 |
| a8, a9 | Heaven gọi họ là Titans "in reproach"; dịch giả ghi nghĩa "Strainers"; "they strained and did presumptuously a fearful deed" và "vengeance for it would come afterwards" | 207–210 | OK |
| b1 | Cronos biết "from Earth and starry Heaven" rằng sẽ bị con trai đánh bại | 453–491 | OK. Ghi chú 19 của dịch giả: dòng này có bản đọc khác, có thể là xen vào |
| b2–b3 | Rhea sinh Hestia, Demeter, Hera, Hades, Poseidon, Zeus; Cronos nuốt từng đứa "as each came forth from the womb"; Zeus là út | 453–491 | OK; số "năm" và "thứ sáu" là **CALC** từ danh sách |
| b4–b5 | Rhea xin cha mẹ (Earth, Heaven) kế; gửi đến Crete; Earth "hid him in a remote cave" trên núi Aegeum | 453–491 | OK |
| b6 | **Earth** đưa hòn đá bọc tã cho Cronos ("she gave a great stone wrapped in swaddling clothes"); Cronos nuốt, không biết | 453–491 | OK (đã sửa: bản nháp đầu ghi nhầm Rhea đưa) |
| b8 | "beguiled by the deep suggestions of Earth... vanquished by the arts and might of his own son" | 492–497 | OK. "Đó là tất cả bài thơ nói" đúng trong Theogony |
| b9 | Cronos "brought up again his offspring"; nôn hòn đá **trước** (nuốt sau cùng) | 492–497 | OK |
| b10 | Zeus đặt hòn đá "at goodly Pytho under the glens of Parnassus, to be a sign thenceforth and a marvel to mortal men" | 498–500 | OK |
| b13 | Zeus giải thoát "the brothers of his father, sons of Heaven" bị xích; họ cho sấm và tia sét mà Earth đã giấu | 501–506 | OK. **Gọi họ là Cyclopes là suy luận** từ 139–146 (Cyclopes là người "gave Zeus the thunder"). Ai xích họ không rõ trong dòng này (bản dịch ghi "his father") nên lời kể không nói ai xích |
| c1, c2 | Titan ở Othrys, các thần ở Olympus; chiến đấu "ten full years"; thế trận cân bằng; Hesiod **không** nêu nguyên nhân | 617–653 | OK |
| c3 | Earth nói rằng với ba người này họ sẽ thắng; ba người bị Heaven ("their father") xích dưới lòng đất | 617–653 | OK |
| c4 | "The son of Cronos and the other deathless gods" đưa họ lên (không chỉ Zeus); họ được cho nectar và ambrosia | 617–653 | OK (đã sửa cho đúng) |
| c5 | Zeus nhắc ơn ("friendly kindness") và xin họ ra sức; Cottus đáp thay | 617–663 | OK |
| c6, c7 | Biển, đất, Olympus rung, chấn động tới Tartarus; "Zeus no longer held back his might", sấm sét, rừng cháy, biển sôi, "astounding heat seized Chaos" | 664–712 | OK |
| c8 | Ba người ném "three hundred rocks"; chôn các Titan dưới đất và trói họ | 713–735 | OK |
| c10 | Cái đe đồng rơi chín ngày chín đêm chạm đất ngày thứ mười, và chín ngày nữa tới Tartarus | 713–735 | OK |
| c11 | Poseidon gắn cổng đồng; Gyes, Cottus, Obriareus là "warders of Zeus". **Nhưng** đoạn 807–819 nói Cottus và Gyes ở "Ocean's foundations", Briareos làm rể Poseidon: bài thơ tự mâu thuẫn, nên lời kể nói "trong một đoạn" | 713–735; 807–819 | OK, HEDGED |
| d2–d7 | Typhoeus út của Earth với Tartarus (nhờ Aphrodite); một trăm đầu rắn, lưỡi đen, mắt phun lửa; giọng: âm thanh các thần hiểu được, bò, sư tử, chó con, tiếng rít; "a thing past help would have happened", Zeus kịp thấy; Olympus rung, Hades và các Titan run; Zeus nhảy xuống đốt các đầu; Typhoeus bị quật, "a maimed wreck", đất chảy như thiếc; bị ném vào Tartarus | 820–868 | OK. Hesiod **không** nói Typhoeus chết, nên lời kể nói "thrown down" |
| d8 | Gió bão từ Typhoeus, trừ Notus, Boreas, Zephyr | 869–880 | OK; "bắc, nam, tây" là kiến thức chung, nguồn không ghi |
| d13 | Trong 820–868 **không có** chi tiết "cánh" (đã đọc hết đoạn) | 820–868 | OK |
| e2 | Các thần "pressed far-seeing Olympian Zeus to reign and to rule over them, by Earth's prompting" | 881–885 | OK |
| e4 | "So he divided their dignities amongst them" | 881–885 | OK |
| e5 | Metis đầu tiên; "wisest among gods and mortal men" | 886–900 | OK |
| e6, e7 | Zeus "craftily deceived her with cunning words and put her in his own belly, as Earth and starry Heaven advised" | 886–900 | OK |
| e8 | Con gái: ngang cha về sức mạnh và hiểu biết; sau đó con trai "of overbearing spirit, king of gods and men" | 886–900 | OK |
| f2 | Ngay sau Metis, "Next he married bright Themis" | 901 | OK |
| f3 | Zeus "gave birth from his own head to bright-eyed Tritogeneia" (Athena) | 924–926 | OK. **Lưu ý:** đoạn 929a–t (từ một bản chép khác, dịch giả ghi là "restored") kể Athena được thụ thai sau khi Metis bị nuốt, ra đời "by way of his head". Phần đó **không** nằm trong bản chính nên lời kể không dùng, và **có thể dùng cho tập 2** |
| e3, e11 | Chuỗi các việc của Earth/Gaia: làm lưỡi hái (147–162), giấu Zeus (470–484), lừa Cronos (492–497), chỉ cách thắng (626–628), thúc các thần phong Zeus (881–885), cùng Heaven khuyên nuốt Metis (891–894) | các đoạn trên | OK, INTERP (việc gom thành chuỗi) |

## B. Nguồn bổ sung
**B1. Niên đại Theogony.** World History Encyclopedia và các nguồn khác: khoảng 700 TCN, khoảng rộng 750 đến 650 TCN. Trang Theoi ghi "flourished C8th B.C." Lời kể nói "khoảng bảy trăm năm trước Công nguyên", đúng với đa số, kèm "phần lớn học giả" (HEDGED). OK-2.

**B2. Pausanias, *Description of Greece* 10.24.6** (https://www.theoi.com/Text/Pausanias10B.html, bản dịch như trang hiển thị, tên người dịch không ghi): "Ascending from the tomb [of Neoptolemus] you come to a stone of no large size. Over it every day they pour olive oil, and at each feast they place on it unworked wool. There is also an opinion about this stone, that it was given to Cronus instead of his child, and that Cronus vomited it up again." Đã đọc trực tiếp. OK. Chú thích 20 của Evelyn-White nối chính hòn đá này với hòn đá trong Theogony.
- **Niên đại Pausanias:** viết khoảng 155 đến 180 sau Công nguyên (quyển 5 ghi mốc 174). Từ Hesiod khoảng 700 TCN → **hơn 800 năm** (CALC: 700 + khoảng 155 = khoảng 855). OK-2.
- Pausanias **không** nhắc Hesiod hay Zeus; việc nối là của chúng ta (chú thích 20 của dịch giả ủng hộ).

**B3. Pytho = Delphi.** Delphi còn được gọi là Pytho (tìm kiếm và Homeric Hymn to Apollo, nguồn từ theoi.com, mythopedia). Nguồn nhắc cũng có truyền thống gọi nơi này là Krisa. Lời kể nói "tên khác của Delphi". OK-2.

## C. Hiện vật: bình hydria Munich 596
- **Bảo tàng:** Staatliche Antikensammlungen, Munich, "Munich 596" (Theoi). Hồ sơ Beazley Archive (CARC) số 1004764 xếp là Chalcidian. Trang CARC **chặn đọc tự động**, nên thông tin Beazley dưới đây lấy qua bản tóm tắt tìm kiếm. **Bạn kiểm tra tay trước khi đăng.**
- **Niên đại:** khoảng 540 TCN (Theoi), 540 đến 530 TCN (World History Encyclopedia), 575 đến 525 TCN (Beazley). Lời kể nói "khoảng 540 TCN". HEDGED.
- **Khoảng cách với Hesiod:** 700 − 540 = 160 năm. Lời kể nói "khoảng một thế kỷ rưỡi, theo các niên đại thông thường". CALC, HEDGED.
- **Cảnh:** Zeus bên trái, một tia sét giơ lên; Typhon bên phải. Đã nhìn ảnh: chữ viết cạnh đầu Zeus đọc là "IEYS" (chữ Z kiểu Chalcidian), Beazley ghi "Zeus (named)". Typhon: hai cánh lớn phủ vảy, thân trên người với khuôn mặt người nhìn nghiêng (trái), đầu thứ hai dạng mỏ hoặc thú ở giữa trên, **dưới là hai vòng rắn lớn**. **Không đếm được số đầu**, nên lời kể không nói số. Theoi: "winged, serpent-legged giant".
- Mặt còn lại: Peleus đấu vật với Atalanta (Theoi, Beazley). Các trang ghi nhãn "mặt A/B" khác nhau, nên lời kể **không dùng** nhãn đó.
- **Không dùng:** nhận xét "họa sĩ cố ý không vẽ trăm đầu vì chật chỗ" (đã đổi thành "có lẽ", d14).
- Ảnh: xem `CREDITS.md`.

## D. Việc còn mở (bạn hoặc chuyên gia nên xem)
1. Trang Beazley/CARC (mở bằng tay) xác nhận cảnh và niên đại.
2. Nhờ người có chuyên môn Hy Lạp cổ hoặc thần thoại xem kịch bản một lần.
3. Kiểm tra giấy phép ảnh bình trên Wikimedia Commons ngay trước khi dùng.
4. Quyết định có dùng đoạn "929a–t" cho tập 2 không.
5. Thu giọng thử các tên riêng: Hesiod, Theogony, Typhoeus, Ouranos, Gaia, Othrys, Cottus, Pytho, Pausanias, hydria.
