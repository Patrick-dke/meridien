import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Examen } from "@/components/examen/Examen";
import { offre } from "@/content/offre";
import { typographie } from "@/lib/typographie";

export const dynamicParams = false;

export function generateStaticParams() {
  return offre.map((m) => ({ module: m.id }));
}

export async function generateMetadata({ params }: PageProps<"/examen/[module]">): Promise<Metadata> {
  const { module } = await params;
  const m = offre.find((x) => x.id === module);
  return m ? { title: `Examen : ${m.titre}`, robots: { index: false } } : {};
}

export default async function PageExamen({ params }: PageProps<"/examen/[module]">) {
  const { module } = await params;
  const m = offre.find((x) => x.id === module);
  if (!m) notFound();
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <nav aria-label="Fil d'Ariane" className="mb-6 text-sm text-ink-3">
        <Link href={`/formations/${m.id}/`} className="hover:text-ink hover:underline">
          {m.titre}
        </Link>{" "}
        / Examen
      </nav>
      <header className="mb-8">
        <p className="surtitre">Examen de fin de module</p>
        <h1 className="mt-2 text-4xl leading-tight text-ink sm:text-5xl">{typographie(m.titre)}</h1>
      </header>
      <Examen module={m.id} titre={m.titre} />
    </div>
  );
}
