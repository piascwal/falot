/**
 * LA LUMIÈRE NE TRAVERSE PAS LA PIERRE.
 *
 * C'est la propriété qui tient tout le jeu : on ne voit que ce qu'on éclaire,
 * et un mur arrête la lumière. Si un rayon fuit, le plan de la salle d'à côté
 * se donne gratuitement, et tout le noir ne sert plus à rien.
 *
 * Depuis que la morsure fait presque une case — il fallait bien ça pour voir
 * la pierre, et pas seulement un liseré — cette propriété ne tient plus que
 * par le bornage à la SORTIE de la case touchée. Elle mérite donc un test qui
 * la tient, et pas un commentaire.
 */

import { describe, expect, it } from 'vitest';
import { CASE } from '../src/coeur/dimensions.js';
import { TAU } from '../src/coeur/geometrie.js';
import { genererZone } from '../src/coeur/monde/generation.js';
import { solide } from '../src/coeur/monde/grille.js';
import type { Zone } from '../src/coeur/types.js';
import {
  pierreVue,
  portéesCone,
  portéesRond,
  RAYONS,
  RAYONS_ROND,
} from '../src/rendu/lumiere.js';

/** Un étage, ou une erreur franche : un test sur `null` ne prouve rien. */
function etage(grain: string, numero: number): Zone {
  const z = genererZone(grain, numero, 2);
  if (!z) throw new Error(`l'étage « ${grain} » n'a pas été généré`);
  return z;
}

/** Les cases pleines que ce segment traverse, dans l'ordre. */
function pierresTraversees(
  zone: Zone,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): number {
  const d = Math.hypot(x1 - x0, y1 - y0);
  const pas = CASE * 0.05; // fin : on cherche une fuite, pas une moyenne
  let dedans = false;
  let combien = 0;
  for (let t = 0; t <= d; t += pas) {
    const u = t / (d || 1);
    const cx = Math.floor((x0 + (x1 - x0) * u) / CASE);
    const cy = Math.floor((y0 + (y1 - y0) * u) / CASE);
    const plein = solide(zone, cx, cy);
    if (plein && !dedans) combien++;
    dedans = plein;
  }
  return combien;
}

describe('la lumière et la pierre', () => {
  it('ne traverse jamais un mur, d’où qu’on l’allume', () => {
    // Trois étages tirés au sort, et on allume depuis chaque case libre : des
    // milliers de rayons, dans des plans qu'on n'a pas choisis.
    let rayons = 0;
    for (const grain of ['FUITE-1', 'FUITE-2', 'FUITE-3']) {
      const zone = etage(grain, 4);
      for (let cy = 1; cy < zone.lignes - 1; cy += 2)
        for (let cx = 1; cx < zone.cols - 1; cx += 2) {
          if (solide(zone, cx, cy)) continue;
          const x = (cx + 0.5) * CASE;
          const y = (cy + 0.5) * CASE;
          const portee = CASE * 2.5;
          const p = portéesRond(zone, x, y, portee);
          for (let i = 0; i < RAYONS_ROND; i++) {
            const a = (i / RAYONS_ROND) * TAU;
            const bx = x + Math.cos(a) * p[i];
            const by = y + Math.sin(a) * p[i];
            rayons++;
            // Une seule pierre mordue, jamais deux : la deuxième serait de
            // l'autre côté du mur.
            expect(
              pierresTraversees(zone, x, y, bx, by),
              `rayon ${i} depuis ${cx},${cy} (${grain})`,
            ).toBeLessThanOrEqual(1);
          }
        }
    }
    expect(rayons, 'on a bien tiré de quoi conclure').toBeGreaterThan(5000);
  });

  it('vaut aussi pour un faisceau, qui mord désormais la paroi', () => {
    // Le cône s'arrêtait AVANT la pierre : un faisceau braqué sur un mur le
    // laissait noir. Il mord maintenant comme les autres, et il ne doit pas
    // fuir davantage.
    const zone = etage('FUITE-CONE', 5);
    let rayons = 0;
    for (let cy = 1; cy < zone.lignes - 1; cy += 2)
      for (let cx = 1; cx < zone.cols - 1; cx += 2) {
        if (solide(zone, cx, cy)) continue;
        const x = (cx + 0.5) * CASE;
        const y = (cy + 0.5) * CASE;
        for (let k = 0; k < 4; k++) {
          const angle = (k / 4) * TAU;
          const p = portéesCone(zone, x, y, angle, CASE * 5, 0.34);
          for (let i = 0; i <= RAYONS; i++) {
            const a = angle - 0.34 + (2 * 0.34 * i) / RAYONS;
            rayons++;
            expect(
              pierresTraversees(zone, x, y, x + Math.cos(a) * p[i], y + Math.sin(a) * p[i]),
            ).toBeLessThanOrEqual(1);
          }
        }
      }
    expect(rayons).toBeGreaterThan(2000);
  });

  it('éclaire la pierre par les côtés ET par les coins', () => {
    // LA RÈGLE, et elle vaut pour les trois cas qu'on a ratés tour à tour :
    // l'angle saillant, l'angle rentrant, et la pierre cachée derrière.
    const N = 15;
    const mur: number[][] = [];
    for (let y = 0; y < N; y++) {
      const l: number[] = [];
      // une salle carrée de 5 à 10 : ses quatre coins sont des angles RENTRANTS
      for (let x = 0; x < N; x++) l.push(x >= 5 && x <= 10 && y >= 5 && y <= 10 ? 0 : 1);
      mur.push(l);
    }
    const zone = {
      mur,
      cols: N,
      lignes: N,
      porteDe: mur.map(() => []),
      fissureDe: null,
      versionPortes: 0,
    } as unknown as Zone;
    const x = 7.5 * CASE;
    const y = 7.5 * CASE;
    const portee = CASE * 6;
    const p = portéesRond(zone, x, y, portee);
    const vue = (cx: number, cy: number) => pierreVue(zone, x, y, cx, cy, portee, p);

    // LE COIN DE LA SALLE. Aucun rayon ne l'atteint — les deux murs qui le
    // bordent bloquent la diagonale — et pourtant il touche le sol par un
    // coin. C'est celui qui restait noir entre deux murs éclairés.
    expect(vue(4, 4), 'angle rentrant haut-gauche').toBe(true);
    expect(vue(11, 4), 'angle rentrant haut-droit').toBe(true);
    expect(vue(4, 11), 'angle rentrant bas-gauche').toBe(true);
    expect(vue(11, 11), 'angle rentrant bas-droit').toBe(true);

    // les murs eux-mêmes, évidemment
    expect(vue(7, 4), 'le mur du haut').toBe(true);
    expect(vue(4, 7), 'le mur de gauche').toBe(true);

    // ET PAS PLUS LOIN : la pierre du deuxième rang ne touche aucun sol vu,
    // donc elle reste noire. C'est ce qui empêche la salle d'à côté d'exister.
    expect(vue(7, 3), 'deuxième rang, au-dessus du mur').toBe(false);
    expect(vue(3, 3), 'deuxième rang, en diagonale').toBe(false);
  });
});
