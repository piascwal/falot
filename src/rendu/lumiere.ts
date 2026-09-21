/**
 * LE RENDU SIGNATURE : la lumière percée dans le noir.
 *
 * On peint la scène en entier, puis on couvre tout d'un calque presque opaque
 * (`lum`, à demi-résolution), et on PERCE ce calque là où il y a de la lumière :
 * un rond pour le halo, un cône pour un faisceau. Chaque trou est un polygone
 * de visibilité calculé au rayon, donc la pierre arrête la lumière.
 *
 * C'est l'identité visuelle du jeu, et c'est la raison pour laquelle le projet
 * reste en Canvas 2D : refaire ça en masques WebGL, c'est refaire la seule
 * chose qu'on veut garder à l'identique.
 */

import { CASE } from '../coeur/dimensions.js';
import { TAU } from '../coeur/geometrie.js';
import { solide } from '../coeur/monde/grille.js';
import type { Source, Zone } from '../coeur/types.js';
import type { Ecran } from './ecran.js';

// croyait se faire repérer à travers une cloison — la détection, elle, testait
// déjà la ligne de vue, mais l'affichage mentait.
// Un cône coupé par un mur n'est plus convexe, et une rastérisation logicielle
// paie cher chaque segment. 22 -> 12 rayons : la marche d'escalier reste
// lisible et le coût de dessin retombe.
// 12 rayons suffisaient quand le cône s'arrêtait AVANT la pierre : la coupure
// tombait toujours sur une face de mur bien droite. Depuis qu'il la mord, deux
// rayons voisins peuvent s'arrêter à des profondeurs très différentes, et le
// polygone entre les deux devient une facette grossière en travers du mur.
// Trente-deux : la coupure suit le faisceau, pas la grille.
export const RAYONS = 32;
/** Pour les cônes de second plan : un relais, un regard de Guet. */
export const RAYONS_FOND = 14;
export function portéesCone(
  zone: Zone,
  wx: number,
  wy: number,
  angle: number,
  portee: number,
  demiAngle: number,
  /** Combien de rayons. Le faisceau du joueur les mérite tous ; un cône de
   *  relais ou un regard de Guet est dessiné en transparence, et personne n'y
   *  compte les facettes — on ne paie donc la finesse que là où elle se voit. */
  rayons = RAYONS,
): number[] {
  const out = new Array<number>(rayons + 1);
  for (let i = 0; i <= rayons; i++) {
    const a = angle - demiAngle + (2 * demiAngle * i) / rayons;
    // LE MÊME PARCOURS QUE LES SOURCES RONDES. Le cône avançait par pas fixes
    // et s'arrêtait AVANT la pierre : un faisceau braqué sur un mur laissait
    // ce mur noir, ce qui n'a aucun sens — et le pas fixe enjambait un coin
    // rasé en diagonale. `distanceMur` saute de frontière en frontière, mord
    // la paroi qu'il touche, et ne la traverse jamais.
    out[i] = distanceMur(zone, wx, wy, Math.cos(a), Math.sin(a), portee);
  }
  return out;
}

// trace le polygone du cône réellement éclairé, en coordonnées écran
export function tracerCone(
  c: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  angle: number,
  demiAngle: number,
  portees: number[],
): void {
  // Le nombre de rayons se lit dans le tableau : il change d'un cône à
  // l'autre, et une constante ici trahirait ceux qui en ont moins.
  const n = portees.length - 1;
  c.beginPath();
  c.moveTo(sx, sy);
  for (let i = 0; i <= n; i++) {
    const a = angle - demiAngle + (2 * demiAngle * i) / n;
    c.lineTo(sx + Math.cos(a) * portees[i], sy + Math.sin(a) * portees[i]);
  }
  c.closePath();
}

export function percerCone(
  ecran: Ecran,
  c: CanvasRenderingContext2D,
  zone: Zone,
  wx: number,
  wy: number,
  angle: number,
  portee: number,
  demiAngle: number,
  force: number,
  dejaCalculees?: number[] | null,
): void {
  const portees = dejaCalculees || portéesCone(zone, wx, wy, angle, portee, demiAngle);
  const x = wx - ecran.cam.x,
    y = wy - ecran.cam.y;
  const g = c.createRadialGradient(x, y, 0, x, y, portee);
  g.addColorStop(0, `rgba(0,0,0,${force})`);
  g.addColorStop(0.6, `rgba(0,0,0,${force * 0.7})`);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = g;
  tracerCone(c, x, y, angle, demiAngle, portees);
  c.fill();
}

// Une source fixe éclaire en rond, mais la pierre l'arrête. Sans occultation,
// une torche collée à un mur illuminait la salle d'à côté, ce qui trahissait
// tout le plan sans bouger.
// Contrairement au cône de détection, on GARDE le pas où la pierre a été
// touchée : ici on veut voir la face du mur allumée. Un pas vaut un cinquième
// de case, la lumière mord donc la paroi sans jamais la traverser.
// 40 rayons laissaient voir les facettes du polygone dans les angles. Pour
// les sources fixes le calcul est mis en cache, donc la finesse est gratuite ;
// pour le halo du joueur, qui se recalcule à chaque image, 64 rayons sur un
// rayon d'une case et demie font environ 500 tests de case — le faisceau en
// fait déjà autant.
export const RAYONS_ROND = 64;

// Parcours de grille : on saute de frontière de case en frontière de case, si
// bien qu'aucune case traversée n'est omise. Un pas fixe, lui, enjambe un coin
// dès qu'il le rase en diagonale — mesuré au pas de 0,2 case, 7 rayons sur
// 7680 passaient au travers d'un mur, jusqu'à 1,7 case de pierre.
// La lumière s'arrête à la face OPPOSÉE de la première pierre touchée : la
// case est éclairée en entier, et le rayon ne va jamais au-delà.
function distanceMur(
  zone: Zone,
  wx: number,
  wy: number,
  dx: number,
  dy: number,
  portee: number,
): number {
  let cx = Math.floor(wx / CASE),
    cy = Math.floor(wy / CASE);
  const versX = dx > 0 ? 1 : -1,
    versY = dy > 0 ? 1 : -1;
  const adx = Math.abs(dx),
    ady = Math.abs(dy);
  const sautX = adx < 1e-9 ? Infinity : CASE / adx;
  const sautY = ady < 1e-9 ? Infinity : CASE / ady;
  let tX = adx < 1e-9 ? Infinity : (dx > 0 ? (cx + 1) * CASE - wx : wx - cx * CASE) / adx;
  let tY = ady < 1e-9 ? Infinity : (dy > 0 ? (cy + 1) * CASE - wy : wy - cy * CASE) / ady;
  for (let garde = 0; garde < 400; garde++) {
    let t: number;
    if (tX < tY) {
      t = tX;
      cx += versX;
      tX += sautX;
    } else {
      t = tY;
      cy += versY;
      tY += sautY;
    }
    if (t >= portee) return portee;
    if (solide(zone, cx, cy)) {
      const porte = zone.porteDe[cy]?.[cx];
      // UNE PORTE EST UN PANNEAU AU MILIEU DE SA CASE. La lumière doit aller
      // jusqu'à lui, sinon le battant qui nous barre la route reste dans le
      // noir et on ne comprend pas ce qui nous arrête.
      if (porte) return Math.min(t + CASE * 0.55, tX, tY, portee);
      // UNE PIERRE TOUCHÉE PAR LA LUMIÈRE EST ÉCLAIRÉE EN ENTIER. Le rayon va
      // jusqu'à la face opposée de la case, et s'y arrête.
      //
      // On mordait d'une profondeur fixe depuis le point d'entrée, et ça
      // creusait un coin noir en V dans chaque angle : un rayon à 45° entre
      // par la pointe de la case, donc sa morsure s'arrête bien avant d'avoir
      // traversé la diagonale, alors que ses voisins filent dans le couloir.
      // Vu de près, la case d'angle était éclairée sur ses deux bords et noire
      // en travers — et de loin, on croyait à un bloc manquant.
      //
      // « Toute la case, et rien de plus » n'a pas ce défaut : c'est la même
      // règle quel que soit l'angle d'entrée. Et ça ne fuit toujours pas —
      // le rayon s'arrête SUR la face opposée, jamais au-delà.
      return Math.min(tX, tY, portee);
    }
  }
  return portee;
}

export function portéesRond(zone: Zone, wx: number, wy: number, portee: number): number[] {
  const out = new Array<number>(RAYONS_ROND);
  for (let i = 0; i < RAYONS_ROND; i++) {
    const a = (i / RAYONS_ROND) * TAU;
    out[i] = distanceMur(zone, wx, wy, Math.cos(a), Math.sin(a), portee);
  }
  return out;
}

// Les torches et les braises ne bougent pas : leur ombre portée ne change que
// lorsqu'une porte s'ouvre ou se ferme. On la calcule une fois et on la garde,
// sinon on relancerait quarante rayons par source à chaque image.
export function rayonsSource(zone: Zone, src: Source, portee: number): number[] {
  if (!src.rayons || src.rayonsVersion !== zone.versionPortes) {
    src.rayons = portéesRond(zone, src.x, src.y, portee);
    src.rayonsVersion = zone.versionPortes;
  }
  return src.rayons;
}

// le polygone de visibilité, tronqué au rayon courant : une torche qui
// faiblit rétrécit sans qu'on ait à relancer les rayons
export function tracerRond(
  c: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  portees: number[],
  portee: number,
): void {
  c.beginPath();
  for (let i = 0; i < RAYONS_ROND; i++) {
    const a = (i / RAYONS_ROND) * TAU;
    const d = Math.min(portees[i], portee);
    const x = sx + Math.cos(a) * d,
      y = sy + Math.sin(a) * d;
    if (i === 0) c.moveTo(x, y);
    else c.lineTo(x, y);
  }
  c.closePath();
}

export function percerRond(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  force: number,
  portees: number[],
): void {
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(0,0,0,${force})`);
  g.addColorStop(0.62, `rgba(0,0,0,${force * 0.88})`);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = g;
  tracerRond(c, x, y, portees, r);
  c.fill();
}

export function percerDisque(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  force: number,
): void {
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(0,0,0,${force})`);
  g.addColorStop(0.62, `rgba(0,0,0,${force * 0.88})`);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = g;
  c.beginPath();
  c.arc(x, y, r, 0, TAU);
  c.fill();
}

// Le sol de TOUTES les cases à l'écran : le voile se charge de ne montrer que

/**
 * Une portée plus courte se déduit par un simple minimum : inutile de relancer
 * les rayons. C'est ce qui rend la jauge d'un Guet gratuite — elle réutilise le
 * cône déjà calculé pour son faisceau.
 */
export const raccourcir = (portees: number[], portee: number): number[] =>
  portees.map((d) => Math.min(d, portee));
