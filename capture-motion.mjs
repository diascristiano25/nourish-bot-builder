import puppeteer from 'puppeteer';
import { execSync } from 'child_process';
import { mkdirSync, rmSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HTML_PATH = resolve(__dirname, 'nutriflow-motion.html');
const FRAMES_DIR = resolve(__dirname, 'frames');
const OUTPUT_MP4 = resolve(__dirname, 'nutriflow-motion.mp4');
const WIDTH = 1920;
const HEIGHT = 1080;
const FPS = 30;
const SLIDE_DURATION_MS = 5000;
const TOTAL_SLIDES = 6;
const TRANSITION_MS = 800;

// Clean and create frames directory
if (existsSync(FRAMES_DIR)) rmSync(FRAMES_DIR, { recursive: true });
mkdirSync(FRAMES_DIR, { recursive: true });

console.log(`🎬 Starting capture: ${TOTAL_SLIDES} slides × ${SLIDE_DURATION_MS}ms = ${(TOTAL_SLIDES * SLIDE_DURATION_MS / 1000).toFixed(0)}s total`);
console.log(`📐 Resolution: ${WIDTH}×${HEIGHT} @ ${FPS}fps`);

const browser = await puppeteer.launch({
  headless: 'new',
  args: [
    `--window-size=${WIDTH},${HEIGHT}`,
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--no-sandbox',
    '--font-render-hinting=none',
    '--force-color-profile=srgb'
  ]
});

const page = await browser.newPage();
await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });

// Load the HTML file
await page.goto(`file:///${HTML_PATH.replace(/\\/g, '/')}`, { waitUntil: 'networkidle0', timeout: 30000 });

// Wait for fonts to load
await page.evaluate(() => document.fonts.ready);
await new Promise(r => setTimeout(r, 1000));

let frameIndex = 0;
const totalFrames = Math.ceil((TOTAL_SLIDES * SLIDE_DURATION_MS) / (1000 / FPS));
const frameInterval = 1000 / FPS;

console.log(`📸 Capturing ${totalFrames} frames...`);

for (let slide = 0; slide < TOTAL_SLIDES; slide++) {
  // Navigate to slide
  if (slide > 0) {
    await page.evaluate((idx) => {
      const slides = document.querySelectorAll('.slide');
      slides.forEach(s => s.classList.remove('active'));
      slides[idx].classList.add('active');
      const progress = document.getElementById('progressBar');
      if (progress) progress.style.transform = `scaleX(${(idx + 1) / slides.length})`;
      const counter = document.getElementById('slideCounter');
      if (counter) {
        counter.textContent = `${idx + 1} / ${slides.length}`;
        counter.style.color = idx === slides.length - 1 ? 'rgba(255,255,255,0.4)' : '';
      }
    }, slide);
    // Wait for transition to complete
    await new Promise(r => setTimeout(r, TRANSITION_MS));
  }

  // Capture frames for this slide's duration
  const framesForSlide = Math.ceil(SLIDE_DURATION_MS / frameInterval);
  for (let f = 0; f < framesForSlide; f++) {
    const paddedIndex = String(frameIndex).padStart(5, '0');
    const framePath = resolve(FRAMES_DIR, `frame_${paddedIndex}.png`);
    await page.screenshot({ path: framePath, type: 'png', clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT } });
    frameIndex++;
    if (frameIndex % 30 === 0) {
      console.log(`  ✓ Frame ${frameIndex}/${totalFrames} (slide ${slide + 1}/${TOTAL_SLIDES})`);
    }
  }
}

await browser.close();
console.log(`✅ Captured ${frameIndex} frames. Encoding MP4...`);

// Encode with ffmpeg using H.264 for maximum compatibility
const ffmpegCmd = [
  'ffmpeg', '-y',
  '-framerate', String(FPS),
  '-i', `"${resolve(FRAMES_DIR, 'frame_%05d.png')}"`,
  '-c:v', 'libx264',
  '-preset', 'medium',
  '-crf', '18',
  '-pix_fmt', 'yuv420p',
  '-movflags', '+faststart',
  '-vf', `scale=${WIDTH}:${HEIGHT}:flags=lanczos`,
  `"${OUTPUT_MP4}"`
].join(' ');

try {
  execSync(ffmpegCmd, { stdio: 'inherit', cwd: __dirname });
  console.log(`\n🎉 MP4 created: ${OUTPUT_MP4}`);

  // Get file size
  const stats = execSync(`wc -c < "${OUTPUT_MP4}"`, { encoding: 'utf-8' }).trim();
  const sizeMB = (parseInt(stats) / (1024 * 1024)).toFixed(1);
  console.log(`📦 File size: ${sizeMB} MB`);
} catch (err) {
  console.error('❌ FFmpeg encoding failed:', err.message);
  process.exit(1);
}

// Cleanup frames
rmSync(FRAMES_DIR, { recursive: true });
console.log('🧹 Cleaned up frames directory.');