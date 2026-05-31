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
  description: "Te invitamos a celebrar nuestra boda · 19 de Diciembre 2026",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Luis & Quetzalli",
    description: "Te invitamos a celebrar nuestra boda · 19 de Diciembre 2026",
    url: "https://luisyquetzalli.com",
    siteName: "Luis & Quetzalli",
    images: [
      {
        url: "https://luisyquetzalli.com/L&Q.png",
        width: 1200,
        height: 630,
        alt: "Luis & Quetzalli · 19 · 12 · 2026",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Luis & Quetzalli",
    description: "Te invitamos a celebrar nuestra boda · 19 de Diciembre 2026",
    images: ["https://luisyquetzalli.com/og-image.png"],
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