/**
 * La grille : collisions, ligne de vue, parcours en largeur, chemins.
 *
 * Une zone est volontairement une grille. La seule chose à garantir ici, c'est
 * « peut-on aller d'ici à là », et sur une grille un parcours en largeur y
 * répond exactement — pas approximativement.
 */

import { CASE } from '../dimensions.js';
import { ecartAngle } from '../geometrie.js';
import type { Case, Point, Porte, Zone } from '../types.js';

/** Le minimum dont le parcours en largeur a besoin : une zone en construction
 *  n'a pas encore ses portes, et il doit pouvoir tourner quand même. */
export interface Plan {
  mur: number[][];
  cols: number;
  lignes: number;
  porteDe?: (Porte | null)[][];
}

/**
 * Parcours en largeur sur les cases libres. Exact, et c'est tout l'intérêt :
 * ce que la génération promet, on le vérifie vraiment.
 *
 * `sansPortes` sert aux sentinelles : elles ne franchissent AUCUNE porte,
 * ouverte ou fermée, donc leur monde s'arrête à ces cases-là. Sans cette
 * option elles calculeraient des rondes qui traversent une porte et iraient
 * pousser contre le battant jusqu'à la fin des temps.
 */
export function distances(z: Plan, depart: Case, sansPortes?: boolean): number[][] {
  const { mur, cols, lignes } = z;
  const portes = sansPortes ? z.porteDe : null;
  const d: number[][] = [];
  for (let y = 0; y < lignes; y++) d.push(new Array<number>(cols).fill(-1));
  if (mur[depart.cy][depart.cx]) return d;
  d[depart.cy][depart.cx] = 0;
  const file = [depart.cx, depart.cy];
  for (let i = 0; i < file.length; i += 2) {
    const x = file[i];
    const y = file[i + 1];
    for (const [nx, ny] of [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1],
    ]) {
      if (nx < 0 || ny < 0 || nx >= cols || ny >= lignes) continue;
      if (portes?.[ny][nx]) continue;
      if (mur[ny][nx] || d[ny][nx] !== -1) continue;
      d[ny][nx] = d[y][x] + 1;
      file.push(nx, ny);
    }
  }
  return d;
}

/**
 * Une porte fermée est un mur : collision, ligne de vue, propagation de la
 * lumière et découpe des cônes passent TOUTES par ici, donc il suffit de le
 * dire une fois. Le parcours en largeur, lui, ne lit que `mur` — une porte
 * s'ouvre, donc elle ne rend jamais rien inatteignable.
 */
export function solide(z: Zone, cx: number, cy: number): boolean {
  if (cx < 0 || cy < 0 || cx >= z.cols || cy >= z.lignes) return true;
  if (z.mur[cy][cx] === 1) return true;
  const pt = z.porteDe[cy]?.[cx];
  return !!pt && pt.ouverte < 0.5;
}

/** La même question, en pixels monde. */
export const solideEn = (z: Zone, x: number, y: number): boolean =>
  solide(z, Math.floor(x / CASE), Math.floor(y / CASE));

/** Ce qu'il faut à `degager` : un corps qui peut être repoussé. */
interface Mobile extends Point {
  vx: number;
  vy: number;
  vsx: number;
  vsy: number;
}

/**
 * Repousse un corps hors de la pierre.
 *
 * `mureParLesPortes` : pour une sentinelle, une case de porte est un mur même
 * battant grand ouvert. C'est ce qui fait d'une porte un abri sur lequel on
 * peut compter — un rouge ne la franchit jamais, quoi qu'on ait laissé ouvert
 * derrière soi.
 */
export function degager(
  z: Zone,
  p: Mobile,
  demi: number,
  mureParLesPortes?: boolean,
): void {
  const c0x = Math.floor((p.x - demi) / CASE);
  const c1x = Math.floor((p.x + demi) / CASE);
  const c0y = Math.floor((p.y - demi) / CASE);
  const c1y = Math.floor((p.y + demi) / CASE);
  for (let cy = c0y; cy <= c1y; cy++) {
    for (let cx = c0x; cx <= c1x; cx++) {
      const barre =
        mureParLesPortes &&
        cx >= 0 &&
        cy >= 0 &&
        cx < z.cols &&
        cy < z.lignes &&
        z.porteDe[cy][cx];
      if (!barre && !solide(z, cx, cy)) continue;
      const mx = cx * CASE;
      const my = cy * CASE;
      const gauche = mx - demi - p.x;
      const droite = mx + CASE + demi - p.x;
      const haut = my - demi - p.y;
      const bas = my + CASE + demi - p.y;
      const dx = Math.abs(gauche) < Math.abs(droite) ? gauche : droite;
      const dy = Math.abs(haut) < Math.abs(bas) ? haut : bas;
      // Le choc se voit sur la matière : on s'écrase sur l'axe de l'impact et
      // on se gonfle sur l'autre. Sans ça `degager` annulait la vitesse, la
      // cible du jelly revenait à 1 et le mur ne se sentait pas du tout.
      // À 0,006 l'écrasement plafonnait à peine à 10 % et personne ne le
      // voyait : la matière encaisse maintenant trois fois plus, et l'échelle
      // elle-même est bornée pour que ça reste une gelée et pas une flaque.
      if (Math.abs(dx) < Math.abs(dy)) {
        const choc = Math.abs(p.vx);
        p.x += dx;
        p.vx = 0;
        if (choc > 30) {
          p.vsx -= choc * 0.02;
          p.vsy += choc * 0.02;
        }
      } else {
        const choc = Math.abs(p.vy);
        p.y += dy;
        p.vy = 0;
        if (choc > 30) {
          p.vsy -= choc * 0.02;
          p.vsx += choc * 0.02;
        }
      }
    }
  }
}

/** Y a-t-il de la pierre entre ces deux points ? */
export function vueLibre(z: Zone, x1: number, y1: number, x2: number, y2: number): boolean {
  const d = Math.hypot(x2 - x1, y2 - y1);
  const pas = Math.max(1, Math.ceil(d / (CASE * 0.45)));
  for (let i = 1; i < pas; i++) {
    const t = i / pas;
    if (solideEn(z, x1 + (x2 - x1) * t, y1 + (y2 - y1) * t)) return false;
  }
  return true;
}

/**
 * Le point (tx, ty) est-il dans le cône ? La tolérance angulaire s'élargit de
 * près : sans elle, un cône étroit devenait inutilisable à bout portant.
 */
export const dansLeCone = (
  sx: number,
  sy: number,
  angle: number,
  tx: number,
  ty: number,
  portee: number,
  demi: number,
): boolean => {
  const d = Math.hypot(tx - sx, ty - sy);
  if (d > portee || d < 1) return false;
  const a = Math.atan2(ty - sy, tx - sx);
  return Math.abs(ecartAngle(angle, a)) <= demi + Math.min(0.45, 30 / Math.max(d, 1));
};

/**
 * Chemin case par case entre deux points du monde, en descendant le gradient du
 * parcours en largeur. Les sentinelles allaient tout droit vers leur point de
 * ronde : mesuré, elles visaient un point derrière un mur 46 % du temps et
 * 5 sur 23 restaient plantées contre la paroi plus de 60 % du temps.
 */
export function routeVers(
  z: Zone,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  sansPortes?: boolean,
): Point[] | null {
  const dep = { cx: Math.floor(x0 / CASE), cy: Math.floor(y0 / CASE) };
  if (solide(z, dep.cx, dep.cy)) return null;
  const d = distances(z, dep, sansPortes);
  let cx = Math.floor(x1 / CASE);
  let cy = Math.floor(y1 / CASE);
  if (!d[cy] || d[cy][cx] < 0) return null;
  const route: Point[] = [];
  let garde = 0;
  while (d[cy][cx] > 0 && garde++ < 400) {
    route.push({ x: (cx + 0.5) * CASE, y: (cy + 0.5) * CASE });
    const voisins = [
      [cx + 1, cy],
      [cx - 1, cy],
      [cx, cy + 1],
      [cx, cy - 1],
    ].filter(([x, y]) => d[y] !== undefined && d[y][x] >= 0);
    if (!voisins.length) break;
    const suivant = voisins.reduce(
      (a, [x, y]) => (d[y][x] < d[a[1]][a[0]] ? [x, y] : a),
      voisins[0],
    );
    cx = suivant[0];
    cy = suivant[1];
  }
  return route.reverse();
}
