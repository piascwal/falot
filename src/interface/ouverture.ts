/**
 * L'écran-titre et l'écran noir d'ouverture.
 *
 * Deux lignes, aucun bouton, il s'efface tout seul. C'est le seul arrêt qu'on
 * s'autorise avant la première image — et on peut l'écourter d'un geste, parce
 * qu'on le reverra à chaque partie.
 */

import { chargerZone } from '../coeur/monde/chargement.js';
import { lancerLaChute } from '../coeur/regles/seuil.js';
import type { Partie } from '../coeur/types.js';

const el = (id: string): HTMLElement => {
  const e = document.getElementById(id);
  if (!e) throw new Error(`Élément « ${id} » absent de la page`);
  return e;
};

/** Le saut du prologue ne s'ouvre qu'à qui l'a déjà fini une fois. On ne
 *  demande jamais au joueur s'il veut apprendre un jeu qu'il n'a pas vu. */
const CLE_PROLOGUE = 'lux-etage1-fini';

export const prologueFini = (): boolean => {
  try {
    return localStorage.getItem(CLE_PROLOGUE) === 'oui';
  } catch {
    return false; // navigation privée : tant pis
  }
};

export function retenirPrologue(): void {
  try {
    localStorage.setItem(CLE_PROLOGUE, 'oui');
  } catch {
    /* navigation privée */
  }
}

/** Descend à un étage : referme l'écran-titre, et joue l'ouverture si c'est le premier. */
export function descendre(partie: Partie, etage: number): void {
  el('titre').classList.remove('on');
  chargerZone(partie, etage);
  if (etage > 1) {
    partie.gele = false;
    partie.eclosion = 1;
    return;
  }
  partie.eclosion = 0; // il ne doit pas apparaître derrière l'écran noir
  ouvrir(partie);
}

function ouvrir(partie: Partie): void {
  const elOuverture = el('ouverture');
  elOuverture.classList.add('on');
  partie.gele = true;
  let clos = false;
  const fermer = () => {
    if (clos) return;
    clos = true;
    for (const m of minuteries) clearTimeout(m);
    removeEventListener('pointerdown', fermer);
    removeEventListener('keydown', fermer);
    elOuverture.classList.remove('on');
    // La lumière part AVANT que le noir ait fini de s'effacer : on la voit déjà
    // descendre à travers les derniers mots.
    lancerLaChute(partie);
    partie.gele = false;
    setTimeout(() => {
      el('ouverture-1').classList.remove('vu');
      el('ouverture-2').classList.remove('vu');
    }, 900);
  };
  const minuteries = [
    setTimeout(() => el('ouverture-1').classList.add('vu'), 400),
    setTimeout(() => el('ouverture-2').classList.add('vu'), 2200),
    setTimeout(fermer, 5400),
    // on laisse le temps de lire avant d'autoriser le saut
    setTimeout(() => {
      if (clos) return;
      addEventListener('pointerdown', fermer);
      addEventListener('keydown', fermer);
    }, 1300),
  ];
}

/** L'écran-titre, et ses deux boutons. */
export function poserLEcranTitre(partie: Partie): void {
  partie.gele = true;
  el('titre').classList.add('on');
  // Le saut reste visible en permanence. La règle « débloqué après une première
  // fin » est la bonne pour un jeu publié, mais elle rend l'étage 1 obligatoire
  // à chaque essai pendant qu'on le construit. Pour la rétablir :
  // `hidden = !prologueFini()`.
  (el('titre-plus-haut') as HTMLButtonElement).hidden = false;
  el('titre-descendre').addEventListener('click', () => descendre(partie, 1));
  el('titre-plus-haut').addEventListener('click', () => descendre(partie, 2));
}
