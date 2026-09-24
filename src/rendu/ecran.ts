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

/**
 * LES CALQUES DANS LA PAGE, en option seulement (`?calques=1`).
 *
 * Poser la nuit, les lumières et le dessus comme trois toiles superposées
 * divisait par deux le calcul sur notre machine de mesure — qui n'a pas de
 * carte graphique. Sur un téléphone, c'est l'inverse qui compte : trois toiles
 * plein écran de plus à composer à chaque image, dont une en `plus-lighter`
 * qui oblige le navigateur à relire tout ce qu'il y a dessous. C'est du
 * remplissage de pixels, précisément ce qui manque à une carte graphique de
 * téléphone, et le jeu s'est remis à ramer juste après. Par défaut, tout se
 * compose donc à nouveau dans UNE seule toile.
 */
export const CALQUES = (() => {
  try {
    return new URLSearchParams(location.search).get('calques') === '1';
  } catch {
    return false;
  }
})();

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
  /**
   * LE CALQUE DES TROUS, même taille que `lum`.
   *
   * Les perçages ne mordent plus l'obscurité un par un : ils s'accumulent ici,
   * puis on ôte l'ensemble d'un seul coup, flouté. C'est ce qui rend la
   * pénombre abordable — un filtre par image au lieu d'un par source — et le
   * résultat est identique à l'ancien, parce qu'empiler des alphas en
   * `source-over` donne exactement le complément de les retrancher l'un après
   * l'autre en `destination-out`.
   */
  trou: HTMLCanvasElement;
  tctx: CanvasRenderingContext2D;
  /**
   * LES CALQUES POSÉS PAR-DESSUS LE JEU, dans la page et non plus dans l'image.
   *
   * L'obscurité était recopiée sur l'image à chaque image, étirée du double :
   * mesuré, cette seule copie prenait un cinquième du temps de calcul. Elle est
   * maintenant une toile posée sur le jeu (voir `obscurite.ts`), et c'est le
   * navigateur qui l'étire en composant la page — sur la carte graphique, pour
   * rien. Du coup, ce qui se dessinait APRÈS l'obscurité ne peut plus aller
   * dans l'image du dessous : il lui faut ses propres toiles, au-dessus.
   *
   *   — `lueur` : les lumières additives (halos chauds, balayages rouges, la
   *     lumière qui quitte le corps). Elle est fondue en `plus-lighter`,
   *     c'est-à-dire exactement le `lighter` du canevas, mais entre deux
   *     éléments de la page. Pleine résolution : les motes de la vidange ont
   *     un cœur blanc d'un pixel, qu'une demi-résolution éteignait ;
   *   — `dessus` : tout ce qui reste visible par-dessus la nuit (le fil, les
   *     lueurs aperçues, les textes, les jauges, la manche). Pleine résolution.
   */
  lueur: HTMLCanvasElement;
  luctx: CanvasRenderingContext2D;
  dessus: HTMLCanvasElement;
  dctx: CanvasRenderingContext2D;
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
  const trou = document.createElement('canvas');
  const tctx = trou.getContext('2d');
  const lueur = document.createElement('canvas');
  const luctx = lueur.getContext('2d');
  const dessus = document.createElement('canvas');
  const dctx = dessus.getContext('2d');
  if (!ctx || !lctx || !tctx || !luctx || !dctx)
    throw new Error('Pas de contexte 2D : ce navigateur ne peut pas jouer.');
  lueur.className = 'calque additif';
  dessus.className = 'calque';
  lueur.hidden = true;
  dessus.hidden = true;
  // dans cet ordre : le jeu, la nuit (posée juste après lui par
  // `obscurite.ts`), les lumières, puis ce qui passe au-dessus de tout
  if (CALQUES) canvas.after(lueur, dessus);
  const ecran: Ecran = {
    canvas,
    ctx,
    lum,
    lctx,
    trou,
    tctx,
    lueur,
    luctx,
    dessus,
    dctx,
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

/**
 * LA TAILLE VISIBLE, MESURÉE SUR LE CANEVAS LUI-MÊME.
 *
 * On lisait `window.innerHeight`, qui est la hauteur de la MISE EN PAGE. Sur
 * iPad elle compte la bande qui passe sous la barre du navigateur : la mémoire
 * du canevas était donc plus haute que le morceau qu'on voit, et le bas de la
 * carte se retrouvait coupé hors de l'écran. Le canevas, lui, est étiré par le
 * CSS sur la hauteur réellement affichée — c'est lui qui a raison, et le
 * mesurer garantit que la mémoire et l'affichage disent la même chose.
 *
 * `clientWidth` vaut 0 tant que l'élément n'est pas dans la page : on retombe
 * alors sur la fenêtre, faute de mieux.
 */
function vue(canvas: HTMLCanvasElement): { W: number; H: number } {
  return {
    W: canvas.clientWidth || window.innerWidth,
    H: canvas.clientHeight || window.innerHeight,
  };
}

export function redimensionner(ecran: Ecran): void {
  const v = vue(ecran.canvas);
  ecran.W = v.W;
  ecran.H = v.H;
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
  ecran.trou.width = ecran.lum.width;
  ecran.trou.height = ecran.lum.height;
  // sans calques, ces deux toiles ne servent pas : pas de mémoire pour rien
  ecran.lueur.width = CALQUES ? ecran.canvas.width : 1;
  ecran.lueur.height = CALQUES ? ecran.canvas.height : 1;
  ecran.dessus.width = CALQUES ? ecran.canvas.width : 1;
  ecran.dessus.height = CALQUES ? ecran.canvas.height : 1;
  ecran.ctx.setTransform(ecran.DPR, 0, 0, ecran.DPR, 0, 0);
}

/**
 * LE GARDE-FOU DE L'AFFICHAGE, appelé à chaque image.
 *
 * Sur téléphone, revenir d'une autre application cassait l'écran une fois sur
 * trois. Trois causes, une seule réponse :
 *
 *   — le navigateur libère la mémoire d'un canevas laissé en arrière-plan.
 *     Quand il revient, le contexte est REMIS À ZÉRO, transformation comprise :
 *     tout se dessinait alors à l'échelle 1 au lieu de la densité de l'écran ;
 *   — la barre d'adresse se replie ou se déplie pendant qu'on est ailleurs, et
 *     l'événement `resize` qui va avec n'arrive pas toujours ;
 *   — une rotation faite dans une autre application n'est jamais annoncée.
 *
 * On ne se fie donc à aucun événement : on compare, à chaque image, ce que le
 * canevas EST à ce qu'il devrait être, et on repose la transformation. Deux
 * lectures et une affectation — c'est moins cher que d'y penser.
 */
export function veillerSurLEcran(ecran: Ecran): boolean {
  const { W, H } = vue(ecran.canvas);
  const derive =
    W !== ecran.W ||
    H !== ecran.H ||
    ecran.canvas.width !== Math.round(ecran.W * ecran.DPR) ||
    ecran.lum.width !== Math.ceil(ecran.canvas.width * QLUM);
  if (derive) {
    redimensionner(ecran);
    return true;
  }
  // la transformation ne survit pas à une remise à zéro du contexte
  ecran.ctx.setTransform(ecran.DPR, 0, 0, ecran.DPR, 0, 0);
  return false;
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
