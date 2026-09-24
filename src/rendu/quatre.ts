/**
 * LES QUATRE SCÈNES DE LA FIN.
 *
 * Une veilleuse, une bougie, un lampadaire, un phare. Elles étaient peintes
 * ici, rectangle par rectangle, avec un nuancier et un enfant posé pixel par
 * pixel — quatre cents lignes pour quatre tableaux. Elles sont maintenant
 * FABRIQUÉES : `outils/fin-scenes.mjs` découpe une planche dessinée, la
 * quantifie sur quarante-huit couleurs et compose les quatre scènes dans cette
 * grille, en deux exemplaires. Ce fichier n'en garde que la lecture.
 *
 * CHAQUE SCÈNE EXISTE EN DEUX EXEMPLAIRES : éteinte et allumée. Ce n'est pas
 * la même image plus ou moins transparente — une chambre dans le noir n'est
 * pas une chambre jaune atténuée, c'est une chambre bleue. La lumière ne
 * s'ajoute pas par-dessus : elle RÉVÈLE la seconde à travers la première, dans
 * la forme que lui donne sa source (voir `masque`, et `dessinerScene` dans
 * `fin.ts`). C'est la même grammaire que le reste du jeu, et c'est pour ça
 * qu'on la reconnaît sans qu'on ait à l'expliquer.
 *
 * CE QUI RESTE CALCULÉ ICI, et pourquoi : le MASQUE (la forme de la lumière,
 * qui grandit) et la PLUIE (qui tombe). Les deux bougent — on ne peut pas les
 * peindre dans une image. Le volume de lumière du phare balaye, lui aussi, et
 * c'est `fin.ts` qui le trace à partir de `VOLUME`.
 */

/** La grille d'une scène, en pixels. Les quatre l'ont identique : la chambre y
 *  était déjà, et les sujets dessinés y tombent presque à l'échelle 1:1, donc
 *  sans bouillie de réduction. */
export const LARGE = 160;
export const HAUT = 192;

/** Où sont les scènes : `outils/fin-scenes.mjs` écrit quatre colonnes, les
 *  éteintes en haut, les allumées en dessous. */
const FEUILLE = 'fin-scenes.png';

export const GRILLE: readonly (readonly [number, number])[] = [
  [LARGE, HAUT],
  [LARGE, HAUT],
  [LARGE, HAUT],
  [LARGE, HAUT],
];

/**
 * Où brûle la lumière de chaque scène, en pixels de la grille — MESURÉ dans
 * les sujets dessinés, pas estimé : le verre de la lanterne du réverbère est à
 * mi-hauteur de sa tête, pas à son sommet, et le foyer posé trop haut faisait
 * briller le ciel au-dessus de la lampe.
 *
 * Une seule source de vérité : la scène allume là, le masque s'ouvre là, et le
 * fil de la lumière s'y rend (`fin.ts` en déduit `FEU`). Ces trois nombres
 * étaient écrits séparément avant, et ça dérivait dès qu'on déplaçait un lit.
 */
export const FOYER: readonly (readonly [number, number])[] = [
  [109, 132], // le dôme de la veilleuse, posée à même le plancher
  [80, 80], // la flamme de la bougie, entre eux deux
  [59, 63], // le verre de la lanterne du réverbère
  [50, 58], // la lanterne du phare
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
    [59, 68, Math.PI / 2, 120, 0.7], // x, y, angle, portée, demi-ouverture
    [54, 58, 0, 150, 0.24],
  ];

/**
 * CE QUE CHAQUE SOURCE ÉCLAIRE, dessiné en pixels de la grille.
 *
 * Ce n'est pas un réglage, c'est une FORME : une veilleuse fait une bulle
 * autour d'elle, un lampadaire fait une colonne qui tombe sur le trottoir, un
 * phare fait un trait vers le large. La scène allumée n'apparaît que là-dedans
 * — c'est la grammaire du jeu, la même qu'en bas.
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
  if (i === 0) bulle(c, 109, 132, 140 * k, 1, 0.88);
  else if (i === 1) {
    // une flamme n'est jamais stable : elle respire, à peine
    const vacille = 1 + Math.sin(temps * 6.1) * 0.03 + Math.sin(temps * 2.3) * 0.02;
    bulle(c, 80, 80, 124 * k * vacille, 1, 0.94);
  } else if (i === 2) {
    // le verre, puis la colonne qui tombe : un lampadaire n'éclaire pas
    // derrière lui, il éclaire SOUS lui
    // assez large pour prendre le piéton en entier, parapluie compris
    bulle(c, 59, 63, 44 * k, 1, 1);
    faisceau(c, 59, 68, Math.PI / 2, 120 * k, 0.72);
  } else {
    // la tour et son rocher, puis le trait vers le large. LE BALAYAGE reste
    // près de l'horizontale : c'est là qu'il y a quelqu'un, et un phare qui
    // éclaire le ciel n'a jamais sauvé personne. La bulle s'arrête avant le
    // pêcheur : c'est le faisceau qui vient le prendre, en passant.
    bulle(c, 48, 105, 84 * k, 1, 1);
    faisceau(c, 54, 58, Math.sin(temps * 0.8) * 0.26, 160 * k, 0.24);
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
  for (let i = 0; i < 150; i++) {
    const gx = (i * 37) % LARGE;
    const gy = ((i * 53) % HAUT) + ((temps * 104) % HAUT);
    const y = gy % HAUT;
    if (y > 150) continue; // elle s'écrase sur le trottoir
    // plus visible dans la colonne de lumière, comme dehors
    const dedans = Math.abs(gx - FOYER[2][0]) < 36 && y > FOYER[2][1] + 10 ? 0.6 : 0.22;
    c.fillStyle = `rgba(166,182,208,${dedans * (0.35 + 0.65 * k)})`;
    c.fillRect(Math.round(ox + gx * e), Math.round(oy + y * e), p, p * 3);
  }
}

export interface Quatre {
  /** La scène telle qu'elle est dans le noir : on devine, on ne lit pas. */
  nuit: HTMLCanvasElement[];
  /** La même, allumée. C'est elle que la lumière révèle. */
  jour: HTMLCanvasElement[];
}

let cache: Quatre | null = null;
let encours: Promise<Quatre | null> | null = null;

/** Découpe la feuille en huit : quatre colonnes, les éteintes puis les
 *  allumées. Chaque scène part dans son propre canevas — `dessinerScene` en
 *  tire des morceaux à chaque image, et un canevas par scène coûte moins que
 *  huit découpes par image dans une grande feuille. */
function decouper(img: HTMLImageElement): Quatre {
  const prendre = (i: number, rang: number): HTMLCanvasElement => {
    const t = document.createElement('canvas');
    t.width = LARGE;
    t.height = HAUT;
    const c = t.getContext('2d');
    if (!c) throw new Error('Pas de contexte 2D pour les scènes de la fin.');
    c.drawImage(img, i * LARGE, rang * HAUT, LARGE, HAUT, 0, 0, LARGE, HAUT);
    return t;
  };
  return {
    nuit: [0, 1, 2, 3].map((i) => prendre(i, 0)),
    jour: [0, 1, 2, 3].map((i) => prendre(i, 1)),
  };
}

/**
 * Charge la feuille. On l'appelle au démarrage (`main.ts`) et non au moment de
 * la fin : douze étages séparent les deux, donc elle est là depuis longtemps
 * quand on en a besoin, et le service worker l'a mise de côté pour les fois
 * suivantes.
 */
export async function chargerScenes(url = FEUILLE): Promise<Quatre | null> {
  if (cache) return cache;
  if (encours) return encours;
  encours = new Promise<Quatre | null>((ok) => {
    const img = new Image();
    img.onload = () => {
      cache = decouper(img);
      ok(cache);
    };
    img.onerror = () => ok(null);
    img.src = url;
  });
  return encours;
}

/**
 * Les huit images, si elles sont arrivées. `null` tant qu'elles ne le sont pas
 * — la fin dessine alors ses fils et ses halos sur des cases noires, ce qui
 * dure le temps d'un chargement d'image et ne se produit qu'en ouvrant la fin
 * par le raccourci d'essai, sans avoir joué.
 */
export function quatre(): Quatre | null {
  if (!cache && !encours) void chargerScenes();
  return cache;
}
