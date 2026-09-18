/**
 * Toutes les distances du jeu sont exprimées en CASES, jamais en pixels
 * d'écran. C'est ce qui permet de reculer la caméra sans dérégler une seule
 * portée de détection : seul le cadrage change.
 */

// Côté d'une case, en pixels monde. Le baisser revient à filmer de plus haut :
// tout le jeu est exprimé en CASE, donc les proportions et les distances de
// détection ne bougent pas d'un pouce — seul le cadrage s'élargit.
export const CASE = 62;

/**
 * Les mesures dérivées de la case. Constantes : elles ne dépendent PAS de la
 * taille de l'écran. Le POC les recalculait à chaque redimensionnement, ce qui
 * laissait croire le contraire — le résultat était toujours le même.
 *
 * `halo` se mesure en cases, pas en pixels d'écran : à 0,17 du petit côté il
 * valait 66 px pour des cases de 74, donc on ne voyait même pas les murs de son
 * propre couloir. Il faut au minimum une case et demie pour que l'obscurité
 * soit une contrainte et pas un aveuglement.
 */
export const D = {
  /** Côté d'un bonhomme. Il suit la case, sinon reculer la caméra ne
   *  l'aurait pas rapetissé et il aurait paru énorme à l'écran. */
  taille: CASE * 0.5,
  halo: CASE * 1.5,
  /** Portée de base d'un relais ; le faisceau des âmes vaut cinq fois ça. */
  portee: CASE,
  cone: 0.2,
} as const;

// Portée du regard d'une sentinelle. Ramenée de 4.6 à 3.6 cases : elle
// accrochait de trop loin. Mais l'essentiel est ailleurs — c'est la VITESSE
// de verrouillage qui décroît avec la distance (voir `majRegles`), comme dans
// un Metal Gear : au bord du cône elle te soupçonne, elle ne te tient pas.
export const PORTEE_VUE = CASE * 3.6;

/** Demi-angle du cône de vue d'un Guet. */
export const CONE_VUE = 0.42;

/**
 * L'ŒIL (étage 10) voit plus loin qu'une sentinelle, mais seulement ce qui est
 * éclairé, et dans toutes les directions : c'est une lampe qui regarde les
 * autres lampes. Il n'a pas de cône, donc pas de dos — on ne le contourne pas,
 * on éteint la pièce.
 */
export const PORTEE_OEIL = CASE * 5;
