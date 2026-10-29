// Slide 03 · REVELAR: três refeições aparecendo uma por batida (café, almoço, jantar).
import React from "react";
import { useCurrentFrame } from "remotion";
import { Moldura, Titulo, Marca, s, presenca, ULTIMO } from "../base";
import { COR } from "../marca";

const safePresenca = (f: number, a: number, d: number, ordem: number) => {
  if (f === 0 || f === ULTIMO) return 0;
  const v = presenca(f, a, d, ordem);
  return v < 0.001 ? 0 : v > 0.999 ? 1 : v;
};

export const S03: React.FC = () => {
  const f = useCurrentFrame();
  const meals = [
    { label: "Café da manhã", items: "Ovos, aveia, fruta" },
    { label: "Almoço", items: "Frango, quinoa, legumes" },
    { label: "Jantar", items: "Peixe, salada, azeite" },
  ];

  return (
    <Moldura>
      <Titulo
        top={160}
        rotulo="PASSO 2"
        linhas={[
          "Diário alimentar",
          <Marca key="m">simples.</Marca>,
        ]}
        sub="O paciente registra, você acompanha em tempo real."
      />
      <div style={{ position: "absolute", left: 88, right: 88, top: 520 }}>
        {meals.map((meal, i) => {
          const entrada = safePresenca(f, s(0.5 + i * 0.5), s(0.4), i);
          return (
            <div
              key={i}
              style={{
                marginBottom: 16,
                opacity: entrada,
                translate: `0px ${(1 - entrada) * 20}px`,
                padding: "16px 24px",
                borderRadius: 12,
                background: COR.superficie,
              }}
            >
              <div style={{
                fontFamily: "Inter",
                fontSize: 24,
                fontWeight: 700,
                color: COR.texto,
                marginBottom: 4,
              }}>
                {meal.label}
              </div>
              <div style={{
                fontFamily: "Inter",
                fontSize: 20,
                fontWeight: 500,
                color: COR.texto2,
              }}>
                {meal.items}
              </div>
            </div>
          );
        })}
      </div>
    </Moldura>
  );
};