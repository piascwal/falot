/**
 * LE BILAN D'UN ÉTAGE.
 *
 * Traverser un étage et le FAIRE sont deux choses différentes, et rien ne le
 * disait : on franchissait le Seuil, on montait, on recommençait. Trois
 * chiffres suffisent à faire la différence — ce qu'on a éclairé, ce qu'on a
 * remonté, ce qu'on a payé — et le plan entier vu de haut pour montrer les
 * salles qu'on n'a jamais allumées.
 *
 * Ce fichier compte. `rendu/bilan.ts` montre.
 */

import { CASE } from '../dimensions.js';
import { EMOTIONS } from '../formes.js';
import { DERNIER_ETAGE } from '../monde/paliers.js';
import type { Partie, Zone } from '../types.js';
import { lancerLaFin } from './fin.js';
import { lancerLePuits } from './puits.js';

/** Le temps que le bilan s'installe avant qu'on puisse le passer. */
const POSE = 1.1;
/** Et celui au bout duquel il s'en va tout seul. */
const DUREE_BILAN = 9;

/** Marque comme vue toute case dans un rayon donné. */
function marquerAutour(zone: Zone, x: number, y: number, r: number): void {
  const c0x = Math.max(0, Math.floor((x - r) / CASE));
  const c1x = Math.min(zone.cols - 1, Math.floor((x + r) / CASE));
  const c0y = Math.max(0, Math.floor((y - r) / CASE));
  const c1y = Math.min(zone.lignes - 1, Math.floor((y + r) / CASE));
  for (let cy = c0y; cy <= c1y; cy++)
    for (let cx = c0x; cx <= c1x; cx++) {
      if (zone.mur[cy][cx]) continue;
      const dx = (cx + 0.5) * CASE - x;
      const dy = (cy + 0.5) * CASE - y;
      if (dx * dx + dy * dy <= r * r) zone.vues[cy][cx] = 1;
    }
}

/**
 * CE QU'ON A LAISSÉ ALLUMÉ.
 *
 * Seules les lumières POSÉES comptent : les torches qu'on a reprises, les
 * braises qu'on a laissées. Pas le halo qu'on porte — sinon le pourcentage
 * mesurait les pas et non la lumière, et il montait à soixante pour cent en
 * traversant un étage sans avoir rien allumé du tout.
 *
 * C'est aussi ce qui donne enfin un prix aux torches : elles sont la seule
 * façon de faire monter ce chiffre, et elles ne s'éteignent plus.
 *
 * On ne lance aucun rayon : une case derrière un mur est marquée si elle est
 * dans le rayon. Le coût d'un vrai calcul par case ne vaut pas la précision
 * qu'il gagnerait sur un bilan.
 */
export function marquerVues(partie: Partie): void {
  const { zone, joueur } = partie;
  for (const t of zone.torches)
    if (t.reste > 0 && t !== joueur.torche) marquerAutour(zone, t.x, t.y, t.r * 0.8);
  for (const b of zone.braises) marquerAutour(zone, b.x, b.y, b.r * 0.8);
}

/** La part du plancher qu'on a éclairée, de 0 à 1. */
export function partEclairee(zone: Zone): number {
  let sol = 0;
  let vues = 0;
  for (let cy = 0; cy < zone.lignes; cy++)
    for (let cx = 0; cx < zone.cols; cx++) {
      if (zone.mur[cy][cx]) continue;
      sol++;
      if (zone.vues[cy][cx]) vues++;
    }
  return sol ? vues / sol : 0;
}

export function lancerLeBilan(partie: Partie, suivante: number): void {
  const { zone } = partie;
  // Toutes les lumières de l'étage, livrées ou non : c'est le dénominateur, et
  // c'est ce qui rend un étage « fini » ou seulement traversé.
  const lumieresTotal = zone.persos.filter((q) => q.emotion !== EMOTIONS.COLERE).length;
  partie.bilan = {
    t: 0,
    etage: zone.numero,
    lumiere: partEclairee(zone),
    lumieres: zone.sortie.lumieres,
    lumieresTotal,
    morts: partie.morts,
    suivante,
  };
}

export function majBilan(partie: Partie, dt: number): void {
  const bilan = partie.bilan;
  if (!bilan) return;
  const { touches, manche, visee } = partie.entrees;
  bilan.t += dt;
  // On le passe d'un geste, mais pas avant qu'il ait fini de s'écrire.
  const presse =
    touches.haut ||
    touches.bas ||
    touches.gauche ||
    touches.droite ||
    manche.actif ||
    visee.actif;
  if (bilan.t < POSE) return;
  if (bilan.t < DUREE_BILAN && !presse) return;
  const suivante = bilan.suivante;
  partie.bilan = null;
  // Au bout du douzième, pas de cage d'escalier : la fin, la première fois.
  if (bilan.etage === DERNIER_ETAGE && !partie.finVue) lancerLaFin(partie);
  else lancerLePuits(partie, suivante);
}

/** Un étage parfait : tout éclairé, toutes les lumières, jamais pris. */
export const sansFaute = (b: {
  lumiere: number;
  lumieres: number;
  lumieresTotal: number;
  morts: number;
}): boolean => b.lumiere > 0.995 && b.lumieres >= b.lumieresTotal && b.morts === 0;

export { DUREE_BILAN, POSE };
