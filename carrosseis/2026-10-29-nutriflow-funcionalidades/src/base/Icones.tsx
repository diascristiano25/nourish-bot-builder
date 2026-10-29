import React from "react";
import { COR } from "../marca";

// Ícones simples de traço, no estilo dos botões do Instagram (desenhados aqui, sem marca de ninguém).

type P = { tamanho?: number; cor?: string; espessura?: number };

const Base: React.FC<P & { children: React.ReactNode }> = ({ tamanho = 80, children }) => (
  <svg width={tamanho} height={tamanho} viewBox="0 0 48 48" style={{ overflow: "visible" }}>
    {children}
  </svg>
);

export const Salvar: React.FC<P & { cheio?: boolean }> = ({ tamanho, cor = COR.texto, espessura = 3.4, cheio }) => (
  <Base tamanho={tamanho}>
    <path d="M12 6 H36 V42 L24 32 L12 42 Z" fill={cheio ? cor : "none"} stroke={cor} strokeWidth={espessura} strokeLinejoin="round" />
  </Base>
);

export const Enviar: React.FC<P> = ({ tamanho, cor = COR.texto, espessura = 3.4 }) => (
  <Base tamanho={tamanho}>
    <path d="M43 6 L5 20 L20 26 L26 42 Z M20 26 L43 6" fill="none" stroke={cor} strokeWidth={espessura} strokeLinejoin="round" strokeLinecap="round" />
  </Base>
);

export const Comentar: React.FC<P> = ({ tamanho, cor = COR.texto, espessura = 3.4 }) => (
  <Base tamanho={tamanho}>
    <path d="M24 6 C 13 6 5 13.5 5 23 C 5 27 6.5 30.5 9 33.5 L 7 42 L 15.5 38.5 C 18 39.5 21 40 24 40 C 35 40 43 32.5 43 23 C 43 13.5 35 6 24 6 Z" fill="none" stroke={cor} strokeWidth={espessura} strokeLinejoin="round" />
  </Base>
);

export const Curtir: React.FC<P & { cheio?: boolean }> = ({ tamanho, cor = COR.texto, espessura = 3.4, cheio }) => (
  <Base tamanho={tamanho}>
    <path
      d="M24 41 C 10 32 5 25 5 17.5 C 5 11.5 9.5 7 15 7 C 19 7 22 9.5 24 12.5 C 26 9.5 29 7 33 7 C 38.5 7 43 11.5 43 17.5 C 43 25 38 32 24 41 Z"
      fill={cheio ? cor : "none"}
      stroke={cor}
      strokeWidth={espessura}
      strokeLinejoin="round"
    />
  </Base>
);

export const Check: React.FC<P> = ({ tamanho = 64, cor = COR.destaque }) => (
  <svg width={tamanho} height={tamanho} viewBox="0 0 64 64">
    <circle cx={32} cy={32} r={32} fill={cor} />
    <path d="M18 33 L28 43 L46 22" stroke={COR.sobreDestaque} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Xis: React.FC<P> = ({ tamanho = 64, cor = COR.texto3 }) => (
  <svg width={tamanho} height={tamanho} viewBox="0 0 64 64">
    <circle cx={32} cy={32} r={30} fill="none" stroke={cor} strokeWidth={4} />
    <path d="M22 22 L42 42 M42 22 L22 42" stroke={cor} strokeWidth={5} strokeLinecap="round" />
  </svg>
);
