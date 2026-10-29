import React from "react";
import { Html5Audio, Sequence, interpolate, staticFile } from "remotion";
import sons from "../data/sons.json";
import trilha from "../data/trilha.json";
import { DUR, FPS, SEGUNDOS, s } from "./tempo";

// O SOM DE CADA SLIDE, montado dentro do próprio vídeo (sai junto no MP4).
//  - efeitos: src/data/sons.json → { "01": [{ "t": 0, "s": "whoosh", "g": -4 }, ...] }
//  - trilha:  src/data/trilha.json → um trecho de 6 s por slide, com a "cauda" dos 0,5 s seguintes
//             misturada no começo. Assim, quando o vídeo recomeça, a música continua sem emenda.

type Efeito = { t: number; s: string; g?: number };
const db = (g = 0) => Math.pow(10, g / 20);
const XF = 0.5; // segundos da cauda

export const SomDoSlide: React.FC<{ id: string; n: number }> = ({ id, n }) => {
  const lista = ((sons as unknown as Record<string, Efeito[] | string>)[id] ?? []) as Efeito[];
  const t = trilha as { arquivo: string | null; inicio: number; passo: number; ganho: number };
  const ini = t.inicio + (n - 1) * t.passo;
  const g = db(t.ganho);
  return (
    <>
      {Array.isArray(lista)
        ? lista.map((e, i) => (
            <Sequence key={i} from={s(e.t)} durationInFrames={DUR - s(e.t)} layout="none">
              <Html5Audio src={staticFile(`sfx/${e.s}.wav`)} volume={db(e.g)} />
            </Sequence>
          ))
        : null}
      {t.arquivo ? (
        <>
          <Html5Audio
            src={staticFile(t.arquivo)}
            trimBefore={Math.round(ini * FPS)}
            volume={(q) => g * interpolate(q, [0, s(XF)], [0, 1], { extrapolateRight: "clamp" })}
          />
          <Sequence from={0} durationInFrames={s(XF)} layout="none">
            <Html5Audio
              src={staticFile(t.arquivo)}
              trimBefore={Math.round((ini + SEGUNDOS) * FPS)}
              volume={(q) => g * interpolate(q, [0, s(XF)], [1, 0], { extrapolateRight: "clamp" })}
            />
          </Sequence>
        </>
      ) : null}
    </>
  );
};
