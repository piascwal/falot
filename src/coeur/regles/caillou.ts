/**
 * Le caillou. La seule arme du jeu, et elle ne brille pas.
 *
 * « La pierre ne brille pas ; ce que Falot y laisse, si. » Là où elle tombe, ça
 * fait pendant quelques secondes une autre petite lumière seule dans le noir —
 * c'est-à-dire exactement ce qu'un Guet passe son existence à attendre. Il ne
 * se détourne pas d'un bruit : il se détourne d'un leurre qui lui ressemble
 * plus que toi.
 *
 * Le geste ne change jamais d'un palier à l'autre. Ce qu'il emporte, si.
 */

import { CASE, D } from '../dimensions.js';
import { EMOTIONS } from '../formes.js';
import { TAU } from '../geometrie.js';
import { aBonus, rangCaillou } from '../lectures.js';
import { solide } from '../monde/grille.js';
import { emettre, onde } from '../particules.js';
import type { CaillouVol, Partie } from '../types.js';
import { montrerToast } from '../voix.js';

export function lancerCaillou(partie: Partie, angle?: number, portion?: number): void {
  const { joueur, zone } = partie;
  if (joueur.galets <= 0) return;
  if (!aBonus(joueur, 'galet')) joueur.galets--; // poche intarissable
  const a = angle === undefined ? joueur.regard : angle;
  const portee = CASE * (1.6 + (portion === undefined ? 1 : portion) * 4.4);
  // il s'arrête au premier mur : un caillou ne traverse pas la pierre
  let d = CASE * 0.4;
  while (
    d < portee &&
    !solide(
      zone,
      Math.floor((joueur.x + Math.cos(a) * d) / CASE),
      Math.floor((joueur.y + Math.sin(a) * d) / CASE),
    )
  )
    d += CASE * 0.2;
  d = Math.max(CASE * 0.6, d - CASE * 0.25);
  partie.cailloux.push({
    x0: joueur.x,
    y0: joueur.y,
    x1: joueur.x + Math.cos(a) * d,
    y1: joueur.y + Math.sin(a) * d,
    x: joueur.x,
    y: joueur.y,
    t: 0,
    duree: 0.34 + d / (CASE * 16),
    hauteur: 0,
    rang: rangCaillou(joueur),
  });
}

export function majCailloux(partie: Partie, dt: number): void {
  for (let i = partie.traces.length - 1; i >= 0; i--) {
    partie.traces[i].t += dt;
    if (partie.traces[i].t >= partie.traces[i].duree) partie.traces.splice(i, 1);
  }
  for (let i = partie.cailloux.length - 1; i >= 0; i--) {
    const c = partie.cailloux[i];
    c.t += dt;
    const k = Math.min(1, c.t / c.duree);
    c.x = c.x0 + (c.x1 - c.x0) * k;
    c.y = c.y0 + (c.y1 - c.y0) * k;
    c.hauteur = Math.sin(k * Math.PI) * CASE * 0.55; // l'arc de cercle
    if (k < 1) continue;
    partie.cailloux.splice(i, 1);
    toucherLeSol(partie, c);
  }
}

// Le caillou retombe. Ce qu'il déclenche dépend du palier atteint, mais le
// geste, lui, n'a jamais changé depuis la première seconde de jeu.
export function toucherLeSol(
  partie: Partie,
  c: Pick<CaillouVol, 'x1' | 'y1' | 'rang'>,
): void {
  const { zone } = partie;
  const r = c.rang;
  const teinte = r.eclate ? '#fff2c4' : r.couve ? '#ffc478' : '#b2bacc';
  onde(partie, c.x1, c.y1, CASE * (r.eclate ? 6 : 3.2), teinte);
  emettre(partie, c.x1, c.y1, teinte, r.eclate ? 26 : 7, r.eclate ? 200 : 45);

  // Ce que Falot avait laissé dessus reste là un moment : une petite lueur
  // posée, qu'on voit de loin. C'est ce qui rend le jet lisible quand on lance
  // dans le noir, et c'est ce qui attire le regard.
  partie.traces.push({ x: c.x1, y: c.y1, t: 0, duree: r.couve ? 1.2 : 3.4 });

  // il se met à brûler : c'est l'abri du Veilleur, posé à distance
  if (r.couve)
    zone.braises.push({ x: c.x1, y: c.y1, r: CASE * 2.3, phase: partie.hasard() * TAU });

  // Un caillou ne fait rien à la pierre saine. Sur une pierre déjà fendue, il
  // finit le travail : c'est le seul moyen d'ouvrir ces passages-là, et ça
  // donne au caillou un usage qui ne dépend d'aucune sentinelle.
  briserAutour(partie, c.x1, c.y1);

  for (const p of zone.persos) {
    if (p.emotion !== EMOTIONS.COLERE) continue;
    const d = Math.hypot(p.x - c.x1, p.y - c.y1);
    // l'éclat aveugle toute la salle, le coup au but n'étourdit que sa cible
    if (r.eclate && d <= CASE * 6) {
      p.aveugle = 5;
      p.alerte = 0;
      p.route = null;
      continue;
    }
    if (r.frappe && d <= CASE * 0.85) {
      p.aveugle = Math.max(p.aveugle, 2.6);
      p.alerte = 0;
      p.route = null;
      continue;
    }
    if (p.aveugle > 0) continue; // déjà étourdie
    // Un caillou s'entend de loin. À cinq cases et demie, on le lançait
    // souvent sans que personne ne bouge, et le leurre passait pour inutile.
    if (d > CASE * 9) continue;
    // ELLE OUBLIE TOUT. Alerte, jauge, poursuite : la pierre efface tout ça et
    // elle part au bruit. Un leurre qui ne marche que sur une sentinelle au
    // repos ne sert à rien au moment où l'on en a besoin.
    p.curiosite = { x: c.x1, y: c.y1 };
    p.curieuxT = 4.8;
    p.alerte = 0;
    p.charge = 0;
    p.enAlerte = false;
    p.route = null;
    emettre(partie, p.x, p.y - D.taille * 0.8, '#b2bacc', 3, 40);
  }
  if (r.eclate) montrerToast(partie, "Éclat — les Guets n'ont plus rien à distinguer");
}

/* ==================================================== rendu ============ */

// La pierre fêlée cède quand un caillou tombe à côté d'elle. Le jet s'arrête
// toujours AVANT le premier mur, donc viser la fissure fait tomber le caillou
// sur la case d'à côté : une case de tolérance suffit, et elle évite de
// demander une précision au pixel.
export function briserAutour(partie: Partie, x: number, y: number): void {
  const { zone } = partie;
  const cx = Math.floor(x / CASE),
    cy = Math.floor(y / CASE);
  for (const f of zone.fissures) {
    if (f.casse > 0) continue;
    if (Math.abs(f.cx - cx) + Math.abs(f.cy - cy) > 1) continue;
    f.casse = 0.001;
    zone.mur[f.cy][f.cx] = 0;
    // `solide` vient de changer : les ombres portées des torches et des
    // braises sont à recalculer, exactement comme à l'ouverture d'une porte.
    zone.versionPortes++;
    onde(partie, f.x, f.y, CASE * 2.9, '#cdd3e0');
    emettre(partie, f.x, f.y, '#9aa1ac', 24, 140);
    emettre(partie, f.x, f.y, '#6f7686', 14, 70);
  }
}
