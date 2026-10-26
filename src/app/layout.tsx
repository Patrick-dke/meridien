import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { EnTete } from "@/components/shell/EnTete";
import { BarreBas, BarreLaterale } from "@/components/shell/Navigation";
import { PiedDePage } from "@/components/shell/PiedDePage";
import { AppliquerReglages, EnregistrerServiceWorker } from "@/components/shell/Reglages";
import { ressource, urlSite } from "@/lib/chemin";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin", "latin-ext"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(urlSite),
  title: { default: "Méridien — Académie de trading", template: "%s · Méridien" },
  description:
    "Apprendre le trading avec méthode, sans argent réel et sans promesse de gains : cours courts, capsules animées, quiz corrigés et calculateurs de risque.",
  applicationName: "Méridien",
  icons: { apple: ressource("/icons/apple-touch-icon.png") },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Méridien",
    title: "Méridien — Académie de trading",
    description: "Apprendre à lire les marchés avec méthode — sans argent réel, sans promesse de gains.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0d13",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="min-h-dvh">
        <a
          href="#contenu"
          className="sr-only z-50 rounded-lg bg-brand-solid px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
        >
          Aller au contenu
        </a>
        <AppliquerReglages />
        <div className="lg:flex">
          <BarreLaterale />
          <div className="min-w-0 flex-1">
            <EnTete />
            <main id="contenu" tabIndex={-1} className="pb-24 outline-none lg:pb-8">
              {children}
            </main>
            <PiedDePage />
          </div>
        </div>
        <BarreBas />
        <EnregistrerServiceWorker />
      </body>
    </html>
  );
}
