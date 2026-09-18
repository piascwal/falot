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
export const RAYONS = 12;
export function portéesCone(
  zone: Zone,
  wx: number,
  wy: number,
  angle: number,
  portee: number,
  demiAngle: number,
): number[] {
  const out = new Array<number>(RAYONS + 1);
  const pas = CASE * 0.22;
  for (let i = 0; i <= RAYONS; i++) {
    const a = angle - demiAngle + (2 * demiAngle * i) / RAYONS;
    const cx = Math.cos(a),
      cy = Math.sin(a);
    let d = 0;
    while (d + pas < portee) {
      if (
        solide(
          zone,
          Math.floor((wx + cx * (d + pas)) / CASE),
          Math.floor((wy + cy * (d + pas)) / CASE),
        )
      )
        break;
      d += pas;
    }
    // on s'arrête AVANT la pierre, pas dessus : garder le pas où le mur a été
    // trouvé faisait déborder chaque rayon d'un cran dans le mur
    out[i] = Math.min(d, portee);
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
  c.beginPath();
  c.moveTo(sx, sy);
  for (let i = 0; i <= RAYONS; i++) {
    const a = angle - demiAngle + (2 * demiAngle * i) / RAYONS;
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
// On dépasse la paroi d'un cinquième de case en s'y arrêtant : on veut voir la
// face du mur allumée, elle serait bizarrement noire sinon. Une case fait au
// moins une case d'épaisseur, la lumière ne ressort donc jamais de l'autre côté.
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
      // Un mur, on en mord la face. Une porte fermée, elle, est un panneau au
      // MILIEU de sa case : la lumière doit aller jusqu'à lui, sinon le
      // battant qui nous barre la route reste dans le noir et on ne comprend
      // pas ce qui nous arrête.
      // La morsure est bornée à la SORTIE de la case touchée (tX et tY
      // pointent déjà la frontière suivante) : un rayon qui ne fait que raser
      // un coin en diagonale n'y parcourt qu'une fraction de case, et une
      // morsure fixe le faisait alors ressortir de l'autre côté — mesuré,
      // 145 rayons sur 7680 filaient ainsi jusqu'à 2,7 cases dans la pierre.
      const porte = zone.porteDe[cy]?.[cx];
      // Une pierre fêlée laisse entrer la lumière plus profond qu'une pierre
      // saine. C'est ce qui rend la fente lisible quand le halo l'atteint — et
      // ça ne l'éclaire toujours pas quand il ne l'atteint pas. Sans cette
      // morsure on ne voyait qu'un liseré du haut de la case.
      const fendue =
        !porte && zone.fissureDe && zone.fissureDe[cy] && zone.fissureDe[cy][cx];
      return Math.min(t + CASE * (porte ? 0.55 : fendue ? 0.95 : 0.2), tX, tY, portee);
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
