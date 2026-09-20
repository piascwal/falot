/**
 * LA PARTIE : l'état du jeu, et la fonction qui le fait avancer d'un pas.
 *
 * `avancer(partie, dt)` ne connaît ni canvas, ni DOM, ni horloge. On peut donc
 * la faire tourner mille fois dans un test et vérifier ce qui en sort — c'est
 * tout l'intérêt du découpage, et c'est ce que le POC ne permettait pas.
 *
 * Le pas de temps est FIXE (voir `PAS`). Le POC avançait d'un `dt` variable
 * plafonné à 1/30 : le jeu ne se comportait donc pas tout à fait pareil sur une
 * machine qui peine, et aucune partie n'était rejouable.
 */

import { grainDepuisTexte, mulberry32 } from './alea.js';
import { PIERRE } from './formes.js';
import { chargerZone } from './monde/chargement.js';
import { majFlottants, majParticules } from './particules.js';
import { majBilan, marquerVues } from './regles/bilan.js';
import { majFin } from './regles/fin.js';
import { majJoueur, SOUFFLE_MAX } from './regles/joueur.js';
import { propager, souffler } from './regles/lumiere.js';
import { majRegles } from './regles/monde.js';
import { majPersos } from './regles/persos.js';
import { majPierres } from './regles/pierre.js';
import { majPortes } from './regles/portes.js';
import { majPuits } from './regles/puits.js';
import { majChute, majEnvol, majVidange } from './regles/seuil.js';
import type { Entrees, Joueur, Partie, Perso, Zone } from './types.js';
import { majVoix, nouveauBandeau } from './voix.js';

/** Le pas de simulation : soixante fois par seconde, quoi qu'affiche l'écran. */
export const PAS = 1 / 60;

/** Au-delà, on laisse filer plutôt que de rattraper : revenir d'un onglet resté
 *  en arrière-plan ne doit pas simuler trente secondes d'un coup. */
export const PAS_MAX_PAR_IMAGE = 3;

const nouvellesEntrees = (): Entrees => ({
  manche: { actif: false, ox: 0, oy: 0, dx: 0, dy: 0, force: 0, id: null },
  // Au clavier, les flèches valent un joystick poussé à fond. Elles ne passent
  // pas par `manche` : sinon le cercle du joystick s'afficherait au milieu de
  // l'écran sans qu'aucun doigt ne le tienne.
  touches: { gauche: false, droite: false, haut: false, bas: false },
  visee: { actif: false, ox: 0, oy: 0, dx: 0, dy: 0, force: 0, id: null },
  souffle: false,
});

const nouveauJoueur = (): Joueur => ({
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  sx: 1,
  sy: 1,
  vsx: 0,
  vsy: 0,
  regard: -Math.PI / 2,
  eclat: 0,
  sommet: 0,
  niveau: 0,
  souffle: 1,
  repit: 0,
  eteint: false,
  souffleReste: SOUFFLE_MAX,
  air: 1,
  fanal: null,
  vu: 0,
  // Sans lui, `sin(temps + undefined)` valait NaN et la bouche du joueur ne se
  // dessinait pas du tout.
  tremble: 0,
  // Le joueur ne cligne pas et ne s'aveugle pas, mais il partage le corps des
  // âmes : les champs existent, à zéro.
  aveugle: 0,
  cligne: 0,
  pierres: PIERRE[0].reserve,
  pierreDispo: 1,
  bonus: null,
  bonusT: 0,
  abri: false,
  rayons: null,
  rayonsHalo: null,
});

export interface Reglages {
  /** Le nom du plan. À graine égale, étage égal. */
  grain?: string;
  /** L'étage de départ. 1 = l'étage écrit à la main. */
  etage?: number;
  /** De quoi remplacer le hasard cosmétique, pour un test au cordeau. */
  hasard?: () => number;
}

/**
 * Crée une partie prête à jouer. Le hasard cosmétique (étincelles, clignements)
 * est tiré de la graine lui aussi : deux parties de même graine et de mêmes
 * entrées produisent exactement la même chose, jusqu'aux particules.
 */
export function creerPartie(reglages: Reglages = {}): Partie {
  const grain = reglages.grain ?? 'LUX-1042';
  const partie: Partie = {
    // `zone` est remplacée par `chargerZone` juste en dessous ; une zone vide
    // évite d'avoir à écrire « zone peut être nulle » dans tout le jeu.
    zone: zoneVide(),
    joueur: nouveauJoueur(),
    entrees: nouvellesEntrees(),
    hasard: reglages.hasard ?? mulberry32(grainDepuisTexte(grain) ^ 0x5eed),
    grain,
    numeroZone: 1,
    priseCount: 0,
    particules: [],
    ondes: [],
    pierres: [],
    traces: [],
    flottants: [],
    fil: [],
    filDernier: { x: 0, y: 0 },
    vidange: null,
    chute: null,
    envol: null,
    eclosion: 1,
    montee: [],
    menace: false,
    craque: 0,
    gele: false,
    puits: null,
    fin: null,
    finVue: false,
    bilan: null,
    morts: 0,
    prologueFait: false,
    pouvoirs: { souffle: false, fanal: false },
    recadrer: false,
    eclaires: new Set<Perso>(),
    bandeau: nouveauBandeau(),
    filVoix: [],
    voixT: 0,
    signaux: { pierre: 0, jauge: 0, forme: 0 },
    // À quoi servent les petites choses jaunes ? On ne l'avait jamais dit. La
    // première fois, une phrase le nomme ; ensuite, chaque ramassage fait
    // monter un « +4 » vers la barre du haut.
    premieres: { lueur: true, mort: true, seuil: false, main: false },
    // La règle attachée à une espèce ne se dit qu'une fois : répétée à chaque
    // âme, elle redevient la modale intrusive qu'on a retirée.
    regleDite: {},
    nudgePierre: 0,
    nudgeArme: false,
    numReplique: 0,
    numEteint: 0,
  };
  chargerZone(partie, reglages.etage ?? 1);
  return partie;
}

/** Une zone dégénérée, le temps que `chargerZone` en pose une vraie. */
function zoneVide(): Zone {
  return {
    mur: [[1]],
    cols: 1,
    lignes: 1,
    salles: [],
    numero: 0,
    grain: '',
    nom: '',
    traits: [],
    cendre: [[0]],
    cendres: [],
    vues: [[0]],
    lueurs: [],
    persos: [],
    torches: [],
    portes: [],
    porteDe: [[null]],
    fissures: [],
    dalles: [],
    fissureDe: [[null]],
    versionPortes: 0,
    braises: [],
    reprises: [],
    murmures: [],
    depart: { x: 0, y: 0 },
    sortie: { x: 0, y: 0, r: 1, vue: false, ames: 0 },
    requis: 1,
    largeur: 1,
    hauteur: 1,
    longueur: 0,
  };
}

/**
 * Un pas de simulation. L'ordre compte et il est le même que dans le POC :
 * les portes d'abord, parce que `solide` doit être stable pour tout le reste.
 */
export function avancer(partie: Partie, dt: number = PAS): void {
  majVoix(partie, dt);

  if (partie.envol) {
    // Sa lumière s'en va : le monde attend. C'est la seule chose à regarder.
    majEnvol(partie, dt);
    majParticules(partie, dt);
    majFlottants(partie, dt);
    partie.eclaires = propager(partie);
    return;
  }

  if (partie.bilan) {
    // L'étage est fini : on le regarde de haut. Rien ne tourne pendant ce
    // temps, il n'y a plus rien à jouer en bas.
    majBilan(partie, dt);
    majFlottants(partie, dt);
    partie.eclaires = new Set();
    return;
  }

  if (partie.fin) {
    // Le dernier Seuil. Rien d'autre ne tourne : c'est tout ce qu'il y a à voir.
    majFin(partie, dt);
    majParticules(partie, dt);
    partie.eclaires = new Set();
    return;
  }

  if (partie.puits) {
    // Il monte. Le monde d'en bas n'existe plus, celui d'en haut pas encore :
    // il n'y a que la cage, et lui dedans.
    majPuits(partie, dt);
    majParticules(partie, dt);
    majFlottants(partie, dt);
    partie.eclaires = new Set();
    return;
  }

  if (partie.chute) {
    majChute(partie, dt);
    majParticules(partie, dt);
    majFlottants(partie, dt);
    partie.eclaires = propager(partie);
    return;
  }

  if (partie.vidange) {
    // Le monde se tait : plus de sentinelles, plus de règles. Il ne reste que
    // la lumière qui s'en va.
    majVidange(partie, dt);
    majParticules(partie, dt);
    majFlottants(partie, dt);
    partie.eclaires = propager(partie);
    return;
  }

  if (partie.gele) {
    // Un écran plein arrête le monde. On ne propage même pas la lumière : le
    // POC dessinait cette image avec un ensemble vide, on garde ça.
    partie.eclaires = new Set();
    return;
  }

  majPortes(partie, dt);
  majJoueur(partie, dt);
  // ce qu'on éclaire reste éclairé : c'est la matière du bilan de fin d'étage
  marquerVues(partie);
  // qui éteint sa lumière, avant de savoir qui éclaire quoi
  souffler(partie);
  const eclaires = propager(partie);
  partie.eclaires = eclaires;
  majPersos(partie, dt, eclaires);
  majRegles(partie, dt);
  majPierres(partie, dt);
  majParticules(partie, dt);
  majFlottants(partie, dt);
}
