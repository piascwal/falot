/**
 * Les personnages : les deux couleurs de lumières, et les Guets.
 *
 * Un Guet est une SENTINELLE : il ne te voit que dans son cône, donc on peut le
 * contourner, passer dans son dos, attendre que son balayage s'éloigne. Sa
 * jauge, son alerte et sa mort à toi sont posées par `majRegles` — ici il ne
 * fait que se déplacer et regarder.
 */

import { CASE, D, PORTEE_VUE } from '../dimensions.js';
import { EMOTIONS, HUMEURS, humeurSelon } from '../formes.js';
import { clamp, ecartAngle } from '../geometrie.js';
import { dansLeCone, degager, routeVers, vueLibre } from '../monde/grille.js';
import { emettre } from '../particules.js';
import type { Partie, Perso, Point } from '../types.js';
import { suivre } from './convoi.js';
import { majJelly } from './joueur.js';

/**
 * LE TRAQUEUR SUIT LE FIL. Il ne cherche pas le joueur : il cherche sa trace,
 * et il la remonte du plus ancien vers le plus récent — donc il finit là où on
 * vient de passer. Il accroche la trace la plus RÉCENTE à sa portée : sinon il
 * repartait au début du fil et refaisait tout l'étage.
 *
 * Quand le fil se coupe — le joueur a soufflé sa lumière — il ne reste rien à
 * suivre : il va voir l'endroit de la coupure, et c'est tout ce qu'il saura.
 */
const PORTEE_PISTE = CASE * 2.5;

function suivrePiste(partie: Partie, p: Perso, dt: number): void {
  const fil = partie.fil;
  let vise: Point | null | undefined = fil[p.piste];
  if (p.piste < 0 || vise === undefined) {
    p.piste = -1;
    for (let i = fil.length - 1; i >= 0; i--) {
      const q = fil[i];
      if (!q) continue;
      if (Math.hypot(q.x - p.x, q.y - p.y) > PORTEE_PISTE) continue;
      p.piste = i;
      break;
    }
    vise = p.piste < 0 ? undefined : fil[p.piste];
  }
  if (!vise) {
    // plus rien à suivre : il tient sa place et balaye large
    p.route = null;
    p.phase += 1.1 * dt;
    p.regard += ecartAngle(p.regard, p.regardRepos + Math.sin(p.phase) * 1.1) * 2.6 * dt;
    p.humeur = HUMEURS.INTRIGUE;
    return;
  }
  const dx = vise.x - p.x,
    dy = vise.y - p.y;
  const d = Math.hypot(dx, dy) || 1;
  if (d < CASE * 0.5) {
    // point suivant ; une coupure veut dire que la trace s'arrête là
    const apres = fil[p.piste + 1];
    if (apres === null) {
      p.curiosite = { x: vise.x, y: vise.y };
      p.curieuxT = 2.6;
      p.piste = -1;
      p.route = null;
      return;
    }
    p.piste++;
    return;
  }
  if (!p.route?.length) p.route = routeVers(partie.zone, p.x, p.y, vise.x, vise.y, true);
  let rx = dx,
    ry = dy;
  if (p.route?.length) {
    const w = p.route[0];
    const wx = w.x - p.x,
      wy = w.y - p.y;
    if (Math.hypot(wx, wy) < CASE * 0.45) p.route.shift();
    else {
      rx = wx;
      ry = wy;
    }
  }
  const rd = Math.hypot(rx, ry) || 1;
  // plus lent qu'une ronde : il est patient, pas rapide. On doit pouvoir le
  // distancer — ce qu'on ne peut pas faire, c'est le semer sans s'éteindre.
  p.vx += (rx / rd) * 330 * dt;
  p.vy += (ry / rd) * 330 * dt;
  p.phase += 1.4 * dt;
  const cap = Math.atan2(ry, rx) + Math.sin(p.phase) * 0.35;
  p.regard += ecartAngle(p.regard, cap) * Math.min(1, 6 * dt);
  p.humeur = HUMEURS.ACHARNE;
}

export function majPersos(partie: Partie, dt: number, eclaires: Set<Perso>): void {
  const { joueur, zone } = partie;
  const demi = D.taille * 0.5;
  for (const p of zone.persos) {
    if (p.livre) continue; // absorbé par le portail
    p.eclaire = eclaires.has(p);
    if (p.aveugle > 0) p.aveugle -= dt;
    if (p.emotion === EMOTIONS.COLERE) {
      p.cligne = (p.cligne || 0) - dt;
      p.prochainCligne -= dt;
      if (p.prochainCligne <= 0) {
        p.cligne = 0.42;
        p.prochainCligne = 2.2 + partie.hasard() * 3.6;
      }
    }
    if (p.fuit > 0) p.fuit -= dt;
    const dx = joueur.x - p.x,
      dy = joueur.y - p.y;
    const d = Math.hypot(dx, dy) || 1;
    // Un peureux ou un curieux te remarque de partout : ils ne te chassent pas.
    // Un coléreux, lui, est une SENTINELLE : il ne te voit que dans son cône.
    const voit =
      p.emotion === EMOTIONS.COLERE
        ? dansLeCone(p.x, p.y, p.regard, joueur.x, joueur.y, PORTEE_VUE, 0.42) &&
          vueLibre(zone, p.x, p.y, joueur.x, joueur.y)
        : d < CASE * 5 && vueLibre(zone, p.x, p.y, joueur.x, joueur.y);

    // Une lumière ne porte pas une humeur de naissance : elle porte celle de la
    // situation, exactement comme le joueur. Calculée avant son déplacement,
    // donc sur la vitesse de l'image précédente — un retard invisible.
    // Une lumière à l'abri porte le même visage apaisé que Falot : d'un coup
    // d'œil on voit lesquels de ses suiveurs sont couverts et lesquels
    // dépassent de la lumière.
    if (p.emotion !== EMOTIONS.COLERE) {
      p.humeur = p.abri
        ? HUMEURS.APAISE
        : humeurSelon(p, partie.menace || p.fuit > 0, p.calme);
    }

    if (p.emotion === EMOTIONS.CURIEUX) {
      if (p.calme) {
        suivre(partie, p, dt);
      } else {
        p.phase += p.balayage * (p.eclaire ? 0.18 : 1) * dt;
        p.regard = p.regardRepos + Math.sin(p.phase) * p.amplitude;
      }
    } else if (p.farouche && !p.calme) {
      // LA FAROUCHE. Ce n'est pas de toi qu'elle a peur, c'est de ta lumière :
      // tant que tu brilles, elle recule d'autant que tu avances. Éteins-toi
      // et elle te laisse approcher — c'est la seule façon de la reprendre.
      const trop = !partie.joueur.eteint && voit && d < CASE * 3.4;
      if (trop) {
        p.vx -= (dx / d) * 340 * dt;
        p.vy -= (dy / d) * 340 * dt;
        p.regard = Math.atan2(-dy, -dx);
        p.fuit = 0.5;
        if (partie.hasard() < dt * 3)
          emettre(partie, p.x, p.y - D.taille * 0.7, '#8fd0ff', 1, 24);
      } else {
        p.vx += (p.baseX - p.x) * 1.1 * dt;
        p.vy += (p.baseY - p.y) * 1.1 * dt;
        p.phase += p.balayage * 0.5 * dt;
        p.regard = p.regardRepos + Math.sin(p.phase) * 0.5;
      }
    } else if (p.emotion === EMOTIONS.PEUR) {
      if (p.calme) {
        suivre(partie, p, dt);
      } else if (voit && d < CASE * 2.6) {
        p.vx -= (dx / d) * 300 * dt;
        p.vy -= (dy / d) * 300 * dt;
        p.regard = Math.atan2(-dy, -dx);
        p.fuit = 0.6; // il a peur de TOI, pas des rouges
        if (partie.hasard() < dt * 3)
          emettre(partie, p.x, p.y - D.taille * 0.7, '#8fd0ff', 1, 26);
      } else {
        p.vx += (p.baseX - p.x) * 1.6 * dt;
        p.vy += (p.baseY - p.y) * 1.6 * dt;
        p.phase += p.balayage * 0.5 * dt;
        p.regard = p.regardRepos + Math.sin(p.phase) * 0.5;
      }
    } else {
      // SENTINELLE. Elle fait sa ronde et balaye du regard. Elle ne te
      // détecte QUE si tu entres dans son cône — donc on peut la contourner,
      // passer dans son dos, attendre que son balayage s'éloigne. La laisse
      // reste : sans elle, un seul rouge suivait le joueur à travers toute la
      // zone et le revidait à chaque réapparition.
      // La laisse : sans elle, un seul rouge suivait le joueur à travers toute
      // la zone. Un traqueur n'en a pas — c'est précisément son métier de
      // quitter son poste, et il est assez lent pour qu'on le distance.
      const loin = !p.traqueur && Math.hypot(p.x - p.baseX, p.y - p.baseY) > CASE * 5.5;
      if (p.alerte > 0) p.alerte -= dt; // l'alerte est posée par majRegles
      if (p.gene) p.alerte = 0;

      // LE BRUIT PASSE AVANT TOUT. Une pierre qui tombe à portée lui fait
      // oublier ce qu'elle était en train de faire, alerte comprise : elle se
      // tourne et elle y va. C'est la seule arme du début du jeu, elle ne peut
      // pas dépendre de l'humeur où on la surprend.
      if (p.curiosite && p.curieuxT > 0) {
        p.enAlerte = false;
        p.curieuxT -= dt;
        const cd = Math.hypot(p.curiosite.x - p.x, p.curiosite.y - p.y);
        if (cd < CASE * 0.8 || p.curieuxT <= 0) {
          p.curiosite = null;
          p.route = null;
          p.curieuxT = 0;
        } else {
          if (!p.route?.length)
            p.route = routeVers(zone, p.x, p.y, p.curiosite.x, p.curiosite.y, true);
          // Pas de chemin — la pierre est tombée derrière une porte, ou dans un
          // recoin qu'elle ne peut pas atteindre : elle y va quand même, tout
          // droit. Mieux vaut qu'elle bute contre un mur en regardant ailleurs
          // que de rester plantée comme si elle n'avait rien entendu.
          let vx = p.curiosite.x - p.x,
            vy = p.curiosite.y - p.y;
          if (!p.route?.length) {
            const vd = Math.hypot(vx, vy) || 1;
            p.vx += (vx / vd) * 300 * dt;
            p.vy += (vy / vd) * 300 * dt;
          }
          if (p.route?.length) {
            const w = p.route[0];
            const rx = w.x - p.x,
              ry = w.y - p.y,
              rd = Math.hypot(rx, ry) || 1;
            if (rd < CASE * 0.45) p.route.shift();
            else {
              p.vx += (rx / rd) * 430 * dt;
              p.vy += (ry / rd) * 430 * dt;
              vx = rx;
              vy = ry;
            }
          }
          // elle REGARDE où elle va : sans ça son cône restait braqué sur le
          // couloir d'avant et on ne voyait pas qu'elle s'était détournée
          // `ecartAngle(a, b)` rend b moins a : pour tourner le regard VERS la
          // cible, c'est (regard, cible) et pas l'inverse. À l'envers, elle se
          // détournait du bruit tout en marchant dessus — mesuré à 171 degrés.
          const vise = Math.atan2(vy, vx);
          p.regard += ecartAngle(p.regard, vise) * Math.min(1, 7 * dt);
        }
        p.humeur = HUMEURS.INTRIGUE;
      } else if (p.alerte > 0) {
        // EN ALERTE, IL VA VOIR. Il a détecté de la lumière quelque part — un
        // corps dans son cône, ou le faisceau du joueur qui l'a effleuré — et
        // il se rend à cet endroit-là. Il ne fonce pas sur le joueur : il va au
        // DERNIER endroit connu, et c'est au joueur de ne plus y être. Avant,
        // il fouillait au hasard dans la direction de son regard, et on pouvait
        // attendre à trois cases sans qu'il ne vienne jamais.
        if (!p.enAlerte) {
          p.enAlerte = true;
          p.capAlerte = p.regard;
          p.phase = 0;
          p.route = null;
        }
        const su = p.derniereVue;
        if (su && !loin) {
          const sd = Math.hypot(su.x - p.x, su.y - p.y);
          if (sd < CASE * 0.8) {
            // arrivé sur place et personne : il fouille les environs
            p.derniereVue = null;
            p.route = null;
          } else {
            if (!p.route?.length) p.route = routeVers(zone, p.x, p.y, su.x, su.y, true);
            let vx = su.x - p.x;
            let vy = su.y - p.y;
            if (p.route?.length) {
              const w = p.route[0];
              const rx = w.x - p.x,
                ry = w.y - p.y,
                rd = Math.hypot(rx, ry) || 1;
              if (rd < CASE * 0.45) p.route.shift();
              else {
                vx = rx;
                vy = ry;
              }
            }
            const vd = Math.hypot(vx, vy) || 1;
            p.vx += (vx / vd) * 380 * dt;
            p.vy += (vy / vd) * 380 * dt;
            // il regarde où il va, et balaye un peu autour
            p.phase += 1.5 * dt;
            const vise = Math.atan2(vy, vx) + Math.sin(p.phase) * 0.35;
            p.regard += ecartAngle(p.regard, vise) * Math.min(1, 7 * dt);
          }
        } else {
          // Il se doute, mais il n'a rien vu : il RESTE où il est et balaye à
          // gauche et à droite, autour de la direction qu'il tenait. Il ne se
          // retourne pas vers le joueur — c'est ce qui laisse le temps de
          // s'écarter, ou de lancer une pierre.
          p.route = null;
          p.phase += 1.5 * dt;
          p.regard = p.capAlerte + Math.sin(p.phase) * 0.9;
        }
        p.humeur = HUMEURS.ACHARNE; // il cherche, et ça se voit
        if (partie.hasard() < dt * 4)
          emettre(partie, p.x, p.y - D.taille * 0.75, '#ff7a6b', 1, 34, 'trait');
      } else {
        p.enAlerte = false;
        p.derniereVue = null;
        // ronde : elle va d'un point de passage au suivant, et le regard
        // balaye autour de sa direction de marche
        // elle recule jusqu'à être NETTEMENT hors de la braise : s'arrêter à
        // sa frontière la faisait osciller entre gênée et pas gênée
        // Une braise au sol, ou la torche que Falot tient à bout de bras : un
        // Guet n'approche jamais d'une flamme plus grande que lui.
        const torche = joueur.torche;
        const b =
          zone.braises.find((q) => Math.hypot(q.x - p.x, q.y - p.y) < q.r * 1.3) ??
          (torche &&
          torche.reste > 0 &&
          Math.hypot(torche.x - p.x, torche.y - p.y) < torche.r
            ? torche
            : undefined);
        if (b) {
          const bx = p.x - b.x,
            by = p.y - b.y,
            bd = Math.hypot(bx, by) || 1;
          p.vx += (bx / bd) * 300 * dt;
          p.vy += (by / bd) * 300 * dt;
          p.humeur = HUMEURS.INTRIGUE;
        } else if (p.traqueur) {
          suivrePiste(partie, p, dt);
        } else if (p.ronde?.length) {
          const c = p.ronde[p.etape % p.ronde.length];

          // détecteur de blocage : si elle n'avance plus, elle recalcule
          // plutôt que de pousser contre la pierre
          p.immobile =
            Math.hypot(p.x - (p.dernierX || 0), p.y - (p.dernierY || 0)) < 0.4
              ? (p.immobile || 0) + dt
              : 0;
          p.dernierX = p.x;
          p.dernierY = p.y;

          if (Math.hypot(c.x - p.x, c.y - p.y) < CASE * 0.6) {
            // arrivée : on passe au point suivant, une seule fois
            p.etape++;
            p.route = null;
            p.immobile = 0;
          } else {
            if (!p.route?.length || p.immobile > 1.1) {
              p.route = routeVers(zone, p.x, p.y, c.x, c.y, true);
              p.immobile = 0;
            }
            // Un chemin vide alors qu'on n'est PAS arrivé veut dire que la
            // cible est dans notre propre case : le parcours en largeur n'a
            // rien à renvoyer. On y va alors en ligne droite — c'est sans
            // risque à cette distance. Sans ce cas, la sentinelle sautait au
            // point suivant à chaque frame et ne partait jamais nulle part.
            const w = p.route?.length ? p.route[0] : c;
            const rx = w.x - p.x,
              ry = w.y - p.y;
            const rd = Math.hypot(rx, ry) || 1;
            if (p.route?.length && rd < CASE * 0.45) p.route.shift();
            else {
              p.vx += (rx / rd) * 430 * dt;
              p.vy += (ry / rd) * 430 * dt;
            }
            p.cap = Math.atan2(ry, rx);
          }
          p.humeur = p.aveugle > 0 ? HUMEURS.INTRIGUE : HUMEURS.ACHARNE;
        }
        p.phase += p.balayage * 0.8 * dt;
        const cap = p.cap === undefined ? p.regardRepos : p.cap;
        p.regard += ecartAngle(p.regard, cap + Math.sin(p.phase) * 0.9) * 3.2 * dt;
      }

      // aveuglée : elle ferme les yeux et stresse
      if (p.aveugle > 0 && partie.hasard() < dt * 9) {
        emettre(
          partie,
          p.x + (partie.hasard() - 0.5) * D.taille,
          p.y - D.taille * 0.8,
          partie.hasard() < 0.5 ? '#ffffff' : '#ff7a6b',
          1,
          30,
        );
      }
    }

    const f = 0.0016 ** dt;
    p.vx *= f;
    p.vy *= f;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.x = clamp(p.x, demi, zone.largeur - demi);
    p.y = clamp(p.y, demi, zone.hauteur - demi);
    degager(zone, p, demi, p.emotion === EMOTIONS.COLERE);

    // séparation d'avec le joueur : un rouge logé dedans est illisible
    const sx = p.x - joueur.x,
      sy = p.y - joueur.y;
    const sd = Math.hypot(sx, sy);
    const mini = D.taille * 0.95;
    if (sd > 0.01 && sd < mini) {
      const k = (mini - sd) * 0.5;
      p.x += (sx / sd) * k;
      p.y += (sy / sd) * k;
      joueur.x -= (sx / sd) * k;
      joueur.y -= (sy / sd) * k;
      degager(zone, joueur, demi);
      // Toucher une sentinelle est fatal (voir majRegles) ; ici on se contente
      // de la réveiller, pour le cas où elle serait aveuglée.
      if (p.emotion === EMOTIONS.COLERE) {
        p.alerte = 2.8;
        p.route = null;
      }
    }

    majJelly(p, dt);
  }
}
