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
import { QLUM } from './ecran.js';

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
      // LE POLYGONE S'ARRÊTE SUR LA FACE, et n'entre pas dans la pierre.
      //
      // On a essayé les deux morsures, et les deux étaient fausses. Une
      // profondeur fixe creusait un coin noir en V dans les angles saillants ;
      // « toute la case » éclairait chaque pierre d'un bloc, si bien que la
      // salle devenait un damier de tuiles allumées ou éteintes, sans aucun
      // dégradé. Le polygone est une affaire de SOL : il doit dire jusqu'où le
      // sol est éclairé, et rien d'autre.
      //
      // C'est `percerPierres` qui allume la pierre, avec un vrai dégradé et
      // les angles rentrants en prime.
      return Math.min(t, portee);
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

/**
 * LES FACES DE PIERRE.
 *
 * Le polygone de lumière s'arrête sur la face du mur : il dit jusqu'où le SOL
 * est éclairé. Restait à éclairer la pierre elle-même, et c'est un autre
 * problème — qu'on a d'abord essayé de régler en faisant mordre les rayons,
 * deux fois, et deux fois de travers :
 *
 *   — une morsure d'une profondeur fixe creuse un coin noir en V dans les
 *     angles SAILLANTS : un rayon à 45° entre dans la case par sa pointe, il
 *     n'a pas de quoi traverser la diagonale, et ses voisins filent tout droit ;
 *   — « toute la case » supprime le V mais allume chaque pierre d'un bloc : la
 *     salle devient un damier de tuiles, sans le moindre dégradé.
 *
 * Et aucune des deux ne règle les angles RENTRANTS — le coin d'une salle,
 * celui qu'on voit de biais. Aucun rayon ne l'atteint : les deux murs qui le
 * bordent bloquent la diagonale. Il reste noir entre deux murs éclairés, et
 * c'est ce qui se voit le plus.
 *
 * LA RÈGLE EST DONC AILLEURS : **une pierre est éclairée si elle touche, par
 * un côté OU PAR UN COIN, une case de sol qui l'est.** C'est ce que dit l'œil,
 * et ça règle les trois cas d'un coup — le saillant, le rentrant, et le
 * dégradé, puisqu'on la peint avec la lumière de la source et pas avec un
 * niveau par tuile.
 */

/** Les pierres qui bordent du vide, par zone : ce sont les seules qui puissent
 *  être vues. Recalculé quand une porte bouge, comme les rayons des sources. */
const faces = new WeakMap<Zone, { version: number; carte: Uint8Array }>();

function facesDe(zone: Zone): Uint8Array {
  const garde = faces.get(zone);
  if (garde && garde.version === zone.versionPortes) return garde.carte;
  const carte = new Uint8Array(zone.cols * zone.lignes);
  for (let cy = 0; cy < zone.lignes; cy++)
    for (let cx = 0; cx < zone.cols; cx++) {
      if (!solide(zone, cx, cy)) continue;
      for (let dy = -1; dy <= 1 && !carte[cy * zone.cols + cx]; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          if (!dx && !dy) continue;
          if (solide(zone, cx + dx, cy + dy)) continue;
          carte[cy * zone.cols + cx] = 1;
          break;
        }
    }
  faces.set(zone, { version: zone.versionPortes, carte });
  return carte;
}

/**
 * Allume la pierre autour d'une source, avec SON dégradé.
 *
 * `portees` est la table de rayons déjà calculée pour le polygone : on s'en
 * sert pour savoir si une case de sol voisine est vue, sans relancer un seul
 * rayon. Pour un cône, `angle` et `demiAngle` disent son ouverture ; sans eux,
 * c'est une source ronde.
 */
/**
 * Cette pierre-là est-elle éclairée par cette source ?
 *
 * Sortie à part du dessin, parce que c'est LA règle, et qu'une règle se teste :
 * une pierre est éclairée si elle touche, par un côté ou par un coin, une case
 * de sol que la source voit. Le coin est ce qui sauve les angles rentrants.
 *
 * `portees` est la table de rayons déjà calculée pour le polygone : on s'en
 * sert pour savoir si une case de sol est vue, sans relancer un seul rayon.
 */
export function pierreVue(
  zone: Zone,
  wx: number,
  wy: number,
  cx: number,
  cy: number,
  portee: number,
  portees: number[],
  angle?: number,
  demiAngle?: number,
): boolean {
  const n = portees.length;
  // POUR UN CÔNE, la pierre doit être dans le cône. Sans ça elle s'allumait
  // partout où une case de sol voisine était vue, donc le mur s'éclairait une
  // case plus large que le faisceau, des deux côtés — et un faisceau qui
  // déborde du faisceau, ça se voit tout de suite.
  if (angle !== undefined && demiAngle !== undefined) {
    const mx = (cx + 0.5) * CASE - wx;
    const my = (cy + 0.5) * CASE - wy;
    let e = Math.atan2(my, mx) - angle;
    while (e < -Math.PI) e += TAU;
    while (e > Math.PI) e -= TAU;
    // une demi-case de marge : la case est large, son centre ne suffit pas
    const marge = Math.atan2(CASE * 0.75, Math.max(CASE, Math.hypot(mx, my)));
    if (Math.abs(e) > demiAngle + marge) return false;
  }
  for (let dy = -1; dy <= 1; dy++)
    for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const vx = cx + dx;
      const vy = cy + dy;
      if (solide(zone, vx, vy)) continue;
      const px = (vx + 0.5) * CASE - wx;
      const py = (vy + 0.5) * CASE - wy;
      const d = Math.hypot(px, py);
      if (d > portee) continue;
      let a = Math.atan2(py, px);
      let i: number;
      if (angle === undefined || demiAngle === undefined) {
        if (a < 0) a += TAU;
        i = Math.round((a / TAU) * n) % n;
      } else {
        let u = a - (angle - demiAngle);
        while (u < -Math.PI) u += TAU;
        while (u > Math.PI) u -= TAU;
        u /= 2 * demiAngle;
        if (u < 0 || u > 1) continue;
        i = Math.round(u * (n - 1));
      }
      if (portees[i] < d * 0.96) continue; // cachée derrière une autre pierre
      return true;
    }
  return false;
}

/**
 * LE TAMPON DES PIERRES.
 *
 * Toutes les sources y déposent la lumière qu'elles mettent sur la pierre, et
 * on ne floute QU'UNE FOIS, à la fin, avant de la reporter sur l'obscurité.
 *
 * Flouter à chaque source coûtait cher — dix appels par image avec huit
 * torches à l'écran, et le filtre d'un canvas n'est pas gratuit. Mesuré : de
 * une à deux images perdues sur trois cents, on passait à six ou dix.
 */
// Fabriqué à la première image, pas au chargement du module : ce fichier est
// importé par les tests, qui tournent sans navigateur et n'ont pas de
// `document` — et la règle des angles, elle, se teste.
let tampon: HTMLCanvasElement | null = null;

/** Vide le tampon et le met à la taille du calque d'obscurité. À appeler une
 *  fois par image, avant de percer quoi que ce soit. */
export function viderLesPierres(ecran: Ecran): CanvasRenderingContext2D | null {
  if (!tampon) tampon = document.createElement('canvas');
  const c = tampon.getContext('2d');
  if (!c) return null;
  if (tampon.width !== ecran.lum.width || tampon.height !== ecran.lum.height) {
    tampon.width = ecran.lum.width;
    tampon.height = ecran.lum.height;
  }
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.clearRect(0, 0, tampon.width, tampon.height);
  c.setTransform(ecran.DPR * QLUM, 0, 0, ecran.DPR * QLUM, 0, 0);
  // Les sources s'ajoutent : deux torches qui éclairent le même mur
  // l'éclairent davantage, comme partout ailleurs dans le jeu.
  c.globalCompositeOperation = 'lighter';
  return c;
}

/** Reporte le tampon sur l'obscurité, flouté. Le bord d'une ombre portée par
 *  un mur doit être doux : aucune source n'est un point. */
export function poserLesPierres(ecran: Ecran, lctx: CanvasRenderingContext2D): void {
  if (!tampon) return;
  lctx.save();
  lctx.setTransform(1, 0, 0, 1, 0, 0);
  lctx.globalCompositeOperation = 'destination-out';
  lctx.filter = 'blur(4px)';
  lctx.drawImage(tampon, 0, 0);
  lctx.restore();
  lctx.setTransform(ecran.DPR * QLUM, 0, 0, ecran.DPR * QLUM, 0, 0);
  lctx.globalCompositeOperation = 'destination-out';
}

export function percerPierres(
  ecran: Ecran,
  c: CanvasRenderingContext2D,
  zone: Zone,
  wx: number,
  wy: number,
  portee: number,
  force: number,
  portees: number[],
  angle?: number,
  demiAngle?: number,
): void {
  const carte = facesDe(zone);
  const c0x = Math.max(0, Math.floor((wx - portee) / CASE));
  const c1x = Math.min(zone.cols - 1, Math.floor((wx + portee) / CASE));
  const c0y = Math.max(0, Math.floor((wy - portee) / CASE));
  const c1y = Math.min(zone.lignes - 1, Math.floor((wy + portee) / CASE));
  const x = wx - ecran.cam.x;
  const y = wy - ecran.cam.y;
  // UN SEUL dégradé pour toutes les cases : il est posé en coordonnées de
  // l'écran, donc chaque `fillRect` y découpe sa part. C'est ce qui donne le
  // dégradé continu à travers la pierre, au lieu d'un niveau par tuile.
  // LA PIERRE BOIT LA LUMIÈRE plus vite que le sol : le dégradé s'éteint aux
  // trois quarts de la portée au lieu du bout. Sans ça, la face opposée d'une
  // case est presque aussi claire que la face touchée, et la paroi se termine
  // par un bord franc à une case de profondeur — on lisait l'épaisseur du mur,
  // qu'on n'est pas censé voir d'en haut.
  const g = c.createRadialGradient(x, y, 0, x, y, portee);
  g.addColorStop(0, `rgba(0,0,0,${force * 0.92})`);
  g.addColorStop(0.45, `rgba(0,0,0,${force * 0.42})`);
  g.addColorStop(0.82, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = g;

  // TOUTES LES CASES DANS UN SEUL CHEMIN, et un flou par-dessus.
  //
  // Une case remplie toute seule montre ses quatre bords dès que sa voisine
  // n'est pas allumée : la paroi se lisait comme une file de rectangles. Un
  // chemin unique fond les cases voisines entre elles, et le flou adoucit ce
  // qui reste — le bord d'une ombre portée par un mur, qui doit être doux
  // parce qu'aucune source n'est un point.
  const chemin = new Path2D();
  let une = false;
  for (let cy = c0y; cy <= c1y; cy++)
    for (let cx = c0x; cx <= c1x; cx++) {
      if (!carte[cy * zone.cols + cx]) continue;
      if (!pierreVue(zone, wx, wy, cx, cy, portee, portees, angle, demiAngle)) continue;
      chemin.rect(cx * CASE - ecran.cam.x, cy * CASE - ecran.cam.y, CASE + 1, CASE + 1);
      une = true;
    }
  if (!une) return;
  c.fill(chemin);
}
