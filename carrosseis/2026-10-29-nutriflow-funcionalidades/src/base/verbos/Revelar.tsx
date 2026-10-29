import React from "react";
import { useCurrentFrame } from "remotion";
import { BATIDA, limita, mola, presenca, s } from "../tempo";

// VERBO REVELAR: a informação aparece na hora em que importa.
// Use para: passos de uma lista, o detalhe que completa o título, a resposta depois da pergunta.

export type JeitoRevelar = "sobe" | "mascara" | "escala" | "desfoque" | "aparece";

/**
 * Faz o conteúdo entrar em `em` segundos e sair no retorno do loop.
 * sobe:     sobe 40 px e acende (o mais neutro, serve para quase tudo)
 * mascara:  é "desenhado" da esquerda para a direita (frases, barras, linhas do tempo)
 * escala:   cresce com mola (ícones, selos, números isolados)
 * desfoque: sai do desfoque (respostas, "o segredo é...")
 * aparece:  só acende (quando o movimento atrapalharia a leitura)
 */
export const Revela: React.FC<{
  em: number;
  dur?: number;
  jeito?: JeitoRevelar;
  ordem?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ em, dur = 0.45, jeito = "sobe", ordem = 0, children, style }) => {
  const f = useCurrentFrame();
  const k = presenca(f, s(em), s(dur), ordem);
  let estilo: React.CSSProperties = {};
  if (jeito === "sobe") estilo = { opacity: k, translate: `0px ${(1 - k) * 40}px` };
  if (jeito === "aparece") estilo = { opacity: k };
  if (jeito === "mascara") estilo = { clipPath: `inset(-10% ${(1 - k) * 100}% -10% 0)` };
  if (jeito === "desfoque") estilo = { opacity: k, filter: `blur(${(1 - k) * 16}px)` };
  if (jeito === "escala") {
    const m = Math.max(0, mola(f, s(em), ordem));
    estilo = { scale: String(m), opacity: limita(m * 2) };
  }
  return <div style={{ ...style, ...estilo }}>{children}</div>;
};

/**
 * Lista que se revela um item por vez, na batida (padrão: um item a cada 1 s a partir de 1 s).
 * No retorno do loop, o último item sai primeiro.
 */
export const Lista: React.FC<{
  itens: React.ReactNode[];
  inicio?: number;
  intervalo?: number;
  jeito?: JeitoRevelar;
  espaco?: number;
  style?: React.CSSProperties;
}> = ({ itens, inicio = 1, intervalo = BATIDA * 2, jeito = "sobe", espaco = 28, style }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: espaco, ...style }}>
    {itens.map((item, i) => (
      <Revela key={i} em={inicio + i * intervalo} jeito={jeito} ordem={itens.length - 1 - i}>
        {item}
      </Revela>
    ))}
  </div>
);
