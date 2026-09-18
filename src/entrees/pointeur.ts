/**
 * Le doigt : le joystick flottant, et le bouton pierre.
 *
 * Le joystick naît exactement sous le doigt, où qu'on le pose — sur un
 * téléphone, une croix fixe demande de regarder ses pouces.
 *
 * Le bouton pierre garde le doigt : on appuie, on glisse pour viser, on
 * relâche pour lancer. Le lancer part au RELÂCHEMENT, jamais à l'appui : c'est
 * ce qui laisse ajuster la direction tant que le doigt est posé.
 */

import { clamp } from '../coeur/geometrie.js';
import { prendreOuLacherLeFanal } from '../coeur/regles/fanal.js';
import { lancerPierre } from '../coeur/regles/pierre.js';
import type { Partie, Point } from '../coeur/types.js';
import { RAYON_MANCHE } from '../rendu/gestes.js';

export function brancherPointeur(
  canvas: HTMLCanvasElement,
  bouton: HTMLButtonElement,
  partie: Partie,
): void {
  const manche = partie.entrees.manche;
  const visee = partie.entrees.visee;

  const pointCanvas = (e: PointerEvent): Point => {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const majManche = (p: Point) => {
    const dx = p.x - manche.ox;
    const dy = p.y - manche.oy;
    const d = Math.hypot(dx, dy);
    manche.force = clamp(d / RAYON_MANCHE, 0, 1);
    if (d > 0.01) {
      manche.dx = dx / d;
      manche.dy = dy / d;
    }
  };

  canvas.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    if (manche.id !== null) return;
    canvas.setPointerCapture(e.pointerId);
    const p = pointCanvas(e);
    manche.id = e.pointerId;
    manche.actif = true;
    manche.ox = p.x;
    manche.oy = p.y;
    manche.dx = 0;
    manche.dy = 0;
    manche.force = 0;
  });

  canvas.addEventListener('pointermove', (e) => {
    if (e.pointerId !== manche.id) return;
    majManche(pointCanvas(e));
  });

  for (const t of ['pointerup', 'pointercancel'] as const) {
    canvas.addEventListener(t, (e) => {
      if (e.pointerId !== manche.id) return;
      manche.actif = false;
      manche.force = 0;
      manche.id = null;
    });
  }

  bouton.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (bouton.disabled || visee.id !== null) return;
    bouton.setPointerCapture(e.pointerId);
    visee.id = e.pointerId;
    visee.actif = true;
    visee.ox = e.clientX;
    visee.oy = e.clientY;
    visee.dx = Math.cos(partie.joueur.regard);
    visee.dy = Math.sin(partie.joueur.regard);
    visee.force = 0.55;
  });

  bouton.addEventListener('pointermove', (e) => {
    if (e.pointerId !== visee.id) return;
    const dx = e.clientX - visee.ox;
    const dy = e.clientY - visee.oy;
    const d = Math.hypot(dx, dy);
    if (d > 8) {
      visee.dx = dx / d;
      visee.dy = dy / d;
      visee.force = clamp(d / 110, 0.15, 1);
    }
  });

  bouton.addEventListener('pointerup', (e) => {
    if (e.pointerId !== visee.id) return;
    visee.id = null;
    visee.actif = false;
    lancerPierre(partie, Math.atan2(visee.dy, visee.dx), visee.force);
  });

  // Une annulation n'est pas un lâcher : on abandonne la visée sans rien lancer.
  bouton.addEventListener('pointercancel', (e) => {
    if (e.pointerId !== visee.id) return;
    visee.id = null;
    visee.actif = false;
  });

  bouton.addEventListener('click', (e) => e.preventDefault());
}

/** Le bouton fanal : un geste, pas un maintien — on prend, ou on repose. */
export function brancherFanal(bouton: HTMLButtonElement, partie: Partie): void {
  bouton.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    prendreOuLacherLeFanal(partie);
  });
  bouton.addEventListener('click', (e) => e.preventDefault());
}

/**
 * Le bouton souffle : tenu, pas basculé. Tant que le doigt est dessus, Falot se
 * couvre ; dès qu'il part — relâché, annulé, ou le doigt qui sort du bouton —
 * la lumière revient. Un doigt qui glisse hors du bouton ne doit pas laisser
 * Falot éteint sans qu'il le sache.
 */
export function brancherSouffle(bouton: HTMLButtonElement, partie: Partie): void {
  const tenir = (oui: boolean) => {
    partie.entrees.souffle = oui;
    bouton.classList.toggle('tenu', oui);
  };
  bouton.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    bouton.setPointerCapture(e.pointerId);
    tenir(true);
  });
  for (const t of ['pointerup', 'pointercancel', 'pointerleave'] as const)
    bouton.addEventListener(t, () => tenir(false));
  bouton.addEventListener('click', (e) => e.preventDefault());
  window.addEventListener('blur', () => tenir(false));
}
