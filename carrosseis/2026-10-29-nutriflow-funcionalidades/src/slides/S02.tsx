// Slide 02 · TRANSFORMAR: lista genérica riscada vira cardápio personalizado.
// A lista genérica SOME completamente quando a personalizada entra.
import React from "react";
import { useCurrentFrame } from "remotion";
import { Moldura, Titulo, Marca, s, presenca, ULTIMO } from "../base";
import { COR } from "../marca";

const safePresenca = (f: number, a: number, d: number, ordem: number) => {
  if (f === 0 || f === ULTIMO) return 0;
  const v = presenca(f, a, d, ordem);
  return v < 0.001 ? 0 : v > 0.999 ? 1 : v;
};

export const S02: React.FC = () => {
  const f = useCurrentFrame();
  const genericItems = ["Arroz", "Feijão", "Frango", "Salada"];
  const personalizedItems = ["Quinoa com legumes", "Salmão grelhado", "Smoothie verde", "Mix de castanhas"];

  // A lista genérica some quando a personalizada começa a entrar (a partir de 2.5s)
  const fadeOutGenerico = 1 - safePresenca(f, s(2.5), s(0.4), 15);

  return (
    <Moldura>
      <Titulo
        top={160}
        rotulo="PASSO 1"
        linhas={[
          "Plano alimentar com",
          <Marca key="m">IA.</Marca>,
        ]}
        sub="Personalizado em segundos, não em horas."
      />

      {/* Lista genérica — aparece primeiro, é riscada, depois SOME completamente */}
      <div style={{ position: "absolute", left: 88, right: 88, top: 580 }}>
        {genericItems.map((item, i) => {
          const entrada = safePresenca(f, s(0.5 + i * 0.3), s(0.3), i);
          const risco = safePresenca(f, s(2.0), s(0.5), 10);
          // Multiplica entrada pelo fadeOut para garantir que some completamente
          const opacityFinal = entrada * fadeOutGenerico;
          return (
            <div key={i} style={{ marginBottom: 20, opacity: opacityFinal }}>
              <div style={{
                fontFamily: "Inter",
                fontSize: 28,
                fontWeight: 600,
                color: COR.texto2,
                textDecoration: risco > 0.5 ? "line-through" : "none",
                textDecorationColor: COR.destaque,
                textDecorationThickness: 3,
              }}>
                {item}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cardápio personalizado — aparece DEPOIS que a genérica sumiu */}
      <div style={{ position: "absolute", left: 88, right: 88, top: 520 }}>
        {personalizedItems.map((item, i) => {
          const entrada = safePresenca(f, s(2.5 + i * 0.2), s(0.3), 20 + i);
          return (
            <div key={i} style={{
              marginBottom: 20,
              opacity: entrada,
              translate: `0px ${(1 - entrada) * 20}px`,
            }}>
              <div style={{
                fontFamily: "Inter",
                fontSize: 28,
                fontWeight: 700,
                color: COR.destaque,
              }}>
                {item}
              </div>
            </div>
          );
        })}
      </div>
    </Moldura>
  );
};