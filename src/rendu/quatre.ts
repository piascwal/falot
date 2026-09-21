/**
 * LES QUATRE SCÈNES DE LA FIN, en pixel art.
 *
 * Une veilleuse, une bougie, un lampadaire, un phare. Chacune est dessinée une
 * seule fois au chargement dans un canevas de 96 × 80 PIXELS, qu'on agrandit
 * ensuite au plus proche voisin : les pixels restent carrés et nets, comme le
 * tileset des souterrains. Tout est donc en coordonnées entières — un rect à
 * 0,5 pixel redevient du flou, et le flou est exactement ce qu'on ne veut pas.
 *
 * CHAQUE SCÈNE EXISTE EN DEUX EXEMPLAIRES : éteinte et allumée. Ce n'est pas
 * la même image plus ou moins transparente — une chambre dans le noir n'est
 * pas une chambre jaune atténuée, c'est une chambre bleue. La lumière ne
 * s'ajoute pas par-dessus : elle RÉVÈLE la seconde à travers la première, dans
 * la forme que lui donne sa source (voir `dessinerQuatre`). C'est la même
 * grammaire que le reste du jeu, et c'est pour ça qu'on la reconnaît.
 */

/** La grille d'une case. Assez grosse pour un lit à barreaux, assez petite
 *  pour que le pixel se voie : c'est ce qui en fait du pixel art et pas un
 *  dessin qu'on aurait pixelisé. */
export const LARGE = 80;
export const HAUT = 96;

/** Où brûle la lumière de chaque scène, en pixels de la grille. Une seule
 *  source de vérité : la scène la dessine là, et le fil de la lumière s'y
 *  rend. Les deux se déduisaient de nombres écrits deux fois, et ça dérivait
 *  dès qu'on déplaçait un lit. */
export const FOYER: readonly (readonly [number, number])[] = [
  [64, 51], // l'ampoule de la veilleuse
  [40, 42], // la flamme de la bougie
  [39, 23], // le verre du lampadaire
  [31, 15], // la lanterne du phare
];

/**
 * LE VOLUME DE LUMIÈRE — le grand coin jaune d'un phare, la colonne d'un
 * lampadaire. Ce n'est pas ce que la lumière RÉVÈLE, c'est la lumière
 * elle-même, celle qu'on voit dans l'air parce qu'il y a de la pluie ou des
 * embruns dedans. Sans elle, le phare n'envoyait rien : le masque ne révèle
 * que ce qui est peint, et au large il n'y a rien à peindre.
 *
 * Les deux autres scènes n'en ont pas : une bougie dans une salle à manger ne
 * fait pas de rayon, elle fait une bulle — et la bulle, c'est le masque.
 */
export const VOLUME: readonly (readonly [number, number, number, number, number] | null)[] =
  [
    null,
    null,
    [39, 26, Math.PI / 2, 54, 0.56], // x, y, angle, portée, demi-ouverture
    [34, 15, 0, 76, 0.24],
  ];

/**
 * CE QUE CHAQUE SOURCE ÉCLAIRE, dessiné en pixels de la grille.
 *
 * Ce n'est pas un réglage, c'est une FORME : une veilleuse fait une bulle
 * autour d'elle, un lampadaire fait une colonne qui tombe sur le trottoir, un
 * phare fait un trait vers le large. La scène allumée n'apparaît que là-dedans
 * — c'est la grammaire du jeu, la même qu'en bas, et c'est pour ça qu'on la
 * reconnaît sans qu'on ait à l'expliquer.
 *
 * `k` va de 0 (rien n'est arrivé) à 1 (c'est allumé). On dessine des formes
 * qui s'UNISSENT : le masque se compose en `source-over`, et c'est seulement
 * après qu'on y découpe l'image allumée.
 */
function bulle(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  ray: number,
  ex: number,
  ey: number,
): void {
  if (ray < 0.5) return;
  c.save();
  c.translate(x, y);
  c.scale(ex, ey);
  const g = c.createRadialGradient(0, 0, 0, 0, 0, ray);
  g.addColorStop(0, 'rgba(0,0,0,1)');
  g.addColorStop(0.55, 'rgba(0,0,0,0.96)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = g;
  c.beginPath();
  c.arc(0, 0, ray, 0, Math.PI * 2);
  c.fill();
  c.restore();
}

function faisceau(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  portee: number,
  ouverture: number,
): void {
  if (portee < 1) return;
  const g = c.createRadialGradient(x, y, 0, x, y, portee);
  g.addColorStop(0, 'rgba(0,0,0,1)');
  g.addColorStop(0.6, 'rgba(0,0,0,0.9)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = g;
  c.beginPath();
  c.moveTo(x, y);
  c.arc(x, y, portee, angle - ouverture, angle + ouverture);
  c.closePath();
  c.fill();
}

export function masque(
  i: number,
  c: CanvasRenderingContext2D,
  k: number,
  temps: number,
): void {
  if (i === 0) bulle(c, 64, 51, 66 * k, 1, 0.88);
  else if (i === 1) {
    // une flamme n'est jamais stable : elle respire, à peine
    const vacille = 1 + Math.sin(temps * 6.1) * 0.03 + Math.sin(temps * 2.3) * 0.02;
    bulle(c, 40, 42, 62 * k * vacille, 1, 0.94);
  } else if (i === 2) {
    // le verre, puis la colonne qui tombe : un lampadaire n'éclaire pas
    // derrière lui, il éclaire SOUS lui
    bulle(c, 39, 22, 22 * k, 1, 1);
    faisceau(c, 39, 26, Math.PI / 2, 60 * k, 0.58);
  } else {
    // la tour et son rocher, puis le trait vers le large. LE BALAYAGE reste
    // près de l'horizontale : c'est là qu'il y a quelqu'un, et un phare qui
    // éclaire le ciel n'a jamais sauvé personne.
    bulle(c, 31, 38, 46 * k, 1, 1);
    faisceau(c, 34, 15, Math.sin(temps * 0.8) * 0.26, 80 * k, 0.24);
  }
}

/**
 * LA PLUIE, qui tombe donc qui ne peut pas être peinte dans l'image.
 *
 * Des traits, jamais des gouttes — une goutte ronde se lit comme une lumière,
 * et il y en a déjà partout. Elle se dessine PAR-DESSUS la scène et hors du
 * masque : il pleut aussi là où le lampadaire n'éclaire pas, c'est même tout
 * l'intérêt. Les coordonnées sont celles de la grille et on arrondit après
 * l'agrandissement, sinon les traits retombent entre deux pixels.
 */
export function pluie(
  c: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  e: number,
  temps: number,
  k: number,
): void {
  const p = Math.max(1, Math.round(e));
  for (let i = 0; i < 80; i++) {
    const gx = (i * 37) % LARGE;
    const gy = ((i * 53) % HAUT) + ((temps * 52) % HAUT);
    const y = gy % HAUT;
    if (y > 76) continue; // elle s'écrase sur le trottoir
    // plus visible dans la colonne de lumière, comme dehors
    const dedans = Math.abs(gx - 39) < 18 && y > 28 ? 0.6 : 0.22;
    c.fillStyle = `rgba(166,182,208,${dedans * (0.35 + 0.65 * k)})`;
    c.fillRect(Math.round(ox + gx * e), Math.round(oy + y * e), p, p * 3);
  }
}

const PAL = {
  trait: '#171220', // le contour noir de tout
  mur: '#6f5c45',
  murO: '#54442f',
  sol: '#4d4030',
  boisF: '#43301f',
  boisM: '#6d4c31',
  boisC: '#946e47',
  drap: '#e2d5b6',
  drapO: '#b6a585',
  oreiller: '#efe6cd',
  chair: '#e5b98e',
  chairO: '#bf8f5d',
  cheveux: '#4b3324',
  chemise: '#d6ccb6',
  gilet: '#5b4633',
  robe: '#cfc2a6',
  pantalon: '#2f2b34',
  flamme: '#ffe9ae',
  verre: '#f6e0a6',
  blanc: '#f1e8d1',
  pierre: '#8c7c64',
  pierreO: '#69593f',
  roche: '#4a4239',
  rocheO: '#332e28',
  eau: '#2c3552',
  eauC: '#46557a',
  brique: '#8b6044',
  briqueO: '#6b4732',
  metal: '#3d3b46',
  metalC: '#605d6b',
  pluie: '#a6b6d0',
  pave: '#5e5447',
  paveO: '#463f35',
  ciel: '#141b30',
} as const;
type Couleur = keyof typeof PAL;

/**
 * LA NUIT D'UNE COULEUR. Une chambre éteinte n'est pas une chambre jaune
 * atténuée : tout glisse vers le même bleu très sombre, et il en reste juste
 * assez pour qu'on devine un lit. On garde un peu plus de ce qui est déjà
 * clair — sinon les draps et le plancher deviennent la même chose et la pièce
 * n'a plus de profondeur du tout.
 */
function eteindre(hex: string): string {
  const n = Number.parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const v = (n >> 8) & 255;
  const b = n & 255;
  const clair = (r + v + b) / 765; // 0 à 1
  const k = 0.1 + clair * 0.16;
  const m = (c: number, vers: number) => Math.round(c * k + vers * (1 - k));
  return `rgb(${m(r, 17)},${m(v, 23)},${m(b, 46)})`;
}

/** Le pinceau d'une scène : que des entiers, et une couleur du nuancier. */
interface Toile {
  c: CanvasRenderingContext2D;
  /** true quand on peint la version allumée. */
  jour: boolean;
}

function r(t: Toile, x: number, y: number, w: number, h: number, col: Couleur): void {
  t.c.fillStyle = t.jour ? PAL[col] : eteindre(PAL[col]);
  t.c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

/** Un cadre creux : quatre rectangles, jamais un `strokeRect` — un trait de
 *  contour tombe à cheval sur deux pixels et c'est fini, ce n'est plus net. */
function cadre(t: Toile, x: number, y: number, w: number, h: number, col: Couleur): void {
  r(t, x, y, w, 1, col);
  r(t, x, y + h - 1, w, 1, col);
  r(t, x, y, 1, h, col);
  r(t, x + w - 1, y, 1, h, col);
}

/** Un disque en pixels, par lignes : le seul moyen d'avoir un rond dont le
 *  bord est fait de marches et pas de gris. */
function rond(t: Toile, cx: number, cy: number, ray: number, col: Couleur): void {
  for (let dy = -ray; dy <= ray; dy++) {
    const dx = Math.floor(Math.sqrt(Math.max(0, ray * ray - dy * dy)));
    if (dx <= 0) continue;
    r(t, cx - dx, cy + dy, dx * 2 + 1, 1, col);
  }
}

/** Une demi-lune : la moitié haute d'un disque. Sert aux chapeaux, aux
 *  parapluies et aux coupoles. */
function dome(
  t: Toile,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  col: Couleur,
): void {
  for (let dy = 0; dy <= ry; dy++) {
    const dx = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy / ry) ** 2)));
    if (dx <= 0) continue;
    r(t, cx - dx, cy - dy, dx * 2 + 1, 1, col);
  }
}

/** Une tête de trois quarts, vue d'assez loin : des cheveux, un visage, et
 *  rien d'autre. Un œil dessiné à cette taille fait un masque. */
function tete(t: Toile, x: number, y: number, vers: number): void {
  r(t, x, y, 7, 8, 'chair');
  r(t, x - 1, y - 1, 9, 3, 'cheveux'); // la frange
  r(t, x - 1, y, 2, 4, 'cheveux');
  r(t, x + 6, y, 2, 4, 'cheveux');
  r(t, x + (vers > 0 ? 4 : 1), y + 3, 2, 1, 'trait'); // un œil, un seul
  r(t, x + (vers > 0 ? 4 : 1), y + 5, 2, 1, 'chairO'); // la bouche
  cadre(t, x - 1, y - 1, 9, 10, 'trait');
}

// ---------------------------------------------------------------------------
// 1. UN ENFANT ALLUME SA VEILLEUSE
//
// La plus petite lumière du jeu, et celle qui compte le plus : c'est
// littéralement ce que Falot était.
// ---------------------------------------------------------------------------
function chambre(t: Toile): void {
  const sol = 78;
  r(t, 0, 0, LARGE, HAUT, 'ciel');
  r(t, 0, 0, LARGE, sol, 'murO'); // le mur
  r(t, 0, sol, LARGE, HAUT - sol, 'sol'); // le plancher
  r(t, 0, sol, LARGE, 1, 'trait');
  for (let x = 6; x < LARGE; x += 13) r(t, x, sol + 1, 1, HAUT - sol - 1, 'boisF');

  // LA TABLE DE CHEVET, à droite, à portée de main depuis le lit.
  r(t, 52, 60, 24, 16, 'boisM');
  cadre(t, 52, 60, 24, 16, 'trait');
  r(t, 50, 57, 28, 4, 'boisC'); // le plateau, qui déborde
  cadre(t, 50, 57, 28, 4, 'trait');
  r(t, 55, 64, 18, 6, 'boisF'); // le tiroir
  cadre(t, 55, 64, 18, 6, 'trait');
  r(t, 62, 66, 5, 2, 'boisC'); // sa poignée
  r(t, 54, 76, 3, 6, 'boisF'); // les pieds
  r(t, 71, 76, 3, 6, 'boisF');

  // LA VEILLEUSE CHAMPIGNON. Un pied blanc, un chapeau, une étoile. C'est
  // l'objet du plan, donc c'est le seul qui a droit à un détail.
  r(t, 61, 49, 7, 8, 'blanc'); // le pied
  cadre(t, 60, 49, 9, 8, 'trait');
  dome(t, 64, 50, 11, 9, 'verre'); // le chapeau
  r(t, 53, 50, 23, 1, 'trait'); // son bord
  for (let i = 0; i <= 9; i++) {
    const dx = Math.round(11 * Math.sqrt(Math.max(0, 1 - (i / 9) ** 2)));
    r(t, 64 - dx, 50 - i, 1, 1, 'trait');
    r(t, 64 + dx, 50 - i, 1, 1, 'trait');
  }
  r(t, 63, 43, 3, 1, 'blanc'); // l'étoile sur le chapeau
  r(t, 62, 44, 5, 1, 'blanc');
  r(t, 63, 45, 3, 1, 'blanc');
  r(t, 62, 46, 2, 1, 'blanc');
  r(t, 66, 46, 2, 1, 'blanc');

  // LE LIT. Deux montants à pommeau, une tête à barreaux : sans les pommeaux
  // ça se lit comme une caisse.
  r(t, 3, 34, 5, 44, 'boisM');
  cadre(t, 3, 34, 5, 44, 'trait');
  rond(t, 5, 32, 3, 'boisC');
  cadre(t, 2, 29, 7, 6, 'trait');
  r(t, 38, 46, 5, 32, 'boisM'); // le montant du pied
  cadre(t, 38, 46, 5, 32, 'trait');
  rond(t, 40, 44, 3, 'boisC');
  // LA TÊTE DE LIT EST À LA TÊTE. Une traverse d'un montant à l'autre avec des
  // barreaux sur toute la longueur, ça ne fait pas un lit : ça fait une
  // barrière, et l'enfant a l'air enfermé dedans.
  r(t, 3, 37, 16, 3, 'boisC'); // la traverse de la tête
  cadre(t, 3, 37, 16, 3, 'trait');
  for (let x = 9; x < 18; x += 6) {
    r(t, x, 40, 2, 12, 'boisM'); // ses deux barreaux
    cadre(t, x - 1, 40, 4, 12, 'trait');
  }
  r(t, 33, 47, 10, 3, 'boisC'); // la traverse du pied, plus basse et pleine
  cadre(t, 33, 47, 10, 3, 'trait');

  r(t, 5, 52, 36, 4, 'boisF'); // le sommier
  r(t, 5, 55, 36, 14, 'drap'); // le matelas
  cadre(t, 5, 52, 36, 17, 'trait');
  r(t, 5, 61, 36, 8, 'drapO'); // la couverture, tirée sur les jambes
  r(t, 5, 61, 36, 1, 'trait');
  for (let x = 9; x < 40; x += 8) r(t, x, 63, 1, 5, 'boisF'); // ses plis

  // L'ENFANT EST ASSIS, contre la tête de lit, et il vient de tendre le bras.
  // Couché, il fallait trois formes pour dire « une tête sur un oreiller » et
  // ça se lisait comme un tas ; assis, une silhouette suffit — et surtout,
  // c'est ce qu'il fait : il a eu peur, il a tendu le bras, il a allumé.
  r(t, 7, 48, 14, 9, 'oreiller'); // l'oreiller, dressé derrière lui
  r(t, 8, 55, 12, 2, 'drapO'); // son creux, un seul trait
  cadre(t, 7, 48, 14, 9, 'trait');
  r(t, 20, 53, 11, 10, 'chemise'); // le buste
  cadre(t, 20, 53, 11, 10, 'trait');
  for (let y = 56; y < 62; y += 3) r(t, 21, y, 9, 1, 'drapO'); // son pyjama rayé
  // LE BRAS PART DE L'ÉPAULE. Détaché d'un pixel, il se lisait comme une
  // planche posée sur la couverture, et la main comme un objet en plus.
  r(t, 29, 56, 13, 4, 'chemise');
  cadre(t, 29, 56, 13, 4, 'trait');
  r(t, 41, 56, 5, 4, 'chair');
  cadre(t, 41, 56, 5, 4, 'trait');
  tete(t, 22, 44, 1); // la tête POSÉE sur les épaules, pas au-dessus
}

// ---------------------------------------------------------------------------
// 2. UN COUPLE ALLUME UNE BOUGIE
//
// Deux personnes qui se font FACE, de part et d'autre de la table, et la
// lumière exactement entre elles : c'est tout le sujet du plan.
// ---------------------------------------------------------------------------
function repas(t: Toile): void {
  const sol = 84;
  r(t, 0, 0, LARGE, HAUT, 'ciel');
  r(t, 0, 0, LARGE, sol, 'murO');
  r(t, 0, sol, LARGE, HAUT - sol, 'sol');
  r(t, 0, sol, LARGE, 1, 'trait');

  // LES DEUX CHAISES d'abord, elles sont derrière tout le reste — et DERRIÈRE
  // LES GENS, pas au bord du cadre. Rangées sur les côtés, elles faisaient
  // deux cages de but et on ne voyait plus sur quoi les deux étaient assis.
  for (const x of [7, 53] as const) {
    r(t, x, 24, 20, 4, 'boisM'); // le haut du dossier, qui dépasse d'eux
    cadre(t, x, 24, 20, 4, 'trait');
    r(t, x + 1, 28, 3, 34, 'boisM'); // ses deux montants
    r(t, x + 16, 28, 3, 34, 'boisM');
    cadre(t, x + 1, 28, 3, 34, 'trait');
    cadre(t, x + 16, 28, 3, 34, 'trait');
    r(t, x + 4, 32, 12, 2, 'boisF'); // une traverse
    r(t, x, 62, 20, 3, 'boisC'); // l'assise
    cadre(t, x, 62, 20, 3, 'trait');
    r(t, x + 1, 65, 3, 19, 'boisF'); // les pieds
    r(t, x + 16, 65, 3, 19, 'boisF');
  }

  // LES DEUX PERSONNES, dessinées AVANT le plateau : c'est l'ordre du tracé
  // qui fait qu'on est attablé. Au-dessus de la table, elles avaient l'air
  // posées DESSUS.
  r(t, 9, 40, 16, 24, 'gilet'); // lui : gilet sur chemise
  cadre(t, 9, 40, 16, 24, 'trait');
  r(t, 13, 40, 8, 14, 'chemise');
  r(t, 16, 40, 2, 12, 'gilet'); // le boutonnage
  r(t, 24, 47, 8, 4, 'chemise'); // son bras posé sur la table
  cadre(t, 24, 47, 8, 4, 'trait');
  r(t, 31, 47, 5, 4, 'chair');
  tete(t, 14, 30, 1);

  r(t, 55, 40, 16, 24, 'robe'); // elle
  cadre(t, 55, 40, 16, 24, 'trait');
  r(t, 58, 40, 10, 5, 'chemise'); // son col
  r(t, 48, 47, 8, 4, 'robe'); // son bras posé sur la table
  cadre(t, 48, 47, 8, 4, 'trait');
  r(t, 44, 47, 5, 4, 'chair');
  tete(t, 58, 30, -1);
  rond(t, 66, 29, 3, 'cheveux'); // son chignon
  r(t, 55, 28, 12, 2, 'cheveux');

  // LE PLATEAU par-dessus les deux, et ses pieds.
  r(t, 4, 53, 72, 5, 'boisC');
  cadre(t, 4, 53, 72, 5, 'trait');
  r(t, 4, 58, 72, 2, 'boisF');
  r(t, 12, 60, 4, 24, 'boisM');
  r(t, 64, 60, 4, 24, 'boisM');
  cadre(t, 12, 60, 4, 24, 'trait');
  cadre(t, 64, 60, 4, 24, 'trait');

  // LA BOUGIE, exactement entre eux, dans son bougeoir.
  r(t, 36, 50, 9, 3, 'metalC'); // le pied
  cadre(t, 36, 50, 9, 3, 'trait');
  r(t, 39, 48, 3, 2, 'metalC');
  r(t, 38, 43, 5, 6, 'blanc'); // la bougie
  cadre(t, 37, 43, 7, 6, 'trait');
  r(t, 40, 40, 1, 3, 'trait'); // la mèche
  dome(t, 40, 42, 3, 5, 'flamme'); // la flamme

  // Deux tasses, une de chaque côté : c'est ce qui fait un repas.
  for (const x of [25, 48] as const) {
    r(t, x, 49, 7, 4, 'blanc');
    cadre(t, x, 49, 7, 4, 'trait');
    r(t, x + 7, 50, 2, 2, 'blanc'); // l'anse
  }
}

// ---------------------------------------------------------------------------
// 3. UN LAMPADAIRE ALLUME UN PIÉTON SOUS LA PLUIE
//
// Personne ne lui a rien demandé et il ne saura jamais qu'il a été éclairé :
// c'est le plan qui dit que ça compte quand même.
// ---------------------------------------------------------------------------
function rue(t: Toile): void {
  const sol = 76;
  r(t, 0, 0, LARGE, HAUT, 'ciel');
  r(t, 0, sol, LARGE, HAUT - sol, 'pave'); // le trottoir
  r(t, 0, sol, LARGE, 1, 'trait');
  for (let y = sol + 4; y < HAUT; y += 5) {
    // les pavés : des joints décalés d'une rangée à l'autre
    r(t, 0, y, LARGE, 1, 'paveO');
    for (let x = y % 10 === 0 ? 0 : 5; x < LARGE; x += 10) r(t, x, y - 4, 1, 4, 'paveO');
  }

  // LE MÂT. Un fût, une base évasée, une tête ouvragée : un tube droit se lit
  // comme un poteau de chantier.
  r(t, 37, 28, 4, sol - 28, 'metal');
  cadre(t, 37, 28, 4, sol - 28, 'trait');
  r(t, 34, sol - 5, 10, 5, 'metal'); // la base
  cadre(t, 34, sol - 5, 10, 5, 'trait');
  r(t, 35, 50, 8, 2, 'metalC'); // une bague à mi-hauteur
  r(t, 33, 26, 12, 3, 'metal'); // la potence
  cadre(t, 33, 26, 12, 3, 'trait');

  // LA LANTERNE : quatre faces de verre, un chapeau, un épi.
  r(t, 33, 17, 12, 9, 'verre');
  cadre(t, 32, 17, 14, 9, 'trait');
  r(t, 38, 17, 2, 9, 'metal'); // le montant du vitrage
  dome(t, 39, 16, 8, 5, 'metal'); // le chapeau
  r(t, 31, 16, 17, 1, 'trait');
  r(t, 38, 8, 2, 4, 'metal'); // l'épi
  rond(t, 39, 7, 2, 'metalC');

  // LE PIÉTON ET SON PARAPLUIE, qui traversent la colonne de lumière.
  // SOUS la colonne — c'est ça, « le lampadaire l'allume » — mais À CÔTÉ du
  // mât : collé dessous, le parapluie passait derrière la lanterne et
  // disparaissait dans son halo.
  const px = 22;
  r(t, px, 58, 13, 18, 'boisM'); // le manteau
  cadre(t, px, 58, 13, 18, 'trait');
  r(t, px + 1, 62, 11, 1, 'boisF'); // sa ceinture haute
  r(t, px + 2, 76, 3, 5, 'pantalon'); // les jambes
  r(t, px + 8, 76, 3, 5, 'pantalon');
  r(t, px + 1, 80, 5, 2, 'trait'); // les chaussures
  r(t, px + 7, 80, 5, 2, 'trait');
  tete(t, px + 3, 49, 1);
  r(t, px + 10, 50, 2, 10, 'chair'); // le bras qui tient le manche
  // LE PARAPLUIE, JUSTE AU-DESSUS DE SA TÊTE. Posé dix pixels plus haut il
  // arrivait à hauteur de la lanterne et se perdait dans son halo : on voyait
  // un homme tête nue sous la pluie, ce qui est exactement le contraire.
  r(t, px + 10, 45, 2, 6, 'trait'); // le manche
  dome(t, px + 11, 46, 15, 10, 'metal'); // la toile, sombre à contre-jour
  for (let i = 0; i <= 10; i++) {
    const dx = Math.round(15 * Math.sqrt(Math.max(0, 1 - (i / 10) ** 2)));
    r(t, px + 11 - dx, 46 - i, 1, 1, 'trait');
    r(t, px + 11 + dx, 46 - i, 1, 1, 'trait');
  }
  r(t, px - 4, 46, 31, 1, 'trait'); // son bord
  for (const d of [-9, 0, 9]) r(t, px + 11 + d, 38, 1, 8, 'metalC'); // ses baleines
  r(t, px + 11, 34, 1, 4, 'trait'); // le bout
}

// ---------------------------------------------------------------------------
// 4. UN PHARE, ET AU LARGE UN BATEAU
//
// La seule des quatre où la lumière ne rencontrera jamais celui qu'elle sauve
// — et c'est exprès : c'est elle qui prépare la scène d'après.
// ---------------------------------------------------------------------------
function large(t: Toile): void {
  const mer = 58;
  r(t, 0, 0, LARGE, HAUT, 'ciel');
  r(t, 0, mer, LARGE, HAUT - mer, 'eau');
  r(t, 0, mer, LARGE, 1, 'eauC'); // l'horizon
  for (let i = 0; i < 30; i++) {
    // les reflets couchés : c'est ça qui fait de l'eau, pas la couleur
    const y = mer + 4 + ((i * 7) % 32);
    const x = (i * 29) % (LARGE - 12);
    r(t, x, y, 4 + ((i * 3) % 7), 1, 'eauC');
  }

  // LE ROCHER, en deux plans, le plus sombre devant : sans ça le phare a l'air
  // planté dans l'eau.
  // Une MASSE arrondie, cassée par deux ou trois ressauts. Un profil qui
  // monte et descend à chaque colonne faisait une rangée de sapins.
  for (let i = 0; i < 56; i++) {
    const u = (i - 28) / 28; // -1 au bord, 0 au milieu
    const h = Math.round(14 * (1 - u * u) + 2 * Math.sin(i * 0.9));
    if (h <= 0) continue;
    r(t, 1 + i, 58 - h, 1, h + 8, 'roche');
  }
  for (let i = 0; i < 30; i++) {
    const u = (i - 15) / 15;
    const h = Math.round(7 * (1 - u * u) + Math.sin(i * 1.3));
    if (h <= 0) continue;
    r(t, 12 + i, 64 - h, 1, h + 6, 'rocheO');
  }

  // LA TOUR, plus large en bas : une tour droite se lit comme une cheminée.
  // Les assises de brique sont à peine marquées — un damier franc faisait un
  // escalier en zigzag au lieu d'un mur.
  for (let y = 22; y < 58; y++) {
    const w = 9 + Math.round((y - 22) * 0.24);
    const g = 31 - (w >> 1);
    r(t, g, y, w, 1, 'brique');
    if (y % 5 === 0) r(t, g + 1, y, w - 2, 1, 'briqueO');
    r(t, g, y, 1, 1, 'trait');
    r(t, g + w - 1, y, 1, 1, 'trait');
  }
  r(t, 29, 49, 4, 6, 'trait'); // une porte, tout en bas
  r(t, 30, 50, 2, 5, 'briqueO');
  r(t, 29, 36, 3, 4, 'trait'); // une fenêtre à mi-hauteur
  r(t, 30, 37, 1, 2, 'ciel');

  // LA LANTERNE : la galerie, le vitrage, le toit, l'épi.
  r(t, 23, 21, 17, 2, 'metalC'); // la galerie
  cadre(t, 23, 21, 17, 2, 'trait');
  for (let x = 24; x < 39; x += 3) r(t, x, 19, 1, 2, 'metalC'); // le garde-corps
  r(t, 26, 10, 12, 9, 'verre'); // le vitrage
  cadre(t, 25, 10, 14, 9, 'trait');
  r(t, 31, 10, 2, 9, 'metal');
  dome(t, 32, 9, 9, 6, 'metal'); // le toit
  r(t, 22, 9, 19, 1, 'trait');
  r(t, 31, 2, 2, 3, 'metal'); // l'épi
  rond(t, 32, 2, 2, 'metalC');

  // LE BATEAU, au large : une coque, un mât, une voile, quelqu'un dedans.
  const bx = 50;
  r(t, bx + 12, 66, 1, 14, 'trait'); // le mât
  for (let i = 0; i < 10; i++) r(t, bx + 13, 68 + i, 1 + i, 1, 'drapO');
  r(t, bx + 3, 76, 8, 4, 'drapO'); // la cabine
  cadre(t, bx + 3, 76, 8, 4, 'trait');
  r(t, bx, 80, 20, 4, 'boisM'); // la coque
  r(t, bx + 2, 84, 16, 2, 'boisF');
  cadre(t, bx, 80, 20, 4, 'trait');
  r(t, bx + 1, 77, 2, 3, 'chair'); // le marin
  r(t, bx + 1, 75, 2, 2, 'cheveux');
}

// ---------------------------------------------------------------------------

const SCENES = [chambre, repas, rue, large] as const;

export interface Quatre {
  /** La scène telle qu'elle est dans le noir : on devine, on ne lit pas. */
  nuit: HTMLCanvasElement[];
  /** La même, allumée. C'est elle que la lumière révèle. */
  jour: HTMLCanvasElement[];
}

let cache: Quatre | null = null;

/** Les huit images, peintes une seule fois. Quatre-vingt-seize sur quatre-
 *  vingts pixels : la génération se compte en millisecondes. */
export function quatre(): Quatre {
  if (cache) return cache;
  const peindre = (dessin: (t: Toile) => void, jour: boolean): HTMLCanvasElement => {
    const toile = document.createElement('canvas');
    toile.width = LARGE;
    toile.height = HAUT;
    const c = toile.getContext('2d');
    if (!c) throw new Error('Pas de contexte 2D pour les scènes de la fin.');
    dessin({ c, jour });
    return toile;
  };
  cache = {
    nuit: SCENES.map((d) => peindre(d, false)),
    jour: SCENES.map((d) => peindre(d, true)),
  };
  return cache;
}
