import json, re, pathlib
ROOT = pathlib.Path(__file__).resolve().parents[2]
d = json.load(open(ROOT / "narration.json", encoding="utf-8"))
# id: (Vietnamese, source, kind)
# kind: N = bám sát văn bản gốc, M = hiện vật / nguồn khác, I = diễn giải của kênh
V = {
"h1": ("Zeus đã nuốt vợ của mình. Bà đang mang thai.", "Theogony 886–890", "N"),
"h2": ("Ông làm vậy có chủ ý. Và bài thơ Theogony của Hesiod cho chúng ta biết vì sao.", "Theogony 891–894", "N"),
"h3": ("Việc đó xảy ra sau khi Zeus thắng một cuộc chiến mười năm, quật ngã một con quái vật trăm đầu, và được các thần khác thúc giục lên làm vua.", "Theogony 636–638; 820–868; 881–885", "N"),
"h4": ("Để hiểu vì sao, ta phải quay về với vị chủ nhân đầu tiên của bầu trời, và lời cảnh báo ông đã nói với chính các con trai mình.", "Theogony 207–210", "N"),
"h5": ("Trên đường đi, ta sẽ gặp một hòn đá bị đem cho một vị thần ăn, và một họa sĩ vẽ con quái vật khác hẳn nhà thơ.", "Theogony 485–500; bình Munich 596", "N"),
"a1": ("Phần lớn học giả xếp bài thơ Theogony vào khoảng bảy trăm năm trước Công nguyên. Tác giả là một nhà thơ tên Hesiod. Tên bài có nghĩa là sự ra đời của các vị thần.", "FACTS B1", "M"),
"a2": ("Câu chuyện về thế giới bắt đầu bằng Hỗn Mang (Chaos). Rồi đến Gaia, Đất. Và từ Gaia sinh ra Ouranos, Trời, to bằng bà, để che phủ bà mọi phía.", "Theogony 116–133", "N"),
"a3": ("Gaia và Ouranos có con. Mười hai người là các Titan. Ba người là Cyclops, những người một mắt chế tạo tia sét. Và ba người là các Hundred-Handers, những gã khổng lồ có một trăm cánh tay và năm mươi cái đầu mỗi người.", "Theogony 134–153 (số 12 là ta đếm từ danh sách)", "N"),
"a4": ("Ouranos ghét ba Hundred-Handers hơn cả. Và ông giấu các con mình vào trong lòng Gaia, mỗi khi một đứa chào đời.", "Theogony 147–162", "N"),
"a5": ("Gaia rên rỉ, bị chật chội vì chính các con mình. Bà bèn rèn một lưỡi hái bằng đá lửa xám, và nhờ các con trai dùng nó đối với cha.", "Theogony 147–166", "N"),
"a6": ("Tất cả đều quá sợ để trả lời. Trừ một người. Cronos, út nhất, thông minh nhất.", "Theogony 134–138; 167–172", "N"),
"a7": ("Gaia giấu Cronos phục kích, và đặt lưỡi hái vào tay ông. Khi Ouranos đến lúc đêm xuống, Cronos ra tay. Và Cronos thế chỗ cha.", "Theogony 173–206", "N"),
"a8": ("Ouranos còn một điều muốn nói. Ông gọi các con trai là Titan, như một lời sỉ nhục. Hesiod nói từ này đến từ một động từ nghĩa là căng ra, vì, theo Ouranos, chúng đã căng quá mức và làm một việc khủng khiếp.", "Theogony 207–210", "N"),
"a9": ("Và ông hứa rằng một ngày nào đó, sẽ có người phải trả giá.", "Theogony 207–210 ('vengeance would come afterwards')", "N"),
"a10": ("Hãy nhớ điều đó.", "(cài mối, trả ở c9)", "I"),
"b1": ("Cronos giờ là vua. Và ông đã biết một lời tiên tri từ Gaia và Ouranos. Một ngày kia, chính con trai ông sẽ đánh bại ông.", "Theogony 453–491", "N"),
"b2": ("Vậy nên Cronos đặt ra một luật lệ. Đứa con nào vợ ông là Rhea sinh ra, ông nuốt ngay khi nó chào đời.", "Theogony 453–491", "N"),
"b3": ("Năm đứa con. Hestia. Demeter. Hera. Hades. Poseidon.", "Theogony 453–491 (số 5 là đếm danh sách)", "N"),
"b4": ("Rhea đau khổ không nguôi. Khi bà sắp sinh đứa thứ sáu, bà tìm đến cha mẹ mình, Gaia và Ouranos, và xin một kế.", "Theogony 453–491", "N"),
"b5": ("Họ gửi bà đến Crete. Trong một hang trên núi, Gaia nhận lấy đứa bé từ tay bà, và giấu nó đi.", "Theogony 453–491", "N"),
"b6": ("Với Cronos, Gaia đưa một hòn đá lớn, bọc trong tã. Ông cầm lấy. Ông nuốt nó. Và không hề nhận ra.", "Theogony 453–491 (người đưa đá là Earth, không phải Rhea)", "N"),
"b7": ("Đứa bé đó là Zeus. Út nhất. Đứa duy nhất không bị ăn.", "Theogony 453–491", "N"),
"b8": ("Hesiod lướt nhanh. Cậu bé lớn mạnh. Gaia lừa Cronos, và Zeus áp đảo ông. Đó là tất cả những gì bài thơ nói về việc các vị thần được giải thoát như thế nào.", "Theogony 492–500", "N"),
"b9": ("Cronos nôn tất cả ra. Hòn đá ra trước, vì nó bị nuốt sau cùng.", "Theogony 492–500", "N"),
"b10": ("Zeus cắm hòn đá xuống đất tại Pytho, tên khác của Delphi, dưới chân núi Parnassus, để người ta nhìn thấy và kinh ngạc.", "Theogony 492–500; Pytho = Delphi (FACTS B3)", "N"),
"b11": ("Hơn tám trăm năm sau, một du khách Hy Lạp tên Pausanias đến Delphi. Và ông thấy một hòn đá nhỏ.", "Pausanias 10.24.6; niên đại (FACTS B2)", "M"),
"b12": ("Ông viết rằng mỗi ngày người địa phương đổ dầu ô liu lên nó. Mỗi dịp lễ, họ đặt len thô lên đó. Và có người nói đây là hòn đá đã được đưa cho Cronos thay cho đứa con của ông.", "Pausanias 10.24.6", "M"),
"b13": ("Zeus cũng giải thoát các chú của mình, những người Cyclops, vốn bị xích. Họ cảm ơn ông bằng sấm, chớp và tia sét. Trước đó, Gaia đã giấu sấm đi.", "Theogony 492–506 và 139–146 (nhận ra Cyclops là suy luận từ hai đoạn)", "N"),
"c1": ("Giờ là cuộc chiến. Các Titan giữ núi Othrys. Zeus và các thần trẻ giữ Olympus.", "Theogony 617–653", "N"),
"c2": ("Hesiod không nói điều gì châm ngòi. Ông chỉ nói họ đánh nhau mười năm tròn, và không bên nào thắng nổi.", "Theogony 617–653", "N"),
"c3": ("Rồi Gaia lại lên tiếng. Bà nói với các thần rằng nếu có ba Hundred-Handers về phe mình, họ sẽ thắng. Nhưng các Hundred-Handers vẫn bị xích dưới lòng đất, nơi Ouranos đã đặt họ.", "Theogony 617–653", "N"),
"c4": ("Vậy nên Zeus và các thần đưa họ lên ánh sáng. Rồi cho họ mọi thứ họ cần. Nectar và ambrosia, thức ăn của các vị thần.", "Theogony 617–653", "N"),
"c5": ("Tinh thần họ trở lại. Zeus nhắc họ rằng ông đã giải thoát họ, và xin họ cho thấy sức mạnh. Cottus, một trong ba người, thay mặt cả ba trả lời. Họ sẽ chiến đấu.", "Theogony 617–663", "N"),
"c6": ("Biển gầm. Đất nứt. Olympus rung chuyển nền móng, và chấn động xuống tận Tartarus, vực sâu bên dưới thế giới.", "Theogony 664–686", "N"),
"c7": ("Và giờ Zeus thôi kìm lại. Ông từ Olympus lao xuống, ném sét. Rừng nổ lách tách. Biển sôi. Hơi nóng, Hesiod nói, chạm đến cả Hỗn Mang.", "Theogony 687–712", "N"),
"c8": ("Các Hundred-Handers ném ba trăm tảng đá, chồng lên nhau. Họ chôn các Titan dưới lòng đất, và trói họ lại.", "Theogony 713–735", "N"),
"c9": ("Ouranos đã hứa sẽ có người phải trả giá. Giờ các Titan đang trả.", "(diễn giải: nối a9 với c8)", "I"),
"c10": ("Tartarus sâu bao nhiêu? Hesiod đưa ra một phép đo. Một cái đe đồng thả từ trời mất chín ngày mới chạm đất, và thêm chín ngày nữa mới tới Tartarus.", "Theogony 713–735", "N"),
"c11": ("Poseidon gắn cổng đồng vào nhà tù. Và trong một đoạn, Hesiod cho ba Hundred-Handers ở lại làm lính canh.", "Theogony 713–735; đoạn 807–819 nói khác (xem FACTS)", "N"),
"c12": ("Theo lời kể của Hesiod, những tù nhân được giải thoát là chìa khóa của chiến thắng. Suốt mười năm, các thần trẻ không thể thắng một mình. Ouranos đã xích ba người này. Zeus và các thần giải thoát họ, cho ăn, và xin họ giúp.", "Theogony 617–653, 713–735 (diễn giải có gắn 'theo Hesiod')", "I"),
"d1": ("Các Titan đã bị nhốt. Nhưng bài thơ chưa hết.", "(chuyển cảnh)", "I"),
"d2": ("Gaia sinh thêm một đứa con, út của bà. Typhoeus. Cha của nó là Tartarus, chính cái vực ấy.", "Theogony 820–868", "N"),
"d3": ("Hesiod cho nó một trăm đầu rắn, lưỡi đen chập chờn, và lửa phun ra từ đôi mắt của mỗi cái đầu.", "Theogony 820–868", "N"),
"d4": ("Và mỗi đầu có một giọng. Có lúc nó phát ra âm thanh mà các thần hiểu được. Có lúc nó rống như bò, gầm như sư tử, tru như chó con, hoặc rít lên đến khi núi vang vọng.", "Theogony 820–868", "N"),
"d5": ("Hôm đó, Hesiod nói, một điều không thể cứu vãn đã suýt xảy ra. Typhoeus đã cai trị cả thần lẫn người, nếu Zeus không kịp nhận ra.", "Theogony 820–868", "N"),
"d6": ("Zeus gầm sấm. Olympus rung lên. Hades run rẩy dưới âm phủ, và các Titan run rẩy trong Tartarus. Rồi Zeus nhảy xuống từ Olympus và đốt cháy từng cái đầu đó.", "Theogony 820–868", "N"),
"d7": ("Typhoeus đổ sập, cháy xém và gãy nát, đất rên lên. Mặt đất tan chảy, Hesiod nói, như thiếc. Và Zeus ném nó vào Tartarus.", "Theogony 820–868", "N"),
"d8": ("Từ Typhoeus mà có những cơn gió bão, thứ làm tàu chìm và thủy thủ chết. Chỉ ba ngọn gió không phải của nó: gió bắc, gió nam và gió tây.", "Theogony 869–880 (Notus, Boreas, Zephyr; hướng gió là kiến thức chung)", "N"),
"d9": ("Giờ hãy nhìn chiếc bình này.", "(hình: bình Munich 596)", "M"),
"d10": ("Đây là một bình đựng nước, gọi là hydria, vẽ khoảng năm trăm bốn mươi năm trước Công nguyên. Tức là khoảng một thế kỷ rưỡi sau Hesiod, theo các niên đại thông thường. Nó nằm trong một bảo tàng ở Munich.", "Theoi; WHE; Beazley (FACTS C)", "M"),
"d11": ("Bên trái là Zeus, tay giơ tia sét. Tên ông được viết bên cạnh.", "Ảnh bình; Beazley 'Zeus (named)' (FACTS C)", "M"),
"d12": ("Bên phải là con quái vật. Họa sĩ cho nó một khuôn mặt người, đôi cánh lớn, và thân là những vòng rắn cuộn.", "Ảnh bình; Theoi (FACTS C)", "M"),
"d13": ("Hesiod cho nó một trăm đầu rắn, và không hề nhắc đến cánh.", "Theogony 820–868 (đã đọc đủ đoạn, không có 'cánh')", "N"),
"d14": ("Có lẽ một họa sĩ chỉ đơn giản có độ cong của cái bình để làm việc.", "(suy đoán, đã nói là 'có lẽ')", "I"),
"e1": ("Giờ chiến tranh đã xong, và con quái vật đã biến mất.", "Theogony 820–880", "N"),
"e2": ("Sau chiến tranh, các thần thúc giục Zeus cai trị họ. Và Gaia là người thúc họ.", "Theogony 881–885", "N"),
"e3": ("Cronos thế chỗ cha mình bằng lưỡi hái trong tay. Zeus thì được thúc giục.", "Theogony 173–206; 881–885", "N"),
"e4": ("Ông chia các vinh dự cho các thần. Mỗi người một phần. Rồi ông lấy vợ.", "Theogony 881–886", "N"),
"e5": ("Vợ đầu của ông là Metis. Hesiod nói bà khôn ngoan hơn mọi thần và mọi người phàm.", "Theogony 886–900", "N"),
"e6": ("Metis sắp sinh Athena. Đó là lúc Zeus lừa bà bằng lời lẽ khôn khéo, và đặt bà vào trong bụng mình.", "Theogony 886–900", "N"),
"e7": ("Ông làm vậy theo lời khuyên của Gaia và Ouranos. Và lý do được nói thẳng: để không ai khác có thể thế chỗ Zeus làm vua.", "Theogony 886–900", "N"),
"e8": ("Vì Metis được định sẽ có hai đứa con. Trước là một cô con gái, mạnh bằng cha và khôn ngoan. Và sau cô là một người con trai tính khí kiêu ngạo, sẽ làm vua của thần và người.", "Theogony 886–900", "N"),
"e9": ("Zeus không chờ con trai lớn lên. Ông không chờ con trai ra đời. Ông nuốt người mẹ.", "(diễn giải từ 886–900)", "I"),
"e10": ("Ouranos xích một số con mình. Cronos nuốt con mình. Zeus nuốt người mẹ, trước khi người con trai có thể tồn tại.", "(so sánh của kênh, các vế đều có nguồn)", "I"),
"e11": ("Và hãy để ý ai đưa ra lời khuyên. Gaia rèn lưỡi hái. Gaia giấu đứa bé. Gaia lừa Cronos. Gaia chỉ cho các thần cách thắng chiến tranh. Gaia thúc họ đưa Zeus lên làm vua. Và Gaia, cùng với Ouranos, chỉ cho Zeus cách bảo đảm không ai thế chỗ ông.", "147–166; 453–506; 617–653; 881–900 (từng vế có nguồn)", "I"),
"e12": ("Hết lần này đến lần khác trong bài thơ, Gaia đứng sau những bước ngoặt quyền lực.", "(luận điểm của kênh; Gaia cũng sinh ra Typhoeus nên cũng là một 'bước ngoặt')", "I"),
"f1": ("Ba người cai trị bầu trời. Người thứ nhất bị con trai đánh gục. Người thứ hai bị con trai lật đổ. Người thứ ba bảo đảm đứa con có thể làm điều đó với ông không bao giờ ra đời.", "(tóm tắt)", "I"),
"f2": ("Hesiod không phán xét. Ông gọi đó là một sự lừa dối, làm bằng lời lẽ khôn khéo, rồi đi tiếp. Và ngay sau đó, Zeus lại cưới vợ.", "Theogony 886–890; 901 (Themis)", "N"),
"f3": ("Nhưng bài thơ để lại một câu đố. Metis bị nuốt trước khi Athena ra đời. Vậy mà, xa hơn một chút, Hesiod nói rằng chính Zeus đã sinh ra Athena, từ cái đầu của mình.", "Theogony 886–900; 924–926", "N"),
"f4": ("Lần sau: nữ thần bước ra từ đầu cha mình, và điều Hesiod nói về mẹ bà.", "(tease tập 2)", "I"),
}
missing = [i for i, _ in d if i not in V]
extra = [i for i in V if i not in [x for x, _ in d]]
assert not missing and not extra, (missing, extra)
words = sum(len(re.findall(r"[A-Za-z0-9'’\-]+", t)) for _, t in d)
out = []
out.append('# SCRIPT: Tập 1 "Why Zeus Swallowed His Wife" (bản để duyệt)\n')
out.append("Viết cho bạn (chủ kênh). Cột giữa là **lời đọc thật** (tiếng Anh, từng câu như trong `narration.json`), cột phải là bản dịch để bạn duyệt ý. "
           f"Tổng **{words} từ**, ước tính **11 đến 12 phút** (2,3 từ/giây, cộng khoảng nghỉ).\n")
out.append("**Cột 'Loại':** `N` = bám sát văn bản gốc (đã đối chiếu), `M` = hiện vật hoặc nguồn khác (Pausanias, bình Munich, niên đại), `I` = **diễn giải của kênh** (không nói như lời Hesiod). Số dòng Theogony theo bản dịch Evelyn-White; chi tiết từng dữ kiện: `FACTS.md`.\n")
out.append("**Quy tắc lời kể:** không dùng dấu gạch ngang; số viết bằng chữ cho giọng đọc; mỗi câu một ý. Đã chạy `words_check.py`: 0 gạch ngang, 0 dấu hiệu 'giọng AI'.\n")
sec = {"h": "Mở đầu (0:00)", "a": "Chương 1: Vị chủ nhân đầu tiên của bầu trời", "b": "Chương 2: Hòn đá", "c": "Chương 3: Mười năm chiến tranh", "d": "Chương 4: Con quái vật và chiếc bình", "e": "Chương 5: Vì sao Zeus nuốt Metis", "f": "Kết và móc sang tập sau"}
cur = None
for i, t in d:
    s = i[0]
    if s != cur:
        cur = s
        out.append("\n## " + sec[s] + "\n")
        out.append("| ID | Lời đọc (EN) | Bản dịch (VN) | Nguồn | Loại |")
        out.append("|---|---|---|---|---|")
    vn, src, kind = V[i]
    out.append(f"| {i} | {t} | {vn} | {src} | {kind} |")
(ROOT / "SCRIPT.md").write_text("\n".join(out) + "\n", encoding="utf-8")
print("ok", words)
