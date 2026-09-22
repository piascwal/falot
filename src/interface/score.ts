/**
 * LA NOTE D'UN ÉTAGE JOUÉ — de quoi le résumer en une, deux ou trois étoiles,
 * ou dire qu'il n'y avait rien à ajouter.
 *
 * Trois chiffres composent une `Trace` (voir `sauvegarde.ts`) : la part
 * éclairée, la part des lumières remontées, et les morts. La note en fait une
 * moyenne à trois termes égaux — c'est ce que demande « le pourcentage
 * allumé, les lumières sauvées et les morts » — chacun ramené entre 0 et 1
 * avant d'être moyenné, pour qu'aucun des trois ne pèse plus que les autres.
 *
 * LES MORTS SE LISENT COMME LES DEUX AUTRES : `1 / (1 + morts)` vaut 1 à zéro
 * mort et s'écrase vite ensuite. Ce n'est pas une formule inventée pour
 * l'occasion — c'est exactement celle que `rendu/bilan.ts` affiche déjà dans
 * sa barre « Pris » : la même question mérite la même réponse partout.
 */

import { sansFaute } from '../coeur/regles/bilan.js';
import type { Trace } from './sauvegarde.js';

export type Etoiles = 1 | 2 | 3;

/** La note d'un passage, de 0 à 1. */
export function noteDe(t: Trace): number {
  const eclat = t.lumiere;
  const sauvees = t.lumieresTotal ? t.lumieres / t.lumieresTotal : 1;
  const proprete = t.morts === 0 ? 1 : 1 / (1 + t.morts);
  return (eclat + sauvees + proprete) / 3;
}

/**
 * TROIS PALIERS, calés à vue faute de milliers de parties à mesurer : 0,8 et
 * 0,5. Un étage qui a une `Trace` du tout a été traversé jusqu'au bout — il
 * vaut donc toujours au moins une étoile, jamais zéro.
 */
export function etoilesDe(t: Trace): Etoiles {
  const n = noteDe(t);
  if (n >= 0.8) return 3;
  if (n >= 0.5) return 2;
  return 1;
}

/** Rien à ajouter : tout éclairé, toutes les lumières, jamais pris. C'est la
 *  même définition que le bilan en jeu — voir `coeur/regles/bilan.ts`. */
export const parfait = sansFaute;
