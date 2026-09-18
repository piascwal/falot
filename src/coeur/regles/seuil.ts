/**
 * Le Seuil : la règle la plus dure du jeu, et celle qui raconte tout le reste.
 *
 * Un Seuil ne s'ouvre pas avec une clé. Il s'ouvre quand assez de lumière se
 * tient dedans — et cette lumière, c'est celle de Falot. Il la donne. Toute.
 * On le VOIT partir, sinon « repartir peureux » ne ressemble qu'à une remise à
 * zéro arbitraire.
 *
 * On y trouve aussi la scène d'ouverture, qui est la même idée prise à
 * l'envers : « elle tombe », dit l'écran noir — alors on la voit tomber.
 */

import { CASE, D } from '../dimensions.js';
import { clamp, ecartAngle, TAU } from '../geometrie.js';
import { forme } from '../lectures.js';
import { chargerZone } from '../monde/chargement.js';
import { emettre, onde } from '../particules.js';
import type { Partie } from '../types.js';

/** Le minutage de la scène d'ouverture, en secondes. */
export const CHUTE = { tombe: 1.5, pose: 0.5, gauche: 0.8, droite: 0.8, fin: 0.45 };

/** Démarre la scène d'ouverture : la lumière part de trois cases au-dessus. */
export function lancerLaChute(partie: Partie): void {
  partie.chute = {
    t: 0,
    x: partie.joueur.x,
    y: partie.joueur.y - CASE * 3.5,
    y0: partie.joueur.y - CASE * 3.5,
    pose: false,
  };
  partie.eclosion = 0;
}

export function ouvrirLeSeuil(partie: Partie): void {
  const { joueur, zone, entrees } = partie;
  if (partie.vidange) return;
  if (partie.numeroZone === 1) partie.prologueFait = true;
  partie.montee.push({ etage: partie.numeroZone, ames: zone.sortie.ames });
  partie.vidange = {
    t: 0,
    duree: 2.2,
    eclat0: joueur.eclat,
    suivante: partie.numeroZone + 1,
    motes: [],
    reste: 0,
  };
  joueur.vx = joueur.vy = 0;
  entrees.manche.actif = false;
  entrees.manche.force = 0;
  entrees.touches.gauche =
    entrees.touches.droite =
    entrees.touches.haut =
    entrees.touches.bas =
      false;
}

// Elle tombe, elle touche, il apparaît, il regarde autour de lui. Rien d'autre
// ne tourne pendant ce temps : ni règles, ni sentinelles, ni commandes.
export function majChute(partie: Partie, dt: number): void {
  const { joueur } = partie;
  const chute = partie.chute;
  if (!chute) return;
  chute.t += dt;
  const t = chute.t;
  if (t < CHUTE.tombe) {
    const k = t / CHUTE.tombe;
    chute.y = chute.y0 + (joueur.y - chute.y0) * (k * k); // elle accélère
    partie.eclosion = 0;
    if (partie.hasard() < dt * 26) emettre(partie, chute.x, chute.y, '#8fd0ff', 1, 16);
    return;
  }
  if (!chute.pose) {
    chute.pose = true;
    chute.y = joueur.y;
    onde(partie, joueur.x, joueur.y, CASE * 2.6, '#8fd0ff');
    emettre(partie, joueur.x, joueur.y, '#8fd0ff', 24, 95);
    emettre(partie, joueur.x, joueur.y, '#c6e6ff', 12, 45);
  }
  const a = t - CHUTE.tombe;
  const vers = (cible: number, vitesse?: number) => {
    joueur.regard += ecartAngle(joueur.regard, cible) * Math.min(1, (vitesse || 5) * dt);
  };
  if (a < CHUTE.pose) {
    partie.eclosion = a / CHUTE.pose;
    joueur.regard = Math.PI / 2;
    return;
  }
  partie.eclosion = 1;
  const b = a - CHUTE.pose;
  if (b < CHUTE.gauche) {
    vers(Math.PI);
    return;
  } // il regarde à gauche
  const c = b - CHUTE.gauche;
  if (c < CHUTE.droite) {
    vers(0);
    return;
  } // puis à droite
  const d = c - CHUTE.droite;
  if (d < CHUTE.fin) {
    vers(Math.PI / 2);
    return;
  } // puis devant lui
  partie.chute = null; // il peut partir
}

export function majVidange(partie: Partie, dt: number): void {
  const { joueur } = partie;
  const vidange = partie.vidange;
  if (!vidange) return;
  vidange.t += dt;
  const k = clamp(vidange.t / vidange.duree, 0, 1);
  // la jauge du haut se vide au même rythme que le halo se referme
  joueur.eclat = vidange.eclat0 * (1 - k);

  // Des motes montent hors du corps en spirale. Elles ont leur propre liste
  // parce qu'elles sont peintes PAR-DESSUS le voile : les particules
  // ordinaires sont dessinées dessous, et le halo qui se referme les aurait
  // effacées au fur et à mesure — c'est-à-dire exactement quand il faut les
  // voir.
  const cadence = 74 * (1 - k * 0.45);
  const aNaitre = cadence * dt + (vidange.reste || 0);
  vidange.reste = aNaitre % 1;
  for (let i = 0; i < Math.floor(aNaitre); i++) {
    vidange.motes.push({
      a: partie.hasard() * TAU,
      r: D.taille * (0.15 + partie.hasard() * 0.45),
      h: 0,
      vh: 46 + partie.hasard() * 70,
      va: (partie.hasard() < 0.5 ? -1 : 1) * (1.4 + partie.hasard() * 2.2),
      vie: 1,
      max: 0.8 + partie.hasard() * 0.5,
      taille: 1.4 + partie.hasard() * 2.2,
    });
  }
  for (let i = vidange.motes.length - 1; i >= 0; i--) {
    const m = vidange.motes[i];
    m.h += m.vh * dt;
    m.a += m.va * dt;
    m.r *= 1 - 0.55 * dt; // la spirale se resserre en montant
    m.vie -= dt / m.max;
    if (m.vie <= 0) vidange.motes.splice(i, 1);
  }

  // et le sol rend ce qu'on lui a pris : des ondes qui partent du corps
  if (partie.hasard() < dt * 9) {
    partie.ondes.push({
      x: joueur.x,
      y: joueur.y,
      r: D.taille * 0.5,
      max: D.taille * (2.4 + partie.hasard() * 2.4),
      couleur: forme(joueur).couleur,
    });
  }

  if (vidange.t >= vidange.duree) {
    const n = vidange.suivante;
    partie.vidange = null;
    chargerZone(partie, n);
    partie.cage = n;
  }
}

// Peinte après le voile d'obscurité, en lumière additive : c'est de la
