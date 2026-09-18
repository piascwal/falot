/**
 * Les DONNÉES du jeu : les cinq formes de Falot, ce que le caillou sait faire à
 * chaque palier, les trois émotions, les six humeurs et les lueurs à ramasser.
 *
 * Rien ici ne calcule quoi que ce soit. C'est volontaire : ces nombres sont
 * l'équilibrage du jeu, et les commentaires disent d'où ils viennent. Les
 * déplacer sans lire ce qui est écrit à côté, c'est refaire une mesure déjà
 * faite.
 */

export interface Forme {
  readonly nom: string;
  readonly couleur: string;
  /** Éclat à atteindre pour passer à cette forme. */
  readonly seuil: number;
  /** Multiplicateur du rayon de halo. */
  readonly halo: number;
  /** Portée du faisceau, en cases. 0 = pas de faisceau. */
  readonly portee: number;
  /** Demi-angle du faisceau, en radians. */
  readonly cone: number;
  readonly verbe: string;
  readonly texte: string;
}

/** Ce que la poche de cailloux vaut, à chaque palier de forme. */
export interface RangCaillou {
  readonly reserve: number;
  readonly delai: number;
  readonly couve?: boolean;
  readonly frappe?: boolean;
  readonly eclate?: boolean;
}

// Une forme = une couleur, un halo, et EXACTEMENT UN verbe de plus. C'est la
// règle : on ne découvre jamais deux mécaniques à la fois, sinon on n'en
// comprend aucune.
// Les seuils tiennent dans UNE zone, puisqu'on repart peureux à chaque fois.
// Ils sont calés sur le PLAFOND réellement mesuré d'une zone — tout ramasser,
// tout calmer, tout livrer : 108 en zone 1, 122 en zone 3, 177 en zone 6.
// On montait quatre formes en une poignée de secondes ; chaque palier demande
// maintenant un vrai bout de zone (25 %, 50 %, 80 % du plafond de la zone 1).
// Solaire est au-delà du plafond des deux premières zones : c'est une
// récompense de fin d'aventure, pas un passage obligé. Premier calage tenté à
// 30/70/120/180 : Ardent passait au-dessus du plafond de la zone 1 et Solaire
// au-dessus de celui de la zone 6 — deux formes purement décoratives.
export const FORMES: readonly Forme[] = [
  {
    nom: 'Peureux',
    couleur: '#8fd0ff',
    seuil: 0,
    halo: 1.0,
    portee: 0,
    cone: 0,
    verbe: 'Le caillou',
    texte:
      "Tu n'as qu'un halo minuscule — mais tu peux lancer un caillou devant toi. La pierre ne brille pas ; ce que tu as laissé dessus, si. Là où elle tombe, une autre petite lumière apparaît, et les Guets vont la voir. C'est toute ton arme.",
  },
  {
    nom: 'Curieux',
    couleur: '#ffd479',
    seuil: 26,
    halo: 1.28,
    portee: 5.2,
    cone: 0.34,
    verbe: 'Le faisceau',
    texte:
      "Un faisceau s'ouvre devant toi. Il porte loin, et il réveille les autres : un bonhomme éclairé relaie ta lumière avec son regard.",
  },
  {
    nom: 'Veilleur',
    couleur: '#a8f0c8',
    seuil: 55,
    halo: 1.45,
    portee: 6.0,
    cone: 0.32,
    verbe: 'Le caillou couve',
    texte:
      "Ton caillou ne retombe plus éteint : là où il tombe, il se met à brûler pour toujours. Dans cette lumière-là tu n'as plus la forme qu'un regard cherche — tu poses tes abris à distance.",
  },
  {
    nom: 'Ardent',
    couleur: '#ff9a6b',
    seuil: 88,
    halo: 1.62,
    portee: 7.0,
    cone: 0.3,
    verbe: 'Le caillou frappe',
    texte:
      "Vise un rouge, touche-le : il est étourdi et perd ta trace. Ce n'est plus seulement un leurre, c'est de quoi ouvrir un passage à ton convoi.",
  },
  {
    nom: 'Solaire',
    couleur: '#fff2c4',
    seuil: 128,
    halo: 1.9,
    portee: 8.2,
    cone: 0.3,
    verbe: 'Le caillou éclate',
    texte:
      "À l'impact, le caillou se brise en un éclat qui aveugle tous les Guets autour du point de chute : plus rien à distinguer, ni lumière ni noir. Un seul lancer, et toute une salle cesse de te chercher.",
  },
];

// Tout le jeu tient sur UN bouton. Chaque forme ne donne pas un nouveau verbe
// à apprendre : elle enrichit le seul geste qu'on connaît déjà. La réserve
// grossit et le délai fond à chaque palier — c'est la progression qu'on sent
// en jouant, avant même de lire ce que le caillou fait de plus.
export const CAILLOU: readonly RangCaillou[] = [
  { reserve: 1, delai: 2.6 },
  { reserve: 2, delai: 1.9 },
  { reserve: 2, delai: 1.5, couve: true },
  { reserve: 3, delai: 1.2, couve: true, frappe: true },
  { reserve: 3, delai: 0.9, couve: true, frappe: true, eclate: true },
];

export const EMOTIONS = { PEUR: 'peur', COLERE: 'colere', CURIEUX: 'curieux' } as const;
export type Emotion = (typeof EMOTIONS)[keyof typeof EMOTIONS];

// Un visage ne dit pas QUI on est, il dit CE QUI SE PASSE. Trois humeurs, la
// même règle pour le joueur et pour les âmes qu'il escorte : on court, on
// marche, ou quelque chose nous a repérés. Avant, le peureux portait des
// sourcils d'intrigué en permanence et on ne lisait plus rien sur lui.
// INQUIET est la peur au repos : mêmes sourcils relevés, mêmes grands yeux,
// mais la bouche reste sage. La bouche ouverte qui tremble est réservée au
// vrai danger — sans cette nuance, un peureux tranquille hurlait en
// permanence et on ne voyait plus arriver le moment qui compte.
export const HUMEURS = {
  PEUR: 'peur',
  INQUIET: 'inquiet',
  INTRIGUE: 'intrigue',
  ACHARNE: 'acharne',
  VISEE: 'visee',
  APAISE: 'apaise',
} as const;
export type Humeur = (typeof HUMEURS)[keyof typeof HUMEURS];

// Le vert d'une âme rallumée. Nommé une fois : il sert au corps qui se
// remplit, au personnage une fois calmé, et à ses particules.
export const RALLUME = '#a8f0c8';

// Le temps qu'il faut pour rallumer une âme. C'est aussi la durée pendant
// laquelle on VOIT son corps se remplir : la barre de chargement, c'est elle.
export const DUREE_CALME = 1.1;

// moitié de la vitesse de pointe du joueur : au-delà, on court vraiment
const SEUIL_COURSE = 150;

// `calme` distingue le repos serein du repos inquiet : une âme qu'on n'a pas
// encore apprivoisée reste sur ses gardes.
export const humeurSelon = (
  p: { vx: number; vy: number },
  menace: boolean,
  calme: boolean,
): Humeur =>
  menace
    ? HUMEURS.PEUR
    : Math.hypot(p.vx, p.vy) > SEUIL_COURSE
      ? HUMEURS.ACHARNE
      : calme
        ? HUMEURS.INTRIGUE
        : HUMEURS.INQUIET;

export const COULEURS: Record<Emotion, string> = {
  [EMOTIONS.PEUR]: '#8fd0ff',
  [EMOTIONS.COLERE]: '#ff7a6b',
  [EMOTIONS.CURIEUX]: '#ffd479',
};

export interface Bonus {
  readonly couleur: string;
  /** Palier de forme à partir duquel cette lueur peut apparaître. */
  readonly forme: number;
  readonly duree: number;
  readonly nom: string;
  readonly phrase: string;
}

// Les lueurs à effet. Chacune n'apparaît qu'à partir d'une forme donnée :
// on n'introduit jamais un bonus avant que le joueur ait digéré le précédent.
// Chaque bonus porte sa propre phrase : un nom seul ne dit rien. Et chacun se
// VOIT sur le personnage — couleur du corps, du halo, particules — parce que
// le mot dans la barre du haut n'est pas là où le joueur regarde.
export const BONUS = {
  eclat: { couleur: '#ffe9a8', forme: 0, duree: 0, nom: 'Lueur', phrase: '' },
  // Les trois bonus parlent tous d'ESCORTE, sinon on les ramasse sans rien
  // sentir. Voilé cache le convoi entier, Hâte presse le convoi entier, et
  // Galet rend la poche intarissable le temps de dégager une route.
  galet: {
    couleur: '#b2bacc',
    forme: 0,
    duree: 6,
    nom: 'Poche',
    phrase: 'Poche intarissable — lance sans compter',
  },
  souffle: {
    couleur: '#8fd0ff',
    forme: 1,
    duree: 7,
    nom: 'Voilé',
    phrase: 'Voilé — ton convoi entier devient invisible',
  },
  hate: {
    couleur: '#a8f0c8',
    forme: 2,
    duree: 8,
    nom: 'Hâte',
    phrase: 'Hâte — tout le convoi file plus vite',
  },
} as const satisfies Record<string, Bonus>;

/** Les types de lueur qui existent : `eclat` et les trois bonus d'escorte. */
export type TypeLueur = keyof typeof BONUS;
