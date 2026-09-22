/**
 * L'ÉCRAN-TITRE, l'écran noir d'ouverture, et la navigation entre étages.
 *
 * Trois vues dans un seul écran : l'ACCUEIL (deux portes, Histoire ou Niveau
 * infini), l'HISTOIRE (douze étages, débloqués dans l'ordre, un « Continuer »
 * qui reprend où l'on s'était arrêté), et le PUITS SANS FIN (les étages qu'on
 * y a déjà joués — une grille de douze n'a aucun sens sur l'infini, alors
 * cette vue liste ce qui existe et laisse « Continuer » ouvrir le prochain).
 *
 * Cliquer un étage jamais fait le lance directement. Cliquer un étage déjà
 * fait ouvre son bilan — trois barres, une note en étoiles — avec un bouton
 * pour le rejouer : on retrouve ce qu'on y a laissé avant d'y retourner.
 */

import { chargerZone } from '../coeur/monde/chargement.js';
import { DERNIER_ETAGE } from '../coeur/monde/paliers.js';
import { lancerLaFin } from '../coeur/regles/fin.js';
import { lancerLaChute } from '../coeur/regles/seuil.js';
import type { Partie } from '../coeur/types.js';
import {
  lireProgression,
  oublierLaProgression,
  type Progression,
  type Trace,
} from './sauvegarde.js';
import { type Etoiles, etoilesDe, noteDe, parfait } from './score.js';

const el = <T extends HTMLElement>(id: string): T => {
  const e = document.getElementById(id);
  if (!e) throw new Error(`Élément « ${id} » absent de la page`);
  return e as T;
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

// ---------------------------------------------------------------------------
// LA NAVIGATION ENTRE LES TROIS VUES
// ---------------------------------------------------------------------------

type NomVue = 'accueil' | 'histoire' | 'infini';

/** Bascule quelle vue se voit à l'intérieur de `.titre`, et remonte le
 *  défilement en haut : sans ça on rouvrait l'Histoire là où le Puits sans
 *  fin avait été laissé, défilé à mi-hauteur. */
function montrerVue(nom: NomVue): void {
  el('vue-accueil').hidden = nom !== 'accueil';
  el('vue-histoire').hidden = nom !== 'histoire';
  el('vue-infini').hidden = nom !== 'infini';
  el('titre').scrollTop = 0;
}

/** Le plus haut étage débloqué dans l'HISTOIRE : jamais avant 1, jamais après
 *  le douzième — ce qui est atteint au-delà appartient au Puits sans fin, pas
 *  à un rang qui n'existe pas ici. */
const dernierDebloque = (progres: Progression): number =>
  Math.max(1, Math.min(DERNIER_ETAGE, progres.atteint));

/** Remplit le bouton « Continuer » et le branche sur l'étage visé. Une
 *  assignation à `.onclick`, jamais `addEventListener` : ce bouton n'est
 *  reconstruit à chaque ouverture de vue, et un écouteur de plus à chaque
 *  passage est exactement le bug qui rendait « Choisir un étage » muet
 *  quelques versions plus tôt — voir le commit qui l'a corrigé. */
function poserContinuer(
  bouton: HTMLButtonElement,
  titre: string,
  sousTitre: string,
  cible: number,
  partie: Partie,
): void {
  bouton.innerHTML = '';
  const b = document.createElement('b');
  b.textContent = titre;
  const s = document.createElement('small');
  s.textContent = sousTitre;
  bouton.append(b, s);
  bouton.hidden = false;
  bouton.onclick = () => descendre(partie, cible);
}

/** La rangée d'étoiles sous une case, ou l'étoile spéciale à sa place quand
 *  rien n'est resté dans le noir — voir `interface/score.ts`. */
function construireEtoiles(e: Etoiles, brillant: boolean): HTMLElement {
  const rangee = document.createElement('span');
  rangee.className = 'etoiles';
  if (brillant) {
    const speciale = document.createElement('span');
    speciale.className = 'brillante';
    speciale.textContent = '✦';
    rangee.appendChild(speciale);
    return rangee;
  }
  for (let i = 0; i < 3; i++) {
    const etoile = document.createElement('span');
    if (i < e) etoile.className = 'pleine';
    etoile.textContent = '★';
    rangee.appendChild(etoile);
  }
  return rangee;
}

/** Une ligne du panneau de stats : le mot, la valeur, et une barre épaisse
 *  colorée par `couleur` — la même donnée que `rendu/bilan.ts` affiche en
 *  jeu, mais posée ici pour qu'on la regarde posément. */
function construireLigneStats(
  mot: string,
  valeur: string,
  part: number,
  couleur: string,
): HTMLElement {
  const ligne = document.createElement('div');
  ligne.className = 'ligne';
  ligne.style.color = couleur;
  const entete = document.createElement('div');
  entete.className = 'entete';
  const m = document.createElement('span');
  m.className = 'mot';
  m.textContent = mot;
  const v = document.createElement('span');
  v.className = 'valeur';
  v.textContent = valeur;
  entete.append(m, v);
  const barre = document.createElement('div');
  barre.className = 'barre-epaisse';
  const remplissage = document.createElement('i');
  const pourcent = Math.round(Math.max(0, Math.min(1, part)) * 100);
  remplissage.style.setProperty('--part', `${pourcent}%`);
  barre.appendChild(remplissage);
  ligne.append(entete, barre);
  return ligne;
}

/** Ouvre le panneau de stats d'un étage déjà fait : trois lignes, et un
 *  bouton pour le rejouer. C'est ÇA, cliquer une case déjà faite — on
 *  retrouve d'abord ce qu'on y a laissé, on ne replonge pas dedans tout de
 *  suite. */
function ouvrirPanneau(
  partie: Partie,
  n: number,
  trace: Trace,
  bouton: HTMLButtonElement,
  grille: HTMLElement,
  panneau: HTMLElement,
): void {
  for (const autre of grille.querySelectorAll('button.choisi'))
    autre.classList.remove('choisi');
  bouton.classList.add('choisi');
  panneau.innerHTML = '';
  panneau.hidden = false;

  const titre = document.createElement('h3');
  titre.textContent = `Étage ${n}`;
  panneau.appendChild(titre);

  panneau.appendChild(
    construireLigneStats(
      'Lumière',
      `${Math.round(trace.lumiere * 100)} %`,
      trace.lumiere,
      '#ffe9a8',
    ),
  );
  panneau.appendChild(
    construireLigneStats(
      'Lumières remontées',
      `${trace.lumieres} / ${trace.lumieresTotal}`,
      trace.lumieresTotal ? trace.lumieres / trace.lumieresTotal : 1,
      '#a8f0c8',
    ),
  );
  panneau.appendChild(
    construireLigneStats(
      'Pris',
      trace.morts === 0 ? 'jamais' : `${trace.morts} fois`,
      trace.morts === 0 ? 1 : 1 / (1 + trace.morts),
      trace.morts === 0 ? '#a8f0c8' : '#ff7a6b',
    ),
  );

  if (parfait(trace)) {
    const note = document.createElement('p');
    note.className = 'note-parfaite';
    note.textContent = '✦ Rien n’est resté dans le noir.';
    panneau.appendChild(note);
  }

  const rejouer = document.createElement('button');
  rejouer.type = 'button';
  rejouer.className = 'btn rejouer';
  rejouer.textContent = 'Rejouer';
  rejouer.addEventListener('click', () => descendre(partie, n));
  panneau.appendChild(rejouer);

  panneau.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * BÂTIT UNE GRILLE D'ÉTAGES — l'histoire ou le Puits sans fin, selon la liste
 * qu'on lui donne et la règle de verrou qu'on lui passe. Elle se reconstruit
 * ENTIÈREMENT à chaque appel (`grille.innerHTML = ''` d'abord) : les boutons
 * sont donc toujours neufs, et leur écouteur avec — poser un `addEventListener`
 * dessus ne peut pas s'empiler d'un passage à l'autre, contrairement à un
 * bouton statique qu'on ne détruit jamais (voir `poserContinuer`).
 */
function construireGrille(
  partie: Partie,
  progres: Progression,
  etages: readonly number[],
  verrouille: (n: number) => boolean,
  grille: HTMLElement,
  panneau: HTMLElement,
): void {
  grille.innerHTML = '';
  panneau.hidden = true;
  panneau.innerHTML = '';
  for (const n of etages) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = String(n);
    const bloque = verrouille(n);
    b.disabled = bloque;
    const trace = bloque ? undefined : progres.etages[n];
    if (trace) {
      b.classList.add('fait');
      const brillant = parfait(trace);
      if (brillant) b.classList.add('parfait');
      b.appendChild(construireEtoiles(etoilesDe(trace), brillant));
      b.title = `${Math.round(trace.lumiere * 100)} % éclairé, ${trace.lumieres}/${trace.lumieresTotal} lumières, pris ${trace.morts} fois — note ${Math.round(noteDe(trace) * 100)}/100`;
      b.addEventListener('click', () =>
        ouvrirPanneau(partie, n, trace, b, grille, panneau),
      );
    } else if (!bloque) {
      b.addEventListener('click', () => descendre(partie, n));
    }
    grille.appendChild(b);
  }
}

/** L'HISTOIRE : douze étages dans l'ordre, verrouillés au-delà du plus haut
 *  atteint, et le bouton Continuer qui reprend juste après. */
function ouvrirHistoire(partie: Partie): void {
  montrerVue('histoire');
  const progres = lireProgression();
  const continuer = el<HTMLButtonElement>('histoire-continuer');
  if (progres.atteint > DERNIER_ETAGE) {
    // toute l'histoire a déjà été traversée : rien à reprendre, la grille
    // seule suffit — chaque case est débloquée et se rejoue directement
    continuer.hidden = true;
  } else {
    const prochain = dernierDebloque(progres);
    const commence = progres.atteint > 1 || Boolean(progres.etages[1]);
    poserContinuer(
      continuer,
      commence ? 'Continuer' : 'Commencer l’aventure',
      commence ? `Étage ${prochain}` : 'Le réveil',
      prochain,
      partie,
    );
  }
  const etages: number[] = [];
  for (let n = 1; n <= DERNIER_ETAGE; n++) etages.push(n);
  construireGrille(
    partie,
    progres,
    etages,
    (n) => n > dernierDebloque(progres),
    el('etages'),
    el('histoire-stats'),
  );
}

/** LE PUITS SANS FIN : aucun verrou — il n'y a pas d'ordre à respecter sur
 *  une infinité d'étages — seulement la liste de ceux qu'on a déjà ouverts, et
 *  « Continuer » pour en découvrir un de plus. */
function ouvrirInfini(partie: Partie): void {
  montrerVue('infini');
  const progres = lireProgression();
  const prochain = Math.max(DERNIER_ETAGE + 1, progres.atteint);
  poserContinuer(
    el<HTMLButtonElement>('infini-continuer'),
    'Continuer',
    `Étage ${prochain}`,
    prochain,
    partie,
  );
  const joues = Object.keys(progres.etages)
    .map(Number)
    .filter((n) => n > DERNIER_ETAGE)
    .sort((a, b) => a - b);
  el('infini-vide').hidden = joues.length > 0;
  construireGrille(
    partie,
    progres,
    joues,
    () => false,
    el('infini-etages'),
    el('infini-stats'),
  );
}

/**
 * EFFACER LA PROGRESSION SAUVEGARDÉE — en deux temps, jamais d'un seul clic :
 * un premier clic arme le bouton (son texte le dit, sa couleur vire au rouge
 * d'alerte du jeu) pendant quatre secondes, et seul un second clic DANS ce
 * délai efface pour de bon. Passé le délai, il se désarme tout seul — se
 * tromper de bouton ne coûte donc jamais la sauvegarde.
 */
let effacementArme: ReturnType<typeof setTimeout> | null = null;

function brancherEffacement(partie: Partie): void {
  const bouton = el<HTMLButtonElement>('titre-effacer');
  const repos = bouton.textContent ?? '';
  bouton.addEventListener('click', () => {
    if (effacementArme) {
      clearTimeout(effacementArme);
      effacementArme = null;
      oublierLaProgression();
      bouton.textContent = repos;
      bouton.classList.remove('arme');
      // Si on est déjà sur l'une des deux vues de sélection, elle doit
      // montrer le vide tout de suite — pas seulement au prochain passage.
      if (!el('vue-histoire').hidden) ouvrirHistoire(partie);
      if (!el('vue-infini').hidden) ouvrirInfini(partie);
      return;
    }
    bouton.textContent = 'Confirmer — tout effacer ?';
    bouton.classList.add('arme');
    effacementArme = setTimeout(() => {
      effacementArme = null;
      bouton.textContent = repos;
      bouton.classList.remove('arme');
    }, 4000);
  });
}

/** Vrai une fois les boutons de l'écran-titre branchés : on y revient en cours
 *  de partie, et rebrancher à chaque retour empilerait les écouteurs. */
let branche = false;

/**
 * REVENIR À L'ÉCRAN-TITRE, qui est le hub du jeu.
 *
 * La flèche en haut à gauche renvoyait au hub du SITE, c'est-à-dire hors du
 * jeu : on quittait la page pour revenir choisir un étage. Elle ramène
 * maintenant là où l'on choisit un étage, sans quitter quoi que ce soit — et
 * toujours sur l'ACCUEIL : revenir en cours de partie ne doit pas rouvrir la
 * grille précise qu'on avait laissée trois étages plus tôt.
 */
export function retourAuTitre(partie: Partie): void {
  partie.gele = true;
  partie.fin = null;
  el('titre').classList.add('on');
  montrerVue('accueil');
}

/** L'écran-titre, et ses boutons. */
export function poserLEcranTitre(partie: Partie): void {
  partie.gele = true;
  el('titre').classList.add('on');
  montrerVue('accueil');
  if (branche) return;
  branche = true;
  // Le saut reste visible en permanence. La règle « débloqué après une première
  // fin » est la bonne pour un jeu publié, mais elle rend l'étage 1 obligatoire
  // à chaque essai pendant qu'on le construit. Pour la rétablir :
  // `hidden = !prologueFini()`.
  (el('titre-plus-haut') as HTMLButtonElement).hidden = false;
  el('titre-plus-haut').addEventListener('click', () => descendre(partie, 2));
  el('titre-fin').addEventListener('click', () => voirLaFin(partie));
  el<HTMLButtonElement>('bouton-histoire').addEventListener('click', () =>
    ouvrirHistoire(partie),
  );
  el<HTMLButtonElement>('bouton-infini').addEventListener('click', () =>
    ouvrirInfini(partie),
  );
  el<HTMLButtonElement>('histoire-retour').addEventListener('click', () =>
    montrerVue('accueil'),
  );
  el<HTMLButtonElement>('infini-retour').addEventListener('click', () =>
    montrerVue('accueil'),
  );
  brancherEffacement(partie);
  // Le timbre de construction, injecté par Vite. En développement il n'existe
  // pas : on ne se demande jamais si on a la dernière version d'un serveur qui
  // recharge tout seul.
  const bati = typeof __BATI__ === 'string' ? `version ${__BATI__}` : '';
  el('bati').textContent = bati;
  el('bati-jeu').textContent = bati;
}
