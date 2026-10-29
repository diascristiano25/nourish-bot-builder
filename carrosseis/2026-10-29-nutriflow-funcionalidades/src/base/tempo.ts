import { Easing, interpolate, spring } from "remotion";

// Formato do feed: 1080 × 1350 (4:5), 30 quadros por segundo, 6 s por slide.
export const W = 1080;
export const H = 1080;
export const FPS = 30;
export const SEGUNDOS = 6;
export const DUR = SEGUNDOS * FPS; // 180 quadros (0 a 179)
export const ULTIMO = DUR - 1;

/** Segundos → quadros. */
export const s = (seg: number) => Math.round(seg * FPS);

/** Grade de batidas: 0,5 s (trilha de 120 BPM). Se a trilha tiver outro andamento, troque aqui (60 / BPM). */
export const BATIDA = 0.5;
export const batida = (n: number) => s(n * BATIDA);

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Curvas de movimento. SAI = entra rápido e assenta devagar (a mais usada).
export const SAI = Easing.bezier(0.16, 1, 0.3, 1);
export const MEIO = Easing.bezier(0.65, 0, 0.35, 1);
export const ENTRA = Easing.bezier(0.7, 0, 0.84, 0);
export const LINEAR = Easing.linear;

/** Vai de 0 a 1 entre o quadro `a` e o quadro `a + d`. */
export const p = (f: number, a: number, d: number, easing = SAI) =>
  interpolate(f, [a, a + d], [0, 1], { ...CLAMP, easing });

/**
 * O RETORNO DO LOOP. De 5,0 s a ~5,8 s tudo volta ao estado do quadro 0, e o último quadro fica
 * IGUAL ao primeiro. `ordem` escalona o retorno (0 volta primeiro, 1 três quadros depois, ...).
 */
export const VOLTA = s(5.0);
export const volta = (f: number, ordem = 0, d = 14) => p(f, VOLTA + ordem * 3, d, MEIO);

/** Detalhe que entra em [a, a + d] e some no retorno do loop. É o padrão para tudo que não é o título. */
export const presenca = (f: number, a: number, d = 14, ordem = 0, easing = SAI) =>
  p(f, a, d, easing) * (1 - volta(f, ordem));

/**
 * Valor de uma contagem no quadro f: vai de `de` até `ate` entre `inicio` e `fim` (segundos) e volta no loop.
 * É a mesma conta do <Contador>; use para sincronizar barras, blocos ou gráficos com o número.
 */
export const valorContagem = (f: number, de: number, ate: number, inicio: number, fim: number, ordem = 0) =>
  lerp(de, lerp(de, ate, p(f, s(inicio), s(fim - inicio), SAI)), 1 - volta(f, ordem, 18));

/** Mola (com um leve passar do ponto), já multiplicada pelo retorno do loop. */
export const mola = (
  f: number,
  a: number,
  ordem = 0,
  config: { damping?: number; stiffness?: number; mass?: number } = { damping: 13, stiffness: 180 },
) => spring({ frame: f - a, fps: FPS, config }) * (1 - volta(f, ordem, 10));

/**
 * Movimento contínuo que fecha o loop sozinho (respiro, flutuar, girar devagar).
 * Devolve um ângulo: no quadro 0 e no último quadro dá o mesmo valor.
 */
export const ciclo = (f: number, voltas = 1) => (f / ULTIMO) * voltas * Math.PI * 2;

/** Onda de 0 a 1 que fecha o loop (0 no quadro 0 e no último). */
export const onda = (f: number, voltas = 1) => (1 - Math.cos(ciclo(f, voltas))) / 2;

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const limita = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

/** Aleatório fixo: o mesmo número sempre para o mesmo `n` (nunca use Math.random no Remotion). */
export const rnd = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
