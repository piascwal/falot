/**
 * La vidange, peinte APRÈS le voile d'obscurité et en lumière additive : c'est
 * de la lumière qui s'en va, elle ne peut pas être masquée par le noir.
 *
 * Les motes ont leur propre liste, séparée des particules ordinaires, pour
 * cette raison exactement : les particules sont peintes SOUS le voile, et le
 * halo qui se referme les aurait effacées au fur et à mesure — c'est-à-dire
 * précisément au moment où il faut les voir.
 */

import { rgba } from '../coeur/couleurs.js';
import { D } from '../coeur/dimensions.js';
import { clamp, TAU } from '../coeur/geometrie.js';
import { forme } from '../coeur/lectures.js';
import type { Partie } from '../coeur/types.js';
import type { Ecran } from './ecran.js';
import { toileLueur } from './obscurite.js';
import { carreArrondi } from './visages.js';

export function dessinerVidange(ecran: Ecran, partie: Partie): void {
  // La vidange au Seuil et l'envol (la mort, ou le départ vers l'étage
  // suivant) sont la même image : la lumière quitte le corps et monte. On la
  // peint une seule fois, pour les deux.
  const passage = partie.vidange ?? partie.envol;
  if (!passage) return;
  const { cam } = ecran;
  const { joueur } = partie;
  const vidange = passage;
  const k = clamp(vidange.t / vidange.duree, 0, 1);
  const jx = joueur.x - cam.x,
    jy = joueur.y - cam.y;
  const teinte = forme(joueur).couleur;
  // La lumière, sur le calque des lumières (`ecran.ts`) : additive, elle doit
  // s'ajouter à l'image entière, nuit comprise. Posée en `lighter` sur le
  // calque transparent d'au-dessus, elle ne s'ajoutait plus à rien.
  let ctx = toileLueur(ecran);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  // la colonne : ce qui sort de lui et monte
  const haut = D.taille * (partie.envol ? 8.5 : 5.5);
  const col = ctx.createLinearGradient(jx, jy, jx, jy - haut);
  col.addColorStop(0, rgba(teinte, 0.34 * (1 - k * 0.5)));
  col.addColorStop(0.45, rgba(teinte, 0.12 * (1 - k * 0.5)));
  col.addColorStop(1, rgba(teinte, 0));
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(jx - D.taille * 0.62, jy + D.taille * 0.2);
  ctx.lineTo(jx + D.taille * 0.62, jy + D.taille * 0.2);
  ctx.lineTo(jx + D.taille * 0.22, jy - haut);
  ctx.lineTo(jx - D.taille * 0.22, jy - haut);
  ctx.closePath();
  ctx.fill();

  for (const m of vidange.motes) {
    const x = jx + Math.cos(m.a) * m.r;
    const y = jy - m.h;
    const a = clamp(m.vie, 0, 1);
    const g = ctx.createRadialGradient(x, y, 0, x, y, m.taille * 4);
    g.addColorStop(0, rgba(teinte, a * 0.95));
    g.addColorStop(1, rgba(teinte, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, m.taille * 4, 0, TAU);
    ctx.fill();
    ctx.fillStyle = rgba('#ffffff', a * 0.8);
    ctx.beginPath();
    ctx.arc(x, y, m.taille * 0.55, 0, TAU);
    ctx.fill();
  }
  ctx.restore();

  // le corps s'assombrit : la lumière le quitte pour de bon
  ctx = ecran.ctx;
  ctx.save();
  ctx.globalAlpha = k * 0.72;
  ctx.fillStyle = 'rgba(8,8,14,1)';
  carreArrondi(
    ctx,
    jx - D.taille * 0.55,
    jy - D.taille * 0.55,
    D.taille * 1.1,
    D.taille * 1.1,
    D.taille * 0.34,
  );
  ctx.fill();
  ctx.restore();
}
