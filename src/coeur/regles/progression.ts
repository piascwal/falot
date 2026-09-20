/**
 * La progression, et ce qu'elle coûte.
 *
 * Falot ne gagne pas de pouvoirs — il se souvient d'en avoir eu. Chaque lueur
 * ramassée est un fragment qu'un Éteint a laissé tomber, et chaque palier lui
 * rend un morceau de sa confiance. Il rendra tout au Seuil (voir `seuil.ts`).
 *
 * Rien ici ne touche au DOM : les animations de l'interface (le bouton qui bat,
 * la jauge qui tressaille) sont des COMPTEURS dans `partie.signaux`, que
 * l'interface observe. C'est ce qui permet de tester « le jeu signale le
 * pierre la première fois qu'on meurt » sans ouvrir un navigateur.
 */

import { CASE, D } from '../dimensions.js';
import { BONUS, EMOTIONS, FORMES } from '../formes.js';
import { TAU } from '../geometrie.js';
import { rangPierre } from '../lectures.js';
import { solide } from '../monde/grille.js';
import { emettre, flotter } from '../particules.js';
import type { Lueur, Partie, Perso, Point } from '../types.js';
import { montrerToast } from '../voix.js';
import { lancerLEnvol } from './seuil.js';
export function evoluer(partie: Partie): void {
  const { joueur } = partie;
  const suivant = FORMES[joueur.niveau + 1];
  if (!suivant || joueur.sommet < suivant.seuil) return;
  joueur.niveau++;
  // le palier élargit la poche : on la remplit tout de suite, sinon la
  // récompense ne se sent qu'au bout d'une recharge complète
  joueur.pierres = rangPierre(joueur).reserve;
  emettre(partie, joueur.x, joueur.y - D.taille * 0.7, suivant.couleur, 16, 90);
  // Le bandeau modal met le jeu en pause. Acceptable pour découvrir un verbe,
  // insupportable au milieu d'une escorte — et comme la forme repart à zéro à
  // chaque zone, on le reverrait à chaque fois. Une seule explication par
  // forme et par session ; ensuite un simple bandeau passager.
  // Plus de bandeau modal : il coupait le jeu pour expliquer ce que le bouton
  // peut montrer tout seul. La pierre prend la couleur de la forme, pulse, et
  // une ligne passagère nomme ce qu'il sait faire de plus.
  partie.signaux.pierre++;
  partie.signaux.forme++;
  montrerToast(partie, `${suivant.nom} — ${suivant.verbe.toLowerCase()}`);
}

export function gagnerEclat(partie: Partie, n: number): void {
  const { joueur } = partie;
  joueur.eclat += n;
  joueur.sommet = Math.max(joueur.sommet, joueur.eclat);
  evoluer(partie);
}

// Un membre du convoi repéré s'enfuit et redevient farouche. Il reste
// récupérable : il faut retourner le calmer, ce qui coûte du temps.
export function paniquer(partie: Partie, q: Perso): void {
  const { joueur, zone } = partie;
  q.suit = false;
  q.calme = false;
  q.compteCalme = 0;
  q.fuit = 1.2;
  const a = Math.atan2(q.y - joueur.y, q.x - joueur.x);
  q.vx += Math.cos(a) * 420;
  q.vy += Math.sin(a) * 420;
  q.baseX = q.x;
  q.baseY = q.y;
  emettre(partie, q.x, q.y - D.taille * 0.8, '#8fd0ff', 8, 70);
  montrerToast(partie, "Une âme t'échappe !");
  for (const r of zone.persos) if (r.suit && r.rang > q.rang) r.rang--;
}

// Un point de sol libre au plus près d'une position : les âmes lâchées ne
// doivent pas se retrouver dans la pierre.
// Elles se répandent autour du point de chute plutôt que de s'y empiler :
// cinq âmes sur un même pixel, on n'en voit qu'une et on croit en avoir perdu
// quatre pour de bon. On balaye en spirale et on refuse une place déjà prise —
// un cap figé par âme ne suffisait pas, celle dont le cap pointait dans la
// pierre restait plantée au centre avec les autres.
function solLibrePres(
  partie: Partie,
  x: number,
  y: number,
  rang: number,
  prises: Point[],
): Point {
  const { zone } = partie;
  const ecart = CASE * 0.45;
  for (let anneau = 1; anneau <= 4; anneau++) {
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * TAU + rang * 0.52; // chacune commence ailleurs
      const cx = x + Math.cos(a) * CASE * 0.55 * anneau;
      const cy = y + Math.sin(a) * CASE * 0.55 * anneau;
      if (solide(zone, Math.floor(cx / CASE), Math.floor(cy / CASE))) continue;
      if (prises.some((q) => Math.hypot(q.x - cx, q.y - cy) < ecart)) continue;
      return { x: cx, y: cy };
    }
  }
  return { x, y }; // cul-de-sac d'une case : tant pis
}

export function eteindre(partie: Partie): void {
  const { joueur, zone } = partie;
  partie.morts++; // le bilan de l'étage le dira
  // L'éclat n'est JAMAIS repris : la progression ne se perd pas, sinon la
  // mort punit deux fois. Et c'est un bandeau qui s'efface, pas une fenêtre à
  // valider : ça casserait le rythme.
  joueur.souffle = 1;
  for (const p of zone.persos) p.charge = 0;

  // On perd le CONVOI, jamais la banque. Ce qui est entré dans le portail y
  // reste : le travail déjà fait ne se défait pas, sinon une mort tardive
  // renvoie à la case départ et l'escorte devient décourageante. Ce qu'on
  // portait sur le dos, en revanche, se disperse là où on est tombé, et il
  // faut retourner le chercher à l'endroit exact de l'échec.
  const mx = joueur.x,
    my = joueur.y;
  const prises: Point[] = [];
  let perdues = 0;
  for (const p of zone.persos) {
    if (p.emotion === EMOTIONS.COLERE || !p.suit || p.livre) continue;
    const pos = solLibrePres(partie, mx, my, ++perdues, prises);
    prises.push(pos);
    p.x = p.baseX = pos.x;
    p.y = p.baseY = pos.y;
    p.vx = p.vy = 0;
    p.suit = false;
    p.calme = false;
    p.compteCalme = 0;
    p.rang = 0;
    p.fuit = 0.8;
    emettre(partie, p.x, p.y - D.taille * 0.8, '#8fd0ff', 8, 60);
  }

  // Il ne se téléporte plus : sa lumière le quitte et monte, puis il revient
  // au point de reprise par une arrivée. Le retour au seuil se faisait d'une
  // image à l'autre — brutal, et on ne comprenait pas ce qui venait d'arriver.
  // `renaitre`, à la fin de l'envol, fait le reste.
  lancerLEnvol(partie, 'mort');
  for (const p of zone.persos) {
    if (p.emotion !== EMOTIONS.COLERE) continue;
    p.x = p.baseX;
    p.y = p.baseY;
    p.vx = p.vy = 0;
  }
  montrerToast(
    partie,
    perdues
      ? `Éteint — ${perdues} âme${perdues > 1 ? 's' : ''} lâchée${perdues > 1 ? 's' : ''} là où tu es tombé`
      : 'Éteint — tu repars du seuil',
  );

  // On ne donne jamais l'outil avant le problème. La toute première fois
  // qu'un regard nous éteint, le bouton PIERRE se signale — sans un mot
  // d'explication : il se met à battre, et c'est au joueur d'essayer.
  if (partie.premieres.mort) {
    partie.premieres.mort = false;
    partie.signaux.pierre++;
  }
}

export function ramasser(partie: Partie, l: Lueur): void {
  const { joueur } = partie;
  l.prise = true;
  const b = BONUS[l.type];
  emettre(partie, l.x, l.y, b.couleur, 10, 70);
  partie.priseCount++;
  if (l.type === 'eclat') {
    flotter(partie, l.x, l.y, '+4', b.couleur);
    partie.signaux.jauge++;
    if (partie.premieres.lueur) {
      partie.premieres.lueur = false;
      montrerToast(
        partie,
        'Les lueurs remplissent ta confiance, en haut à droite — pleine, tu changes de forme',
      );
    }
    gagnerEclat(partie, 4);
    return;
  }
  if (l.type === 'poche') {
    joueur.pierres = rangPierre(joueur).reserve;
    joueur.pierreDispo = 0;
    // et la poche reste intarissable quelques secondes : un bonus qu'on ne
    // sent pas n'est pas un bonus
    joueur.bonus = l.type;
    joueur.bonusT = b.duree;
    montrerToast(partie, b.phrase);
    return;
  }
  if (l.type === 'souffle') joueur.souffle = 1;
  joueur.bonus = l.type;
  joueur.bonusT = b.duree;
  montrerToast(partie, b.phrase);
  flotter(partie, l.x, l.y, '+2', b.couleur);
  partie.signaux.jauge++;
  gagnerEclat(partie, 2);
}
