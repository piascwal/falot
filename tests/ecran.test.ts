/**
 * LE GARDE-FOU DE L'AFFICHAGE.
 *
 * Sur téléphone, revenir d'une autre application cassait l'écran une fois sur
 * trois : le navigateur avait repris la mémoire du canevas et remis le
 * contexte à zéro, ou la fenêtre avait changé de taille sans prévenir. Le jeu
 * ne se fie donc à aucun événement — il compare, à chaque image, ce que le
 * canevas EST à ce qu'il devrait être.
 *
 * On se passe ici d'un vrai navigateur : la fonction ne lit que quatre
 * nombres et repose une transformation, ça se simule.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Ecran } from '../src/rendu/ecran.js';
import {
  QLUM,
  redimensionner,
  surveillerCadence,
  veillerSurLEcran,
} from '../src/rendu/ecran.js';

/** Un écran de papier : juste ce que le garde-fou regarde. Le canevas porte sa
 *  taille AFFICHÉE (`clientWidth` / `clientHeight`), parce que c'est elle qu'on
 *  mesure — et pas celle de la fenêtre. */
function ecranFactice(W = 390, H = 700, DPR = 2): Ecran {
  const toile = (cw = 0, ch = 0) =>
    ({ width: 0, height: 0, clientWidth: cw, clientHeight: ch }) as HTMLCanvasElement;
  const ctx = { setTransform: vi.fn() } as unknown as CanvasRenderingContext2D;
  const e = {
    canvas: toile(W, H),
    ctx,
    lum: toile(),
    lctx: { setTransform: vi.fn() } as unknown as CanvasRenderingContext2D,
    trou: toile(),
    tctx: { setTransform: vi.fn() } as unknown as CanvasRenderingContext2D,
    lueur: toile(),
    luctx: { setTransform: vi.fn() } as unknown as CanvasRenderingContext2D,
    dessus: toile(),
    dctx: { setTransform: vi.fn() } as unknown as CanvasRenderingContext2D,
    W,
    H,
    DPR,
    cam: { x: 0, y: 0 },
    palier: 0,
    fenetre: [],
    coutsImage: [],
  } satisfies Ecran;
  e.canvas.width = Math.round(W * DPR);
  e.canvas.height = Math.round(H * DPR);
  e.lum.width = Math.ceil(e.canvas.width * QLUM);
  e.lum.height = Math.ceil(e.canvas.height * QLUM);
  e.trou.width = e.lum.width;
  e.trou.height = e.lum.height;
  return e;
}

const fenetre = (w: number, h: number, dpr = 2) => {
  vi.stubGlobal('window', { innerWidth: w, innerHeight: h, devicePixelRatio: dpr });
};

afterEach(() => vi.unstubAllGlobals());

describe('la taille de l’écran', () => {
  it('suit le canevas affiché, pas la fenêtre', () => {
    // LE DÉFAUT D'IPAD. `window.innerHeight` est la hauteur de la MISE EN
    // PAGE : elle compte la bande qui passe sous la barre du navigateur. La
    // mémoire du canevas était donc plus haute que le morceau qu'on voit, et
    // le bas de la carte se retrouvait coupé hors de l'écran. C'est le
    // canevas, étiré par le CSS sur la hauteur réellement affichée, qui a
    // raison.
    fenetre(820, 1180); // ce que dit la fenêtre
    const e = ecranFactice(820, 1024); // ce qu'on voit vraiment
    redimensionner(e);
    expect(e.H).toBe(1024);
    expect(e.canvas.height).toBe(Math.round(1024 * e.DPR));
  });

  it('retombe sur la fenêtre tant que le canevas n’est pas dans la page', () => {
    fenetre(390, 700);
    const e = ecranFactice(0, 0);
    redimensionner(e);
    expect(e.W).toBe(390);
    expect(e.H).toBe(700);
  });
});

describe('veiller sur l’écran', () => {
  it('ne touche à rien quand tout est en place, mais repose la transformation', () => {
    fenetre(390, 700);
    const e = ecranFactice();
    expect(veillerSurLEcran(e)).toBe(false);
    // la transformation ne survit pas à une remise à zéro du contexte : on la
    // repose à chaque image, sinon tout se dessine à l'échelle 1
    expect(e.ctx.setTransform).toHaveBeenCalledWith(2, 0, 0, 2, 0, 0);
  });

  it('rattrape un écran qui a changé de taille sans prévenir', () => {
    fenetre(390, 700);
    const e = ecranFactice(390, 700);
    // la barre d'adresse s'est dépliée pendant qu'on était ailleurs : c'est le
    // CANEVAS qui rétrécit, puisque le CSS l'étire sur la hauteur visible
    Object.defineProperty(e.canvas, 'clientHeight', { value: 480, configurable: true });
    expect(veillerSurLEcran(e)).toBe(true);
    expect(e.H).toBe(480);
    expect(e.canvas.height).toBe(Math.round(480 * e.DPR));
  });

  it('rattrape un canevas dont le navigateur a repris la mémoire', () => {
    fenetre(390, 700);
    const e = ecranFactice();
    e.canvas.width = 300; // vidé, donc redimensionné à côté de nos dos
    expect(veillerSurLEcran(e)).toBe(true);
    expect(e.canvas.width).toBe(Math.round(e.W * e.DPR));
    expect(e.lum.width).toBe(Math.ceil(e.canvas.width * QLUM));
  });

  it('rattrape le calque d’obscurité tout seul', () => {
    fenetre(390, 700);
    const e = ecranFactice();
    e.lum.width = 7;
    expect(veillerSurLEcran(e)).toBe(true);
    expect(e.lum.width).toBe(Math.ceil(e.canvas.width * QLUM));
  });
});

/** Une seconde d'images, toutes à la même cadence. */
const seconde = (e: Ecran, dt: number) => {
  for (let i = 0; i < 60; i++) surveillerCadence(e, dt);
};

describe('la finesse qui s’adapte', () => {
  it('laisse passer un à-coup : une seconde lente seule ne baisse rien', () => {
    // Le piège du S21 : l'entrée dans une zone fait une seconde lente, la
    // suivante redevient normale — et passait pour le gain d'une baisse.
    fenetre(390, 700, 3);
    const e = ecranFactice(390, 700, 2);
    seconde(e, 0.016);
    seconde(e, 0.04);
    seconde(e, 0.016);
    seconde(e, 0.04);
    seconde(e, 0.016);
    expect(e.palier).toBe(0);
    expect(e.DPR).toBe(2);
  });

  it('ne juge pas la première seconde, celle où tout se prépare', () => {
    fenetre(390, 700, 3);
    const e = ecranFactice(390, 700, 2);
    seconde(e, 0.04);
    expect(e.palier).toBe(0);
  });

  it('garde une baisse qui a servi', () => {
    fenetre(390, 700, 3);
    const e = ecranFactice(390, 700, 2);
    seconde(e, 0.04);
    seconde(e, 0.03);
    seconde(e, 0.03); // trop lent, et ça dure : on baisse d'un cran
    expect(e.palier).toBe(1);
    seconde(e, 0.016); // et c'est nettement mieux
    expect(e.palier).toBe(1);
    expect(e.figee).toBeFalsy();
  });

  it('défait une baisse qui n’a rien changé, et n’y touche plus', () => {
    // LE CAS DU GALAXY S21 : 19 ms par image à toutes les finesses, parce que
    // ce qui coûtait ne dépendait pas du nombre de pixels. On descendait
    // jusqu'à 288 × 574 pour rien — le jeu devenait flou, pas plus rapide.
    fenetre(390, 700, 3);
    const e = ecranFactice(390, 700, 2);
    seconde(e, 0.04);
    seconde(e, 0.025);
    seconde(e, 0.025);
    expect(e.palier).toBe(1);
    seconde(e, 0.025); // pas mieux
    expect(e.palier).toBe(0);
    expect(e.figee).toBe(true);
    seconde(e, 0.05);
    seconde(e, 0.05);
    expect(e.palier).toBe(0);
    expect(e.DPR).toBe(2);
  });
});
