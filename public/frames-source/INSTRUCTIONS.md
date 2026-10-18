# 📸 HOW TO ADD HIGH-QUALITY 3D FRAMES / PHOTOS

To dramatically increase your 3D video / globe quality from blurry 720p to crisp 1080p, 1440p, or 4K:

### Option A: You have a 3D Animation Video (.mp4 / .mov / .webm)
1. Re-render or export your 3D globe animation in **1920x1080** (or 2560x1440) as high-bitrate video or image sequence.
2. If you have an image sequence (PNG or JPG), simply copy all the frames into this folder:
   `public/frames-source/`
   (e.g., `frame-001.png`, `frame-002.png`, ... or `0001.png`, etc.)
3. Run the conversion command in terminal:
   `node scripts/generate-responsive-frames.mjs`
4. The system will automatically convert them into optimized, high-fidelity WebP frames for desktop and mobile!

---

### Option B: Recommended Frame Settings
- **Resolution**: 1920×1080 (Full HD) or 2560×1440 (2K Quad HD)
- **Format**: PNG (Lossless) or high-quality JPG (Quality 95+)
- **Frame Count**: 150 to 300 frames (150 frames is optimal for buttery smooth scroll with 50% faster loading speed)
- **Naming**: Sequential numbers like `frame-001.png` ... `frame-150.png` or `001.jpg` ... `300.jpg`

---

*Once you place your files in this folder, tell the assistant "I added the photos" and it will immediately generate the high-res 3D sequence for you!*
