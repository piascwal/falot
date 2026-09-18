/**
 * LE DECK DES ÉTAGES, et les deux premières nouveautés qu'il distribue.
 *
 * La règle d'or : un étage = une nouveauté. Ce fichier la vérifie sur le deck
 * lui-même, puis sur les deux éléments déjà en jeu — l'appel (les Guets se
 * passent ce qu'ils voient) et le souffle (Falot éteint sa propre lumière).
 */

import { describe, expect, it } from 'vitest';
import { CASE } from '../src/coeur/dimensions.js';
import { EMOTIONS } from '../src/coeur/formes.js';
import { solideEn, vueLibre } from '../src/coeur/monde/grille.js';
import {
  DERNIER_ETAGE,
  PALIERS,
  palier,
  pouvoirs,
  TRAITS,
  traitsEtage,
} from '../src/coeur/monde/paliers.js';
import { avancer, creerPartie, PAS } from '../src/coeur/partie.js';
import type { Partie, Perso } from '../src/coeur/types.js';

const guets = (p: Partie) => p.zone.persos.filter((q) => q.emotion === EMOTIONS.COLERE);
const ames = (p: Partie) => p.zone.persos.filter((q) => q.emotion !== EMOTIONS.COLERE);

/** Un Guet planté, qui ne bouge plus et que rien ne gêne. */
function poser(g: Perso, x: number, y: number, regard = 0): void {
  g.x = g.baseX = x;
  g.y = g.baseY = y;
  g.regard = g.regardRepos = g.capAlerte = regard;
  g.ronde = [];
  // sans ça il balaye, et le résultat du test dépend de sa phase de départ
  g.amplitude = 0;
  g.balayage = 0;
  g.phase = 0;
  g.aveugle = 0;
  g.cligne = 0;
  g.alerte = 0;
  g.derniereVue = null;
}

/**
 * Plante Falot à deux cases d'un Guet, du côté où la pierre ne s'interpose
 * pas, et tourne le Guet vers lui. Poser des coordonnées en dur marchait une
 * graine sur trois : le reste du temps l'un des deux était dans un mur.
 */
function faceAFace(p: Partie, g: Perso, dist = CASE * 2): number {
  // Une torche allumée met à l'abri, et le départ en a une : la scène serait
  // couverte avant d'avoir commencé. On éteint la pièce.
  p.zone.torches.length = 0;
  p.zone.braises.length = 0;
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const x = g.x + Math.cos(a) * dist;
    const y = g.y + Math.sin(a) * dist;
    if (solideEn(p.zone, x, y)) continue;
    if (!vueLibre(p.zone, g.x, g.y, x, y)) continue;
    p.joueur.x = x;
    p.joueur.y = y;
    p.joueur.vx = p.joueur.vy = 0;
    g.regard = g.regardRepos = g.capAlerte = a;
    return a;
  }
  throw new Error('aucun dégagement autour de ce Guet');
}

describe('le deck', () => {
  it('donne un palier, et un seul, à chaque étage de la campagne', () => {
    for (let n = 1; n <= DERNIER_ETAGE; n++) {
      const pal = palier(n);
      expect(pal, `étage ${n}`).not.toBe(null);
      expect(PALIERS.filter((q) => q.numero === n)).toHaveLength(1);
    }
    expect(palier(DERNIER_ETAGE + 1)).toBe(null);
  });

  it('n’enseigne jamais deux choses à la fois tant qu’on apprend', () => {
    // Avant le neuvième, un étage porte SON trait et rien d'autre : mêler deux
    // nouveautés, c'est n'en enseigner aucune.
    for (let n = 1; n < 9; n++)
      expect(traitsEtage(n, 'DECK').length).toBeLessThanOrEqual(1);
    // à partir du neuvième, un trait déjà vu revient s'y mêler
    expect(traitsEtage(9, 'DECK').length).toBe(2);
  });

  it('ne recombine que ce qui a déjà été enseigné', () => {
    for (let n = 9; n <= DERNIER_ETAGE; n++) {
      const enDessous = PALIERS.filter((q) => q.numero < n).map((q) => q.neuf);
      for (const t of traitsEtage(n, 'DECK')) {
        const sien = palier(n)?.neuf === t;
        expect(sien || enDessous.includes(t), `étage ${n} : ${t}`).toBe(true);
      }
    }
  });

  it('rejoue tout en désordre dans le Puits sans fin, et sans doublon', () => {
    for (let n = DERNIER_ETAGE + 1; n < DERNIER_ETAGE + 40; n++) {
      const ts = traitsEtage(n, 'PUITS');
      expect(ts.length).toBeGreaterThanOrEqual(2);
      expect(new Set(ts).size).toBe(ts.length);
      for (const t of ts) expect(TRAITS).toContain(t);
    }
  });

  it('est déterministe : même graine, même étage, mêmes traits', () => {
    expect(traitsEtage(17, 'X').join()).toBe(traitsEtage(17, 'X').join());
  });

  it('rend les gestes et jamais la lumière : un pouvoir ne se reperd pas', () => {
    expect(pouvoirs(2).souffle).toBe(false);
    expect(pouvoirs(3).souffle).toBe(true);
    expect(pouvoirs(11).souffle).toBe(true);
    expect(pouvoirs(4).fanal).toBe(false);
    expect(pouvoirs(5).fanal).toBe(true);
    // dans le Puits sans fin, on a déjà tout traversé une fois
    expect(pouvoirs(DERNIER_ETAGE + 3)).toEqual({ souffle: true, fanal: true });
  });
});

describe('l’appel (étage 2)', () => {
  /** Falot posé en plein dans le cône d'un Guet, et un second Guet plus loin. */
  function scene(etage: number) {
    const p = creerPartie({ grain: 'APPEL', etage });
    const [a, b] = guets(p);
    poser(a, a.x, a.y);
    faceAFace(p, a);
    // le second regarde ailleurs, à deux cases du premier : il n'a rien vu
    poser(b, a.x + CASE * 1.5, a.y, Math.PI);
    for (const q of ames(p)) {
      q.x = -CASE * 40;
      q.y = -CASE * 40;
    }
    p.joueur.repit = 0;
    return { p, a, b };
  }

  it('fait passer à un voisin ce qu’un Guet vient de voir', () => {
    const { p, a, b } = scene(2);
    avancer(p, PAS);
    expect(a.derniereVue, 'celui qui voit').not.toBe(null);
    expect(b.derniereVue, 'celui qui écoute').not.toBe(null);
    expect(b.alerte).toBeGreaterThan(0);
  });

  it('ne se produit pas à un étage qui ne porte pas le trait', () => {
    const { p, a, b } = scene(1);
    avancer(p, PAS);
    expect(a.derniereVue).not.toBe(null);
    expect(b.derniereVue).toBe(null);
  });
});

describe('le souffle (étage 3)', () => {
  /** Falot en plein cône, et le pouvoir du souffle tenu ou non. */
  function scene(etage: number, souffle: boolean) {
    const p = creerPartie({ grain: 'SOUFFLE', etage });
    const g = guets(p)[0];
    poser(g, g.x, g.y);
    faceAFace(p, g);
    for (const autre of guets(p).slice(1)) {
      autre.x = -CASE * 40;
      autre.y = -CASE * 40;
    }
    p.joueur.repit = 0;
    p.entrees.souffle = souffle;
    avancer(p, PAS);
    return { p, g };
  }

  it('efface Falot du regard d’un Guet qui le fixe', () => {
    expect(scene(3, false).g.corpsVus).toBe(1);
    expect(scene(3, true).g.corpsVus).toBe(0);
  });

  it('ne sert à rien tant que Falot ne s’en est pas souvenu', () => {
    const { p, g } = scene(2, true);
    expect(p.joueur.eteint).toBe(false);
    expect(g.corpsVus).toBe(1);
  });

  it('coûte la vue, et le pouvoir de rallumer', () => {
    const p = creerPartie({ grain: 'SOUFFLE', etage: 3 });
    const q = ames(p)[0];
    q.x = p.joueur.x + CASE * 1.2;
    q.y = p.joueur.y;
    p.joueur.regard = 0;
    p.entrees.souffle = true;
    avancer(p, PAS);
    expect(p.joueur.eteint).toBe(true);
    // il n'éclaire plus personne : une âme dans son axe reste éteinte
    expect(p.eclaires.has(q)).toBe(false);
    expect(q.calme).toBe(false);
  });

  it('ne protège pas du contact : se cacher n’est pas traverser', () => {
    const p = creerPartie({ grain: 'SOUFFLE', etage: 3 });
    const g = guets(p)[0];
    poser(g, g.x, g.y);
    p.joueur.x = g.x;
    p.joueur.y = g.y;
    p.joueur.repit = 0;
    p.entrees.souffle = true;
    const depart = { x: p.zone.depart.x, y: p.zone.depart.y };
    avancer(p, PAS);
    // il meurt : sa lumière s'en va (l'envol de la mort est lancé)
    expect(p.envol?.raison).toBe('mort');
    expect(depart).toEqual({ x: p.zone.depart.x, y: p.zone.depart.y });
  });

  it('n’alerte plus personne : une lumière soufflée ne baigne rien', () => {
    // Dans son DOS, mais à portée de halo : c'est la lumière portée qui
    // alerte, pas le regard. Soufflée, elle ne baigne plus rien.
    const scene = (souffle: boolean) => {
      const p = creerPartie({ grain: 'SOUFFLE', etage: 3 });
      const g = guets(p)[0];
      poser(g, g.x, g.y);
      const dos = faceAFace(p, g, CASE * 1.2) + Math.PI;
      g.regard = g.regardRepos = g.capAlerte = dos;
      p.entrees.souffle = souffle;
      for (let i = 0; i < 60; i++) avancer(p, PAS);
      return g;
    };
    // témoin : lumière portée, il finit par se douter de quelque chose
    expect(scene(false).bain).toBeGreaterThan(0);
    const g = scene(true);
    expect(g.bain).toBe(0);
    expect(g.alerte).toBe(0);
  });
});
