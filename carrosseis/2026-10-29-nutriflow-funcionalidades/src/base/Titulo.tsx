import React from "react";
import { useCurrentFrame } from "remotion";
import { COR, ESTILO_DESTAQUE, FONTE, MARGEM, TAMANHO } from "../marca";
import { ULTIMO, p, volta } from "./tempo";

/**
 * O TÍTULO DO SLIDE. Fica inteiro e legível desde o quadro 0 (regra 1: quem arrasta rápido leva a ideia).
 * Não anime a entrada do título. Para dar vida, use <Marca> numa palavra-chave.
 *
 * linhas: cada item é uma linha (quebra manual = controle total da leitura).
 * rotulo: etiqueta pequena acima ("ERRO 1", "PASSO 2", "MITO").
 * sub:    frase de apoio embaixo, menor e mais clara.
 */
export const Titulo: React.FC<{
  linhas: React.ReactNode[];
  top?: number;
  tamanho?: number;
  sub?: React.ReactNode;
  rotulo?: string;
  alinhar?: "left" | "center";
  cor?: string;
  largura?: number;
}> = ({ linhas, top = 176, tamanho = TAMANHO.titulo, sub, rotulo, alinhar = "left", cor = COR.texto, largura }) => (
  <div
    style={{
      position: "absolute",
      left: MARGEM,
      right: largura ? undefined : MARGEM,
      width: largura,
      top,
      textAlign: alinhar,
    }}
  >
    {rotulo ? <Rotulo>{rotulo}</Rotulo> : null}
    <div>
      {linhas.map((l, i) => (
        <div
          key={i}
          style={{
            fontFamily: FONTE.titulo,
            fontWeight: FONTE.pesoTitulo,
            fontSize: tamanho,
            lineHeight: `${Math.round(tamanho * 1.02)}px`,
            letterSpacing: FONTE.espacoTitulo,
            color: cor,
            whiteSpace: "nowrap",
          }}
        >
          {l}
        </div>
      ))}
    </div>
    {sub ? (
      <div
        style={{
          marginTop: Math.round(tamanho * 0.3),
          fontFamily: FONTE.texto,
          fontWeight: FONTE.pesoTexto,
          fontSize: TAMANHO.apoio,
          lineHeight: `${Math.round(TAMANHO.apoio * 1.3)}px`,
          color: COR.texto2,
          letterSpacing: "-0.01em",
        }}
      >
        {sub}
      </div>
    ) : null}
  </div>
);

/** Etiqueta com contorno na cor de destaque. */
export const Rotulo: React.FC<{ children: React.ReactNode; cheio?: boolean }> = ({ children, cheio }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      height: 46,
      padding: "0 20px",
      borderRadius: 23,
      border: `2px solid ${COR.destaque}`,
      background: cheio ? COR.destaque : "transparent",
      color: cheio ? COR.sobreDestaque : COR.destaque,
      fontFamily: FONTE.texto,
      fontWeight: 800,
      fontSize: TAMANHO.rotulo,
      letterSpacing: "0.18em",
      marginBottom: 30,
    }}
  >
    {children}
  </div>
);

/** Faixa atrás da palavra (estilo "faixa"): fica inteira no quadro 0. */
const faixa: React.CSSProperties = {
  background: COR.destaque,
  color: COR.sobreDestaque,
  padding: "0 0.12em",
  borderRadius: "0.08em",
  boxDecorationBreak: "clone",
  WebkitBoxDecorationBreak: "clone",
};

/** Palavra destacada (sem animação). Segue ESTILO_DESTAQUE do marca.ts. */
export const Destaque: React.FC<{ children: React.ReactNode }> = ({ children }) =>
  ESTILO_DESTAQUE === "faixa" ? <span style={faixa}>{children}</span> : <span style={{ color: COR.destaque }}>{children}</span>;

/**
 * Palavra-chave destacada (cor ou faixa, conforme ESTILO_DESTAQUE) com uma barra que se desenha embaixo
 * (0 → 0,37 s, junto com o whoosh) e recolhe no retorno do loop. A palavra já está destacada no quadro 0;
 * só a barra anima.
 */
export const Marca: React.FC<{ children: React.ReactNode; em?: number }> = ({ children, em = 0 }) => {
  const f = useCurrentFrame();
  const barra = p(f, em, 11) * (1 - volta(f, 0, 12));
  const comFaixa = ESTILO_DESTAQUE === "faixa";
  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        ...(comFaixa ? faixa : { color: COR.destaque }),
      }}
    >
      <span
        style={{
          position: "absolute",
          left: "0.02em",
          right: "0.06em",
          bottom: "0.02em",
          height: "0.1em",
          borderRadius: 8,
          background: comFaixa ? COR.sobreDestaque : COR.destaque,
          transformOrigin: f < ULTIMO / 2 ? "left center" : "right center",
          scale: `${barra} 1`,
        }}
      />
      {children}
    </span>
  );
};

/** Texto de corpo (detalhes, legendas de gráfico). */
export const Texto: React.FC<{
  children: React.ReactNode;
  tamanho?: number;
  cor?: string;
  peso?: number;
  style?: React.CSSProperties;
}> = ({ children, tamanho = TAMANHO.detalhe, cor = COR.texto2, peso = 700, style }) => (
  <div
    style={{
      fontFamily: FONTE.texto,
      fontWeight: peso,
      fontSize: Math.max(tamanho, TAMANHO.minimo),
      lineHeight: `${Math.round(Math.max(tamanho, TAMANHO.minimo) * 1.3)}px`,
      color: cor,
      ...style,
    }}
  >
    {children}
  </div>
);
