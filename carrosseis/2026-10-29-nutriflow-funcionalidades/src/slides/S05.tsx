// Slide 05 · COMPARAR: gráfico antes (linha reta) × depois (linha subindo), lado a lado.
import React from "react";
import { useCurrentFrame, AbsoluteFill } from "remotion";
import { Moldura, Titulo, Marca, s, presenca, ULTIMO } from "../base";
import { W, H } from "../base/tempo";
import { COR } from "../marca";

const safePresenca = (f: number, a: number, d: number, ordem: number) => {
  if (f === 0 || f === ULTIMO) return 0;
  const v = presenca(f, a, d, ordem);
  return v < 0.001 ? 0 : v > 0.999 ? 1 : v;
};

export const S05: React.FC = () => {
  const f = useCurrentFrame();

  return (
    <Moldura>
      <Titulo
        top={160}
        rotulo="PASSO 4"
        linhas={[
          "Progresso",
          <Marca key="m">visível.</Marca>,
        ]}
        sub="Gráficos que mostram a evolução do paciente."
      />

      {/* Gráfico ANTES (linha reta) */}
      <div style={{
        position: "absolute",
        left: 88,
        top: 520,
        width: 420,
        height: 300,
        padding: "24px",
        borderRadius: 16,
        background: COR.superficie,
      }}>
        <div style={{
          fontSize: 20,
          fontWeight: 700,
          color: COR.texto3,
          marginBottom: 16,
          textAlign: "center",
        }}>
          ANTES
        </div>
        <AbsoluteFill style={{ pointerEvents: "none" }}>
          <svg width={420} height={300} style={{ position: "absolute", left: 0, top: 60 }}>
            <line
              x1={40}
              y1={200}
              x2={380}
              y2={200}
              stroke={COR.texto3}
              strokeWidth={3}
              strokeLinecap="round"
              opacity={safePresenca(f, s(0.5), s(0.5), 0)}
            />
          </svg>
        </AbsoluteFill>
      </div>

      {/* Gráfico DEPOIS (linha subindo) */}
      <div style={{
        position: "absolute",
        right: 88,
        top: 520,
        width: 420,
        height: 300,
        padding: "24px",
        borderRadius: 16,
        background: COR.superficie,
        border: `3px solid ${COR.destaque}`,
      }}>
        <div style={{
          fontSize: 20,
          fontWeight: 700,
          color: COR.destaque,
          marginBottom: 16,
          textAlign: "center",
        }}>
          DEPOIS
        </div>
        <AbsoluteFill style={{ pointerEvents: "none" }}>
          <svg width={420} height={300} style={{ position: "absolute", left: 0, top: 60 }}>
            <path
              d="M 40 200 Q 120 180, 200 120 T 380 40"
              fill="none"
              stroke={COR.destaque}
              strokeWidth={4}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="1 1"
              strokeDashoffset={1 - safePresenca(f, s(1.5), s(1.0), 1)}
            />
          </svg>
        </AbsoluteFill>
      </div>

      {/* Selo de vitória no DEPOIS */}
      <div style={{
        position: "absolute",
        right: 120,
        top: 700,
        width: 80,
        height: 80,
        borderRadius: "50%",
        background: COR.destaque,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: safePresenca(f, s(3.0), s(0.4), 2),
        scale: String(0.5 + safePresenca(f, s(3.0), s(0.4), 2) * 0.5),
      }}>
        <span style={{ fontSize: 40, color: COR.sobreDestaque }}>✓</span>
      </div>
    </Moldura>
  );
};