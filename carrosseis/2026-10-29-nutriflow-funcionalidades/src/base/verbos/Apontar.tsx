import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COR } from "../../marca";
import { H, W, limita, p, presenca, s, volta } from "../tempo";

// VERBO APONTAR: leva o olho para o detalhe. Seta, círculo à mão, holofote, pulso.
// Regra: aponte UMA coisa por slide, e só depois que ela já está na tela.
// Todos ficam numa camada do tamanho do quadro: as coordenadas são em pixels do quadro (1080 × 1350).

/** Círculo "feito à mão" em volta de um ponto. A ponta passa um pouco do começo, como caneta. */
export const CirculoMao: React.FC<{
  cx: number;
  cy: number;
  rx?: number;
  ry?: number;
  em?: number;
  dur?: number;
  cor?: string;
  espessura?: number;
  ordem?: number;
}> = ({ cx, cy, rx = 120, ry = 90, em = 2, dur = 0.5, cor = COR.texto, espessura = 6, ordem = 1 }) => {
  const f = useCurrentFrame();
  const k = p(f, s(em), s(dur)) * (1 - volta(f, ordem, 12));
  const pts: string[] = [];
  const n = 90;
  for (let i = 0; i <= n; i++) {
    const a = -Math.PI * 0.62 + (i / n) * Math.PI * 2.18;
    const r = 1 + 0.045 * Math.sin(3 * a + 1.2) + (i / n) * 0.07;
    pts.push(`${i ? "L" : "M"}${(cx + Math.cos(a) * rx * r).toFixed(1)} ${(cy + Math.sin(a) * ry * r).toFixed(1)}`);
  }
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={W} height={H}>
        <path
          d={pts.join(" ")}
          fill="none"
          stroke={cor}
          strokeWidth={espessura}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={1 - k}
          opacity={k > 0.001 ? 1 : 0}
        />
      </svg>
    </AbsoluteFill>
  );
};

/** Seta curva que se desenha de `de` até `para`, com a ponta aparecendo no fim. */
export const Seta: React.FC<{
  de: [number, number];
  para: [number, number];
  curva?: number;
  em?: number;
  dur?: number;
  cor?: string;
  espessura?: number;
  ordem?: number;
}> = ({ de, para, curva = 0.25, em = 2, dur = 0.5, cor = COR.destaque, espessura = 7, ordem = 1 }) => {
  const f = useCurrentFrame();
  const k = p(f, s(em), s(dur)) * (1 - volta(f, ordem, 12));
  const [x0, y0] = de;
  const [x1, y1] = para;
  const mx = (x0 + x1) / 2 - (y1 - y0) * curva;
  const my = (y0 + y1) / 2 + (x1 - x0) * curva;
  // direção da ponta = tangente no fim da curva
  const ang = Math.atan2(y1 - my, x1 - mx);
  const t = 30;
  const ponta = limita((k - 0.8) / 0.2);
  const a1 = ang + Math.PI * 0.82;
  const a2 = ang - Math.PI * 0.82;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={W} height={H}>
        <path
          d={`M${x0} ${y0} Q ${mx} ${my} ${x1} ${y1}`}
          fill="none"
          stroke={cor}
          strokeWidth={espessura}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={1 - k}
          opacity={k > 0.001 ? 1 : 0}
        />
        <path
          d={`M${x1 + Math.cos(a1) * t} ${y1 + Math.sin(a1) * t} L${x1} ${y1} L${x1 + Math.cos(a2) * t} ${y1 + Math.sin(a2) * t}`}
          fill="none"
          stroke={cor}
          strokeWidth={espessura}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={ponta}
        />
      </svg>
    </AbsoluteFill>
  );
};

/** Holofote: escurece o quadro todo, menos um círculo em volta do detalhe. */
export const Holofote: React.FC<{ x: number; y: number; raio?: number; em?: number; escuro?: number; ordem?: number }> = ({
  x,
  y,
  raio = 200,
  em = 2,
  escuro = 0.62,
  ordem = 1,
}) => {
  const f = useCurrentFrame();
  const k = presenca(f, s(em), s(0.4), ordem);
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        opacity: k,
        background: `radial-gradient(circle at ${x}px ${y}px, transparent ${raio}px, rgba(0,0,0,${escuro}) ${raio + 60}px)`,
      }}
    />
  );
};

/** Pulso: anéis que se abrem a partir de um ponto, a cada `periodo` segundos, depois de `em`. */
export const Pulso: React.FC<{ x: number; y: number; raio?: number; em?: number; periodo?: number; cor?: string; ordem?: number }> = ({
  x,
  y,
  raio = 60,
  em = 2,
  periodo = 1,
  cor = COR.destaque,
  ordem = 1,
}) => {
  const f = useCurrentFrame();
  const vivo = presenca(f, s(em), 6, ordem);
  const t = Math.max(0, f - s(em)) / s(periodo);
  const fase = t - Math.floor(t);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={W} height={H}>
        <circle cx={x} cy={y} r={raio * 0.35} fill={cor} opacity={vivo} />
        <circle cx={x} cy={y} r={raio * (0.35 + fase * 0.9)} fill="none" stroke={cor} strokeWidth={5} opacity={vivo * (1 - fase)} />
      </svg>
    </AbsoluteFill>
  );
};
