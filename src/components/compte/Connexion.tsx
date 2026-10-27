"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { connecter, connecterGoogle, demanderReinitialisation, inscrire, motDePasseValide } from "@/lib/compte/actions";
import { useSession } from "@/lib/compte/session";
import { comptesDisponibles, emulateurs } from "@/lib/firebase/client";
import { Alerte, BoutonEnvoi, BoutonGoogle, Champ, ChampMotDePasse, Separateur, suiteSure } from "./Formulaire";

const suite = () => suiteSure(new URLSearchParams(window.location.search).get("suite"));
const avecSuite = (chemin: string) => {
  if (typeof window === "undefined") return chemin;
  const s = new URLSearchParams(window.location.search).get("suite");
  return s ? `${chemin}?suite=${encodeURIComponent(s)}` : chemin;
};

export function ComptesIndisponibles() {
  return (
    <Alerte ton="info">
      Les comptes Méridien ouvrent très bientôt. En attendant, le parcours « Premiers pas » reste entièrement accessible sans compte, et ta
      progression est gardée sur cet appareil.
    </Alerte>
  );
}

export function BandeauTest() {
  if (!emulateurs) return null;
  return (
    <p className="mb-4 rounded-lg border border-warn/50 bg-warn/10 px-3 py-2 text-xs font-medium text-warn">
      Environnement de test : comptes et paiements fictifs, servis par les émulateurs locaux. Aucun argent réel.
    </p>
  );
}

function useRedirectionSiConnecte() {
  const s = useSession(true);
  const router = useRouter();
  useEffect(() => {
    if (s.etat === "connecte") router.replace(suite());
  }, [s.etat, router]);
  return s;
}

function useGoogle() {
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const lancer = async () => {
    setEnCours(true);
    setErreur(null);
    try {
      await connecterGoogle();
    } catch (e) {
      setErreur((e as Error).message);
    } finally {
      setEnCours(false);
    }
  };
  return { enCours, erreur, lancer };
}

export function FormulaireConnexion() {
  useRedirectionSiConnecte();
  const google = useGoogle();
  const [email, setEmail] = useState("");
  const [mdp, setMdp] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  if (!comptesDisponibles) return <ComptesIndisponibles />;

  const envoyer = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnCours(true);
    setErreur(null);
    try {
      await connecter(email, mdp);
    } catch (err) {
      setErreur((err as Error).message);
    } finally {
      setEnCours(false);
    }
  };

  return (
    <div className="carte p-5 sm:p-7">
      <BandeauTest />
      <BoutonGoogle onClick={google.lancer} enCours={google.enCours} />
      {google.erreur ? (
        <div className="mt-3">
          <Alerte>{google.erreur}</Alerte>
        </div>
      ) : null}
      <Separateur />
      <form onSubmit={envoyer} className="space-y-4" noValidate>
        <Champ libelle="Adresse e-mail" type="email" autoComplete="email" inputMode="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <ChampMotDePasse libelle="Mot de passe" autoComplete="current-password" required value={mdp} onChange={(e) => setMdp(e.target.value)} />
        <div className="text-right text-sm">
          <Link href="/mot-de-passe/" className="text-brand underline-offset-2 hover:underline">
            Mot de passe oublié ?
          </Link>
        </div>
        {erreur ? <Alerte>{erreur}</Alerte> : null}
        <BoutonEnvoi enCours={enCours}>Se connecter</BoutonEnvoi>
      </form>
      <p className="mt-6 text-center text-sm text-ink-2">
        Pas encore de compte ?{" "}
        <Link href={avecSuite("/inscription/")} className="font-semibold text-brand underline-offset-2 hover:underline">
          Créer un compte
        </Link>
      </p>
    </div>
  );
}

export function FormulaireInscription() {
  useRedirectionSiConnecte();
  const google = useGoogle();
  const [d, setD] = useState({ nom: "", email: "", telephone: "", motDePasse: "", confirmation: "", conditions: false });
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [touche, setTouche] = useState(false);
  if (!comptesDisponibles) return <ComptesIndisponibles />;

  const maj = (k: keyof typeof d) => (e: React.ChangeEvent<HTMLInputElement>) => setD({ ...d, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  const erreurMdp = touche && d.motDePasse && !motDePasseValide(d.motDePasse) ? "8 caractères au moins, avec une lettre et un chiffre." : null;
  const erreurConfirmation = touche && d.confirmation && d.confirmation !== d.motDePasse ? "Les deux mots de passe ne correspondent pas." : null;

  const envoyer = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouche(true);
    setErreur(null);
    if (d.motDePasse !== d.confirmation) return setErreur("Les deux mots de passe ne correspondent pas.");
    if (!d.conditions) return setErreur("Accepte les conditions d'utilisation pour créer ton compte.");
    setEnCours(true);
    try {
      await inscrire(d);
    } catch (err) {
      setErreur((err as Error).message);
    } finally {
      setEnCours(false);
    }
  };

  return (
    <div className="carte p-5 sm:p-7">
      <BandeauTest />
      <BoutonGoogle onClick={google.lancer} enCours={google.enCours} />
      {google.erreur ? (
        <div className="mt-3">
          <Alerte>{google.erreur}</Alerte>
        </div>
      ) : null}
      <Separateur />
      <form onSubmit={envoyer} className="space-y-4" noValidate>
        <Champ libelle="Nom complet" autoComplete="name" required maxLength={80} value={d.nom} onChange={maj("nom")} />
        <Champ libelle="Adresse e-mail" type="email" autoComplete="email" inputMode="email" required value={d.email} onChange={maj("email")} aide="Un lien de vérification y sera envoyé." />
        <Champ
          libelle="Téléphone (Cameroun)"
          type="tel"
          autoComplete="tel-national"
          inputMode="tel"
          placeholder="6 70 00 00 00"
          value={d.telephone}
          onChange={maj("telephone")}
          aide="Facultatif. Il préremplit le paiement Mobile Money ; aucun SMS ne t'est envoyé."
        />
        <ChampMotDePasse libelle="Mot de passe" autoComplete="new-password" required value={d.motDePasse} onChange={maj("motDePasse")} erreur={erreurMdp} aide="8 caractères au moins, avec une lettre et un chiffre." />
        <ChampMotDePasse libelle="Confirmation du mot de passe" autoComplete="new-password" required value={d.confirmation} onChange={maj("confirmation")} erreur={erreurConfirmation} />
        <label className="flex items-start gap-3 text-sm text-ink-2">
          <input type="checkbox" className="mt-1 size-4 accent-[var(--brand)]" checked={d.conditions} onChange={maj("conditions")} />
          <span>
            J&apos;accepte les{" "}
            <Link href="/legal/mentions/" className="text-brand underline">
              conditions
            </Link>{" "}
            et la{" "}
            <Link href="/legal/confidentialite/" className="text-brand underline">
              politique de confidentialité
            </Link>
            , et j&apos;ai lu l&apos;
            <Link href="/legal/risques/" className="text-brand underline">
              avertissement sur les risques
            </Link>
            .
          </span>
        </label>
        {erreur ? <Alerte>{erreur}</Alerte> : null}
        <BoutonEnvoi enCours={enCours}>Créer mon compte</BoutonEnvoi>
      </form>
      <p className="mt-6 text-center text-sm text-ink-2">
        Déjà un compte ?{" "}
        <Link href={avecSuite("/connexion/")} className="font-semibold text-brand underline-offset-2 hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}

export function FormulaireMotDePasse() {
  const [email, setEmail] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [etat, setEtat] = useState<{ ok: boolean; texte: string } | null>(null);
  if (!comptesDisponibles) return <ComptesIndisponibles />;
  const envoyer = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnCours(true);
    try {
      await demanderReinitialisation(email);
      setEtat({ ok: true, texte: "Si un compte existe avec cette adresse, un lien de réinitialisation vient d'y être envoyé. Pense à regarder dans les courriers indésirables." });
    } catch (err) {
      setEtat({ ok: false, texte: (err as Error).message });
    } finally {
      setEnCours(false);
    }
  };
  return (
    <div className="carte p-5 sm:p-7">
      <BandeauTest />
      <form onSubmit={envoyer} className="space-y-4">
        <Champ libelle="Adresse e-mail du compte" type="email" autoComplete="email" inputMode="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        {etat ? <Alerte ton={etat.ok ? "ok" : "erreur"}>{etat.texte}</Alerte> : null}
        <BoutonEnvoi enCours={enCours}>Recevoir le lien</BoutonEnvoi>
      </form>
      <p className="mt-6 text-center text-sm">
        <Link href="/connexion/" className="text-brand underline-offset-2 hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </div>
  );
}
