/**
 * LA PROGRESSION RETENUE.
 *
 * Elle vit dans le stockage du navigateur, qui n'existe pas ici — on le
 * remplace par une boîte en mémoire. Ce qui compte, ce sont les deux règles :
 * on ne garde jamais le pire, et un stockage cassé ne casse pas le jeu.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  lireProgression,
  oublierLaProgression,
  retenirBilan,
  retenirLaFin,
} from '../src/interface/sauvegarde.js';

function boite(initial: Record<string, string> = {}) {
  const donnees = { ...initial };
  return {
    getItem: (k: string) => donnees[k] ?? null,
    setItem: (k: string, v: string) => {
      donnees[k] = v;
    },
    removeItem: (k: string) => {
      delete donnees[k];
    },
    donnees,
  };
}

beforeEach(() => vi.stubGlobal('localStorage', boite()));
afterEach(() => vi.unstubAllGlobals());

describe('la progression', () => {
  it('part vide, et retient un premier étage', () => {
    expect(lireProgression()).toEqual({ atteint: 1, finVue: false, etages: {} });
    const p = retenirBilan(1, { lumiere: 0.4, lumieres: 2, lumieresTotal: 3, morts: 2 }, 2);
    expect(p.atteint).toBe(2);
    expect(p.etages[1].lumiere).toBeCloseTo(0.4, 5);
  });

  it('ne garde jamais le pire, colonne par colonne', () => {
    retenirBilan(3, { lumiere: 0.9, lumieres: 1, lumieresTotal: 4, morts: 5 }, 4);
    const p = retenirBilan(3, { lumiere: 0.2, lumieres: 4, lumieresTotal: 4, morts: 0 }, 4);
    // le meilleur de chaque colonne : c'est ce qu'on cherche — finir par tout
    // avoir, pas réussir tout d'un coup
    expect(p.etages[3]).toEqual({ lumiere: 0.9, lumieres: 4, lumieresTotal: 4, morts: 0 });
  });

  it('ne redescend jamais l’étage atteint', () => {
    retenirBilan(7, { lumiere: 1, lumieres: 1, lumieresTotal: 1, morts: 0 }, 8);
    const p = retenirBilan(2, { lumiere: 1, lumieres: 1, lumieresTotal: 1, morts: 0 }, 3);
    expect(p.atteint).toBe(8);
  });

  it('retient la fin, et sait tout oublier', () => {
    retenirLaFin();
    expect(lireProgression().finVue).toBe(true);
    oublierLaProgression();
    expect(lireProgression().finVue).toBe(false);
  });

  it('survit à un stockage abîmé, et à un stockage absent', () => {
    vi.stubGlobal('localStorage', boite({ 'lux-progression-1': '{ pas du json' }));
    expect(lireProgression().atteint).toBe(1);
    vi.stubGlobal('localStorage', undefined);
    expect(lireProgression().etages).toEqual({});
    expect(() => retenirLaFin()).not.toThrow();
  });
});
