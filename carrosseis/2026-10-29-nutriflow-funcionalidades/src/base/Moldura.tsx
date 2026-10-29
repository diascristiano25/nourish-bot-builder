import React from "react";
import { AbsoluteFill, Img, getInputProps, staticFile, useCurrentFrame } from "remotion";
import { ARRASTE, COR, FONTE, MARCA, MARGEM, TAMANHO, TEXTURA } from "../marca";
import { useSlide } from "./contexto";
import { H, W, onda } from "./tempo";

/**
 * A parte FIXA de todo slide: fundo, granulado, cabeçalho (marca + 01/07) e rodapé (progresso + arraste).
 * Nada aqui se mexe, a não ser a seta de arrastar, que pulsa em ciclo e fecha o loop sozinha.
 *
 * fundo:   troque o fundo chapado por uma foto ou camada própria (ex.: <Foto src="cafe.png" />).
 * final:   no último slide, esconde o "arraste" e mostra `textoFinal`.
 * limpo:   esconde cabeçalho e rodapé (capas que pedem a tela inteira).
 */
export const Moldura: React.FC<{
  children: React.ReactNode;
  fundo?: React.ReactNode;
  final?: boolean;
  textoFinal?: string;
  limpo?: boolean;
  corFundo?: string;
}> = ({ children, fundo, final, textoFinal = "", limpo, corFundo }) => {
  const f = useCurrentFrame();
  const { n, total } = useSlide();
  const pulso = onda(f, 6); // 6 pulsos em 6 s
  // Modo de teste do `npm run conferir` (margem): sem fundo, sem granulado, fundo magenta.
  const teste = Boolean((getInputProps() as { semFundo?: boolean }).semFundo);
  return (
    <AbsoluteFill style={{ backgroundColor: teste ? "#FF00FF" : (corFundo ?? COR.fundo), overflow: "hidden" }}>
      {teste ? null : fundo}
      {/* Granulado desligado no teste de margem/loop: feTurbulence renderiza diferente por quadro no headless e quebra o loop. */}
      {TEXTURA > 0 && !teste ? <Granulado opacidade={TEXTURA} /> : null}

      {limpo ? null : (
        <div
          style={{
            position: "absolute",
            left: MARGEM,
            right: MARGEM,
            top: 56,
            height: 80,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {MARCA.logo ? (
              <Img src={staticFile(MARCA.logo)} style={{ height: 64, width: "auto" }} />
            ) : MARCA.nome ? (
              <div style={{ width: 16, height: 16, background: COR.destaque, borderRadius: 3 }} />
            ) : null}
            {MARCA.nome && !MARCA.logo ? (
              <span
                style={{
                  fontFamily: FONTE.texto,
                  fontWeight: 800,
                  fontSize: TAMANHO.rotulo,
                  letterSpacing: "0.2em",
                  color: COR.texto2,
                }}
              >
                {MARCA.nome}
              </span>
            ) : null}
          </div>
          {total > 1 ? (
            <span style={{ fontFamily: FONTE.titulo, fontWeight: FONTE.pesoTitulo, fontSize: 24, color: COR.texto3, letterSpacing: "0.04em" }}>
              <span style={{ color: COR.texto }}>{String(n).padStart(2, "0")}</span> / {String(total).padStart(2, "0")}
            </span>
          ) : null}
        </div>
      )}

      {children}

      {limpo ? null : (
        <div
          style={{
            position: "absolute",
            left: MARGEM,
            right: MARGEM,
            bottom: 58,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", gap: 8 }}>
            {total > 1
              ? Array.from({ length: total }, (_, i) => (
                  <div
                    key={i}
                    style={{
                      width: i + 1 === n ? 44 : 18,
                      height: 6,
                      borderRadius: 3,
                      background: i + 1 === n ? COR.destaque : i + 1 < n ? COR.texto3 : COR.linha,
                    }}
                  />
                ))
              : null}
          </div>
          {final ? (
            <span style={{ fontFamily: FONTE.texto, fontWeight: 800, fontSize: 24, color: COR.texto3, letterSpacing: "0.12em" }}>
              {textoFinal}
            </span>
          ) : ARRASTE ? (
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontFamily: FONTE.texto, fontWeight: 800, fontSize: 24, color: COR.texto2, letterSpacing: "0.12em" }}>
                {ARRASTE}
              </span>
              <svg width={46} height={24} viewBox="0 0 46 24" style={{ translate: `${(pulso - 1) * 9}px 0px` }}>
                <path
                  d="M2 12 H40 M30 3 L41 12 L30 21"
                  stroke={COR.destaque}
                  strokeWidth={4}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          ) : null}
        </div>
      )}
    </AbsoluteFill>
  );
};

/** Granulado fixo (não anima, para não pesar e não "ferver" o vídeo). */
const Granulado: React.FC<{ opacidade: number }> = ({ opacidade }) => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: opacidade, mixBlendMode: "overlay", pointerEvents: "none" }}>
    <filter id="granulado">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width={W} height={H} filter="url(#granulado)" />
  </svg>
);
