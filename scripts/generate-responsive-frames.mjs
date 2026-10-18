import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const HIGHRES_SOURCE_DIR = path.join(rootDir, 'public', 'frames-source');
const DEFAULT_SOURCE_DIR = path.join(rootDir, 'public', 'frames');
const DESKTOP_DIR = path.join(rootDir, 'public', 'frames-desktop');
const MOBILE_DIR = path.join(rootDir, 'public', 'frames-mobile');

// Ensure target directories exist
if (!fs.existsSync(DESKTOP_DIR)) fs.mkdirSync(DESKTOP_DIR, { recursive: true });
if (!fs.existsSync(MOBILE_DIR)) fs.mkdirSync(MOBILE_DIR, { recursive: true });

async function getSourceFiles() {
  let sourceDir = DEFAULT_SOURCE_DIR;
  let files = [];

  // Check if user has placed frames in public/frames-source/
  if (fs.existsSync(HIGHRES_SOURCE_DIR)) {
    const highresFiles = fs.readdirSync(HIGHRES_SOURCE_DIR).filter((f) => /\.(png|jpe?g|webp)$/i.test(f));
    if (highresFiles.length > 0) {
      sourceDir = HIGHRES_SOURCE_DIR;
      files = highresFiles;
      console.log(`✨ Found ${files.length} custom high-res frames in public/frames-source/!`);
    }
  }

  if (files.length === 0 && fs.existsSync(DEFAULT_SOURCE_DIR)) {
    files = fs.readdirSync(DEFAULT_SOURCE_DIR).filter((f) => /\.(png|jpe?g|webp)$/i.test(f));
    console.log(`📦 Using default frames from public/frames/ (${files.length} frames found).`);
  }

  // Sort files naturally by numbers (e.g. 1, 2, 10 instead of 1, 10, 2)
  files.sort((a, b) => {
    const numA = parseInt(a.replace(/\D+/g, ''), 10) || 0;
    const numB = parseInt(b.replace(/\D+/g, ''), 10) || 0;
    return numA - numB;
  });

  return { sourceDir, files };
}

async function processFrames() {
  console.log('====================================================');
  console.log('🚀 HIGH-FIDELITY RESPONSIVE FRAME CONVERSION PIPELINE');
  console.log('====================================================');

  const { sourceDir, files } = await getSourceFiles();
  if (files.length === 0) {
    console.error('❌ No source frames found in public/frames-source or public/frames!');
    process.exit(1);
  }

  const sampleMeta = await sharp(path.join(sourceDir, files[0])).metadata();
  console.log(`📐 Source Resolution: ${sampleMeta.width}x${sampleMeta.height} (${sampleMeta.format})`);
  console.log(`🎞 Total Frames: ${files.length}`);
  console.log(`📁 Source Directory: ${sourceDir}`);
  console.log(`🖥 Desktop Output: ${DESKTOP_DIR}`);
  console.log(`📱 Mobile Output: ${MOBILE_DIR}`);
  console.log('----------------------------------------------------');

  let totalSourceBytes = 0;
  let totalDesktopBytes = 0;
  let totalMobileBytes = 0;
  const startTime = Date.now();

  const isLowResSource = (sampleMeta.width || 0) <= 1280;

  for (let i = 0; i < files.length; i++) {
    const sourceFile = files[i];
    const sourcePath = path.join(sourceDir, sourceFile);
    const sourceStats = fs.statSync(sourcePath);
    totalSourceBytes += sourceStats.size;

    const frameNumber = String(i + 1).padStart(3, '0');
    const desktopFilename = `frame-${frameNumber}.webp`;
    const desktopPath = path.join(DESKTOP_DIR, desktopFilename);
    const mobileFilename = `frame-${frameNumber}.webp`;
    const mobilePath = path.join(MOBILE_DIR, mobileFilename);

    // Desktop Delivery Pipeline:
    // If low-res source, apply subtle edge-preserving sharpening to counteract fuzziness
    let desktopPipeline = sharp(sourcePath);
    if (isLowResSource) {
      desktopPipeline = desktopPipeline.sharpen({
        sigma: 1.0,
        m1: 0.8,
        m2: 2.0,
      });
    }

    await desktopPipeline
      .webp({
        quality: isLowResSource ? 88 : 92,
        effort: 6,
        smartSubsample: true,
        reductionEffort: 6,
      })
      .toFile(desktopPath);

    totalDesktopBytes += fs.statSync(desktopPath).size;

    // Mobile Delivery Pipeline:
    // Scaled for modern high-DPI phone screens (960x540) using Lanczos3 anti-aliasing
    await sharp(sourcePath)
      .resize(960, 540, {
        kernel: sharp.kernel.lanczos3,
        fit: 'cover',
      })
      .webp({
        quality: 84,
        effort: 6,
        smartSubsample: true,
      })
      .toFile(mobilePath);

    totalMobileBytes += fs.statSync(mobilePath).size;

    if ((i + 1) % 30 === 0 || i + 1 === files.length) {
      const pct = Math.round(((i + 1) / files.length) * 100);
      console.log(`✓ Processed ${i + 1}/${files.length} frames (${pct}%)`);
    }
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\n====================================================');
  console.log('✅ FRAME GENERATION PIPELINE COMPLETED SUCCESSFULLY');
  console.log('====================================================');
  console.log(`⏱ Total processing time: ${durationSec}s`);
  console.log(`📁 Source size: ${(totalSourceBytes / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`🖥 Desktop WebP total: ${(totalDesktopBytes / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`📱 Mobile WebP total: ${(totalMobileBytes / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`⚡ Desktop Frame 1: ${(fs.statSync(path.join(DESKTOP_DIR, 'frame-001.webp')).size / 1024).toFixed(1)} KB`);
  console.log(`⚡ Mobile Frame 1: ${(fs.statSync(path.join(MOBILE_DIR, 'frame-001.webp')).size / 1024).toFixed(1)} KB`);
  console.log('====================================================\n');
}

processFrames().catch((err) => {
  console.error('❌ Pipeline failed:', err);
  process.exit(1);
});
