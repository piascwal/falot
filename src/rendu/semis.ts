/**
 * LE SEMIS — quelle case porte quel décor, et laquelle de ses variantes.
 *
 * Tout le décor des Dessous est semé par la POSITION : la case est sa propre
 * graine. C'est ce qui fait que le lierre ne bouge pas quand on repasse devant,
 * sans avoir à retenir quoi que ce soit — rien n'est stocké, tout se recalcule.
 *
 * ON TIRE PLUSIEURS FOIS SUR LA MÊME CASE : une fois pour savoir s'il y a
 * quelque chose, une autre pour savoir quoi, une troisième pour savoir quelle
 * variante. Le `sel` sépare ces tirages, et c'est là que la première version
 * s'est trompée.
 *
 * ELLE MÉLANGEAIT PAR OU-EXCLUSIF SEUL :
 *
 *     ((cx + 1) * A) ^ ((cy + 1) * B) ^ (sel * C)
 *
 * À `sel` près, c'est le MÊME nombre décalé d'un masque constant. Les tirages
 * ne sont donc pas indépendants : ils sont la même valeur vue sous un autre
 * angle. Pris isolément chacun paraissait uniforme, et c'est ce qui a permis au
 * défaut de passer — mais dès qu'on FILTRE sur un tirage (« y a-t-il du lierre
 * ici ? ») on contraint mécaniquement les bits de tous les autres. Résultat
 * mesuré : tout le lierre du jeu tirait la variante 3, toute la mousse la
 * variante 0, et les lampes sortaient à 96 % la même famille. Les « quatre
 * variantes » annoncées partout n'en ont jamais fait qu'une.
 *
 * La correction tient en trois lignes : après avoir mélangé les trois entrées,
 * on passe le tout dans une AVALANCHE (le final de Murmur3), où chaque bit
 * d'entrée influence tous les bits de sortie. Deux `sel` différents donnent
 * alors deux suites sans rapport, et filtrer sur l'une ne dit plus rien de
 * l'autre. `tests/semis.test.ts` tient cette propriété sous surveillance,
 * parce qu'elle est invisible à l'œil jusqu'au jour où elle ne l'est plus.
 */

/** Un nombre entre 0 et 1, stable pour une case et un sel donnés. */
export function hasard(cx: number, cy: number, sel: number): number {
  let h =
    Math.imul(cx + 1, 374761393) ^
    Math.imul(cy + 1, 668265263) ^
    Math.imul(sel + 1, 2246822519);
  h = Math.imul(h ^ (h >>> 15), 2246822519);
  h = Math.imul(h ^ (h >>> 13), 3266489917);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Laquelle des `combien` variantes cette case porte. */
export const varianteDe = (cx: number, cy: number, sel: number, combien: number): number =>
  Math.floor(hasard(cx, cy, sel) * combien) % combien;
