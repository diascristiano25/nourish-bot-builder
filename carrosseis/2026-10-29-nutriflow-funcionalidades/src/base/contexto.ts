import { createContext, useContext } from "react";

/** Número do slide e total do carrossel. O Root preenche; a Moldura lê. */
export const SlideInfo = createContext({ n: 1, total: 1 });
export const useSlide = () => useContext(SlideInfo);
