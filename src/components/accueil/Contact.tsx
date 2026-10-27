"use client";

import { useState } from "react";
import { useSession } from "@/lib/compte/session";
import { appeler, fonctionsDisponibles } from "@/lib/firebase/client";
import { useParametresPublics } from "@/lib/offre/commercial";
import { Alerte, BoutonEnvoi, Champ } from "../compte/Formulaire";

const SUJETS = [
  { valeur: "formation", libelle: "Une question sur une formation" },
  { valeur: "paiement", libelle: "Un paiement" },
  { valeur: "compte", libelle: "Mon compte" },
  { valeur: "outils", libelle: "Les outils MT5" },
  { valeur: "partenariat", libelle: "Un partenariat" },
  { valeur: "autre", libelle: "Autre chose" },
];

/** Formulaire de contact : les messages arrivent dans l'administration ; les coordonnées publiques viennent de la base. */
export function Contact() {
  const s = useSession();
  const pub = useParametresPublics();
  const [d, setD] = useState({
    nom: "",
    email: "",
    telephone: "",
    sujet: "formation",
    texte: "",
    site: "",
  });
  const [enCours, setEnCours] = useState(false);
  const [etat, setEtat] = useState<{ ok: boolean; texte: string } | null>(null);
  const maj =
    (k: keyof typeof d) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) =>
      setD({ ...d, [k]: e.target.value });
  const envoyer = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnCours(true);
    setEtat(null);
    try {
      const email = d.email || s.utilisateur?.email || "";
      const nom = d.nom || s.profil?.nom || s.utilisateur?.nom || "";
      const r = await appeler<{ reference?: string }>("envoyerMessage", {
        ...d,
        email,
        nom,
        telephone: d.telephone || undefined,
        site: d.site || undefined,
      });
      setEtat({
        ok: true,
        texte: `Message envoyé${r.reference ? ` (référence ${r.reference})` : ""}. Nous te répondons par e-mail.`,
      });
      setD({ ...d, texte: "" });
    } catch (err) {
      setEtat({ ok: false, texte: (err as Error).message });
    } finally {
      setEnCours(false);
    }
  };
  const contact = pub.donnees.contact;
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
      <div className="space-y-3 text-ink-2">
        <p>
          Une question sur une formation, un paiement ou les outils ? Écris-nous
          : chaque message est lu par l&apos;équipe.
        </p>
        {contact?.email ? (
          <p>
            E-mail :{" "}
            <a
              className="text-brand underline"
              href={`mailto:${contact.email}`}
            >
              {contact.email}
            </a>
          </p>
        ) : null}
        {contact?.whatsapp ? (
          <p>
            WhatsApp :{" "}
            <a
              className="text-brand underline"
              href={`https://wa.me/237${contact.whatsapp}`}
              rel="noopener noreferrer"
              target="_blank"
            >
              +237{" "}
              {contact.whatsapp.replace(
                /^(\d)(\d{2})(\d{2})(\d{2})(\d{2})$/,
                "$1 $2 $3 $4 $5",
              )}
            </a>
          </p>
        ) : null}
        <p className="text-sm text-ink-3">
          Ne communique jamais ton code secret Mobile Money, ni à nous ni à
          personne.
        </p>
      </div>
      {!fonctionsDisponibles ? (
        <div className="carte p-5 sm:p-6">
          <p className="font-semibold text-ink">
            Le formulaire de contact ouvre très bientôt.
          </p>
          <p className="mt-2 text-ink-2">
            Il sera relié à l&apos;équipe dès la mise en service des fonctions
            du site.
          </p>
        </div>
      ) : (
        <form onSubmit={envoyer} className="carte space-y-4 p-5 sm:p-6">
          {s.etat !== "connecte" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Champ
                libelle="Nom"
                autoComplete="name"
                required
                minLength={2}
                maxLength={80}
                value={d.nom}
                onChange={maj("nom")}
              />
              <Champ
                libelle="E-mail"
                type="email"
                autoComplete="email"
                required
                value={d.email}
                onChange={maj("email")}
              />
            </div>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="sujet-contact" className="etiquette">
                Sujet
              </label>
              <select
                id="sujet-contact"
                className="champ"
                value={d.sujet}
                onChange={maj("sujet")}
              >
                {SUJETS.map((x) => (
                  <option key={x.valeur} value={x.valeur}>
                    {x.libelle}
                  </option>
                ))}
              </select>
            </div>
            <Champ
              libelle="Téléphone (facultatif)"
              type="tel"
              inputMode="tel"
              value={d.telephone}
              onChange={maj("telephone")}
            />
          </div>
          <div>
            <label htmlFor="texte-contact" className="etiquette">
              Message
            </label>
            <textarea
              id="texte-contact"
              className="champ"
              required
              minLength={10}
              maxLength={3000}
              value={d.texte}
              onChange={maj("texte")}
            />
          </div>
          <div className="hidden" aria-hidden="true">
            <label>
              Site web
              <input
                tabIndex={-1}
                autoComplete="off"
                value={d.site}
                onChange={maj("site")}
              />
            </label>
          </div>
          {etat ? (
            <Alerte ton={etat.ok ? "ok" : "erreur"}>{etat.texte}</Alerte>
          ) : null}
          <BoutonEnvoi enCours={enCours} className="sm:w-auto">
            Envoyer
          </BoutonEnvoi>
        </form>
      )}
    </div>
  );
}
