// A ordem desta lista é a ordem do carrossel: o primeiro vira S01 (01.mp4), o segundo S02, e assim por diante.
import { S01 } from "./S01";
import { S02 } from "./S02";
import { S03 } from "./S03";
import { S04 } from "./S04";
import { S05 } from "./S05";
import { S06 } from "./S06";
export const SLIDES = [S01, S02, S03, S04, S05, S06];
/**
* Quantos slides o carrossel VAI ter (da ficha). Serve para a amostra da capa já mostrar "01 / 06" e a barra de
* progresso certa, mesmo antes de os outros slides existirem.
*/
export const TOTAL_PREVISTO = 6;