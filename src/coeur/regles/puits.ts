/**
 * LE PUITS — l'ascension entre deux étages.
 *
 * Avant, c'était une modale HTML avec un bouton « Monter » : on s'arrêtait, on
 * lisait, on cliquait. Douze fois par partie, on sortait du jeu pour apprendre
 * qu'on avait progressé. Une carte à la Candy Crush se parcourt en touriste ;
 * ici on évacue un immeuble par le bas, et ça se JOUE.
 *
 * Alors on monte. La même commande que dans le jeu, rien à réapprendre : on
 * pousse vers le haut et la lumière grimpe. Les paliers déjà vidés défilent en
 * dessous avec les petites lumières qu'on y a laissées, le récit de l'étage se
 * lit en montant, et il n'y a aucun bouton — arrivé en haut, l'étage suivant
 * commence.
 *
 * Ce fichier ne décide que du mouvement et du minutage. Ce qu'on en voit est
 * dans `rendu/puits.ts`.
 */

import { clamp } from '../geometrie.js';
import { chargerZone } from '../monde/chargement.js';
import type { Partie } from '../types.js';
import { lancerLaChute } from './seuil.js';

/** Vitesses, en étages par seconde. On monte toujours un peu, même sans rien
 *  pousser : rester coincé dans une cage d'escalier n'apprend rien à personne. */
const DERIVE = 0.17;
const POUSSE = 0.62;
/** Largeur utile de la cage, en demi-largeurs : de −1 à +1. */
const LARGEUR = 1;
/** Une fois en haut, le temps que le noir se referme. */
const SORTIE = 0.5;

export function lancerLePuits(partie: Partie, arrivee: number): void {
  partie.puits = { arrivee, h: 0, x: 0, vh: 0, vx: 0, t: 0, sortie: 0 };
  faireTaireLEtage(partie);
}

/**
 * L'étage qu'on quitte se tait. Le bandeau ne disparaît jamais de lui-même —
 * il pâlit et il reste, c'est voulu pendant qu'on joue — mais dans la cage il
 * se retrouvait par-dessus le récit de la montée, deux textes au même endroit.
 * Ce qu'il disait ne vaut plus : on a changé d'étage.
 */
export function faireTaireLEtage(partie: Partie): void {
  partie.bandeau.visible = false;
  partie.bandeau.pale = false;
  partie.bandeau.texte = '';
  partie.filVoix.length = 0;
  partie.voixT = 0;
  partie.flottants.length = 0;
}

export function majPuits(partie: Partie, dt: number): void {
  const puits = partie.puits;
  if (!puits) return;
  const { touches, manche } = partie.entrees;
  puits.t += dt;

  // Ce qu'on pousse : les flèches, ou le joystick. Vers le haut, ça grimpe ;
  // sur le côté, ça se balance dans la cage — on ne pilote rien d'autre.
  const kx = (touches.droite ? 1 : 0) - (touches.gauche ? 1 : 0);
  const ky = (touches.bas ? 1 : 0) - (touches.haut ? 1 : 0);
  const mx = manche.actif ? manche.dx * manche.force : 0;
  const my = manche.actif ? manche.dy * manche.force : 0;
  const monte = clamp(-(ky || my), 0, 1);
  const cote = clamp(kx || mx, -1, 1);

  const cible = DERIVE + (POUSSE - DERIVE) * monte;
  puits.vh += (cible - puits.vh) * Math.min(1, 4 * dt);
  puits.h += puits.vh * dt;

  puits.vx += cote * 2.6 * dt;
  puits.vx *= 0.0025 ** dt;
  puits.x = clamp(puits.x + puits.vx * dt, -LARGEUR, LARGEUR);
  if (Math.abs(puits.x) >= LARGEUR) puits.vx = 0;

  if (puits.h < 1) return;
  // il est arrivé : le noir se referme, puis l'étage suivant commence
  puits.h = 1;
  puits.sortie += dt;
  if (puits.sortie < SORTIE) return;
  const arrivee = puits.arrivee;
  partie.puits = null;
  chargerZone(partie, arrivee);
  // il arrive par le bas : on monte d'un étage, et on doit le voir
  lancerLaChute(partie, 'bas', false);
}
