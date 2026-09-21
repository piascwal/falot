/**
 * La simulation, prise au mot. Tout se passe sans canvas et sans DOM : c'est
 * précisément ce que le découpage a acheté.
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { CASE, D, PORTEE_VUE } from '../src/coeur/dimensions.js';
import { DUREE_CALME, EMOTIONS, FORMES, PIERRE } from '../src/coeur/formes.js';
import { distances, solideEn } from '../src/coeur/monde/grille.js';
import { avancer, creerPartie, PAS } from '../src/coeur/partie.js';
import { majJelly } from '../src/coeur/regles/joueur.js';
import { lancerPierre } from '../src/coeur/regles/pierre.js';
import { eteindre, gagnerEclat } from '../src/coeur/regles/progression.js';
import type { Corps, Partie, Perso } from '../src/coeur/types.js';

const jouer = (p: Partie, secondes: number) => {
  for (let i = 0; i < Math.round(secondes / PAS); i++) avancer(p, PAS);
};

const guets = (p: Partie) => p.zone.persos.filter((q) => q.emotion === EMOTIONS.COLERE);
const lumieres = (p: Partie) => p.zone.persos.filter((q) => q.emotion !== EMOTIONS.COLERE);

describe('une partie qui démarre', () => {
  let p: Partie;
  beforeEach(() => {
    p = creerPartie({ grain: 'TEST-1' });
  });

  it('commence à l’étage écrit, sur son seuil, et Peureux', () => {
    expect(p.numeroZone).toBe(1);
    expect(p.zone.grain).toBe('ÉCRIT-1');
    expect(p.joueur.x).toBe(p.zone.depart.x);
    expect(p.joueur.niveau).toBe(0);
    expect(p.joueur.pierres).toBe(PIERRE[0].reserve);
  });

  it('tourne dix secondes sans rien casser, et laisse Falot sur du sol', () => {
    jouer(p, 10);
    expect(Number.isFinite(p.joueur.x)).toBe(true);
    expect(Number.isFinite(p.joueur.y)).toBe(true);
    expect(solideEn(p.zone, p.joueur.x, p.joueur.y)).toBe(false);
  });

  it('avance quand on pousse le joystick, et s’arrête quand on le lâche', () => {
    p.entrees.manche.actif = true;
    p.entrees.manche.dx = 1;
    p.entrees.manche.dy = 0;
    p.entrees.manche.force = 1;
    const x0 = p.joueur.x;
    jouer(p, 0.5);
    expect(p.joueur.x).toBeGreaterThan(x0 + 10);
    p.entrees.manche.actif = false;
    p.entrees.manche.force = 0;
    jouer(p, 1);
    expect(Math.hypot(p.joueur.vx, p.joueur.vy)).toBeLessThan(1);
  });

  it('ne laisse jamais Falot traverser la pierre, même en poussant dedans', () => {
    p.entrees.touches.haut = true;
    p.entrees.touches.gauche = true;
    jouer(p, 6);
    expect(solideEn(p.zone, p.joueur.x, p.joueur.y)).toBe(false);
  });
});

describe('le déterminisme', () => {
  it('rend deux parties identiques à graine et entrées égales', () => {
    const scenario = (p: Partie) => {
      p.entrees.manche.actif = true;
      p.entrees.manche.force = 1;
      for (let i = 0; i < 900; i++) {
        // un parcours en zigzag, toujours le même
        const a = (i / 120) * Math.PI;
        p.entrees.manche.dx = Math.cos(a);
        p.entrees.manche.dy = Math.sin(a);
        if (i % 180 === 0) lancerPierre(p, a, 0.8);
        avancer(p, PAS);
      }
    };
    const a = creerPartie({ grain: 'REJEU' });
    const b = creerPartie({ grain: 'REJEU' });
    scenario(a);
    scenario(b);
    expect(empreinte(a)).toBe(empreinte(b));
  });
});

describe('les formes', () => {
  it('montent aux seuils annoncés, et jamais avant', () => {
    const p = creerPartie({ grain: 'FORMES' });
    for (let n = 1; n < FORMES.length; n++) {
      gagnerEclat(p, FORMES[n].seuil - p.joueur.eclat - 1);
      expect(p.joueur.niveau).toBe(n - 1);
      gagnerEclat(p, 1);
      expect(p.joueur.niveau).toBe(n);
      // le palier élargit la poche, et on la remplit tout de suite
      expect(p.joueur.pierres).toBe(PIERRE[n].reserve);
    }
  });

  it('ne redescend pas quand l’éclat baisse : c’est le SOMMET qui compte', () => {
    const p = creerPartie({ grain: 'FORMES' });
    gagnerEclat(p, FORMES[1].seuil);
    expect(p.joueur.niveau).toBe(1);
    p.joueur.eclat = 0;
    gagnerEclat(p, 0);
    expect(p.joueur.niveau).toBe(1);
  });

  it('ne monte que d’un palier par gain — en jeu on ne gagne jamais plus de 10', () => {
    // Comportement du POC, gardé tel quel : `evoluer` ne boucle pas. Les gains
    // réels valent 2, 4, 6 ou 10, et les paliers sont espacés de 26 au moins :
    // sauter deux formes d'un coup ne peut pas arriver en jouant.
    const p = creerPartie({ grain: 'FORMES' });
    gagnerEclat(p, FORMES[3].seuil);
    expect(p.joueur.niveau).toBe(1);
    gagnerEclat(p, 0);
    expect(p.joueur.niveau).toBe(2);
  });
});

describe('un Guet', () => {
  /** Plante Falot pile dans le cône d'un Guet, à la distance demandée. */
  const seFaireVoir = (p: Partie, g: Perso, cases: number) => {
    g.regard = 0;
    g.alerte = 0;
    g.charge = 0;
    g.aveugle = 0;
    g.cligne = 0;
    g.curieuxT = 0;
    p.joueur.x = g.x + CASE * cases;
    p.joueur.y = g.y;
    p.joueur.repit = 0;
  };

  it('remplit sa jauge quand il nous tient, et la vide quand on s’en va', () => {
    const p = creerPartie({ grain: 'GUET' });
    const g = guets(p)[0];
    seFaireVoir(p, g, 2.5);
    avancer(p, PAS);
    const apresUnPas = g.charge;
    expect(apresUnPas).toBeGreaterThan(0);
    // On s'en va VRAIMENT : lui tourner le dos ne suffit plus, puisqu'il se
    // rend maintenant au dernier endroit où il a vu quelque chose.
    p.joueur.x = p.zone.depart.x;
    p.joueur.y = p.zone.depart.y;
    for (let i = 0; i < 30; i++) avancer(p, PAS);
    expect(g.charge).toBeLessThan(apresUnPas);
  });

  it('se rend au dernier endroit où il a vu quelque chose', () => {
    const p = creerPartie({ grain: 'GUET' });
    const g = guets(p)[0];
    seFaireVoir(p, g, 2.5);
    const ou = { x: p.joueur.x, y: p.joueur.y };
    avancer(p, PAS);
    expect(g.derniereVue).not.toBeNull();
    // le joueur file ailleurs ; le Guet, lui, va voir là où il l'a vu
    p.joueur.x = p.zone.depart.x;
    p.joueur.y = p.zone.depart.y;
    p.joueur.repit = 99;
    const avant = Math.hypot(g.x - ou.x, g.y - ou.y);
    for (let i = 0; i < 90; i++) avancer(p, PAS);
    expect(Math.hypot(g.x - ou.x, g.y - ou.y)).toBeLessThan(avant);
  });

  it('se met en alerte quand la lumière du joueur s’attarde sur lui, sans le repérer', () => {
    const p = creerPartie({ grain: 'GUET' });
    const g = guets(p)[0];
    // dos tourné : il ne peut pas nous voir. Mais notre faisceau le baigne.
    g.regard = 0;
    g.aveugle = 0;
    g.cligne = 0;
    g.alerte = 0;
    g.charge = 0;
    p.joueur.niveau = 1; // Curieux : il a un faisceau
    p.joueur.x = g.x - CASE * 2.5;
    p.joueur.y = g.y;
    p.joueur.regard = 0; // droit sur lui
    p.joueur.repit = 99;
    for (let i = 0; i < 40; i++) avancer(p, PAS);
    expect(g.alerte).toBeGreaterThan(0);
    // sa jauge, elle, n'a pas bougé : la lumière alerte, elle ne dénonce pas
    expect(g.charge).toBe(0);
  });

  it('reste où il est tant que la lumière ne fait que s’attarder', () => {
    const p = creerPartie({ grain: 'GUET' });
    const g = guets(p)[0];
    g.regard = 0;
    g.alerte = 0;
    g.cligne = 0;
    p.joueur.niveau = 1;
    p.joueur.x = g.x - CASE * 2.5;
    p.joueur.y = g.y;
    p.joueur.regard = 0;
    p.joueur.repit = 99;
    const ou = { x: g.x, y: g.y };
    // une demi-seconde : il se doute, il tourne la tête, il ne bouge pas
    for (let i = 0; i < 30; i++) avancer(p, PAS);
    expect(g.alerte).toBeGreaterThan(0);
    expect(g.derniereVue).toBeNull();
    expect(Math.hypot(g.x - ou.x, g.y - ou.y)).toBeLessThan(CASE * 0.5);
  });

  it('finit par venir si la lumière insiste', () => {
    const p = creerPartie({ grain: 'GUET' });
    const g = guets(p)[0];
    g.regard = 0;
    g.alerte = 0;
    g.cligne = 0;
    p.joueur.niveau = 1;
    p.joueur.x = g.x - CASE * 2.5;
    p.joueur.y = g.y;
    p.joueur.regard = 0;
    p.joueur.repit = 99;
    // deux secondes de faisceau sur lui : il quitte son poste
    for (let i = 0; i < 130; i++) avancer(p, PAS);
    expect(g.derniereVue).not.toBeNull();
  });

  it('oublie où il nous a vus quand une pierre tombe près de lui', () => {
    const p = creerPartie({ grain: 'GUET' });
    const g = guets(p)[0];
    seFaireVoir(p, g, 2.5);
    avancer(p, PAS);
    expect(g.derniereVue).not.toBeNull();
    lancerPierre(p, Math.PI, 1); // vers l'arrière, loin de lui
    jouer(p, 1.2);
    expect(g.curiosite).not.toBeNull();
    expect(g.derniereVue).toBeNull(); // la pierre annule la traque, pas la retarde
    expect(g.charge).toBe(0);
  });

  it('ne s’alerte pas pour un faisceau qui ne fait que passer', () => {
    const p = creerPartie({ grain: 'GUET' });
    const g = guets(p)[0];
    g.regard = 0;
    g.alerte = 0;
    p.joueur.niveau = 1;
    p.joueur.x = g.x - CASE * 2.5;
    p.joueur.y = g.y;
    p.joueur.repit = 99;
    // dix pas seulement, soit un sixième de seconde : il faut s'attarder
    p.joueur.regard = 0;
    for (let i = 0; i < 10; i++) avancer(p, PAS);
    expect(g.alerte).toBe(0);
  });

  it('franchit un mur qu’on a cassé : une fissure ouverte est un couloir', () => {
    // Le prologue n'a plus de mur fêlé : on prend un étage tiré au sort, où
    // une fissure n'ouvre jamais qu'un raccourci.
    const p = creerPartie({ grain: 'GUET', etage: 3 });
    const f = p.zone.fissures[0];
    expect(solideEn(p.zone, f.x, f.y)).toBe(true);
    p.zone.mur[f.cy][f.cx] = 0;
    expect(solideEn(p.zone, f.x, f.y)).toBe(false);
    // Et le parcours en largeur d'un Guet — celui qui exclut les portes, et
    // elles seules — la traverse : rien ne distingue une fissure ouverte d'un
    // sol ordinaire, pour personne. Une porte, si.
    const depart = {
      cx: Math.floor(p.zone.depart.x / CASE),
      cy: Math.floor(p.zone.depart.y / CASE),
    };
    expect(distances(p.zone, depart, true)[f.cy][f.cx]).toBeGreaterThanOrEqual(0);
    expect(p.zone.porteDe[f.cy][f.cx]).toBeNull();
  });

  it('monte d’autant plus vite qu’il y a de corps à regarder', () => {
    const mesure = (convoi: number) => {
      const p = creerPartie({ grain: 'GUET' });
      const g = guets(p)[0];
      seFaireVoir(p, g, 3);
      const suivants = lumieres(p).slice(0, convoi);
      for (const q of suivants) {
        q.calme = true;
        q.suit = true;
        q.abri = false;
        q.x = p.joueur.x;
        q.y = p.joueur.y;
      }
      avancer(p, PAS);
      return g.charge;
    };
    // Chaque lumière escortée est un halo de plus dans le cône.
    expect(mesure(2)).toBeGreaterThan(mesure(0));
  });

  it('éteint Falot quand le front rouge le rattrape, et le renvoie au seuil', () => {
    const p = creerPartie({ grain: 'GUET' });
    const g = guets(p)[0];
    seFaireVoir(p, g, 1.2);
    const depart = { ...p.zone.depart };
    for (
      let i = 0;
      i < 600 && Math.hypot(p.joueur.x - depart.x, p.joueur.y - depart.y) > 2;
      i++
    ) {
      avancer(p, PAS);
    }
    expect(p.joueur.x).toBeCloseTo(depart.x, 5);
    expect(p.joueur.y).toBeCloseTo(depart.y, 5);
    expect(p.joueur.souffle).toBe(1);
  });

  it('ne voit rien dans son dos, quelle que soit la distance', () => {
    const p = creerPartie({ grain: 'GUET' });
    const g = guets(p)[0];
    seFaireVoir(p, g, 1.2);
    g.regard = Math.PI; // il regarde à l'opposé
    p.joueur.repit = 0;
    for (let i = 0; i < 120; i++) avancer(p, PAS);
    expect(g.charge).toBe(0);
  });

  it('se détourne pour aller voir où un pierre est tombé', () => {
    const p = creerPartie({ grain: 'GUET' });
    const g = guets(p)[0];
    g.aveugle = 0;
    g.alerte = 2;
    p.joueur.x = g.x;
    p.joueur.y = g.y + CASE * 2;
    p.joueur.regard = -Math.PI / 2;
    lancerPierre(p, 0, 0.3);
    jouer(p, 1.2);
    // Il oublie TOUT : alerte, jauge, poursuite. C'est ce qui fait du pierre
    // une arme et pas une curiosité.
    expect(g.curiosite).not.toBeNull();
    expect(g.alerte).toBeLessThanOrEqual(0);
  });
});

describe('la mort', () => {
  it('lâche le convoi là où on est tombé, et ne reprend jamais l’éclat', () => {
    const p = creerPartie({ grain: 'MORT' });
    gagnerEclat(p, 40);
    const eclat = p.joueur.eclat;
    const suivants = lumieres(p).slice(0, 2);
    for (const q of suivants) {
      q.calme = true;
      q.suit = true;
      q.x = p.joueur.x + 10;
      q.y = p.joueur.y;
    }
    const ou = { x: p.joueur.x, y: p.joueur.y };
    eteindre(p);
    expect(p.joueur.eclat).toBe(eclat);
    for (const q of suivants) {
      expect(q.suit).toBe(false);
      expect(Math.hypot(q.x - ou.x, q.y - ou.y)).toBeLessThan(CASE * 3);
      expect(solideEn(p.zone, q.x, q.y)).toBe(false);
    }
  });

  it('signale le pierre la toute première fois, et une seule', () => {
    const p = creerPartie({ grain: 'MORT' });
    const avant = p.signaux.pierre;
    eteindre(p);
    expect(p.signaux.pierre).toBe(avant + 1);
    eteindre(p);
    expect(p.signaux.pierre).toBe(avant + 1);
  });
});

describe('le pierre', () => {
  it('ouvre un mur fêlé quand il tombe à côté', () => {
    const p = creerPartie({ grain: 'FENTE', etage: 2 });
    const f = p.zone.fissures[0];
    expect(p.zone.mur[f.cy][f.cx]).toBe(1);
    p.joueur.x = f.x;
    p.joueur.y = f.y + CASE; // juste en dessous de la fente
    lancerPierre(p, -Math.PI / 2, 0);
    jouer(p, 1.5);
    expect(p.zone.mur[f.cy][f.cx]).toBe(0);
    expect(p.zone.versionPortes).toBeGreaterThan(0);
  });

  it('ne part pas quand la poche est vide, et se recharge au rythme du palier', () => {
    const p = creerPartie({ grain: 'POCHE' });
    p.joueur.pierres = 0;
    lancerPierre(p, 0, 1);
    expect(p.pierres).toHaveLength(0);
    jouer(p, PIERRE[0].delai + 0.2);
    expect(p.joueur.pierres).toBe(1);
  });

  it('s’arrête avant la pierre : il ne la traverse jamais', () => {
    const p = creerPartie({ grain: 'PIERRE' });
    // plein nord depuis le seuil de l'étage 1 : il y a un mur à deux pas
    lancerPierre(p, -Math.PI / 2, 1);
    const c = p.pierres[0];
    expect(solideEn(p.zone, c.x1, c.y1)).toBe(false);
  });
});

describe('rallumer une lumière', () => {
  it('la fait suivre, et ne paie sa prime qu’une fois', () => {
    const p = creerPartie({ grain: 'AME' });
    // Curieux : il a un faisceau. Sans lui, aucune lumière ne peut être rallumée —
    // c'est la règle, et l'étage 1 la met en scène avec un Frileux hors
    // d'atteinte.
    p.joueur.niveau = 1;
    p.joueur.regard = 0;
    const q = lumieres(p)[0];
    q.x = p.joueur.x + CASE * 1.5; // droit devant, dans le couloir d'entrée
    q.y = p.joueur.y;
    q.baseX = q.x;
    q.baseY = q.y;
    const eclat = p.joueur.eclat;
    jouer(p, DUREE_CALME + 0.3);
    expect(q.calme).toBe(true);
    expect(q.suit).toBe(true);
    expect(p.joueur.eclat).toBe(eclat + 6);
    // Paniquer puis la recalmer ne repaie pas : une lumière ne rapporte qu'une fois.
    q.calme = false;
    q.compteCalme = 0;
    jouer(p, DUREE_CALME + 0.3);
    expect(q.calme).toBe(true);
    expect(p.joueur.eclat).toBe(eclat + 6);
  });
});

describe('le convoi', () => {
  it('souffle sa lumière dès qu’un Guet se doute de quelque chose', () => {
    const p = creerPartie({ grain: 'CONVOI' });
    const q = lumieres(p)[0];
    q.calme = true;
    q.suit = true;
    q.prime = true;
    q.x = p.joueur.x + CASE * 0.5;
    q.y = p.joueur.y;
    avancer(p, PAS);
    expect(q.eteint).toBe(false);
    // un Guet se doute : tout le convoi s'éteint
    guets(p)[0].alerte = 3;
    avancer(p, PAS);
    avancer(p, PAS);
    expect(q.eteint).toBe(true);
    // et une lumière éteinte n'éclaire plus personne
    expect(p.eclaires.has(q)).toBe(false);
  });

  it('soufflé, il est invisible pour un Guet qui n’a rien remarqué', () => {
    // Le convoi ne souffle que si un Guet se doute de quelque chose QUELQUE
    // PART : on en alerte donc un au loin, et on regarde ce que voit l'autre,
    // celui qui a le convoi dans son cône et qui, lui, n'a rien remarqué.
    // Falot est derrière lui : on veut mesurer ce que les âmes lui montrent,
    // pas ce que Falot lui montre.
    const p = creerPartie({ grain: 'CONVOI' });
    const [g, loin] = guets(p);
    expect(loin).toBeTruthy();
    g.regard = g.regardRepos = g.capAlerte = 0;
    g.ronde = [];
    g.amplitude = 0;
    g.balayage = 0;
    g.aveugle = 0;
    g.cligne = 0;
    g.alerte = 0; // il ne se doute de rien
    loin.alerte = 3; // celui-là, si — le convoi souffle
    loin.aveugle = 0;
    p.joueur.x = g.x - CASE * 9;
    p.joueur.y = g.y;
    p.joueur.repit = 9;
    for (const q of lumieres(p).slice(0, 3)) {
      q.calme = true;
      q.suit = true;
      q.prime = true;
      q.x = q.baseX = g.x + CASE * 2;
      q.y = q.baseY = g.y;
    }
    avancer(p, PAS);
    // trois lumières en plein dans son cône, et il ne voit rien du tout
    expect(g.corpsVus).toBe(0);
  });

  it('mais un Guet DÉJÀ EN ALERTE les voit quand même, soufflées ou non', () => {
    const p = creerPartie({ grain: 'CONVOI' });
    const g = guets(p)[0];
    g.regard = 0;
    g.aveugle = 0;
    g.cligne = 0;
    g.alerte = 3; // il se doute déjà de quelque chose
    p.joueur.x = g.x + CASE * 2.5;
    p.joueur.y = g.y;
    p.joueur.repit = 0;
    for (const q of lumieres(p).slice(0, 3)) {
      q.calme = true;
      q.suit = true;
      q.prime = true;
      q.x = p.joueur.x;
      q.y = p.joueur.y;
    }
    avancer(p, PAS);
    // le joueur ET les trois lumières : le souffle du convoi ne l'efface plus
    expect(g.corpsVus).toBe(4);
  });

  it('une âme entrée dans le faisceau d’un Guet en alerte est vidée et reprise', () => {
    const p = creerPartie({ grain: 'CONVOI' });
    const g = guets(p)[0];
    g.regard = 0;
    g.aveugle = 0;
    g.cligne = 0;
    g.ronde = [];
    g.amplitude = 0;
    g.balayage = 0;
    g.alerte = 3;
    g.charge = 0.5; // son front est déjà sorti : c'est ça, « en alerte »
    const q = lumieres(p)[0];
    q.calme = true;
    q.suit = true;
    q.prime = true;
    // FALOT EST HORS D'ATTEINTE : on veut voir l'âme reprise, pas Falot éteint
    p.joueur.x = g.x - CASE * 9;
    p.joueur.y = g.y;
    p.joueur.repit = 9;
    q.x = q.baseX = g.x + CASE * 1.2;
    q.y = q.baseY = g.y;
    for (let i = 0; i < 90; i++) {
      p.joueur.repit = 9;
      q.x = g.x + CASE * 1.2;
      q.y = g.y;
      avancer(p, PAS);
      if (!q.suit) break;
    }
    // vidée : elle a perdu sa lumière — et reprise : elle n'est plus au convoi
    expect(q.suit).toBe(false);
    expect(q.calme).toBe(false);
    expect(q.livre).toBe(false); // récupérable : elle est là, elle fuit
  });
});

describe('l’abri', () => {
  it('efface Falot d’un cône quand il se tient dans une braise', () => {
    const p = creerPartie({ grain: 'ABRI' });
    const g = guets(p)[0];
    g.regard = 0;
    g.aveugle = 0;
    g.cligne = 0;
    p.joueur.x = g.x + CASE * 2;
    p.joueur.y = g.y;
    p.joueur.repit = 0;
    p.zone.braises.push({ x: p.joueur.x, y: p.joueur.y, r: CASE * 2.3, phase: 0 });
    for (let i = 0; i < 60; i++) avancer(p, PAS);
    expect(g.charge).toBe(0);
    expect(p.joueur.abri).toBe(true);
  });
});

describe('la gelée', () => {
  /** Le corps, secoué à une vitesse donnée pendant une demi-seconde. */
  const secouer = (vx: number, vy: number) => {
    const p: Corps = {
      x: 0,
      y: 0,
      vx,
      vy,
      sx: 1,
      sy: 1,
      vsx: 0,
      vsy: 0,
      regard: 0,
      tremble: 0,
      aveugle: 0,
      cligne: 0,
    };
    for (let i = 0; i < 30; i++) majJelly(p, 1 / 60);
    return { sx: Math.round(p.sx * 1000) / 1000, sy: Math.round(p.sy * 1000) / 1000 };
  };

  it('déforme pareil à droite et à gauche', () => {
    // Écrite avec la vitesse SIGNÉE, elle élargissait Falot vers la gauche et
    // l'étirait en hauteur vers la droite : deux animations différentes pour
    // le même pas. La déformation ne doit dépendre que de l'axe.
    expect(secouer(-400, 0)).toEqual(secouer(400, 0));
  });

  it('déforme pareil en haut et en bas', () => {
    expect(secouer(0, -400)).toEqual(secouer(0, 400));
  });

  it('étire toujours dans le sens de la course, jamais en travers', () => {
    for (const v of [-400, 400] as const) {
      const h = secouer(v, 0);
      expect(h.sx, `horizontale à ${v}`).toBeGreaterThan(1);
      expect(h.sy, `horizontale à ${v}`).toBeLessThan(1);
      const w = secouer(0, v);
      expect(w.sy, `verticale à ${v}`).toBeGreaterThan(1);
      expect(w.sx, `verticale à ${v}`).toBeLessThan(1);
    }
  });
});

describe('le halo', () => {
  it('rétrécit à mesure qu’un Guet nous verrouille', () => {
    const p = creerPartie({ grain: 'HALO' });
    const g = guets(p)[0];
    g.regard = 0;
    g.aveugle = 0;
    g.cligne = 0;
    p.joueur.x = g.x + PORTEE_VUE * 0.6;
    p.joueur.y = g.y;
    p.joueur.repit = 0;
    const plein = p.joueur.souffle;
    for (let i = 0; i < 30; i++) avancer(p, PAS);
    expect(p.joueur.souffle).toBeLessThan(plein);
    expect(p.joueur.souffle).toBeGreaterThanOrEqual(0);
  });

  it('ne descend jamais sous son plancher : on doit pouvoir s’enfuir', () => {
    const p = creerPartie({ grain: 'HALO' });
    p.joueur.souffle = 0;
    // 0,68 est le plancher mesuré : sous une case et demie, on ne voit plus
    // assez pour courir.
    expect(D.halo * 0.68).toBeGreaterThan(CASE);
  });
});

/** Ce qui doit être identique entre deux rejeux. */
function empreinte(p: Partie): string {
  const r = (v: number) => v.toFixed(4);
  return [
    r(p.joueur.x),
    r(p.joueur.y),
    r(p.joueur.eclat),
    p.joueur.niveau,
    p.joueur.pierres,
    p.zone.sortie.lumieres,
    p.zone.braises.length,
    p.particules.length,
    p.zone.persos
      .map((q) => `${r(q.x)},${r(q.y)},${r(q.charge)},${q.calme ? 1 : 0}`)
      .join(';'),
  ].join('#');
}
