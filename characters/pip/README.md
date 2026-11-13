# Pip: nhân vật chính kênh Shorts lịch sử

Pip là nhân vật chibi gốc, vẽ và chuyển động hoàn toàn bằng code (SVG + JavaScript), không dùng ảnh hay AI vẽ.
Pip lấy cảm hứng từ thể loại của @HeyHistorically nhưng có nhận diện riêng. Không sao chép những thứ đặc trưng của họ: đầu tròn trắng, thẻ địa danh gạch xanh cyan, giọng Hà Lan.

Mở các file `.html` bằng trình duyệt là xem được ngay, không cần cài gì.

## Các file

| File | Nội dung |
|---|---|
| `pip-bible.html` | **Bộ nhận diện chính thức** (bản đã chốt): Pip, 7 biểu cảm, dàn vai phụ dùng chung khuôn, quy tắc màu và tỉ lệ. Hàm `person(o)` ở đây là nguồn gốc để vẽ mọi nhân vật |
| `pip-soldier-rig.html` | Rig chuyển động: tay bám súng bằng IK 2 khớp, chân bám đất theo chu kỳ bước, chuyển tư thế mượt, lò xo phụ (mũ, bi đông), bắn có giật, vỏ đạn, khói. Rig này đang dùng tạo hình Pip đời đầu, cần chuyển sang dáng mới |
| `concepts/mascot-casting.html` | Các hướng linh vật đã thử, không chọn: Bao (bánh bao), Bara (capybara), Coo (bồ câu) |
| `concepts/human-casting.html` | Các kiểu đầu người đã thử: trứng, mochi, đậu phụ |

Bản xem online (riêng tư, chỉ tài khoản Claude của bạn mở được):
- Bộ nhận diện: https://claude.ai/artifact/6No3pNP883RZe9mrMNMqtp
- Rig súng: https://claude.ai/artifact/KpCfCWAji4Y61dVGuN3xHE

## Nhận diện của Pip (giữ cố định ở mọi video)
- **Đầu:** đầu chibi bè ngang (rx 86, ry 80), cao bằng một nửa cả người.
- **Mặt:** mắt hạt nhỏ đặt thấp, có một chấm sáng, không có mũi, má hồng nhạt.
- **Dấu hiệu:** sợi tóc dựng (ahoge) xuyên qua mọi loại mũ, áo xanh `#4F86B8`, túi đeo chéo.
- **Nét vẽ và màu:** viền nâu ấm `#2B2024` dày 5,5. Tông da lấy từ 6 màu trong `SKINS`.
- **Biểu cảm:** `neutral`, `happy`, `shocked`, `smug`, `deadpan`, `angry`, `crying`. Mỗi biểu cảm có ký hiệu manga đi kèm.

## Video đã làm bằng Pip
- `shorts-tests/pip-emu-war/`: Short 01 "The Great Emu War" (30 giây).
  - Phiên bản: v1 có 7 cảnh phẳng, v2 có 17 cảnh quay đủ cỡ cảnh.
  - Cách dựng lại: xem `BUILD.md` trong thư mục đó.
  - Code phim có thêm `personBack()` (Pip quay lưng), các tư thế tay (`salute`, `point`, `grip`, `aim`), emu, súng máy Lewis, xe tải, bộ dựng cảnh ruộng có phối cảnh `farm()`.

## Làm tiếp ở đâu
1. Tách `person()`, `emu()` và các đạo cụ thành một file JS dùng chung, ví dụ `characters/pip/pip.js`. Hiện mỗi trang đang có một bản copy riêng.
2. Chuyển rig IK trong `pip-soldier-rig.html` sang dáng Pip mới, để tay chân diễn thật thay vì chỉ có các tư thế cố định.
3. Thêm góc nhìn chính diện, cùng tay vung khi nói và quay đầu.
4. Thử giọng nam lém lỉnh cho Kokoro, thay cho `af_heart`.
