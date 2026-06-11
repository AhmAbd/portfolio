import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Ahmad Abdullatif — Computer Engineer",
  description:
    "Computer Engineer building AI that sees, apps that ship, and hardware that talks to both. Palmprint biometrics, YOLO detection, full-stack and mobile products.",
  openGraph: {
    title: "Ahmad Abdullatif — Computer Engineer",
    description:
      "AI / computer vision / full-stack / embedded. Shipped products, benchmarked models, deployed everything.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${archivo.variable} ${plexMono.variable}`}>
      <body className="grain min-h-screen antialiased">{children}</body>
    </html>
  );
}
