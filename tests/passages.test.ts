/**
 * LES PASSAGES : mourir, et changer d'étage.
 *
 * Les deux se ressemblent, et c'est voulu : dans les deux cas la lumière quitte
 * le corps et s'en va vers le haut. Ce qui change, c'est ce qui suit — on
 * revient au point de reprise, ou on monte d'un étage.
 *
 * Avant, mourir était une téléportation d'une image à l'autre : on ne
 * comprenait pas ce qui venait d'arriver. Et franchir un Seuil changeait le
 * décor sans qu'on voie qu'on montait.
 */

import { describe, expect, it } from 'vitest';
import { CASE } from '../src/coeur/dimensions.js';
import { EMOTIONS } from '../src/coeur/formes.js';
import { avancer, creerPartie, PAS } from '../src/coeur/partie.js';
import { DUREE_BILAN } from '../src/coeur/regles/bilan.js';
import { eteindre } from '../src/coeur/regles/progression.js';
import { lancerLaChute, ouvrirLeSeuil } from '../src/coeur/regles/seuil.js';
import type { Partie } from '../src/coeur/types.js';
import { montrerToast } from '../src/coeur/voix.js';

const jouer = (p: Partie, secondes: number) => {
  for (let i = 0; i < Math.round(secondes / PAS); i++) avancer(p, PAS);
};

describe('mourir', () => {
  it('vide le corps de sa lumière avant de renvoyer au point de reprise', () => {
    const p = creerPartie({ grain: 'PASSAGE', etage: 1 });
    p.joueur.x += CASE * 3;
    eteindre(p);

    // 1. la lumière s'en va : le corps s'éteint, et le monde attend
    expect(p.envol).not.toBeNull();
    expect(p.envol?.raison).toBe('mort');
    jouer(p, 0.3);
    expect(p.eclosion).toBeLessThan(0.7);
    expect(p.eclosion).toBeGreaterThan(0);

    // 2. puis il revient, par une arrivée et non d'un coup
    jouer(p, 0.5);
    expect(p.envol).toBeNull();
    const retour = p.chute;
    expect(retour).not.toBeNull();
    expect(retour?.sens).toBe('haut');
    expect(retour?.ceremonie).toBe(false); // on a déjà vu la scène : elle est brève

    // 3. et il est au point de reprise, entier
    jouer(p, 1.2);
    expect(p.chute).toBeNull();
    expect(p.eclosion).toBe(1);
    expect(p.joueur.x).toBeCloseTo(p.zone.depart.x, 5);
    expect(p.joueur.y).toBeCloseTo(p.zone.depart.y, 5);
    expect(p.joueur.repit).toBeGreaterThan(0); // un répit pour repartir
  });

  it('ne coûte qu’une seconde et demie, montre comprise', () => {
    const p = creerPartie({ grain: 'PASSAGE', etage: 1 });
    eteindre(p);
    let t = 0;
    while ((p.envol || p.chute) && t < 5) {
      avancer(p, PAS);
      t += PAS;
    }
    // « La mort doit coûter des secondes, pas de la patience. »
    expect(t).toBeLessThan(1.6);
  });

  it('fige le monde pendant que la lumière s’en va', () => {
    const p = creerPartie({ grain: 'PASSAGE', etage: 1 });
    const guet = p.zone.persos.find((q) => q.emotion === EMOTIONS.COLERE)!;
    eteindre(p);
    const ou = { x: guet.x, y: guet.y };
    jouer(p, 0.4);
    expect(Math.hypot(guet.x - ou.x, guet.y - ou.y)).toBe(0);
  });
});

describe('franchir un Seuil', () => {
  it('se vide dans le portail, s’en va vers le haut, puis MONTE', () => {
    const p = creerPartie({ grain: 'PASSAGE', etage: 1 });
    ouvrirLeSeuil(p);

    // 1. la vidange : il donne au Seuil tout ce qu'il avait retrouvé
    expect(p.vidange).not.toBeNull();
    jouer(p, 2.3);

    // 2. l'envol : sa lumière monte, et l'étage n'a pas encore changé
    expect(p.envol?.raison).toBe('seuil');
    expect(p.numeroZone).toBe(1);
    jouer(p, 1.2);

    // 3. le bilan de l'étage qu'on vient de finir, vu de haut
    expect(p.bilan?.etage).toBe(1);
    jouer(p, DUREE_BILAN + 0.2);

    // 4. la cage d'escalier : elle se JOUE, et l'étage suivant n'est pas
    //    encore chargé — on est entre les deux, c'est tout l'intérêt
    expect(p.puits?.arrivee).toBe(2);
    expect(p.numeroZone).toBe(1);
    expect(p.montee).toHaveLength(1);
  });

  it('monte plus vite quand on pousse, et arrive PAR LE BAS à l’étage suivant', () => {
    const p = creerPartie({ grain: 'PASSAGE', etage: 1 });
    ouvrirLeSeuil(p);
    jouer(p, 3.6 + DUREE_BILAN + 0.2); // vidange, envol, bilan, puis la montée
    expect(p.puits).not.toBeNull();

    // il dérive vers le haut même sans rien pousser
    const seul = p.puits?.h ?? 0;
    jouer(p, 1);
    expect(p.puits?.h ?? 0).toBeGreaterThan(seul);

    // et il grimpe pour de bon quand on pousse
    p.entrees.touches.haut = true;
    for (let i = 0; i < 600 && p.puits; i++) avancer(p, PAS);
    expect(p.puits).toBeNull();
    expect(p.numeroZone).toBe(2);
    expect(p.chute?.sens).toBe('bas');
    // et il repart Peureux : le Seuil lui a tout pris
    expect(p.joueur.niveau).toBe(0);
    expect(p.joueur.eclat).toBe(0);
  });
});

describe('la cage d’escalier', () => {
  it('fait taire l’étage qu’on quitte : deux textes ne se superposent plus', () => {
    const p = creerPartie({ grain: 'PASSAGE', etage: 1 });
    montrerToast(p, 'Une phrase de l’étage d’en bas');
    avancer(p, PAS);
    expect(p.bandeau.visible).toBe(true);
    ouvrirLeSeuil(p);
    jouer(p, 3.6 + DUREE_BILAN + 0.2); // vidange, envol, bilan, puis la montée
    expect(p.puits).not.toBeNull();
    // le récit de la montée a la place pour lui seul
    expect(p.bandeau.visible).toBe(false);
    expect(p.bandeau.texte).toBe('');
    expect(p.filVoix).toHaveLength(0);
    expect(p.flottants).toHaveLength(0);
  });
});

describe('le prologue', () => {
  it('arrive par le haut — une lumière qui s’éteint ne disparaît pas, elle tombe', () => {
    const p = creerPartie({ grain: 'PASSAGE', etage: 1 });
    // `creerPartie` ne lance pas la scène : c'est l'écran-titre qui le fait.
    expect(p.chute).toBeNull();
    lancerLaChute(p);
    const arrivee = p.chute;
    expect(arrivee).not.toBeNull();
    expect(arrivee?.sens).toBe('haut');
    expect(arrivee?.ceremonie).toBe(true);
    expect(arrivee?.y0).toBeLessThan(p.joueur.y); // elle part d'en haut
    expect(p.eclosion).toBe(0); // il n'est pas encore là

    // elle prend son temps : elle tombe, il se pose, il regarde autour de lui
    jouer(p, 1.6);
    expect(p.chute).not.toBeNull();
    jouer(p, 2.6);
    expect(p.chute).toBeNull();
    expect(p.eclosion).toBe(1);
  });

  it('et le monde ne tourne pas tant qu’il n’est pas là', () => {
    const p = creerPartie({ grain: 'PASSAGE', etage: 1 });
    lancerLaChute(p);
    const guet = p.zone.persos.find((q) => q.emotion === EMOTIONS.COLERE)!;
    const ou = { x: guet.x, y: guet.y };
    jouer(p, 1);
    expect(Math.hypot(guet.x - ou.x, guet.y - ou.y)).toBe(0);
  });
});
