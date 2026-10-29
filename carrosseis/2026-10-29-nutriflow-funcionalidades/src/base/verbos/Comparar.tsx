import React from "react";
import { useCurrentFrame } from "remotion";
import { COR, FONTE, MARGEM, TAMANHO } from "../../marca";
import { Check, Xis } from "../Icones";
import { MEIO, W, lerp, limita, mola, p, presenca, s, volta } from "../tempo";

// VERBO COMPARAR: o antes e o depois, o errado e o certo, lado a lado.
// Regra: as duas coisas ficam visíveis ao mesmo tempo, e o "vencedor" ganha a cor de destaque por último.

/**
 * Dois cartões (lado a lado ou um embaixo do outro). O primeiro entra em `inicio`, o segundo um tempo depois,
 * e em `vence` o segundo acende com borda e selo de certo, enquanto o primeiro apaga um pouco e ganha um X.
 */
export const Comparar: React.FC<{
  antes: React.ReactNode;
  depois: React.ReactNode;
  rotuloAntes?: string;
  rotuloDepois?: string;
  inicio?: number;
  intervalo?: number;
  vence?: number;
  top?: number;
  altura?: number;
  empilhado?: boolean;
}> = ({
  antes,
  depois,
  rotuloAntes = "ANTES",
  rotuloDepois = "DEPOIS",
  inicio = 1,
  intervalo = 1,
  vence = 3,
  top = 620,
  altura = 520,
  empilhado = false,
}) => {
  const f = useCurrentFrame();
  const kA = presenca(f, s(inicio), s(0.45), 2);
  const kB = presenca(f, s(inicio + intervalo), s(0.45), 1);
  const ganha = presenca(f, s(vence), s(0.3), 0);
  const selo = Math.max(0, mola(f, s(vence), 0));
  const larguraTotal = W - MARGEM * 2;
  const gap = 28;
  const larg = empilhado ? larguraTotal : (larguraTotal - gap) / 2;
  const alt = empilhado ? (altura - gap) / 2 : altura;

  const cartao = (conteudo: React.ReactNode, rotulo: string, k: number, eDepois: boolean) => (
    <div
      style={{
        position: "relative",
        width: larg,
        height: alt,
        borderRadius: 28,
        background: COR.superficie,
        border: `3px solid ${eDepois && ganha > 0.5 ? COR.destaque : COR.linha}`,
        opacity: k * (eDepois ? 1 : 1 - 0.3 * ganha),
        translate: `0px ${(1 - k) * 40}px`,
        overflow: "hidden",
        padding: 36,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          fontFamily: FONTE.texto,
          fontWeight: 800,
          fontSize: TAMANHO.rotulo,
          letterSpacing: "0.16em",
          color: eDepois ? COR.destaque : COR.texto2,
          marginBottom: 22,
        }}
      >
        {rotulo}
      </div>
      {conteudo}
      <div style={{ position: "absolute", right: 26, top: 22, scale: String(selo) }}>
        {eDepois ? <Check tamanho={58} /> : <Xis tamanho={58} />}
      </div>
    </div>
  );

  return (
    <div
      style={{
        position: "absolute",
        left: MARGEM,
        top,
        width: larguraTotal,
        display: "flex",
        flexDirection: empilhado ? "column" : "row",
        gap,
      }}
    >
      {cartao(antes, rotuloAntes, kA, false)}
      {cartao(depois, rotuloDepois, kB, true)}
    </div>
  );
};

/**
 * Cortina de antes × depois: a camada `depois` é revelada por uma divisória que corre da direita até `ate`
 * (0 a 1 da largura). Ótima com fotos (pele, ambiente, design, edição de imagem).
 */
export const Cortina: React.FC<{
  antes: React.ReactNode;
  depois: React.ReactNode;
  inicio?: number;
  dur?: number;
  ate?: number;
  left?: number;
  top?: number;
  largura?: number;
  altura?: number;
  raio?: number;
}> = ({ antes, depois, inicio = 1, dur = 1.4, ate = 0.5, left = MARGEM, top = 600, largura = W - MARGEM * 2, altura = 560, raio = 28 }) => {
  const f = useCurrentFrame();
  const k = p(f, s(inicio), s(dur), MEIO) * (1 - volta(f, 0, 16));
  const x = lerp(1, ate, k) * largura;
  const alca = limita(k * 6);
  return (
    <div style={{ position: "absolute", left, top, width: largura, height: altura, borderRadius: raio, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0 }}>{antes}</div>
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 0 0 ${x}px)` }}>{depois}</div>
      <div style={{ position: "absolute", top: 0, bottom: 0, left: x - 3, width: 6, background: COR.texto, opacity: alca }} />
      <div
        style={{
          position: "absolute",
          left: x - 34,
          top: altura / 2 - 34,
          width: 68,
          height: 68,
          borderRadius: 34,
          background: COR.texto,
          opacity: alca,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width={36} height={20} viewBox="0 0 36 20">
          <path d="M10 2 L2 10 L10 18 M26 2 L34 10 L26 18" stroke={COR.fundo} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
};
