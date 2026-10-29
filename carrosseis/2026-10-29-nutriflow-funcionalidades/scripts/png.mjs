// Leitor e gravador de PNG mínimo, sem dependências (só zlib do Node).
// Lê PNG de 8 bits RGB/RGBA sem entrelaçamento (é o que o Remotion grava) e grava PNG RGBA.
import zlib from "node:zlib";

const ASSINATURA = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

export function lerPng(buf) {
  if (!buf.subarray(0, 8).equals(ASSINATURA)) throw new Error("não é PNG");
  let pos = 8;
  let w = 0, h = 0, tipo = 0, prof = 0, entrel = 0;
  const dados = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const nome = buf.toString("ascii", pos + 4, pos + 8);
    const corpo = buf.subarray(pos + 8, pos + 8 + len);
    if (nome === "IHDR") {
      w = corpo.readUInt32BE(0);
      h = corpo.readUInt32BE(4);
      prof = corpo[8];
      tipo = corpo[9];
      entrel = corpo[12];
    } else if (nome === "IDAT") dados.push(corpo);
    else if (nome === "IEND") break;
    pos += 12 + len;
  }
  if (prof !== 8 || entrel !== 0 || (tipo !== 2 && tipo !== 6)) throw new Error(`PNG não suportado (tipo ${tipo}, ${prof} bits)`);
  const bpp = tipo === 6 ? 4 : 3;
  const bruto = zlib.inflateSync(Buffer.concat(dados));
  const linha = w * bpp;
  const px = Buffer.alloc(w * h * 4);
  let ant = Buffer.alloc(linha);
  for (let y = 0; y < h; y++) {
    const filtro = bruto[y * (linha + 1)];
    const lin = Buffer.from(bruto.subarray(y * (linha + 1) + 1, (y + 1) * (linha + 1)));
    for (let x = 0; x < linha; x++) {
      const a = x >= bpp ? lin[x - bpp] : 0;
      const b = ant[x];
      const c = x >= bpp ? ant[x - bpp] : 0;
      let v = lin[x];
      if (filtro === 1) v += a;
      else if (filtro === 2) v += b;
      else if (filtro === 3) v += (a + b) >> 1;
      else if (filtro === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      lin[x] = v & 255;
    }
    for (let x = 0; x < w; x++) {
      const o = (y * w + x) * 4;
      px[o] = lin[x * bpp];
      px[o + 1] = lin[x * bpp + 1];
      px[o + 2] = lin[x * bpp + 2];
      px[o + 3] = bpp === 4 ? lin[x * bpp + 3] : 255;
    }
    ant = lin;
  }
  return { w, h, px };
}

const TABELA = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
const crc = (b) => {
  let c = 0xffffffff;
  for (const x of b) c = TABELA[(c ^ x) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const bloco = (nome, corpo) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(corpo.length);
  const nc = Buffer.concat([Buffer.from(nome, "ascii"), corpo]);
  const cc = Buffer.alloc(4);
  cc.writeUInt32BE(crc(nc));
  return Buffer.concat([len, nc, cc]);
};

export function gravarPng({ w, h, px }) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const bruto = Buffer.alloc(h * (w * 4 + 1));
  for (let y = 0; y < h; y++) px.copy(bruto, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  return Buffer.concat([ASSINATURA, bloco("IHDR", ihdr), bloco("IDAT", zlib.deflateSync(bruto, { level: 6 })), bloco("IEND", Buffer.alloc(0))]);
}

/** Monta uma grade de imagens (linhas × colunas) com borda cinza de `borda` px. */
export function grade(linhas, borda = 8, cinza = 128) {
  const cw = Math.max(...linhas.flat().map((i) => i.w));
  const ch = Math.max(...linhas.flat().map((i) => i.h));
  const cols = Math.max(...linhas.map((l) => l.length));
  const w = cols * (cw + borda) + borda;
  const h = linhas.length * (ch + borda) + borda;
  const px = Buffer.alloc(w * h * 4, cinza);
  for (let i = 3; i < px.length; i += 4) px[i] = 255;
  linhas.forEach((l, li) =>
    l.forEach((img, ci) => {
      const x0 = borda + ci * (cw + borda);
      const y0 = borda + li * (ch + borda);
      for (let y = 0; y < img.h; y++) img.px.copy(px, ((y0 + y) * w + x0) * 4, y * img.w * 4, (y + 1) * img.w * 4);
    }),
  );
  return { w, h, px };
}
