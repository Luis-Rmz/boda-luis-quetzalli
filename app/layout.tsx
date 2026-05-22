import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import localFont from "next/font/local"; // <-- Importamos localFont
import "./globals.css";

// Mantenemos Cormorant Garamond para los textos base
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-serif",
});

// Configuramos tu fuente local Wistania
const wistania = localFont({
  src: "./fonts/Wistania.ttf",
  variable: "--font-cursive",
  weight: "400",
  style: "normal",
  display: "swap", // <-- Esto asegura que esté disponible de inmediato
});

export const metadata: Metadata = {
  title: "Invitación de Boda",
  description: "Confirma tu asistencia a nuestra boda",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      {/* Aplicamos ambas variables al body */}
      <body
        className={`${cormorant.variable} ${wistania.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}