/**
 * Le joueur : ses commandes, sa vitesse, son fil.
 *
 * Falot n'a pas d'accélération « réaliste » : un frottement très fort et une
 * accélération très forte. On veut qu'un doigt posé le fasse partir tout de
 * suite et qu'un doigt levé l'arrête net — dans un jeu où l'on meurt d'un
 * regard, le retard d'une inertie se paie comptant.
 */

import { D } from '../dimensions.js';
import { clamp, ecartAngle } from '../geometrie.js';
import { aBonus } from '../lectures.js';
import { degager } from '../monde/grille.js';
import type { Corps, Partie } from '../types.js';

/**
 * La gelée. Le corps s'écrase dans le sens de sa vitesse et se gonfle sur
 * l'autre axe : c'est ce qui donne de la matière à un carré arrondi.
 */
/** Trois secondes de souffle, et il les refait deux fois plus lentement. */
export const SOUFFLE_MAX = 3;
const REPRISE_SOUFFLE = 0.5;

export function majJelly(p: Corps, dt: number): void {
  const cibleX = clamp(1 + p.vy * 0.00055 - p.vx * 0.00055, 0.84, 1.19);
  const cibleY = clamp(1 + p.vx * 0.00055 - p.vy * 0.00055, 0.84, 1.19);
  p.vsx += (cibleX - p.sx) * 190 * dt;
  p.vsy += (cibleY - p.sy) * 190 * dt;
  p.vsx -= p.vsx * 13 * dt;
  p.vsy -= p.vsy * 13 * dt;
  p.sx = clamp(p.sx + p.vsx * dt, 0.55, 1.5);
  p.sy = clamp(p.sy + p.vsy * dt, 0.55, 1.5);
}

export function majJoueur(partie: Partie, dt: number): void {
  const { joueur, zone, entrees } = partie;
  const demi = D.taille * 0.5;

  // SOUFFLER SA LUMIÈRE. Un geste tenu, jamais un interrupteur : on le garde
  // le temps d'un passage et on respire après. Il faut s'en être souvenu
  // (étage 3), et ça ne tient pas pendant qu'il arrive ou qu'il s'en va —
  // sinon on ressort d'une vidange déjà éteint sans avoir rien demandé.
  //
  // ET ÇA NE DURE QUE TROIS SECONDES. Sans limite, on traversait l'étage
  // entier couvert : plus de lumière, plus de danger, plus de jeu. La réserve
  // se refait deux fois plus lentement qu'elle ne se dépense.
  const veut =
    partie.pouvoirs.souffle &&
    entrees.souffle &&
    !partie.vidange &&
    !partie.envol &&
    !partie.chute;
  joueur.eteint = veut && joueur.souffleReste > 0;
  joueur.souffleReste = clamp(
    joueur.souffleReste + (joueur.eteint ? -dt : dt * REPRISE_SOUFFLE),
    0,
    SOUFFLE_MAX,
  );

  // clavier d'abord : sur ordinateur c'est lui qui commande
  const kx = (entrees.touches.droite ? 1 : 0) - (entrees.touches.gauche ? 1 : 0);
  const ky = (entrees.touches.bas ? 1 : 0) - (entrees.touches.haut ? 1 : 0);
  if (kx || ky) {
    const kd = Math.hypot(kx, ky) || 1;
    joueur.vx += (kx / kd) * 1700 * dt;
    joueur.vy += (ky / kd) * 1700 * dt;
  } else if (entrees.manche.actif && entrees.manche.force > 0.06) {
    const accel = 1700 * entrees.manche.force;
    joueur.vx += entrees.manche.dx * accel * dt;
    joueur.vy += entrees.manche.dy * accel * dt;
  }

  // Il a poussé quelque chose : il a compris. Le fantôme de manche n'a plus
  // rien à dire, et il ne revient jamais.
  if (!partie.premieres.main && (kx || ky || entrees.manche.actif))
    partie.premieres.main = true;

  const frottement = 0.0009 ** dt;
  joueur.vx *= frottement;
  joueur.vy *= frottement;

  let vmax = 300 + joueur.niveau * 26;
  if (aBonus(joueur, 'hate')) vmax *= 1.55;
  const v = Math.hypot(joueur.vx, joueur.vy);
  if (v > vmax) {
    joueur.vx = (joueur.vx / v) * vmax;
    joueur.vy = (joueur.vy / v) * vmax;
  }

  joueur.x += joueur.vx * dt;
  joueur.y += joueur.vy * dt;
  joueur.x = clamp(joueur.x, demi, zone.largeur - demi);
  joueur.y = clamp(joueur.y, demi, zone.hauteur - demi);
  degager(zone, joueur, demi);

  if (v > 26)
    joueur.regard +=
      ecartAngle(joueur.regard, Math.atan2(joueur.vy, joueur.vx)) * Math.min(1, 12 * dt);

  // LE FIL : un point tous les vingt pixels parcourus. Soufflé, il n'en laisse
  // AUCUN — il ne brille pas, il n'y a rien à suivre — et le fil se coupe net
  // à l'endroit où il s'est éteint. C'est ce qui permet de semer un traqueur,
  // et c'est la seule réponse que l'étage 6 attend.
  if (joueur.eteint) {
    const dernier = partie.fil[partie.fil.length - 1];
    if (dernier) partie.fil.push(null);
  } else if (
    Math.hypot(joueur.x - partie.filDernier.x, joueur.y - partie.filDernier.y) > 20
  ) {
    partie.fil.push({ x: joueur.x, y: joueur.y });
    partie.filDernier = { x: joueur.x, y: joueur.y };
    if (partie.fil.length > 900) partie.fil.shift();
  }

  majJelly(joueur, dt);
}
