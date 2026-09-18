/**
 * UNE seule voix.
 *
 * Le bandeau passager et les phrases du décor disaient la même chose, de deux
 * couleurs et à deux endroits différents, et se recouvraient l'une l'autre.
 * Tout ce qui EXPLIQUE passe désormais par le bandeau, d'un seul ton ; seules
 * les répliques des âmes restent dans le monde, attachées à qui parle — là, la
 * couleur dit qui, pas quoi.
 *
 * Rien ici ne touche au DOM : la voix est un ÉTAT de la partie (`partie.bandeau`),
 * et l'interface ne fait que le refléter. C'est ce qui permet de tester ce que
 * le jeu dit, et à quel moment.
 */

import { RALLUME } from './formes.js';
import type { Partie, Perso } from './types.js';

/** Une phrase qui passe par le bandeau du bas. */
export interface VoixBandeau {
  texte: string;
  duree: number;
}

/** Une phrase attachée à quelqu'un : elle reste dans le monde et le suit. */
export interface VoixMonde extends VoixBandeau {
  x: number;
  y: number;
  couleur: string;
  sujet: Perso;
}

export type Voix = VoixBandeau | VoixMonde;

const dansLeMonde = (v: Voix): v is VoixMonde => 'sujet' in v;

/** L'état du bandeau. `pale` : la phrase reste lisible, mais s'efface du regard. */
export interface Bandeau {
  texte: string;
  visible: boolean;
  pale: boolean;
}

export const nouveauBandeau = (): Bandeau => ({ texte: '', visible: false, pale: false });

/** Une phrase de plus alors qu'une autre vient de commencer : elle attend. */
export function dire(partie: Partie, v: Voix): void {
  if (partie.voixT > 0.25) {
    if (partie.filVoix.length < 3) partie.filVoix.push(v);
    return;
  }
  poserVoix(partie, v);
}

export function poserVoix(partie: Partie, v: Voix): void {
  partie.voixT = v.duree;
  if (dansLeMonde(v)) {
    partie.flottants.push({
      x: v.x,
      y: v.y,
      texte: v.texte,
      couleur: v.couleur,
      vie: v.duree,
      max: v.duree,
      murmure: true,
      sujet: v.sujet,
    });
  } else {
    partie.bandeau.texte = v.texte;
    partie.bandeau.visible = true;
    partie.bandeau.pale = false;
  }
}

export function majVoix(partie: Partie, dt: number): void {
  if (partie.voixT > 0) {
    partie.voixT -= dt;
    if (partie.voixT > 0) return;
    // Le bandeau ne disparaît PAS : il pâlit et il reste. Une règle qui
    // s'efface au bout de quatre secondes, on ne la lit qu'à moitié ; là on
    // peut y revenir quand on veut, et elle ne gêne personne.
    partie.bandeau.pale = true;
  }
  const suivante = partie.filVoix.shift();
  if (suivante) poserVoix(partie, suivante);
}

/** Le bandeau : tout ce que le jeu explique. */
export const montrerToast = (partie: Partie, texte: string): void =>
  dire(partie, { texte, duree: 4.4 });

/**
 * Un murmure. Avec un sujet, il reste dans le monde et suit celui qui parle ;
 * sans sujet, c'est une explication et elle passe par le bandeau comme les
 * autres.
 */
export function murmurer(
  partie: Partie,
  x: number,
  y: number,
  texte: string,
  couleur?: string,
  sujet?: Perso,
): void {
  if (sujet) dire(partie, { x, y, texte, couleur: couleur ?? RALLUME, sujet, duree: 4.2 });
  else dire(partie, { texte, duree: 5.4 });
}
