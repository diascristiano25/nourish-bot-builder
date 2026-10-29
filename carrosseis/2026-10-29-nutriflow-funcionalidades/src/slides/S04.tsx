// Slide 04 · CONTAR: calendário com contador de consultas agendadas subindo até 3.
import React from "react";
import { useCurrentFrame } from "remotion";
import { Moldura, Titulo, Marca, Contador, s, presenca, ULTIMO } from "../base";
import { COR } from "../marca";

const safePresenca = (f: number, a: number, d: number, ordem: number) => {
  if (f === 0 || f === ULTIMO) return 0;
  const v = presenca(f, a, d, ordem);
  return v < 0.001 ? 0 : v > 0.999 ? 1 : v;
};

export const S04: React.FC = () => {
  const f = useCurrentFrame();

  return (
    <Moldura>
      <Titulo
        top={160}
        rotulo="PASSO 3"
        linhas={[
          "Consultas",
          <Marca key="m">agendadas.</Marca>,
        ]}
        sub="Sem troca de mensagem para marcar."
      />

      {/* Calendário simplificado */}
      <div style={{
        position: "absolute",
        left: 88,
        right: 88,
        top: 520,
        padding: "32px",
        borderRadius: 20,
        background: COR.superficie,
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 12,
          marginBottom: 24,
        }}>
          {["D", "S", "T", "Q", "Q", "S", "S"].map((day, i) => (
            <div key={i} style={{
              textAlign: "center",
              fontSize: 20,
              fontWeight: 700,
              color: COR.texto3,
            }}>
              {day}
            </div>
          ))}
          {Array.from({ length: 28 }, (_, i) => {
            const isBooked = [5, 12, 19].includes(i + 1);
            const entrada = isBooked ? safePresenca(f, s(1.0 + (i % 3) * 0.5), s(0.4), i) : 1;
            return (
              <div key={i} style={{
                textAlign: "center",
                fontSize: 22,
                fontWeight: 600,
                color: isBooked ? COR.sobreDestaque : COR.texto2,
                background: isBooked ? COR.destaque : "transparent",
                borderRadius: 8,
                padding: "8px 0",
                opacity: entrada,
                scale: String(0.8 + entrada * 0.2),
              }}>
                {i + 1}
              </div>
            );
          })}
        </div>
      </div>

      {/* Contador de consultas */}
      <div style={{
        position: "absolute",
        left: 88,
        right: 88,
        top: 780,
        textAlign: "center",
      }}>
        <div style={{
          fontSize: 24,
          fontWeight: 600,
          color: COR.texto2,
          marginBottom: 12,
        }}>
          Consultas esta semana
        </div>
        <Contador
          ate={3}
          de={0}
          inicio={1.0}
          fim={3.0}
          tamanho={72}
          cor={COR.destaque}
        />
      </div>
    </Moldura>
  );
};