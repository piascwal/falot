/**
 * LE SEMIS DU DÉCOR — voir `rendu/semis.ts`.
 *
 * Ces tests ne vérifient pas que le hasard « a l'air uniforme » : la version
 * fautive le paraissait aussi, tirage par tirage. Ils vérifient la seule
 * propriété qui manquait, l'INDÉPENDANCE ENTRE SELS — filtrer sur un tirage ne
 * doit rien dire des autres. C'est exactement ce qui faisait que tout le lierre
 * du jeu portait la même variante sans que personne le voie.
 */

import { describe, expect, it } from 'vitest';
import { hasard, varianteDe } from '../src/rendu/semis.js';

/** Un carré de cases assez grand pour que les comptes veuillent dire quelque
 *  chose, et assez petit pour rester instantané. */
const COTE = 220;

const surLaGrille = (f: (cx: number, cy: number) => void): void => {
  for (let cy = 0; cy < COTE; cy++) for (let cx = 0; cx < COTE; cx++) f(cx, cy);
};

describe('le semis du décor', () => {
  it('rend un nombre entre 0 et 1, stable pour une case', () => {
    expect(hasard(3, 7, 1)).toBe(hasard(3, 7, 1));
    surLaGrille((cx, cy) => {
      const v = hasard(cx, cy, 2);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    });
  });

  it('sépare vraiment deux sels : la même case ne donne pas deux fois la même chose', () => {
    let pareils = 0;
    surLaGrille((cx, cy) => {
      if (Math.abs(hasard(cx, cy, 1) - hasard(cx, cy, 2)) < 1e-9) pareils++;
    });
    expect(pareils).toBe(0);
  });

  it('étale les quatre variantes sur toute la grille', () => {
    const v = [0, 0, 0, 0];
    surLaGrille((cx, cy) => {
      v[varianteDe(cx, cy, 5, 4)]++;
    });
    const attendu = (COTE * COTE) / 4;
    for (const n of v) expect(n).toBeGreaterThan(attendu * 0.9);
  });

  /**
   * LE TEST QUI COMPTE. On reproduit ce que fait `sol.ts` : on garde une case
   * sur huit avec un sel, puis on tire sa variante avec un autre. Avec le
   * ou-exclusif seul, les quatre comptes valaient `0 / 0 / 0 / tout`.
   */
  it('garde les quatre variantes même sur les cases retenues par un autre tirage', () => {
    for (const [selFiltre, selVariante, seuil] of [
      [1, 18, 0.13], // le lierre, tel que le jeu le sème
      [4, 23, 0.22], // la mousse
      [8, 26, 0.13], // les lampes mortes
    ] as const) {
      const v = [0, 0, 0, 0];
      let retenues = 0;
      surLaGrille((cx, cy) => {
        if (hasard(cx, cy, selFiltre) >= seuil) return;
        retenues++;
        v[varianteDe(cx, cy, selVariante, 4)]++;
      });
      expect(retenues).toBeGreaterThan(1000);
      // chacune doit peser près d'un quart : on tolère large, on traque un
      // effondrement, pas un écart statistique
      for (const n of v) expect(n / retenues).toBeGreaterThan(0.18);
    }
  });

  it('garde les familles réparties sur les cases retenues', () => {
    // le barème de `sol.ts` : 25 % / 21 % / 19 % / 18 % / 17 %
    const bornes = [0.25, 0.46, 0.65, 0.83, 1];
    const fam = [0, 0, 0, 0, 0];
    let retenues = 0;
    surLaGrille((cx, cy) => {
      if (hasard(cx, cy, 8) >= 0.13) return;
      retenues++;
      const f = hasard(cx, cy, 12);
      fam[bornes.findIndex((b) => f < b)]++;
    });
    expect(retenues).toBeGreaterThan(1000);
    for (const n of fam) expect(n / retenues).toBeGreaterThan(0.12);
  });
});
