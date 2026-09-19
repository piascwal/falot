/**
 * Les visages.
 *
 * Un visage ne dit pas QUI on est, il dit CE QUI SE PASSE : deux yeux, deux
 * sourcils, une bouche, et une seule humeur les accorde tous les trois. Ce sont
 * les SOURCILS qui portent l'expression — la peur, c'est les pointes
 * intérieures relevées et l'œil grand ouvert ; l'acharnement, l'inverse exact.
 *
 * C'est la même fonction pour le joueur et pour les âmes. Une émotion vient de
 * ce qui arrive, pas d'un palier de progression.
 */

import { assombrir, eclaircir } from '../coeur/couleurs.js';
import { HUMEURS, type Humeur, RALLUME } from '../coeur/formes.js';
import { TAU } from '../coeur/geometrie.js';
import type { Corps } from '../coeur/types.js';
import type { Ecran } from './ecran.js';

/** Un rectangle aux coins ronds : la forme de tout le monde, ici. */
export function carreArrondi(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

// accorde tous les trois. Ce sont les SOURCILS qui portent l'expression : la
// peur, c'est les pointes intérieures relevées et l'œil grand ouvert ;
// l'acharnement, l'inverse exact, pointes intérieures baissées et œil plissé.
// Tant que le peureux portait des sourcils d'intrigué, aucune bouche ne
// pouvait rattraper ça — il avait l'air plus inquiet sans bouche du tout.
// `recharge` va de 0 à 1 pendant qu'on rallume une âme. On lui verse la
// lumière dans le corps, par le bas, comme on remplit une lampe : un simple
// contour sombre au départ, plein et vert à l'arrivée. Sans ça le passage se
// faisait d'un coup et on ne voyait pas qu'on était en train de réussir.
export function dessinerTete(
  ecran: Ecran,
  p: Corps,
  couleur: string,
  taille: number,
  allume: boolean,
  opacite: number,
  humeur: Humeur,
  temps: number,
  recharge: number,
): void {
  const ctx = ecran.ctx;
  const cam = ecran.cam;
  const affole = humeur === HUMEURS.PEUR; // le vrai danger
  const inquiet = humeur === HUMEURS.INQUIET; // la peur au repos
  const peur = affole || inquiet; // mêmes yeux, mêmes sourcils
  const acharne = humeur === HUMEURS.ACHARNE;
  const visee = humeur === HUMEURS.VISEE;
  const apaise = humeur === HUMEURS.APAISE;
  const w = taille * p.sx,
    h = taille * p.sy;
  const arrondi = Math.min(w, h) * 0.32;
  const demi = taille * 0.5;

  ctx.save();
  ctx.translate(p.x - cam.x, p.y - cam.y);
  ctx.globalAlpha = opacite;

  const corps = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  if (allume) {
    corps.addColorStop(0, eclaircir(couleur, 0.42));
    corps.addColorStop(0.55, couleur);
    corps.addColorStop(1, assombrir(couleur, 0.3));
  } else {
    corps.addColorStop(0, '#23232f');
    corps.addColorStop(1, '#12121a');
  }
  ctx.fillStyle = corps;
  carreArrondi(ctx, -w / 2, -h / 2, w, h, arrondi);
  ctx.fill();

  // le niveau qui monte, découpé par la silhouette du corps
  if (recharge > 0 && recharge < 1) {
    const haut = h / 2 - h * recharge;
    ctx.save();
    carreArrondi(ctx, -w / 2, -h / 2, w, h, arrondi);
    ctx.clip();
    const plein = ctx.createLinearGradient(0, haut, 0, h / 2);
    plein.addColorStop(0, eclaircir(RALLUME, 0.5));
    plein.addColorStop(1, assombrir(RALLUME, 0.18));
    ctx.fillStyle = plein;
    ctx.fillRect(-w / 2, haut, w, h);
    // Pas de ménisque : la ligne blanche à la surface se lisait comme une
    // barre de chargement collée sur le visage. Le dégradé suffit à dire que
    // ça monte.
    ctx.restore();
  }

  ctx.strokeStyle = allume ? 'rgba(255,255,255,0.7)' : couleur;
  ctx.lineWidth = allume ? 2 : 1.5;
  ctx.stroke();

  const reflet = ctx.createRadialGradient(
    -w * 0.2,
    -h * 0.28,
    0,
    -w * 0.2,
    -h * 0.28,
    w * 0.42,
  );
  reflet.addColorStop(0, `rgba(255,255,255,${allume ? 0.45 : 0.1})`);
  reflet.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = reflet;
  carreArrondi(ctx, -w / 2, -h / 2, w, h, arrondi);
  ctx.fill();

  // --- yeux ---
  const ecart = demi * 0.36 * p.sx;
  const oeilY = -demi * 0.14 * p.sy;
  // l'œil s'ouvre grand quand on a peur, se plisse quand on s'acharne
  const rOeil = demi * 0.22 * (peur ? 1.22 : acharne ? 0.94 : apaise ? 0.92 : 1);
  // en visée on ferme un œil : c'est le geste universel de qui ajuste
  const clinDoeil = visee ? 1 : 0;
  const px = Math.cos(p.regard) * rOeil * 0.42;
  const py = Math.sin(p.regard) * rOeil * 0.42;
  const encre = allume ? '#0a0a10' : couleur;
  if (p.aveugle > 0 || p.cligne > 0) {
    // aveuglée : les yeux se ferment. C'est le seul signe qui dit « elle ne
    // te voit plus » — sans lui, l'éclat n'a aucun effet visible.
    ctx.strokeStyle = encre;
    ctx.lineWidth = Math.max(2, demi * 0.12);
    ctx.lineCap = 'round';
    for (const dx of [-ecart, ecart]) {
      ctx.beginPath();
      ctx.arc(dx, oeilY - rOeil * 0.35, rOeil, 0.5, Math.PI - 0.5);
      ctx.stroke();
    }
  } else {
    // La pupille rétrécit dans la peur : c'est ce contraste avec le blanc
    // grand ouvert qui fait l'œil affolé, bien plus que sa taille.
    const rPupille = rOeil * (peur ? 0.36 : acharne ? 0.58 : 0.5);
    // apaisé : l'œil se détend à demi. Pas fermé — fermé, c'est « aveuglé ».
    const hOeil = acharne ? rOeil * 0.62 : apaise ? rOeil * 0.72 : rOeil;
    const frisson = affole ? Math.sin(temps * 17 + (p.tremble || 0)) * rOeil * 0.07 : 0;
    for (const dx of [-ecart, ecart]) {
      if (clinDoeil && dx > 0) {
        // l'œil droit se ferme
        ctx.strokeStyle = encre;
        ctx.lineWidth = Math.max(2, demi * 0.12);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(dx, oeilY - rOeil * 0.35, rOeil, 0.5, Math.PI - 0.5);
        ctx.stroke();
        continue;
      }
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(dx, oeilY, rOeil, hOeil, 0, 0, TAU);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.clip(); // la pupille reste dans l'œil
      ctx.fillStyle = '#0a0a10';
      ctx.beginPath();
      ctx.arc(dx + px + frisson, oeilY + py, rPupille, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
  }

  // --- sourcils ---
  ctx.strokeStyle = encre;
  ctx.lineWidth = Math.max(2, demi * 0.12);
  ctx.lineCap = 'round';
  const lg = rOeil * 1.15;
  if (apaise) {
    // sourcils hauts, droits et symétriques : ni froncés, ni inquiets.
    // C'est l'absence de tension qui fait lire le calme.
    const sy = oeilY - rOeil * 1.85;
    for (const cote of [-1, 1]) {
      const dx = ecart * cote;
      ctx.beginPath();
      ctx.moveTo(dx - lg * 0.5, sy);
      ctx.quadraticCurveTo(dx, sy - rOeil * 0.3, dx + lg * 0.5, sy);
      ctx.stroke();
    }
  } else if (visee) {
    // un sourcil remonté, l'autre baissé sur l'œil fermé : la concentration
    ctx.beginPath();
    ctx.moveTo(-ecart - lg * 0.5, oeilY - rOeil * 2.1);
    ctx.lineTo(-ecart + lg * 0.5, oeilY - rOeil * 2.35);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ecart - lg * 0.5, oeilY - rOeil * 1.5);
    ctx.lineTo(ecart + lg * 0.5, oeilY - rOeil * 1.25);
    ctx.stroke();
  } else if (peur) {
    // Pointes INTÉRIEURES relevées, extérieures qui tombent, et le tout
    // remonté loin au-dessus de l'œil : c'est le sourcil inquiet.
    const sy = oeilY - rOeil * 1.95;
    for (const cote of [-1, 1]) {
      const dx = ecart * cote;
      ctx.beginPath();
      ctx.moveTo(dx + lg * 0.55 * cote, sy + rOeil * 0.42); // extérieur, bas
      ctx.quadraticCurveTo(dx, sy - rOeil * 0.1, dx - lg * 0.55 * cote, sy - rOeil * 0.34); // intérieur, haut
      ctx.stroke();
    }
  } else if (acharne) {
    // L'exact miroir : intérieures baissées vers le nez, et posées bas.
    const sy = oeilY - rOeil * 1.35;
    for (const cote of [-1, 1]) {
      const dx = ecart * cote;
      ctx.beginPath();
      ctx.moveTo(dx + lg * 0.55 * cote, sy - rOeil * 0.45); // extérieur, haut
      ctx.lineTo(dx - lg * 0.55 * cote, sy + rOeil * 0.45); // intérieur, bas
      ctx.stroke();
    }
  } else {
    // intrigué : l'un levé, l'autre droit — l'asymétrie fait tout
    const sy = oeilY - rOeil * 1.6;
    ctx.beginPath();
    ctx.moveTo(-ecart - lg * 0.5, sy - rOeil * 0.5);
    ctx.lineTo(-ecart + lg * 0.5, sy - rOeil * 0.15);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ecart - lg * 0.5, sy - rOeil * 0.1);
    ctx.lineTo(ecart + lg * 0.5, sy - rOeil * 0.1);
    ctx.stroke();
  }

  // --- bouche ---
  // La bouche ne contredit jamais les sourcils, elle les appuie. Elle reste
  // petite : le personnage fait douze pixels de haut, une grande bouche y
  // devient une tache.
  const by = oeilY + rOeil * 2.4;
  const bl = demi * 0.42;
  ctx.lineWidth = Math.max(1.8, demi * 0.1);
  ctx.strokeStyle = encre;
  ctx.beginPath();
  if (apaise) {
    // le seul sourire du jeu. Il ne s'obtient qu'à l'abri, et il vaut donc
    // quelque chose : un peureux qui sourit tout le temps ne dit plus rien.
    ctx.arc(0, by - bl * 0.5, bl * 0.78, 0.62, Math.PI - 0.62);
  } else if (visee) {
    // bouche poussée sur le côté, comme on mord sa joue en ajustant
    ctx.moveTo(-bl * 0.1, by + bl * 0.06);
    ctx.quadraticCurveTo(bl * 0.22, by + bl * 0.02, bl * 0.46, by - bl * 0.12);
  } else if (affole) {
    // petite bouche ouverte qui tremble
    const t = Math.sin(temps * 18 + (p.tremble || 0)) * demi * 0.03;
    ctx.ellipse(0, by + t, bl * 0.3, bl * 0.4, 0, 0, TAU);
  } else if (inquiet) {
    // PAS CONTENT. C'est le visage de départ, celui qu'on voit le plus : il
    // doit dire d'un coup d'œil « je n'ai rien demandé à être ici », sans
    // qu'aucun mot ne le dise. Courte et franchement tombante — la version
    // sage d'avant ne se lisait pas à douze pixels de haut.
    ctx.moveTo(-bl * 0.28, by + bl * 0.14);
    ctx.quadraticCurveTo(0, by - bl * 0.16, bl * 0.28, by + bl * 0.14);
  } else if (acharne) {
    ctx.moveTo(-bl * 0.4, by + bl * 0.1); // trait serré, un rien tombant
    ctx.quadraticCurveTo(0, by - bl * 0.12, bl * 0.4, by + bl * 0.1);
  } else {
    // intrigué : une vaguelette, ni sourire ni moue
    const t = Math.sin(temps * 2.5 + (p.tremble || 0)) * demi * 0.02;
    const w = bl * 0.52,
      h2 = bl * 0.34;
    ctx.moveTo(-w, by + t);
    ctx.quadraticCurveTo(-w * 0.5, by - h2 + t, 0, by + t);
    ctx.quadraticCurveTo(w * 0.5, by + h2 + t, w, by + t);
  }
  ctx.stroke();
  ctx.restore();
}
