import React from "react";
import { useCurrentFrame } from "remotion";
import { COR, FONTE } from "../../marca";
import { limita, mola, presenca, s, valorContagem } from "../tempo";

// VERBO CONTAR: um número que muda na frente da pessoa.
// Use para: dados, preços de antes × depois (sem preço de oferta), tempo, porcentagem, quantidade.
// Regra: o número final é o que importa; a contagem é curta (0,8 a 1,5 s) e termina num "clique".

const fmt = (v: number, casas: number) =>
  new Intl.NumberFormat("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas }).format(v);

/**
 * Contador de `de` até `ate`, entre `inicio` e `fim` (segundos). Volta para `de` no retorno do loop.
 * Cada dígito tem largura fixa, para o número não "tremer" enquanto conta.
 */
export const Contador: React.FC<{
  ate: number;
  de?: number;
  inicio?: number;
  fim?: number;
  casas?: number;
  prefixo?: string;
  sufixo?: string;
  tamanho?: number;
  cor?: string;
  corSufixo?: string;
  ordem?: number;
  style?: React.CSSProperties;
}> = ({
  ate,
  de = 0,
  inicio = 1,
  fim = 2.2,
  casas = 0,
  prefixo = "",
  sufixo = "",
  tamanho = 260,
  cor = COR.texto,
  corSufixo = COR.destaque,
  ordem = 0,
  style,
}) => {
  const f = useCurrentFrame();
  const v = valorContagem(f, de, ate, inicio, fim, ordem);
  const pulso = Math.max(0, mola(f, s(fim), ordem, { damping: 9, stiffness: 260 }) - mola(f, s(fim) + 3, ordem, { damping: 9, stiffness: 260 }));
  const txt = fmt(v, casas);
  return (
    <div
      style={{
        fontFamily: FONTE.titulo,
        fontWeight: FONTE.pesoTitulo,
        fontSize: tamanho,
        lineHeight: `${tamanho}px`,
        letterSpacing: "-0.03em",
        color: cor,
        display: "flex",
        alignItems: "baseline",
        whiteSpace: "nowrap",
        scale: String(1 + 0.05 * pulso),
        transformOrigin: "left bottom",
        ...style,
      }}
    >
      {prefixo ? <span style={{ fontSize: tamanho * 0.42, marginRight: tamanho * 0.08, color: corSufixo }}>{prefixo}</span> : null}
      {txt.split("").map((c, i) => (
        <span key={i} style={{ display: "inline-block", width: /\d/.test(c) ? "0.62em" : "0.28em", textAlign: "center" }}>
          {c}
        </span>
      ))}
      {sufixo ? <span style={{ fontSize: tamanho * 0.42, marginLeft: tamanho * 0.08, color: corSufixo }}>{sufixo}</span> : null}
    </div>
  );
};

/** Barra que enche até `valor` (0 a 1). Bom para comparar proporções e mostrar progresso. */
export const Barra: React.FC<{
  valor: number;
  inicio?: number;
  dur?: number;
  largura: number;
  altura?: number;
  cor?: string;
  trilho?: string;
  ordem?: number;
  style?: React.CSSProperties;
}> = ({ valor, inicio = 1, dur = 1, largura, altura = 22, cor = COR.destaque, trilho = COR.linha, ordem = 0, style }) => {
  const f = useCurrentFrame();
  const k = limita(presenca(f, s(inicio), s(dur), ordem));
  return (
    <div style={{ width: largura, height: altura, borderRadius: altura / 2, background: trilho, overflow: "hidden", ...style }}>
      <div style={{ width: largura * valor * k, height: altura, borderRadius: altura / 2, background: cor }} />
    </div>
  );
};

/** Anel de porcentagem (0 a 1), desenhado em volta de um número ou ícone. */
export const Anel: React.FC<{
  valor: number;
  inicio?: number;
  dur?: number;
  raio?: number;
  espessura?: number;
  cor?: string;
  trilho?: string;
  ordem?: number;
  children?: React.ReactNode;
}> = ({ valor, inicio = 1, dur = 1.2, raio = 180, espessura = 26, cor = COR.destaque, trilho = COR.linha, ordem = 0, children }) => {
  const f = useCurrentFrame();
  const k = presenca(f, s(inicio), s(dur), ordem);
  const lado = (raio + espessura) * 2;
  return (
    <div style={{ position: "relative", width: lado, height: lado }}>
      <svg width={lado} height={lado} style={{ position: "absolute", inset: 0, rotate: "-90deg" }}>
        <circle cx={lado / 2} cy={lado / 2} r={raio} fill="none" stroke={trilho} strokeWidth={espessura} />
        <circle
          cx={lado / 2}
          cy={lado / 2}
          r={raio}
          fill="none"
          stroke={cor}
          strokeWidth={espessura}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={1 - valor * k}
          opacity={k > 0.001 ? 1 : 0}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{children}</div>
    </div>
  );
};
