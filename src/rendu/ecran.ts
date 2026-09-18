/**
 * L'ÉCRAN : le canvas, son calque d'obscurité, la caméra et le budget de pixels.
 *
 * Tout le rendu reçoit cet objet en premier argument, exactement comme les
 * règles reçoivent la partie. Rien ici ne décide quoi que ce soit du jeu — et
 * réciproquement, `coeur/` ne connaît pas ce fichier.
 */

import { clamp } from '../coeur/geometrie.js';
import type { Partie, Point } from '../coeur/types.js';

/** Le calque d'obscurité n'est que du dégradé : demi-résolution, invisible à
 *  l'œil et quatre fois moins cher à rastériser. */
export const QLUM = 0.5;

/** Le dernier palier passe sous le pixel d'écran : sur une machine qui peine,
 *  mieux vaut une image légèrement floue qu'une image en retard. */
const PALIERS = [2, 1.5, 1, 0.8];

/**
 * Le coût d'une image est proportionnel au NOMBRE DE PIXELS à remplir, pas à la
 * finesse de l'écran. Plafonner la densité ne suffit donc pas : sur une
 * tablette, 1,5 fois 1024x1366 fait encore trois millions de pixels, et on
 * mesurait 108 images sur 300 au-dessus de 20 ms alors que le même jeu sur
 * téléphone en ratait une. On se donne un budget en pixels et on en déduit la
 * densité : un téléphone garde toute sa finesse, un grand écran rend un peu
 * moins fin plutôt que de saccader.
 */
const BUDGET_PIXELS = 2.1e6;

export interface Ecran {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  /** Le calque d'obscurité, à demi-résolution. */
  lum: HTMLCanvasElement;
  lctx: CanvasRenderingContext2D;
  W: number;
  H: number;
  DPR: number;
  cam: Point;
  palier: number;
  /** Les derniers écarts entre images, pour décider de baisser la finesse. */
  fenetre: number[];
  /** Coût réel du corps de la boucle, sur les 240 dernières images. L'écart
   *  entre deux images ne dit rien tant qu'on est calé sur les 60 Hz. */
  coutsImage: number[];
}

export function creerEcran(canvas: HTMLCanvasElement): Ecran {
  const ctx = canvas.getContext('2d');
  const lum = document.createElement('canvas');
  const lctx = lum.getContext('2d');
  if (!ctx || !lctx)
    throw new Error('Pas de contexte 2D : ce navigateur ne peut pas jouer.');
  const ecran: Ecran = {
    canvas,
    ctx,
    lum,
    lctx,
    W: 0,
    H: 0,
    DPR: 1,
    cam: { x: 0, y: 0 },
    palier: 0,
    fenetre: [],
    coutsImage: [],
  };
  redimensionner(ecran);
  return ecran;
}

export function redimensionner(ecran: Ecran): void {
  ecran.W = window.innerWidth;
  ecran.H = window.innerHeight;
  const tenable = Math.sqrt(BUDGET_PIXELS / Math.max(1, ecran.W * ecran.H));
  ecran.DPR = clamp(
    Math.min(window.devicePixelRatio || 1, PALIERS[ecran.palier], tenable),
    0.75,
    3,
  );
  ecran.canvas.width = Math.round(ecran.W * ecran.DPR);
  ecran.canvas.height = Math.round(ecran.H * ecran.DPR);
  ecran.lum.width = Math.ceil(ecran.canvas.width * QLUM);
  ecran.lum.height = Math.ceil(ecran.canvas.height * QLUM);
  ecran.ctx.setTransform(ecran.DPR, 0, 0, ecran.DPR, 0, 0);
}

/**
 * La cadence se surveille TOUT LE TEMPS. Elle ne l'était qu'avec le doigt sur
 * le joystick : au clavier, ou pendant qu'on vise, une machine qui peine ne se
 * rattrapait jamais.
 */
export function surveillerCadence(ecran: Ecran, dt: number): void {
  if (ecran.palier >= PALIERS.length - 1) return;
  ecran.fenetre.push(dt);
  if (ecran.fenetre.length < 60) return; // une seconde, pas une et demie
  const median = [...ecran.fenetre].sort((a, b) => a - b)[30];
  ecran.fenetre = [];
  if (median > 0.021) {
    ecran.palier++;
    redimensionner(ecran);
  }
}

/** La caméra suit Falot et s'arrête aux bords de la zone. */
export function cadrer(ecran: Ecran, partie: Partie, immediat: boolean): void {
  const { joueur, zone } = partie;
  const cx = clamp(joueur.x - ecran.W / 2, 0, Math.max(0, zone.largeur - ecran.W));
  const cy = clamp(joueur.y - ecran.H / 2, 0, Math.max(0, zone.hauteur - ecran.H));
  if (immediat) {
    ecran.cam.x = cx;
    ecran.cam.y = cy;
    return;
  }
  ecran.cam.x += (cx - ecran.cam.x) * 0.14;
  ecran.cam.y += (cy - ecran.cam.y) * 0.14;
}
