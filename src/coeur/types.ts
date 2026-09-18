/**
 * Les formes de données du jeu. Un seul endroit pour savoir ce qu'est une zone,
 * un personnage, une porte — et donc un seul endroit à lire avant de toucher à
 * quoi que ce soit.
 *
 * Convention : le vocabulaire du jeu reste en français, comme la bible
 * narrative (`docs/lux-falot.md`). Un `Guet` dans le texte doit se retrouver
 * sous le même nom dans le code.
 */

import type { Emotion, Humeur, RangPierre, TypeLueur } from './formes.js';
import type { Pouvoir, Trait } from './monde/paliers.js';
import type { Bandeau, Voix } from './voix.js';

export interface Point {
  x: number;
  y: number;
}

/** Une case de la grille. */
export interface Case {
  cx: number;
  cy: number;
}

/** Ce qu'il faut pour dessiner un corps : le joueur et les âmes le partagent. */
export interface Corps extends Point {
  /** Échelle de la gelée, et sa vitesse : le corps s'écrase sur les chocs. */
  sx: number;
  sy: number;
  vsx: number;
  vsy: number;
  vx: number;
  vy: number;
  regard: number;
  /** Déphasage propre, pour que deux corps ne tremblent pas à l'unisson. */
  tremble: number;
  /** > 0 : les yeux sont fermés (étourdie, ou en train de cligner). */
  aveugle: number;
  cligne: number;
}

/** Un point de ronde d'un Guet : la case et son centre en pixels monde. */
export interface PointRonde extends Case, Point {}

export interface Perso extends Corps {
  /** Son poste : là où elle revient, et là où elle réapparaît après une mort. */
  baseX: number;
  baseY: number;
  regardRepos: number;
  balayage: number;
  amplitude: number;
  phase: number;
  emotion: Emotion;
  humeur: Humeur;

  /** Éclairé par le joueur ou par un relais, cette image-ci. */
  eclaire: boolean;
  /** Rallumé pour de bon : il brille tout seul et il suit. */
  calme: boolean;
  suit: boolean;
  /** Absorbé par le Seuil : il ne joue plus. */
  livre: boolean;
  /** Sa place dans la file du convoi. */
  rang: number;
  /** A-t-il déjà dit qu'il était vide ? */
  aDit: boolean;
  /** A-t-il déjà payé son calmage ? Une âme ne rapporte qu'une fois. */
  prime: boolean;
  compteCalme: number;
  fuit: number;
  abri: boolean;
  /**
   * Une âme rallumée qui SE CACHE : dès qu'un Guet se doute de quelque chose,
   * le convoi souffle sa lumière. Il cesse d'éclairer, et cesse d'être vu —
   * seule la lumière que Falot porte le désigne encore. C'est ce qui rend
   * l'escorte lisible : on se fait prendre pour ce qu'on porte, pas pour ceux
   * qu'on emmène.
   */
  eteint: boolean;

  // --- propre aux Guets ---
  /** Elle se doute de quelque chose (posé par les règles, pas par elle). */
  alerte: number;
  /** Jauge de verrouillage, de 0 à 1 : c'est elle qui dessine le front rouge. */
  charge: number;
  /** Gênée : aveuglée, occupée par un bruit, ou dans une braise. */
  gene: boolean;
  enAlerte: boolean;
  capAlerte: number;
  /** Direction de marche, si elle en a une. */
  cap: number | undefined;
  etape: number;
  route: Point[] | null;
  immobile: number;
  dernierX: number;
  dernierY: number;
  /** Là où une pierre est tombée, et le temps qu'il va y consacrer. */
  curiosite: Point | null;
  curieuxT: number;
  /** Le dernier endroit où il a vu de la lumière. Il y va : c'est ce qui fait
   *  d'une détection une poursuite, et non un simple balayage inquiet. */
  derniereVue: Point | null;
  /** Depuis combien de temps la lumière du joueur le baigne. Un faisceau qui
   *  balaye ne suffit pas : il faut s'attarder. */
  bain: number;
  prochainCligne: number;
  ronde: PointRonde[];
  /** Combien de corps elle voit à cet instant. Exposé pour les mesures. */
  corpsVus: number;

  // --- caches de rendu, remplis une fois par image ---
  rayonsRelais: number[] | null;
  rayonsVue: number[] | null;
}

export interface Joueur extends Corps {
  /** L'éclat courant, et le sommet atteint : la forme suit le sommet. */
  eclat: number;
  sommet: number;
  niveau: number;
  /** 1 = halo entier, 0 = une sentinelle l'a vidé. */
  souffle: number;
  /** Invulnérabilité courte après une mort. */
  repit: number;
  /**
   * IL A SOUFFLÉ SA PROPRE LUMIÈRE (pouvoir acquis à l'étage 3). Il garde sa
   * couleur — il ne s'éteint pas, il se couvre — mais il n'éclaire plus, il
   * ne rallume plus personne, et un Guet n'a plus rien à voir de lui. Le prix
   * est immédiat : on n'y voit soi-même presque plus rien.
   */
  eteint: boolean;
  /** Lissage de « on me regarde », pour le rougissement des bords. */
  vu: number;
  /** Pierres en poche, et la fraction de recharge du prochain. */
  pierres: number;
  pierreDispo: number;
  bonus: TypeLueur | null;
  bonusT: number;
  abri: boolean;
  rayons: number[] | null;
  rayonsHalo: number[] | null;
}

export interface Salle {
  x: number;
  y: number;
  w: number;
  h: number;
  cx: number;
  cy: number;
}

export interface Lueur extends Point {
  type: TypeLueur;
  prise: boolean;
  /** Déjà aperçue : elle reste marquée d'un point même dans le noir. */
  vue: boolean;
  phase: number;
}

/** Une source de lumière fixe : son polygone de visibilité se met en cache. */
export interface Source extends Point {
  r: number;
  phase: number;
  rayons?: number[];
  rayonsVersion?: number;
}

export interface Torche extends Source {
  duree: number;
  reste: number;
  /** Direction du mur auquel elle est accrochée (−1, 0 ou 1 sur chaque axe).
   *  C'est ce qui permet de la dessiner tournée vers la salle. */
  ox: number;
  oy: number;
  /** Déjà croisée : on se souvient d'où aller rallumer. */
  vue?: boolean;
}

export interface Braise extends Source {}

export interface Porte extends Case, Point {
  /** Le battant barre verticalement (donc le couloir est horizontal). */
  verticale: boolean;
  /**
   * De quel bout le battant est scellé : +1 côté haut (ou gauche), −1 côté bas
   * (ou droite). Le gond doit tenir à de la PIERRE — un battant accroché au
   * vide ne veut rien dire — et c'est ce qui fait que les deux battants d'un
   * même passage s'ouvrent en sens inverse, comme des portes battantes.
   */
  gond: 1 | -1;
  /** 0 fermée, 1 grande ouverte. Sous 0,5 elle est solide. */
  ouverte: number;
  sens: number;
  phase: number;
}

export interface Fissure extends Case, Point {
  /** 0 intacte, 1 éboulée. Entre les deux : elle s'efface. */
  casse: number;
  phase: number;
  /** Le raccourci qu'elle ouvre, en cases. Seul le générateur le mesure. */
  gain?: number;
}

export interface Reprise extends Point {
  pris: boolean;
}

export interface MurmurePose extends Point {
  texte: string;
  dit: boolean;
}

export interface Seuil extends Point {
  r: number;
  vue: boolean;
  ames: number;
}

export interface Zone {
  mur: number[][];
  cols: number;
  lignes: number;
  salles: Salle[];
  numero: number;
  grain: string;
  lueurs: Lueur[];
  persos: Perso[];
  torches: Torche[];
  portes: Porte[];
  /** Table de consultation : `solide` est appelé des milliers de fois par
   *  image, il ne peut pas parcourir la liste des portes à chaque fois. */
  porteDe: (Porte | null)[][];
  fissures: Fissure[];
  fissureDe: (Fissure | null)[][];
  /** Incrémenté dès que `solide` change : les ombres portées se recalculent. */
  versionPortes: number;
  braises: Braise[];
  reprises: Reprise[];
  murmures: MurmurePose[];
  /** Le nom de l'étage — « La cendre », « Le voile ». Dit par la cage. */
  nom: string;
  /** Ce que cet étage porte de neuf, ou de recombiné (voir `paliers.ts`). */
  traits: Trait[];
  depart: Point;
  sortie: Seuil;
  /** Âmes à livrer pour que le Seuil cède. */
  requis: number;
  largeur: number;
  hauteur: number;
  /** Longueur du chemin départ → sortie, en cases. */
  longueur: number;
}

export interface PierreEnVol {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  x: number;
  y: number;
  t: number;
  duree: number;
  /** L'arc de cercle : sa hauteur au-dessus du sol. */
  hauteur: number;
  rang: RangPierre;
}

/** Ce que Falot a laissé là où la pierre est tombée. */
export interface Trace extends Point {
  t: number;
  duree: number;
}

export interface Onde extends Point {
  r: number;
  max: number;
  couleur: string;
}

export interface Particule extends Point {
  vx: number;
  vy: number;
  vie: number;
  max: number;
  couleur: string;
  forme: 'point' | 'trait';
}

export interface Flottant extends Point {
  texte: string;
  couleur: string;
  vie: number;
  max: number;
  /** Une phrase du décor, pas un gain : elle monte lentement et se coupe. */
  murmure?: boolean;
  /** Qui parle. La phrase le suit, sinon on ne sait plus qui a parlé. */
  sujet?: Perso;
}

export interface Mote {
  a: number;
  r: number;
  h: number;
  vh: number;
  va: number;
  vie: number;
  max: number;
  taille: number;
}

/** La vidange au Seuil : Falot rend au portail tout ce qu'il avait retrouvé. */
export interface Vidange {
  t: number;
  duree: number;
  eclat0: number;
  suivante: number;
  motes: Mote[];
  reste: number;
}

/**
 * Une ARRIVÉE : une lumière parcourt la distance, touche le sol, et Falot est
 * là. Elle tombe du plafond au tout premier étage — « une lumière qui s'éteint
 * ne disparaît pas, elle tombe » — et elle MONTE partout ailleurs, puisqu'on
 * sort des Dessous en montant. C'est la même scène, prise dans l'autre sens.
 */
export interface Chute extends Point {
  t: number;
  y0: number;
  pose: boolean;
  /** D'où vient la lumière. `bas` = il monte d'un étage. */
  sens: 'haut' | 'bas';
  /** Le prologue s'offre le regard à gauche, à droite, puis devant. Les étages
   *  suivants non : on a déjà vu la scène, elle doit être brève. */
  ceremonie: boolean;
}

/**
 * Un DÉPART : le corps se vide de sa couleur et sa lumière s'en va vers le
 * haut. C'est la même image pour les deux fins possibles d'un étage — s'éteindre,
 * ou franchir le Seuil — parce que c'est la même chose qui se passe.
 */
export interface Envol {
  t: number;
  duree: number;
  /** `mort` : il renaît au point de reprise. `seuil` : l'étage suivant. */
  raison: 'mort' | 'seuil';
  /** L'étage à charger, pour un envol de Seuil. */
  suivante: number;
  motes: Mote[];
  reste: number;
}

/** Un étage vidé, et combien d'âmes y sont remontées. */
export interface Etage {
  etage: number;
  ames: number;
}

/** Le joystick flottant : il naît sous le doigt, où qu'on le pose. */
export interface Manche {
  actif: boolean;
  ox: number;
  oy: number;
  dx: number;
  dy: number;
  force: number;
  id: number | null;
}

export interface Touches {
  gauche: boolean;
  droite: boolean;
  haut: boolean;
  bas: boolean;
}

/** La visée de la pierre : on appuie, on glisse, on relâche pour lancer. */
export interface Visee extends Manche {}

/**
 * Tout ce que le joueur demande. Les règles ne lisent QUE ça : ni clavier, ni
 * pointeur, ni DOM. C'est ce qui rend une partie rejouable à l'identique.
 */
export interface Entrees {
  manche: Manche;
  touches: Touches;
  visee: Visee;
  /** Maintenu : Falot souffle sa lumière (voir `Joueur.eteint`). */
  souffle: boolean;
}

/**
 * TOUT l'état du jeu, en un objet.
 *
 * Le POC gardait ça dans la portée d'une fonction : c'était très agréable à
 * écrire et impossible à tester. Ici, une partie est une valeur — on peut en
 * créer deux, en avancer une de mille pas, et regarder ce qu'elle est devenue.
 *
 * Règle du découpage : `coeur/` écrit dans cet objet et ne lit RIEN d'autre.
 * Le rendu le lit et n'y écrit que ses propres caches de rayons. L'interface le
 * lit et n'y touche qu'au travers des entrées.
 */
export interface Partie {
  zone: Zone;
  joueur: Joueur;
  entrees: Entrees;
  /** Le hasard cosmétique. Tiré de la graine, donc rejouable. */
  hasard: () => number;
  /** Le nom du plan des étages procéduraux. */
  grain: string;
  numeroZone: number;
  /** Lueurs ramassées dans cette zone. Exposé pour les mesures. */
  priseCount: number;

  particules: Particule[];
  ondes: Onde[];
  pierres: PierreEnVol[];
  traces: Trace[];
  flottants: Flottant[];
  /** La trace du joueur : sa seule mémoire du terrain. `null` = une coupure. */
  fil: (Point | null)[];
  filDernier: Point;

  vidange: Vidange | null;
  chute: Chute | null;
  envol: Envol | null;
  /** 0 = Falot n'est pas encore là, 1 = il y est. */
  eclosion: number;
  /** Les étages déjà vidés. La seule chose qu'il garde d'une zone à l'autre. */
  montee: Etage[];
  /** Un rouge cherche, ou un faisceau nous tient. Ce que TOUT LE MONDE sent. */
  menace: boolean;

  /** Un écran plein arrête le monde. */
  gele: boolean;
  /** L'étage dont la cage d'escalier est à montrer, ou `null`. */
  cage: number | null;
  /** Le prologue a été franchi au moins une fois (l'interface le persiste). */
  prologueFait: boolean;
  /**
   * Ce dont Falot se souvient. Un pouvoir n'est pas de la lumière, c'est un
   * geste : le Seuil ne le reprend pas. Posé au chargement de l'étage.
   */
  pouvoirs: Record<Pouvoir, boolean>;
  /** La caméra doit se recaler d'un coup, sans glisser. */
  recadrer: boolean;
  /** Qui éclaire, à ce pas-ci. Calculé une fois, lu par le rendu. */
  eclaires: Set<Perso>;

  bandeau: Bandeau;
  filVoix: Voix[];
  voixT: number;

  /**
   * Les animations de l'interface, en compteurs. Le cœur incrémente, l'interface
   * observe : c'est ce qui garde le DOM hors des règles du jeu.
   */
  signaux: { pierre: number; jauge: number; forme: number };

  /** Ce qui ne se dit qu'une fois. */
  premieres: { lueur: boolean; mort: boolean; seuil: boolean };
  regleDite: Partial<Record<Emotion, boolean>>;
  /** Le bouton pierre ne se signale que trois fois par partie. */
  nudgePierre: number;
  nudgeArme: boolean;
  /** Où l'on en est dans les répliques : elles tournent sans se répéter. */
  numReplique: number;
  numEteint: number;
}
