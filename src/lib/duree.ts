/** 158 → « 2 h 38 » ; 45 → « 45 min » (espaces insécables : la durée ne se coupe pas en fin de ligne). */
export const duree = (minutes: number) => (minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, "0")}`);
