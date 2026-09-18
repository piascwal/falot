/**
 * Le texte dans le monde, et les flèches de bord d'écran.
 *
 * `shadowBlur` sur du texte est ce qui coûte le plus cher de toute l'image :
 * mesuré, les deux lignes du portail à elles seules prenaient 11 ms sur 60
 * (processeur étranglé six fois), et elles sont dessinées à CHAQUE image. Un
 * liseré sombre donne la même lisibilité pour presque rien.
 */

import { rgba } from '../coeur/couleurs.js';
import type { Ecran } from './ecran.js';

export function texteCerne(
  ecran: Ecran,
  txt: string,
  x: number,
  y: number,
  couleur: string,
  epaisseur?: number,
): void {
  const { ctx } = ecran;
  ctx.lineJoin = 'round';
  ctx.lineWidth = epaisseur || 3.5;
  ctx.strokeStyle = 'rgba(6,7,12,0.92)';
  ctx.strokeText(txt, x, y);
  ctx.fillStyle = couleur;
  ctx.fillText(txt, x, y);
}

export function flecheVers(
  ecran: Ecran,
  wx: number,
  wy: number,
  couleur: string,
  temps: number,
): void {
  const { ctx, cam, W, H } = ecran;
  const x = wx - cam.x,
    y = wy - cam.y;
  if (x > 30 && x < W - 30 && y > 80 && y < H - 30) return; // déjà à l'écran
  const a = Math.atan2(y - H / 2, x - W / 2);
  const rx = Math.min(W, H) * 0.38;
  const px = W / 2 + Math.cos(a) * rx,
    py = H / 2 + Math.sin(a) * rx;
  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(a);
  ctx.fillStyle = rgba(couleur, 0.5 + Math.sin(temps * 4) * 0.2);
  ctx.beginPath();
  ctx.moveTo(12, 0);
  ctx.lineTo(-8, 7);
  ctx.lineTo(-8, -7);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
