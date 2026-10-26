import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";

type Narration = { slug: string; duree: number; scenes: { debut: number; fin: number; phrases: { texte: string }[] }[] };
const dossier = join(process.cwd(), "src", "content", "narration");
const narrations: Narration[] = readdirSync(dossier)
  .filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(readFileSync(join(dossier, f), "utf8")));

const lecture = (a: HTMLAudioElement) => ({ t: a.currentTime, enPause: a.paused, muet: a.muted, volume: a.volume, duree: a.duration, erreur: a.error?.code ?? 0 });

test("la capsule est narrée : le son se lit, se coupe, et suit les sauts de scène", async ({ page }) => {
  const n = narrations.find((x) => x.slug === "stop-loss-take-profit")!;
  await page.goto("/chapitre/stop-loss-take-profit/#etape-capsule");
  const audio = page.locator("#etape-capsule audio");
  await expect(audio).toHaveCount(1);
  await page.getByRole("button", { name: "Lire la capsule" }).click();
  await expect.poll(() => audio.evaluate((a: HTMLAudioElement) => a.currentTime), { timeout: 15_000 }).toBeGreaterThan(1);
  const etat = await audio.evaluate(lecture);
  expect(etat).toMatchObject({ enPause: false, muet: false, volume: 1, erreur: 0 });
  expect(etat.duree).toBeCloseTo(n.duree, 0);

  // Le sous-titre affiché est une phrase de la scène en cours.
  const sousTitre = await page.locator("#etape-capsule [data-sous-titre]").innerText();
  expect(n.scenes.flatMap((s) => s.phrases.map((p) => p.texte.replace(/\s+/g, " ")))).toContain(sousTitre.replace(/\s+/g, " "));

  // En pause, un saut de scène replace la voix exactement au début de cette scène.
  await page.getByRole("button", { name: "Mettre en pause" }).click();
  expect(await audio.evaluate((a: HTMLAudioElement) => a.paused)).toBe(true);
  await page.getByRole("button", { name: "Aller à la scène 4" }).click();
  const t = await audio.evaluate((a: HTMLAudioElement) => a.currentTime);
  expect(t).toBeCloseTo(n.scenes[3].debut, 1);
  await expect(page.getByRole("button", { name: "Aller à la scène 4" })).toHaveAttribute("aria-current", "step");

  await page.getByRole("button", { name: "Couper le son" }).click();
  expect(await audio.evaluate((a: HTMLAudioElement) => a.muted)).toBe(true);
});

test("les quatorze capsules ont une narration qui se charge et se lit", async ({ page, isMobile }) => {
  test.skip(isMobile, "Une passe suffit pour vérifier les fichiers audio");
  test.setTimeout(180_000);
  for (const n of narrations) {
    await page.goto(`/chapitre/${n.slug}/#etape-capsule`);
    const audio = page.locator("#etape-capsule audio");
    await page.getByRole("button", { name: "Lire la capsule" }).click();
    await expect.poll(() => audio.evaluate((a: HTMLAudioElement) => a.currentTime), { timeout: 15_000, message: n.slug }).toBeGreaterThan(0.5);
    const etat = await audio.evaluate(lecture);
    expect(etat.erreur, n.slug).toBe(0);
    expect(etat.duree, n.slug).toBeCloseTo(n.duree, 0);
    expect(etat.duree, n.slug).toBeLessThanOrEqual(90.5);
    await page.getByRole("button", { name: "Mettre en pause" }).click();
  }
});
