/**
 * Les questions qu'on pose à une partie sans la modifier. Elles sont ici plutôt
 * que dispersées parce que la moitié du jeu les appelle, et qu'une règle qui se
 * lit à deux endroits différents finit par se contredire.
 */

import { CASE, D } from './dimensions.js';
import {
  BONUS,
  FORMES,
  type Forme,
  HUMEURS,
  type Humeur,
  humeurSelon,
  PIERRE,
  type RangPierre,
  type TypeLueur,
} from './formes.js';
import type { Trait } from './monde/paliers.js';
import type { Joueur, Partie, Zone } from './types.js';

export const forme = (j: Joueur): Forme => FORMES[j.niveau];
export const rangPierre = (j: Joueur): RangPierre => PIERRE[j.niveau];
export const aBonus = (j: Joueur, k: TypeLueur): boolean => j.bonus === k && j.bonusT > 0;
export const bonusActif = (j: Joueur) => (j.bonus ? BONUS[j.bonus] : null);

/**
 * Le halo EST la jauge de santé : se faire fixer le fait rétrécir, se cacher le
 * fait revenir. Ça dit la règle sans un mot, et évite une deuxième barre.
 *
 * Le plancher est haut (0,68) : à jauge presque pleine on doit encore y voir
 * assez pour s'enfuir. Mesuré à 0,5, le halo tombait sous une case pile au
 * moment où il fallait courir.
 *
 * Pendant la vidange le halo se referme jusqu'à presque rien : c'est la lumière
 * qui s'en va, et c'est le seul moment où on la voit quitter le corps.
 */
/**
 * Ce qu'il reste de halo quand Falot a soufflé sa lumière : une mèche. Pas
 * zéro — un écran entièrement noir n'est pas un jeu, et il ne s'éteint pas
 * vraiment, il se couvre. À 0,22 il voit sa propre case et rien d'autre.
 */
const MECHE = 0.22;

export const rayonHalo = (partie: Partie): number =>
  D.halo *
  forme(partie.joueur).halo *
  (partie.joueur.eteint ? MECHE : 1) *
  (0.68 + partie.joueur.souffle * 0.32) *
  (partie.vidange ? Math.max(0.04, 1 - partie.vidange.t / partie.vidange.duree) : 1) *
  partie.eclosion;

// Soufflé, il n'a plus de faisceau du tout : c'est ce qui l'empêche de
// rallumer quoi que ce soit pendant qu'il se cache, et ce qui rend le geste
// coûteux au lieu d'être gratuit.
export const porteeFaisceau = (j: Joueur): number =>
  j.eteint ? 0 : forme(j).portee * CASE;
export const coneFaisceau = (j: Joueur): number => forme(j).cone;

/**
 * Le joueur a peur des mêmes choses que ses âmes, plus une : sentir sa propre
 * lumière se faire manger. Et viser à la pierre passe avant tout le reste :
 * c'est un geste volontaire, il mérite son visage à lui.
 *
 * L'ABRI PASSE AVANT TOUT. Se tenir dans la lumière d'une torche ou d'une
 * braise coupe la détection, mais rien ne le disait : on continuait à jouer la
 * peur au ventre sans savoir qu'on ne risquait plus rien. C'est la seule fois
 * du jeu où Falot sourit, et ça se lit même avec un rouge en alerte à deux pas
 * — c'est précisément là que l'information a de la valeur.
 */
export const humeurDuJoueur = (partie: Partie): Humeur =>
  partie.joueur.abri
    ? HUMEURS.APAISE
    : partie.entrees.visee.actif
      ? HUMEURS.VISEE
      : humeurSelon(
          partie.joueur,
          partie.menace || partie.joueur.vu > 0.15 || partie.joueur.souffle < 0.45,
          partie.joueur.niveau > 0,
        );

/**
 * Cet étage porte-t-il ce trait ? Les règles demandent ça, jamais un numéro
 * d'étage : c'est ce qui permet au Puits sans fin de rejouer les traits en
 * désordre sans qu'une seule règle ne change.
 */
export const aTrait = (zone: Zone, t: Trait): boolean => zone.traits.includes(t);
