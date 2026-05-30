import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import localFont from "next/font/local";
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
  display: "swap",
  declarations: [
    { prop: "ascent-override",   value: "55%" },
    { prop: "descent-override",  value: "30%" },
    { prop: "line-gap-override", value: "0%"  },
  ],
});

export const metadata: Metadata = {
  title: "Luis & Quetzalli",
  description: "Confirma tu asistencia a nuestra boda",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      {/* Aplicamos ambas variables al body */}
      <body
        className={`${cormorant.variable} ${wistania.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}