import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Newsreader } from "next/font/google";
import { EnTete } from "@/components/shell/EnTete";
import { BarreBas, BarreLaterale } from "@/components/shell/Navigation";
import { PiedDePage } from "@/components/shell/PiedDePage";
import { TransitionsVue } from "@/components/shell/TransitionsVue";
import { AppliquerReglages, EnregistrerServiceWorker } from "@/components/shell/Reglages";
import { DefinitionsDegrades } from "@/components/ui/Progression";
import { etapesParChapitre, titresChapitres } from "@/content";
import { ressource, urlSite } from "@/lib/chemin";
import "./globals.css";

// Texte courant et interface : IBM Plex Sans, une linéale d'instrument, nette sur les petits écrans. Seule elle est
// préchargée : elle porte le premier rendu utile (LCP). Les autres arrivent ensuite, sur des polices de secours aux
// mêmes métriques (ajustement automatique de next/font).
const plexSans = IBM_Plex_Sans({ variable: "--font-plex-sans", subsets: ["latin", "latin-ext"], weight: ["400", "500", "600", "700"] });
// Chiffres, prix et repères : IBM Plex Mono, de la même famille.
const plexMono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], weight: ["400", "500"], preload: false });
// Grands titres : Newsreader, un romain de presse, pour la voix éditoriale du manuel.
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  preload: false,
});

/** Thème, palette et taille du texte posés avant le premier rendu, pour éviter un éclair de l'autre thème. */
const reglagesAvantRendu = `try{var r=JSON.parse(localStorage.getItem("meridien:progression")||"{}").reglages||{};var d=document.documentElement;d.dataset.theme=r.theme||"clair";if(r.palette)d.dataset.palette=r.palette;if(r.texte)d.dataset.text=r.texte}catch(e){}`;

export const metadata: Metadata = {
  metadataBase: new URL(urlSite),
  title: { default: "Méridien — Académie de trading", template: "%s · Méridien" },
  description:
    "Comprends les marchés, construis ta méthode, passe à la pratique : une formation au trading en huit modules, du premier graphique aux modèles avancés. Le premier module est gratuit.",
  applicationName: "Méridien",
  icons: { apple: ressource("/icons/apple-touch-icon.png") },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Méridien",
    title: "Méridien — Académie de trading",
    description: "Comprends les marchés, construis ta méthode, passe à la pratique. Huit modules de formation au trading, le premier est gratuit.",
  },
};

export const viewport: Viewport = {
  // Couleur de la barre du navigateur : celle du papier ; AppliquerReglages la met à jour selon le thème choisi.
  themeColor: "#f4f2ed",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" data-theme="clair" className={`${plexSans.variable} ${plexMono.variable} ${newsreader.variable} antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: reglagesAvantRendu }} />
      </head>
      <body className="min-h-dvh">
        <a href="#contenu" className="sr-only z-50 rounded-md bg-brand-solid px-4 py-2 text-on-solid focus:not-sr-only focus:fixed focus:left-3 focus:top-3">
          Aller au contenu
        </a>
        <AppliquerReglages />
        <DefinitionsDegrades />
        <div className="lg:flex">
          <BarreLaterale titres={Object.fromEntries(titresChapitres)} etapes={etapesParChapitre} />
          <div className="min-w-0 flex-1">
            <EnTete />
            <main id="contenu" tabIndex={-1} className="pb-24 outline-none lg:pb-8">
              {children}
            </main>
            <PiedDePage />
          </div>
        </div>
        <BarreBas />
        <TransitionsVue />
        <EnregistrerServiceWorker />
      </body>
    </html>
  );
}
