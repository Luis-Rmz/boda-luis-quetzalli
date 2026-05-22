import type { Config } from "tailwindcss";

const config: Config = {
  // ... mantener la configuración de contenido que ya generó shadcn
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--font-serif)", "serif"],
        cursive: ["var(--font-cursive)", "cursive"],
      },
      colors: {
        crema: "#F6F4F0",
        salvia: "#688236",
        lilaBoton: "#D1D5DB", // Aquí puedes ajustar el tono exacto del lila que tienes en tu botón
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;