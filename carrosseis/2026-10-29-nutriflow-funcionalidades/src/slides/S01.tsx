// Slide 01 · CAPA · REVELAR: quatro pontinhos entrando um por batida + rótulos.
// Loop-safe: tudo some no quadro 0 e no último via clamp explícito.
// dotSpacing = 140px, pontinhos de 40px, rótulos entram em t=1.5s.
import React from "react";
import { useCurrentFrame } from "remotion";
import { Moldura, Titulo, Marca, s, presenca, ULTIMO } from "../base";
import { W } from "../base/tempo";
import { COR } from "../marca";

const safePresenca = (f: number, a: number, d: number, ordem: number) => {
  if (f === 0 || f === ULTIMO) return 0;
  const v = presenca(f, a, d, ordem);
  return v < 0.001 ? 0 : v > 0.999 ? 1 : v;
};

export const S01: React.FC = () => {
  const f = useCurrentFrame();
  const dotY = 580;
  const dotSpacing = 140;
  const startX = W / 2 - (dotSpacing * 1.5);
  const dots = [0, 1, 2, 3].map((i) => ({
    x: startX + i * dotSpacing,
    y: dotY,
  }));

  return (
    <Moldura>
      <Titulo
        top={160}
        linhas={[
          "Nutrição",
          "organizada em",
          <Marca key="m">4 passos.</Marca>,
        ]}
        sub="Do plano ao acompanhamento, tudo num lugar só."
      />

      {/* Quatro pontinhos de 40px — cada um entra na sua batida */}
      {dots.map((dot, i) => {
        const entrada = safePresenca(f, s(0.5 + i * 0.5), s(0.4), i);
        const escala = 0.3 + entrada * 0.7;
        const anelEscala = 1 + entrada * 0.6;
        const anelOpacity = entrada * 0.25;
        return (
          <React.Fragment key={i}>
            {/* Anel atrás do pontinho */}
            <div
              style={{
                position: "absolute",
                left: dot.x - 30,
                top: dot.y - 30,
                width: 60,
                height: 60,
                borderRadius: "50%",
                border: `3px solid ${COR.destaque}`,
                opacity: anelOpacity,
                scale: String(anelEscala),
              }}
            />
            {/* O pontinho de 40px */}
            <div
              style={{
                position: "absolute",
                left: dot.x - 20,
                top: dot.y - 20,
                width: 40,
                height: 40,
                borderRadius: "50%",
                backgroundColor: COR.destaque,
                opacity: entrada,
                scale: String(escala),
              }}
            />
          </React.Fragment>
        );
      })}

      {/* Linha conectora entre os pontinhos */}
      <div
        style={{
          position: "absolute",
          left: dots[0].x,
          top: dots[0].y - 1,
          width: dots[3].x - dots[0].x,
          height: 3,
          backgroundColor: COR.destaque,
          opacity: safePresenca(f, s(2.5), s(0.8), 4) * 0.3,
          borderRadius: 2,
        }}
      />

      {/* Rótulos abaixo dos pontinhos — entram em t=1.5s */}
      {["Plano", "Diário", "Consulta", "Progresso"].map((label, i) => {
        const entrada = safePresenca(f, s(1.5 + i * 0.2), s(0.3), 5 + i);
        return (
          <div
            key={label}
            style={{
              position: "absolute",
              left: dots[i].x - 60,
              top: dots[i].y + 50,
              width: 120,
              textAlign: "center",
              fontSize: 20,
              fontWeight: 600,
              color: COR.texto2,
              opacity: entrada,
              translate: `0px ${(1 - entrada) * 20}px`,
            }}
          >
            {label}
          </div>
        );
      })}
    </Moldura>
  );
};