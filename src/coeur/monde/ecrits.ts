/**
 * Les étages écrits à la main.
 *
 * L'étage 1 n'est pas un tutoriel : c'est le premier étage du vrai jeu, écrit à
 * la main pour que sa GÉOGRAPHIE enseigne. Le détail de son intention est dans
 * `docs/lux-niveau-1.md`.
 *
 * `zoneEcrite` rend exactement la même structure que le générateur : lumière,
 * portes, détection et convoi ne savent pas — et n'ont pas à savoir — si le
 * plan a été tiré ou dessiné.
 */

import { mulberry32 } from '../alea.js';
import { CASE } from '../dimensions.js';
import { EMOTIONS } from '../formes.js';
import { TAU } from '../geometrie.js';
import type {
  Case,
  Fissure,
  Lueur,
  MurmurePose,
  Perso,
  Porte,
  Reprise,
  Salle,
  Zone,
} from '../types.js';
import { distances } from './grille.js';
import { nouveauPerso } from './perso.js';

interface EtageEcrit {
  readonly carte: readonly string[];
  /** Une ronde par « r », dans l'ordre de lecture de la carte. */
  readonly rondes: readonly (readonly [number, number][])[];
  readonly murmures: Readonly<Record<string, string>>;
  readonly requis: number;
}

// L'étage 1 n'est pas un tutoriel : c'est le premier étage du vrai jeu, écrit
// à la main pour que sa GÉOGRAPHIE enseigne. Aucun panneau, aucune question
// posée au joueur — une salle, un problème, une seule issue.
//
//   #  mur         .  sol          @  départ       S  Seuil
//   o  lueur       g  poche de pierres           T  torche
//   b  Frileux     r  Guet         %  mur fêlé (à ouvrir à la pierre)
//   |  porte (battant vertical)    =  porte (battant horizontal)
//   *  point de reprise            1-9  murmure
//
// Déplacer une lettre suffit à retoucher le niveau : rien ici n'est du code.
export const ETAGES_ECRITS: Readonly<Record<number, EtageEcrit>> = {
  1: {
    carte: [
      '#########################', //  0
      '##############.......T.##', //  1   la salle des torches : une au nord…
      '##...#########.........##', //  2
      '##.@.%o.o.o.o.*8.......##', //  3   le réveil : ses DEUX issues sont fêlées
      '##.6.#########.........##', //  4
      '###%##########.........##', //  5   la pierre fendue, sous la salle du réveil
      '##...#########..T.2....##', //  6   … et l'autre au sud ; à gauche, la niche vide
      '##################*######', //  7
      '##################=######', //  8
      '############......1....##', //  9   ce que fait la pierre, dit une fois
      '############.....r.....##', // 10   la SALLE des deux Guets : de la place pour lancer
      '############...........##', // 11
      '############...r.......##', // 12   le second garde la sortie, en bas à gauche
      '##############=##########', // 13   la sortie, décalée de quatre cases
      '##############*........##', // 14   la salle du Frileux qu'on ne peut pas aider
      '##############.......b.##', // 15
      '##############.........##', // 16
      '######.......|.*.......##', // 17   le couloir calme, et sa porte
      '######=##################', // 18
      '##....*.########......###', // 19
      '##......##5T####......###', // 20   l'alcôve de la torche, sur le trajet de l'escorte
      // Les deux battants du couloir sont hauts de DEUX cases : sans ça on ne
      // peut entrer que par la ligne du haut, c'est-à-dire pile sur le poste du
      // Guet. Doublés, ils scellent toujours son quartier — une case de porte
      // est un mur pour lui, battant ouvert ou non.
      '##..S...|o.o..r|o*....###', // 21   le Seuil, les fragments, le Guet de l'escorte
      '##....4.|......|.b....###', // 22   le couloir sur deux cases, et la 2e âme à sa bouche
      '##......####.b##......###', // 23
      '#########################', // 24
    ],
    // Une ronde par « r », dans l'ordre de lecture de la carte. Écrites et non
    // tirées : un premier étage doit se relire à l'identique d'une partie sur
    // l'autre, sinon on ne peut ni l'équilibrer ni le déboguer.
    rondes: [
      // Les deux Guets de la galerie se partagent la salle en bandes : celui du
      // haut barre l'entrée, celui du bas passe devant la sortie. Traverser
      // demande donc d'ouvrir un trou dans l'une des deux — c'est le travail de
      // la pierre.
      // Mesuré : six configurations essayées, celle-ci est la seule qui rende
      // « foncer » perdant sans rendre la salle injuste — 4 essais sur 20
      // passent tout droit, 20 sur 20 en lançant d'abord une pierre.
      [
        [14, 10],
        [20, 10],
      ], // il barre la moitié haute, juste sous l'entrée
      [
        [13, 12],
        [18, 12],
      ], // il barre la moitié basse, devant la sortie
      [
        [9, 21],
        [13, 21],
      ], // celui de l'escorte fait l'aller-retour du couloir
    ],
    murmures: {
      '1': "En bas, un Guet. Ta pierre garde un peu de ta lumière : là où elle tombe, une lueur s'allume — et il ira l'éteindre, elle, pas toi.",
      '2': "Un Guet veut éteindre le monde, et vider ta lumière. Mais il n'approche jamais d'une flamme plus grande que lui.",
      '4': "Sortir, c'est monter. Mais un Seuil ne s'ouvre pas avec une clé : il cède quand assez d'âmes se tiennent dedans.",
      '5': "Tant que la flamme tient, aucun Guet n'approche. Ni de toi, ni de ceux qui se serrent contre toi.",
      '6': 'Le mur, juste en dessous, est fendu. Une pierre suffirait.',
      '8': "Une torche éteinte au mur, laissée par qui passait avant toi. Ce qu'il te reste de lumière suffit à la rallumer.",
    },
    // Deux âmes, et les deux sont dans la même salle, au bout du couloir des
    // fragments. Elles ont d'abord été posées aux deux bouts du niveau : il
    // fallait alors retraverser la moitié de l'étage pour la seconde, et ce
    // demi-tour ne se devinait pas — rien sur le chemin ne le demandait.
    // Le Frileux de la salle 5 reste donc ce qu'il est : la démonstration
    // qu'il manque quelque chose. On peut revenir le chercher une fois le
    // faisceau ouvert, personne n'y oblige.
    requis: 2,
  },
};

// Lit une carte écrite et rend exactement la même structure de zone que le
// générateur : lumière, portes, détection et convoi ne savent pas — et n'ont
// pas à savoir — si le plan a été tiré ou dessiné.
export function zoneEcrite(numero: number): Zone | null {
  const modele = ETAGES_ECRITS[numero];
  if (!modele) return null;
  const src = modele.carte;
  const lignes = src.length,
    cols = src[0].length;
  // Une graine fixe : elle ne décide d'aucun plan, seulement des déphasages
  // d'animation. Écrite en dur pour que l'étage soit identique à chaque essai.
  const rnd = mulberry32(0x1ec7);

  const mur: number[][] = [];
  const lueurs: Lueur[] = [];
  const torches: Case[] = [];
  const portes: Porte[] = [];
  const reprises: Reprise[] = [];
  const murmures: MurmurePose[] = [];
  const bleus: Case[] = [];
  const rouges: Case[] = [];
  const fissures: Case[] = [];
  let depart: Case | null = null;
  let sortie: Case | null = null;
  for (let cy = 0; cy < lignes; cy++) {
    const rang = new Array<number>(cols).fill(1);
    for (let cx = 0; cx < cols; cx++) {
      const c = src[cy][cx];
      if (c === '#') continue;
      // Un mur fêlé RESTE de la pierre : il barre le passage, il arrête la
      // lumière et le parcours en largeur ne le traverse pas. Il ne devient un
      // couloir qu'une fois cassé.
      if (c === '%') {
        fissures.push({ cx, cy });
        continue;
      }
      rang[cx] = 0; // tout ce qui n'est pas mur est sol
      const x = (cx + 0.5) * CASE,
        y = (cy + 0.5) * CASE;
      if (c === '@') depart = { cx, cy };
      else if (c === 'S') sortie = { cx, cy };
      else if (c === 'o')
        lueurs.push({ x, y, type: 'eclat', prise: false, vue: false, phase: rnd() * TAU });
      else if (c === 'g')
        lueurs.push({ x, y, type: 'poche', prise: false, vue: false, phase: rnd() * TAU });
      else if (c === 'T') torches.push({ cx, cy });
      else if (c === 'b') bleus.push({ cx, cy });
      else if (c === 'r') rouges.push({ cx, cy });
      else if (c === '*') reprises.push({ x, y, pris: false });
      else if (c === '|' || c === '=')
        portes.push({
          cx,
          cy,
          x,
          y,
          verticale: c === '|',
          ouverte: 0,
          sens: 1,
          phase: rnd() * TAU,
        });
      else if (c >= '1' && c <= '9')
        murmures.push({ x, y, texte: modele.murmures[c], dit: false });
    }
    mur.push(rang);
  }
  if (!depart || !sortie) return null;
  // Nommés une fois, non nuls : tout ce qui suit lit ces deux noms-là.
  const leDepart: Case = depart;
  const leSeuil: Case = sortie;

  const z = {
    mur,
    cols,
    lignes,
    salles: [] as Salle[],
    porteDe: [] as (Porte | null)[][],
  };
  const fissuresPosees = fissures.map(({ cx, cy }) => ({
    cx,
    cy,
    x: (cx + 0.5) * CASE,
    y: (cy + 0.5) * CASE,
    casse: 0,
    phase: rnd() * TAU,
  }));
  // table de consultation : `distanceMur` est appelée des milliers de fois par
  // image, elle ne peut pas parcourir une liste à chaque rayon
  const fissureDe: (Fissure | null)[][] = [];
  for (let cy = 0; cy < lignes; cy++)
    fissureDe.push(new Array<Fissure | null>(cols).fill(null));
  for (const f of fissuresPosees) fissureDe[f.cy][f.cx] = f;
  const porteDe: (Porte | null)[][] = [];
  for (let cy = 0; cy < lignes; cy++)
    porteDe.push(new Array<Porte | null>(cols).fill(null));
  for (const pt of portes) porteDe[pt.cy][pt.cx] = pt;
  z.porteDe = porteDe;

  // Une torche se fixe à une paroi : on cherche le mur voisin et on décale le
  // torche vers lui, exactement comme le fait le générateur.
  const torchesPosees = torches.map(({ cx, cy }) => {
    const cotes = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ].filter(([ox, oy]) => {
      const nx = cx + ox,
        ny = cy + oy;
      return nx < 0 || ny < 0 || nx >= cols || ny >= lignes || mur[ny][nx];
    });
    const [ox, oy] = cotes.length ? cotes[0] : [0, 0];
    return {
      x: (cx + 0.5 + ox * 0.36) * CASE,
      y: (cy + 0.5 + oy * 0.36) * CASE,
      r: CASE * 2.1,
      duree: 26,
      reste: 0,
      phase: rnd() * TAU,
      ox,
      oy,
    };
  });

  const persos: Perso[] = [];
  for (const b of bleus) {
    persos.push(
      nouveauPerso((b.cx + 0.5) * CASE, (b.cy + 0.5) * CASE, EMOTIONS.PEUR, rnd, null),
    );
  }
  rouges.forEach((r, i) => {
    const pts = (modele.rondes[i] || []).map(([cx, cy]) => ({
      cx,
      cy,
      x: (cx + 0.5) * CASE,
      y: (cy + 0.5) * CASE,
    }));
    persos.push(
      nouveauPerso(
        (r.cx + 0.5) * CASE,
        (r.cy + 0.5) * CASE,
        EMOTIONS.COLERE,
        rnd,
        () => pts,
      ),
    );
  });

  const d = distances(z, leDepart);
  return {
    ...z,
    numero,
    grain: `ÉCRIT-${numero}`,
    lueurs,
    persos,
    torches: torchesPosees,
    portes,
    porteDe,
    fissures: fissuresPosees,
    fissureDe,
    versionPortes: 0,
    braises: [],
    reprises,
    murmures,
    depart: { x: (leDepart.cx + 0.5) * CASE, y: (leDepart.cy + 0.5) * CASE },
    sortie: {
      x: (leSeuil.cx + 0.5) * CASE,
      y: (leSeuil.cy + 0.5) * CASE,
      r: CASE * 0.55,
      vue: false,
      ames: 0,
    },
    requis: modele.requis,
    largeur: cols * CASE,
    hauteur: lignes * CASE,
    longueur: d[leSeuil.cy][leSeuil.cx],
  };
}
