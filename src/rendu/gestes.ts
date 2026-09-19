/**
 * Ce que la main du joueur dessine à l'écran : le joystick flottant, et la
 * trajectoire de la pierre pendant qu'on vise.
 *
 * Les deux sont en coordonnées d'ÉCRAN et pas de monde — c'est de l'interface
 * posée sur le jeu, pas du décor.
 */

import { rgba } from '../coeur/couleurs.js';
import { CASE } from '../coeur/dimensions.js';
import { TAU } from '../coeur/geometrie.js';
import { forme } from '../coeur/lectures.js';
import { solide } from '../coeur/monde/grille.js';
import type { Partie } from '../coeur/types.js';
import type { Ecran } from './ecran.js';

/** Rayon du joystick flottant, en pixels d'écran. */
export const RAYON_MANCHE = 56;

/**
 * LE FANTÔME DE MANCHE.
 *
 * Le joystick naît sous le doigt, où qu'on le pose. C'est agréable une fois
 * qu'on le sait, et indevinable avant : en test, des joueurs sont restés
 * plantés au réveil sans comprendre qu'on pouvait bouger. On leur montre donc
 * le geste, une fois, dans la langue du jeu — un cercle, un point qui glisse,
 * rien d'écrit — jusqu'à ce qu'ils poussent quelque chose.
 *
 * Il ne s'affiche qu'au tout début du tout premier étage : passé le premier
 * pas, il n'existe plus de la partie.
 */
export function dessinerFantomeManche(ecran: Ecran, partie: Partie, temps: number): void {
  if (partie.premieres.main || partie.numeroZone !== 1) return;
  if (partie.chute || partie.eclosion < 0.9 || partie.gele) return;
  const { ctx, W, H } = ecran;
  const ox = W * 0.5;
  const oy = H - Math.min(H * 0.22, 150);
  // un battement lent : deux secondes pour montrer le geste, une pour souffler
  const cycle = (temps % 3) / 3;
  const glisse = clampEntre(cycle / 0.66, 0, 1);
  const vu = 0.5 + 0.5 * Math.sin(temps * 1.6);
  ctx.save();
  ctx.strokeStyle = `rgba(255,255,255,${0.1 + 0.06 * vu})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(ox, oy, RAYON_MANCHE, 0, TAU);
  ctx.stroke();
  // le doigt : il part du centre et tire vers la droite, puis recommence
  const d = Math.sin(glisse * Math.PI) * RAYON_MANCHE * 0.8;
  const px = ox + d;
  const g = ctx.createRadialGradient(px, oy, 0, px, oy, 24);
  g.addColorStop(0, `rgba(255,233,168,${0.3 + 0.2 * vu})`);
  g.addColorStop(1, 'rgba(255,233,168,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(px, oy, 24, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = `rgba(255,233,168,${0.4 + 0.2 * vu})`;
  ctx.beginPath();
  ctx.arc(px, oy, 13, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

const clampEntre = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export function dessinerManche(ecran: Ecran, partie: Partie): void {
  const { ctx } = ecran;
  const manche = partie.entrees.manche;
  const joueur = partie.joueur;
  if (!manche.actif) return;
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.16)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(manche.ox, manche.oy, RAYON_MANCHE, 0, TAU);
  ctx.stroke();
  const kx = manche.ox + manche.dx * manche.force * RAYON_MANCHE;
  const ky = manche.oy + manche.dy * manche.force * RAYON_MANCHE;
  const g = ctx.createRadialGradient(kx, ky, 0, kx, ky, 26);
  g.addColorStop(0, rgba(forme(joueur).couleur, 0.5));
  g.addColorStop(1, rgba(forme(joueur).couleur, 0.06));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(kx, ky, 26, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = rgba(forme(joueur).couleur, 0.6);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(kx, ky, 22, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

export function dessinerVisee(ecran: Ecran, partie: Partie): void {
  const { ctx, cam } = ecran;
  const { joueur, zone } = partie;
  const visee = partie.entrees.visee;
  if (!visee.actif) return;
  const a = Math.atan2(visee.dy, visee.dx);
  const portee = CASE * (1.6 + visee.force * 4.4);
  let d = CASE * 0.4;
  while (
    d < portee &&
    !solide(
      zone,
      Math.floor((joueur.x + Math.cos(a) * d) / CASE),
      Math.floor((joueur.y + Math.sin(a) * d) / CASE),
    )
  )
    d += CASE * 0.2;
  d = Math.max(CASE * 0.6, d - CASE * 0.25);
  const jx = joueur.x - cam.x,
    jy = joueur.y - cam.y;
  ctx.save();
  ctx.setLineDash([4, 6]);
  ctx.strokeStyle = 'rgba(178,186,204,0.55)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i <= 16; i++) {
    const k = i / 16;
    const x = jx + Math.cos(a) * d * k;
    const y = jy + Math.sin(a) * d * k - Math.sin(k * Math.PI) * CASE * 0.55;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.setLineDash([]);
  const cx = jx + Math.cos(a) * d,
    cy = jy + Math.sin(a) * d;
  ctx.strokeStyle = 'rgba(178,186,204,0.75)';
  ctx.beginPath();
  ctx.arc(cx, cy, 9, 0, TAU);
  ctx.stroke();
  ctx.fillStyle = 'rgba(178,186,204,0.25)';
  ctx.beginPath();
  ctx.arc(cx, cy, 9, 0, TAU);
  ctx.fill();
  ctx.restore();
}
