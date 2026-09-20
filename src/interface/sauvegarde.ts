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
  ames: number;
  amesTotal: number;
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

export function lireProgression(): Progression {
  try {
    const brut = localStorage.getItem(CLE);
    if (!brut) return vide();
    const p = JSON.parse(brut) as Partial<Progression>;
    return {
      atteint: typeof p.atteint === 'number' ? p.atteint : 1,
      finVue: p.finVue === true,
      etages: p.etages && typeof p.etages === 'object' ? p.etages : {},
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
 * de lumière, le plus d'âmes, le moins de prises. C'est plus généreux que de
 * garder un passage entier, et ça correspond à ce qu'on cherche — finir par
 * tout avoir, pas réussir tout d'un coup.
 */
export function retenirBilan(etage: number, t: Trace, suivant: number): Progression {
  const p = lireProgression();
  const avant = p.etages[etage];
  p.etages[etage] = avant
    ? {
        lumiere: Math.max(avant.lumiere, t.lumiere),
        ames: Math.max(avant.ames, t.ames),
        amesTotal: Math.max(avant.amesTotal, t.amesTotal),
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
