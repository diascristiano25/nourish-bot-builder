// IDENTIDADE DO CARROSSEL · Nutriflow (Identidade Real do SaaS)
// Cores extraídas de src/index.css: background 40/20/98, primary 168/65/43, foreground 222/25/14
import { loadFont as fonteTitulo } from "@remotion/google-fonts/Inter";
import { loadFont as fonteTexto } from "@remotion/google-fonts/Inter";

const titulo = fonteTitulo("normal", { weights: ["700", "800"], subsets: ["latin", "latin-ext"] });
const texto = fonteTexto("normal", { weights: ["500", "600"], subsets: ["latin", "latin-ext"] });

export const FONTE = {
  titulo: titulo.fontFamily,
  texto: texto.fontFamily,
  pesoTitulo: 800,
  pesoTexto: 600,
  espacoTitulo: "-0.02em",
};

export const MARCA = {
  nome: "Nutriflow",
  logo: "logo-nutriflow.png",
  arroba: "@nutriflow",
};

export const ESTILO_DESTAQUE: "cor" | "faixa" = "cor";

export const COR = {
  fundo: "#fbfaf9",
  superficie: "rgba(27,32,45,0.04)",
  destaque: "#26b598",
  destaqueSuave: "rgba(38,181,152,0.12)",
  sobreDestaque: "#FFFFFF",
  texto: "#1b202d",
  texto2: "rgba(27,32,45,0.68)",
  texto3: "rgba(27,32,45,0.42)",
  linha: "rgba(27,32,45,0.12)",
};

export const TAMANHO = {
  titulo: 82,
  apoio: 38,
  detalhe: 26,
  rotulo: 22,
  minimo: 22,
};

export const MARGEM = 88;
export const TEXTURA = 0;
export const ARRASTE = "ARRASTE";