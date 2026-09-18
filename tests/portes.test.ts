/**
 * LES PORTES : des battants, pas des planches.
 *
 * Une porte tourne sur un gond, et un gond ne tient à rien s'il n'est pas
 * scellé dans la pierre. Quand un passage fait deux cases de haut, les deux
 * battants doivent donc prendre appui chacun sur SON montant — ce qui les fait
 * mécaniquement s'ouvrir en sens inverse, comme des portes battantes.
 */

import { describe, expect, it } from 'vitest';
import { ETAGES_ECRITS, zoneEcrite } from '../src/coeur/monde/ecrits.js';
import { genererZone } from '../src/coeur/monde/generation.js';
import type { Porte, Zone } from '../src/coeur/types.js';

/** La case où le gond est scellé, perpendiculairement au battant. */
function cotePivot(pt: Porte): { cx: number; cy: number } {
  return pt.verticale
    ? { cx: pt.cx, cy: pt.cy + (pt.gond === 1 ? -1 : 1) }
    : { cx: pt.cx + (pt.gond === 1 ? -1 : 1), cy: pt.cy };
}

const pierreEn = (z: Zone, cx: number, cy: number) =>
  cx < 0 || cy < 0 || cx >= z.cols || cy >= z.lignes || z.mur[cy][cx] === 1;

function verifier(z: Zone): void {
  for (const pt of z.portes) {
    const c = cotePivot(pt);
    expect(
      pierreEn(z, c.cx, c.cy),
      `porte ${pt.cx},${pt.cy} : gond dans le vide en ${c.cx},${c.cy}`,
    ).toBe(true);
  }
}

describe('les gonds', () => {
  it('sont scellés dans la pierre, sur les étages écrits', () => {
    for (const numero of Object.keys(ETAGES_ECRITS).map(Number)) {
      const z = zoneEcrite(numero);
      expect(z).not.toBe(null);
      verifier(z as Zone);
    }
  });

  it('sont scellés dans la pierre, sur les étages tirés au sort', () => {
    for (let i = 0; i < 60; i++) verifier(genererZone(`GOND-${i}`, 5, 3)!);
  });

  it('s’opposent quand deux battants ferment le même passage', () => {
    // Le couloir de l'escorte fait deux cases de haut : ses deux battants se
    // touchent, donc le gond de l'un est en haut et celui de l'autre en bas.
    const z = zoneEcrite(1)!;
    const paires = new Map<string, Porte[]>();
    for (const pt of z.portes) {
      const cle = pt.verticale ? `v${pt.cx}` : `h${pt.cy}`;
      const voisines = paires.get(cle) ?? [];
      voisines.push(pt);
      paires.set(cle, voisines);
    }
    let vues = 0;
    for (const groupe of paires.values())
      for (const a of groupe)
        for (const b of groupe) {
          const colles = a.verticale ? b.cy === a.cy + 1 : b.cx === a.cx + 1;
          if (!colles) continue;
          vues++;
          expect(a.gond).not.toBe(b.gond);
        }
    expect(vues).toBeGreaterThan(0);
  });
});
