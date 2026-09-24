/**
 * LE PLANCHER — le sol immobile, peint une fois et recopié.
 *
 * Mesuré avant ce fichier : près de quatre cents `drawImage` par image, dont
 * 345 pour la seule matière du sol — la tuile de chaque case visible, puis
 * jusqu'à quatre images d'ombre de contact, puis les garnitures. Sous frein
 * processeur ×4, l'ordre de grandeur d'un téléphone, le jeu tombait à dix-huit
 * images par seconde. Or rien de tout ça ne bouge : la pierre, la mousse, les
 * lampes mortes et les ombres sont les mêmes à chaque image. On les repeignait
 * soixante fois par seconde pour rien.
 *
 * ON LES PEINT UNE FOIS, PAR BLOCS DE 4 × 4 CASES, dans des canevas hors écran,
 * et chaque image ne fait plus que recopier les blocs visibles : une douzaine
 * d'appels au lieu de quatre cents.
 *
 * POURQUOI DES BLOCS, et pas la zone entière d'un coup : sur un téléphone, la
 * densité de pixels monte à 2,5, et une zone de 21 × 28 cases ferait un canevas
 * de 58 Mo. Des blocs, on n'en garde que ce qu'on voit, plus une marge.
 *
 * TROIS RÈGLES, qui font que le résultat est identique au dessin direct :
 *
 *   — un bloc est peint avec SA COURONNE : les cases voisines tout autour. Une
 *     ombre de contact, un trait d'architecture ou un grain de mousse qui tombe
 *     à cheval sur deux blocs est ainsi peint dans les deux, au même endroit du
 *     monde, et le bord du canevas coupe chaque moitié là où il faut ;
 *   — un bloc se recopie calé sur les PIXELS DE L'ÉCRAN. La caméra glisse en
 *     douceur, donc sa position est fractionnaire ; recopié à une position
 *     fractionnaire, un bloc serait rééchantillonné et chaque joint entre deux
 *     blocs laisserait un fil de pixels à moitié transparents ;
 *   — un bloc sait quand il est périmé. Sa SIGNATURE est une empreinte des murs
 *     qu'il lit (lui, sa couronne, et jusqu'à trois cases plus loin pour la
 *     mousse). Quand une fissure cède, les murs changent, la signature aussi,
 *     et le bloc se repeint tout seul — sans que la simulation ait à prévenir
 *     le rendu de quoi que ce soit.
 *
 * Ce qui bouge — les dalles qui s'enfoncent, les fissures qui tremblent, les
 * battants des portes — reste dessiné en direct par `sol.ts`, par-dessus.
 */

import { CASE } from '../coeur/dimensions.js';
import type { Partie } from '../coeur/types.js';
import type { Ecran } from './ecran.js';
import { PORTEE_MOUSSE } from './mousse.js';

/** Ce qu'il faut pour peindre : un contexte, et le coin du monde qui tombe sur
 *  son origine. La caméra du jeu, ou le coin d'un bloc. */
export type Pinceau = Pick<Ecran, 'ctx' | 'cam'>;

export type Matiere = (
  p: Pinceau,
  partie: Partie,
  c0x: number,
  c1x: number,
  c0y: number,
  c1y: number,
  /** Dessin de secours, à l'écran, d'un bloc pas encore peint : on y saute ce
   *  qui coûte cher (la mousse), qui apparaîtra avec le bloc une image après. */
  presse?: boolean,
) => void;

/** Le côté d'un bloc, en cases. */
const BLOC = 4;

/** Jusqu'où un bloc lit les murs autour de lui : sa couronne (1), et la portée
 *  de la mousse au-delà. */
const MARGE = 1 + Math.ceil(PORTEE_MOUSSE);

/** Combien de millisecondes on s'accorde, par image, pour peindre des blocs
 *  neufs. En arrivant dans une zone, il en faut une quinzaine d'un coup : on
 *  les étale sur quelques images, et ceux qui attendent sont dessinés en direct
 *  en attendant — rien ne manque jamais à l'écran. */
const BUDGET_MS = 5;

interface Bloc {
  toile: HTMLCanvasElement;
  sig: number;
  /** La densité de pixels à laquelle il a été peint. */
  dpr: number;
  vu: number;
}

const blocs = new Map<number, Bloc>();
let zoneEnCours: Partie['zone'] | null = null;
let etatEnCours = Number.NaN;
let horloge = 0;

/** L'empreinte des murs qu'un bloc lit. FNV-1a sur 0/1, et 2 hors de la zone. */
function signature(zone: Partie['zone'], bx: number, by: number): number {
  let h = 2166136261;
  const x0 = bx * BLOC - MARGE;
  const y0 = by * BLOC - MARGE;
  for (let y = y0; y < y0 + BLOC + MARGE * 2; y++)
    for (let x = x0; x < x0 + BLOC + MARGE * 2; x++) {
      const v = x < 0 || y < 0 || x >= zone.cols || y >= zone.lignes ? 2 : zone.mur[y][x];
      h = Math.imul(h ^ v, 16777619);
    }
  return h >>> 0;
}

/**
 * Pose le sol immobile des cases [c0x..c1x] × [c0y..c1y].
 *
 * `etat` résume ce qui, hors des murs, change l'aspect de la matière — pour
 * l'instant, si la feuille des lampes est arrivée. Quand il change, tout se
 * repeint.
 */
export function poserLePlancher(
  ecran: Ecran,
  partie: Partie,
  c0x: number,
  c1x: number,
  c0y: number,
  c1y: number,
  matiere: Matiere,
  etat: number,
): void {
  const { ctx, cam } = ecran;
  const zone = partie.zone;
  const dpr = ecran.DPR || 1;
  // UNE AUTRE DENSITÉ NE VIDE PAS LE CACHE. Quand le jeu rame, `ecran.ts`
  // baisse la finesse de l'écran d'un cran ; vider tous les blocs à ce moment
  // précis les faisait tous repeindre d'un coup, pile quand la machine était
  // déjà à la peine — mesuré : des images à 200 ms. Les blocs de l'ancienne
  // densité restent donc affichés, mis à l'échelle, et se repeignent au fil
  // des images dans le budget.
  if (zone !== zoneEnCours || etat !== etatEnCours) {
    blocs.clear();
    zoneEnCours = zone;
    etatEnCours = etat;
  }
  horloge++;
  const cote = BLOC * CASE;
  const bx0 = Math.floor(c0x / BLOC);
  const bx1 = Math.floor(c1x / BLOC);
  const by0 = Math.floor(c0y / BLOC);
  const by1 = Math.floor(c1y / BLOC);
  const t0 = performance.now();
  let peints = 0;

  for (let by = by0; by <= by1; by++)
    for (let bx = bx0; bx <= bx1; bx++) {
      const cle = by * 4096 + bx;
      const sig = signature(zone, bx, by);
      let b = blocs.get(cle);
      if (b && b.sig !== sig) {
        blocs.delete(cle);
        b = undefined;
      }
      // le bloc et sa couronne, sans sortir de la zone
      const r0x = Math.max(0, bx * BLOC - 1);
      const r1x = Math.min(zone.cols - 1, (bx + 1) * BLOC);
      const r0y = Math.max(0, by * BLOC - 1);
      const r1y = Math.min(zone.lignes - 1, (by + 1) * BLOC);
      const ox = bx * cote;
      const oy = by * cote;

      const aRefaire = !b || b.dpr !== dpr;
      // Un bloc manquant passe toujours (au moins un par image) ; un bloc
      // seulement flou n'attend que s'il reste du budget.
      const permis = performance.now() - t0 < BUDGET_MS || (!b && peints === 0);
      if (aRefaire && permis) {
        const toile = document.createElement('canvas');
        toile.width = Math.ceil(cote * dpr);
        toile.height = Math.ceil(cote * dpr);
        const c = toile.getContext('2d');
        if (c) {
          c.setTransform(dpr, 0, 0, dpr, 0, 0);
          matiere({ ctx: c, cam: { x: ox, y: oy } }, partie, r0x, r1x, r0y, r1y);
          b = { toile, sig, dpr, vu: 0 };
          blocs.set(cle, b);
          peints++;
        }
      }

      if (b && b.dpr === dpr) {
        b.vu = horloge;
        // calé sur les pixels de l'écran : voir la deuxième règle
        const dx = Math.round((ox - cam.x) * dpr) / dpr;
        const dy = Math.round((oy - cam.y) * dpr) / dpr;
        ctx.drawImage(b.toile, dx, dy, b.toile.width / dpr, b.toile.height / dpr);
      } else if (b) {
        // peint à une autre densité : juste, mais un peu flou, le temps de
        // son tour
        b.vu = horloge;
        ctx.drawImage(
          b.toile,
          ox - cam.x,
          oy - cam.y,
          b.toile.width / b.dpr,
          b.toile.height / b.dpr,
        );
      } else {
        // Pas encore peint : dessiné en direct cette fois-ci, découpé à sa place,
        // et SANS SA MOUSSE. Avec elle, une quinzaine de blocs en attente à
        // l'entrée d'une zone coûtaient chacun leur mousse à chaque image, et
        // c'est ce qui faisait les à-coups de 200 ms qu'on mesurait.
        ctx.save();
        ctx.beginPath();
        ctx.rect(ox - cam.x, oy - cam.y, cote, cote);
        ctx.clip();
        matiere(ecran, partie, r0x, r1x, r0y, r1y, true);
        ctx.restore();
      }
    }

  // On garde ce qu'on voit, plus une marge pour les allers-retours ; le reste
  // part, le moins récemment vu d'abord.
  const plafond = (bx1 - bx0 + 1) * (by1 - by0 + 1) + 10;
  if (blocs.size > plafond) {
    const vieux = [...blocs.entries()].sort((a, b) => a[1].vu - b[1].vu);
    for (let i = 0; i < vieux.length - plafond; i++) blocs.delete(vieux[i][0]);
  }
}
