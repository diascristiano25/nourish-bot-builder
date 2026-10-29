import React from "react";
import { useCurrentFrame } from "remotion";
import { COR } from "../../marca";
import { VOLTA, limita, mola, p, rnd, s, volta } from "../tempo";

// VERBO TRANSFORMAR: uma coisa que vira outra. O erro que vira a solução, o rascunho que vira o pronto.
// Regra: a pessoa precisa ver o "antes" por pelo menos 0,5 s antes de ele mudar.

/** Risco que atravessa o texto (como caneta), em `em` segundos. Some no retorno do loop. */
export const Riscar: React.FC<{ children: React.ReactNode; em?: number; cor?: string; espessura?: number; ordem?: number }> = ({
  children,
  em = 1,
  cor = COR.destaque,
  espessura = 0.11,
  ordem = 1,
}) => {
  const f = useCurrentFrame();
  const k = p(f, s(em), 10) * (1 - volta(f, ordem, 12));
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      {children}
      <span
        style={{
          position: "absolute",
          left: "-3%",
          width: "106%",
          top: `calc(52% - ${espessura / 2}em)`,
          height: `${espessura}em`,
          borderRadius: "1em",
          background: cor,
          transformOrigin: "left center",
          scale: `${k} 1`,
          rotate: "-1.5deg",
        }}
      />
    </span>
  );
};

const GLIFOS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*?";

/**
 * Texto que "decodifica": as letras embaralham e se acertam da esquerda para a direita, entre `inicio` e
 * `inicio + dur`. No retorno do loop, apaga da direita para a esquerda. Use em frases curtas (até ~30 letras).
 */
export const Decodificar: React.FC<{ linhas: string[]; inicio?: number; dur?: number; corGlifo?: string }> = ({
  linhas,
  inicio = 2,
  dur = 0.9,
  corGlifo = COR.destaque,
}) => {
  const f = useCurrentFrame();
  const total = linhas.join("").length;
  const ini = s(inicio);
  const d = s(dur);
  let k = 0;
  return (
    <>
      {linhas.map((l, li) => (
        <div key={li} style={{ whiteSpace: "pre" }}>
          {l.split("").map((c, ci) => {
            const idx = k++;
            const pronto = ini + (idx / total) * d;
            const aparece = pronto - 7;
            const fora = f >= VOLTA + ((total - idx) / total) * 10;
            if (c === " ") return <span key={ci}> </span>;
            if (f < aparece || fora) return <span key={ci} style={{ opacity: 0 }}>{c}</span>;
            if (f >= pronto) return <span key={ci}>{c}</span>;
            const g = GLIFOS[Math.floor(rnd(idx * 13 + Math.floor(f / 2)) * GLIFOS.length)];
            return (
              <span key={ci} style={{ color: corGlifo, opacity: 0.85 }}>
                {g}
              </span>
            );
          })}
        </div>
      ))}
    </>
  );
};

/**
 * Troca completa: `antes` aparece, é riscado em `risca`, sai para cima em `troca`, e `depois` entra com mola.
 * Os dois ocupam o mesmo lugar (posicione o pai).
 */
export const Troca: React.FC<{
  antes: React.ReactNode;
  depois: React.ReactNode;
  risca?: number;
  troca?: number;
  corAntes?: string;
}> = ({ antes, depois, risca = 1, troca = 2, corAntes = COR.texto2 }) => {
  const f = useCurrentFrame();
  const sai = p(f, s(troca), 10) * (1 - volta(f, 2, 14));
  const entra = Math.max(0, mola(f, s(troca) + 4, 0, { damping: 12, stiffness: 170 }));
  return (
    <div style={{ position: "relative" }}>
      <div style={{ color: corAntes, opacity: 1 - sai, translate: `0px ${-sai * 80}px` }}>
        <Riscar em={risca}>{antes}</Riscar>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          opacity: limita(entra * 1.5),
          translate: `0px ${(1 - limita(entra)) * 60}px`,
        }}
      >
        {depois}
      </div>
    </div>
  );
};
