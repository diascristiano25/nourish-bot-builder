// Conferência antes de mostrar ao aluno.
//   node scripts/conferir.mjs          → todos os slides
//   node scripts/conferir.mjs 01       → só a capa
// Faz cinco coisas:
//  1. LOOP: compara o quadro 0 com o último quadro (PNG, sem compressão). 0 pixel diferente = loop sem pulo.
//  1b. MARGEM: renderiza sem o fundo (fundo magenta de teste) e procura conteúdo nas faixas laterais de margem
//      (0 s, 1,5 s, 3 s, 4,5 s). Foto ou partícula de tela cheia de propósito ficam fora deste teste (vão no `fundo`).
//  2. CELULAR: uma tira por slide no tamanho de tela de celular, com os momentos 0 s · 0,5 s · 2 s · 3,5 s · último
//     → work/conferencia/NN.png  (é para OLHAR: dá para ler a ideia já no primeiro quadro?)
//  3. CARROSSEL: folha com todos os slides, em cima o quadro 0 (quem arrasta rápido) e embaixo o 3,5 s (quem fica)
//     → work/conferencia/carrossel.png
//  4. ARQUIVOS: se já existe entregas/, confere tamanho, duração e áudio de cada MP4.
import { bundle } from "@remotion/bundler";
import { getCompositions, openBrowser, renderStill } from "@remotion/renderer";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { grade, gravarPng, lerPng } from "./png.mjs";

const raiz = process.cwd();
const cli = path.join(raiz, "node_modules/@remotion/cli/remotion-cli.js");
const fp = (args) => execFileSync(process.execPath, [cli, "ffprobe", "-v", "error", ...args]).toString();
const out = path.join(raiz, "work/conferencia");
const tmp = path.join(out, "tmp");
fs.mkdirSync(tmp, { recursive: true });

const pedidos = (process.argv[2] ?? "")
  .split(",")
  .map((x) => x.trim())
  .filter(Boolean)
  .map((x) => `S${x.replace(/^S/i, "").padStart(2, "0")}`);

const ler = (arq) => lerPng(fs.readFileSync(arq));
const MARGEM = Number(/export const MARGEM = (\d+)/.exec(fs.readFileSync(path.join(raiz, "src/marca.ts"), "utf8"))?.[1] ?? 88);

console.log("Preparando o projeto...");
const serveUrl = await bundle({ entryPoint: path.join(raiz, "src/index.ts"), publicDir: path.join(raiz, "assets") });
const browser = await openBrowser("chrome");
const todas = (await getCompositions(serveUrl, { puppeteerInstance: browser })).filter((c) => /^S\d+$/.test(c.id));
const segundos = todas.length ? todas[0].durationInFrames / todas[0].fps : 6;
const lista = pedidos.length ? todas.filter((c) => pedidos.includes(c.id)) : todas;
const problemas = [];
const escala = 0.36; // ≈ 390 px de largura, tela de celular
const tiraQ0 = [];
const tiraQ3 = [];

for (const comp of lista) {
  const nome = comp.id.slice(1);
  const fim = comp.durationInFrames - 1;
  // 1. loop (semFundo desliga o granulado: feTurbulence renderiza diferente por chamada no headless)
  const a = path.join(tmp, `${nome}-q0.png`);
  const b = path.join(tmp, `${nome}-qfim.png`);
  await renderStill({ serveUrl, composition: comp, frame: 0, output: a, imageFormat: "png", inputProps: { semFundo: true }, puppeteerInstance: browser });
  await renderStill({ serveUrl, composition: comp, frame: fim, output: b, imageFormat: "png", inputProps: { semFundo: true }, puppeteerInstance: browser });
  const A = ler(a).px;
  const B = ler(b).px;
  let dif = 0;
  for (let i = 0; i < A.length; i += 4) {
    if (Math.max(Math.abs(A[i] - B[i]), Math.abs(A[i + 1] - B[i + 1]), Math.abs(A[i + 2] - B[i + 2])) > 8) dif++;
  }
  const loopOk = dif === 0;
  if (!loopOk) problemas.push(`slide ${nome}: o último quadro tem ${dif} pixels diferentes do primeiro (o loop vai dar pulo)`);

  // 1b. margem (fundo magenta de teste; conteúdo nas faixas laterais = passou da margem)
  const fora = [];
  for (const t of [0, 1.5, 3, 4.5]) {
    const arq = path.join(tmp, `${nome}-margem.png`);
    await renderStill({ serveUrl, composition: comp, frame: Math.round(t * comp.fps), output: arq, imageFormat: "png", inputProps: { semFundo: true }, puppeteerInstance: browser });
    const { w, h, px } = ler(arq);
    let n = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (x >= MARGEM - 3 && x < w - MARGEM + 3) continue;
        const o = (y * w + x) * 4;
        if (Math.abs(px[o] - 255) > 40 || px[o + 1] > 40 || Math.abs(px[o + 2] - 255) > 40) n++;
      }
    }
    if (n > 0) fora.push(`${String(t).replace(".", ",")} s (${n} px)`);
  }
  if (fora.length) problemas.push(`slide ${nome}: tem conteúdo passando da margem de ${MARGEM} px em ${fora.join(", ")}. Se for proposital (foto ou camada de tela cheia), passe-a pelo \`fundo\` da Moldura.`);

  // 2. tira de celular
  const momentos = [0, 0.5, 2, 3.5, fim / comp.fps];
  const quadros = [];
  for (const [k, t] of momentos.entries()) {
    const q = Math.min(fim, Math.round(t * comp.fps));
    const arq = path.join(tmp, `${nome}-m${k}.png`);
    await renderStill({ serveUrl, composition: comp, frame: q, output: arq, imageFormat: "png", scale: escala, puppeteerInstance: browser });
    quadros.push(ler(arq));
  }
  fs.writeFileSync(path.join(out, `${nome}.png`), gravarPng(grade([quadros])));
  tiraQ0.push(quadros[0]);
  tiraQ3.push(quadros[3]);
  console.log(`  slide ${nome}: loop ${loopOk ? "sem pulo" : `COM PULO (${dif} px)`} · margem ${fora.length ? "PASSOU" : "ok"} · tira em work/conferencia/${nome}.png`);
}

// 3. folha do carrossel
if (tiraQ0.length > 1) {
  fs.writeFileSync(path.join(out, "carrossel.png"), gravarPng(grade([tiraQ0, tiraQ3])));
  console.log("  folha do carrossel: work/conferencia/carrossel.png (em cima: quadro 0 · embaixo: 3,5 s)");
}

await browser.close({ silent: true });
fs.rmSync(serveUrl, { recursive: true, force: true });
fs.rmSync(tmp, { recursive: true, force: true });

// 4. arquivos exportados
const ent = path.join(raiz, "entregas");
if (fs.existsSync(ent)) {
  const mp4s = fs.readdirSync(ent).filter((f) => /^\d+\.mp4$/.test(f)).sort();
  for (const m of mp4s) {
    const info = JSON.parse(fp(["-show_entries", "stream=codec_type,width,height:format=duration", "-of", "json", path.join(ent, m)]));
    const v = info.streams.find((x) => x.codec_type === "video");
    const temAudio = info.streams.some((x) => x.codec_type === "audio");
    const dur = Number(info.format.duration);
    const ok = v && v.width === 1080 && (v.height === 1350 || v.height === 1080) && Math.abs(dur - segundos) < 0.1 && temAudio;
    if (!ok) problemas.push(`${m}: ${v?.width}×${v?.height}, ${dur.toFixed(2)} s, áudio ${temAudio ? "sim" : "não"} (esperado 1080×1350 ou 1080×1080, ${segundos} s, com áudio)`);
    console.log(`  ${m}: ${v?.width}×${v?.height} · ${dur.toFixed(2)} s · áudio ${temAudio ? "sim" : "não"}${ok ? "" : "  ← CONFERIR"}`);
  }
  const semPng = mp4s.filter((m) => !fs.existsSync(path.join(ent, m.replace(".mp4", ".png"))));
  if (semPng.length) problemas.push(`faltam os PNG de: ${semPng.join(", ")}`);
}

console.log(problemas.length ? `\nPROBLEMAS:\n- ${problemas.join("\n- ")}` : "\nTudo certo na parte automática. Agora olhe as tiras no tamanho do celular.");
process.exitCode = problemas.length ? 1 : 0;
