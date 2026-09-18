/**
 * Particules, ondes de choc et textes flottants. C'est le canal qui dit
 * l'émotion sans un mot — danger, joie, peur — et qui relie un objet ramassé à
 * la jauge qu'il remplit.
 *
 * Tout passe par `partie.hasard()` et jamais par `Math.random()` : une partie
 * rejouée doit produire exactement la même chose, jusqu'aux étincelles.
 */

import { D } from './dimensions.js';
import type { Flottant, Particule, Partie, Perso } from './types.js';

/** Petites particules au-dessus de la tête. */
export function emettre(
  partie: Partie,
  x: number,
  y: number,
  couleur: string,
  n: number,
  vitesse: number,
  forme: Particule['forme'] = 'point',
): void {
  for (let i = 0; i < n && partie.particules.length < 140; i++) {
    const a = -Math.PI / 2 + (partie.hasard() - 0.5) * 1.5;
    partie.particules.push({
      x,
      y,
      vx: Math.cos(a) * vitesse * (0.5 + partie.hasard()),
      vy: Math.sin(a) * vitesse * (0.5 + partie.hasard()),
      vie: 0.5 + partie.hasard() * 0.5,
      max: 1,
      couleur,
      forme,
    });
  }
}

export function onde(
  partie: Partie,
  x: number,
  y: number,
  max: number,
  couleur: string,
): void {
  partie.ondes.push({ x, y, r: 0, max, couleur });
}

/**
 * Un chiffre qui monte de la lueur vers le haut de l'écran. C'est le seul moyen
 * de dire « cette petite chose jaune remplit ta jauge » sans une ligne de
 * texte : on voit le gain partir de l'objet et rejoindre la barre.
 */
export function flotter(
  partie: Partie,
  x: number,
  y: number,
  texte: string,
  couleur: string,
): void {
  partie.flottants.push({ x, y, texte, couleur, vie: 1.1, max: 1.1 });
}

export function majFlottants(partie: Partie, dt: number): void {
  for (let i = partie.flottants.length - 1; i >= 0; i--) {
    const f = partie.flottants[i];
    f.vie -= dt;
    if (f.sujet && !f.sujet.livre) {
      f.x = f.sujet.x;
      f.y = f.sujet.y - D.taille * 1.9 - (f.max - f.vie) * 5;
    } else {
      f.y -= (f.murmure ? 5 : 34) * dt;
    }
    if (f.vie <= 0) partie.flottants.splice(i, 1);
  }
}

export function majParticules(partie: Partie, dt: number): void {
  for (let i = partie.particules.length - 1; i >= 0; i--) {
    const q = partie.particules[i];
    q.x += q.vx * dt;
    q.y += q.vy * dt;
    q.vy += 32 * dt;
    q.vie -= dt;
    if (q.vie <= 0) partie.particules.splice(i, 1);
  }
  for (let i = partie.ondes.length - 1; i >= 0; i--) {
    const o = partie.ondes[i];
    o.r += (o.max - o.r) * Math.min(1, 7 * dt) + 40 * dt;
    if (o.r >= o.max * 0.97) partie.ondes.splice(i, 1);
  }
}

/** Le typage n'a pas de mot pour « un flottant attaché à quelqu'un » : le voici. */
export type FlottantParle = Flottant & { sujet: Perso };
