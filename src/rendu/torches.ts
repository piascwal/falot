/**
 * LES TORCHES.
 *
 * Une torche éteinte était un trait vertical de quatorze pixels : personne n'y
 * voyait une torche, donc personne ne comprenait qu'on les rallume en passant.
 *
 * Elle est maintenant dessinée DEBOUT, face à la caméra, comme les visages : le
 * jeu est vu de dessus mais tout ce qui compte y est présenté de face, et une
 * torche couchée sur sa paroi se lisait comme un verre à pied. Un manche, un
 * collier, et au bout soit une flamme, soit un charbon noir.
 */

import { CASE } from '../coeur/dimensions.js';
import { clamp, TAU } from '../coeur/geometrie.js';
import type { Torche } from '../coeur/types.js';
import type { Ecran } from './ecran.js';

/** Hauteur totale de la torche, en pixels monde. */
const HAUT = CASE * 0.52;

/**
 * `vive` : ce qu'il reste de flamme, de 0 (éteinte) à 1 (elle vient d'être
 * reprise). `temps` sert au vacillement.
 */
export function dessinerTorche(ecran: Ecran, t: Torche, vive: number, temps: number): void {
  const { ctx, cam } = ecran;
  const x = t.x - cam.x;
  const y = t.y - cam.y;
  const allumee = vive > 0;

  ctx.save();
  ctx.translate(x, y);

  const bas = HAUT * 0.42;
  const haut = -HAUT * 0.46;

  // --- le manche ---
  ctx.lineCap = 'round';
  ctx.lineWidth = Math.max(4, CASE * 0.105);
  ctx.strokeStyle = 'rgba(8,8,14,0.95)';
  ctx.beginPath();
  ctx.moveTo(0, bas);
  ctx.lineTo(0, haut + HAUT * 0.16);
  ctx.stroke();
  // l'arête éclairée, côté gauche : c'est elle qui donne du volume au manche
  ctx.lineWidth = Math.max(1.6, CASE * 0.038);
  ctx.strokeStyle = allumee ? 'rgba(206,168,118,0.9)' : 'rgba(146,138,128,0.55)';
  ctx.beginPath();
  ctx.moveTo(-CASE * 0.02, bas - 2);
  ctx.lineTo(-CASE * 0.02, haut + HAUT * 0.18);
  ctx.stroke();

  // --- le collier, là où le manche tient ce qui brûle ---
  ctx.fillStyle = allumee ? 'rgba(226,196,148,0.95)' : 'rgba(150,142,130,0.6)';
  ctx.beginPath();
  ctx.ellipse(0, haut + HAUT * 0.16, CASE * 0.075, CASE * 0.032, 0, 0, TAU);
  ctx.fill();

  if (allumee) {
    // --- la flamme : une goutte pointée vers le haut, qui vacille ---
    const v = clamp(vive, 0.25, 1);
    const bat =
      1 +
      Math.sin(temps * 11 + t.phase) * 0.13 +
      Math.sin(temps * 7.3 + t.phase * 2) * 0.07;
    const h = HAUT * 0.46 * (0.55 + v * 0.45) * bat;
    const l = h * 0.55;
    const pointe = haut + HAUT * 0.12 - h;
    const souffle = Math.sin(temps * 5.5 + t.phase) * l * 0.18;

    const halo = ctx.createRadialGradient(0, haut, 0, 0, haut, h * 1.5);
    halo.addColorStop(0, `rgba(255,208,130,${0.5 * v})`);
    halo.addColorStop(1, 'rgba(255,140,50,0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(0, haut, h * 1.5, 0, TAU);
    ctx.fill();

    const goutte = (echelle: number, couleur: string) => {
      ctx.fillStyle = couleur;
      ctx.beginPath();
      ctx.moveTo(souffle * echelle, pointe + h * (1 - echelle));
      ctx.quadraticCurveTo(l * echelle, haut - h * 0.1 * echelle, 0, haut + HAUT * 0.1);
      ctx.quadraticCurveTo(
        -l * echelle,
        haut - h * 0.1 * echelle,
        souffle * echelle,
        pointe + h * (1 - echelle),
      );
      ctx.closePath();
      ctx.fill();
    };
    goutte(1, `rgba(255,164,72,${0.92 * v})`);
    goutte(0.58, `rgba(255,226,150,${0.95 * v})`);
    goutte(0.26, `rgba(255,253,238,${0.95 * v})`);
  } else {
    // --- éteinte : un charbon noir, et la trace de suie qu'il a laissée ---
    ctx.fillStyle = 'rgba(30,26,26,0.95)';
    ctx.beginPath();
    ctx.ellipse(0, haut + HAUT * 0.02, CASE * 0.062, CASE * 0.085, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = 'rgba(150,140,128,0.42)';
    ctx.lineWidth = Math.max(1.2, CASE * 0.026);
    ctx.stroke();
  }
  ctx.restore();
}
