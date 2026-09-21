/**
 * L'écran-titre et l'écran noir d'ouverture.
 *
 * Deux lignes, aucun bouton, il s'efface tout seul. C'est le seul arrêt qu'on
 * s'autorise avant la première image — et on peut l'écourter d'un geste, parce
 * qu'on le reverra à chaque partie.
 */

import { chargerZone } from '../coeur/monde/chargement.js';
import { DERNIER_ETAGE } from '../coeur/monde/paliers.js';
import { sansFaute } from '../coeur/regles/bilan.js';
import { lancerLaFin } from '../coeur/regles/fin.js';
import { lancerLaChute } from '../coeur/regles/seuil.js';
import type { Partie } from '../coeur/types.js';
import { lireProgression } from './sauvegarde.js';

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

/**
 * RACCOURCI D'ESSAI : la fin, tout de suite.
 *
 * Elle arrive au bout de douze étages, et il faut bien pouvoir la regarder
 * sans les refaire. On charge le dernier étage et on lance la scène : ce qu'on
 * voit est exactement ce que voit quelqu'un qui y est arrivé en jouant — à une
 * chose près, la cage d'escalier qui suit est vide, puisqu'on n'a rien remonté.
 *
 * Pour le fermer le jour de la publication : `hidden = true` sur le lien.
 */
declare const __BATI__: string | undefined;

export function voirLaFin(partie: Partie): void {
  el('titre').classList.remove('on');
  chargerZone(partie, DERNIER_ETAGE);
  partie.gele = false;
  partie.eclosion = 1;
  partie.chute = null; // pas d'arrivée : on ne joue pas cet étage, on le finit
  lancerLaFin(partie);
}

/**
 * LA GRILLE DES ÉTAGES. Douze carrés : ce qu'on a éclairé de chacun, et un
 * cadre vert pour ceux qu'on a faits sans faute. On peut y repartir d'où l'on
 * veut — c'est le tableau de progression et le raccourci de mise au point, et
 * les deux méritaient le même écran.
 *
 * Un étage qu'on n'a jamais atteint reste fermé : sauter à l'étage 9 sans
 * l'avoir mérité, c'est se gâcher le jeu sans le savoir. `?debug` dans
 * l'adresse les ouvre tous — c'est l'outil de mise au point.
 */
function poserLaGrille(partie: Partie, tout: boolean): void {
  const grille = el('etages');
  const bouton = el('titre-etages') as HTMLButtonElement;
  bouton.addEventListener('click', () => {
    grille.hidden = !grille.hidden;
    bouton.textContent = grille.hidden ? 'Choisir un étage' : 'Masquer les étages';
  });
  const progres = lireProgression();
  for (let n = 1; n <= DERNIER_ETAGE; n++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = String(n);
    const trace = progres.etages[n];
    if (trace) {
      b.classList.add('fait');
      if (sansFaute(trace)) b.classList.add('parfait');
      const barre = document.createElement('i');
      barre.style.setProperty('--part', `${Math.round(trace.lumiere * 100)}%`);
      b.appendChild(barre);
      b.title = `${Math.round(trace.lumiere * 100)} % éclairé, ${trace.lumieres}/${trace.lumieresTotal} lumières, pris ${trace.morts} fois`;
    }
    // `?debug` ouvre tout : pendant qu'on construit, on veut aller voir
    // l'étage 10 sans avoir fait les neuf autres.
    b.disabled = !tout && n > Math.max(1, progres.atteint);
    b.addEventListener('click', () => descendre(partie, n));
    grille.appendChild(b);
  }
}

/** L'écran-titre, et ses boutons. */
export function poserLEcranTitre(partie: Partie, tout = false): void {
  partie.gele = true;
  el('titre').classList.add('on');
  // Le saut reste visible en permanence. La règle « débloqué après une première
  // fin » est la bonne pour un jeu publié, mais elle rend l'étage 1 obligatoire
  // à chaque essai pendant qu'on le construit. Pour la rétablir :
  // `hidden = !prologueFini()`.
  (el('titre-plus-haut') as HTMLButtonElement).hidden = false;
  el('titre-descendre').addEventListener('click', () => descendre(partie, 1));
  el('titre-plus-haut').addEventListener('click', () => descendre(partie, 2));
  el('titre-fin').addEventListener('click', () => voirLaFin(partie));
  // Le timbre de construction, injecté par Vite. En développement il n'existe
  // pas : on ne se demande jamais si on a la dernière version d'un serveur qui
  // recharge tout seul.
  const bati = typeof __BATI__ === 'string' ? `version ${__BATI__}` : '';
  el('bati').textContent = bati;
  el('bati-jeu').textContent = bati;
  poserLaGrille(partie, tout);
}
