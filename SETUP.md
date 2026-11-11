# Cài lại và làm tiếp trên máy mới

Repo này chứa toàn bộ mã nguồn, kịch bản, bảng kiểm sự thật, text đăng YouTube, thumbnail và bộ nhớ của Claude.
Không có trong git (dựng lại được từ mã nguồn): video .mp4, ảnh khung hình render, file .wav, venv Python, file model Kokoro.

## 1. Cài công cụ (Windows)

```powershell
winget install OpenJS.NodeJS Gyan.FFmpeg Google.Chrome Python.Python.3.12 Git.Git
```
Đóng và mở lại terminal / VS Code sau khi cài.

## 2. Clone repo

```powershell
cd C:\Users\<tên-user>
git clone https://github.com/ducthanh2001/ai-gen-video-short.git kenh-youtube
```
Nên đặt ở `C:\Users\PC\kenh-youtube` như máy cũ, vì nhiều script dùng đường dẫn tuyệt đối.

## 3. Giọng đọc Kokoro và model

Các script đọc model ở `C:/Users/PC/lemo-opuscar/core/tts/`. Cách nhanh nhất là clone Lemo-Opuscar vào đúng chỗ đó rồi tải 2 file model (không có trong git vì nặng 325 MB):

```powershell
git clone https://github.com/lemomo-ai/lemo-opuscar.git C:\Users\PC\lemo-opuscar
cd C:\Users\PC\lemo-opuscar\core\tts
curl.exe -L -o kokoro-v1.0.onnx https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
curl.exe -L -o voices-v1.0.bin  https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
```
Nếu user Windows không tên là `PC`, sửa đường dẫn `C:/Users/PC/...` trong `tools/narrate.py` và file `narrate_*.py` của tập đang làm.

Tạo venv cho TTS và kiểm tra giọng (ASR):

```powershell
cd C:\Users\PC\kenh-youtube
py -3.12 -m venv tools\kvenv
tools\kvenv\Scripts\python -m pip install -r tools\requirements-kokoro.txt -r tools\requirements-asr.txt
```

## 4. Skill và bộ nhớ của Claude Code

- cinecode (dựng phim bằng code): `git clone https://github.com/sarpstar/cinecode.git %USERPROFILE%\.claude\skills\cinecode`
- lemo-plus (bản sao trong repo): copy `claude-skills\lemo-plus` vào `%USERPROFILE%\.claude\skills\lemo-plus`
- Bộ nhớ: copy các file trong `claude-memory\` vào `%USERPROFILE%\.claude\projects\C--Users-PC\memory\`.
  Tên thư mục `C--Users-PC` là thư mục bạn mở Claude Code (ở đây là `C:\Users\PC`). Mở ở thư mục khác thì tên khác, ví dụ `C--Users-PC-kenh-youtube`.
- review-kich-ban (checklist chấm kịch bản): copy `claude-skills\review-kich-ban` vào `%USERPROFILE%\.claude\skills\review-kich-ban`
eview-kich-ban` vào `%USERPROFILE%.claudeskills
eview-kich-ban`

## 5. Làm tập Shorts tiếp theo

Mở Claude Code ở `C:\Users\PC` và nói, ví dụ:

> Đọc claude-memory/MEMORY.md, kenh-youtube/shorts-tests/kich-ban-b-ancient/KICH-BAN-B.md và kenh-youtube/shorts/b02-roman-concrete/NOTES.md. Làm tập B03 cùng format với B02.

Mỗi tập Shorts nằm trong `shorts/<mã-tập>/`:
- `SCRIPT.md`: lời kể và hình từng cảnh
- `FACTS.md`: bảng kiểm sự thật và nguồn
- `REVIEW.md`: chấm điểm kịch bản
- `YOUTUBE.md`: title, mô tả, bình luận ghim
- `NOTES.md`: cách dựng lại
- `film/`: mã nguồn hình, giọng, mix

Dựng lại video một tập: làm theo `NOTES.md` trong thư mục tập đó.
