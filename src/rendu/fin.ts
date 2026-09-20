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
import { dessinerTete } from './visages.js';

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

/** Le gris d'une silhouette, du presque noir au tiède selon ce qui l'éclaire. */
const teinte = (k: number) =>
  `rgb(${Math.round(22 + k * 122)},${Math.round(22 + k * 100)},${Math.round(28 + k * 74)})`;

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
  const lit = y + h * 0.52; // le haut du matelas
  const sol = y + h * 0.76;
  const lx = x + w * 0.77;
  const ly = lit - h * 0.1;
  halo(ecran, lx, ly, w * 0.6, OR, 0.5 * k);
  // IL EST ASSIS, et il vient de l'allumer. Couché, il fallait trois formes
  // pour dire « une tête sur un oreiller » et ça se lisait comme un tas ;
  // assis, une silhouette suffit — et surtout c'est ce qu'il fait : il a eu
  // peur, il a tendu la main, il a allumé.
  ctx.fillStyle = teinte(k * 0.45);
  ctx.beginPath();
  ctx.roundRect(x + w * 0.1, lit, w * 0.52, sol - lit, h * 0.025);
  ctx.fill();
  silhouette(ecran, x + w * 0.38, lit + h * 0.02, h * 0.2, k);
  ctx.fillStyle = teinte(k * 0.72); // la couette, tirée jusqu'à lui
  ctx.beginPath();
  ctx.roundRect(x + w * 0.3, lit - h * 0.035, w * 0.34, h * 0.075, h * 0.03);
  ctx.fill();
  // la table de chevet, à portée de main, et la veilleuse posée dessus
  ctx.fillStyle = teinte(k * 0.4);
  ctx.fillRect(x + w * 0.71, lit - h * 0.02, w * 0.12, sol - lit + h * 0.02);
  ctx.fillStyle = `rgba(${OR},${0.2 + 0.8 * k})`;
  ctx.beginPath();
  ctx.roundRect(lx - w * 0.032, ly - h * 0.045, w * 0.064, h * 0.09, h * 0.028);
  ctx.fill();
}

/** 2. UN COUPLE ALLUME UNE BOUGIE. Deux silhouettes qui se font face, et la
 *  lumière exactement entre elles : c'est tout le sujet du plan. */
function bougie(ecran: Ecran, x: number, y: number, w: number, h: number, k: number): void {
  const { ctx } = ecran;
  const sol = y + h * 0.8;
  const cx = x + w * 0.5;
  const table = sol - h * 0.18;
  const fy = table - h * 0.2;
  halo(ecran, cx, fy, w * 0.66, OR, 0.52 * k);
  silhouette(ecran, x + w * 0.22, table + h * 0.03, h * 0.34, k);
  silhouette(ecran, x + w * 0.78, table + h * 0.03, h * 0.34, k);
  // la table par-dessus : elle les coupe à mi-corps, et ils sont attablés
  ctx.fillStyle = teinte(k * 0.55);
  ctx.beginPath();
  ctx.roundRect(x + w * 0.14, table, w * 0.72, h * 0.06, h * 0.02);
  ctx.fill();
  // la bougie, un trait et une flamme
  ctx.fillStyle = teinte(0.5 + k * 0.5);
  ctx.fillRect(cx - w * 0.012, fy, w * 0.024, h * 0.2);
  ctx.fillStyle = `rgba(255,236,196,${0.25 + 0.75 * k})`;
  ctx.beginPath();
  ctx.arc(cx, fy - h * 0.012, h * 0.026, 0, TAU);
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
  const px = x + w * 0.64;
  const py = y + h * 0.16;
  cone(ecran, px, py + h * 0.03, Math.PI / 2, h * 0.72, 0.85, OR, 0.95 * k);
  halo(ecran, px, py, w * 0.3, OR, 0.6 * k);
  // le mât et sa potence
  ctx.fillStyle = teinte(k * 0.45);
  ctx.fillRect(px - w * 0.014, py, w * 0.028, sol - py);
  ctx.fillRect(px - w * 0.08, py - h * 0.02, w * 0.096, h * 0.026);
  ctx.fillStyle = `rgba(${OR},${0.18 + 0.82 * k})`;
  ctx.fillRect(px - w * 0.05, py + h * 0.004, w * 0.04, h * 0.022);
  // la pluie : des traits, jamais des gouttes — une goutte ronde se lit comme
  // une lumière, et il y en a déjà partout
  ctx.strokeStyle = `rgba(190,206,230,${0.1 + 0.18 * k})`;
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
  ctx.fillStyle = '#0d0d14';
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
  const tx = x + w * 0.19;
  const ty = y + h * 0.1;
  const roche = horizon + h * 0.06; // le rocher est DANS l'eau, pas devant
  // LE CIEL ET LA MER. Deux dégradés, jamais deux rectangles : un aplat qui
  // s'arrête à l'horizontale se lit comme un carton posé sur l'image, et on
  // voyait son coin. C'est la ligne d'horizon, et elle seule, qui fait la mer.
  // LE CIEL N'EST PAS PEINT. Un aplat bleu, même très sombre, faisait de la
  // case entière un rectangle de couleur posé à côté de trois cases noires —
  // et c'est la case qu'on regardait, pas ce qu'il y avait dedans. La nuit du
  // large, c'est du noir : une ligne d'horizon et trois reflets suffisent.
  ctx.strokeStyle = `rgba(150,180,220,${0.07 + 0.08 * k})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, horizon);
  ctx.lineTo(x + w, horizon);
  ctx.stroke();
  // les reflets couchés : c'est ça qui fait de l'eau, pas la couleur
  ctx.strokeStyle = `rgba(150,180,220,${0.05 + 0.07 * k})`;
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
  ctx.fillStyle = `rgba(${OR},${0.2 + 0.8 * k})`;
  ctx.fillRect(tx - w * 0.016, ty - h * 0.022, w * 0.032, h * 0.04);
  // le bateau : une coque, un feu, et un cap qui se redresse quand il a vu
  const vu = clamp(k * 1.2 - 0.3, 0, 1);
  const bx = x + w * (0.74 + vu * 0.06);
  const by = horizon + h * 0.1 - vu * h * 0.035;
  ctx.save();
  ctx.translate(bx, by);
  ctx.rotate(0.24 * (1 - vu)); // il gîtait vers la côte ; il se redresse
  ctx.fillStyle = teinte(0.2 + k * 0.45);
  ctx.beginPath();
  ctx.roundRect(-w * 0.05, -h * 0.011, w * 0.1, h * 0.024, h * 0.011);
  ctx.fill();
  ctx.fillStyle = `rgba(${OR},${0.45 + 0.45 * vu})`;
  ctx.beginPath();
  ctx.arc(0, -h * 0.028, h * 0.01, 0, TAU);
  ctx.fill();
  ctx.restore();
}

/**
 * L'ÉCRAN COUPÉ EN QUATRE, et le fil qui y mène.
 *
 * Le fil est exactement celui que Falot laisse derrière lui en jouant : c'est
 * la seule chose du jeu qui dise « quelqu'un est passé par là », et c'est par
 * là qu'elles s'en vont.
 */
function dessinerQuatre(ecran: Ecran, k: number, filSeul: boolean, temps: number): void {
  const { ctx, W, H } = ecran;
  const cw = W / 2;
  const ch = H / 2;
  const cases: [number, number][] = [
    [0, 0],
    [cw, 0],
    [0, ch],
    [cw, ch],
  ];
  // Le fil part d'en bas — des Dessous — et se sépare en quatre.
  const depart = { x: W / 2, y: H + 20 };
  const buts = cases.map(([cx, cy]) => ({ x: cx + cw / 2, y: cy + ch / 2 }));

  for (let i = 0; i < 4; i++) {
    const [cx, cy] = cases[i];
    ctx.save();
    ctx.beginPath();
    ctx.rect(cx, cy, cw, ch);
    ctx.clip();
    ctx.fillStyle = '#08080e';
    ctx.fillRect(cx, cy, cw, ch);
    // chacune s'allume à son tour, et aucune ne s'éteint ensuite
    const allume = filSeul ? 0 : clamp((k - 0.06 - i * 0.14) / 0.3, 0, 1);
    // Chaque scène prend TOUTE sa case : une marge laissait les fonds (la
    // mer, le trottoir) s'arrêter net au milieu du noir, et ça se voyait.
    if (i === 0) veilleuse(ecran, cx, cy, cw, ch, allume);
    else if (i === 1) bougie(ecran, cx, cy, cw, ch, allume);
    else if (i === 2) lampadaire(ecran, cx, cy, cw, ch, allume, temps);
    else phare(ecran, cx, cy, cw, ch, allume, temps);
    ctx.restore();
  }

  // la croix noire qui sépare les quatre : c'est elle qui fait le quadriptyque
  ctx.fillStyle = '#08080e';
  ctx.fillRect(cw - 3, 0, 6, H);
  ctx.fillRect(0, ch - 3, W, 6);

  // les quatre fils, par-dessus les cases, et la lumière qui glisse dessus
  for (let i = 0; i < 4; i++) {
    const but = buts[i];
    const avance = filSeul
      ? clamp((k - i * 0.05) / 0.62, 0, 1)
      : clamp(1 - (k - 0.06 - i * 0.14) / 0.3, 0, 1);
    if (avance <= 0.01) continue;
    const mx = (depart.x + but.x) / 2 + (i % 2 === 0 ? -W * 0.1 : W * 0.1);
    const my = (depart.y + but.y) / 2;
    ctx.strokeStyle = `rgba(${VERT},${0.34 * (filSeul ? 1 : avance)})`;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(depart.x, depart.y);
    ctx.quadraticCurveTo(mx, my, but.x, but.y);
    ctx.stroke();
    // sa position sur la courbe, à la main : une Bézier de degré deux
    const t = filSeul ? avance : 1 - avance;
    const u = 1 - t;
    const px = u * u * depart.x + 2 * u * t * mx + t * t * but.x;
    const py = u * u * depart.y + 2 * u * t * my + t * t * but.y;
    lumiere(ecran, px, py, 3.4, filSeul ? 1 : avance);
  }
}

/**
 * LA SIENNE.
 *
 * Elle est là, derrière une vitre, et il ne peut pas la rejoindre. Pas parce
 * qu'on l'en empêche, pas parce qu'elle l'aurait oublié : parce qu'il EST la
 * lumière, et qu'une lumière se tient toujours à l'autre bout de son faisceau.
 * Plus il avance, plus le cône se raccourcit et plus la pièce s'éteint ;
 * collé à la vitre, il n'éclaire plus rien et elle n'est plus là non plus.
 *
 * Alors il recule, la fenêtre se rallume, et il tient la distance. C'est la
 * seule chose qu'il puisse faire pour elle, et il la fait.
 */
function dessinerLaSienne(ecran: Ecran, k: number, temps: number): void {
  const { ctx, W, H } = ecran;
  const fx = W * 0.68; // la fenêtre
  const fy = H * 0.42;
  const fw = Math.min(W * 0.26, 190);
  const fh = fw * 0.82;

  // Sa trajectoire, en quatre gestes : il monte, il s'approche, il touche la
  // vitre, il recule et il reste. `colle` = 1 quand il est contre le carreau.
  const monte = clamp(k / 0.14, 0, 1);
  const colle = clamp((k - 0.16) / 0.3, 0, 1) - clamp((k - 0.52) / 0.2, 0, 1);
  const lx = fx - (W * 0.3 - W * 0.26 * colle);
  const ly = fy + H * 0.1 - H * 0.1 * monte + H * 0.5 * (1 - monte);

  ctx.fillStyle = '#08080e';
  ctx.fillRect(0, 0, W, H);

  // LE MUR. Il n'est visible que par ce qu'elle éclaire : c'est la fenêtre qui
  // fait la maison, et pas l'inverse.
  const clarte = (1 - colle) * monte;
  halo(ecran, fx, fy, fw * 3.4, OR, 0.16 * clarte);
  // Il monte du bas du cadre jusqu'en haut : un rectangle qui s'arrête en
  // l'air se lit comme un panneau posé là, pas comme la façade d'une maison.
  // Son bord gauche se perd dans le noir, sinon c'est une porte de placard.
  const g = Math.round(11 + clarte * 15);
  const mur = ctx.createLinearGradient(W * 0.3, 0, W * 0.62, 0);
  mur.addColorStop(0, 'rgba(8,8,14,0)');
  mur.addColorStop(1, `rgb(${g},${g - 1},${g + 6})`);
  ctx.fillStyle = mur;
  ctx.fillRect(W * 0.3, 0, W * 0.7, H);

  // LE CÔNE qu'il envoie : il raccourcit exactement comme il s'approche, et
  // c'est toute la scène — la lumière, c'est la distance.
  const dx = fx - lx;
  const dy = fy - ly;
  cone(
    ecran,
    lx,
    ly,
    Math.atan2(dy, dx),
    Math.hypot(dx, dy) * 1.12,
    0.62,
    OR,
    0.9 * clarte,
  );

  // LA FENÊTRE, et elle dedans. Le carreau garde toujours un fond : une vitre
  // parfaitement noire se lit comme un trou dans le mur.
  ctx.fillStyle = `rgba(${OR},${0.04 + 0.4 * clarte})`;
  ctx.beginPath();
  ctx.roundRect(fx - fw / 2, fy - fh / 2, fw, fh, 6);
  ctx.fill();
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(fx - fw / 2, fy - fh / 2, fw, fh, 6);
  ctx.clip();
  // le carreau est plus chaud en son milieu : un aplat uniforme ne s'allume
  // pas, il change de couleur
  halo(ecran, fx, fy, fw * 0.8, OR, 0.55 * clarte);
  // ELLE EST À CONTRE-JOUR. Éclairée, elle se confondait avec sa vitre ; il
  // faut qu'elle soit SOMBRE sur le carreau clair — c'est comme ça qu'on voit
  // quelqu'un chez lui depuis la rue, et c'est le seul plan où on la voit.
  const tourne = clamp((k - 0.78) / 0.18, 0, 1);
  silhouette(
    ecran,
    fx - fw * 0.1 + fw * 0.06 * tourne,
    fy + fh * 0.62,
    fh * 0.9,
    clarte * 0.18,
  );
  ctx.restore();
  ctx.strokeStyle = `rgba(${OR},${0.1 + 0.3 * clarte})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(fx - fw / 2, fy - fh / 2, fw, fh, 6);
  ctx.moveTo(fx, fy - fh / 2);
  ctx.lineTo(fx, fy + fh / 2);
  ctx.stroke();

  // LUI. Bleu, toujours : ce qu'il donne est doré, ce qu'il est ne l'a jamais
  // été. Collé à la vitre il ne reste plus que lui de visible — c'est le
  // moment où la scène dit tout sans une phrase.
  corps.x = lx;
  corps.y = ly;
  corps.sx = 1;
  corps.sy = 1;
  corps.regard = Math.atan2(dy, dx);
  dessinerTete(
    ecran,
    corps,
    BLEU,
    D.taille * 0.72,
    true,
    monte,
    colle > 0.7 ? 'inquiet' : colle > 0.2 ? 'intrigue' : 'apaise',
    temps,
    1,
  );
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

  // --- 4. LA SIENNE ---
  if (etape === 'sienne') {
    dessinerLaSienne(ecran, k, temps);
    if (k < 0.5) phrase(ecran, FIN.sienne, haut, clamp(k / 0.5, 0, 1));
    else phrase(ecran, FIN.loin, haut, clamp((k - 0.52) / 0.48, 0, 1));
    return;
  }

  // --- 5. LA CHUTE : il n'y a plus de dehors, il n'y a que le puits ---
  const chute = k * k; // elle accélère
  const fy = H * 0.3 + chute * H * 0.5;
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
  // SA FENÊTRE RESTE ALLUMÉE, tout en haut, et s'éloigne avec le reste. C'est
  // la dernière chose qu'on voit de là-haut, et ce n'est pas un échec : elle
  // est allumée PARCE QU'il est reparti.
  const carre = Math.max(0, 26 * (1 - chute * 1.4));
  if (carre > 1) {
    const wy = H * 0.14 - chute * H * 0.24;
    halo(ecran, W / 2, wy, carre * 5, OR, 0.34 * (1 - chute));
    ctx.fillStyle = `rgba(${OR},${0.5 * (1 - chute)})`;
    ctx.fillRect(W / 2 - carre / 2, wy - carre / 2, carre, carre);
  }
  // Ce qui lui reste de lumière le suit avec du retard : des filets, pas des
  // boules — une traîne ronde se lit comme une chenille.
  for (let i = 1; i < 12; i++) {
    const ty = fy - i * 22 * (0.5 + chute);
    ctx.fillStyle = `rgba(143,208,255,${0.2 * (1 - i / 12)})`;
    ctx.fillRect(W / 2 - 1.2, ty, 2.4, 10 + 14 * chute);
  }
  corps.x = W / 2;
  corps.y = fy;
  corps.sx = 0.86;
  corps.sy = 1.16; // étiré par la chute
  corps.regard = -Math.PI / 2;
  dessinerTete(ecran, corps, BLEU, D.taille, true, 1, 'inquiet', temps, 1);
  phrase(ecran, FIN.chute, haut, clamp((k - 0.25) / 0.7, 0, 1));
  // le noir se referme à la toute fin
  if (k > 0.82) {
    ctx.fillStyle = `rgba(8,8,14,${(k - 0.82) / 0.18})`;
    ctx.fillRect(0, 0, W, H);
  }
}
