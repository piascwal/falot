/**
 * LA PLANCHE DE SPRITES.
 *
 * Deux choses seulement sont testables sans navigateur, et ce sont les deux
 * qui cassent : le PLACEMENT (un sprite décalé d'un demi-corps) et la LECTURE
 * d'une planche écrite à la main (un JSON abîmé ne doit jamais empêcher de
 * jouer). Le reste — teinter, composer — se regarde à l'écran.
 */

import { describe, expect, it } from 'vitest';
import { type CaseAtlas, lireAtlas, placer } from '../src/rendu/atlas.js';

const image = {} as CanvasImageSource;

describe('le placement d’un sprite', () => {
  const c: CaseAtlas = { x: 0, y: 0, w: 64, h: 64 };

  it('pose le CENTRE du sprite sur la position demandée', () => {
    // C'est la convention de tout le jeu : un corps est à sa position, pas
    // posé dessus. Un sprite ancré en haut à gauche flotterait d'un demi-corps.
    const { dx, dy, dw, dh } = placer(c, 2, 100, 200);
    expect(dw).toBe(32);
    expect(dh).toBe(32);
    expect(dx).toBe(84);
    expect(dy).toBe(184);
  });

  it('respecte l’ancrage quand il est donné', () => {
    // Une torche s'accroche par le haut : c'est son collier qui touche le mur,
    // pas son milieu.
    const torche: CaseAtlas = { x: 0, y: 0, w: 32, h: 64, ax: 0.5, ay: 0 };
    const { dx, dy } = placer(torche, 2, 100, 200);
    expect(dx).toBe(92);
    expect(dy).toBe(200);
  });

  it('écrase et étire comme le corps, sans bouger le centre', () => {
    // Le corps s'écrase en courant. Le sprite doit suivre, et rester centré :
    // sinon le personnage s'enfonce dans le sol à chaque foulée.
    const { dx, dy, dw, dh } = placer(c, 2, 100, 200, 1.2, 0.8);
    expect(dw).toBeCloseTo(38.4, 5);
    expect(dh).toBeCloseTo(25.6, 5);
    expect(dx + dw / 2).toBeCloseTo(100, 5);
    expect(dy + dh / 2).toBeCloseTo(200, 5);
  });

  it('suit l’échelle : deux pixels de planche pour un pixel de jeu', () => {
    expect(placer(c, 1, 0, 0).dw).toBe(64);
    expect(placer(c, 4, 0, 0).dw).toBe(16);
  });
});

describe('la lecture d’une planche', () => {
  it('lit une planche bien écrite', () => {
    const a = lireAtlas(
      { echelle: 2, cases: { 'corps/falot/allume': { x: 1, y: 2, w: 64, h: 64 } } },
      image,
    );
    expect(a?.echelle).toBe(2);
    expect(a?.cases['corps/falot/allume'].w).toBe(64);
  });

  it('jette les cases abîmées et garde les autres', () => {
    // Une planche est écrite à la main, ou par un outil de packing : il y aura
    // des fautes. Une case fausse ne doit pas emporter les cinquante autres.
    const a = lireAtlas(
      {
        cases: {
          bonne: { x: 0, y: 0, w: 8, h: 8 },
          sansTaille: { x: 0, y: 0 },
          pasUnObjet: 3,
        },
      },
      image,
    );
    expect(Object.keys(a?.cases ?? {})).toEqual(['bonne']);
    expect(a?.echelle, 'une échelle absente vaut 1').toBe(1);
  });

  it('rend null plutôt que de casser le jeu', () => {
    // Absente, vide, illisible : on dessine à la main et personne ne le sait.
    expect(lireAtlas(null, image)).toBe(null);
    expect(lireAtlas({}, image)).toBe(null);
    expect(lireAtlas({ cases: {} }, image)).toBe(null);
    expect(lireAtlas('bonjour', image)).toBe(null);
    expect(lireAtlas({ cases: { a: { x: 0, y: 0 } } }, image), 'aucune case valide').toBe(
      null,
    );
  });
});
