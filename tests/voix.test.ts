/**
 * UNE seule voix. Deux phrases lancées en même temps se recouvraient dans le
 * POC ; elles font maintenant la queue. C'est testable, donc c'est testé.
 */

import { describe, expect, it } from 'vitest';
import { creerPartie } from '../src/coeur/partie.js';
import { dire, majVoix, montrerToast, murmurer } from '../src/coeur/voix.js';

describe('la voix', () => {
  it('pose la première phrase dans le bandeau, et fait attendre les suivantes', () => {
    const p = creerPartie({ grain: 'VOIX' });
    montrerToast(p, 'première');
    expect(p.bandeau.texte).toBe('première');
    expect(p.bandeau.visible).toBe(true);
    montrerToast(p, 'deuxième');
    expect(p.bandeau.texte).toBe('première'); // elle attend son tour
    expect(p.filVoix).toHaveLength(1);
    majVoix(p, 4.4); // la première s'achève
    expect(p.bandeau.texte).toBe('deuxième');
  });

  it('ne garde jamais plus de trois phrases en attente : le reste tombe', () => {
    const p = creerPartie({ grain: 'VOIX' });
    for (let i = 0; i < 9; i++) montrerToast(p, `phrase ${i}`);
    expect(p.filVoix.length).toBeLessThanOrEqual(3);
  });

  it('fait pâlir le bandeau au lieu de l’effacer', () => {
    const p = creerPartie({ grain: 'VOIX' });
    montrerToast(p, 'une règle');
    majVoix(p, 5);
    expect(p.bandeau.visible).toBe(true);
    expect(p.bandeau.pale).toBe(true);
    expect(p.bandeau.texte).toBe('une règle'); // on peut y revenir
  });

  it('attache une réplique à qui parle, et la laisse dans le monde', () => {
    const p = creerPartie({ grain: 'VOIX' });
    const qui = p.zone.persos[0];
    murmurer(p, qui.x, qui.y, 'je croyais être éteinte', '#a8f0c8', qui);
    expect(p.flottants).toHaveLength(1);
    expect(p.flottants[0].sujet).toBe(qui);
    expect(p.flottants[0].murmure).toBe(true);
    expect(p.bandeau.visible).toBe(false); // rien dans le bandeau
  });

  it('envoie au bandeau une phrase du décor, qui n’appartient à personne', () => {
    const p = creerPartie({ grain: 'VOIX' });
    murmurer(p, 0, 0, 'd’autres sont passés ici');
    expect(p.flottants).toHaveLength(0);
    expect(p.bandeau.texte).toBe('d’autres sont passés ici');
  });

  it('laisse la file s’écouler dans l’ordre', () => {
    const p = creerPartie({ grain: 'VOIX' });
    dire(p, { texte: 'un', duree: 1 });
    dire(p, { texte: 'deux', duree: 1 });
    dire(p, { texte: 'trois', duree: 1 });
    majVoix(p, 1);
    expect(p.bandeau.texte).toBe('deux');
    majVoix(p, 1);
    expect(p.bandeau.texte).toBe('trois');
  });
});
