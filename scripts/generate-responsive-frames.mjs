import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const SOURCE_DIR = path.join(rootDir, 'public', 'frames');
const DESKTOP_DIR = path.join(rootDir, 'public', 'frames-desktop');
const MOBILE_DIR = path.join(rootDir, 'public', 'frames-mobile');

const TOTAL_FRAMES = 300;

// Ensure target directories exist
if (!fs.existsSync(DESKTOP_DIR)) {
  fs.mkdirSync(DESKTOP_DIR, { recursive: true });
}
if (!fs.existsSync(MOBILE_DIR)) {
  fs.mkdirSync(MOBILE_DIR, { recursive: true });
}

async function processFrames() {
  console.log('🚀 Starting Responsive Frame Generation Pipeline...');
  console.log(`Source directory: ${SOURCE_DIR}`);
  console.log(`Desktop directory: ${DESKTOP_DIR}`);
  console.log(`Mobile directory: ${MOBILE_DIR}`);

  let totalSourceBytes = 0;
  let totalDesktopBytes = 0;
  let totalMobileBytes = 0;

  const startTime = Date.now();

  for (let i = 1; i <= TOTAL_FRAMES; i++) {
    const frameNumber = String(i).padStart(3, '0');
    const sourceFilename = `ezgif-frame-${frameNumber}.jpg`;
    const sourcePath = path.join(SOURCE_DIR, sourceFilename);

    if (!fs.existsSync(sourcePath)) {
      console.warn(`Warning: Frame not found: ${sourcePath}`);
      continue;
    }

    const sourceStats = fs.statSync(sourcePath);
    totalSourceBytes += sourceStats.size;

    const desktopFilename = `frame-${frameNumber}.webp`;
    const desktopPath = path.join(DESKTOP_DIR, desktopFilename);

    const mobileFilename = `frame-${frameNumber}.webp`;
    const mobilePath = path.join(MOBILE_DIR, mobileFilename);

    // Desktop Delivery Asset:
    // High-fidelity WebP (quality 92, smartSubsample to preserve sharp gradients/edges, lossless alpha/details)
    await sharp(sourcePath)
      .webp({
        quality: 92,
        effort: 6,
        smartSubsample: true,
        reductionEffort: 6,
      })
      .toFile(desktopPath);

    const desktopStats = fs.statSync(desktopPath);
    totalDesktopBytes += desktopStats.size;

    // Mobile Delivery Asset:
    // Scaled for modern high-DPI phone screens (960x540) using Lanczos3 anti-aliasing filter
    await sharp(sourcePath)
      .resize(960, 540, {
        kernel: sharp.kernel.lanczos3,
        fit: 'cover',
      })
      .webp({
        quality: 86,
        effort: 6,
        smartSubsample: true,
      })
      .toFile(mobilePath);

    const mobileStats = fs.statSync(mobilePath);
    totalMobileBytes += mobileStats.size;

    if (i % 30 === 0 || i === TOTAL_FRAMES) {
      console.log(`✓ Processed ${i}/${TOTAL_FRAMES} frames (${Math.round((i / TOTAL_FRAMES) * 100)}%)`);
    }
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\n=========================================');
  console.log('✅ FRAME GENERATION PIPELINE COMPLETE');
  console.log('=========================================');
  console.log(`⏱ Total time: ${durationSec}s`);
  console.log(`📁 Source Master (300 JPEG frames @ 1280x720): ${(totalSourceBytes / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`🖥 Desktop WebP (300 frames @ 1280x720, q=92): ${(totalDesktopBytes / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`📱 Mobile WebP (300 frames @ 960x540, q=86): ${(totalMobileBytes / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`⚡ Desktop Frame 1 size: ${(fs.statSync(path.join(DESKTOP_DIR, 'frame-001.webp')).size / 1024).toFixed(1)} KB`);
  console.log(`⚡ Mobile Frame 1 size: ${(fs.statSync(path.join(MOBILE_DIR, 'frame-001.webp')).size / 1024).toFixed(1)} KB`);
  console.log('=========================================\n');
}

processFrames().catch((err) => {
  console.error('Pipeline failed:', err);
  process.exit(1);
});
