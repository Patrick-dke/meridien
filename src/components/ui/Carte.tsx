import Link from "next/link";

type Props = {
  href?: string;
  className?: string;
  children: React.ReactNode;
  "aria-label"?: string;
  "aria-current"?: "page" | "step" | undefined;
};

/** Carte cliquable : un cadre fin qui se fonce au survol. Ni lueur ni basculement. */
export function Carte({ href, className = "", children, ...aria }: Props) {
  const classes = `carte carte-lien block ${className}`;
  if (href) {
    return (
      <Link href={href} className={classes} {...aria}>
        {children}
      </Link>
    );
  }
  return (
    <div className={classes} {...aria}>
      {children}
    </div>
  );
}
