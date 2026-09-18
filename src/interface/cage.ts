/**
 * LA CAGE D'ESCALIER.
 *
 * Ce n'est pas une barre de progression : c'est un appel des noms. On y voit
 * s'accumuler, étage par étage, les petites lumières qu'on y a envoyées. Au
 * -dessus, trois étages de noir, et la seule mention qu'on se permette :
 * « personne n'est jamais monté si haut ».
 *
 * Une carte à la Candy Crush se parcourt en touriste ; ici on évacue un
 * immeuble par le bas, et c'est la verticalité qui porte le propos.
 */

import { RECIT_CAGE, RECIT_PLUS_HAUT } from '../coeur/textes.js';
import type { Partie } from '../coeur/types.js';

const el = (id: string): HTMLElement => {
  const e = document.getElementById(id);
  if (!e) throw new Error(`Élément « ${id} » absent de la page`);
  return e;
};

export interface Cage {
  /** À appeler une fois par image : la cage s'ouvre quand `partie.cage` change. */
  maj(partie: Partie): void;
}

export function creerCage(): Cage {
  const elCage = el('cage');
  const elPuits = el('puits');
  let montree: number | null = null;

  el('cage-ok').addEventListener('click', () => {
    elCage.classList.remove('on');
    if (aFermer) aFermer();
  });
  let aFermer: (() => void) | null = null;

  function montrer(partie: Partie, arrivee: number): void {
    el('cage-titre').textContent = `Étage ${arrivee}`;
    const total = partie.montee.reduce((a, m) => a + m.ames, 0);
    el('cage-bilan').textContent =
      total === 1 ? '1 âme remontée derrière toi' : `${total} âmes remontées derrière toi`;

    elPuits.innerHTML = '';
    // trois étages de noir au-dessus : on ne sait jamais combien il en reste
    for (let e = 1; e <= arrivee + 3; e++) {
      const fait = partie.montee.find((m) => m.etage === e);
      const ligne = document.createElement('div');
      ligne.className = `etage ${
        fait ? 'franchi' : e === arrivee ? 'ici' : e < arrivee ? 'franchi' : 'noir'
      }`;
      const no = document.createElement('span');
      no.className = 'no';
      // le vrai numéro d'étage, pas une profondeur : « −1 » laissait croire
      // qu'on touchait à la surface, alors qu'on ignore la hauteur du puits
      no.textContent = e > arrivee ? '?' : String(e);
      ligne.appendChild(no);
      if (fait && fait.ames > 0) {
        const ames = document.createElement('span');
        ames.className = 'ames';
        for (let i = 0; i < fait.ames; i++) ames.appendChild(document.createElement('i'));
        ligne.appendChild(ames);
      } else {
        const m = document.createElement('span');
        m.className = 'mention';
        // la mention du vide ne se dit qu'UNE fois, sur le premier étage
        // inconnu : répétée à chaque ligne, elle devenait du bruit
        m.textContent =
          e === arrivee
            ? 'tu arrives ici'
            : e === arrivee + 1
              ? 'personne n’est jamais monté si haut'
              : e > arrivee
                ? ''
                : 'vidé';
        ligne.appendChild(m);
      }
      elPuits.appendChild(ligne);
    }
    el('cage-recit').textContent =
      RECIT_CAGE[arrivee] ?? RECIT_PLUS_HAUT[(arrivee - 5) % RECIT_PLUS_HAUT.length];

    elCage.classList.add('on');
    // l'étage courant doit être visible même quand la liste s'allonge
    requestAnimationFrame(() => {
      elPuits.scrollTop = elPuits.scrollHeight;
    });
  }

  return {
    maj(partie: Partie): void {
      aFermer = () => {
        partie.cage = null;
        partie.gele = false;
      };
      if (partie.cage === montree) return;
      montree = partie.cage;
      if (partie.cage === null) {
        elCage.classList.remove('on');
        return;
      }
      partie.gele = true;
      montrer(partie, partie.cage);
    },
  };
}
