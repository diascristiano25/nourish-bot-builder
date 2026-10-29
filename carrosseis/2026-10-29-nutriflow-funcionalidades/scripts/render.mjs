// Exporta os slides: um MP4 por slide (com som) + um PNG do primeiro quadro.
//   node scripts/render.mjs          → todos os slides
//   node scripts/render.mjs 01       → só a capa (a amostra)
//   node scripts/render.mjs 02,05    → só esses
// Saída: entregas/01.mp4, entregas/01.png, ...  (1080 × 1350, H.264 + AAC, 6 s)
import { bundle } from "@remotion/bundler";
import { getCompositions, openBrowser, renderMedia, renderStill } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";

const raiz = process.cwd();
const saida = path.join(raiz, "entregas");
fs.mkdirSync(saida, { recursive: true });

const pedidos = (process.argv[2] ?? "")
  .split(",")
  .map((x) => x.trim())
  .filter(Boolean)
  .map((x) => `S${x.replace(/^S/i, "").padStart(2, "0")}`);

console.log("Preparando o projeto...");
const serveUrl = await bundle({ entryPoint: path.join(raiz, "src/index.ts"), publicDir: path.join(raiz, "assets") });
const browser = await openBrowser("chrome");
const todas = await getCompositions(serveUrl, { puppeteerInstance: browser });
const lista = pedidos.length ? todas.filter((c) => pedidos.includes(c.id)) : todas.filter((c) => /^S\d+$/.test(c.id));
const faltam = pedidos.filter((p) => !todas.some((c) => c.id === p));
if (faltam.length) console.log(`Não existe(m): ${faltam.join(", ")}. Confira src/slides/index.ts.`);

for (const comp of lista) {
  const nome = comp.id.slice(1);
  const t0 = Date.now();
  let ultimo = -1;
  await renderMedia({
    serveUrl,
    composition: comp,
    codec: "h264",
    crf: 16,
    pixelFormat: "yuv420p",
    audioCodec: "aac",
    audioBitrate: "192k",
    enforceAudioTrack: true,
    imageFormat: "jpeg",
    jpegQuality: 95,
    outputLocation: path.join(saida, `${nome}.mp4`),
    puppeteerInstance: browser,
    onProgress: ({ progress }) => {
      const pct = Math.floor(progress * 10) * 10;
      if (pct !== ultimo) {
        ultimo = pct;
        process.stdout.write(`\r  slide ${nome}: ${pct}%   `);
      }
    },
  });
  await renderStill({
    serveUrl,
    composition: comp,
    frame: 0,
    output: path.join(saida, `${nome}.png`),
    imageFormat: "png",
    puppeteerInstance: browser,
  });
  console.log(`\r  slide ${nome}: pronto em ${((Date.now() - t0) / 1000).toFixed(0)} s → entregas/${nome}.mp4 e ${nome}.png`);
}

await browser.close({ silent: true });
fs.rmSync(serveUrl, { recursive: true, force: true });
console.log(`Feito: ${lista.length} slide(s) em entregas/.`);
