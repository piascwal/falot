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
