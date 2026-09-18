/**
 * Le clavier : les flèches pour marcher, l'espace pour lancer un caillou droit
 * devant. On empêche les flèches de faire défiler la page — il n'y a rien à
 * défiler, mais le navigateur ne le sait pas.
 */

import { lancerCaillou } from '../coeur/regles/caillou.js';
import type { Partie, Touches } from '../coeur/types.js';

const CAP_TOUCHES: Record<string, keyof Touches> = {
  ArrowLeft: 'gauche',
  ArrowRight: 'droite',
  ArrowUp: 'haut',
  ArrowDown: 'bas',
};

export function brancherClavier(partie: Partie): void {
  const touches = partie.entrees.touches;

  window.addEventListener('keydown', (e) => {
    const t = CAP_TOUCHES[e.key];
    if (t) {
      touches[t] = true;
      e.preventDefault();
      return;
    }
    if (e.key === ' ' && !e.repeat) {
      lancerCaillou(partie, partie.joueur.regard, 0.55);
      e.preventDefault();
    }
  });

  window.addEventListener('keyup', (e) => {
    const t = CAP_TOUCHES[e.key];
    if (t) {
      touches[t] = false;
      e.preventDefault();
    }
  });

  // une fenêtre qui perd le focus garde les touches enfoncées : on relâche tout
  window.addEventListener('blur', () => {
    touches.gauche = false;
    touches.droite = false;
    touches.haut = false;
    touches.bas = false;
  });
}
