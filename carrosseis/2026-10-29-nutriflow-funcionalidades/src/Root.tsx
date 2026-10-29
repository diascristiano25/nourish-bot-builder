import React from "react";
import { Composition } from "remotion";
import { SlideInfo } from "./base/contexto";
import { SomDoSlide } from "./base/Som";
import { DUR, FPS, H, W } from "./base/tempo";
import { SLIDES, TOTAL_PREVISTO } from "./slides";

// Cada slide da lista vira uma composição S01, S02, ... (1080 × 1350, 30 fps, 6 s) com o som dele.
// Para mudar a ordem ou o número de slides, mexa só em src/slides/index.ts.

const comMoldura = (C: React.FC, n: number, total: number) => {
  const id = String(n).padStart(2, "0");
  const Slide: React.FC = () => (
    <SlideInfo.Provider value={{ n, total }}>
      <C />
      <SomDoSlide id={id} n={n} />
    </SlideInfo.Provider>
  );
  return Slide;
};

const TOTAL = Math.max(SLIDES.length, TOTAL_PREVISTO);
const PRONTOS = SLIDES.map((C, i) => ({ id: `S${String(i + 1).padStart(2, "0")}`, C: comMoldura(C, i + 1, TOTAL) }));

export const RemotionRoot: React.FC = () => (
  <>
    {PRONTOS.map(({ id, C }) => (
      <Composition key={id} id={id} component={C} durationInFrames={DUR} fps={FPS} width={W} height={H} />
    ))}
  </>
);
