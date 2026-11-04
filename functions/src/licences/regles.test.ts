import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { chaineASigner, decider, genererCle, normaliserCle, normaliserNumeroCompte, normaliserServeur, signer, type Licence } from "./regles";

const base: Licence = {
  uid: "u1",
  outil: "ea",
  cle: "MER-AAAA-BBBB-CCCC-DDDD",
  statut: "active",
  comptes: [{ numero: "51234567", serveur: "MetaQuotes-Demo", ajouteLe: "2026-11-01T00:00:00.000Z" }],
  maxComptes: 2,
  activationAuto: false,
  activations: 1,
  expireLe: null,
};
const maintenant = new Date("2026-11-02T10:00:00.000Z");

describe("clés de licence", () => {
  it("génère des clés au bon format, sans caractères ambigus, toutes différentes", () => {
    const cles = new Set(Array.from({ length: 500 }, genererCle));
    expect(cles.size).toBe(500);
    for (const c of cles) {
      expect(c).toMatch(/^MER(-[A-HJ-NP-Z2-9]{4}){4}$/);
      expect(normaliserCle(c.toLowerCase())).toBe(c);
    }
  });
  it("refuse les clés mal formées", () => {
    expect(normaliserCle("MER-AAAA-BBBB-CCCC")).toBeNull();
    expect(normaliserCle("MER-AAAA-BBBB-CCCC-DDD0")).toBeNull();
    expect(normaliserCle(42)).toBeNull();
  });
});

describe("comptes et serveurs", () => {
  it("n'accepte qu'un numéro de compte, jamais un texte qui ressemblerait à un mot de passe", () => {
    expect(normaliserNumeroCompte(" 51234567 ")).toBe("51234567");
    expect(normaliserNumeroCompte(51234567)).toBe("51234567");
    expect(normaliserNumeroCompte("motdepasse123")).toBeNull();
    expect(normaliserNumeroCompte("12")).toBeNull();
  });
  it("valide les noms de serveurs courants", () => {
    expect(normaliserServeur("Exness-MT5Real8")).toBe("Exness-MT5Real8");
    expect(normaliserServeur("ICMarketsSC-Demo")).toBe("ICMarketsSC-Demo");
    expect(normaliserServeur("x")).toBeNull();
    expect(normaliserServeur("serveur<script>")).toBeNull();
  });
});

describe("décision de vérification", () => {
  it("autorise un compte enregistré, sans tenir compte de la casse du serveur", () => {
    expect(decider(base, "51234567", "metaquotes-demo", maintenant)).toEqual({ raison: "ok" });
  });
  it("refuse une clé inconnue, une licence suspendue, révoquée ou expirée", () => {
    expect(decider(null, "1", "x", maintenant).raison).toBe("inconnue");
    expect(decider({ ...base, statut: "suspendue" }, "51234567", "MetaQuotes-Demo", maintenant).raison).toBe("suspendue");
    expect(decider({ ...base, statut: "revoquee" }, "51234567", "MetaQuotes-Demo", maintenant).raison).toBe("revoquee");
    expect(decider({ ...base, expireLe: "2026-11-02T09:59:59.000Z" }, "51234567", "MetaQuotes-Demo", maintenant).raison).toBe("expiree");
    expect(decider({ ...base, expireLe: "2026-12-01T00:00:00.000Z" }, "51234567", "MetaQuotes-Demo", maintenant).raison).toBe("ok");
  });
  it("refuse un autre compte, ou le même numéro sur un autre serveur", () => {
    expect(decider(base, "99999999", "MetaQuotes-Demo", maintenant).raison).toBe("compte-non-autorise");
    expect(decider(base, "51234567", "Autre-Courtier", maintenant).raison).toBe("compte-non-autorise");
  });
  it("active automatiquement un nouveau compte s'il reste une place, et seulement alors", () => {
    const auto = { ...base, activationAuto: true };
    const r = decider(auto, "77777777", "Exness-MT5Real8", maintenant);
    expect(r.raison).toBe("ok");
    expect(r.ajouter).toEqual({ numero: "77777777", serveur: "Exness-MT5Real8", ajouteLe: maintenant.toISOString() });
    const pleine = { ...auto, comptes: [...auto.comptes, r.ajouter!] };
    expect(decider(pleine, "88888888", "Exness-MT5Real8", maintenant).raison).toBe("compte-non-autorise");
  });
});

describe("signature des réponses", () => {
  it("signe une chaîne stable, que le robot peut recalculer avec HMAC-SHA256", () => {
    const r = { valide: true, raison: "ok" as const, cle: base.cle, compte: "51234567", nonce: "n0nce42", horodatage: "2026-11-02T10:00:00.000Z", expireLe: null };
    expect(chaineASigner(r)).toBe("1|ok|MER-AAAA-BBBB-CCCC-DDDD|51234567|n0nce42|2026-11-02T10:00:00.000Z|");
    expect(signer("secret", r)).toBe(createHmac("sha256", "secret").update(chaineASigner(r)).digest("hex"));
    expect(signer("secret", { ...r, valide: false })).not.toBe(signer("secret", r));
  });
});
