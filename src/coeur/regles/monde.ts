/**
 * LA RÈGLE, et toutes celles qui en découlent.
 *
 * Entrer dans le faisceau d'un Guet ne te fait pas repérer : ça le met en
 * alerte, et une zone rouge se met à grandir depuis lui le long de son cône.
 * Tant que ce front ne t'a pas rattrapé, tu peux encore sortir. S'il
 * t'atteint — ou si tu le touches — c'est fini. La distance fait donc le délai
 * toute seule, sans aucune formule.
 *
 * Et ce qu'il voit, ce n'est pas toi : ce sont des LAMPES. Chaque âme que tu
 * escortes est une petite lumière de plus dans son cône, et sa jauge monte
 * d'autant plus vite. C'est tout l'arbitrage du jeu, et la bible en donne la
 * raison (`docs/lux-falot.md`, « Les deux lumières »).
 */

import { CASE, D, PORTEE_VUE } from '../dimensions.js';
import { BONUS, DUREE_CALME, EMOTIONS } from '../formes.js';
import { aBonus, porteeFaisceau, rangCaillou } from '../lectures.js';
import { dansLeCone, vueLibre } from '../monde/grille.js';
import { emettre, onde } from '../particules.js';
import { ETEINTS, REPLIQUES } from '../textes.js';
import type { Partie } from '../types.js';
import { montrerToast, murmurer } from '../voix.js';
import { aLAbri, estEclaire, prochedUneBraise } from './lumiere.js';
import { eteindre, gagnerEclat, paniquer, ramasser } from './progression.js';
import { ouvrirLeSeuil } from './seuil.js';

export function majRegles(partie: Partie, dt: number): void {
  const { joueur, zone } = partie;
  for (const l of zone.lueurs) {
    if (l.prise) continue;
    if (Math.hypot(l.x - joueur.x, l.y - joueur.y) < D.taille * 0.9) {
      ramasser(partie, l);
      continue;
    }
    // mémoire des points d'intérêt : on se souvient des objets, pas du terrain
    if (!l.vue && estEclaire(partie, l.x, l.y)) l.vue = true;
  }
  if (!zone.sortie.vue && estEclaire(partie, zone.sortie.x, zone.sortie.y))
    zone.sortie.vue = true;

  // Arriver sur un portail fermé sans savoir ce qu'il attend, c'est rester
  // planté devant. On le dit une fois, la première fois qu'on s'en approche.
  if (
    !partie.premieres.seuil &&
    zone.sortie.ames < zone.requis &&
    Math.hypot(zone.sortie.x - joueur.x, zone.sortie.y - joueur.y) < CASE * 2.4
  ) {
    partie.premieres.seuil = true;
    montrerToast(
      partie,
      `Le Seuil est vide — il s'ouvre quand ${zone.requis} âmes s'y tiennent`,
    );
  }

  for (const t of zone.torches) {
    if (t.reste > 0) t.reste -= dt;
    // On se souvient d'une torche croisée, allumée ou non : c'est un repère, et
    // savoir où aller rallumer fait partie du jeu. (Le POC posait ce drapeau
    // dans le rendu ; c'est de la mémoire de jeu, sa place est ici.)
    if (Math.hypot(t.x - joueur.x, t.y - joueur.y) < CASE * 3) t.vue = true;
    // et elle crache quelques braises, tant qu'elle brûle
    if (t.reste > 0 && partie.hasard() < 0.1) {
      emettre(partie, t.x, t.y, '#ffb45c', 1, 26);
    }
    // Une case et demie, pas trois quarts de case : la torche est décalée vers
    // sa paroi, et à 0,75 il fallait lui rentrer dedans au pixel près. On
    // passait à côté d'un abri sans le reprendre, sans jamais savoir pourquoi.
    if (
      Math.hypot(t.x - joueur.x, t.y - joueur.y) < CASE * 1.15 &&
      t.reste < t.duree * 0.6
    ) {
      if (t.reste <= 0) emettre(partie, t.x, t.y, '#ffb45c', 8, 55);
      t.reste = t.duree;
    }
  }

  // Les points de reprise. À la mort on repart à l'entrée de la salle en
  // cours, pas au seuil de l'étage : la mort doit coûter des secondes, pas de
  // la patience. Un niveau écrit à la main en pose un par salle ; les zones
  // tirées au sort n'en ont aucun et repartent du seuil, comme avant.
  for (const rp of zone.reprises) {
    if (rp.pris || Math.hypot(rp.x - joueur.x, rp.y - joueur.y) > CASE * 0.85) continue;
    rp.pris = true;
    zone.depart = { x: rp.x, y: rp.y };
    emettre(partie, rp.x, rp.y, '#ffe9a8', 10, 45);
    onde(partie, rp.x, rp.y, CASE * 1.5, '#ffe9a8');
    if (partie.premieres.reprise) {
      partie.premieres.reprise = false;
      montrerToast(partie, "Tu te souviendras d'être passé ici");
    }
  }

  // Les murmures : de la matière narrative posée exactement là où elle est
  // pertinente, et jamais en travers du chemin.
  for (const m of zone.murmures) {
    if (m.dit || Math.hypot(m.x - joueur.x, m.y - joueur.y) > CASE * 1.4) continue;
    m.dit = true;
    murmurer(partie, m.x, m.y - CASE * 0.95, m.texte);
  }

  // Une âme qu'on ne peut pas encore rallumer laisse le joueur tourner autour
  // d'elle sans comprendre ce qu'elle attend. Elle le dit — une fois, et
  // seulement tant qu'on n'a pas de faisceau, c'est-à-dire tant que c'est vrai.
  if (!porteeFaisceau(joueur)) {
    for (const p of zone.persos) {
      if (p.emotion === EMOTIONS.COLERE || p.calme || p.livre || p.aDit) continue;
      if (Math.hypot(p.x - joueur.x, p.y - joueur.y) > CASE * 2.4) continue;
      p.aDit = true;
      murmurer(
        partie,
        p.x,
        p.y - D.taille * 1.9,
        ETEINTS[partie.numEteint++ % ETEINTS.length],
        '#8fd0ff',
        p,
      );
    }
  }

  // Regarder un bonhomme assez longtemps le calme — n'importe lequel, pas
  // seulement les peureux. Il passe au vert et SON FAISCEAU DEVIENT
  // PERMANENT : c'est ce qui donne enfin un rôle aux personnages non joués.
  // Une lampe qu'on gagne en la regardant, et qu'on choisit où allumer.
  for (const p of zone.persos) {
    if (p.emotion === EMOTIONS.COLERE || p.calme || p.livre || !p.eclaire) continue;
    p.compteCalme += dt;
    if (p.compteCalme > DUREE_CALME) {
      p.calme = true;
      p.suit = true;
      p.rang = zone.persos.filter((q) => q.suit).length; // sa place dans la file
      // Une âme ne paie QU'UNE FOIS. Paniquer et mourir remettent `calme` à
      // faux, donc recalmer la même âme repayait 6 d'éclat à chaque tour :
      // mesuré, une seule âme rapportait 30 d'éclat en cinq recalmages, sans
      // aucune limite. C'est ce qui faisait monter les formes bien plus vite
      // que le plafond d'une zone ne l'autorise. La récupérer reste gagnant —
      // on récupère sa cargaison et ses dix points de livraison.
      if (!p.prime) {
        p.prime = true;
        gagnerEclat(partie, 6);
      }
      emettre(partie, p.x, p.y - D.taille * 0.7, '#a8f0c8', 12, 80);
      // La règle, une fois. Ensuite ce sont eux qui parlent : une phrase
      // au-dessus de la tête, sans bouton, pendant qu'on continue de jouer.
      if (!partie.regleDite[p.emotion]) {
        partie.regleDite[p.emotion] = true;
        montrerToast(
          partie,
          p.emotion === EMOTIONS.PEUR
            ? 'Il te suit — mais seulement dans ta lumière'
            : 'Il te suit et éclaire devant lui',
        );
      }
      const pool = REPLIQUES[p.emotion];
      if (pool)
        murmurer(
          partie,
          p.x,
          p.y - D.taille * 1.9,
          pool[partie.numReplique++ % pool.length],
          '#a8f0c8',
          p,
        );
    }
  }

  // LA RÈGLE. Entrer dans le faisceau ne te fait pas repérer : ça met la
  // sentinelle en alerte, et une zone rouge se met à grandir depuis elle le
  // long de son cône. Tant que ce front ne t'a pas rattrapé, tu peux encore
  // sortir. S'il t'atteint — ou si tu la touches — c'est fini. La distance
  // fait donc le délai toute seule, sans aucune formule.
  if (joueur.repit > 0) joueur.repit -= dt;
  const abri = aLAbri(zone, joueur.x, joueur.y);
  joueur.abri = abri; // lu par le visage : voir `humeurDuJoueur`
  // Calculé UNE fois par image et non par sentinelle : la question ne dépend
  // que de la position de l'âme, pas de qui la regarde.
  for (const q of zone.persos) {
    q.abri = q.emotion !== EMOTIONS.COLERE && q.suit && !q.livre && aLAbri(zone, q.x, q.y);
  }
  // quelques motes tièdes qui montent : le calme a son bruit de fond
  if (abri && partie.hasard() < dt * 7) {
    emettre(
      partie,
      joueur.x + (partie.hasard() - 0.5) * D.taille * 1.4,
      joueur.y + D.taille * 0.3,
      '#ffd9a0',
      1,
      30,
    );
  }
  let pire = 0,
    traque = false;

  for (const p of zone.persos) {
    if (p.emotion !== EMOTIONS.COLERE || p.livre) continue;

    // Hystérésis sur l'abri : une sentinelle arrêtée pile au bord d'une braise
    // basculait alerte / pas alerte plusieurs fois par seconde. Elle entre
    // dans l'état « gênée » plus loin qu'elle n'en sort.
    // Pendant qu'elle va voir un bruit, elle ne cherche plus personne. C'est
    // tout l'intérêt du caillou : il ne détourne pas seulement son regard, il
    // lui fait lâcher ce qu'elle tenait.
    p.gene =
      p.aveugle > 0 ||
      p.curieuxT > 0 ||
      prochedUneBraise(zone, p.x, p.y, p.gene ? 1.12 : 0.95);

    const d = Math.hypot(joueur.x - p.x, joueur.y - p.y);
    if (d < D.taille && joueur.repit <= 0 && p.aveugle <= 0) {
      eteindre(partie);
      return;
    }

    // Ce que la sentinelle peut voir : toi ET ton convoi. C'est le cœur de
    // l'arbitrage — chaque âme que tu escortes est une silhouette de plus
    // dans le faisceau, et la jauge monte d'autant plus vite.
    const exposable = (q: { x: number; y: number }) =>
      !p.gene &&
      p.cligne <= 0 &&
      Math.hypot(q.x - p.x, q.y - p.y) <= PORTEE_VUE &&
      dansLeCone(p.x, p.y, p.regard, q.x, q.y, PORTEE_VUE, 0.42) &&
      vueLibre(zone, p.x, p.y, q.x, q.y);

    // Voilé couvre le convoi autant que le joueur : c'est ce qui en fait un
    // bonus d'escorte, et c'est le seul moment du jeu où l'on peut traverser
    // un faisceau à cinq sans rien perdre.
    const voile = aBonus(joueur, 'souffle');
    const joueurVu = !voile && !abri && joueur.repit <= 0 && exposable(joueur);
    const convoi = voile
      ? []
      : zone.persos.filter((q) => q.suit && !q.livre && !q.abri && exposable(q));
    const corps = (joueurVu ? 1 : 0) + convoi.length;
    p.corpsVus = corps; // exposé pour les mesures

    if (corps > 0) {
      traque = true;
      p.alerte = 2.8; // elle se doute, elle n'a pas vu
      p.charge = Math.min(1, p.charge + 0.34 * corps * dt);

      // Le front rouge rattrape quelqu'un : le joueur est éliminé, mais un
      // membre du convoi PANIQUE seulement. On perd la cargaison, pas la
      // partie — un échec qui coûte du temps plutôt qu'une punition sèche.
      const front = p.charge * PORTEE_VUE;
      if (joueurVu && front >= d) {
        eteindre(partie);
        return;
      }
      for (const q of convoi) {
        if (front < Math.hypot(q.x - p.x, q.y - p.y)) continue;
        paniquer(partie, q);
      }
    } else {
      const cache = !vueLibre(zone, p.x, p.y, joueur.x, joueur.y);
      p.charge = Math.max(0, p.charge - (cache ? 0.7 : 0.45) * dt);
    }
    pire = Math.max(pire, p.charge);
  }

  // Le halo suit la jauge la plus pleine : la lumière rétrécit à mesure qu'une
  // sentinelle te verrouille, et revient quand tu lui échappes. Une seule
  // idée, deux lectures.
  // Le caillou ne sert que si on se souvient qu'il existe au moment où il
  // servirait. Quand un regard commence à nous tenir, le bouton se signale —
  // trois fois par partie au plus, et jamais deux fois sans être ressorti du
  // danger entre-temps.
  if (pire > 0.28 && !partie.nudgeArme && partie.nudgeCaillou < 3) {
    partie.nudgeArme = true;
    partie.nudgeCaillou++;
    partie.signaux.caillou++;
  } else if (pire < 0.05) partie.nudgeArme = false;

  joueur.souffle = 1 - pire;
  joueur.vu += ((traque ? 1 : 0) - joueur.vu) * Math.min(1, 6 * dt);
  // Ce que TOUT LE MONDE ressent : être dans un faisceau, ou simplement
  // savoir qu'un rouge cherche. C'est ce drapeau qui met la peur sur les
  // visages, celui du joueur comme ceux du convoi.
  partie.menace =
    traque ||
    zone.persos.some(
      (p) => p.emotion === EMOTIONS.COLERE && !p.livre && p.aveugle <= 0 && p.alerte > 0,
    );
  if (traque && partie.hasard() < dt * 6) {
    emettre(partie, joueur.x, joueur.y - D.taille * 0.75, '#ff7a6b', 1, 40, 'trait');
  }

  if (joueur.bonus && joueur.bonusT > 0) {
    const leBonus = BONUS[joueur.bonus];
    joueur.bonusT -= dt;
    // traînée continue à la couleur du bonus : on voit qu'il est actif même
    // sans regarder la barre du haut
    if (partie.hasard() < dt * 14) {
      emettre(
        partie,
        joueur.x + (partie.hasard() - 0.5) * D.taille,
        joueur.y + (partie.hasard() - 0.5) * D.taille,
        leBonus.couleur,
        1,
        18,
      );
    }
    if (joueur.bonusT <= 0) joueur.bonus = null; // sa jauge se vide, c'est assez
  }

  // Les galets reviennent un par un, au rythme du palier atteint.
  const rang = rangCaillou(joueur);
  if (joueur.galets < rang.reserve) {
    joueur.caillouDispo += dt / rang.delai;
    if (joueur.caillouDispo >= 1) {
      joueur.galets++;
      joueur.caillouDispo = 0;
    }
  } else joueur.caillouDispo = 0;

  // Livraison : tout membre du convoi qui touche le portail y entre.
  for (const q of zone.persos) {
    if (!q.suit || q.livre) continue;
    if (Math.hypot(zone.sortie.x - q.x, zone.sortie.y - q.y) > zone.sortie.r) continue;
    q.livre = true;
    q.suit = false;
    zone.sortie.ames++;
    gagnerEclat(partie, 10);
    emettre(partie, zone.sortie.x, zone.sortie.y, '#ffe9a8', 16, 110);
    onde(partie, zone.sortie.x, zone.sortie.y, CASE * 2.6, '#ffe9a8');
    montrerToast(
      partie,
      zone.sortie.ames >= zone.requis
        ? 'Le portail est chargé — entre'
        : `Âme livrée — ${zone.sortie.ames}/${zone.requis}`,
    );
  }

  // On attend que le convoi soit RENTRÉ avant de changer de zone : le joueur
  // arrive au portail en même temps que ses suiveurs, et sans cette attente
  // les âmes amenées en plus du quota restaient dehors et étaient perdues.
  const enAspiration = zone.persos.some(
    (q) =>
      q.suit &&
      !q.livre &&
      Math.hypot(zone.sortie.x - q.x, zone.sortie.y - q.y) < CASE * 2.6,
  );
  if (
    zone.sortie.ames >= zone.requis &&
    !enAspiration &&
    Math.hypot(zone.sortie.x - joueur.x, zone.sortie.y - joueur.y) < zone.sortie.r
  ) {
    ouvrirLeSeuil(partie);
  }
}
