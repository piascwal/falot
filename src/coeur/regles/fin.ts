/**
 * LA FIN — ce que deviennent les lumières, et ce qu'il reste de lui.
 *
 * Le scénario ne parle plus d'âmes : ce sont des LUMIÈRES, et rien d'autre.
 * Falot les remonte, elles repartent allumer quelque chose là-haut, et on le
 * voit — un enfant, un couple, un trottoir sous la pluie, un bateau au large.
 *
 * Puis il cherche la sienne. Il erre dans un monde déjà allumé, et il essaie
 * d'aller en prendre une : chacune a déjà quelqu'un. À chaque tentative il
 * donne un peu de ce qu'il avait gardé, et ça ne revient pas. Autour de lui
 * les fenêtres s'éteignent une à une — le monde va se coucher, sans lui.
 *
 * Quand il est vide, il retombe : tout le tunnel qu'il vient de monter défile
 * à l'envers. Il n'a pas échoué contre quelqu'un, et il n'y a rien à réparer.
 * Il redescend parce qu'il en reste à remonter.
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
 *   — L'ERRANCE : il cherche la sienne dans un monde déjà allumé, il se vide à
 *     essayer, et le monde s'éteint autour de lui ;
 *   — LA CHUTE : il retombe, tout le long de ce qu'il vient de monter.
 *
 * L'errance est la plus longue de loin : c'est la seule qui ait besoin de
 * durer. Les quatre scènes se comprennent en un coup d'œil ; se vider, non.
 */
export const TEMPS_FIN = {
  escorte: 4.5,
  fil: 5,
  quatre: 4.5,
  errance: 14,
  chute: 5.5,
} as const;
export type EtapeFin = keyof typeof TEMPS_FIN;
const ORDRE = ['escorte', 'fil', 'quatre', 'errance', 'chute'] as const;
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
