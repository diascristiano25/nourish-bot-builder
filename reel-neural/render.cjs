// Renders index.html deterministically, frame by frame, to PNGs.
// uso:  node render.cjs preview 0.5,1.5,3,...        -> out/preview/*.png
//       node render.cjs full [fps=30] [start] [end]  -> out/frames/f_00000.png ...
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');

(async () => {
  const [mode, arg1, arg2, arg3] = process.argv.slice(2);
  const browser = await chromium.launch({ args: ['--no-sandbox', '--font-render-hinting=none', '--force-color-profile=srgb'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error('PAGE ERROR', e.message));
  await page.goto('file://' + path.resolve(__dirname, 'index.html'));
  await page.waitForFunction('window.ready === true');
  const stage = await page.$('#stage');

  if (mode === 'preview') {
    const dir = path.resolve(__dirname, 'out/preview'); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
    for (const t of arg1.split(',').map(Number)) {
      await page.evaluate(t => window.renderFrame(t), t);
      await stage.screenshot({ path: `${dir}/t_${t.toFixed(2).padStart(5, '0')}.png` });
    }
  } else {
    const fps = +(arg1 || 30), DUR = await page.evaluate('window.DUR');
    const a = Math.round((+(arg2 || 0)) * fps), b = Math.round((+(arg3 || DUR)) * fps);
    const dir = path.resolve(__dirname, 'out/frames'); fs.mkdirSync(dir, { recursive: true });
    const t0 = Date.now();
    for (let i = a; i < b; i++) {
      await page.evaluate(t => window.renderFrame(t), i / fps);
      await stage.screenshot({ path: `${dir}/f_${String(i).padStart(5, '0')}.png` });
      if (i % 30 === 0) console.log(`frame ${i}/${b}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
  }
  await browser.close();
})();
