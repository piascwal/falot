/**
 * LA CAGE D'ESCALIER, dessinée — et jouée.
 *
 * Elle n'est plus un écran posé par-dessus le jeu : c'est le jeu, dans un
 * couloir vertical. Mêmes formes, même noir, même lumière qui ne montre que ce
 * qu'elle touche. Ce qu'on voit défiler sur le côté, ce sont les paliers déjà
 * vidés, avec les petites lumières qu'on y a laissées — l'appel des noms, mais
 * pendant qu'on monte.
 *
 * Ce fichier ne décide rien : `regles/puits.ts` fait monter, celui-ci regarde.
 */

import { rgba } from '../coeur/couleurs.js';
import { CASE, D } from '../coeur/dimensions.js';
import { RALLUME } from '../coeur/formes.js';
import { clamp, TAU } from '../coeur/geometrie.js';
import { decouper } from '../coeur/texte.js';
import { RECIT_CAGE, RECIT_PLUS_HAUT } from '../coeur/textes.js';
import type { Partie } from '../coeur/types.js';
import type { Ecran } from './ecran.js';
import { texteCerne } from './texte.js';
import { dessinerTete } from './visages.js';

/** Hauteur d'un étage dans la cage, et demi-largeur du conduit. */
const ETAGE = CASE * 7;
const LARGE = CASE * 2.2;
/** Trois paliers de noir au-dessus : on ignore la hauteur du puits. */
const INCONNUS = 3;

/** Le corps de Falot pendant la montée : il n'a plus de zone où être. */
const corps = {
  x: 0,
  y: 0,
  sx: 1,
  sy: 1,
  vsx: 0,
  vsy: 0,
  vx: 0,
  vy: 0,
  regard: -Math.PI / 2,
  tremble: 0,
  aveugle: 0,
  cligne: 0,
};

/** Ce qu'on voit du récit, de 0 à 1, selon la hauteur atteinte. */
const recitLu = (h: number) =>
  clamp((h - 0.12) / 0.2, 0, 1) * clamp((0.78 - h) / 0.18, 0, 1);

export function dessinerPuits(ecran: Ecran, partie: Partie, temps: number): void {
  const puits = partie.puits;
  if (!puits) return;
  const { ctx, cam, W, H } = ecran;

  // Le repère : Falot est à 0 en x et à −h étages en y ; le palier qu'il vient
  // de quitter est à 0, celui où il arrive à −1 étage. La caméra le tient aux
  // deux tiers de l'écran — il regarde où il monte, pas d'où il vient.
  const fx = puits.x * (LARGE - D.taille * 0.9);
  const fy = -puits.h * ETAGE;
  cam.x = -W / 2;
  cam.y = fy - H * 0.62;

  ctx.fillStyle = '#08080e';
  ctx.fillRect(0, 0, W, H);

  const ex = (x: number) => x - cam.x;
  const ey = (y: number) => y - cam.y;

  // --- les parois : de la pierre, comme partout ailleurs ---
  ctx.fillStyle = '#12121a';
  ctx.fillRect(0, 0, ex(-LARGE), H);
  ctx.fillRect(ex(LARGE), 0, W - ex(LARGE), H);
  ctx.strokeStyle = 'rgba(255,255,255,0.13)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(ex(-LARGE), 0);
  ctx.lineTo(ex(-LARGE), H);
  ctx.moveTo(ex(LARGE), 0);
  ctx.lineTo(ex(LARGE), H);
  ctx.stroke();

  // --- les paliers ---
  // Le plus bas dessiné est le premier étage de l'aventure, le plus haut trois
  // au-dessus de là où l'on arrive. `numero` est le vrai numéro d'étage.
  const bas = puits.arrivee - 1;
  for (let n = 1; n <= puits.arrivee + INCONNUS; n++) {
    const y = (bas - n) * ETAGE;
    const dy = Math.abs(y - fy);
    // ce qui est loin s'efface : on ne voit que là où l'on est
    const vu = clamp(1 - dy / (ETAGE * 2.6), 0, 1);
    if (vu <= 0.01) continue;
    const franchi = partie.montee.find((m) => m.etage === n);
    const futur = n > puits.arrivee;

    // la dalle, avec son ouverture au milieu : c'est par là qu'on passe
    ctx.strokeStyle = `rgba(255,255,255,${0.1 * vu + (futur ? 0 : 0.06)})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ex(-LARGE), ey(y));
    ctx.lineTo(ex(-D.taille * 1.3), ey(y));
    ctx.moveTo(ex(D.taille * 1.3), ey(y));
    ctx.lineTo(ex(LARGE), ey(y));
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.font = '700 13px Georgia, serif';
    texteCerne(
      ecran,
      futur ? '?' : String(n),
      ex(-LARGE) + 9,
      ey(y) - 9,
      `rgba(232,232,240,${0.34 * vu})`,
      3,
    );

    // les âmes laissées sur ce palier : de petites lumières, alignées
    const ames = franchi?.ames ?? 0;
    for (let i = 0; i < ames; i++) {
      const px = ex(-LARGE + CASE * 0.75 + i * CASE * 0.42);
      const py = ey(y) - 9;
      const g = ctx.createRadialGradient(px, py, 0, px, py, 11);
      g.addColorStop(0, rgba(RALLUME, 0.5 * vu));
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(px, py, 11, 0, TAU);
      ctx.fill();
      ctx.fillStyle = rgba(RALLUME, 0.85 * vu);
      ctx.beginPath();
      ctx.arc(px, py, 2.4, 0, TAU);
      ctx.fill();
    }

    // La seule mention qu'on se permette, et une seule fois : au premier
    // palier que personne n'a jamais dépassé.
    // La mention attend que le récit ait fini de se lire : elle occupe la
    // même bande que lui.
    if (n === puits.arrivee + 1 && recitLu(puits.h) <= 0.02) {
      ctx.textAlign = 'center';
      ctx.font = 'italic 12px Georgia, serif';
      texteCerne(
        ecran,
        'personne n’est jamais monté si haut',
        W / 2,
        ey(y) - 13,
        `rgba(232,232,240,${0.3 * vu})`,
        3,
      );
    }
  }

  // --- le récit de l'étage, lu en montant ---
  const recit =
    RECIT_CAGE[puits.arrivee] ??
    RECIT_PLUS_HAUT[Math.abs(puits.arrivee - 5) % RECIT_PLUS_HAUT.length];
  // Il se lit dans le premier tiers de la montée et s'efface AVANT que le
  // palier d'arrivée n'entre dans sa bande : deux textes au même endroit, on
  // n'en lit plus aucun.
  const lu = recitLu(puits.h);
  if (recit && lu > 0.01) {
    ctx.textAlign = 'center';
    ctx.font = 'italic 15px Georgia, serif';
    const lignes = decouper(recit, Math.max(22, Math.floor(W / 11)));
    const y0 = H * 0.3 - lignes.length * 11;
    for (let i = 0; i < lignes.length; i++)
      texteCerne(
        ecran,
        lignes[i],
        W / 2,
        y0 + i * 22,
        `rgba(232,232,240,${0.52 * lu})`,
        3.5,
      );
  }

  // --- Falot, et sa lumière ---
  const r = CASE * (1.25 + Math.sin(temps * 2.2) * 0.05);
  const halo = ctx.createRadialGradient(ex(fx), ey(fy), 0, ex(fx), ey(fy), r * 2.2);
  halo.addColorStop(0, 'rgba(255,233,168,0.20)');
  halo.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(ex(fx), ey(fy), r * 2.2, 0, TAU);
  ctx.fill();

  // des motes qui retombent derrière lui : on voit qu'il monte, même à l'arrêt
  ctx.fillStyle = 'rgba(255,233,168,0.5)';
  for (let i = 0; i < 26; i++) {
    const k = (i * 0.3708 + temps * 0.12) % 1;
    const px = ex(Math.sin(i * 12.9898) * LARGE * 0.92);
    const py = (H * 1.15 * k + i * 37) % (H + 60);
    ctx.globalAlpha = 0.1 + 0.2 * Math.sin(k * Math.PI);
    ctx.fillRect(px, py, 1.6, 1.6 + 4 * k);
  }
  ctx.globalAlpha = 1;

  corps.x = fx;
  corps.y = fy;
  corps.sx = 1 + puits.vh * 0.14;
  corps.sy = 1 - puits.vh * 0.14;
  dessinerTete(ecran, corps, '#ffe9a8', D.taille, true, 1, 'intrigue', temps, 1);

  // --- « monte » : dit une fois, sans bouton ---
  // Deux secondes de flèche qui pulse au-dessus de lui. Personne ne lit une
  // consigne ; tout le monde suit une flèche.
  if (puits.t < 2.4 && puits.h < 0.5) {
    const k = clamp(1 - puits.t / 2.4, 0, 1) * (0.55 + 0.45 * Math.sin(temps * 5));
    ctx.fillStyle = `rgba(255,233,168,${0.7 * k})`;
    const ax = ex(fx),
      ay = ey(fy) - D.taille * 1.5;
    ctx.beginPath();
    ctx.moveTo(ax, ay - 13);
    ctx.lineTo(ax + 9, ay);
    ctx.lineTo(ax - 9, ay);
    ctx.closePath();
    ctx.fill();
  }

  // --- le noir qui se referme en haut ---
  if (puits.sortie > 0) {
    ctx.fillStyle = `rgba(8,8,14,${clamp(puits.sortie / 0.5, 0, 1)})`;
    ctx.fillRect(0, 0, W, H);
  }
}
