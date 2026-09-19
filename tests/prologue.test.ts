/**
 * LE PROLOGUE, PRIS AU MOT.
 *
 * L'étage 1 n'enseigne pas par des phrases : les tests utilisateurs ont montré
 * que personne ne les lit. Il enseigne par sa géographie — et une géographie,
 * ça se mesure. Chaque test ci-dessous est une intention du niveau, vérifiée en
 * pilotant la vraie simulation, sans canvas et sans navigateur.
 *
 * Ce qui a été mesuré AVANT ces corrections, et qui les a motivées :
 *   - la galerie du 1er Guet se traversait tout droit 20 fois sur 20 en 2,3 s
 *     (ses deux portes étaient alignées) : le pierre n'y servait jamais ;
 *   - le couloir de l'escorte, large d'une case, était 0/20 : on ne peut pas
 *     croiser un Guet qui le bouche, et le pierre n'étourdit qu'à partir
 *     d'Ardent — hors budget du prologue ;
 *   - une fois la première âme livrée, repartir la chercher à l'est était
 *     0/20 et mortel, ce qui poussait le joueur à remonter tout l'étage.
 */

import { describe, expect, it } from 'vitest';
import { CASE, D } from '../src/coeur/dimensions.js';
import { EMOTIONS, FORMES } from '../src/coeur/formes.js';
import { zoneEcrite } from '../src/coeur/monde/ecrits.js';
import { distances } from '../src/coeur/monde/grille.js';
import { avancer, creerPartie, PAS } from '../src/coeur/partie.js';
import { lancerPierre } from '../src/coeur/regles/pierre.js';
import type { Partie, Point, Zone } from '../src/coeur/types.js';

const c = (cx: number, cy: number): Point => ({
  x: (cx + 0.5) * CASE,
  y: (cy + 0.5) * CASE,
});
const cases = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y) / CASE;
const ames = (z: Zone) => z.persos.filter((p) => p.emotion !== EMOTIONS.COLERE);
const guets = (z: Zone) => z.persos.filter((p) => p.emotion === EMOTIONS.COLERE);

/** Pousse le joystick vers un point du monde, comme un doigt le ferait. */
function pousser(p: Partie, vers: Point): void {
  const dx = vers.x - p.joueur.x;
  const dy = vers.y - p.joueur.y;
  const d = Math.hypot(dx, dy) || 1;
  p.entrees.manche.actif = true;
  p.entrees.manche.id = -1;
  p.entrees.manche.dx = dx / d;
  p.entrees.manche.dy = dy / d;
  p.entrees.manche.force = 1;
}

interface Essai {
  /** Où l'on part, puis les points de passage. */
  voie: Point[];
  /** Combien d'âmes calmées suivent le joueur. */
  convoi?: number;
  /** Déphasage de la ronde des Guets, en pas de simulation. */
  decalage: number;
  /** Ce que le pilote fait en plus de marcher. */
  ruse?: 'pierre';
}

/**
 * Fait jouer un pilote automatique. Il ne sait que marcher vers un point — et,
 * si on le lui demande, lancer un pierre et attendre de voir le Guet partir.
 * C'est volontairement bête : ce qu'on mesure, c'est ce que la géographie
 * autorise, pas l'habileté de quelqu'un.
 */
function piloter({ voie, convoi = 0, decalage, ruse }: Essai): {
  passe: boolean;
  t: number;
} {
  const p = creerPartie({ grain: 'PROLOGUE', etage: 1 });
  p.chute = null; // on saute la scène d'ouverture
  p.eclosion = 1;
  if (convoi > 0) p.joueur.niveau = 1; // il faut le faisceau pour escorter
  for (let i = 0; i < decalage; i++) avancer(p, PAS);
  p.joueur.x = voie[0].x;
  p.joueur.y = voie[0].y;
  p.joueur.vx = p.joueur.vy = 0;
  p.joueur.repit = 0;
  const suiveurs = ames(p.zone).slice(0, convoi);
  for (const [i, q] of suiveurs.entries()) {
    q.calme = true;
    q.suit = true;
    q.prime = true;
    q.rang = i + 1;
    q.x = p.joueur.x;
    q.y = p.joueur.y + CASE * 0.4;
  }
  const arrivee = voie[voie.length - 1];
  let etape = 1;
  let lance = false;
  let attente = 0;
  for (let i = 0; i < 60 * 25; i++) {
    if (ruse === 'pierre' && !lance && cases(p.joueur, voie[0]) > 1.2) {
      // il jette la pierre à l'autre bout de la salle, loin de sa sortie
      const vers = c(22, 12);
      lancerPierre(p, Math.atan2(vers.y - p.joueur.y, vers.x - p.joueur.x), 1);
      lance = true;
    }
    const guet = guets(p.zone).find((q) => q.y < c(0, 13).y);
    const degage = !guet || guet.x > c(19, 0).x;
    if (lance && !degage && attente < 60 * 5) {
      attente++; // il attend de VOIR le Guet s'éloigner
      p.entrees.manche.actif = false;
      p.entrees.manche.force = 0;
    } else {
      pousser(p, voie[etape]);
    }
    avancer(p, PAS);
    if (p.joueur.repit > 1.5) return { passe: false, t: +(i * PAS).toFixed(1) };
    if (cases(p.joueur, voie[etape]) < 0.45) {
      if (etape === voie.length - 1) return { passe: true, t: +(i * PAS).toFixed(1) };
      etape++;
    }
    if (cases(p.joueur, arrivee) < 0.45) return { passe: true, t: +(i * PAS).toFixed(1) };
  }
  return { passe: false, t: 25 };
}

/** Le même essai sur vingt moments différents de la ronde des Guets. */
function surToutesLesRondes(essai: Omit<Essai, 'decalage'>): number {
  let passes = 0;
  for (let d = 0; d < 240; d += 12) {
    if (piloter({ ...essai, decalage: d }).passe) passes++;
  }
  return passes;
}

describe('le prologue — la salle du réveil', () => {
  it('ouvre tout le niveau sans rien casser : on se réveille, on marche', () => {
    // La salle avait deux murs fêlés qu'il fallait ouvrir à la pierre pour
    // sortir. En test, personne ne comprenait ce qu'on lui demandait : on
    // apprenait une mécanique avant d'avoir appris à marcher. La leçon de la
    // pierre est restée, mais là où elle sert — devant un Guet.
    const z = zoneEcrite(1)!;
    expect(z.fissures).toHaveLength(0);
    const d = distances(z, {
      cx: Math.floor(z.depart.x / CASE),
      cy: Math.floor(z.depart.y / CASE),
    });
    const atteignable = (q: Point) =>
      d[Math.floor(q.y / CASE)]?.[Math.floor(q.x / CASE)] >= 0;
    expect(atteignable(z.sortie)).toBe(true);
    for (const l of z.lueurs) expect(atteignable(l)).toBe(true);
    for (const q of z.persos) expect(atteignable(q)).toBe(true);
    for (const r of z.reprises) expect(atteignable(r)).toBe(true);
  });

  it('donne de quoi ouvrir le faisceau avant d’avoir vu un Guet', () => {
    // C'est la salle qui doit payer le premier palier : arriver Peureux
    // devant le premier Guet, c'est arriver sans rien à essayer.
    const z = zoneEcrite(1)!;
    const guetLePlusHaut = Math.min(...guets(z).map((g) => Math.floor(g.y / CASE)));
    const avant = z.lueurs.filter((l) => Math.floor(l.y / CASE) < guetLePlusHaut);
    expect(avant.length * 4).toBeGreaterThanOrEqual(FORMES[1].seuil);
  });

  it('est éclairée par des torches, et rien d’autre', () => {
    // « Plein de torches » : c'est ce qui fait comprendre en trois secondes
    // qu'on est dans un bâtiment noir où seule la lumière qu'on rallume
    // existe. Elles sont sur les deux parois, et écartées.
    const z = zoneEcrite(1)!;
    const salle = z.torches.filter((t) => t.y < c(0, 7).y);
    expect(salle.length).toBeGreaterThanOrEqual(5);
    const hautes = salle.filter((t) => t.oy < 0).length;
    const basses = salle.filter((t) => t.oy > 0).length;
    expect(hautes).toBeGreaterThanOrEqual(2);
    expect(basses).toBeGreaterThanOrEqual(2);
    // et chacune est accrochée à un mur : c'est ce qui la dessine tournée
    for (const t of z.torches) expect(Math.abs(t.ox) + Math.abs(t.oy)).toBe(1);
  });

  it('dit comment on marche, dès le réveil et dans la fiction', () => {
    const z = zoneEcrite(1)!;
    const main = z.murmures.find((m) => m.texte.toLowerCase().includes('main'));
    expect(main, 'la première phrase parle de la main qui porte la lampe').toBeDefined();
    if (!main) return;
    expect(cases(main, z.depart)).toBeLessThan(1.4);
  });

  it('n’y cache aucun bonus : ses lueurs sont toutes de simples lueurs', () => {
    expect(zoneEcrite(1)!.lueurs.every((l) => l.type === 'eclat')).toBe(true);
  });
});

describe('le prologue — la galerie du premier Guet', () => {
  // Entrée par la porte nord (18,8), sortie par la porte sud (14,13). Les deux
  // ne sont PAS alignées : traverser demande de se déplacer dans sa ronde.
  const voie = [c(18, 7), c(18, 9), c(14, 14)];

  it('ne se traverse pas tout droit', () => {
    const passes = surToutesLesRondes({ voie });
    // Mesuré à 4/20 avec les deux Guets en place. Portes alignées et un seul
    // Guet, c'était 20/20 ; portes décalées, 6/20. Six configurations de rondes
    // ont été essayées : celle-ci est la seule qui rende « foncer » perdant
    // sans rendre la salle injuste.
    expect(passes).toBeLessThanOrEqual(10);
  });

  it('se traverse à tous les coups en lançant d’abord un pierre', () => {
    const passes = surToutesLesRondes({ voie, ruse: 'pierre' });
    // Mesuré à 20/20 : le leurre est la réponse, et il marche toujours.
    expect(passes).toBeGreaterThanOrEqual(18);
  });
});

describe('le prologue — le couloir de l’escorte', () => {
  // Deux voies : la ligne du haut, que le Guet balaye, et celle du bas.
  const haut = [c(17, 21), c(16, 21), c(9, 21), c(4, 21)];
  const bas = [c(17, 21), c(16, 22), c(13, 22), c(10, 22), c(7, 22), c(4, 21)];

  it('tue qui le prend tout droit par la ligne du Guet', () => {
    expect(surToutesLesRondes({ voie: haut })).toBeLessThanOrEqual(4);
  });

  it('se passe par la ligne du bas, seul comme avec un convoi', () => {
    expect(surToutesLesRondes({ voie: bas })).toBeGreaterThanOrEqual(16);
    expect(surToutesLesRondes({ voie: bas, convoi: 1 })).toBeGreaterThanOrEqual(15);
    expect(surToutesLesRondes({ voie: bas, convoi: 2 })).toBeGreaterThanOrEqual(14);
  });

  it('se refait dans l’autre sens : aller rechercher la seconde âme est possible', () => {
    // Avant l'élargissement, ce trajet était 0/20 et mortel — le joueur
    // remontait donc tout l'étage plutôt que de revenir ici. Il est retombé à
    // 8/20 depuis qu'un Guet détecté se rend sur place : c'est le prix de la
    // nouvelle règle, et c'est voulu. Ce qui compte est que ça ne soit plus
    // une impasse — et de toute façon les deux âmes sont vues à l'aller, donc
    // ce retour n'est plus un passage obligé.
    expect(surToutesLesRondes({ voie: [...bas].reverse() })).toBeGreaterThanOrEqual(5);
  });

  it('laisse ses deux battants sceller le quartier du Guet', () => {
    const z = zoneEcrite(1)!;
    const guet = guets(z).find((q) => cases(q, c(14, 21)) < 1.5)!;
    // Son monde s'arrête aux portes, battants ouverts ou non.
    const sien = distances(
      z,
      { cx: Math.floor(guet.x / CASE), cy: Math.floor(guet.y / CASE) },
      true,
    );
    const joignable = (q: Point) =>
      sien[Math.floor(q.y / CASE)]?.[Math.floor(q.x / CASE)] >= 0;
    expect(joignable(z.sortie)).toBe(false);
    for (const a of ames(z)) {
      if (cases(a, guet) > 6) expect(joignable(a)).toBe(false);
    }
  });
});

describe('le prologue — les deux âmes', () => {
  it('sont toutes les deux vues au premier passage vers l’est', () => {
    const z = zoneEcrite(1)!;
    // Le trajet d'aller : la bouche ouest du couloir jusqu'à la dernière lueur.
    const trajet: Point[] = [];
    for (let cx = 9; cx <= 17; cx++) {
      trajet.push(c(cx, 21));
      trajet.push(c(cx, 22));
    }
    // Les deux âmes du secteur du Seuil. La troisième, le Frileux de l'étage
    // du dessus, est volontairement à l'écart : c'est la démonstration qu'il
    // te manque quelque chose, et personne n'oblige à y retourner.
    const duSecteur = ames(z).filter((a) => a.y > c(0, 18).y);
    expect(duSecteur).toHaveLength(2);
    for (const a of duSecteur) {
      const plusPres = Math.min(...trajet.map((t) => cases(t, a)));
      // Deux cases : on leur passe devant. Au fond de la salle de droite —
      // où la seconde âme était posée — c'était sept.
      expect(plusPres).toBeLessThanOrEqual(2);
    }
  });

  it('en garde une hors de portée tant qu’on est Peureux', () => {
    const z = zoneEcrite(1)!;
    // La dernière lueur est à l'EST du Guet : on ne devient Curieux qu'après
    // avoir traversé, et c'est là que la première âme se rallume.
    const lueurEst = Math.max(...z.lueurs.map((l) => Math.floor(l.x / CASE)));
    const guet = guets(z).find((q) => cases(q, c(14, 21)) < 1.5)!;
    const rondeEst = Math.max(...guet.ronde.map((r) => r.cx));
    expect(lueurEst).toBeGreaterThan(rondeEst);
  });

  it('tient le budget d’éclat du niveau : Curieux, et rien de plus', () => {
    const z = zoneEcrite(1)!;
    const eclats = z.lueurs.filter((l) => l.type === 'eclat').length;
    expect(eclats * 4).toBeGreaterThanOrEqual(FORMES[1].seuil);
    expect(eclats * 4).toBeLessThan(FORMES[2].seuil);
  });
});

describe('le prologue — la main', () => {
  it('montre le geste tant que personne n’a rien poussé, et jamais après', () => {
    const p = creerPartie({ grain: 'MAIN', etage: 1 });
    p.chute = null;
    p.eclosion = 1;
    expect(p.premieres.main).toBe(false);
    avancer(p, PAS);
    expect(p.premieres.main).toBe(false);
    // le premier geste l'efface, et il ne revient pas
    p.entrees.touches.droite = true;
    avancer(p, PAS);
    expect(p.premieres.main).toBe(true);
    p.entrees.touches.droite = false;
    for (let i = 0; i < 60; i++) avancer(p, PAS);
    expect(p.premieres.main).toBe(true);
  });
});

describe('le prologue — ce qui n’a pas changé', () => {
  it('demande deux âmes, et il y en a trois sur le plan', () => {
    const z = zoneEcrite(1)!;
    expect(z.requis).toBe(2);
    expect(ames(z).length).toBeGreaterThanOrEqual(3);
  });

  it('pose une reprise par salle traversée', () => {
    expect(zoneEcrite(1)!.reprises.length).toBeGreaterThanOrEqual(5);
  });

  it('donne une ronde écrite à chacun de ses trois Guets', () => {
    const z = zoneEcrite(1)!;
    // Deux dans la galerie — un par moitié de salle — et un dans le couloir de
    // l'escorte. Deux dans la galerie, c'est ce qui rend « foncer » perdant.
    expect(guets(z)).toHaveLength(3);
    for (const g of guets(z)) expect(g.ronde.length).toBeGreaterThanOrEqual(2);
    expect(guets(z).filter((g) => g.y < c(0, 13).y)).toHaveLength(2);
  });

  it('parle de torches, jamais de brandons, et jamais dans le vide', () => {
    const z = zoneEcrite(1)!;
    for (const m of z.murmures) {
      expect(typeof m.texte).toBe('string');
      expect(m.texte.length).toBeGreaterThan(10);
      expect(m.texte.toLowerCase()).not.toContain('brandon');
    }
    expect(z.murmures.some((m) => m.texte.toLowerCase().includes('torche'))).toBe(true);
  });

  it('garde le halo assez large pour voir les deux voies du couloir', () => {
    // Une case et demie : debout dans le couloir, on voit la ligne du haut et
    // celle du bas. Sans ça, la seconde voie n'existerait pas pour le joueur.
    expect(D.halo / CASE).toBeGreaterThanOrEqual(1.5);
  });
});
