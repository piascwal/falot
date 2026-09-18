import { type Emotion, HUMEURS } from '../formes.js';
import { TAU } from '../geometrie.js';
import type { Perso, PointRonde } from '../types.js';

// Un personnage, quel qu'il soit. Extrait du générateur parce que les étages
// écrits à la main ont besoin d'en poser exactement les mêmes : un PNJ du
// premier étage doit obéir aux mêmes règles que ceux des étages suivants,
// sinon l'étage 1 n'enseigne pas le jeu qu'on va jouer ensuite.
// `fabriqueRonde` est appelée EN DERNIER, comme dans la version d'origine :
// l'ordre des tirages décide des plans, et le changer regénérerait un autre
// monde pour une graine donnée.
export function nouveauPerso(
  x: number,
  y: number,
  emotion: Emotion,
  rnd: () => number,
  fabriqueRonde: (() => PointRonde[]) | null,
): Perso {
  const regard = rnd() * TAU;
  const p: Perso = {
    x,
    y,
    baseX: x,
    baseY: y,
    vx: 0,
    vy: 0,
    sx: 1,
    sy: 1,
    vsx: 0,
    vsy: 0,
    regard,
    regardRepos: regard,
    balayage: (rnd() < 0.5 ? 1 : -1) * (0.35 + rnd() * 0.5),
    amplitude: 0.5 + rnd() * 0.9,
    phase: rnd() * TAU,
    emotion,
    eclaire: false,
    calme: false,
    suit: false,
    livre: false,
    rang: 0,
    aDit: false, // a-t-elle déjà dit qu'elle était vide ?
    prime: false, // a-t-elle déjà payé son calmage ?
    aveugle: 0,
    compteCalme: 0,
    tremble: rnd() * TAU,
    humeur: HUMEURS.INTRIGUE,
    fuit: 0,
    eteint: false,
    alerte: 0,
    traqueur: false,
    piste: -1,
    oeil: false,
    farouche: false,
    pese: false,
    etape: 0,
    charge: 0,
    route: null,
    immobile: 0,
    curiosite: null,
    curieuxT: 0,
    derniereVue: null,
    bain: 0,
    // Tout est nommé dès la naissance, même ce qui ne servira qu'aux Guets :
    // un champ qui apparaît en cours de route se lit `undefined > 0` quelque
    // part, et ce genre de comparaison ne dit rien de bon.
    gene: false,
    enAlerte: false,
    capAlerte: regard,
    cap: undefined,
    dernierX: x,
    dernierY: y,
    corpsVus: 0,
    abri: false,
    rayonsRelais: null,
    rayonsVue: null,
    // Les sentinelles clignent des yeux : quelques dixièmes de seconde
    // où elles ne voient rien. C'est ce qui rend l'observation des yeux
    // dans le noir réellement utile, et donne une fenêtre pour passer.
    cligne: 0,
    prochainCligne: 1.5 + rnd() * 3.5,
    ronde: [],
  };
  p.ronde = fabriqueRonde ? fabriqueRonde() : [];
  return p;
}
