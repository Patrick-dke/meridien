"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { associerGoogle, changerEmail, changerMotDePasse, deconnecterPartout, modifierProfil, reduirePhoto } from "@/lib/compte/actions";
import { useSession } from "@/lib/compte/session";
import { formaterTelephone } from "@/lib/compte/telephone";
import { Alerte, BoutonEnvoi, Champ, ChampMotDePasse } from "./Formulaire";

type Retour = { ok: boolean; texte: string } | null;

function Bloc({ titre, aide, children }: { titre: string; aide?: string; children: React.ReactNode }) {
  return (
    <section className="carte p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-ink">{titre}</h2>
      {aide ? <p className="mt-1 text-sm text-ink-2">{aide}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function useAction() {
  const [enCours, setEnCours] = useState(false);
  const [retour, setRetour] = useState<Retour>(null);
  const lancer = async (f: () => Promise<unknown>, succes: string) => {
    setEnCours(true);
    setRetour(null);
    try {
      await f();
      setRetour({ ok: true, texte: succes });
    } catch (e) {
      setRetour({ ok: false, texte: (e as Error).message });
    } finally {
      setEnCours(false);
    }
  };
  return { enCours, retour, lancer };
}

export function ParametresProfil() {
  const s = useSession(true);
  const router = useRouter();
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [photo, setPhoto] = useState<string | null | undefined>(undefined);
  const [nouvelEmail, setNouvelEmail] = useState("");
  const [mdpEmail, setMdpEmail] = useState("");
  const [actuel, setActuel] = useState("");
  const [nouveau, setNouveau] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const fichier = useRef<HTMLInputElement>(null);
  const infos = useAction();
  const email = useAction();
  const mdp = useAction();
  const google = useAction();
  const sessions = useAction();
  const initialise = useRef(false);

  useEffect(() => {
    if (s.etat === "deconnecte") router.replace("/connexion/?suite=/compte/profil/");
  }, [s.etat, router]);
  useEffect(() => {
    if (initialise.current || s.etat !== "connecte") return;
    initialise.current = true;
    setNom(s.profil?.nom ?? s.utilisateur?.nom ?? "");
    setTelephone(s.profil?.telephone ? formaterTelephone(s.profil.telephone) : "");
  }, [s.etat, s.profil, s.utilisateur]);

  if (s.etat !== "connecte" || !s.utilisateur) return <div className="carte h-64 animate-pulse" aria-busy="true" />;
  const u = s.utilisateur;
  const avecMotDePasse = u.fournisseurs.includes("password");
  const avecGoogle = u.fournisseurs.includes("google.com");
  const photoAffichee = photo === undefined ? s.profil?.photo : photo;

  return (
    <div className="space-y-5">
      <Bloc titre="Informations personnelles">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void infos.lancer(() => modifierProfil({ nom, telephone, photo }), "Profil enregistré.");
          }}
        >
          <div className="flex items-center gap-4">
            {photoAffichee ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoAffichee} alt="Ta photo de profil" className="size-16 rounded-full object-cover" />
            ) : (
              <span className="grid size-16 place-items-center rounded-full bg-brand-soft text-2xl font-semibold text-brand" aria-hidden="true">
                {(nom || "?").slice(0, 1).toUpperCase()}
              </span>
            )}
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn btn-secondaire" onClick={() => fichier.current?.click()}>
                Changer la photo
              </button>
              {photoAffichee ? (
                <button type="button" className="btn btn-discret" onClick={() => setPhoto(null)}>
                  Retirer
                </button>
              ) : null}
            </div>
            <input
              ref={fichier}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) reduirePhoto(f).then(setPhoto, (err) => infos.lancer(() => Promise.reject(err), ""));
                e.target.value = "";
              }}
            />
          </div>
          <Champ libelle="Nom complet" autoComplete="name" value={nom} onChange={(e) => setNom(e.target.value)} maxLength={80} required />
          <Champ libelle="Téléphone (Cameroun)" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="6 70 00 00 00" value={telephone} onChange={(e) => setTelephone(e.target.value)} aide="Facultatif ; il préremplit le paiement Mobile Money." />
          {infos.retour ? <Alerte ton={infos.retour.ok ? "ok" : "erreur"}>{infos.retour.texte}</Alerte> : null}
          <BoutonEnvoi enCours={infos.enCours} className="sm:w-auto">
            Enregistrer
          </BoutonEnvoi>
        </form>
      </Bloc>

      <Bloc titre="Adresse e-mail" aide={`Adresse actuelle : ${u.email}${u.emailVerifie ? " (vérifiée)" : " (non vérifiée)"}. La nouvelle adresse ne remplace l'ancienne qu'après un clic sur le lien qui lui est envoyé.`}>
        {u.emailVerifie ? (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              void email.lancer(() => changerEmail(nouvelEmail, mdpEmail), `Lien de confirmation envoyé à ${nouvelEmail}. L'adresse changera après ton clic.`);
            }}
          >
            <Champ libelle="Nouvelle adresse" type="email" autoComplete="email" value={nouvelEmail} onChange={(e) => setNouvelEmail(e.target.value)} required />
            {avecMotDePasse ? <ChampMotDePasse libelle="Mot de passe actuel" autoComplete="current-password" value={mdpEmail} onChange={(e) => setMdpEmail(e.target.value)} required /> : <p className="text-sm text-ink-2">Une fenêtre Google te demandera de confirmer ton identité.</p>}
            {email.retour ? <Alerte ton={email.retour.ok ? "ok" : "erreur"}>{email.retour.texte}</Alerte> : null}
            <BoutonEnvoi enCours={email.enCours} className="sm:w-auto">
              Changer d&apos;adresse
            </BoutonEnvoi>
          </form>
        ) : (
          <p className="text-sm text-ink-2">Vérifie d&apos;abord ton adresse actuelle (lien reçu à l&apos;inscription) avant de la changer.</p>
        )}
      </Bloc>

      {avecMotDePasse ? (
        <Bloc titre="Mot de passe">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (nouveau !== confirmation) return void mdp.lancer(() => Promise.reject(new Error("Les deux nouveaux mots de passe ne correspondent pas.")), "");
              void mdp.lancer(async () => {
                await changerMotDePasse(actuel, nouveau);
                setActuel("");
                setNouveau("");
                setConfirmation("");
              }, "Mot de passe changé.");
            }}
          >
            <ChampMotDePasse libelle="Mot de passe actuel" autoComplete="current-password" value={actuel} onChange={(e) => setActuel(e.target.value)} required />
            <ChampMotDePasse libelle="Nouveau mot de passe" autoComplete="new-password" value={nouveau} onChange={(e) => setNouveau(e.target.value)} aide="8 caractères au moins, avec une lettre et un chiffre." required />
            <ChampMotDePasse libelle="Confirmation" autoComplete="new-password" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} required />
            {mdp.retour ? <Alerte ton={mdp.retour.ok ? "ok" : "erreur"}>{mdp.retour.texte}</Alerte> : null}
            <BoutonEnvoi enCours={mdp.enCours} className="sm:w-auto">
              Changer le mot de passe
            </BoutonEnvoi>
          </form>
        </Bloc>
      ) : null}

      <Bloc titre="Connexion avec Google" aide="Associer Google te permet de te connecter en un clic. Tu prouves ainsi que tu contrôles les deux identités : rien n'est fusionné sans toi.">
        {avecGoogle ? (
          <p className="text-sm text-ok">Google est associé à ton compte.</p>
        ) : (
          <>
            <button type="button" className="btn btn-secondaire" disabled={google.enCours} onClick={() => void google.lancer(associerGoogle, "Google est maintenant associé à ton compte.")}>
              Associer mon compte Google
            </button>
            {google.retour ? (
              <div className="mt-3">
                <Alerte ton={google.retour.ok ? "ok" : "erreur"}>{google.retour.texte}</Alerte>
              </div>
            ) : null}
          </>
        )}
      </Bloc>

      <Bloc titre="Sécurité" aide="Téléphone perdu, ordinateur partagé ? Ferme toutes les sessions ouvertes : il faudra te reconnecter partout.">
        <button type="button" className="btn btn-secondaire" disabled={sessions.enCours} onClick={() => void sessions.lancer(deconnecterPartout, "Toutes les sessions sont fermées.")}>
          Déconnecter tous les appareils
        </button>
        {sessions.retour && !sessions.retour.ok ? (
          <div className="mt-3">
            <Alerte>{sessions.retour.texte}</Alerte>
          </div>
        ) : null}
        <p className="mt-4 text-sm text-ink-2">
          Pour supprimer ton compte et tes données, écris-nous depuis le{" "}
          <Link href="/#contact" className="text-brand underline">
            formulaire de contact
          </Link>{" "}
          : l&apos;historique des paiements est conservé le temps exigé par la loi.
        </p>
      </Bloc>
    </div>
  );
}
