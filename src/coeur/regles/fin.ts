/**
 * LA FIN — ce que deviennent les lumières, et pourquoi il retombe.
 *
 * Le scénario ne parle plus d'âmes : ce sont des LUMIÈRES, et rien d'autre.
 * Falot les remonte, elles repartent allumer quelque chose là-haut, et on le
 * voit — un enfant, un couple, un trottoir sous la pluie, un bateau au large.
 *
 * Puis vient la sienne. Elle l'attend, elle est là, et il ne peut pas la
 * rejoindre : **une lumière est toujours à l'autre bout du faisceau.** Plus
 * il s'approche, moins il éclaire ; collé à la vitre, il n'éclaire plus rien
 * du tout. C'est la règle que le jeu enseigne depuis le premier étage — ce
 * qui est posé t'efface, ce que tu portes te trahit — retournée contre lui.
 *
 * Il n'y a donc personne à blâmer, et rien à réparer : il recule pour que ça
 * reste allumé, et il redescend parce qu'il en reste à remonter.
 *
 * Cinq temps, rien à cliquer. Une commande tenue accélère : on peut avoir
 * déjà vu la fin sans vouloir l'attendre une deuxième fois.
 */

import { clamp } from '../geometrie.js';
import { chargerZone } from '../monde/chargement.js';
import type { Partie } from '../types.js';
import { faireTaireLEtage } from './puits.js';
import { lancerLaChute } from './seuil.js';

/**
 * La durée de chaque temps, en secondes, dans l'ordre où ils viennent :
 *   — L'ESCORTE : Falot, en bleu, mène son convoi de lumières à la surface ;
 *   — LE FIL : elles le quittent et prennent un fil, comme celui qu'il laisse
 *     derrière lui, qui se sépare en quatre ;
 *   — LES QUATRE : chacune allume sa scène, et on les voit toutes les quatre ;
 *   — LA SIENNE : sa fenêtre à lui, et ce qui se passe quand il s'approche ;
 *   — LA CHUTE : il redescend.
 */
export const TEMPS_FIN = {
  escorte: 5,
  fil: 2.6,
  quatre: 8,
  sienne: 9,
  chute: 4.5,
} as const;
export type EtapeFin = keyof typeof TEMPS_FIN;
const ORDRE = ['escorte', 'fil', 'quatre', 'sienne', 'chute'] as const;
export const DUREE_FIN = ORDRE.reduce((a, e) => a + TEMPS_FIN[e], 0);

export function lancerLaFin(partie: Partie): void {
  partie.fin = { t: 0 };
  faireTaireLEtage(partie); // rien ne doit rester par-dessus la dernière image
  partie.joueur.vx = 0;
  partie.joueur.vy = 0;
}

/** Où en est-on de la fin : le temps écoulé, découpé en cinq. */
export function tempsFin(t: number): { etape: EtapeFin; k: number } {
  let reste = t;
  for (const etape of ORDRE) {
    const d = TEMPS_FIN[etape];
    if (reste < d) return { etape, k: clamp(reste / d, 0, 1) };
    reste -= d;
  }
  return { etape: 'chute', k: 1 };
}

export function majFin(partie: Partie, dt: number): void {
  const fin = partie.fin;
  if (!fin) return;
  const { touches, manche } = partie.entrees;
  // Une main posée presse le mouvement : la deuxième fois, on sait déjà.
  const presse =
    touches.haut || touches.bas || touches.gauche || touches.droite || manche.actif;
  fin.t += dt * (presse ? 4 : 1);
  if (fin.t < DUREE_FIN) return;

  // ET ÇA RECOMMENCE. Il est retombé tout en bas, là où le jeu a commencé.
  // Pas un mode déverrouillé, pas un bonus : la même descente, parce qu'il
  // reste des lumières et qu'il n'a pas choisi autre chose.
  partie.fin = null;
  partie.finVue = true;
  chargerZone(partie, 1);
  lancerLaChute(partie, 'haut', false);
}
