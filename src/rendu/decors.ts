/**
 * LES LAMPES MORTES — le décor dessiné des Dessous.
 *
 * Le tileset fait pousser du lierre, de la mousse et des racines : il dit que
 * le lieu est vieux. Il ne dit pas que quelqu'un y est venu. Ces objets-là s'en
 * chargent — une lampe à huile ébréchée au pied d'un mur, un chandelier
 * renversé, une ampoule brisée : les Dessous sont l'endroit où tombe ce qui
 * s'est éteint, et maintenant ça se voit.
 *
 * ELLES SONT TOUTES ÉTEINTES, et ce n'est pas un détail d'habillage. Ce jeu est
 * un moteur de lumière : une lampe qui brillerait d'elle-même mentirait au
 * moteur, qui seul décide de ce qui éclaire, et donnerait de la lumière
 * gratuite à un jeu dont le sujet est qu'elle manque.
 *
 * DESSINÉES, PAS CALCULÉES. Le lierre et la mousse sont tracés par formules
 * dans `tuiles.ts`, et c'est très bien : personne ne reconnaît une mousse de
 * travers. Un objet identifiable, non — une lampe à huile tracée par formules
 * donne une forme moyenne, et une forme moyenne n'est aucune lampe. C'est la
 * même leçon que le jeu s'était déjà écrite à propos des visages. Elles
 * viennent donc d'une planche dessinée, découpée par `outils/decors.mjs`.
 *
 * La feuille a la MÊME FORME que les garnitures procédurales — quatre variantes
 * côte à côte, dans la case du jeu — pour que `sol.ts` les pose exactement
 * comme il pose déjà la mousse, sans un cas particulier de plus.
 */

/** La case du jeu, à deux fois sa taille d'écran : la même que le tileset. */
const T = 124;

/** Où est la feuille. Relative, comme l'atlas : ça marche à la racine d'un
 *  domaine comme dans le sous-dossier de GitHub Pages. */
const FEUILLE = 'decors.png';

/** Les familles, dans l'ordre des rangées de la feuille. `outils/decors.mjs`
 *  écrit exactement cet ordre — si l'un bouge, l'autre suit. */
const FAMILLES = ['lampeHuile', 'chandelier', 'lanterne', 'bougeoir', 'applique'] as const;

export type Famille = (typeof FAMILLES)[number];

/** Combien de variantes par famille : `sol.ts` en tire une par position, pour
 *  qu'on ne voie pas la même lampe brisée deux fois dans la même salle. */
export const VARIANTES_DECOR = 4;

export type Decors = Record<Famille, HTMLCanvasElement>;

let cache: Decors | null = null;
let encours: Promise<Decors | null> | null = null;

function decouper(img: HTMLImageElement): Decors {
  const rangee = (r: number): HTMLCanvasElement => {
    const t = document.createElement('canvas');
    t.width = T * VARIANTES_DECOR;
    t.height = T;
    const c = t.getContext('2d');
    if (!c) throw new Error('Pas de contexte 2D pour les décors.');
    c.drawImage(img, 0, r * T, t.width, T, 0, 0, t.width, T);
    return t;
  };
  const d = {} as Decors;
  FAMILLES.forEach((nom, r) => {
    d[nom] = rangee(r);
  });
  return d;
}

/**
 * Charge la feuille. On l'appelle au démarrage : elle sert dès la première
 * salle, et une case qui se peuplerait de lampes trois secondes après qu'on y
 * soit entré se verrait.
 */
export async function chargerDecors(url = FEUILLE): Promise<Decors | null> {
  if (cache) return cache;
  if (encours) return encours;
  encours = new Promise<Decors | null>((ok) => {
    const img = new Image();
    img.onload = () => {
      cache = decouper(img);
      ok(cache);
    };
    img.onerror = () => ok(null);
    img.src = url;
  });
  return encours;
}

/**
 * Les décors, s'ils sont arrivés. `null` tant qu'ils ne le sont pas — la
 * pierre, son lierre et sa mousse se dessinent alors comme avant, et personne
 * ne s'en aperçoit. C'est la même discipline que pour l'atlas et la
 * sauvegarde : un luxe, jamais une dépendance.
 */
export function decors(): Decors | null {
  if (!cache && !encours) void chargerDecors();
  return cache;
}
