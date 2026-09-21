/**
 * L'ATLAS — le chemin de rendu par sprites.
 *
 * Tout le jeu est dessiné à la main, forme par forme. C'est ce qui lui donne
 * sa cohérence, et c'est aussi son plafond : on ne dessine pas une pierre
 * usée avec un `roundRect`. Ce fichier ouvre la porte à des images, sans rien
 * casser en attendant qu'elles existent.
 *
 * LA RÈGLE : **l'atlas est facultatif.** Tant que `public/atlas/lux.json` est
 * absent, le jeu dessine exactement comme aujourd'hui. Quand il est là, chaque
 * forme qui a son image la prend, et les autres continuent d'être tracées. On
 * peut donc livrer les sprites un par un, sans jamais casser le jeu.
 *
 * LA DEUXIÈME RÈGLE : **aucune lumière n'est peinte dans un sprite.** Ce jeu
 * est un moteur de lumière — tout est percé dans une couche d'obscurité, image
 * par image. Un sprite qui arrive avec son ombre portée et son reflet se bat
 * contre le moteur. Les corps sont donc livrés en NIVEAUX DE GRIS et teintés
 * ici : la couleur est une donnée du jeu (l'éclat, le rouge de la fin, le vert
 * d'une lumière rallumée), pas une décision du dessinateur.
 *
 * Le cahier des charges complet est dans `docs/lux-assets.md`.
 */

import type { Ecran } from './ecran.js';

/** Une image dans la planche : sa découpe, et son point d'ancrage. */
export interface CaseAtlas {
  x: number;
  y: number;
  w: number;
  h: number;
  /** Le point du sprite qui se pose sur la position demandée, en fraction.
   *  Par défaut son centre — sauf une torche, qui s'accroche par le haut. */
  ax?: number;
  ay?: number;
}

export interface Atlas {
  image: CanvasImageSource;
  /**
   * Combien de pixels de la planche valent un pixel du jeu. À 2, un sprite de
   * 64 px se dessine sur 32 px de jeu — c'est-à-dire net sur un écran à deux
   * pixels par point, qui est la règle sur téléphone.
   */
  echelle: number;
  cases: Record<string, CaseAtlas>;
}

/** Ce que le JSON de la planche contient. Lu avec méfiance : un atlas abîmé
 *  ne doit pas empêcher de jouer. */
interface AtlasEcrit {
  image?: unknown;
  echelle?: unknown;
  cases?: unknown;
}

/**
 * Où va le sprite : le rectangle de destination, une fois l'ancrage et
 * l'échelle appliqués.
 *
 * Fonction pure, et c'est volontaire : c'est le seul endroit où une erreur de
 * placement peut se glisser, et on veut pouvoir la tester sans navigateur.
 */
export function placer(
  c: CaseAtlas,
  echelle: number,
  x: number,
  y: number,
  sx = 1,
  sy = 1,
): { dx: number; dy: number; dw: number; dh: number } {
  const dw = (c.w / echelle) * sx;
  const dh = (c.h / echelle) * sy;
  return { dx: x - dw * (c.ax ?? 0.5), dy: y - dh * (c.ay ?? 0.5), dw, dh };
}

/** Relit une planche écrite à la main sans lui faire confiance. */
export function lireAtlas(brut: unknown, image: CanvasImageSource): Atlas | null {
  if (!brut || typeof brut !== 'object') return null;
  const a = brut as AtlasEcrit;
  const echelle = typeof a.echelle === 'number' && a.echelle > 0 ? a.echelle : 1;
  if (!a.cases || typeof a.cases !== 'object') return null;
  const cases: Record<string, CaseAtlas> = {};
  for (const [nom, v] of Object.entries(a.cases as Record<string, unknown>)) {
    if (!v || typeof v !== 'object') continue;
    const c = v as Record<string, unknown>;
    if (typeof c.x !== 'number' || typeof c.y !== 'number') continue;
    if (typeof c.w !== 'number' || typeof c.h !== 'number') continue;
    cases[nom] = {
      x: c.x,
      y: c.y,
      w: c.w,
      h: c.h,
      ...(typeof c.ax === 'number' ? { ax: c.ax } : {}),
      ...(typeof c.ay === 'number' ? { ay: c.ay } : {}),
    };
  }
  return Object.keys(cases).length ? { image, echelle, cases } : null;
}

/** La planche en cours, s'il y en a une. Un seul atlas à la fois : le jeu n'a
 *  pas de raison d'en mélanger deux, et une variable de module évite de faire
 *  descendre l'atlas à travers vingt signatures. */
let actif: Atlas | null = null;

export const atlas = (): Atlas | null => actif;
export const poserLAtlas = (a: Atlas | null): void => {
  actif = a;
  teintes.clear();
};

/** Y a-t-il une image pour cette forme ? C'est ce que chaque fonction de
 *  dessin demande avant de tracer quoi que ce soit à la main. */
export const aUneImage = (nom: string): boolean => actif !== null && nom in actif.cases;

/**
 * Charge la planche. Elle est FACULTATIVE : absente, abîmée, hors ligne, on
 * rend `null` en silence et le jeu se dessine comme avant. C'est la même
 * discipline que pour la sauvegarde — un luxe, jamais une dépendance.
 */
export async function chargerAtlas(url = 'atlas/lux.json'): Promise<Atlas | null> {
  try {
    const r = await fetch(url);
    if (!r.ok) return null;
    const brut = (await r.json()) as AtlasEcrit;
    const nom = typeof brut.image === 'string' ? brut.image : 'lux.png';
    const base = url.slice(0, url.lastIndexOf('/') + 1);
    const image = await new Promise<HTMLImageElement | null>((ok) => {
      const i = new Image();
      i.onload = () => ok(i);
      i.onerror = () => ok(null);
      i.src = base + nom;
    });
    if (!image) return null;
    return lireAtlas(brut, image);
  } catch {
    return null; // pas d'atlas : on dessine à la main, et personne ne le sait
  }
}

/**
 * LA TEINTE. Les corps sont livrés en niveaux de gris et prennent leur couleur
 * ici — sinon il faudrait une image par palier d'éclat, par humeur et par
 * personnage, et la fin qui fait virer Falot au rouge serait impossible.
 *
 * Le résultat est gardé : teinter coûte trois passes de composition, et un
 * corps garde la même couleur pendant des centaines d'images.
 */
const teintes = new Map<string, HTMLCanvasElement>();

export function teinter(nom: string, couleur: string): CanvasImageSource | null {
  const a = actif;
  if (!a) return null;
  const c = a.cases[nom];
  if (!c) return null;
  const cle = `${nom}|${couleur}`;
  const garde = teintes.get(cle);
  if (garde) return garde;
  const toile = document.createElement('canvas');
  toile.width = c.w;
  toile.height = c.h;
  const t = toile.getContext('2d');
  if (!t) return null;
  t.drawImage(a.image, c.x, c.y, c.w, c.h, 0, 0, c.w, c.h);
  // « multiply » colore le gris sans toucher au noir des traits ; puis
  // « destination-in » rend au sprite sa découpe, que le rectangle de couleur
  // venait d'effacer.
  t.globalCompositeOperation = 'multiply';
  t.fillStyle = couleur;
  t.fillRect(0, 0, c.w, c.h);
  t.globalCompositeOperation = 'destination-in';
  t.drawImage(a.image, c.x, c.y, c.w, c.h, 0, 0, c.w, c.h);
  teintes.set(cle, toile);
  return toile;
}

/**
 * Pose un sprite à une position du MONDE (la caméra est retirée ici, comme
 * partout ailleurs dans `rendu/`). Rend `false` si l'image n'existe pas : à
 * l'appelant de tracer sa forme à la main, comme avant.
 */
export function dessinerSprite(
  ecran: Ecran,
  nom: string,
  x: number,
  y: number,
  opts: { sx?: number; sy?: number; opacite?: number; couleur?: string } = {},
): boolean {
  const a = actif;
  if (!a) return false;
  const c = a.cases[nom];
  if (!c) return false;
  const { ctx, cam } = ecran;
  const source = opts.couleur ? teinter(nom, opts.couleur) : a.image;
  if (!source) return false;
  const { dx, dy, dw, dh } = placer(
    c,
    a.echelle,
    x - cam.x,
    y - cam.y,
    opts.sx ?? 1,
    opts.sy ?? 1,
  );
  ctx.save();
  if (opts.opacite !== undefined) ctx.globalAlpha = opts.opacite;
  if (opts.couleur) ctx.drawImage(source, dx, dy, dw, dh);
  else ctx.drawImage(source, c.x, c.y, c.w, c.h, dx, dy, dw, dh);
  ctx.restore();
  return true;
}
