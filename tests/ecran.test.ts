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
import { QLUM, veillerSurLEcran } from '../src/rendu/ecran.js';

/** Un écran de papier : juste ce que le garde-fou regarde. */
function ecranFactice(W = 390, H = 700, DPR = 2): Ecran {
  const toile = () => ({ width: 0, height: 0 }) as HTMLCanvasElement;
  const ctx = { setTransform: vi.fn() } as unknown as CanvasRenderingContext2D;
  const e = {
    canvas: toile(),
    ctx,
    lum: toile(),
    lctx: { setTransform: vi.fn() } as unknown as CanvasRenderingContext2D,
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
  return e;
}

const fenetre = (w: number, h: number, dpr = 2) => {
  vi.stubGlobal('window', { innerWidth: w, innerHeight: h, devicePixelRatio: dpr });
};

afterEach(() => vi.unstubAllGlobals());

describe('veiller sur l’écran', () => {
  it('ne touche à rien quand tout est en place, mais repose la transformation', () => {
    fenetre(390, 700);
    const e = ecranFactice();
    expect(veillerSurLEcran(e)).toBe(false);
    // la transformation ne survit pas à une remise à zéro du contexte : on la
    // repose à chaque image, sinon tout se dessine à l'échelle 1
    expect(e.ctx.setTransform).toHaveBeenCalledWith(2, 0, 0, 2, 0, 0);
  });

  it('rattrape une fenêtre qui a changé de taille sans prévenir', () => {
    fenetre(390, 480); // la barre d'adresse s'est dépliée pendant qu'on était ailleurs
    const e = ecranFactice(390, 700);
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
