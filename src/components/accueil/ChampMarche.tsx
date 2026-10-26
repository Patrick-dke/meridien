"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Décor de l'accueil : un champ de chandeliers en 3D qui ondule lentement, traversé par le méridien.
 * three.js n'est chargé qu'après l'affichage de la page, si l'appareil s'y prête (WebGL, pas d'économie de
 * données, pas de mouvement réduit ni de mode léger). Sinon, l'affiche SVG fixe reste seule.
 */
export function ChampMarche() {
  const hote = useRef<HTMLDivElement>(null);
  const [actif, setActif] = useState(false);

  useEffect(() => {
    const el = hote.current;
    if (!el) return;
    const reduit = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const leger = document.documentElement.dataset.leger === "oui";
    const economie = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
    if (reduit || leger || economie) return;
    // Téléphones et appareils modestes : l'affiche animée en CSS suffit, sans télécharger ni compiler three.js.
    const memoire = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
    if (innerWidth < 768 || memoire < 4 || (navigator.hardwareConcurrency ?? 8) < 4) return;
    const test = document.createElement("canvas");
    const gl = test.getContext("webgl2");
    if (!gl) return;
    // Rendu logiciel (pas d'accélération graphique) : la 3D occuperait tout le processeur, l'affiche suffit.
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const moteur = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    if (/swiftshader|llvmpipe|software|basic render/i.test(moteur)) return;

    let arret = () => {};
    let annule = false;
    const lancer = async () => {
      const THREE = await import("three");
      if (annule) return;
      const modeste = (navigator.hardwareConcurrency ?? 4) <= 4 || innerWidth < 640;
      const COLS = modeste ? 26 : 40;
      const RANGS = modeste ? 11 : 16;
      const n = COLS * RANGS;

      const rendu = new THREE.WebGLRenderer({ antialias: !modeste, alpha: true, powerPreference: "low-power" });
      rendu.setPixelRatio(Math.min(devicePixelRatio, modeste ? 1 : 1.5));
      rendu.setClearColor(0x000000, 0);
      el.appendChild(rendu.domElement);
      rendu.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;opacity:0;transition:opacity 1.2s";

      const scene = new THREE.Scene();
      scene.fog = new THREE.Fog(0x05070d, 14, 34);
      const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 80);
      camera.position.set(0, 5.2, 15);
      camera.lookAt(0, 0.6, 0);

      const corps = new THREE.InstancedMesh(new THREE.BoxGeometry(0.34, 1, 0.34), new THREE.MeshBasicMaterial({ toneMapped: false }), n);
      const meches = new THREE.InstancedMesh(new THREE.BoxGeometry(0.05, 1, 0.05), new THREE.MeshBasicMaterial({ toneMapped: false }), n);
      scene.add(corps, meches);

      const style = getComputedStyle(document.documentElement);
      const hausse = new THREE.Color(style.getPropertyValue("--bull").trim() || "#26c08a");
      const baisse = new THREE.Color(style.getPropertyValue("--bear").trim() || "#ef5b61");
      const iris = new THREE.Color("#8f84ff");
      const cyan = new THREE.Color("#45d7f2");

      // Le méridien : une ligne lumineuse iris → cyan qui traverse le champ.
      const pts = Array.from({ length: 60 }, (_, i) => new THREE.Vector3(-1.2 + Math.sin(i / 9) * 0.5, 0.2, 8 - i * 0.45));
      const ligne = new THREE.BufferGeometry().setFromPoints(pts);
      ligne.setAttribute(
        "color",
        new THREE.Float32BufferAttribute(pts.flatMap((_, i) => iris.clone().lerp(cyan, i / pts.length).toArray()), 3),
      );
      scene.add(new THREE.Line(ligne, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.9 })));

      const m = new THREE.Matrix4();
      const q = new THREE.Quaternion();
      const echelle = new THREE.Vector3();
      const position = new THREE.Vector3();
      const couleur = new THREE.Color();
      const hauteur = (x: number, z: number, t: number) =>
        Math.sin(x * 0.42 + t * 0.6) * 0.9 + Math.cos(z * 0.55 - t * 0.45) * 0.7 + Math.sin((x + z) * 0.21 + t * 0.3) * 0.5;

      let cibleX = 0;
      const pointeur = (e: PointerEvent) => {
        cibleX = (e.clientX / innerWidth - 0.5) * 2.4;
      };
      addEventListener("pointermove", pointeur, { passive: true });

      const taille = () => {
        const { width, height } = el.getBoundingClientRect();
        rendu.setSize(width, height, false);
        camera.aspect = width / Math.max(1, height);
        camera.updateProjectionMatrix();
      };
      taille();
      const ro = new ResizeObserver(taille);
      ro.observe(el);

      let visible = true;
      const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
      io.observe(el);

      let id = 0;
      let premiere = true;
      const debut = performance.now();
      const image = (now: number) => {
        id = requestAnimationFrame(image);
        if (!visible || document.hidden) return;
        const t = (now - debut) / 1000;
        for (let i = 0; i < n; i++) {
          const c = i % COLS;
          const r = Math.floor(i / COLS);
          const x = (c - COLS / 2) * 0.62;
          const z = (r - RANGS / 2) * -0.9;
          const ouverture = hauteur(x, z, t - 0.35);
          const cloture = hauteur(x, z, t);
          const h = Math.max(0.08, Math.abs(cloture - ouverture) * 2.2);
          position.set(x, (ouverture + cloture) / 2, z);
          echelle.set(1, h, 1);
          corps.setMatrixAt(i, m.compose(position, q, echelle));
          echelle.set(1, h + 0.5, 1);
          meches.setMatrixAt(i, m.compose(position, q, echelle));
          couleur.copy(cloture >= ouverture ? hausse : baisse).multiplyScalar(0.55 + 0.45 * (1 - r / RANGS));
          corps.setColorAt(i, couleur);
          meches.setColorAt(i, couleur);
        }
        corps.instanceMatrix.needsUpdate = true;
        meches.instanceMatrix.needsUpdate = true;
        if (corps.instanceColor) corps.instanceColor.needsUpdate = true;
        if (meches.instanceColor) meches.instanceColor.needsUpdate = true;
        camera.position.x += (cibleX - camera.position.x) * 0.03;
        camera.lookAt(0, 0.6, 0);
        rendu.render(scene, camera);
        if (premiere) {
          premiere = false;
          rendu.domElement.style.opacity = "1";
          setActif(true);
        }
      };
      id = requestAnimationFrame(image);

      arret = () => {
        cancelAnimationFrame(id);
        removeEventListener("pointermove", pointeur);
        ro.disconnect();
        io.disconnect();
        corps.geometry.dispose();
        meches.geometry.dispose();
        ligne.dispose();
        rendu.dispose();
        rendu.domElement.remove();
      };
    };

    // On attend que la page soit posée et inoccupée avant de télécharger la 3D.
    const ralenti = typeof requestIdleCallback === "function";
    const lancement = ralenti ? requestIdleCallback(() => void lancer(), { timeout: 2500 }) : globalThis.setTimeout(() => void lancer(), 1200);
    return () => {
      annule = true;
      if (ralenti) cancelIdleCallback(lancement as number);
      else clearTimeout(lancement as ReturnType<typeof setTimeout>);
      arret();
    };
  }, []);

  return (
    <div ref={hote} className="pointer-events-none absolute inset-0" aria-hidden="true" data-champ={actif ? "3d" : "affiche"}>
      <AfficheChamp masque={actif} />
    </div>
  );
}

// Arrondi des coordonnées : le serveur et le navigateur ne calculent pas sinus et cosinus au dernier chiffre près.
const r2 = (v: number) => Math.round(v * 100) / 100;

/** Affiche fixe du champ (SVG) : visible tout de suite, et seule quand la 3D n'est pas lancée. */
function AfficheChamp({ masque }: { masque: boolean }) {
  const rangs = 7;
  const cols = 22;
  return (
    <svg
      viewBox="0 0 800 360"
      preserveAspectRatio="xMidYMax slice"
      className="absolute inset-0 h-full w-full transition-opacity duration-1000"
      style={{ opacity: masque ? 0 : 1 }}
    >
      {/* Une houle par rangée, et chaque rangée en quatre tracés (mèches et corps, hausse et baisse) :
          28 éléments au lieu de 462, le premier affichage reste rapide sur un téléphone modeste. */}
      {Array.from({ length: rangs }, (_, r) => {
        const echelle = 0.45 + (r / rangs) * 0.75;
        const traces = { meches: { hausse: "", baisse: "" }, corps: { hausse: "", baisse: "" } };
        for (let c = 0; c < cols; c++) {
          const x = r2(400 + (c - cols / 2) * 38 * echelle);
          const base = 120 + r * 34;
          const onde = Math.sin(c * 0.5 + r * 0.8) * 18 + Math.cos(c * 0.31 - r) * 12;
          const haut = Math.abs(Math.sin(c * 1.7 + r * 2.3)) * 22 + 5;
          const sens = Math.sin(c * 0.9 + r * 1.3) > 0 ? "hausse" : "baisse";
          const demi = r2(5 * echelle);
          const yHaut = r2(base - onde - haut * echelle);
          traces.meches[sens] += `M${x} ${r2(yHaut - 6)}V${r2(base - onde + 6)}`;
          traces.corps[sens] += `M${r2(x - demi)} ${yHaut}h${r2(demi * 2)}v${r2(haut * echelle)}h${-r2(demi * 2)}Z`;
        }
        return (
          <g key={r} opacity={r2(0.25 + (r / rangs) * 0.6)} className="houle" style={{ animationDelay: `${(2.5 - r * 0.45).toFixed(2)}s`, animationPlayState: masque ? "paused" : undefined }}>
            <path d={traces.meches.hausse} stroke="var(--bull)" strokeWidth={r2(1.2 * echelle)} fill="none" />
            <path d={traces.meches.baisse} stroke="var(--bear)" strokeWidth={r2(1.2 * echelle)} fill="none" />
            <path d={traces.corps.hausse} fill="var(--bull)" />
            <path d={traces.corps.baisse} fill="var(--bear)" />
          </g>
        );
      })}
      <path d="M330 360 C 360 260, 300 190, 352 110" fill="none" stroke="url(#degrade-meridien)" strokeWidth="2" opacity="0.8" />
    </svg>
  );
}
