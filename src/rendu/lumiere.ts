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
import { solide, vueLibre } from '../coeur/monde/grille.js';
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
      // ça ne l'éclaire toujours pas quand il ne l'atteint pas.
      const fendue =
        !porte && zone.fissureDe && zone.fissureDe[cy] && zone.fissureDe[cy][cx];
      // LA MORSURE FAIT PRESQUE UNE CASE. À un cinquième, on ne voyait qu'un
      // liseré du mur et la pierre restait noire : tout le travail sur les
      // tuiles ne se voyait que par terre.
      const morsure = CASE * (porte ? 0.55 : fendue ? 1 : 0.85);
      // ELLE TRAVERSE LES PIERRES CONTIGUËS, et s'arrête à la dernière.
      //
      // On la bornait à la sortie de la PREMIÈRE case touchée. Ça ne fuyait
      // pas, mais la profondeur éclairée dépendait alors de l'endroit où le
      // rayon entrait dans la case : un rayon qui entrait près du bord loin
      // mordait à peine, son voisin mordait tout. Résultat, la coupure du
      // faisceau sur un mur suivait la grille au lieu de suivre le faisceau,
      // en dents de scie — « aucune cohérence », et c'était exact.
      //
      // On avance donc tant que la pierre continue, et on s'arrête soit à la
      // morsure, soit à la sortie de la DERNIÈRE pierre. La lumière ne ressort
      // jamais dans le vide : c'est ça, et seulement ça, qui empêche de voir
      // la salle d'à côté.
      let sortie = Math.min(tX, tY);
      while (t + morsure > sortie) {
        const px = tX < tY ? cx + versX : cx;
        const py = tX < tY ? cy : cy + versY;
        if (!solide(zone, px, py)) return Math.min(sortie, portee);
        if (tX < tY) {
          cx = px;
          tX += sautX;
        } else {
          cy = py;
          tY += sautY;
        }
        sortie = Math.min(tX, tY);
      }
      return Math.min(t + morsure, portee);
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

/**
 * LES COINS DE PIERRE D'UNE SALLE.
 *
 * La pierre qui fait l'angle RENTRANT d'une salle n'est atteinte par aucun
 * rayon : les deux murs qui la bordent bloquent la diagonale. Mesuré dans un
 * cachot de trois cases sur trois — les quatre coins sortaient à 10 sur 255,
 * c'est-à-dire exactement le noir du fond, pendant que leurs voisines étaient
 * entre 13 et 44. Quatre trous carrés dans l'anneau de murs, et c'est ce qu'on
 * voit en premier.
 *
 * On les ajoute donc à la main, mais **dans le même chemin que le polygone**,
 * donc percées par le MÊME dégradé en UN SEUL passage. C'est la leçon de
 * l'essai précédent : une passe séparée, avec son propre dégradé, se lisait
 * comme une série d'arcs de cercle découpés par les cases.
 *
 * Un seul cas, et rien d'autre : la case est de la pierre, sa diagonale VERS
 * LA SOURCE est du sol qu'on voit, et les deux cases entre les deux sont de la
 * pierre. C'est la définition d'un coin de salle, et ça n'attrape rien de plus.
 */
function coinsDeSalle(
  ecran: Ecran,
  chemin: Path2D,
  zone: Zone,
  wx: number,
  wy: number,
  portee: number,
): void {
  const sx = Math.floor(wx / CASE);
  const sy = Math.floor(wy / CASE);
  const c0x = Math.max(0, Math.floor((wx - portee) / CASE));
  const c1x = Math.min(zone.cols - 1, Math.floor((wx + portee) / CASE));
  const c0y = Math.max(0, Math.floor((wy - portee) / CASE));
  const c1y = Math.min(zone.lignes - 1, Math.floor((wy + portee) / CASE));
  for (let cy = c0y; cy <= c1y; cy++)
    for (let cx = c0x; cx <= c1x; cx++) {
      if (!solide(zone, cx, cy)) continue;
      const dx = Math.sign(sx - cx);
      const dy = Math.sign(sy - cy);
      if (!dx || !dy) continue; // en face, pas en biais : les rayons y vont
      if (solide(zone, cx + dx, cy + dy)) continue; // la diagonale doit être du sol
      if (!solide(zone, cx + dx, cy) || !solide(zone, cx, cy + dy)) continue;
      // et ce sol doit être vu : sans ça on allumerait le coin d'une salle où
      // l'on n'est pas
      const px = (cx + dx + 0.5) * CASE - wx;
      const py = (cy + dy + 0.5) * CASE - wy;
      if (Math.hypot(px, py) > portee) continue;
      if (!vueLibre(zone, wx, wy, (cx + dx + 0.5) * CASE, (cy + dy + 0.5) * CASE)) continue;
      chemin.rect(cx * CASE - ecran.cam.x, cy * CASE - ecran.cam.y, CASE + 1, CASE + 1);
    }
}

export function percerRond(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  force: number,
  portees: number[],
  /** De quoi ajouter les coins de salle : l'écran pour la caméra, la zone pour
   *  la pierre, et la position de la source dans le monde. Omis, on perce le
   *  polygone seul — c'est ce que font les sources de second plan. */
  ecran?: Ecran,
  zone?: Zone,
  wx = 0,
  wy = 0,
): void {
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(0,0,0,${force})`);
  g.addColorStop(0.62, `rgba(0,0,0,${force * 0.88})`);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = g;
  const chemin = new Path2D();
  for (let i = 0; i < RAYONS_ROND; i++) {
    const a = (i / RAYONS_ROND) * TAU;
    const d = Math.min(portees[i], r);
    if (i === 0) chemin.moveTo(x + Math.cos(a) * d, y + Math.sin(a) * d);
    else chemin.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d);
  }
  chemin.closePath();
  // Les coins de salle, dans LE MÊME chemin : un seul perçage, un seul
  // dégradé, aucune couture et aucun arc.
  if (ecran && zone) coinsDeSalle(ecran, chemin, zone, wx, wy, r);
  c.fill(chemin);
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
