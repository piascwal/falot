/**
 * LE DERNIER SEUIL.
 *
 * Onze fois, Falot a donné au Seuil tout ce qu'il venait de retrouver, et onze
 * fois il est reparti petit. Au douzième, le portail en demande plus qu'il
 * n'en a jamais eu — et il n'a plus qu'une chose à mettre dedans.
 *
 * Il pousse les siens devant lui, puis il entre à leur suite. Pas pour passer :
 * pour tenir la porte ouverte. Le Seuil s'allume et ne s'éteint plus.
 *
 * Quatre temps, et rien à cliquer. Une commande tenue accélère : on peut avoir
 * déjà vu la fin sans vouloir l'attendre une deuxième fois.
 */

import { clamp } from '../geometrie.js';
import { DERNIER_ETAGE } from '../monde/paliers.js';
import type { Partie } from '../types.js';
import { lancerLePuits } from './puits.js';

/** La durée de chaque temps, en secondes, dans l'ordre où ils viennent. */
export const TEMPS_FIN = { don: 3.4, lampe: 3, dehors: 7, puits: 3.4 } as const;
export const DUREE_FIN =
  TEMPS_FIN.don + TEMPS_FIN.lampe + TEMPS_FIN.dehors + TEMPS_FIN.puits;

export function lancerLaFin(partie: Partie): void {
  partie.fin = { t: 0 };
  partie.joueur.vx = 0;
  partie.joueur.vy = 0;
}

/** Où en est-on de la fin : le temps écoulé, découpé en quatre. */
export function tempsFin(t: number): { etape: keyof typeof TEMPS_FIN; k: number } {
  let reste = t;
  for (const etape of ['don', 'lampe', 'dehors', 'puits'] as const) {
    const d = TEMPS_FIN[etape];
    if (reste < d) return { etape, k: clamp(reste / d, 0, 1) };
    reste -= d;
  }
  return { etape: 'puits', k: 1 };
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

  // Et le Puits sans fin s'ouvre : les mêmes étages, sans plafond, avec tout
  // ce qu'on a appris. Il ne devient intéressant qu'une fois la fin vue —
  // c'est pour ça qu'il n'existe pas avant.
  partie.fin = null;
  partie.finVue = true;
  lancerLePuits(partie, DERNIER_ETAGE + 1);
}
