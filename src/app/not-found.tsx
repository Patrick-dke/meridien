import Link from "next/link";

export default function PageIntrouvable() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
      <p className="font-mono text-sm text-brand">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Cette page n&apos;existe pas</h1>
      <p className="mt-3 text-ink-2">Le lien est peut-être ancien, ou le chapitre pas encore publié.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="rounded-lg bg-brand-solid px-4 py-2.5 text-sm font-medium text-white">
          Accueil
        </Link>
        <Link href="/academies/" className="rounded-lg border border-line-strong px-4 py-2.5 text-sm font-medium text-ink">
          Catalogue
        </Link>
      </div>
    </div>
  );
}
