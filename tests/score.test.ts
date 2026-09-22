/**
 * LA NOTE D'UN ÉTAGE — voir `interface/score.ts`. Trois passages mesurés à la
 * main, pour que les seuils (0,8 et 0,5) restent ce qu'on croit qu'ils sont
 * si quelqu'un retouche la formule un jour.
 */

import { describe, expect, it } from 'vitest';
import type { Trace } from '../src/interface/sauvegarde.js';
import { etoilesDe, noteDe, parfait } from '../src/interface/score.js';

const trace = (t: Partial<Trace>): Trace => ({
  lumiere: 0,
  lumieres: 0,
  lumieresTotal: 0,
  morts: 0,
  ...t,
});

describe('la note d’un étage', () => {
  it('vaut 1 quand tout est éclairé, toutes les lumières remontées, jamais pris', () => {
    const t = trace({ lumiere: 1, lumieres: 5, lumieresTotal: 5, morts: 0 });
    expect(noteDe(t)).toBeCloseTo(1);
    expect(etoilesDe(t)).toBe(3);
    expect(parfait(t)).toBe(true);
  });

  it('reste au-dessus de deux étoiles même mal éclairé si le reste compense', () => {
    // 0,3 d'éclairé, mais tout remonté et jamais pris : (0,3 + 1 + 1) / 3
    // ≈ 0,77 — sous le seuil des trois étoiles (0,8), mais bien au-dessus de
    // celui des deux (0,5).
    const t = trace({ lumiere: 0.3, lumieres: 4, lumieresTotal: 4, morts: 0 });
    expect(noteDe(t)).toBeCloseTo((0.3 + 1 + 1) / 3);
    expect(etoilesDe(t)).toBe(2);
    expect(parfait(t)).toBe(false); // pas tout éclairé : pas sans faute
  });

  it('tombe à une étoile quand tout est mauvais à la fois', () => {
    const t = trace({ lumiere: 0.1, lumieres: 0, lumieresTotal: 5, morts: 6 });
    const n = noteDe(t);
    expect(n).toBeCloseTo((0.1 + 0 + 1 / 7) / 3);
    expect(n).toBeLessThan(0.5);
    expect(etoilesDe(t)).toBe(1);
    expect(parfait(t)).toBe(false);
  });

  it('tient deux étoiles dans l’entre-deux', () => {
    const t = trace({ lumiere: 0.6, lumieres: 3, lumieresTotal: 5, morts: 1 });
    const n = noteDe(t);
    expect(n).toBeGreaterThanOrEqual(0.5);
    expect(n).toBeLessThan(0.8);
    expect(etoilesDe(t)).toBe(2);
  });

  it('une lumièresTotal à zéro ne casse rien : la part remontée vaut 1', () => {
    // Un étage sans aucune lumière à sauver (mesuré nulle part encore, mais
    // le cas ne doit pas produire de division par zéro ni de NaN).
    const t = trace({ lumiere: 1, lumieres: 0, lumieresTotal: 0, morts: 0 });
    expect(noteDe(t)).toBeCloseTo(1);
    expect(Number.isNaN(noteDe(t))).toBe(false);
  });
});
