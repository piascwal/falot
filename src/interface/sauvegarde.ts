/**
 * LA PROGRESSION, retenue d'une session à l'autre.
 *
 * Le jeu ne gardait qu'une chose : « le prologue a été fini ». Tout le reste —
 * les étages traversés, ce qu'on y a éclairé, ce qu'on y a laissé — mourait
 * avec l'onglet. Or le bilan de fin d'étage ne vaut que si on peut y revenir :
 * un 60 % qu'on ne revoit jamais n'est pas un objectif.
 *
 * Le stockage est un LUXE, pas une dépendance : en navigation privée tout
 * échoue silencieusement et le jeu se joue pareil, sans mémoire.
 */

const CLE = 'lux-progression-1';

/** Le meilleur passage sur un étage. On ne garde jamais le pire. */
export interface Trace {
  lumiere: number;
  lumieres: number;
  lumieresTotal: number;
  morts: number;
}

export interface Progression {
  /** L'étage le plus haut où l'on soit arrivé. */
  atteint: number;
  /** La fin a été vue au moins une fois. */
  finVue: boolean;
  /** Le meilleur bilan de chaque étage, par numéro. */
  etages: Record<number, Trace>;
}

const vide = (): Progression => ({ atteint: 1, finVue: false, etages: {} });

/**
 * Les bilans déjà rangés, relus.
 *
 * Ils comptaient des « âmes » ; ce sont des lumières depuis que la fiction a
 * été remise d'aplomb. Une progression écrite avant ce jour porte donc les
 * anciens noms, et sans ça elle revenait avec des NaN plein la grille des
 * étages. On lit l'ancien nom à défaut du nouveau, et on ne le réécrit
 * jamais : la prochaine sauvegarde le fait toute seule.
 */
function reprendre(brut: unknown): Record<number, Trace> {
  if (!brut || typeof brut !== 'object') return {};
  const out: Record<number, Trace> = {};
  for (const [cle, v] of Object.entries(brut as Record<string, Record<string, number>>)) {
    if (!v || typeof v !== 'object') continue;
    out[Number(cle)] = {
      lumiere: v.lumiere ?? 0,
      lumieres: v.lumieres ?? v.ames ?? 0,
      lumieresTotal: v.lumieresTotal ?? v.amesTotal ?? 0,
      morts: v.morts ?? 0,
    };
  }
  return out;
}

export function lireProgression(): Progression {
  try {
    const brut = localStorage.getItem(CLE);
    if (!brut) return vide();
    const p = JSON.parse(brut) as Partial<Progression>;
    return {
      atteint: typeof p.atteint === 'number' ? p.atteint : 1,
      finVue: p.finVue === true,
      etages: reprendre(p.etages),
    };
  } catch {
    return vide(); // navigation privée, quota, JSON abîmé : tant pis
  }
}

function ecrire(p: Progression): void {
  try {
    localStorage.setItem(CLE, JSON.stringify(p));
  } catch {
    /* tant pis */
  }
}

/**
 * Range un bilan. On garde le MEILLEUR de chaque colonne séparément : le plus
 * éclairé, le plus de lumières remontées, le moins de prises. C'est plus généreux que de
 * garder un passage entier, et ça correspond à ce qu'on cherche — finir par
 * tout avoir, pas réussir tout d'un coup.
 */
export function retenirBilan(etage: number, t: Trace, suivant: number): Progression {
  const p = lireProgression();
  const avant = p.etages[etage];
  p.etages[etage] = avant
    ? {
        lumiere: Math.max(avant.lumiere, t.lumiere),
        lumieres: Math.max(avant.lumieres, t.lumieres),
        lumieresTotal: Math.max(avant.lumieresTotal, t.lumieresTotal),
        morts: Math.min(avant.morts, t.morts),
      }
    : { ...t };
  p.atteint = Math.max(p.atteint, suivant);
  ecrire(p);
  return p;
}

export function retenirLaFin(): void {
  const p = lireProgression();
  p.finVue = true;
  ecrire(p);
}

/** Tout oublier. Le bouton n'existe pas encore ; la fonction, si. */
export function oublierLaProgression(): void {
  try {
    localStorage.removeItem(CLE);
  } catch {
    /* tant pis */
  }
}
