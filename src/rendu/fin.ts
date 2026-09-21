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
import { FOYER, HAUT, LARGE, masque, pluie, quatre, VOLUME } from './quatre.js';
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

/** Où brûle la lumière de chaque case, en fraction de la case : le fil de la
 *  lumière s'y rend. On le DÉDUIT du pixel où la scène a peint sa source —
 *  écrit deux fois, ça dérivait dès qu'on déplaçait un lit. */
const FEU = FOYER.map(([x, y]) => [x / LARGE, y / HAUT] as const);

/** Le petit canevas où l'on découpe la scène allumée. Il fait la taille d'une
 *  scène — 96 × 80 pixels — donc le découpage coûte huit mille pixels par
 *  case et par image : rien du tout. */
let decoupe: CanvasRenderingContext2D | null = null;
function ciseaux(): CanvasRenderingContext2D {
  if (decoupe) return decoupe;
  const t = document.createElement('canvas');
  t.width = LARGE;
  t.height = HAUT;
  const c = t.getContext('2d');
  if (!c) throw new Error('Pas de contexte 2D pour les scènes de la fin.');
  decoupe = c;
  return c;
}

/**
 * UNE SCÈNE, ÉTEINTE PUIS RÉVÉLÉE.
 *
 * On pose d'abord la scène telle qu'elle est dans le noir — on devine un lit,
 * une table, un mât, et rien de plus. Puis on DÉCOUPE la même scène allumée
 * dans la forme de sa lumière et on la pose par-dessus. Ce n'est pas un fondu :
 * à mi-chemin, le coin du lit est encore bleu nuit pendant que la table de
 * chevet est déjà chaude. C'est la lumière qui avance, pas le contraste.
 *
 * L'agrandissement est au PLUS PROCHE VOISIN et le cadrage est un « cover » à
 * échelle uniforme : les pixels restent carrés quelle que soit la fenêtre.
 * Étirer pour remplir aurait donné des pixels rectangulaires, ce qui n'est
 * plus du pixel art, c'est une image déformée.
 */
function dessinerScene(
  ecran: Ecran,
  i: number,
  cx: number,
  cy: number,
  cw: number,
  ch: number,
  k: number,
  temps: number,
): void {
  const { ctx } = ecran;
  const q = quatre();
  const e = Math.max(cw / LARGE, ch / HAUT);
  const ox = Math.round(cx + (cw - LARGE * e) / 2);
  const oy = Math.round(cy + (ch - HAUT * e) / 2);
  const lisse = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(q.nuit[i], ox, oy, LARGE * e, HAUT * e);
  if (k > 0.004) {
    const c = ciseaux();
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalCompositeOperation = 'source-over';
    c.clearRect(0, 0, LARGE, HAUT);
    masque(i, c, k, temps); // la forme de la lumière, et elle seule
    c.globalCompositeOperation = 'source-in'; // la scène allumée, dedans
    c.drawImage(q.jour[i], 0, 0);
    c.globalCompositeOperation = 'source-over';
    ctx.drawImage(c.canvas, ox, oy, LARGE * e, HAUT * e);
  }
  // LA PLUIE tombe par-dessus, et hors du masque : il pleut aussi là où le
  // lampadaire n'éclaire pas, et c'est même tout l'intérêt.
  if (i === 2) pluie(ctx, ox, oy, e, temps, k);
  ctx.imageSmoothingEnabled = lisse;
  // LE VOLUME DE LUMIÈRE, pour les deux scènes qui en ont un. Le masque ne
  // révèle que ce qui est peint, et au large il n'y a rien à peindre : sans
  // ce coin jaune, le phare n'envoyait rien à personne. Il est lisse, et
  // c'est voulu — c'est de la lumière, pas de la matière, et seule la matière
  // est en pixels.
  const v = VOLUME[i];
  if (v && k > 0.01) {
    const [vx, vy, ang, portee, ouv] = v;
    const balaye = i === 3 ? Math.sin(temps * 0.8) * 0.26 : 0;
    cone(
      ecran,
      ox + vx * e,
      oy + vy * e,
      ang + balaye,
      portee * e * k,
      ouv * 2,
      OR,
      0.7 * k,
    );
  }
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
    const kk = allume(i);
    dessinerScene(ecran, i, cx, cy, cw, ch, kk, temps);
    // LA FLORAISON, par-dessus les pixels : une ampoule qui vient de
    // s'allumer déborde d'elle-même. Elle est lisse, et c'est voulu — c'est
    // de la lumière, pas de la matière, et la matière seule est en pixels.
    if (kk > 0.01)
      halo(ecran, cx + cw * FEU[i][0], cy + ch * FEU[i][1], cw * 0.26, OR, 0.5 * kk);
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

/** Le sol de là-haut : le haut du trottoir. Tout s'y accroche. */
const SOL = 0.8;

/**
 * Un pseudo-hasard stable : la ville doit être la même à chaque fois. Un
 * `Math.random()` ici et les immeubles clignoteraient d'une image à l'autre.
 */
function graine(i: number): number {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * LES TROIS LUMIÈRES QU'IL TENTE. `wx` est leur place dans le monde (0 à 1),
 * `y` leur hauteur à l'écran, et `mort` le moment où l'on s'y couche. Ce sont
 * les seules posées à la main : tout le reste de la ville est tiré de `graine`.
 */
const FOYERS = [
  { wx: 0.3, y: 0.52, r: 46, genre: 'fenetre', mort: 0.74 },
  { wx: 0.56, y: 0.6, r: 40, genre: 'lampadaire', mort: 0.9 },
  { wx: 0.82, y: 0.56, r: 42, genre: 'bougie', mort: 0.93 },
] as const;

/** Les trois qu'il tente, et quand. */
const TENTATIVES = [
  { foyer: 0, debut: 0.12, fin: 0.26 },
  { foyer: 1, debut: 0.36, fin: 0.5 },
  { foyer: 2, debut: 0.58, fin: 0.72 },
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

/**
 * LE CIEL. C'est lui, et lui seul, qui dit qu'on est SORTI.
 *
 * Le premier jet de cette scène se jouait sur le noir du jeu : on se croyait
 * encore dans les Dessous, et tout le propos tombait à l'eau. Les Dessous
 * n'ont pas de ciel — donc là-haut il en faut un, visible, avec des étoiles et
 * une lune. Il fonce à mesure que la nuit avance, sans jamais redevenir noir.
 */
function ciel(ecran: Ecran, cam: number, nuit: number): void {
  const { ctx, W, H } = ecran;
  const sol = H * SOL;
  const g = ctx.createLinearGradient(0, 0, 0, sol);
  const f = 1 - nuit * 0.55; // il se referme, il ne s'éteint pas
  g.addColorStop(
    0,
    `rgb(${Math.round(15 * f)},${Math.round(19 * f)},${Math.round(44 * f)})`,
  );
  g.addColorStop(
    0.62,
    `rgb(${Math.round(28 * f)},${Math.round(31 * f)},${Math.round(60 * f)})`,
  );
  g.addColorStop(
    1,
    `rgb(${Math.round(52 * f)},${Math.round(42 * f)},${Math.round(62 * f)})`,
  );
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, sol);
  // les étoiles : très loin, donc presque immobiles
  for (let i = 0; i < 90; i++) {
    const sx = (graine(i) * W * MONDE - cam * 0.08) % (W * 1.2);
    const sy = graine(i + 500) * sol * 0.62;
    const a = (0.1 + graine(i + 900) * 0.4) * (0.5 + nuit * 0.5);
    ctx.fillStyle = `rgba(226,232,255,${a})`;
    ctx.fillRect(sx, sy, 1.6, 1.6);
  }
  // la lune, très haut à droite, et sa lueur froide
  const lx = W * 0.82 - cam * 0.04;
  const ly = sol * 0.16;
  halo(ecran, lx, ly, 120, '198,214,255', 0.12);
  ctx.fillStyle = 'rgba(232,238,255,0.72)';
  ctx.beginPath();
  ctx.arc(lx, ly, 17, 0, TAU);
  ctx.fill();
  ctx.fillStyle = `rgb(${Math.round(18 * f)},${Math.round(22 * f)},${Math.round(48 * f)})`;
  ctx.beginPath(); // sa part d'ombre : un croissant, pas un disque
  ctx.arc(lx + 7, ly - 4, 16, 0, TAU);
  ctx.fill();
}

/** LA VILLE DU FOND : une silhouette, plus claire que le premier plan parce
 *  qu'elle baigne dans le ciel. C'est elle qui donne la profondeur. */
function fond(ecran: Ecran, cam: number, nuit: number): void {
  const { ctx, W, H } = ecran;
  const sol = H * SOL;
  const pas = (W * MONDE) / 60;
  ctx.fillStyle = `rgba(26,30,56,${0.85 - nuit * 0.25})`;
  for (let i = -2; i < 70; i++) {
    const bx = i * pas - cam * 0.35;
    if (bx > W + pas || bx < -pas * 2) continue;
    const bh = H * (0.1 + graine(i + 40) * 0.16);
    ctx.fillRect(bx, sol - H * 0.12 - bh, pas + 1, bh + H * 0.12);
  }
  // quelques fenêtres minuscules, là-bas : la ville continue sans lui
  for (let i = -2; i < 70; i += 3) {
    const bx = i * pas - cam * 0.35;
    if (bx > W || bx < -pas) continue;
    if (graine(i + 77) > 0.55 - nuit * 0.35) continue;
    ctx.fillStyle = `rgba(255,214,140,${0.3 * (1 - nuit)})`;
    ctx.fillRect(bx + pas * 0.3, sol - H * 0.16 - graine(i + 11) * H * 0.1, 2, 2.5);
  }
  // LE PHARE, tout au bout : la seule lumière qui ne s'éteindra pas
  const px = W * MONDE * 0.97 - cam * 0.35;
  if (px > -200 && px < W + 200) {
    const py = sol - H * 0.3;
    ctx.fillStyle = 'rgba(20,24,44,0.95)';
    ctx.beginPath();
    ctx.moveTo(px - 5, py);
    ctx.lineTo(px + 5, py);
    ctx.lineTo(px + 12, sol);
    ctx.lineTo(px - 12, sol);
    ctx.closePath();
    ctx.fill();
    halo(ecran, px, py, 70, OR, 0.5);
    ctx.fillStyle = `rgba(${OR},0.9)`;
    ctx.fillRect(px - 4, py - 6, 8, 10);
  }
}

/**
 * LES IMMEUBLES DU PREMIER PLAN, et leurs fenêtres.
 *
 * Une fenêtre éteinte est dessinée elle aussi, un ton au-dessus de la façade :
 * sans la grille, une fenêtre allumée flotte dans le noir et on ne comprend
 * pas qu'il y a une maison derrière, ni que les autres viennent de s'éteindre.
 */
function immeubles(ecran: Ecran, cam: number, nuit: number): void {
  const { ctx, W, H } = ecran;
  const sol = H * SOL;
  const pas = (W * MONDE) / 26;
  for (let i = -1; i < 30; i++) {
    const bx = i * pas - cam;
    const bw = pas * (0.78 + graine(i) * 0.26);
    if (bx > W + pas || bx + bw < -pas) continue;
    const bh = H * (0.26 + graine(i + 100) * 0.3);
    const haut = sol - bh;
    ctx.fillStyle = `rgb(${Math.round(17 - nuit * 5)},${Math.round(19 - nuit * 6)},${Math.round(34 - nuit * 10)})`;
    ctx.fillRect(bx, haut, bw, bh);
    // la corniche, un ton plus clair : c'est elle qui détache les toits
    ctx.fillStyle = `rgba(52,58,92,${0.45 * (1 - nuit)})`;
    ctx.fillRect(bx - 2, haut - 3, bw + 4, 3);
    // la grille des fenêtres
    const cols = Math.max(2, Math.round(bw / (H * 0.055)));
    const rangs = Math.max(2, Math.round(bh / (H * 0.075)));
    const fw = bw / cols;
    const fh = bh / rangs;
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rangs; r++) {
        const fx = bx + c * fw + fw * 0.26;
        const fy = haut + r * fh + fh * 0.26;
        const lw = fw * 0.46;
        const lh = fh * 0.44;
        const cle = i * 131 + c * 17 + r * 7;
        const allumee = graine(cle) < 0.44;
        const mort = 0.18 + graine(cle + 3000) * 0.78;
        const vif = allumee ? clamp((mort - nuit) / 0.05, 0, 1) : 0;
        if (vif > 0.02) {
          halo(ecran, fx + lw / 2, fy + lh / 2, lw * 2.4, OR, 0.15 * vif);
          // toutes n'ont pas la même lampe : un aplat uniforme fait un damier
          ctx.fillStyle = `rgba(${OR},${(0.52 + graine(cle + 60) * 0.34) * vif})`;
        } else {
          ctx.fillStyle = 'rgba(38,42,66,0.5)'; // éteinte, mais toujours là
        }
        ctx.fillRect(fx, fy, lw, lh);
      }
    }
  }
}

/** LA RUE : un trottoir, une bordure, la chaussée. Trois bandes, et on sait
 *  qu'on marche dessus — c'est tout ce qu'on lui demande. */
function rue(ecran: Ecran, cam: number, nuit: number): void {
  const { ctx, W, H } = ecran;
  const sol = H * SOL;
  ctx.fillStyle = `rgb(${Math.round(24 - nuit * 8)},${Math.round(25 - nuit * 8)},${Math.round(38 - nuit * 12)})`;
  ctx.fillRect(0, sol, W, H - sol);
  ctx.fillStyle = `rgba(66,72,104,${0.45 - nuit * 0.2})`;
  ctx.fillRect(0, sol, W, 2.5); // le nez du trottoir
  const bord = sol + H * 0.055;
  ctx.fillStyle = `rgb(${Math.round(15 - nuit * 5)},${Math.round(16 - nuit * 5)},${Math.round(26 - nuit * 8)})`;
  ctx.fillRect(0, bord, W, H - bord); // la chaussée, plus sombre
  ctx.fillStyle = `rgba(120,130,170,${0.16 - nuit * 0.08})`;
  const pas = W * 0.09;
  for (let i = -1; i < W / pas + 2; i++) {
    const dx = i * pas - (cam % pas);
    ctx.fillRect(dx, bord + H * 0.07, pas * 0.4, 2); // la ligne discontinue
  }
}

/** Un réverbère : un mât, une potence, une lampe, et sa flaque au sol. */
function reverbere(ecran: Ecran, x: number, vif: number): void {
  const { ctx, H } = ecran;
  const sol = H * SOL;
  const ty = sol - H * 0.2;
  ctx.fillStyle = 'rgba(30,34,56,0.95)';
  ctx.fillRect(x - 2, ty, 4, sol - ty);
  ctx.fillRect(x - 12, ty - 3, 16, 4);
  if (vif > 0.02) {
    cone(ecran, x - 6, ty + 2, Math.PI / 2, H * 0.28, 0.75, OR, 0.3 * vif);
    halo(ecran, x - 6, ty, 40, OR, 0.45 * vif);
    ctx.save(); // la flaque sur le trottoir, écrasée
    ctx.translate(x - 6, sol + H * 0.012);
    ctx.scale(1, 0.2);
    halo(ecran, 0, 0, H * 0.12, OR, 0.5 * vif);
    ctx.restore();
  }
  ctx.fillStyle = `rgba(${OR},${0.25 + 0.7 * vif})`;
  ctx.fillRect(x - 10, ty - 1, 8, 6);
}

/** Une des trois lumières qu'il tente : plus grosse et plus chaude que le
 *  reste de la ville, sinon on ne voit pas vers quoi il va. */
function foyer(
  ecran: Ecran,
  x: number,
  y: number,
  r: number,
  genre: string,
  vif: number,
): void {
  const { ctx, H } = ecran;
  if (vif <= 0.01) return;
  if (genre === 'lampadaire') {
    reverbere(ecran, x + 6, vif);
    return;
  }
  halo(ecran, x, y, r * 4.2, OR, 0.55 * vif);
  if (genre === 'fenetre') {
    // une grande baie, avec sa croisée : on doit la distinguer des autres
    ctx.fillStyle = `rgba(${OR},${0.85 * vif})`;
    ctx.fillRect(x - r * 0.5, y - r * 0.62, r, r * 1.24);
    ctx.fillStyle = 'rgba(26,28,48,0.75)';
    ctx.fillRect(x - 1, y - r * 0.62, 2, r * 1.24);
    ctx.fillRect(x - r * 0.5, y - 1, r, 2);
  } else {
    // une bougie derrière un carreau, et la petite flamme dedans
    ctx.fillStyle = `rgba(${OR},${0.4 * vif})`;
    ctx.fillRect(x - r * 0.42, y - r * 0.5, r * 0.84, r);
    ctx.fillStyle = `rgba(255,236,196,${0.95 * vif})`;
    ctx.beginPath();
    ctx.arc(x, y + r * 0.1, r * 0.13, 0, TAU);
    ctx.fill();
    ctx.fillStyle = `rgba(${OR},${0.7 * vif})`;
    ctx.fillRect(x - r * 0.05, y + r * 0.18, r * 0.1, r * 0.3);
  }
  ctx.globalAlpha = 1;
  void H;
}

function dessinerErrance(ecran: Ecran, k: number, temps: number): void {
  const { ctx, W, H } = ecran;
  const cam = errer(k) * (MONDE - 1) * W;
  const nuit = clamp(k / 0.95, 0, 1);
  const force = reste(k);
  const rouge = bascule(k);
  const sol = H * SOL;

  ciel(ecran, cam, nuit);
  fond(ecran, cam, nuit);
  immeubles(ecran, cam, nuit);
  rue(ecran, cam, nuit);
  // les réverbères de la rue, un sur quatre immeubles, qui s'éteignent tard
  const pasR = (W * MONDE) / 7;
  for (let i = -1; i < 9; i++) {
    const rx = i * pasR + pasR * 0.4 - cam;
    if (rx < -60 || rx > W + 60) continue;
    reverbere(ecran, rx, clamp((0.88 + graine(i + 7) * 0.12 - nuit) / 0.06, 0, 1));
  }

  // LUI. Il reste à sa place dans le cadre, c'est le monde qui défile — sinon
  // on le perd de vue à chaque arrêt, et c'est lui qu'on regarde.
  //
  // IL DESCEND, tout du long : à mesure qu'il se vide il tient moins haut, et
  // à la fin il est au ras du trou. La chute n'arrive donc pas d'un coup, on
  // la voit venir pendant quatorze secondes.
  const creux = vide(k);
  const fx = W * 0.44;
  const troux = W * 0.44;
  const trouy = sol + H * 0.028;
  const fy =
    H * (0.36 + (1 - force) * 0.24) +
    Math.sin(temps * 0.9) * H * 0.02 * force +
    (trouy - H * 0.6) * creux * creux;

  // LE TROU par lequel il est sorti : une bouche ouverte dans le trottoir. Il
  // apparaît bien avant la fin, on doit le voir l'attendre.
  const ouvert = clamp((k - 0.62) / 0.16, 0, 1);
  if (ouvert > 0.01) {
    ctx.fillStyle = `rgba(0,0,0,${0.92 * ouvert})`;
    ctx.beginPath();
    ctx.ellipse(troux, trouy, D.taille * 2.4 * ouvert, D.taille * 0.8 * ouvert, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = `rgba(120,130,170,${0.3 * ouvert})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  for (let i = 0; i < FOYERS.length; i++) {
    const f = FOYERS[i];
    const x = f.wx * MONDE * W - cam;
    if (x < -200 || x > W + 200) continue;
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
  // Son halo est plus fort que celui d'une fenêtre : au milieu d'une ville
  // allumée, un petit bleu discret se noie dans le doré et on le perd.
  halo(
    ecran,
    fx,
    fy,
    D.taille * (2.6 + force * 3.2),
    melange.join(','),
    0.16 + 0.24 * force,
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
