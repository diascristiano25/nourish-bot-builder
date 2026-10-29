// Slide 06 · APONTAR: CTA forte sem emojis + contador de prova social.
import React from "react";
import { useCurrentFrame } from "remotion";
import { Moldura, Titulo, Marca, Contador, Seta, s, presenca, ULTIMO } from "../base";
import { W } from "../base/tempo";
import { COR } from "../marca";

const safePresenca = (f: number, a: number, d: number, ordem: number) => {
  if (f === 0 || f === ULTIMO) return 0;
  const v = presenca(f, a, d, ordem);
  return v < 0.001 ? 0 : v > 0.999 ? 1 : v;
};

export const S06: React.FC = () => {
  const f = useCurrentFrame();

  return (
    <Moldura final textoFinal="Comece hoje. Sem cartão de crédito.">
      <Titulo
        top={160}
        linhas={[
          "Comece hoje.",
          <Marca key="m">Sem cartão.</Marca>,
        ]}
      />

      {/* Contador de prova social */}
      <div style={{
        position: "absolute",
        left: 88,
        right: 88,
        top: 420,
        textAlign: "center",
      }}>
        <div style={{
          fontSize: 24,
          fontWeight: 600,
          color: COR.texto2,
          marginBottom: 16,
          opacity: safePresenca(f, s(0.5), s(0.4), 0),
        }}>
          Nutricionistas já organizados
        </div>
        <Contador
          ate={2847}
          de={0}
          inicio={0.8}
          fim={3.0}
          tamanho={88}
          cor={COR.destaque}
        />
      </div>

      {/* Botão CTA visual (sem emoji) */}
      <div style={{
        position: "absolute",
        left: W / 2 - 160,
        top: 620,
        width: 320,
        height: 72,
        borderRadius: 36,
        background: COR.destaque,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: safePresenca(f, s(1.5), s(0.4), 1),
        scale: String(0.8 + safePresenca(f, s(1.5), s(0.4), 1) * 0.2),
      }}>
        <span style={{
          fontSize: 28,
          fontWeight: 700,
          color: COR.sobreDestaque,
          letterSpacing: "0.02em",
        }}>
          SALVAR POST
        </span>
      </div>

      {/* Seta apontando para o botão */}
      <Seta
        de={[W / 2, 540]}
        para={[W / 2, 610]}
        em={2.5}
        dur={0.5}
        cor={COR.destaque}
        ordem={2}
      />

      {/* Texto de apoio final */}
      <div style={{
        position: "absolute",
        left: 88,
        right: 88,
        top: 740,
        textAlign: "center",
        fontSize: 24,
        fontWeight: 600,
        color: COR.texto2,
        opacity: safePresenca(f, s(3.0), s(0.4), 3),
      }}>
        Mande para um colega que precisa ver isso.
      </div>
    </Moldura>
  );
};