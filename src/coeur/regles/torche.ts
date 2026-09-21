/**
 * PORTER LA TORCHE — la décrocher du mur, et l'emmener.
 *
 * « Un Guet n'approche jamais d'une flamme plus grande que lui. » La règle
 * était déjà celle des abris ; la torche portée la met en mouvement. On
 * traverse une
 * salle impossible en tenant la lumière à bout de bras — et on est vu de
 * partout pendant qu'on le fait.
 *
 * C'est le seul objet du jeu qui donne ET coûte à la fois, et les deux pour la
 * même raison : parce qu'il brille.
 */

import { CASE, D } from '../dimensions.js';
import { emettre, onde } from '../particules.js';
import type { Partie, Torche } from '../types.js';
import { montrerToast } from '../voix.js';

/** Jusqu'où on peut décrocher une torche du mur. */
export const PORTEE_PRISE = CASE * 1.3;

/** La torche allumée à portée de main, s'il y en a une. */
export function torcheSousLaMain(partie: Partie): Torche | null {
  const { joueur, zone } = partie;
  if (!partie.pouvoirs.torche) return null;
  let proche: Torche | null = null;
  let mini = PORTEE_PRISE;
  for (const t of zone.torches) {
    if (t.reste <= 0 || t === joueur.torche) continue;
    const d = Math.hypot(t.x - joueur.x, t.y - joueur.y);
    if (d < mini) {
      mini = d;
      proche = t;
    }
  }
  return proche;
}

/** Le geste : prendre celle qui est là, ou reposer celle qu'on tient. */
export function prendreOuLacherLaTorche(partie: Partie): void {
  const { joueur } = partie;
  if (!partie.pouvoirs.torche) return;
  if (joueur.torche) {
    // on la repose là où l'on est : elle finit de brûler sur place
    joueur.torche.ox = 0;
    joueur.torche.oy = 0;
    emettre(partie, joueur.torche.x, joueur.torche.y, '#ffb45c', 6, 40);
    joueur.torche = null;
    return;
  }
  const t = torcheSousLaMain(partie);
  if (!t) return;
  joueur.torche = t;
  onde(partie, t.x, t.y, CASE * 1.4, '#ffb45c');
  montrerToast(partie, 'Tu la portes — aucun d’eux n’approchera, et tous te verront');
}

/** La torche portée suit la main : un peu devant, un peu au-dessus. */
export function majTorche(partie: Partie, dt: number): void {
  const { joueur } = partie;
  const t = joueur.torche;
  if (!t) return;
  // CELLE QU'ON PORTE BRÛLE, elle. Une torche accrochée au mur ne s'éteint
  // plus une fois reprise ; celle qu'on décroche se consume dans la main, et
  // c'est tout ce qui empêche la torche portée d'être gratuite.
  t.reste -= dt;
  if (t.reste <= 0) {
    joueur.torche = null;
    montrerToast(partie, 'Ta torche s’est éteinte');
    return;
  }
  t.x = joueur.x + Math.cos(joueur.regard) * D.taille * 0.7;
  t.y = joueur.y - D.taille * 0.35;
  if (partie.hasard() < 0.08) emettre(partie, t.x, t.y, '#ffb45c', 1, 24);
}
