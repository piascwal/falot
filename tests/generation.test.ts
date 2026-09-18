/**
 * Ce que le générateur PROMET. Sur une grille, « peut-on aller d'ici à là » a
 * une réponse exacte : on la vérifie pour de bon, sur des centaines de graines,
 * plutôt que d'y croire.
 */

import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { CASE } from '../src/coeur/dimensions.js';
import { EMOTIONS } from '../src/coeur/formes.js';
import { genererZone } from '../src/coeur/monde/generation.js';
import { distances } from '../src/coeur/monde/grille.js';
import type { Point, Zone } from '../src/coeur/types.js';

/** Les distances depuis le seuil d'entrée de la zone. */
const depuisLeDepart = (z: Zone) =>
  distances(z, {
    cx: Math.floor(z.depart.x / CASE),
    cy: Math.floor(z.depart.y / CASE),
  });

const atteignable = (d: number[][], q: Point) =>
  d[Math.floor(q.y / CASE)]?.[Math.floor(q.x / CASE)] >= 0;

describe('genererZone', () => {
  it('rend une zone pour n’importe quelle graine et n’importe quel étage', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 12 }),
        fc.integer({ min: 2, max: 12 }),
        (g, n) => {
          expect(genererZone(g, n, 2)).not.toBeNull();
        },
      ),
      { numRuns: 120 },
    );
  });

  it('ne pose jamais rien d’inatteignable : seuil, lueurs, personnages', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 4000 }),
        fc.integer({ min: 2, max: 9 }),
        (i, n) => {
          const z = genererZone(`LUX-${i}`, n, 2)!;
          const d = depuisLeDepart(z);
          expect(atteignable(d, z.sortie)).toBe(true);
          for (const l of z.lueurs) expect(atteignable(d, l)).toBe(true);
          for (const p of z.persos) expect(atteignable(d, p)).toBe(true);
        },
      ),
      { numRuns: 150 },
    );
  });

  it('tient ses quotas : assez d’âmes pour ouvrir le Seuil, et au moins deux Guets', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 4000 }),
        fc.integer({ min: 2, max: 9 }),
        (i, n) => {
          const z = genererZone(`LUX-${i}`, n, 2)!;
          const ames = z.persos.filter((p) => p.emotion !== EMOTIONS.COLERE).length;
          const guets = z.persos.length - ames;
          // Le Seuil doit rester ouvrable même si une âme est perdue en route :
          // c'est exactement la raison du « −1 » dans le calcul de `requis`.
          expect(z.requis).toBeLessThanOrEqual(ames - 1);
          expect(z.requis).toBeGreaterThanOrEqual(2);
          expect(guets).toBeGreaterThanOrEqual(2);
        },
      ),
      { numRuns: 150 },
    );
  });

  it('ne pose ni torche ni porte dans la pierre', () => {
    for (let i = 0; i < 60; i++) {
      const z = genererZone(`T-${i}`, 5, 3)!;
      for (const t of z.torches) {
        // la torche est décalée vers sa paroi : c'est sa CASE qui doit être libre
        const cx = Math.floor(t.x / CASE);
        const cy = Math.floor(t.y / CASE);
        const dansLaPierre = z.mur[cy][cx] === 1;
        const voisineLibre = [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ].some(([ox, oy]) => z.mur[cy + oy]?.[cx + ox] === 0);
        expect(dansLaPierre ? voisineLibre : true).toBe(true);
      }
      for (const pt of z.portes) expect(z.mur[pt.cy][pt.cx]).toBe(0);
    }
  });

  it('ne fait jamais d’une fissure un passage obligé', () => {
    // C'est la règle exactement inverse de celle du prologue (voir
    // `prologue.test.ts`) : là-bas casser un mur est imposé pour enseigner le
    // caillou ; ici une fente n'ouvre qu'un raccourci, et la zone reste
    // entièrement parcourable sans rien casser. Les distances sont calculées
    // sur la pierre telle qu'elle est — une fissure est un mur.
    for (let i = 0; i < 80; i++) {
      const z = genererZone(`FENTE-${i}`, 5, 3)!;
      const d = depuisLeDepart(z);
      expect(atteignable(d, z.sortie)).toBe(true);
      for (const q of z.persos) expect(atteignable(d, q)).toBe(true);
      for (const l of z.lueurs) expect(atteignable(d, l)).toBe(true);
    }
  });

  it('est déterministe : même graine, même plan, jusqu’aux personnages', () => {
    const a = genererZone('LUX-1042', 4, 2)!;
    const b = genererZone('LUX-1042', 4, 2)!;
    expect(empreinte(a)).toBe(empreinte(b));
    expect(empreinte(genererZone('LUX-1043', 4, 2)!)).not.toBe(empreinte(a));
  });
});

/** Une empreinte lisible d'une zone : ce qui doit rester stable pour une graine. */
function empreinte(z: Zone): string {
  return [
    z.cols,
    z.lignes,
    z.salles.length,
    z.mur.map((r) => r.join('')).join('|'),
    z.lueurs.map((l) => `${l.x},${l.y},${l.type}`).join(';'),
    z.persos.map((p) => `${p.x},${p.y},${p.emotion},${p.ronde.length}`).join(';'),
    z.portes.map((q) => `${q.cx},${q.cy}`).join(';'),
    z.fissures.map((f) => `${f.cx},${f.cy}`).join(';'),
    z.requis,
  ].join('#');
}
