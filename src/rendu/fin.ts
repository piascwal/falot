/**
 * LA FIN, dessinée.
 *
 * Cinq temps, toujours les mêmes formes que le reste du jeu : des carrés
 * arrondis, des cônes, des ronds de lumière, du noir.
 *
 *   1. L'ESCORTE — Falot, en bleu, mène son convoi de lumières vers le haut.
 *      C'est la dernière fois qu'on le voit faire ce qu'il a fait douze fois.
 *   2. LE FIL — elles le quittent et prennent un fil, exactement celui qu'il
 *      laisse derrière lui en jouant, qui se sépare en quatre.
 *   3. LES QUATRE — l'écran se coupe en quatre et chaque lumière allume sa
 *      scène : une veilleuse, une bougie, un lampadaire, un phare.
 *   4. LA SIENNE — sa fenêtre. Elle l'attend, et plus il s'approche, moins il
 *      l'éclaire : une lumière est toujours à l'autre bout du faisceau.
 *   5. LA CHUTE — il recule, il redescend, et sa fenêtre reste allumée.
 *
 * `regles/fin.ts` compte le temps ; ce fichier ne fait que regarder.
 */

import { CASE, D } from '../coeur/dimensions.js';
import { clamp, TAU } from '../coeur/geometrie.js';
import { tempsFin } from '../coeur/regles/fin.js';
import { decouper } from '../coeur/texte.js';
import { FIN } from '../coeur/textes.js';
import type { Partie } from '../coeur/types.js';
import type { Ecran } from './ecran.js';
import { texteCerne } from './texte.js';
import { dessinerOmbre, dessinerTete } from './visages.js';

/** Le bleu de Falot. Il ne change plus : il a tout donné, il reste Peureux.
 *  C'est aussi ce qui sépare ce qu'il EST de ce qu'il DONNE — l'or, jamais
 *  pour lui. */
const BLEU = '#8fd0ff';
/** Le vert d'une lumière qu'on a rallumée, celui du jeu. */
const VERT = '168,240,200';
/** L'or de là-haut : ce que les lumières deviennent une fois posées. */
const OR = '255,214,140';

/** Le corps de Falot pendant la scène : il n'a plus de zone où être. */
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

/** Une phrase posée en haut, qui apparaît et s'efface avec son temps. */
function phrase(ecran: Ecran, txt: string, y: number, k: number): void {
  const { ctx, W } = ecran;
  const vu = clamp(k / 0.16, 0, 1) * clamp((1 - k) / 0.16, 0, 1);
  if (vu <= 0.01) return;
  ctx.textAlign = 'center';
  ctx.font = 'italic 16px Georgia, serif';
  const lignes = decouper(txt, Math.max(24, Math.floor(W / 9)));
  for (let i = 0; i < lignes.length; i++)
    texteCerne(ecran, lignes[i], W / 2, y + i * 24, `rgba(232,232,240,${0.78 * vu})`, 3.5);
}

/** Un halo rond. Toute la lumière de cette fin passe par là. */
function halo(
  ecran: Ecran,
  x: number,
  y: number,
  r: number,
  teint: string,
  a: number,
): void {
  if (a <= 0.005 || r <= 0) return;
  const { ctx } = ecran;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${teint},${a})`);
  g.addColorStop(0.55, `rgba(${teint},${a * 0.32})`);
  g.addColorStop(1, `rgba(${teint},0)`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
}

/** Une petite lumière : le cœur presque blanc, et son halo autour. */
function lumiere(ecran: Ecran, x: number, y: number, r: number, a = 1): void {
  const { ctx } = ecran;
  halo(ecran, x, y, r * 7, VERT, 0.5 * a);
  ctx.fillStyle = `rgba(226,255,238,${0.94 * a})`;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
}

/**
 * UN CÔNE DE LUMIÈRE, celui du jeu : il part d'un point, il a une longueur et
 * une ouverture. C'est la forme la plus chargée de la fin — c'est elle qui dit
 * que la lumière est toujours à l'autre bout d'elle-même.
 */
function cone(
  ecran: Ecran,
  x: number,
  y: number,
  angle: number,
  portee: number,
  ouverture: number,
  teint: string,
  a: number,
): void {
  if (a <= 0.005 || portee <= 1) return;
  const { ctx } = ecran;
  const g = ctx.createRadialGradient(x, y, 0, x, y, portee);
  g.addColorStop(0, `rgba(${teint},${a * 0.55})`);
  g.addColorStop(1, `rgba(${teint},0)`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, portee, angle - ouverture / 2, angle + ouverture / 2);
  ctx.closePath();
  ctx.fill();
}

/**
 * Le gris d'une silhouette, selon ce qui l'éclaire.
 *
 * À zéro c'est EXACTEMENT le fond : une case pas encore allumée doit être
 * vide. Elle partait d'un gris un peu au-dessus du noir, et on voyait les
 * quatre scènes attendre leur lumière — toute la montée du fil ne révélait
 * plus rien.
 */
const teinte = (k: number) =>
  `rgb(${Math.round(8 + k * 136)},${Math.round(8 + k * 114)},${Math.round(14 + k * 88)})`;

/** Une tête ronde sur des épaules : on ne dessine jamais un visage d'en haut,
 *  ce sont des gens et pas des personnages. */
function silhouette(ecran: Ecran, x: number, sol: number, h: number, k: number): void {
  const { ctx } = ecran;
  const l = h * 0.4;
  ctx.fillStyle = teinte(k);
  const r = l * 0.34;
  ctx.beginPath();
  ctx.roundRect(x - l / 2, sol - h * 0.72, l, h * 0.72, [r, r, 0, 0]);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, sol - h * 0.82, l * 0.36, 0, TAU);
  ctx.fill();
}

/**
 * OÙ BRÛLE LA LUMIÈRE DE CHAQUE CASE, en fraction de la case.
 *
 * Une seule source de vérité : la scène la dessine là, et le fil s'y rend. Les
 * deux se déduisaient de nombres écrits deux fois, et ça dérivait dès qu'on
 * déplaçait un lit.
 */
const FEU = [
  [0.77, 0.42], // la veilleuse, sur sa table de chevet
  [0.5, 0.41], // la flamme de la bougie
  [0.64, 0.16], // la tête du lampadaire
  [0.19, 0.1], // la lanterne du phare
] as const;

// ---------------------------------------------------------------------------
// LES QUATRE SCÈNES
//
// Chacune tient dans sa case et ne sait rien des autres. `k` va de 0 (noir,
// la lumière n'est pas encore arrivée) à 1 (allumée). Aucune n'a de visage :
// à cette distance un visage ferait un personnage, et ce sont des gens.
// ---------------------------------------------------------------------------

/** 1. UN ENFANT ALLUME SA VEILLEUSE. La plus petite lumière du jeu, et celle
 *  qui compte le plus : c'est littéralement ce que Falot était. */
function veilleuse(
  ecran: Ecran,
  x: number,
  y: number,
  w: number,
  h: number,
  k: number,
): void {
  const { ctx } = ecran;
  const lit = y + h * 0.56; // le haut du matelas
  const sol = y + h * 0.78;
  const lx = x + w * FEU[0][0];
  const ly = y + h * FEU[0][1];
  halo(ecran, lx, ly, w * 0.62, OR, 0.5 * k);
  // IL EST ASSIS DANS SON LIT, contre la tête de lit, la couverture sur les
  // jambes, la main du côté de la lampe — et il vient de l'allumer. Couché, il
  // fallait trois formes pour dire « une tête sur un oreiller » et ça se lisait
  // comme un tas ; assis, une silhouette suffit. Et surtout, c'est ce qu'il
  // fait : il a eu peur, il a tendu le bras, il a allumé.
  ctx.fillStyle = teinte(k * 0.45);
  ctx.beginPath();
  ctx.roundRect(x + w * 0.08, lit, w * 0.56, sol - lit, h * 0.02);
  ctx.fill();
  ctx.fillStyle = teinte(k * 0.6); // la tête de lit, du côté de la lampe
  ctx.beginPath();
  ctx.roundRect(x + w * 0.6, lit - h * 0.15, w * 0.04, h * 0.17, h * 0.015);
  ctx.fill();
  silhouette(ecran, x + w * 0.53, lit + h * 0.015, h * 0.19, k);
  ctx.fillStyle = teinte(k * 0.72); // la couverture, tirée sur ses jambes
  ctx.beginPath();
  ctx.roundRect(x + w * 0.09, lit - h * 0.03, w * 0.38, h * 0.07, h * 0.028);
  ctx.fill();
  // la table de chevet, à portée de main, et la veilleuse posée dessus
  ctx.fillStyle = teinte(k * 0.4);
  ctx.fillRect(x + w * 0.71, y + h * 0.47, w * 0.12, sol - y - h * 0.47);
  ctx.fillStyle = `rgba(${OR},${k})`;
  ctx.beginPath();
  ctx.roundRect(lx - w * 0.032, ly - h * 0.045, w * 0.064, h * 0.09, h * 0.028);
  ctx.fill();
}

/** 2. UN COUPLE ALLUME UNE BOUGIE. Deux silhouettes qui se font face, et la
 *  lumière exactement entre elles : c'est tout le sujet du plan. */
function bougie(ecran: Ecran, x: number, y: number, w: number, h: number, k: number): void {
  const { ctx } = ecran;
  const table = y + h * 0.62; // le plateau
  const cx = x + w * FEU[1][0];
  const fy = y + h * FEU[1][1] + h * 0.014;
  halo(ecran, cx, fy, w * 0.66, OR, 0.52 * k);
  // ILS SONT DE PART ET D'AUTRE, et le plateau leur coupe le buste. Dessinés
  // au-dessus de la table, ils avaient l'air posés DESSUS : c'est l'ordre du
  // tracé qui fait qu'on est attablé — le corps derrière, le plateau devant.
  silhouette(ecran, x + w * 0.2, table + h * 0.16, h * 0.4, k);
  silhouette(ecran, x + w * 0.8, table + h * 0.16, h * 0.4, k);
  // les deux chaises, à peine : deux dossiers qui dépassent derrière eux
  ctx.fillStyle = teinte(k * 0.32);
  ctx.fillRect(x + w * 0.11, table - h * 0.04, w * 0.025, h * 0.22);
  ctx.fillRect(x + w * 0.865, table - h * 0.04, w * 0.025, h * 0.22);
  // le plateau, par-dessus les deux, et son pied
  ctx.fillStyle = teinte(k * 0.6);
  ctx.beginPath();
  ctx.roundRect(x + w * 0.16, table, w * 0.68, h * 0.055, h * 0.02);
  ctx.fill();
  ctx.fillStyle = teinte(k * 0.42);
  ctx.fillRect(cx - w * 0.03, table + h * 0.05, w * 0.06, h * 0.16);
  // la bougie, un trait et une flamme, exactement entre eux
  ctx.fillStyle = teinte(k * 0.85);
  ctx.fillRect(cx - w * 0.011, fy, w * 0.022, h * 0.19);
  ctx.fillStyle = `rgba(255,236,196,${k})`;
  ctx.beginPath();
  ctx.arc(cx, fy - h * 0.014, h * 0.024, 0, TAU);
  ctx.fill();
}

/** 3. UN LAMPADAIRE ALLUME UN PIÉTON SOUS LA PLUIE. Personne ne lui a rien
 *  demandé et il ne saura jamais qu'il a été éclairé : c'est le plan qui dit
 *  que ça compte quand même. */
function lampadaire(
  ecran: Ecran,
  x: number,
  y: number,
  w: number,
  h: number,
  k: number,
  temps: number,
): void {
  const { ctx } = ecran;
  const sol = y + h * 0.82;
  const px = x + w * FEU[2][0];
  const py = y + h * FEU[2][1];
  cone(ecran, px, py + h * 0.03, Math.PI / 2, h * 0.72, 0.85, OR, 0.95 * k);
  halo(ecran, px, py, w * 0.3, OR, 0.6 * k);
  // le mât et sa potence
  ctx.fillStyle = teinte(k * 0.45);
  ctx.fillRect(px - w * 0.014, py, w * 0.028, sol - py);
  ctx.fillRect(px - w * 0.08, py - h * 0.02, w * 0.096, h * 0.026);
  ctx.fillStyle = `rgba(${OR},${k})`;
  ctx.fillRect(px - w * 0.05, py + h * 0.004, w * 0.04, h * 0.022);
  // la pluie : des traits, jamais des gouttes — une goutte ronde se lit comme
  // une lumière, et il y en a déjà partout
  ctx.strokeStyle = `rgba(190,206,230,${0.28 * k})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i < 46; i++) {
    const rx = x + ((i * 97) % 100) * (w / 100);
    const ry = y + ((((i * 53) % 100) * (h / 100) + temps * 420) % (h * 0.86));
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx - w * 0.012, ry + h * 0.05);
  }
  ctx.stroke();
  // le piéton, qui traverse le cône et s'en va
  const marche = (temps * 0.1) % 1;
  const mx = x + w * (0.86 - marche * 0.66);
  const sous = clamp(1 - Math.abs(mx - px) / (w * 0.22), 0, 1);
  silhouette(ecran, mx, sol, h * 0.3, k * (0.22 + 0.78 * sous));
  // le trottoir mouillé rend la lumière : c'est ça qui fait la pluie, pas les
  // traits — donc un dégradé écrasé au sol, jamais un rectangle
  ctx.fillStyle = '#08080e';
  ctx.fillRect(x, sol, w, y + h - sol);
  ctx.save();
  ctx.translate(px, sol);
  ctx.scale(1, 0.26);
  halo(ecran, 0, 0, w * 0.34, OR, 0.5 * k);
  ctx.restore();
}

/** 4. UN PHARE, ET AU LARGE UN BATEAU QUI REDRESSE SON CAP. La seule des
 *  quatre où la lumière ne rencontrera jamais celui qu'elle sauve — et c'est
 *  exprès : c'est elle qui prépare la scène d'après. */
function phare(
  ecran: Ecran,
  x: number,
  y: number,
  w: number,
  h: number,
  k: number,
  temps: number,
): void {
  const { ctx } = ecran;
  const horizon = y + h * 0.44;
  const tx = x + w * FEU[3][0];
  const ty = y + h * FEU[3][1];
  const roche = horizon + h * 0.06; // le rocher est DANS l'eau, pas devant
  // LE CIEL ET LA MER. Deux dégradés, jamais deux rectangles : un aplat qui
  // s'arrête à l'horizontale se lit comme un carton posé sur l'image, et on
  // voyait son coin. C'est la ligne d'horizon, et elle seule, qui fait la mer.
  // LE CIEL N'EST PAS PEINT. Un aplat bleu, même très sombre, faisait de la
  // case entière un rectangle de couleur posé à côté de trois cases noires —
  // et c'est la case qu'on regardait, pas ce qu'il y avait dedans. La nuit du
  // large, c'est du noir : une ligne d'horizon et trois reflets suffisent.
  ctx.strokeStyle = `rgba(150,180,220,${0.15 * k})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, horizon);
  ctx.lineTo(x + w, horizon);
  ctx.stroke();
  // les reflets couchés : c'est ça qui fait de l'eau, pas la couleur
  ctx.strokeStyle = `rgba(150,180,220,${0.12 * k})`;
  ctx.beginPath();
  for (let i = 1; i < 8; i++) {
    const ly = horizon + (i * i * (y + h - horizon)) / 50;
    ctx.moveTo(x + w * (0.06 + ((i * 31) % 45) / 100), ly);
    ctx.lineTo(x + w * (0.3 + ((i * 17) % 45) / 100), ly);
  }
  ctx.stroke();
  // LE BALAYAGE. Il reste près de l'horizontale : c'est là qu'il y a
  // quelqu'un, et un phare qui éclaire le ciel n'a jamais sauvé personne.
  const angle = Math.sin(temps * 0.85) * 0.34;
  cone(ecran, tx, ty, angle, w * 0.88, 0.16, OR, 0.95 * k);
  halo(ecran, tx, ty, w * 0.2, OR, 0.7 * k);
  // la tour, plus large en bas : une tour droite se lit comme une cheminée
  ctx.fillStyle = teinte(k * 0.38);
  ctx.beginPath();
  ctx.moveTo(tx - w * 0.015, ty);
  ctx.lineTo(tx + w * 0.015, ty);
  ctx.lineTo(tx + w * 0.032, roche);
  ctx.lineTo(tx - w * 0.032, roche);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath(); // le rocher
  ctx.ellipse(tx, roche, w * 0.075, h * 0.025, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = `rgba(${OR},${k})`;
  ctx.fillRect(tx - w * 0.016, ty - h * 0.022, w * 0.032, h * 0.04);
  // le bateau : une coque, un feu, et un cap qui se redresse quand il a vu
  const vu = clamp(k * 1.2 - 0.3, 0, 1);
  const bx = x + w * (0.74 + vu * 0.06);
  const by = horizon + h * 0.1 - vu * h * 0.035;
  ctx.save();
  ctx.translate(bx, by);
  ctx.rotate(0.24 * (1 - vu)); // il gîtait vers la côte ; il se redresse
  ctx.fillStyle = teinte(k * 0.55);
  ctx.beginPath();
  ctx.roundRect(-w * 0.05, -h * 0.011, w * 0.1, h * 0.024, h * 0.011);
  ctx.fill();
  ctx.fillStyle = `rgba(${OR},${k * (0.45 + 0.45 * vu)})`;
  ctx.beginPath();
  ctx.arc(0, -h * 0.028, h * 0.01, 0, TAU);
  ctx.fill();
  ctx.restore();
}

/** Un point du chemin, et de quoi le parcourir. */
type Etape = { x: number; y: number };

/** Longueur cumulée d'une polyligne : on s'en sert pour avancer dessus à
 *  vitesse constante, sinon un coude court se parcourt aussi vite qu'un long. */
function longueurs(pts: Etape[]): number[] {
  const l = [0];
  for (let i = 1; i < pts.length; i++)
    l.push(l[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  return l;
}

/** Trace le chemin jusqu'à la fraction `t`, et rend le point qu'on y atteint. */
function tracerChemin(ecran: Ecran, pts: Etape[], t: number): Etape {
  const { ctx } = ecran;
  const l = longueurs(pts);
  const cible = l[l.length - 1] * t;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  let bout = pts[0];
  for (let i = 1; i < pts.length; i++) {
    if (l[i] <= cible) {
      ctx.lineTo(pts[i].x, pts[i].y);
      bout = pts[i];
      continue;
    }
    const u = (cible - l[i - 1]) / (l[i] - l[i - 1]);
    bout = {
      x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * u,
      y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * u,
    };
    ctx.lineTo(bout.x, bout.y);
    break;
  }
  ctx.stroke();
  return bout;
}

/**
 * L'ÉCRAN COUPÉ EN QUATRE, et les fils qui y mènent.
 *
 * LES FILS SUIVENT LES CADRES. Ils montaient en courbe à travers les cases,
 * chacun sur sa diagonale, et ça passait par-dessus les scènes sans rien dire.
 * Maintenant ils remontent la gouttière centrale, prennent le bras horizontal
 * de la croix, et ne quittent le cadre qu'au dernier moment, d'un seul trait
 * perpendiculaire, pour tomber sur la lumière qu'ils vont allumer.
 *
 * C'est le fil que Falot laisse derrière lui en jouant : la seule chose du jeu
 * qui dise « quelqu'un est passé par là ».
 */
function dessinerQuatre(ecran: Ecran, k: number, enRoute: boolean, temps: number): void {
  const { ctx, W, H } = ecran;
  const cw = W / 2;
  const ch = H / 2;
  const cases: [number, number][] = [
    [0, 0],
    [cw, 0],
    [0, ch],
    [cw, ch],
  ];
  // le chemin de chacune : la gouttière verticale, le bras de la croix, la
  // descente (ou la montée) dans la case
  const chemins = cases.map(([cx, cy], i): Etape[] => {
    const bx = cx + cw * FEU[i][0];
    const by = cy + ch * FEU[i][1];
    return [
      { x: cw, y: H + 24 },
      { x: cw, y: ch },
      { x: bx, y: ch },
      { x: bx, y: by },
    ];
  });
  // Elles partent l'une après l'autre : quatre fils qui montent ensemble font
  // un bouquet, quatre qui se suivent font un convoi — et c'en est un.
  const avance = (i: number) => (enRoute ? clamp((k - i * 0.1) / 0.62, 0, 1) : 1);
  const allume = (i: number) => (enRoute ? clamp((avance(i) - 0.86) / 0.14, 0, 1) : 1);

  for (let i = 0; i < 4; i++) {
    const [cx, cy] = cases[i];
    ctx.save();
    ctx.beginPath();
    ctx.rect(cx, cy, cw, ch);
    ctx.clip();
    ctx.fillStyle = '#08080e';
    ctx.fillRect(cx, cy, cw, ch);
    // Chaque scène prend TOUTE sa case : une marge laissait les fonds (la
    // mer, le trottoir) s'arrêter net au milieu du noir, et ça se voyait.
    if (i === 0) veilleuse(ecran, cx, cy, cw, ch, allume(i));
    else if (i === 1) bougie(ecran, cx, cy, cw, ch, allume(i));
    else if (i === 2) lampadaire(ecran, cx, cy, cw, ch, allume(i), temps);
    else phare(ecran, cx, cy, cw, ch, allume(i), temps);
    ctx.restore();
  }

  // la croix noire qui sépare les quatre : c'est elle qui fait le quadriptyque
  ctx.fillStyle = '#08080e';
  ctx.fillRect(cw - 3, 0, 6, H);
  ctx.fillRect(0, ch - 3, W, 6);

  // les fils par-dessus, et la lumière qui glisse dessus
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (let i = 0; i < 4; i++) {
    const t = avance(i);
    if (t <= 0.001) continue;
    // une fois posée, la lumière n'a plus de fil : il s'efface derrière elle
    const reste = enRoute ? 1 : 0;
    if (reste > 0) {
      ctx.strokeStyle = `rgba(${VERT},0.3)`;
      ctx.lineWidth = 1.5;
    } else {
      ctx.strokeStyle = 'rgba(0,0,0,0)';
      ctx.lineWidth = 0;
    }
    const bout = tracerChemin(ecran, chemins[i], t);
    if (t < 1) lumiere(ecran, bout.x, bout.y, 3.6);
  }
}

/**
 * L'ERRANCE — il cherche la sienne, et il n'y en a pas.
 *
 * Il sort sur un monde DÉJÀ ALLUMÉ : des fenêtres, un réverbère, une bougie,
 * un phare au loin. Il va vers l'une, puis une autre, puis une troisième, et
 * chaque fois il tend un fil — et chaque fois il donne un peu de ce qu'il
 * avait gardé, qui entre dans la lampe et n'en ressort pas. Elles ont déjà
 * quelqu'un ; elles n'ont pas besoin de lui.
 *
 * Pendant ce temps les fenêtres s'éteignent une à une. Le monde ne s'éteint
 * pas à cause de lui : il va se coucher, c'est tout, et c'est bien pire.
 *
 * À la fin il vire au ROUGE. Une lumière restée éteinte trop longtemps finit
 * par devenir un Guet — c'est écrit dans la bible, et c'est ce qui le guette
 * là, à deux doigts. Il se secoue la tête, il redevient bleu, ça recommence,
 * il se secoue encore. Il gagne. Et, épuisé d'avoir gagné, il tombe dans le
 * trou par lequel il était monté.
 *
 * C'est la scène qui remplace le cadre où il n'entrait pas : elle n'a aucune
 * règle à faire comprendre, elle se regarde.
 */

/** Le rouge d'un Guet, en composantes : c'est vers LUI qu'il glisse, et c'est
 *  exactement le même que celui du jeu — sinon la menace ne se reconnaît pas. */
const ROUGE = [255, 122, 107] as const;

/** Largeur du monde d'en haut, en écrans. */
const MONDE = 3.4;

/**
 * UN FOYER : une lumière qui appartient déjà à quelqu'un.
 * `wx` est sa place dans le monde (0 à 1), `y` sa hauteur à l'écran, et
 * `mort` le moment où l'on s'y couche.
 */
const FOYERS = [
  { wx: 0.06, y: 0.36, r: 26, genre: 'fenetre', mort: 0.52 },
  { wx: 0.13, y: 0.52, r: 22, genre: 'fenetre', mort: 0.3 },
  { wx: 0.22, y: 0.3, r: 30, genre: 'bougie', mort: 0.86 },
  { wx: 0.3, y: 0.44, r: 34, genre: 'fenetre', mort: 0.74 }, // la première qu'il tente
  { wx: 0.38, y: 0.6, r: 24, genre: 'fenetre', mort: 0.4 },
  { wx: 0.46, y: 0.26, r: 26, genre: 'fenetre', mort: 0.62 },
  { wx: 0.56, y: 0.5, r: 40, genre: 'lampadaire', mort: 0.9 }, // la deuxième
  { wx: 0.64, y: 0.34, r: 24, genre: 'fenetre', mort: 0.47 },
  { wx: 0.72, y: 0.56, r: 22, genre: 'fenetre', mort: 0.58 },
  { wx: 0.82, y: 0.38, r: 32, genre: 'bougie', mort: 0.93 }, // la troisième
  { wx: 0.9, y: 0.6, r: 24, genre: 'fenetre', mort: 0.66 },
  { wx: 0.97, y: 0.28, r: 30, genre: 'phare', mort: 0.97 },
] as const;

/** Les trois qu'il tente, et quand. */
const TENTATIVES = [
  { foyer: 3, debut: 0.12, fin: 0.26 },
  { foyer: 6, debut: 0.36, fin: 0.5 },
  { foyer: 9, debut: 0.58, fin: 0.72 },
] as const;

/**
 * Sa place dans le monde, de 0 à 1 : il avance, il s'arrête devant une
 * lumière, il repart. Sans les plateaux, il glisse devant elles sans avoir
 * l'air de rien tenter.
 */
function errer(k: number): number {
  const etapes: [number, number, number, number][] = [
    [0, 0.12, 0, 0.3],
    [0.12, 0.26, 0.3, 0.3],
    [0.26, 0.36, 0.3, 0.56],
    [0.36, 0.5, 0.56, 0.56],
    [0.5, 0.58, 0.56, 0.82],
    [0.58, 0.72, 0.82, 0.82],
    [0.72, 0.84, 0.82, 1],
  ];
  for (const [k0, k1, p0, p1] of etapes) {
    if (k > k1) continue;
    const u = clamp((k - k0) / (k1 - k0), 0, 1);
    return p0 + (p1 - p0) * (u * u * (3 - 2 * u)); // adouci aux deux bouts
  }
  return 1;
}

/**
 * Ce qu'il lui reste, de 1 à 0,2 : il en laisse un tiers à chaque tentative.
 *
 * Il ne descend PAS à zéro ici. Vidé pour de bon, il n'est plus qu'un contour,
 * et un contour n'a pas de couleur à virer au rouge — on ne verrait rien du
 * moment qui compte. Le vrai vide vient après, et il a sa propre courbe.
 */
function reste(k: number): number {
  let perdu = 0;
  for (const t of TENTATIVES) perdu += clamp((k - t.debut) / (t.fin - t.debut), 0, 1);
  return 0.2 + 0.8 * clamp(1 - perdu / 3, 0, 1);
}

/** Le vide, pour de bon : il n'est plus qu'un contour, et il tombe. */
const vide = (k: number) => clamp((k - 0.93) / 0.07, 0, 1);

/**
 * Le rouge qui monte, et les deux fois où il se secoue la tête.
 *
 * Il ne bascule jamais vraiment : il monte à un cheveu, se secoue, redescend,
 * remonte plus haut, se secoue encore, et gagne. C'est ce qu'il reste de lui à
 * la fin — pas de la lumière, une décision.
 */
function bascule(k: number): number {
  if (k < 0.72 || k > 0.93) return 0;
  // il monte lentement, il se secoue, ça retombe d'un coup
  const a = clamp((k - 0.72) / 0.05, 0, 1) - clamp((k - 0.77) / 0.015, 0, 1);
  const b = clamp((k - 0.82) / 0.06, 0, 1) - clamp((k - 0.88) / 0.015, 0, 1);
  return clamp(Math.max(a * 0.72, b), 0, 1);
}

/** LA VILLE. Des blocs, et rien d'autre : ce sont les fenêtres allumées qui
 *  la racontent, et il faut qu'elles tiennent DANS les immeubles — au-dessus,
 *  elles flottaient dans le ciel et la ville n'était qu'une frise en bas. */
function toits(ecran: Ecran, cam: number, nuit: number): void {
  const { ctx, W, H } = ecran;
  const sol = H * 0.82;
  const large = W * MONDE;
  const bw = large / 52;
  for (let i = -2; i < 56; i++) {
    const bx = i * bw - cam;
    if (bx > W + bw || bx < -bw * 2) continue;
    // deux rangs : un fond plus bas et plus sombre, une avant-scène plus haute
    const h1 = H * (0.22 + ((((i * 37) % 13) + 13) % 13) / 42);
    ctx.fillStyle = '#0a0a11';
    ctx.fillRect(bx, sol - h1, bw + 1, h1 + H);
    if (i % 2 === 0) {
      const h2 = H * (0.14 + ((((i * 53) % 9) + 9) % 9) / 40);
      ctx.fillStyle = '#0d0d15';
      ctx.fillRect(bx - bw * 0.3, sol - h2, bw * 1.6, h2 + H);
    }
  }
  ctx.strokeStyle = `rgba(255,255,255,${0.05 * (1 - nuit)})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, sol);
  ctx.lineTo(W, sol);
  ctx.stroke();
}

/** Une lumière qui a déjà quelqu'un. */
function foyer(
  ecran: Ecran,
  x: number,
  y: number,
  r: number,
  genre: string,
  vif: number,
): void {
  const { ctx } = ecran;
  if (vif <= 0.01) return;
  halo(ecran, x, y, r * 3.4, OR, 0.34 * vif);
  ctx.fillStyle = `rgba(${OR},${0.85 * vif})`;
  if (genre === 'fenetre') {
    ctx.fillRect(x - r * 0.34, y - r * 0.4, r * 0.68, r * 0.8);
  } else if (genre === 'bougie') {
    ctx.beginPath();
    ctx.arc(x, y, r * 0.2, 0, TAU);
    ctx.fill();
  } else if (genre === 'lampadaire') {
    ctx.fillRect(x - r * 0.24, y - r * 0.24, r * 0.48, r * 0.34);
    ctx.fillStyle = `rgba(${OR},${0.22 * vif})`;
    ctx.fillRect(x - r * 0.05, y, r * 0.1, r * 2.4);
  } else {
    ctx.beginPath();
    ctx.arc(x, y, r * 0.26, 0, TAU);
    ctx.fill();
    ctx.fillStyle = `rgba(${OR},${0.16 * vif})`; // son balayage, au loin
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, r * 8, Math.PI * 0.86, Math.PI * 0.98);
    ctx.closePath();
    ctx.fill();
  }
}

function dessinerErrance(ecran: Ecran, k: number, temps: number): void {
  const { ctx, W, H } = ecran;
  const cam = errer(k) * (MONDE - 1) * W;
  const nuit = clamp(k / 0.95, 0, 1);
  const force = reste(k);
  const rouge = bascule(k);

  ctx.fillStyle = '#08080e';
  ctx.fillRect(0, 0, W, H);
  toits(ecran, cam, nuit);

  // LUI. Il reste à sa place dans le cadre, c'est le monde qui défile — sinon
  // on le perd de vue à chaque arrêt, et c'est lui qu'on regarde.
  //
  // IL DESCEND, tout du long : à mesure qu'il se vide il tient moins haut, et
  // à la fin il est au ras du trou. La chute n'arrive donc pas d'un coup, on
  // la voit venir pendant quatorze secondes.
  const creux = vide(k);
  const fx = W * 0.44;
  const troux = W * 0.44;
  const trouy = H * 0.79;
  const fy =
    H * (0.38 + (1 - force) * 0.22) +
    Math.sin(temps * 0.9) * H * 0.02 * force +
    (trouy - H * 0.58) * creux * creux;

  // LE TROU par lequel il est sorti, et par lequel il va repartir. Il apparaît
  // bien avant la fin : on doit le voir l'attendre.
  const ouvert = clamp((k - 0.62) / 0.16, 0, 1);
  if (ouvert > 0.01) {
    ctx.fillStyle = `rgba(0,0,0,${0.9 * ouvert})`;
    ctx.beginPath();
    ctx.ellipse(troux, trouy, D.taille * 2.4 * ouvert, D.taille * 0.8 * ouvert, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = `rgba(143,208,255,${0.14 * ouvert})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  for (let i = 0; i < FOYERS.length; i++) {
    const f = FOYERS[i];
    const x = f.wx * MONDE * W - cam;
    if (x < -160 || x > W + 160) continue;
    foyer(ecran, x, f.y * H, f.r, f.genre, clamp((f.mort - k) / 0.05, 0, 1));
  }

  // LES TENTATIVES : un fil qui se tend, et ce qu'il y laisse. Ce sont des
  // grains de SA lumière qui partent vers la lampe et n'en reviennent pas.
  for (const t of TENTATIVES) {
    const u = clamp((k - t.debut) / (t.fin - t.debut), 0, 1);
    if (u <= 0 || u >= 1) continue;
    const f = FOYERS[t.foyer];
    const cx = f.wx * MONDE * W - cam;
    const cy = f.y * H;
    const vu = Math.sin(u * Math.PI); // il se tend, puis il lâche
    ctx.strokeStyle = `rgba(${VERT},${0.34 * vu})`;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.lineTo(cx, cy);
    ctx.stroke();
    for (let g = 0; g < 7; g++) {
      const p = (u * 1.6 + g / 7) % 1;
      lumiere(ecran, fx + (cx - fx) * p, fy + (cy - fy) * p, 2.4, (1 - p) * vu);
    }
  }

  // Sa couleur : bleue, sauf quand ça remonte. Il ne bascule jamais vraiment.
  const bleu = [143, 208, 255] as const;
  const melange = bleu.map((v, i) => Math.round(v + (ROUGE[i] - v) * rouge));
  const teint = `rgb(${melange[0]},${melange[1]},${melange[2]})`;
  // l'aura de ce qui lui reste, et le sursaut quand il se secoue
  halo(
    ecran,
    fx,
    fy,
    D.taille * (2.2 + force * 2.6),
    melange.join(','),
    0.1 + 0.16 * force,
  );
  corps.x = fx;
  corps.y = fy;
  corps.sx = 1;
  corps.sy = 1;
  corps.regard = 0;
  // IL SE SECOUE LA TÊTE. C'est ça qui le ramène au bleu, et c'est la seule
  // chose qu'il fasse de toute la scène qui ne soit pas subie.
  corps.tremble = rouge > 0.35 ? 1 : 0;
  dessinerOmbre(ecran, corps, D.taille, 0.3 * force);
  dessinerTete(
    ecran,
    corps,
    teint,
    D.taille,
    creux < 0.5, // vidé pour de bon : plus que le contour
    1 - creux * 0.35,
    rouge > 0.35 ? 'acharne' : force < 0.4 ? 'peur' : 'inquiet',
    temps,
    1,
  );
  corps.tremble = 0;
}

export function dessinerFin(ecran: Ecran, partie: Partie, temps: number): void {
  const fin = partie.fin;
  if (!fin) return;
  const { ctx, W, H } = ecran;
  const { etape, k } = tempsFin(fin.t);

  // La caméra du jeu n'a plus de sens ici : la scène se dessine en
  // coordonnées d'écran, et `dessinerTete` lit `cam`. Sans cette remise à
  // zéro, Falot se dessinait quelque part hors champ, dans l'étage d'avant.
  ecran.cam.x = 0;
  ecran.cam.y = 0;
  ctx.fillStyle = '#08080e';
  ctx.fillRect(0, 0, W, H);
  const haut = Math.min(H * 0.16, 96);

  // --- 1. L'ESCORTE : la dernière fois qu'il fait ce qu'il sait faire ---
  if (etape === 'escorte') {
    // Combien il en a remontées. Au moins trois, sinon le convoi ne raconte
    // rien ; jamais plus que ce que la colonne peut montrer.
    const remontees = partie.montee.reduce((a, m) => a + m.lumieres, 0);
    const combien = clamp(Math.max(3, remontees), 3, 7);
    const monte = k * k * 0.5 + k * 0.5; // il accélère un peu vers la sortie
    const fyF = H * 0.88 - monte * H * 0.58;
    // les parois du puits, qui s'écartent à mesure qu'on approche du dehors
    const large = Math.min(W * 0.3, CASE * 2.6) * (1 + monte * 2.4);
    ctx.fillStyle = '#12121a';
    ctx.fillRect(0, 0, Math.max(0, W / 2 - large), H);
    ctx.fillRect(Math.min(W, W / 2 + large), 0, W, H);
    // LES PALIERS QUI DÉFILENT. Sans eux on ne monte pas : deux murs qui
    // s'écartent dans du noir, ça ne bouge pas, ça grandit.
    ctx.strokeStyle = 'rgba(255,255,255,0.075)';
    ctx.lineWidth = 2;
    const ecartE = 150;
    const defileE = (monte * H * 0.58) % ecartE;
    ctx.beginPath();
    for (let i = -1; i < H / ecartE + 2; i++) {
      const y = i * ecartE + defileE;
      ctx.moveTo(Math.max(0, W / 2 - large), y);
      ctx.lineTo(W / 2 - D.taille * 1.4, y);
      ctx.moveTo(W / 2 + D.taille * 1.4, y);
      ctx.lineTo(Math.min(W, W / 2 + large), y);
    }
    ctx.stroke();
    // le fil qu'il laisse derrière lui, celui du jeu
    ctx.strokeStyle = `rgba(${VERT},0.16)`;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(W / 2, fyF);
    ctx.lineTo(W / 2, H + 20);
    ctx.stroke();
    // elles le suivent en file, chacune avec son retard : c'est le convoi du
    // jeu, à la verticale, et c'est la dernière fois qu'on le voit
    for (let i = combien; i >= 1; i--) {
      const ky = clamp(k - i * 0.05, 0, 1);
      const y = H * 0.88 - (ky * ky * 0.5 + ky * 0.5) * H * 0.58;
      const balance = Math.sin(temps * 2 + i) * (W * 0.04);
      lumiere(ecran, W / 2 + balance, y + i * 44, 3.6);
    }
    corps.x = W / 2;
    corps.y = fyF;
    corps.sx = 1;
    corps.sy = 1;
    corps.regard = -Math.PI / 2;
    dessinerTete(ecran, corps, BLEU, D.taille, true, 1, 'apaise', temps, 1);
    phrase(ecran, FIN.escorte, haut, k);
    return;
  }

  // --- 2 et 3. LE FIL, PUIS LES QUATRE ---
  if (etape === 'fil' || etape === 'quatre') {
    dessinerQuatre(ecran, k, etape === 'fil', temps);
    if (etape === 'quatre') phrase(ecran, FIN.quatre, haut, clamp((k - 0.45) / 0.55, 0, 1));
    return;
  }

  // --- 4. L'ERRANCE ---
  if (etape === 'errance') {
    dessinerErrance(ecran, k, temps);
    // Une phrase par temps fort, jamais deux à la fois, et jamais avant
    // l'image : chacune tombe sur ce qu'on vient de voir.
    if (k < 0.22) phrase(ecran, FIN.cherche, haut, clamp(k / 0.22, 0, 1));
    else if (k > 0.42 && k < 0.62) phrase(ecran, FIN.prises, haut, (k - 0.42) / 0.2);
    else if (k > 0.72) phrase(ecran, FIN.vide, haut, clamp((k - 0.72) / 0.28, 0, 1));
    return;
  }

  // --- 5. LA CHUTE : il n'y a plus de dehors, il n'y a que le puits ---
  const chute = k * k; // elle accélère
  const fy = H * 0.3 + chute * H * 0.5;
  // IL TOMBE VIDE, ET IL SE RALLUME EN TOMBANT. Il est arrivé au trou réduit à
  // un contour ; à mi-chute la petite lumière revient. Ce n'est pas une
  // consolation — c'est la raison pour laquelle il recommence : en bas, il en
  // reste à remonter, et lui, il tient encore.
  const reprend = clamp((chute - 0.45) / 0.3, 0, 1);
  ctx.strokeStyle = 'rgba(255,255,255,0.09)';
  ctx.lineWidth = 2;
  const large = Math.min(W * 0.34, CASE * 2.2);
  ctx.fillStyle = '#12121a';
  ctx.fillRect(0, 0, W / 2 - large, H);
  ctx.fillRect(W / 2 + large, 0, W, H);
  // les paliers défilent vers le haut, de plus en plus vite
  const ecart = 160;
  const defile = (chute * 2600) % ecart;
  ctx.beginPath();
  for (let i = -1; i < H / ecart + 2; i++) {
    const y = i * ecart - defile;
    ctx.moveTo(W / 2 - large, y);
    ctx.lineTo(W / 2 - D.taille * 1.3, y);
    ctx.moveTo(W / 2 + D.taille * 1.3, y);
    ctx.lineTo(W / 2 + large, y);
  }
  ctx.stroke();
  // CE QU'IL A LAISSÉ EN MONTANT. À chaque palier, les petites lumières qu'il
  // y a rallumées ; elles défilent à l'envers pendant qu'il retombe. C'est
  // tout le tunnel qu'il vient de faire, repris en cinq secondes — et c'est la
  // seule chose de cette fin qui lui reste vraiment.
  for (let i = -1; i < H / ecart + 2; i++) {
    const y = i * ecart - defile;
    for (let g = 0; g < 3; g++) {
      const lx = W / 2 - large + 14 + g * 13 + ((i * 7 + g) % 3) * 9;
      lumiere(ecran, lx, y - 9, 2.2, 0.5 * (1 - chute * 0.7));
      lumiere(ecran, W - lx, y - 9, 2.2, 0.5 * (1 - chute * 0.7));
    }
  }
  // et tout en haut, le trou par lequel il était sorti, qui s'éloigne
  const carre = Math.max(0, 30 * (1 - chute * 1.4));
  if (carre > 1) {
    const wy = H * 0.12 - chute * H * 0.26;
    halo(ecran, W / 2, wy, carre * 4, OR, 0.26 * (1 - chute));
    ctx.fillStyle = `rgba(${OR},${0.34 * (1 - chute)})`;
    ctx.beginPath();
    ctx.ellipse(W / 2, wy, carre, carre * 0.42, 0, 0, TAU);
    ctx.fill();
  }
  // Ce qui lui reste de lumière le suit avec du retard : des filets, pas des
  // boules — une traîne ronde se lit comme une chenille.
  for (let i = 1; i < 12; i++) {
    const ty = fy - i * 22 * (0.5 + chute);
    ctx.fillStyle = `rgba(143,208,255,${0.2 * (1 - i / 12) * reprend})`;
    ctx.fillRect(W / 2 - 1.2, ty, 2.4, 10 + 14 * chute);
  }
  corps.x = W / 2;
  corps.y = fy;
  corps.sx = 0.86;
  corps.sy = 1.16; // étiré par la chute
  corps.regard = -Math.PI / 2;
  dessinerTete(ecran, corps, BLEU, D.taille, reprend > 0.5, 1, 'inquiet', temps, 1);
  phrase(ecran, FIN.chute, haut, clamp((k - 0.25) / 0.7, 0, 1));
  // le noir se referme à la toute fin
  if (k > 0.82) {
    ctx.fillStyle = `rgba(8,8,14,${(k - 0.82) / 0.18})`;
    ctx.fillRect(0, 0, W, H);
  }
}
