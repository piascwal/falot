/**
 * LE DECK DES ÉTAGES — un étage, une nouveauté.
 *
 * Les étages étaient infinis et rigoureusement identiques : c'est pour ça qu'on
 * s'ennuyait au quatrième. La campagne fait douze étages, chacun porte UNE
 * chose neuve, et la chose s'apprend par une situation, jamais par un panneau.
 * Le détail et la raison de chaque étage sont dans `docs/lux-campagne.md`.
 *
 * Deux natures de nouveauté, et elles ne se rangent pas au même endroit :
 *   — un TRAIT appartient à l'étage (la cendre, le voile, un traqueur). Il
 *     arrive, il repart, et il revient mêlé aux autres plus haut ;
 *   — un POUVOIR appartient à Falot (souffler sa lumière, porter une torche).
 *     Il ne se perd plus — c'est la seule chose que le Seuil ne lui reprend
 *     pas, parce qu'il ne s'agit pas de lumière mais d'un geste.
 *
 * Au-delà du douzième, c'est le Puits sans fin : les traits y sont rejoués en
 * désordre, deux ou trois à la fois, et tous les pouvoirs sont acquis.
 */

import { grainDepuisTexte, mulberry32 } from '../alea.js';

/** Ce qui appartient à un étage. */
export type Trait =
  | 'appel'
  | 'cendre'
  | 'traqueur'
  | 'farouches'
  | 'voile'
  | 'pesee'
  | 'oeil'
  | 'meute';

/** Ce qui appartient à Falot, une fois qu'il s'en est souvenu. */
export type Pouvoir = 'souffle' | 'fanal';

export const TRAITS: readonly Trait[] = [
  'appel',
  'cendre',
  'traqueur',
  'farouches',
  'voile',
  'pesee',
  'oeil',
  'meute',
];

export interface Palier {
  readonly numero: number;
  readonly nom: string;
  /** La nouveauté de cet étage : un trait, un pouvoir, ou l'un des deux bouts. */
  readonly neuf: Trait | Pouvoir | 'reveil' | 'fin';
  /** Ce que le décor dit, une fois, à l'entrée. Vide = l'étage se passe de mots. */
  readonly murmure: string;
}

/** Le dernier étage de la campagne. Au-dessus, le Puits sans fin. */
export const DERNIER_ETAGE = 12;

export const PALIERS: readonly Palier[] = [
  { numero: 1, nom: 'Le réveil', neuf: 'reveil', murmure: '' },
  {
    numero: 2,
    nom: 'L’appel',
    neuf: 'appel',
    murmure: 'Ils n’ont qu’un seul regard, et ils se le passent.',
  },
  {
    numero: 3,
    nom: 'Le souffle',
    neuf: 'souffle',
    murmure: 'Souffle ta lumière : tu ne verras plus rien, eux non plus.',
  },
  {
    numero: 4,
    nom: 'La cendre',
    neuf: 'cendre',
    murmure: 'Ce sol a brûlé. Il croque sous qui se presse.',
  },
  {
    numero: 5,
    nom: 'Le fanal',
    neuf: 'fanal',
    murmure: 'Une torche se décroche. Aucun d’eux n’approche d’une flamme plus grande.',
  },
  {
    numero: 6,
    nom: 'Le traqueur',
    neuf: 'traqueur',
    murmure: 'Celui-là ne cherche pas : il refait ton chemin.',
  },
  {
    numero: 7,
    nom: 'Les farouches',
    neuf: 'farouches',
    murmure: 'Elles ont trop vu de lumière. Approche éteint.',
  },
  {
    numero: 8,
    nom: 'Le voile',
    neuf: 'voile',
    murmure: 'L’air est épais. Ta lumière n’ira pas loin.',
  },
  {
    numero: 9,
    nom: 'La pesée',
    neuf: 'pesee',
    murmure: 'Cette porte tient tant qu’on pèse dessus.',
  },
  {
    numero: 10,
    nom: 'L’œil',
    neuf: 'oeil',
    murmure: 'Il ne balaye rien. Il voit ce qui est éclairé.',
  },
  {
    numero: 11,
    nom: 'La meute',
    neuf: 'meute',
    murmure: 'Ils ne se quittent plus.',
  },
  {
    numero: 12,
    nom: 'Le dernier Seuil',
    neuf: 'fin',
    murmure: 'Il demande plus que ce que tu as.',
  },
];

/** Le palier d'un étage de campagne, ou `null` dans le Puits sans fin. */
export function palier(numero: number): Palier | null {
  return PALIERS.find((p) => p.numero === numero) ?? null;
}

/**
 * Ce dont Falot se souvient à cet étage. Un pouvoir ne se reperd jamais : le
 * Seuil lui prend sa lumière, pas ses gestes.
 */
export function pouvoirs(numero: number): Record<Pouvoir, boolean> {
  const depuis = (p: Pouvoir) => {
    const q = PALIERS.find((x) => x.neuf === p);
    return q ? numero >= q.numero : false;
  };
  // Dans le Puits sans fin, on a déjà tout traversé une fois.
  if (numero > DERNIER_ETAGE) return { souffle: true, fanal: true };
  return { souffle: depuis('souffle'), fanal: depuis('fanal') };
}

/**
 * Les traits actifs à un étage donné.
 *
 * Un étage de campagne porte le sien, et rien d'autre tant qu'on apprend :
 * mêler deux nouveautés, c'est n'en enseigner aucune. À partir du neuvième, un
 * trait DÉJÀ VU revient s'ajouter — c'est là que le jeu commence à recombiner
 * au lieu d'enseigner. Le Puits sans fin, lui, en tire deux ou trois.
 *
 * Le tirage a sa propre graine : il ne doit pas décaler d'un cran les tirages
 * du générateur, qui sont un contrat (voir `generation.ts`).
 */
export function traitsEtage(numero: number, grainTexte: string): Trait[] {
  const rnd = mulberry32(grainDepuisTexte(grainTexte) + numero * 2654435761);
  const tire = (parmi: readonly Trait[], combien: number, deja: Trait[]): Trait[] => {
    const reste = parmi.filter((t) => !deja.includes(t));
    const pris: Trait[] = [];
    for (let i = 0; i < combien && reste.length; i++)
      pris.push(reste.splice(Math.floor(rnd() * reste.length), 1)[0]);
    return pris;
  };

  if (numero > DERNIER_ETAGE) return tire(TRAITS, 2 + (rnd() < 0.35 ? 1 : 0), []);

  const pal = palier(numero);
  const sien = pal && TRAITS.includes(pal.neuf as Trait) ? [pal.neuf as Trait] : [];
  if (numero < 9) return sien;
  // les traits déjà enseignés, c'est-à-dire ceux des étages d'en dessous
  const vus = PALIERS.filter(
    (p) => p.numero < numero && TRAITS.includes(p.neuf as Trait),
  ).map((p) => p.neuf as Trait);
  return [...sien, ...tire(vus, 1, sien)];
}
