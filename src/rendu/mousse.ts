/**
 * LA MOUSSE — elle part des murs et gagne le sol, sur plusieurs cases.
 *
 * Elle était une garniture comme le lierre : un tampon dessiné « en bas de
 * case », tourné vers la pierre voisine, une case sur cinq. Elle ne pouvait
 * donc jamais dépasser sa case, et ça se voyait : une frange de mousse de
 * trente pixels, tranchée net, puis rien. La mousse ne s'arrête pas au bord
 * d'une dalle ; elle gagne le sol là où l'humidité descend du mur, et s'éclaircit
 * à mesure qu'on s'en éloigne.
 *
 * C'EST MAINTENANT UN CHAMP, pas un tampon. Chaque point du sol a une humidité :
 * forte contre la pierre, nulle à `PORTEE` cases de toute pierre, et modulée par
 * un bruit à grandes taches — sans lui, chaque mur porterait la même bordure
 * régulière, un liseré tiré au cordeau. Les grains de mousse sont semés case par
 * case (la case reste sa propre graine), mais leur densité se lit dans ce champ
 * en COORDONNÉES DU MONDE : une tache commencée dans une case continue dans la
 * suivante sans couture.
 *
 * ELLE COÛTE CHER À DESSINER — plusieurs milliers de grains par salle — et ce
 * n'est plus un problème : elle est peinte une seule fois dans les blocs du sol
 * immobile (`plancher.ts`), puis recopiée. Les grains sont regroupés par teinte
 * dans quelques tracés, un seul `fill` par teinte.
 *
 * Même règle que tout le tileset : AUCUNE LUMIÈRE dedans. C'est de la matière
 * un peu plus claire que la pierre, et c'est le moteur qui la révèle.
 */

import { CASE } from '../coeur/dimensions.js';
import { TAU } from '../coeur/geometrie.js';
import type { Partie } from '../coeur/types.js';
import { hasard } from './semis.js';
import { VERT } from './tuiles.js';

/** Jusqu'où elle descend du mur, en cases. Au-delà de trois, un couloir de
 *  trois cases de large serait tapissé d'un mur à l'autre et la pierre du sol
 *  disparaîtrait sous elle. */
export const PORTEE_MOUSSE = 2.7;

/** Combien de grains une case peut porter au plus. L'ancien tampon en posait
 *  cent vingt sur son tiers de case : c'est la même densité au pied du mur. */
const GRAINS = 110;

/** Les teintes : autant de tracés, donc autant de `fill`. */
const TEINTES = 6;

/** La taille des grandes taches et du grain qui les ronge, en cases. */
const MAILLE = 1.45;
const MAILLE_FINE = 0.55;

/**
 * LES ZONES HUMIDES. Première version : la mousse suivait TOUS les murs, et au
 * jeu il y en avait partout — un liseré vert autour de chaque pierre, qui ne
 * disait plus rien parce qu'il était constant. De la mousse, il y en a là où
 * l'eau suinte, et pas ailleurs.
 *
 * Un troisième bruit, très lent (des taches de `MAILLE_HUMIDE` cases), décide
 * donc où le sol est humide. Sous `SEC`, rien ne pousse, même contre la pierre ;
 * au-delà de `SEC + TRANSITION`, elle s'étale pleinement. Ce bruit prend sa
 * valeur médiane autour de 0,5 : environ la moitié des murs restent nus, un
 * cinquième sont franchement couverts, le reste entre les deux.
 */
const MAILLE_HUMIDE = 4.5;
const SEC = 0.52;
const TRANSITION = 0.16;

const lisse = (t: number): number => t * t * (3 - 2 * t);

/** Un bruit de valeur, continu : des nombres tirés aux nœuds d'une grille,
 *  interpolés entre eux. C'est lui qui fait des TACHES plutôt qu'un liseré. */
function bruit(x: number, y: number, maille: number, sel: number): number {
  const u = x / maille;
  const v = y / maille;
  const ix = Math.floor(u);
  const iy = Math.floor(v);
  const fx = lisse(u - ix);
  const fy = lisse(v - iy);
  const a = hasard(ix, iy, sel);
  const b = hasard(ix + 1, iy, sel);
  const c = hasard(ix, iy + 1, sel);
  const d = hasard(ix + 1, iy + 1, sel);
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
}

/**
 * LE CHAMP DES DISTANCES, calculé une fois par zone.
 *
 * La première version mesurait, pour CHAQUE grain, sa distance à chaque pierre
 * voisine : une vingtaine de racines carrées par grain, cent dix grains par
 * case. Peindre un bloc coûtait 3,9 ms, plus de 15 ms sur un téléphone — et
 * c'étaient exactement les à-coups qu'on venait supprimer ailleurs.
 *
 * On mesure maintenant la distance aux murs aux COINS des cases seulement, une
 * fois pour toute la zone, et chaque grain l'interpole entre les quatre coins
 * de sa case. Contre un mur, la vraie distance varie en ligne droite d'un bord
 * à l'autre de la case : l'interpolation la retrouve presque exactement, et le
 * champ n'a de toute façon pas besoin d'être plus précis qu'une tache de mousse.
 *
 * Le champ se refait si les murs changent (une fissure qui cède) : on garde
 * une empreinte des murs avec lui.
 */
let champZone: Partie['zone'] | null = null;
let champSig = 0;
let champ = new Float32Array(0);

function empreinte(zone: Partie['zone']): number {
  let h = 2166136261;
  for (let y = 0; y < zone.lignes; y++)
    for (let x = 0; x < zone.cols; x++) h = Math.imul(h ^ zone.mur[y][x], 16777619);
  return h >>> 0;
}

function champDe(zone: Partie['zone']): Float32Array {
  const sig = empreinte(zone);
  if (zone === champZone && sig === champSig) return champ;
  const L = zone.cols + 1;
  const c = new Float32Array(L * (zone.lignes + 1));
  const R = Math.ceil(PORTEE_MOUSSE) + 1;
  const pierre = (cx: number, cy: number) =>
    cx < 0 || cy < 0 || cx >= zone.cols || cy >= zone.lignes || zone.mur[cy][cx] === 1;
  for (let y = 0; y <= zone.lignes; y++)
    for (let x = 0; x <= zone.cols; x++) {
      let d = PORTEE_MOUSSE;
      for (let sy = y - R; sy < y + R; sy++)
        for (let sx = x - R; sx < x + R; sx++) {
          if (!pierre(sx, sy)) continue;
          const ex = Math.max(sx - x, 0, x - (sx + 1));
          const ey = Math.max(sy - y, 0, y - (sy + 1));
          d = Math.min(d, Math.hypot(ex, ey));
        }
      c[y * L + x] = d;
    }
  champZone = zone;
  champSig = sig;
  champ = c;
  return c;
}

/**
 * Sème la mousse des cases [c0x..c1x] × [c0y..c1y]. `cam` est le coin du monde
 * qui tombe sur l'origine du contexte — la caméra du jeu, ou le coin d'un bloc.
 */
export function semerMousse(
  ctx: CanvasRenderingContext2D,
  cam: { x: number; y: number },
  zone: Partie['zone'],
  c0x: number,
  c1x: number,
  c0y: number,
  c1y: number,
): void {
  const brule = zone.cendres.length > 0;
  const traces = Array.from({ length: TEINTES }, () => new Path2D());
  const dist = champDe(zone);
  const L = zone.cols + 1;

  for (let cy = c0y; cy <= c1y; cy++)
    for (let cx = c0x; cx <= c1x; cx++) {
      if (zone.mur[cy][cx] === 1) continue;
      // Le sol brûlé de l'étage 4 : rien n'y repousse.
      if (brule && zone.cendre[cy][cx]) continue;
      const d00 = dist[cy * L + cx];
      const d10 = dist[cy * L + cx + 1];
      const d01 = dist[(cy + 1) * L + cx];
      const d11 = dist[(cy + 1) * L + cx + 1];
      // l'interpolation ne descend jamais sous le plus petit coin
      if (Math.min(d00, d10, d01, d11) >= PORTEE_MOUSSE) continue;

      for (let i = 0; i < GRAINS; i++) {
        // Deux tirages par grain, chacun coupé en morceaux : un tirage de
        // 32 bits en porte assez pour une position, ou pour trois décisions.
        const a = hasard(cx, cy, 300 + i * 2) * 4294967296;
        const b = hasard(cx, cy, 301 + i * 2) * 4294967296;
        const u = (a & 0xffff) / 65536;
        const v = (a >>> 16) / 65536;
        const d =
          d00 * (1 - u) * (1 - v) + d10 * u * (1 - v) + d01 * (1 - u) * v + d11 * u * v;
        const f = 1 - d / PORTEE_MOUSSE;
        if (f <= 0) continue;
        const px = cx + u;
        const py = cy + v;
        const n = 0.66 * bruit(px, py, MAILLE, 31) + 0.34 * bruit(px, py, MAILLE_FINE, 37);
        const humide = lisse(
          Math.max(0, Math.min(1, (bruit(px, py, MAILLE_HUMIDE, 41) - SEC) / TRANSITION)),
        );
        if (humide <= 0) continue;
        // forte au pied du mur (f²), là où c'est humide, rongée par les taches (n)
        const h = f * f * humide * (0.35 + 1.1 * n);
        const garde = lisse(Math.max(0, Math.min(1, (h - 0.1) / 0.55)));
        if ((b & 0xffff) / 65536 >= garde) continue;
        const r = 0.55 + (((b >>> 16) & 0xff) / 256) * 1.5;
        // plus claire là où elle est épaisse : une touffe dense renvoie plus
        // qu'un grain isolé, et c'est ce qui donne du modelé à la tache
        const t = Math.min(
          TEINTES - 1,
          Math.floor((((b >>> 24) / 256) * 0.6 + h * 0.5) * TEINTES),
        );
        const x = px * CASE - cam.x;
        const y = py * CASE - cam.y;
        const tr = traces[t];
        tr.moveTo(x + r, y); // sans ce saut, les ellipses se relient et le remplissage bave
        tr.ellipse(x, y, r, r * 0.75, 0, 0, TAU);
      }
    }

  for (let t = 0; t < TEINTES; t++) {
    ctx.fillStyle = VERT(40 + Math.round((t * 46) / (TEINTES - 1)));
    ctx.fill(traces[t]);
  }
}
