/**
 * Le convoi.
 *
 * Chacun suit celui qui le précède, à la queue leu leu, pour ne pas s'empiler
 * sur le joueur. Les deux couleurs n'obéissent pas à la même règle, et c'est
 * tout l'arbitrage du jeu :
 *
 *   BLEU — timide : il n'avance que tant qu'il est DANS la lumière. Discret,
 *          mais il colle et il ralentit.
 *   OR   — curieux : il suit partout et garde son faisceau allumé devant lui.
 *          Il éclaire la route, et il dénonce.
 */

import { CASE, D } from '../dimensions.js';
import { EMOTIONS } from '../formes.js';
import { ecartAngle } from '../geometrie.js';
import { aBonus } from '../lectures.js';
import { emettre } from '../particules.js';
import type { Partie, Perso } from '../types.js';
import { estEclaire } from './lumiere.js';

export function suivre(partie: Partie, p: Perso, dt: number): void {
  const { joueur, zone } = partie;
  // Le portail aspire : sans ça un suiveur gardait son espacement derrière le
  // joueur et n'entrait jamais dans le rayon de livraison, même collé dessus.
  // Le portail aspire quoi qu'il arrive, même une fois le quota atteint : une
  // âme amenée jusque-là ne doit jamais rester plantée devant la porte sous
  // prétexte que le compte est bon. Elle entre, et ce qu'on a sauvé de plus
  // est sauvé quand même.
  const versPortail = Math.hypot(zone.sortie.x - p.x, zone.sortie.y - p.y);
  if (versPortail < CASE * 2.6) {
    const ax = zone.sortie.x - p.x,
      ay = zone.sortie.y - p.y;
    const ad = versPortail || 1;
    p.vx += (ax / ad) * 2400 * dt;
    p.vy += (ay / ad) * 2400 * dt;
    p.regard += ecartAngle(p.regard, Math.atan2(ay, ax)) * 5 * dt;
    return;
  }

  const file = zone.persos
    .filter((q) => q.suit && !q.livre)
    .sort((a, b) => a.rang - b.rang);
  const i = file.indexOf(p);
  const devant = i <= 0 ? joueur : file[i - 1];
  const dx = devant.x - p.x,
    dy = devant.y - p.y;
  const d = Math.hypot(dx, dy) || 1;
  const ecart = D.taille * 1.5;

  const timide = p.emotion === EMOTIONS.PEUR;
  const auClair = !timide || estEclaire(partie, p.x, p.y);

  // Hors de la lumière, le bleu TRAÎNE — il ne se fige pas. Mesuré avec la
  // règle « il n'avance que s'il est éclairé » : un bleu sorti du halo ne
  // pouvait plus jamais revenir et restait planté à onze cases du convoi.
  // Et l'accélération doit être d'un tout autre ordre que celle d'un PNJ
  // immobile : à 320 le frottement la plafonnait à 50 px/s, six fois moins
  // que le joueur, donc le convoi décrochait systématiquement.
  if (d > ecart) {
    const vitesse =
      (timide ? 2100 : 2700) * (auClair ? 1 : 0.3) * (aBonus(joueur, 'hate') ? 1.55 : 1);
    p.vx += (dx / d) * vitesse * dt;
    p.vy += (dy / d) * vitesse * dt;
    if (!timide) p.regard += ecartAngle(p.regard, Math.atan2(dy, dx)) * 5 * dt;
  }
  if (timide) {
    p.regard += ecartAngle(p.regard, Math.atan2(joueur.y - p.y, joueur.x - p.x)) * 3 * dt;
    if (!auClair && partie.hasard() < dt * 3)
      emettre(partie, p.x, p.y - D.taille * 0.7, '#8fd0ff', 1, 24);
  }
}
