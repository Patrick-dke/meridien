import { concepts as c_marchesEtPlateformes } from "./marches-et-plateformes/concepts";
import { termes as t_marchesEtPlateformes } from "./marches-et-plateformes/glossaire";
import { concepts as c_risqueEtDiscipline } from "./risque-et-discipline/concepts";
import { termes as t_risqueEtDiscipline } from "./risque-et-discipline/glossaire";
import { concepts as c_analyseTechnique } from "./analyse-technique/concepts";
import { termes as t_analyseTechnique } from "./analyse-technique/glossaire";
import { concepts as c_priceAction } from "./price-action/concepts";
import { termes as t_priceAction } from "./price-action/glossaire";
import { concepts as c_smartMoneyConcepts } from "./smart-money-concepts/concepts";
import { termes as t_smartMoneyConcepts } from "./smart-money-concepts/glossaire";
import { concepts as c_liquiditeIct } from "./liquidite-ict/concepts";
import { termes as t_liquiditeIct } from "./liquidite-ict/glossaire";
import { concepts as c_modelesEtMethode } from "./modeles-et-methode/concepts";
import { termes as t_modelesEtMethode } from "./modeles-et-methode/glossaire";

/** Concepts et termes de glossaire des modules payants (publics : ils ne contiennent pas les cours). */
export const conceptsLots = [...c_marchesEtPlateformes, ...c_risqueEtDiscipline, ...c_analyseTechnique, ...c_priceAction, ...c_smartMoneyConcepts, ...c_liquiditeIct, ...c_modelesEtMethode];
export const termesLots = [...t_marchesEtPlateformes, ...t_risqueEtDiscipline, ...t_analyseTechnique, ...t_priceAction, ...t_smartMoneyConcepts, ...t_liquiditeIct, ...t_modelesEtMethode];
