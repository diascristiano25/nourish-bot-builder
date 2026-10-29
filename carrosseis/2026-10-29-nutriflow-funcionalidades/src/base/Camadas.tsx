import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { COR } from "../marca";
import { H, ULTIMO, W, ciclo, onda, rnd } from "./tempo";

// CAMADAS COM FOTO E MOVIMENTO CONTÍNUO (o "teto": foto de produto ou ambiente + motion por código).
// Tudo aqui fecha o loop sozinho: no último quadro, cada camada está exatamente onde estava no quadro 0.

/**
 * Foto de fundo que "respira": aproxima e volta devagar no ciclo de 6 s (push-in sem pulo no loop).
 * leitura: degradê da cor de fundo por cima, para o texto ficar legível ("topo", "base" ou "nenhum").
 */
export const Foto: React.FC<{
  src: string;
  zoom?: number;
  derivaX?: number;
  derivaY?: number;
  leitura?: "topo" | "base" | "nenhum";
  forca?: number;
  style?: React.CSSProperties;
}> = ({ src, zoom = 0.05, derivaX = 0, derivaY = 0, leitura = "topo", forca = 0.85, style }) => {
  const f = useCurrentFrame();
  const k = onda(f, 1);
  const grad =
    leitura === "nenhum"
      ? null
      : `linear-gradient(${leitura === "topo" ? "180deg" : "0deg"}, ${hexA(COR.fundo, forca)} 0%, ${hexA(COR.fundo, forca * 0.55)} 38%, ${hexA(COR.fundo, 0)} 70%)`;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Img
        src={staticFile(src)}
        style={{
          position: "absolute",
          inset: 0,
          width: W,
          height: H,
          objectFit: "cover",
          scale: String(1 + zoom * k),
          translate: `${derivaX * k}px ${derivaY * k}px`,
          ...style,
        }}
      />
      {grad ? <AbsoluteFill style={{ background: grad }} /> : null}
    </AbsoluteFill>
  );
};

/** Faz o filho flutuar (sobe e desce) no ciclo de 6 s. */
export const Flutua: React.FC<{ children: React.ReactNode; amplitude?: number; voltas?: number; fase?: number; style?: React.CSSProperties }> = ({
  children,
  amplitude = 14,
  voltas = 1,
  fase = 0,
  style,
}) => {
  const f = useCurrentFrame();
  const y = Math.sin(ciclo(f, voltas) + fase) * amplitude - Math.sin(fase) * amplitude;
  return <div style={{ translate: `0px ${y}px`, ...style }}>{children}</div>;
};

/** Gira o filho. `voltas` inteiras dão uma rotação completa sem pulo; `balanco` em graus faz ir e voltar. */
export const Gira: React.FC<{ children: React.ReactNode; voltas?: number; balanco?: number; style?: React.CSSProperties }> = ({
  children,
  voltas = 0,
  balanco = 0,
  style,
}) => {
  const f = useCurrentFrame();
  const graus = voltas ? (f / ULTIMO) * 360 * voltas : Math.sin(ciclo(f, 1)) * balanco;
  return <div style={{ rotate: `${graus}deg`, ...style }}>{children}</div>;
};

/**
 * Partículas que caem ou sobem (pó, poeira, vapor, faíscas, confete discreto). Cada partícula dá um número
 * inteiro de voltas pela área em 6 s, então o último quadro é igual ao primeiro.
 */
export const Particulas: React.FC<{
  quantidade?: number;
  direcao?: "cai" | "sobe";
  area?: { x: number; y: number; w: number; h: number };
  cor?: string;
  tamanho?: [number, number];
  desfoque?: number;
  opacidade?: number;
  semente?: number;
}> = ({
  quantidade = 40,
  direcao = "cai",
  area = { x: 0, y: 0, w: W, h: H },
  cor = COR.texto,
  tamanho = [3, 8],
  desfoque = 0,
  opacidade = 0.6,
  semente = 1,
}) => {
  const f = useCurrentFrame();
  const t = f / ULTIMO;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", filter: desfoque ? `blur(${desfoque}px)` : undefined }}>
      {Array.from({ length: quantidade }, (_, i) => {
        const r = (k: number) => rnd(i * 7.13 + semente * 31 + k);
        const voltas = 1 + Math.floor(r(1) * 2); // 1 ou 2 voltas por ciclo
        let pos = (r(2) + t * voltas) % 1;
        if (direcao === "sobe") pos = 1 - pos;
        const x = area.x + r(3) * area.w + Math.sin(ciclo(f, voltas) + r(4) * 6) * 12;
        const y = area.y + pos * area.h;
        const borda = Math.min(1, Math.min(pos, 1 - pos) * 8); // some nas bordas da área
        const d = tamanho[0] + r(5) * (tamanho[1] - tamanho[0]);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: d,
              height: d,
              borderRadius: d,
              background: cor,
              opacity: opacidade * borda * (0.5 + r(6) * 0.5),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** "#RRGGBB" + alfa → rgba(). Aceita também rgba()/nomes (devolve como veio). */
export const hexA = (hex: string, a: number) => {
  const m = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};
