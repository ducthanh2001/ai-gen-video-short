# Phân tích GeoGlobeTales (Shorts) theo phương pháp rea-video

Cách làm: dùng khung phân tích của skill rea-video (mỗi cảnh: hình đáy là gì, lớp chồng, nhân vật, chữ, nhịp). Mình KHÔNG chạy CLI của repo (script cài đặt ghi vào ~/.claude, code bên thứ ba chưa kiểm). Mình xem trực tiếp 2 Shorts trong trình duyệt, lấy khoảng 15 khung cách nhau ~3 giây:
- "How Can France Border the Netherlands? Saint Martin" (Mi543mIs5Ks), 8 khung
- "The World's Longest Fence, Australia's Dingo Fence" (iZS0b9U9UPs), 7 khung

Giới hạn: mẫu nhỏ, không phân tích âm thanh, không đo độ dài cảnh chính xác. Kết luận về "cách làm" là suy luận từ hình.

## Kết luận một câu
Không phải hoạt hình nhân vật. Là **video bản đồ dọc 9:16**, trên đó đặt **các hình dán nhỏ (sticker) nhân vật chibi nửa người** và cờ có mặt; sticker di chuyển cả khối (trượt, nảy, phóng to), không có tay chân cử động, không có thoại. Người kể là **giọng đọc**, chữ chỉ là phụ đề.

## Các lớp hình (từ dưới lên)
1. **Nền bản đồ, 3 kiểu thay nhau theo nhịp kể:**
   - ảnh vệ tinh thật (tối, xanh biển), dùng khi nói về địa lý hiện nay;
   - bản đồ cổ màu nâu vàng, nền biển xanh xám, bờ biển có bóng, dùng khi kể lịch sử (1633, hành trình tàu);
   - nền xanh lưới kỹ thuật (blueprint) khi nói về động vật, số liệu (dingo).
2. **Vùng tô màu** có viền gạch chéo (Pháp xanh, Hà Lan đỏ, đảo cắt làm đôi), đường ranh vàng, đường chấm trắng chạy theo hướng đi.
3. **Nhãn có đề mục**: "Saint-Martin / France" kèm cờ; số đo "5,614 km" kèm đơn vị; mốc năm "1633" chữ serif lớn.
4. **Nhân vật = sticker chibi nửa người**: đầu to, thân trên, có nét viền đen mảnh. Ví dụ: thuyền trưởng đứng trên con tàu buồm, lính Tây Ban Nha cầm cờ trên đảo, hai ông đội mũ nói chuyện nối bằng đường chấm, ông đội mũ cao nằm ngang như "bay" trên bản đồ (đang say gin). Các nước cũng là **lá cờ có mắt, miệng** (nhân hóa), emoji đội mũ cờ Mỹ.
5. **Phụ đề**: chữ trắng nhỏ, giữa khung, ở phần dưới, mỗi lần 2 đến 4 chữ, không viền dày, không tô cam. Không dùng chữ khổng lồ.

## Chuyển động
- Camera trượt và phóng to/thu nhỏ trên bản đồ (từ cả Đại Tây Dương xuống một hòn đảo, rồi xuống cảnh vệ tinh).
- Sticker: trượt dọc đường đi, nảy khi xuất hiện, quay nhẹ; không đi bộ.
- Mỗi 2 đến 3 giây đổi sang một nền hoặc một sticker mới (nhịp rất dày, khoảng một ý mỗi câu).
- Hai nhân vật "đối thoại" chỉ là **hai sticker cạnh nhau, nối bằng đường chấm**, không có bong bóng thoại.

## Việc này làm bằng gì (suy luận)
Ảnh vệ tinh, bản đồ cổ, sticker nhân vật đã vẽ sẵn (có thể là ảnh AI hoặc minh họa cắt nền), ghép bằng trình dựng (After Effects hoặc tương đương). Tức "2D cắt dán chuyển động" trên nền bản đồ, không phải rig nhân vật.

## So với bản thử của mình (film-2d)
| | GeoGlobeTales | Bản thử của mình |
|---|---|---|
| Nhân vật | sticker chibi nửa người, nhỏ, trượt cả khối | cả người, đi bộ, vung tay |
| Cách "kể" | giọng đọc + phụ đề nhỏ + nhãn/đường/vùng tô trên bản đồ | thoại và hành động trực tiếp |
| Nền | 3 kiểu bản đồ thật, đổi liên tục | một đảo vẽ tay |
| Nhịp | đổi hình mỗi 2 đến 3 giây | một cảnh dài 14 giây |

## Việc cần chỉnh để giống (và hợp kênh Clay & Myth)
1. Bỏ rig đi bộ. Làm **thư viện sticker nửa người** (Gaia, Cronos, Rhea, Zeus, Ouranos...) mỗi người 2 đến 3 biểu cảm, vẽ bằng code.
2. Chuyển động sticker: trượt, nảy, nghiêng, phóng to; đường chấm nối các nhân vật hoặc địa điểm.
3. Nền: bản đồ cổ (nâu vàng) là chính cho thần thoại; ảnh vệ tinh thật chỉ khi cần địa điểm hiện nay (Delphi, Crete). Cần dữ liệu bờ biển thật (đang chờ bạn cho phép tải Natural Earth).
4. Phụ đề nhỏ, trắng, 2 đến 4 chữ.
5. Nhịp: đổi hình mỗi 2 đến 4 giây.
6. Khung hình: Shorts của họ là 9:16. Video dài của mình là 16:9; cùng bộ sticker và bản đồ dùng được cho cả Shorts cắt ra từ video.
7. Đây là phong cách tham khảo, không sao chép hình, nhân vật hay cờ của họ.
