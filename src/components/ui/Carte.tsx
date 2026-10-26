"use client";

import Link from "next/link";
import { useRef } from "react";

type Props = {
  href?: string;
  className?: string;
  children: React.ReactNode;
  /** Léger basculement 3D qui suit la souris (désactivé au toucher et si les animations sont réduites). */
  relief?: boolean;
  "aria-label"?: string;
  "aria-current"?: "page" | "step" | undefined;
};

/**
 * Carte interactive : une lueur suit le pointeur et la carte bascule légèrement au survol ; au toucher, elle
 * s'enfonce. Les variables CSS sont écrites directement sur l'élément : aucun rendu React pendant le survol.
 */
export function Carte({ href, className = "", children, relief = true, ...aria }: Props) {
  const cadre = useRef<DOMRect | null>(null);

  const entrer = (e: React.PointerEvent<HTMLElement>) => {
    cadre.current = e.currentTarget.getBoundingClientRect();
  };
  const bouger = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = cadre.current ?? e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    const s = e.currentTarget.style;
    s.setProperty("--px", `${(x * 100).toFixed(1)}%`);
    s.setProperty("--py", `${(y * 100).toFixed(1)}%`);
    if (relief) {
      s.setProperty("--rx", `${((0.5 - y) * 5).toFixed(2)}deg`);
      s.setProperty("--ry", `${((x - 0.5) * 6).toFixed(2)}deg`);
    }
  };
  const quitter = (e: React.PointerEvent<HTMLElement>) => {
    const s = e.currentTarget.style;
    s.setProperty("--rx", "0deg");
    s.setProperty("--ry", "0deg");
    cadre.current = null;
  };

  const classes = `carte carte-vive block ${className}`;
  const evenements = { onPointerEnter: entrer, onPointerMove: bouger, onPointerLeave: quitter };
  if (href) {
    return (
      <Link href={href} className={classes} {...evenements} {...aria}>
        {children}
      </Link>
    );
  }
  return (
    <div className={classes} {...evenements} {...aria}>
      {children}
    </div>
  );
}
