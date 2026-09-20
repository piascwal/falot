/**
 * LE BILAN D'UN ÉTAGE, dessiné : le plan entier vu de haut, et trois chiffres.
 *
 * C'est le seul moment où l'on voit la zone en entier — tout le reste du jeu
 * se joue dans un halo d'une case et demie. On y découvre les salles qu'on n'a
 * jamais allumées, et c'est exactement ce qui donne envie d'y retourner.
 *
 * La caméra recule : le plan grandit depuis la position de Falot jusqu'à tenir
 * dans l'écran. Ce n'est pas un écran qui s'ouvre, c'est un dézoom.
 */

import { rgba } from '../coeur/couleurs.js';
import { CASE } from '../coeur/dimensions.js';
import { EMOTIONS, RALLUME } from '../coeur/formes.js';
import { clamp, TAU } from '../coeur/geometrie.js';
import { POSE, sansFaute } from '../coeur/regles/bilan.js';
import type { Partie } from '../coeur/types.js';
import type { Ecran } from './ecran.js';
import { texteCerne } from './texte.js';

/** Une ligne de bilan : un mot, un chiffre, et une barre qui se remplit. */
function ligne(
  ecran: Ecran,
  y: number,
  mot: string,
  valeur: string,
  part: number,
  couleur: string,
  vu: number,
): void {
  const { ctx, W } = ecran;
  const large = Math.min(W * 0.74, 340);
  const x0 = (W - large) / 2;
  ctx.textAlign = 'left';
  ctx.font = '700 11px ui-sans-serif, system-ui, sans-serif';
  texteCerne(ecran, mot.toUpperCase(), x0, y, `rgba(232,232,240,${0.5 * vu})`, 3);
  ctx.textAlign = 'right';
  ctx.font = '700 17px ui-sans-serif, system-ui, sans-serif';
  texteCerne(ecran, valeur, x0 + large, y + 2, rgba(couleur, 0.95 * vu), 3.5);
  // la barre : elle dit d'un coup d'œil ce qui manque
  const by = y + 10;
  ctx.fillStyle = `rgba(255,255,255,${0.08 * vu})`;
  ctx.fillRect(x0, by, large, 3);
  ctx.fillStyle = rgba(couleur, 0.8 * vu);
  ctx.fillRect(x0, by, large * clamp(part, 0, 1) * vu, 3);
}

export function dessinerBilan(ecran: Ecran, partie: Partie, temps: number): void {
  const bilan = partie.bilan;
  if (!bilan) return;
  const { ctx, W, H } = ecran;
  const zone = partie.zone;

  ctx.fillStyle = '#08080e';
  ctx.fillRect(0, 0, W, H);

  // LE DÉZOOM. On part de l'échelle du jeu, centrée sur Falot, et on recule
  // jusqu'à ce que tout l'étage tienne dans la moitié haute de l'écran.
  const k = clamp(bilan.t / 1.1, 0, 1);
  const doux = 1 - (1 - k) * (1 - k) * (1 - k);
  const haut = H * 0.52;
  const vise = Math.min((W * 0.86) / zone.largeur, (haut * 0.82) / zone.hauteur);
  const ech = 1 + (vise - 1) * doux;
  const cx = partie.joueur.x + (zone.largeur / 2 - partie.joueur.x) * doux;
  const cy = partie.joueur.y + (zone.hauteur / 2 - partie.joueur.y) * doux;

  ctx.save();
  ctx.translate(W / 2, haut / 2);
  ctx.scale(ech, ech);
  ctx.translate(-cx, -cy);

  // le plancher : sombre partout, clair là où on a mis de la lumière
  for (let cy2 = 0; cy2 < zone.lignes; cy2++)
    for (let cx2 = 0; cx2 < zone.cols; cx2++) {
      if (zone.mur[cy2][cx2]) continue;
      ctx.fillStyle = zone.vues[cy2][cx2] ? '#2a2a3a' : '#141420';
      ctx.fillRect(cx2 * CASE, cy2 * CASE, CASE + 1, CASE + 1);
    }
  // ce qu'on a éclairé reçoit une vraie lueur, chaude et diffuse
  ctx.globalCompositeOperation = 'lighter';
  for (let cy2 = 0; cy2 < zone.lignes; cy2++)
    for (let cx2 = 0; cx2 < zone.cols; cx2++) {
      if (zone.mur[cy2][cx2] || !zone.vues[cy2][cx2]) continue;
      ctx.fillStyle = 'rgba(255,233,168,0.055)';
      ctx.fillRect(
        cx2 * CASE - CASE * 0.3,
        cy2 * CASE - CASE * 0.3,
        CASE * 1.6,
        CASE * 1.6,
      );
    }
  ctx.globalCompositeOperation = 'source-over';

  // le Seuil, et les lumières qui y sont entrées
  const s = zone.sortie;
  const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, CASE * 2.4);
  g.addColorStop(0, 'rgba(255,233,168,0.5)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(s.x, s.y, CASE * 2.4, 0, TAU);
  ctx.fill();
  // et les lumières restées en bas : de petites lueurs éteintes, une par lumière
  for (const q of zone.persos) {
    if (q.livre || q.emotion === EMOTIONS.COLERE) continue;
    ctx.fillStyle = q.calme ? rgba(RALLUME, 0.9) : 'rgba(143,208,255,0.45)';
    ctx.beginPath();
    ctx.arc(q.x, q.y, CASE * 0.3, 0, TAU);
    ctx.fill();
  }
  ctx.restore();

  // --- les trois chiffres ---
  const vu = clamp((bilan.t - 0.45) / 0.5, 0, 1);
  if (vu <= 0.01) return;
  const parfait = sansFaute(bilan);
  ctx.textAlign = 'center';
  ctx.font = '700 12px ui-sans-serif, system-ui, sans-serif';
  texteCerne(
    ecran,
    `ÉTAGE ${bilan.etage}`,
    W / 2,
    haut + 14,
    `rgba(232,232,240,${0.45 * vu})`,
    3,
  );
  const y0 = haut + 50;
  ligne(
    ecran,
    y0,
    'Lumière',
    `${Math.round(bilan.lumiere * 100)} %`,
    bilan.lumiere,
    '#ffe9a8',
    vu,
  );
  ligne(
    ecran,
    y0 + 44,
    'Lumières remontées',
    `${bilan.lumieres} / ${bilan.lumieresTotal}`,
    bilan.lumieresTotal ? bilan.lumieres / bilan.lumieresTotal : 1,
    RALLUME,
    vu,
  );
  ligne(
    ecran,
    y0 + 88,
    'Pris',
    bilan.morts === 0 ? 'jamais' : `${bilan.morts} fois`,
    bilan.morts === 0 ? 1 : 1 / (1 + bilan.morts),
    bilan.morts === 0 ? '#a8f0c8' : '#ff7a6b',
    vu,
  );

  if (parfait) {
    ctx.font = 'italic 15px Georgia, serif';
    texteCerne(
      ecran,
      'Rien n’est resté dans le noir.',
      W / 2,
      y0 + 132,
      `rgba(255,233,168,${(0.75 + Math.sin(temps * 3) * 0.2) * vu})`,
      3.5,
    );
  }

  // et comment on s'en va : une flèche, comme dans la cage
  if (bilan.t > POSE) {
    const bat = 0.4 + 0.3 * Math.sin(temps * 3.4);
    ctx.fillStyle = `rgba(255,233,168,${bat * vu})`;
    const ax = W / 2;
    const ay = H - 42;
    ctx.beginPath();
    ctx.moveTo(ax, ay - 11);
    ctx.lineTo(ax + 8, ay);
    ctx.lineTo(ax - 8, ay);
    ctx.closePath();
    ctx.fill();
  }
}
