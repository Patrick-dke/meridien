import { TransitionPage } from "@/components/shell/TransitionPage";

/** Recréé à chaque navigation : porte l'animation d'entrée de page. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <TransitionPage>{children}</TransitionPage>;
}
