/**
 * LA FIN — il sort, et il retombe.
 *
 * Falot ne monte pas pour s'échapper : il monte pour retrouver SON humain.
 * Les âmes qu'il remonte sont le bonheur des gens d'en haut, et chacune finit
 * par retrouver le sien. Lui aussi y arrive. Son humain le reconnaît, ils se
 * rapprochent — et au moment de se lier, l'homme oublie.
 *
 * Alors il retombe, tout en bas, et ça recommence. C'est la seule fin possible
 * pour un jeu dont le sujet est l'oubli : il n'y a personne à blâmer, et il
 * reste des âmes à remonter.
 *
 * Quatre temps, rien à cliquer. Une commande tenue accélère : on peut avoir
 * déjà vu la fin sans vouloir l'attendre une deuxième fois.
 */

import { clamp } from '../geometrie.js';
import { chargerZone } from '../monde/chargement.js';
import type { Partie } from '../types.js';
import { faireTaireLEtage } from './puits.js';
import { lancerLaChute } from './seuil.js';

/**
 * La durée de chaque temps, en secondes, dans l'ordre où ils viennent :
 *   — les autres âmes retrouvent les leurs ;
 *   — le sien le reconnaît, et ils se rapprochent ;
 *   — il oublie ;
 *   — Falot retombe.
 */
export const TEMPS_FIN = {
  retrouvailles: 6,
  retrouve: 5,
  oubli: 4,
  chute: 4.5,
} as const;
export const DUREE_FIN =
  TEMPS_FIN.retrouvailles + TEMPS_FIN.retrouve + TEMPS_FIN.oubli + TEMPS_FIN.chute;

export function lancerLaFin(partie: Partie): void {
  partie.fin = { t: 0 };
  faireTaireLEtage(partie); // rien ne doit rester par-dessus la dernière image
  partie.joueur.vx = 0;
  partie.joueur.vy = 0;
}

/** Où en est-on de la fin : le temps écoulé, découpé en quatre. */
export function tempsFin(t: number): { etape: keyof typeof TEMPS_FIN; k: number } {
  let reste = t;
  for (const etape of ['retrouvailles', 'retrouve', 'oubli', 'chute'] as const) {
    const d = TEMPS_FIN[etape];
    if (reste < d) return { etape, k: clamp(reste / d, 0, 1) };
    reste -= d;
  }
  return { etape: 'chute', k: 1 };
}

export function majFin(partie: Partie, dt: number): void {
  const fin = partie.fin;
  if (!fin) return;
  const { touches, manche } = partie.entrees;
  // Une main posée presse le mouvement : la deuxième fois, on sait déjà.
  const presse =
    touches.haut || touches.bas || touches.gauche || touches.droite || manche.actif;
  fin.t += dt * (presse ? 4 : 1);
  if (fin.t < DUREE_FIN) return;

  // ET ÇA RECOMMENCE. Il est retombé tout en bas, là où le jeu a commencé.
  // Pas un mode déverrouillé, pas un bonus : la même descente, parce qu'il
  // reste des âmes et qu'il ne se souvient déjà plus d'avoir échoué.
  partie.fin = null;
  partie.finVue = true;
  chargerZone(partie, 1);
  lancerLaChute(partie, 'haut', false);
}
