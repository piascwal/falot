/**
 * La grille, sur des plans écrits à la main : c'est là que les règles de
 * collision et de ligne de vue se vérifient au cas par cas, sans dépendre de ce
 * que le générateur a bien voulu tirer.
 */

import { describe, expect, it } from 'vitest';
import { CASE } from '../src/coeur/dimensions.js';
import { TAU } from '../src/coeur/geometrie.js';
import {
  degager,
  distances,
  routeVers,
  solide,
  vueLibre,
} from '../src/coeur/monde/grille.js';
import type { Porte, Zone } from '../src/coeur/types.js';

/**
 * Fabrique une zone minimale depuis un dessin. `#` mur, `.` sol, `|` porte.
 * Seuls les champs qu'on teste sont remplis : le reste n'a rien à faire ici.
 */
function plan(dessin: string[]): Zone {
  const lignes = dessin.length;
  const cols = dessin[0].length;
  const mur: number[][] = [];
  const portes: Porte[] = [];
  const porteDe: (Porte | null)[][] = [];
  for (let cy = 0; cy < lignes; cy++) {
    mur.push(new Array<number>(cols).fill(1));
    porteDe.push(new Array<Porte | null>(cols).fill(null));
    for (let cx = 0; cx < cols; cx++) {
      const c = dessin[cy][cx];
      if (c === '#') continue;
      mur[cy][cx] = 0;
      if (c === '|') {
        const pt: Porte = {
          cx,
          cy,
          x: (cx + 0.5) * CASE,
          y: (cy + 0.5) * CASE,
          verticale: true,
          ouverte: 0,
          sens: 1,
          gond: 1,
          phase: 0,
        };
        portes.push(pt);
        porteDe[cy][cx] = pt;
      }
    }
  }
  return {
    mur,
    cols,
    lignes,
    salles: [],
    numero: 0,
    grain: 'PLAN',
    nom: '',
    traits: [],
    lueurs: [],
    persos: [],
    torches: [],
    portes,
    porteDe,
    fissures: [],
    fissureDe: porteDe.map((r) => r.map(() => null)),
    versionPortes: 0,
    braises: [],
    reprises: [],
    murmures: [],
    depart: { x: CASE * 1.5, y: CASE * 1.5 },
    sortie: { x: CASE * 1.5, y: CASE * 1.5, r: CASE * 0.55, vue: false, ames: 0 },
    requis: 1,
    largeur: cols * CASE,
    hauteur: lignes * CASE,
    longueur: 0,
  };
}

const centre = (cx: number, cy: number) => ({ x: (cx + 0.5) * CASE, y: (cy + 0.5) * CASE });

describe('solide', () => {
  const z = plan(['#####', '#...#', '#.|.#', '#...#', '#####']);

  it('tient le bord de la carte pour de la pierre', () => {
    expect(solide(z, -1, 1)).toBe(true);
    expect(solide(z, 99, 1)).toBe(true);
    expect(solide(z, 1, 1)).toBe(false);
  });

  it('compte une porte fermée comme un mur, et plus du tout une fois ouverte', () => {
    const porte = z.portes[0];
    expect(solide(z, porte.cx, porte.cy)).toBe(true);
    porte.ouverte = 1;
    expect(solide(z, porte.cx, porte.cy)).toBe(false);
    // à mi-course elle barre encore : c'est le seuil de 0,5 qui décide
    porte.ouverte = 0.4;
    expect(solide(z, porte.cx, porte.cy)).toBe(true);
  });
});

describe('vueLibre', () => {
  // biome-ignore format: un plan se lit comme un dessin, une ligne par ligne
  const z = plan([
    '#######',
    '#.....#',
    '#.###.#',
    '#.....#',
    '#######',
  ]);

  it('voit le long d’un couloir dégagé', () => {
    const a = centre(1, 1);
    const b = centre(5, 1);
    expect(vueLibre(z, a.x, a.y, b.x, b.y)).toBe(true);
  });

  it('ne voit pas à travers un bloc de pierre', () => {
    const a = centre(2, 1);
    const b = centre(2, 3);
    expect(vueLibre(z, a.x, a.y, b.x, b.y)).toBe(false);
  });

  it('ne voit pas à travers une porte fermée, et voit quand elle s’ouvre', () => {
    const p = plan(['#####', '#.|.#', '#####']);
    const a = centre(1, 1);
    const b = centre(3, 1);
    expect(vueLibre(p, a.x, a.y, b.x, b.y)).toBe(false);
    p.portes[0].ouverte = 1;
    expect(vueLibre(p, a.x, a.y, b.x, b.y)).toBe(true);
  });
});

describe('distances', () => {
  it('rend -1 pour ce qui n’est pas atteignable', () => {
    const z = plan(['#####', '#.#.#', '#.#.#', '#####']);
    const d = distances(z, { cx: 1, cy: 1 });
    expect(d[1][1]).toBe(0);
    expect(d[2][1]).toBe(1);
    expect(d[1][3]).toBe(-1); // l'autre couloir, séparé par la pierre
  });

  it('ferme le monde d’une sentinelle aux portes, même grandes ouvertes', () => {
    const z = plan(['#####', '#.|.#', '#####']);
    z.portes[0].ouverte = 1;
    // Un Guet ne franchit AUCUNE porte : c'est ce qui fait d'une porte un abri
    // sur lequel on peut compter.
    expect(distances(z, { cx: 1, cy: 1 }, true)[1][3]).toBe(-1);
    expect(distances(z, { cx: 1, cy: 1 }, false)[1][3]).toBe(2);
  });
});

describe('routeVers', () => {
  it('contourne la pierre plutôt que de la traverser', () => {
    // biome-ignore format: un plan se lit comme un dessin, une ligne par ligne
    const z = plan([
      '#######',
      '#.....#',
      '#.###.#',
      '#.....#',
      '#######',
    ]);
    const a = centre(1, 1);
    const b = centre(5, 1);
    const route = routeVers(z, a.x, a.y, b.x, b.y)!;
    expect(route).not.toBeNull();
    expect(route.length).toBeGreaterThan(0);
    // chaque pas du chemin est sur du sol, et chaque pas est voisin du précédent
    let avant = a;
    for (const pas of route) {
      expect(solide(z, Math.floor(pas.x / CASE), Math.floor(pas.y / CASE))).toBe(false);
      expect(Math.hypot(pas.x - avant.x, pas.y - avant.y)).toBeLessThanOrEqual(CASE * 1.01);
      avant = pas;
    }
    expect(Math.hypot(avant.x - b.x, avant.y - b.y)).toBeLessThan(CASE);
  });

  it('ne rend rien quand il n’y a pas de chemin', () => {
    const z = plan(['#####', '#.#.#', '#####']);
    const a = centre(1, 1);
    const b = centre(3, 1);
    expect(routeVers(z, a.x, a.y, b.x, b.y)).toBeNull();
  });
});

describe('degager', () => {
  it('repousse un corps qui mord la pierre, dans les huit directions', () => {
    // On reproduit ce qu'une image de jeu produit : un chevauchement de
    // quelques pixels dans la paroi, pas une téléportation dans la masse.
    // `degager` n'a jamais prétendu extraire un corps posé au fond d'un mur —
    // c'est le rôle des bornes de `majJoueur`, et c'est vérifié dans
    // `partie.test.ts` en poussant contre les murs pendant six secondes.
    const z = plan(['#####', '#...#', '#####']);
    const demi = CASE * 0.25;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU;
      const corps = {
        x: CASE * 2.5 + Math.cos(a) * CASE * 0.45,
        y: CASE * 1.5 + Math.sin(a) * CASE * 0.45,
        vx: Math.cos(a) * 400,
        vy: Math.sin(a) * 400,
        vsx: 0,
        vsy: 0,
      };
      degager(z, corps, demi);
      expect(solide(z, Math.floor(corps.x / CASE), Math.floor(corps.y / CASE))).toBe(false);
      // et son enveloppe est sortie de la pierre, pas seulement son centre.
      // On sonde juste en dedans du bord : `degager` pose le corps AU CONTACT
      // de la paroi, et une sonde pile sur la frontière retomberait dans la
      // case du mur par simple arrondi.
      const bord = demi - 0.01;
      for (const [ox, oy] of [
        [-bord, -bord],
        [bord, -bord],
        [-bord, bord],
        [bord, bord],
      ]) {
        expect(
          solide(z, Math.floor((corps.x + ox) / CASE), Math.floor((corps.y + oy) / CASE)),
        ).toBe(false);
      }
    }
  });

  it('écrase la matière sur l’axe du choc — un mur doit se sentir', () => {
    const z = plan(['#####', '#...#', '#####']);
    const corps = { x: CASE * 1.1, y: CASE * 1.5, vx: -500, vy: 0, vsx: 0, vsy: 0 };
    degager(z, corps, CASE * 0.25);
    expect(corps.vx).toBe(0);
    expect(corps.vsx).toBeLessThan(0); // il s'aplatit horizontalement
    expect(corps.vsy).toBeGreaterThan(0); // et se gonfle verticalement
  });
});
