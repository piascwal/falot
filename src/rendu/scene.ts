/**
 * UNE IMAGE, dans l'ordre.
 *
 * L'ordre des passes est le rendu lui-même, et il ne se déduit d'aucune règle :
 * le sol, les sources chaudes, le portail, les corps, puis le VOILE
 * d'obscurité percé de tous les trous de lumière, puis ce qui doit rester
 * visible par-dessus le noir (le fil, les lueurs déjà vues, les yeux), puis les
 * halos additifs, et enfin les gestes de la main.
 *
 * Cette fonction ne décide RIEN : elle ne fait que lire la partie. Les seules
 * écritures sont les caches de rayons posés sur les entités (`p.rayonsVue` et
 * compagnie), et c'est assumé — ce sont des caches de rendu, pas de l'état de
 * jeu.
 */

import { rgba } from '../coeur/couleurs.js';
import { CASE, D, PORTEE_VUE } from '../coeur/dimensions.js';
import { BONUS, COULEURS, DUREE_CALME, EMOTIONS, RALLUME } from '../coeur/formes.js';
import { clamp, TAU } from '../coeur/geometrie.js';
import {
  aBonus,
  coneFaisceau,
  forme,
  humeurDuJoueur,
  porteeFaisceau,
  rayonHalo,
} from '../coeur/lectures.js';
import { vueLibre } from '../coeur/monde/grille.js';
import { estEclaire } from '../coeur/regles/lumiere.js';
import { decouper } from '../coeur/texte.js';
import type { Partie, Perso } from '../coeur/types.js';
import { type Ecran, QLUM } from './ecran.js';
import { dessinerManche, dessinerVisee } from './gestes.js';
import {
  percerCone,
  percerDisque,
  percerRond,
  portéesCone,
  portéesRond,
  raccourcir,
  rayonsSource,
  tracerCone,
  tracerRond,
} from './lumiere.js';
import { dessinerSol } from './sol.js';
import { flecheVers, texteCerne } from './texte.js';
import { dessinerTorche } from './torches.js';
import { dessinerVidange } from './vidange.js';
import { dessinerTete } from './visages.js';

function preparerRayons(
  ecran: Ecran,
  partie: Partie,
  eclaires: Set<Perso>,
  portee: number,
  cone: number,
): void {
  const { joueur, zone } = partie;
  const { cam, W, H } = ecran;
  if (portee)
    joueur.rayons = portéesCone(zone, joueur.x, joueur.y, joueur.regard, portee, cone);
  for (const p of eclaires) {
    p.rayonsRelais = portéesCone(zone, p.x, p.y, p.regard, D.portee * 5, D.cone + 0.05);
  }
  for (const p of zone.persos) {
    p.rayonsVue = null;
    if (p.emotion !== EMOTIONS.COLERE || p.aveugle > 0 || p.cligne > 0) continue;
    const traque = p.alerte > 0 || p.charge > 0.04;
    if (Math.hypot(p.x - joueur.x, p.y - joueur.y) > CASE * (traque ? 8 : 4.2)) continue;
    // hors écran : inutile de lancer les rayons ni de peindre quoi que ce soit
    const ex = p.x - cam.x,
      ey = p.y - cam.y,
      marge = PORTEE_VUE;
    if (ex < -marge || ey < -marge || ex > W + marge || ey > H + marge) continue;
    p.rayonsVue = portéesCone(zone, p.x, p.y, p.regard, PORTEE_VUE, 0.42);
  }
}

export function dessiner(ecran: Ecran, partie: Partie, temps: number): void {
  const { ctx, lctx, cam, W, H } = ecran;
  const { joueur, zone } = partie;
  const eclaires = partie.eclaires;
  const f = forme(joueur);
  const r = rayonHalo(partie);
  const portee = porteeFaisceau(joueur);
  const cone = coneFaisceau(joueur);
  preparerRayons(ecran, partie, eclaires, portee, cone);

  ctx.fillStyle = '#08080e';
  ctx.fillRect(0, 0, W, H);

  const c0x = Math.max(0, Math.floor(cam.x / CASE));
  const c1x = Math.min(zone.cols - 1, Math.floor((cam.x + W) / CASE));
  const c0y = Math.max(0, Math.floor(cam.y / CASE));
  const c1y = Math.min(zone.lignes - 1, Math.floor((cam.y + H) / CASE));
  dessinerSol(ecran, partie, c0x, c1x, c0y, c1y);

  // --- torches murales ---
  for (const t of zone.torches) {
    if (t.reste <= 0) continue;
    const k = clamp(t.reste / (t.duree * 0.35), 0, 1);
    // la lueur chaude au sol, puis la torche elle-même par-dessus
    const h = (14 + Math.sin(temps * 9 + t.phase) * 3) * (0.5 + k * 0.5);
    const g = ctx.createRadialGradient(
      t.x - cam.x,
      t.y - cam.y,
      0,
      t.x - cam.x,
      t.y - cam.y,
      h * 1.9,
    );
    g.addColorStop(0, 'rgba(255,235,190,0.95)');
    g.addColorStop(1, 'rgba(255,140,50,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(t.x - cam.x, t.y - cam.y, h * 1.9, 0, TAU);
    ctx.fill();
    dessinerTorche(ecran, t, 0.35 + k * 0.65, temps);
  }

  // --- braises ---
  for (const b of zone.braises) {
    const s = 1 + Math.sin(temps * 5 + b.phase) * 0.12;
    const g = ctx.createRadialGradient(
      b.x - cam.x,
      b.y - cam.y,
      0,
      b.x - cam.x,
      b.y - cam.y,
      26 * s,
    );
    g.addColorStop(0, 'rgba(255,226,170,0.95)');
    g.addColorStop(1, 'rgba(255,150,60,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(b.x - cam.x, b.y - cam.y, 26 * s, 0, TAU);
    ctx.fill();
  }

  // --- sortie ---
  // Un anneau qui se REMPLIT, plus une encoche par âme demandée : on doit
  // pouvoir lire « il m'en manque une » d'un seul coup d'œil, sans compter.
  // La phrase passagère d'une livraison ne suffisait pas, elle s'efface.
  const ouverte = zone.sortie.ames >= zone.requis;
  const part = clamp(zone.sortie.ames / zone.requis, 0, 1);
  const pulse = 1 + Math.sin(temps * 3) * 0.07;
  const R = zone.sortie.r * pulse;
  ctx.save();
  ctx.translate(zone.sortie.x - cam.x, zone.sortie.y - cam.y);
  // le cercle vide, puis la part déjà chargée, en partant du haut
  ctx.strokeStyle = 'rgba(255,233,168,0.18)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, TAU);
  ctx.stroke();
  if (part > 0) {
    ctx.strokeStyle = ouverte ? '#ffe9a8' : 'rgba(255,233,168,0.85)';
    ctx.lineWidth = ouverte ? 4.5 : 3.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, 0, R, -Math.PI / 2, -Math.PI / 2 + TAU * part);
    ctx.stroke();
    ctx.lineCap = 'butt';
  }
  // les encoches : une par âme demandée, pour compter sans lire
  ctx.strokeStyle = 'rgba(8,8,14,0.85)';
  ctx.lineWidth = 2.5;
  for (let i = 0; i < zone.requis; i++) {
    const a = -Math.PI / 2 + (i / zone.requis) * TAU;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * (R - 5), Math.sin(a) * (R - 5));
    ctx.lineTo(Math.cos(a) * (R + 5), Math.sin(a) * (R + 5));
    ctx.stroke();
  }
  ctx.fillStyle = ouverte
    ? 'rgba(255,233,168,0.34)'
    : `rgba(255,233,168,${0.05 + part * 0.16})`;
  ctx.beginPath();
  ctx.arc(0, 0, zone.sortie.r * 0.5, 0, TAU);
  ctx.fill();
  // Le compte, écrit SUR le portail. L'anneau dit déjà « il en manque », mais
  // il ne dit pas de quoi : on peut rester devant sans comprendre qu'on le
  // charge avec des âmes. Deux chiffres suffisent à nommer la règle.
  ctx.textAlign = 'center';
  ctx.font = '700 15px system-ui, sans-serif';
  texteCerne(
    ecran,
    ouverte ? 'ENTRE' : `${zone.sortie.ames} / ${zone.requis}`,
    0,
    -R - 12,
    ouverte ? '#ffe9a8' : 'rgba(255,233,168,0.82)',
  );
  if (!ouverte) {
    ctx.font = '600 9px system-ui, sans-serif';
    texteCerne(ecran, 'ÂMES', 0, -R - 25, 'rgba(255,233,168,0.42)', 2.5);
  }
  ctx.restore();

  // --- lueurs ---
  for (const l of zone.lueurs) {
    if (l.prise) continue;
    const b = BONUS[l.type];
    const s = 1 + Math.sin(temps * 4 + l.phase) * 0.18;
    const g = ctx.createRadialGradient(
      l.x - cam.x,
      l.y - cam.y,
      0,
      l.x - cam.x,
      l.y - cam.y,
      13 * s,
    );
    g.addColorStop(0, rgba(b.couleur, 0.95));
    g.addColorStop(1, rgba(b.couleur, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(l.x - cam.x, l.y - cam.y, 13 * s, 0, TAU);
    ctx.fill();
    ctx.fillStyle = b.couleur;
    ctx.beginPath();
    if (l.type === 'eclat') ctx.arc(l.x - cam.x, l.y - cam.y, 4.5 * s, 0, TAU);
    else {
      // les spéciales sont des losanges
      const k = 6.5 * s;
      ctx.moveTo(l.x - cam.x, l.y - cam.y - k);
      ctx.lineTo(l.x - cam.x + k, l.y - cam.y);
      ctx.lineTo(l.x - cam.x, l.y - cam.y + k);
      ctx.lineTo(l.x - cam.x - k, l.y - cam.y);
    }
    ctx.fill();
  }

  // --- bonhommes, coléreux au-dessus ---
  const ordre = [...zone.persos]
    .filter((q) => !q.livre)
    .sort(
      (a, b) =>
        (a.emotion === EMOTIONS.COLERE ? 1 : 0) - (b.emotion === EMOTIONS.COLERE ? 1 : 0),
    );
  for (const p of ordre) {
    // Une âme qui a soufflé sa lumière GARDE SA COULEUR : elle est toujours
    // rallumée, elle cache seulement sa lueur. Ce qui disparaît, c'est le halo
    // et le trou qu'il faisait dans la nuit — pas elle.
    const couleur = p.calme ? RALLUME : COULEURS[p.emotion];
    const repere = p.emotion === EMOTIONS.COLERE && (p.alerte > 0 || p.charge > 0.04);
    // une âme en train d'être rallumée : on voit le niveau monter en elle
    const recharge =
      p.emotion === EMOTIONS.COLERE
        ? 0
        : p.calme
          ? 1
          : clamp((p.compteCalme || 0) / DUREE_CALME, 0, 1);
    dessinerTete(
      ecran,
      p,
      couleur,
      D.taille,
      p.eclaire || p.calme || repere,
      1,
      p.humeur,
      temps,
      recharge,
    );
  }

  // --- ce qu'un Guet a entendu, ou cru voir ---
  // Un point d'interrogation au-dessus de la tête. Sans ça on lance une pierre
  // et on ne sait jamais si elle a servi — et surtout, on ne sait pas qu'on
  // vient d'être remarqué. Il s'affiche pour les deux : le bruit d'une pierre,
  // et l'alerte quand une lumière s'est attardée.
  for (const p of zone.persos) {
    if (p.emotion !== EMOTIONS.COLERE || p.livre) continue;
    if (p.curieuxT <= 0 && p.alerte <= 0) continue;
    const k = clamp(Math.max(p.curieuxT / 4.5, p.alerte / 2.2), 0, 1);
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = '700 23px Georgia, serif';
    texteCerne(
      ecran,
      '?',
      p.x - cam.x,
      p.y - cam.y - D.taille * 1.5 + Math.sin(temps * 6) * 3,
      `rgba(255,214,132,${0.45 + k * 0.5})`,
      3.5,
    );
    ctx.restore();
  }

  // --- le joueur : exactement la règle des âmes, pas une autre ---
  // Il court : acharné. Il marche : intrigué. Un rouge cherche, ou on le
  // tient dans un faisceau : peur. Son niveau de forme n'y change rien —
  // une émotion vient de ce qui arrive, pas d'un palier de progression.
  const humeurJoueur = humeurDuJoueur(partie);
  // un bonus actif teinte le corps et, pour « voilé », le rend translucide :
  // c'est ce qui fait comprendre l'effet sans lire un mot
  const teinte = joueur.bonus ? BONUS[joueur.bonus].couleur : f.couleur;
  const opac = aBonus(joueur, 'souffle') ? 0.5 : 1;
  // Pendant la scène d'ouverture il n'est pas encore là : on ne le dessine pas,
  // puis il gonfle depuis rien quand la lumière touche le sol.
  if (partie.eclosion > 0.02) {
    dessinerTete(
      ecran,
      joueur,
      teinte,
      D.taille * 1.06 * partie.eclosion,
      true,
      opac * partie.eclosion,
      humeurJoueur,
      temps,
      0,
    );
  }

  // --- la lumière qui arrive : elle tombe au prologue, elle monte ensuite ---
  if (partie.chute && !partie.chute.pose) {
    const cx = partie.chute.x - cam.x,
      cy = partie.chute.y - cam.y;
    // la traîne est DERRIÈRE elle : au-dessus si elle descend, en dessous si
    // elle monte. C'est ce qui dit le sens du voyage en une image.
    const derriere = partie.chute.sens === 'haut' ? -CASE * 1.1 : CASE * 1.1;
    const tr = ctx.createLinearGradient(cx, cy + derriere, cx, cy);
    tr.addColorStop(0, 'rgba(143,208,255,0)');
    tr.addColorStop(1, 'rgba(143,208,255,0.28)');
    ctx.fillStyle = tr;
    ctx.fillRect(cx - 2.5, Math.min(cy, cy + derriere), 5, CASE * 1.1);
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, CASE * 0.75);
    g.addColorStop(0, 'rgba(198,230,255,0.9)');
    g.addColorStop(0.35, 'rgba(143,208,255,0.42)');
    g.addColorStop(1, 'rgba(143,208,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, CASE * 0.75, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#eaf5ff';
    ctx.beginPath();
    ctx.arc(cx, cy, 4.2, 0, TAU);
    ctx.fill();
  }

  // --- ce que la pierre a laissé là où elle est tombée ---
  // La pierre ne brille pas. Ce qui brille, c'est ce que Falot y a laissé en
  // la tenant — et ça fait, quelques secondes, une petite lumière seule dans
  // le noir : le leurre est exactement ça.
  for (const t of partie.traces) {
    const k = 1 - t.t / t.duree;
    const R = CASE * (0.3 + k * 0.55);
    const g = ctx.createRadialGradient(
      t.x - cam.x,
      t.y - cam.y,
      0,
      t.x - cam.x,
      t.y - cam.y,
      R,
    );
    g.addColorStop(0, rgba(f.couleur, 0.55 * k));
    g.addColorStop(0.5, rgba(f.couleur, 0.2 * k));
    g.addColorStop(1, rgba(f.couleur, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(t.x - cam.x, t.y - cam.y, R, 0, TAU);
    ctx.fill();
  }

  // --- pierres en vol : une ombre au sol, la pierre en l'air, et sa lueur ---
  for (const c of partie.pierres) {
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(c.x - cam.x, c.y - cam.y, 4, 2, 0, 0, TAU);
    ctx.fill();
    const hx = c.x - cam.x,
      hy = c.y - cam.y - c.hauteur;
    const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, CASE * 0.42);
    g.addColorStop(0, rgba(f.couleur, 0.4));
    g.addColorStop(1, rgba(f.couleur, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(hx, hy, CASE * 0.42, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#e4e9f5';
    ctx.beginPath();
    ctx.arc(hx, hy, 3.6, 0, TAU);
    ctx.fill();
  }

  // --- ondes de choc ---
  for (const o of partie.ondes) {
    ctx.strokeStyle = rgba(o.couleur, clamp(1 - o.r / o.max, 0, 1) * 0.6);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(o.x - cam.x, o.y - cam.y, o.r, 0, TAU);
    ctx.stroke();
  }

  // --- particules ---
  for (const q of partie.particules) {
    const a = clamp(q.vie / q.max, 0, 1);
    ctx.fillStyle = rgba(q.couleur, a * 0.9);
    if (q.forme === 'trait') ctx.fillRect(q.x - cam.x - 1, q.y - cam.y - 4, 2, 8);
    else {
      ctx.beginPath();
      ctx.arc(q.x - cam.x, q.y - cam.y, 2.6 * a + 0.7, 0, TAU);
      ctx.fill();
    }
  }

  /* ---- calque d'obscurité ---- */
  lctx.setTransform(ecran.DPR * QLUM, 0, 0, ecran.DPR * QLUM, 0, 0);
  lctx.globalCompositeOperation = 'source-over';
  lctx.fillStyle = 'rgba(8,8,14,0.975)';
  lctx.fillRect(0, 0, W, H);
  lctx.globalCompositeOperation = 'destination-out';

  const jx = joueur.x - cam.x,
    jy = joueur.y - cam.y;
  // Le halo du joueur traversait la pierre comme les torches : on voyait le
  // couloir d'à côté à travers un mur. Il se recalcule à chaque image, lui,
  // puisqu'il se déplace.
  if (r > 1) {
    joueur.rayonsHalo = portéesRond(zone, joueur.x, joueur.y, r);
    percerRond(lctx, jx, jy, r, 1, joueur.rayonsHalo);
  }
  if (portee)
    percerCone(
      ecran,
      lctx,
      zone,
      joueur.x,
      joueur.y,
      joueur.regard,
      portee,
      cone,
      0.95,
      joueur.rayons,
    );
  for (const p of eclaires)
    percerCone(
      ecran,
      lctx,
      zone,
      p.x,
      p.y,
      p.regard,
      D.portee * 5,
      D.cone + 0.05,
      0.85,
      p.rayonsRelais,
    );
  for (const b of zone.braises)
    percerRond(lctx, b.x - cam.x, b.y - cam.y, b.r, 0.92, rayonsSource(zone, b, b.r));
  // La pierre en vol et sa trace. Sans ça on lance dans le noir et on ne
  // sait jamais où c'est retombé — or c'est précisément l'information dont on
  // a besoin pour décider par où passer.
  if (partie.chute && !partie.chute.pose)
    percerDisque(lctx, partie.chute.x - cam.x, partie.chute.y - cam.y, CASE * 1.5, 0.92);
  for (const c of partie.pierres)
    percerDisque(lctx, c.x - cam.x, c.y - cam.y - c.hauteur, CASE * 0.5, 0.7);
  for (const t of partie.traces) {
    const k = 1 - t.t / t.duree;
    percerDisque(lctx, t.x - cam.x, t.y - cam.y, CASE * (0.45 + k * 0.65), 0.45 + k * 0.45);
  }
  // Un calmé n'est pas qu'un faisceau : son corps et un petit halo restent
  // éclairés, sinon on ne voit qu'un cône sortir du néant. Sauf s'il a soufflé
  // sa lumière : là il ne perce plus la nuit, et on ne le voit plus que dans
  // la lumière du joueur — coloré, mais découvert par nous.
  for (const p of zone.persos) {
    if (p.calme && !p.eteint)
      percerDisque(lctx, p.x - cam.x, p.y - cam.y, D.taille * 2.1, 0.95);
    // Une sentinelle qui t'a repéré se montre en entier : c'est le signal le
    // plus important du jeu, il ne doit pas rester caché dans le noir.
    // Un Guet qui a entendu quelque chose se montre aussi : c'est la réponse
    // à une pierre, et elle ne doit pas rester dans le noir.
    else if (
      p.emotion === EMOTIONS.COLERE &&
      (p.alerte > 0 || p.charge > 0.04 || p.curieuxT > 0)
    ) {
      percerDisque(lctx, p.x - cam.x, p.y - cam.y, D.taille * 1.7, 0.95);
    }
  }
  // Une fissure ne s'éclaire PAS toute seule. Elle en avait le droit un temps,
  // parce qu'on ne la voyait pas ; mais une pierre qui brille dans le noir
  // dans un jeu où l'on ne voit que ce qu'on éclaire, ça se remarque tout de
  // suite. C'est le réseau de fractures qui la rend lisible, sous le halo.
  for (const t of zone.torches) {
    if (t.reste <= 0) continue;
    const k = clamp(t.reste / (t.duree * 0.35), 0, 1); // elle faiblit en mourant
    percerRond(
      lctx,
      t.x - cam.x,
      t.y - cam.y,
      t.r * (0.55 + k * 0.45),
      0.9,
      rayonsSource(zone, t, t.r),
    );
  }
  // Le cône d'une sentinelle n'apparaît que DE PRÈS. De loin on ne voit que
  // ses yeux, et on ignore encore si c'est un ami ou une sentinelle : c'est
  // tout le suspense. D'assez près pour réagir, il se montre.
  for (const p of zone.persos) {
    if (p.emotion !== EMOTIONS.COLERE || p.aveugle > 0 || p.cligne > 0) continue;
    const dj = Math.hypot(p.x - joueur.x, p.y - joueur.y);
    const traque = p.alerte > 0 || p.charge > 0.04;
    // Traquée, elle ne se cache plus : son faisceau devient franchement
    // visible et de plus loin. Discrète, elle ne fait que se deviner de près,
    // pour garder le suspense des yeux dans le noir.
    if (!p.rayonsVue) continue;
    const proximite = clamp(1 - (dj - CASE * 2.6) / (CASE * 1.6), 0, 1);
    const force = traque ? 0.72 : 0.14 + proximite * 0.2;
    percerCone(ecran, lctx, zone, p.x, p.y, p.regard, PORTEE_VUE, 0.42, force, p.rayonsVue);
  }
  lctx.globalCompositeOperation = 'source-over';

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(ecran.lum, 0, 0, ecran.canvas.width, ecran.canvas.height);
  ctx.restore();

  /* ---- ce qui reste visible par-dessus l'obscurité ---- */
  // On se souvient des OBJETS, jamais du terrain : le fil qu'on a tracé, les
  // lueurs déjà aperçues, la sortie une fois trouvée. Assez pour ne pas être
  // perdu, trop peu pour connaître le plan.
  if (partie.fil.length > 1) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let i = 1; i < partie.fil.length; i++) {
      // un `null` marque une téléportation (mort puis réapparition au seuil) :
      // relier les deux traçait un trait droit à travers les murs
      const de = partie.fil[i - 1];
      const vers = partie.fil[i];
      if (!de || !vers) continue;
      const t = i / partie.fil.length;
      ctx.strokeStyle = rgba(f.couleur, 0.04 + t * 0.16);
      ctx.lineWidth = 1 + t * 1.6;
      ctx.beginPath();
      ctx.moveTo(de.x - cam.x, de.y - cam.y);
      ctx.lineTo(vers.x - cam.x, vers.y - cam.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  for (const l of zone.lueurs) {
    if (l.prise || !l.vue) continue;
    ctx.fillStyle = rgba(BONUS[l.type].couleur, 0.42);
    ctx.beginPath();
    ctx.arc(l.x - cam.x, l.y - cam.y, 3.2, 0, TAU);
    ctx.fill();
  }
  for (const b of zone.braises) {
    ctx.strokeStyle = 'rgba(255,196,120,0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(b.x - cam.x, b.y - cam.y, 9, 0, TAU);
    ctx.stroke();
  }

  // Les torches éteintes restent devinables une fois croisées : ce sont des
  // repères, et savoir où rallumer fait partie du jeu.
  for (const t of zone.torches) {
    if (t.reste > 0 || !t.vue) continue;
    // Le même dessin qu'allumée, mais froid : on reconnaît l'objet, et on voit
    // qu'il ne brûle pas. Un trait vertical ne disait ni l'un ni l'autre.
    ctx.save();
    ctx.globalAlpha = 0.5;
    dessinerTorche(ecran, t, 0, temps);
    ctx.restore();
  }

  // LES YEUX DANS LE NOIR. La seule chose qu'on distingue d'un inconnu. On
  // garde EXACTEMENT la géométrie des yeux éclairés — blanc de l'œil et
  // pupille décalée par le regard — pour que ce soit le même personnage, juste
  // sans son corps.
  // Mesuré : 57 % des PNJ à l'écran étaient masqués par un mur, ce qui vidait
  // l'effet. À travers une paroi ils restent perceptibles, mais bien plus
  // faibles et de moins loin : on sent une présence, on ne cartographie pas.
  for (const p of zone.persos) {
    const dj = Math.hypot(p.x - joueur.x, p.y - joueur.y);
    if (p.eclaire || estEclaire(partie, p.x, p.y)) continue;
    if (p.cligne > 0 || p.aveugle > 0) continue;
    // Tous les personnages existent dès la génération de la zone : aucun
    // n'apparaît en cours de route. On montre donc TOUS les yeux présents à
    // l'écran, sans limite de distance — c'est la carte des présences, et
    // c'est ce qui rend le noir habité plutôt que vide.
    const ex = p.x - cam.x,
      ey = p.y - cam.y;
    if (ex < -CASE || ey < -CASE || ex > W + CASE || ey > H + CASE) continue;
    const cache = !vueLibre(zone, p.x, p.y, joueur.x, joueur.y);
    const portee = Math.hypot(W, H);

    const demi = D.taille * 0.5;
    const ecart = demi * 0.36;
    const oeilY = -demi * 0.14;
    const rOeil = demi * 0.22;
    const px = Math.cos(p.regard) * rOeil * 0.42;
    const py = Math.sin(p.regard) * rOeil * 0.42;
    const a = (clamp(1 - dj / portee, 0, 1) * 0.5 + 0.35) * (cache ? 0.34 : 1);

    for (const dx of [-ecart, ecart]) {
      const ox = p.x - cam.x + dx,
        oy = p.y - cam.y + oeilY;
      // la lueur autour de l'œil, qui le fait exister dans le noir
      const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, rOeil * 3.2);
      g.addColorStop(0, `rgba(226,232,246,${a * 0.55})`);
      g.addColorStop(1, 'rgba(226,232,246,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(ox, oy, rOeil * 3.2, 0, TAU);
      ctx.fill();
      // blanc de l'œil + pupille : la même forme que de jour
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.beginPath();
      ctx.arc(ox, oy, rOeil, 0, TAU);
      ctx.fill();
      ctx.fillStyle = `rgba(10,10,16,${a})`;
      ctx.beginPath();
      ctx.arc(ox + px, oy + py, rOeil * 0.5, 0, TAU);
      ctx.fill();
    }
  }

  // --- les gains qui montent vers la jauge, et les phrases du décor ---
  for (const f of partie.flottants) {
    ctx.save();
    ctx.textAlign = 'center';
    if (f.murmure) {
      // Un murmure apparaît en fondu et repart en fondu : il ne doit jamais
      // « claquer » à l'écran comme une notification.
      const a = clamp(Math.min(f.vie / 1.4, (f.max - f.vie) / 0.5), 0, 1) * 0.92;
      ctx.font = 'italic 400 14px Georgia, serif';
      const lignes = decouper(f.texte, 30);
      // Le bloc se construit VERS LE HAUT depuis son point d'ancrage, et il
      // est ramené dans l'écran : une phrase dite au bord de la carte partait
      // hors cadre, et une phrase dite sous les pieds recouvrait le visage.
      const sx = clamp(f.x - cam.x, 118, W - 118);
      const sy = f.y - cam.y;
      for (let i = 0; i < lignes.length; i++) {
        texteCerne(
          ecran,
          lignes[i],
          sx,
          sy + (i - lignes.length + 1) * 19,
          rgba(f.couleur, a),
          3,
        );
      }
    } else {
      const a = clamp(f.vie / f.max, 0, 1);
      ctx.font = '700 15px system-ui, sans-serif';
      texteCerne(ecran, f.texte, f.x - cam.x, f.y - cam.y, rgba(f.couleur, a), 3);
    }
    ctx.restore();
  }

  // La jauge de chaque sentinelle, dessinée DANS son cône : il se remplit
  // depuis la pointe tant qu'on est dedans, et se vide dès qu'on en sort.
  for (const p of zone.persos) {
    if (p.emotion !== EMOTIONS.COLERE || p.charge <= 0.01) continue;
    const portee = PORTEE_VUE * p.charge;
    const g = ctx.createRadialGradient(
      p.x - cam.x,
      p.y - cam.y,
      0,
      p.x - cam.x,
      p.y - cam.y,
      portee,
    );
    g.addColorStop(0, `rgba(255,60,50,${0.06 + p.charge * 0.14})`);
    g.addColorStop(0.72, `rgba(255,66,52,${0.12 + p.charge * 0.3})`);
    g.addColorStop(1, `rgba(255,86,66,${0.2 + p.charge * 0.45})`);
    const pj = p.rayonsVue
      ? raccourcir(p.rayonsVue, portee)
      : portéesCone(zone, p.x, p.y, p.regard, portee, 0.42);
    // Le front n'est plus un trait : le dégradé s'assombrit vers l'extérieur,
    // donc la limite se lit comme une zone dense qui avance vers toi. Tout
    // reste du faisceau, rien n'est un contour.
    ctx.fillStyle = g;
    tracerCone(ctx, p.x - cam.x, p.y - cam.y, p.regard, 0.42, pj);
    ctx.fill();
  }
  if (zone.sortie.vue) {
    ctx.strokeStyle = ouverte ? 'rgba(255,233,168,0.65)' : 'rgba(255,233,168,0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(zone.sortie.x - cam.x, zone.sortie.y - cam.y, zone.sortie.r * pulse, 0, TAU);
    ctx.stroke();
    // une fois le quota atteint, une flèche au bord de l'écran pour ne pas
    // finir la zone à errer
    if (ouverte) flecheVers(ecran, zone.sortie.x, zone.sortie.y, '#ffe9a8', temps);
  }

  /* ---- halo chaud ---- */
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const couleurLumiere = joueur.bonus ? BONUS[joueur.bonus].couleur : f.couleur;
  const chaud = ctx.createRadialGradient(jx, jy, 0, jx, jy, r);
  chaud.addColorStop(0, rgba(couleurLumiere, 0.16));
  chaud.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = chaud;
  tracerRond(ctx, jx, jy, joueur.rayonsHalo ?? [], r);
  ctx.fill();

  if (portee) {
    const gf = ctx.createRadialGradient(jx, jy, 0, jx, jy, portee);
    gf.addColorStop(0, rgba(couleurLumiere, 0.14));
    gf.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gf;
    tracerCone(ctx, jx, jy, joueur.regard, cone, joueur.rayons ?? []);
    ctx.fill();
  }
  for (const b of zone.braises) {
    const gb = ctx.createRadialGradient(
      b.x - cam.x,
      b.y - cam.y,
      0,
      b.x - cam.x,
      b.y - cam.y,
      b.r,
    );
    gb.addColorStop(0, 'rgba(255,190,110,0.17)');
    gb.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gb;
    // même polygone que le trou d'obscurité : les deux passes doivent
    // s'arrêter au même mur, sinon la chaleur bave toute seule au travers
    tracerRond(ctx, b.x - cam.x, b.y - cam.y, rayonsSource(zone, b, b.r), b.r);
    ctx.fill();
  }
  // le balayage rouge, en lumière additive : sans ça ce n'était qu'un trou
  // dans l'obscurité, on ne le lisait pas comme un faisceau
  for (const p of zone.persos) {
    if (p.emotion !== EMOTIONS.COLERE || p.aveugle > 0 || p.cligne > 0) continue;
    if (!p.rayonsVue) continue;
    const traque = p.alerte > 0 || p.charge > 0.04;
    const pr = PORTEE_VUE;
    const gr = ctx.createRadialGradient(
      p.x - cam.x,
      p.y - cam.y,
      0,
      p.x - cam.x,
      p.y - cam.y,
      pr,
    );
    gr.addColorStop(0, `rgba(255,90,74,${traque ? 0.2 : 0.07})`);
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    const portees = p.rayonsVue;
    // traquée, la jauge dessine déjà un cône coloré par-dessus : inutile d'en
    // peindre un second, c'est un polygone dégradé plein écran de gagné
    if (!traque) {
      ctx.fillStyle = gr;
      tracerCone(ctx, p.x - cam.x, p.y - cam.y, p.regard, 0.42, portees);
      ctx.fill();
    }
    // Pas de contour : tout doit rester du faisceau. Traquée, le cône est
    // simplement plus dense — la jauge par-dessus fait le reste.
    if (traque) {
      const g2 = ctx.createRadialGradient(
        p.x - cam.x,
        p.y - cam.y,
        0,
        p.x - cam.x,
        p.y - cam.y,
        pr,
      );
      g2.addColorStop(0, 'rgba(255,96,78,0.17)');
      g2.addColorStop(1, 'rgba(255,96,78,0)');
      ctx.fillStyle = g2;
      tracerCone(ctx, p.x - cam.x, p.y - cam.y, p.regard, 0.42, portees);
      ctx.fill();
    }
  }
  for (const p of zone.persos) {
    if (!p.calme || p.eteint) continue;
    const rc = D.taille * 2.1;
    const gc = ctx.createRadialGradient(
      p.x - cam.x,
      p.y - cam.y,
      0,
      p.x - cam.x,
      p.y - cam.y,
      rc,
    );
    gc.addColorStop(0, 'rgba(168,240,200,0.2)');
    gc.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gc;
    ctx.beginPath();
    ctx.arc(p.x - cam.x, p.y - cam.y, rc, 0, TAU);
    ctx.fill();
  }
  for (const t of zone.torches) {
    if (t.reste <= 0) continue;
    const k = clamp(t.reste / (t.duree * 0.35), 0, 1);
    const rt = t.r * (0.55 + k * 0.45);
    const gt = ctx.createRadialGradient(
      t.x - cam.x,
      t.y - cam.y,
      0,
      t.x - cam.x,
      t.y - cam.y,
      rt,
    );
    gt.addColorStop(0, 'rgba(255,180,92,0.19)');
    gt.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gt;
    tracerRond(ctx, t.x - cam.x, t.y - cam.y, rayonsSource(zone, t, t.r), rt);
    ctx.fill();
  }
  for (const p of eclaires) {
    const pp = D.portee * 5;
    const gp = ctx.createRadialGradient(
      p.x - cam.x,
      p.y - cam.y,
      0,
      p.x - cam.x,
      p.y - cam.y,
      pp,
    );
    // un calmé éclaire en vert : c'est une lampe que le joueur a allumée,
    // elle doit se distinguer d'un simple relais de passage
    gp.addColorStop(
      0,
      rgba(p.calme ? '#a8f0c8' : COULEURS[p.emotion], p.calme ? 0.2 : 0.16),
    );
    gp.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gp;
    tracerCone(ctx, p.x - cam.x, p.y - cam.y, p.regard, D.cone, p.rayonsRelais ?? []);
    ctx.fill();
  }
  ctx.restore();

  // on se fait fixer : le bord de l'écran rougit
  const alerte = joueur.vu * (1 - joueur.souffle * 0.55);
  if (alerte > 0.02) {
    // concentré sur le bord : au centre on doit continuer à voir le jeu
    const v = ctx.createRadialGradient(
      W / 2,
      H / 2,
      Math.min(W, H) * 0.42,
      W / 2,
      H / 2,
      Math.max(W, H) * 0.62,
    );
    v.addColorStop(0, 'rgba(255,60,50,0)');
    v.addColorStop(1, `rgba(255,60,50,${clamp(alerte * 0.3, 0, 0.3)})`);
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, W, H);
  }

  dessinerVidange(ecran, partie);
  dessinerManche(ecran, partie);
  dessinerVisee(ecran, partie);
}

// `shadowBlur` sur du texte est ce qui coûte le plus cher de toute l'image :
// mesuré, les deux lignes du portail à elles seules prenaient 11 ms sur 60
// (processeur étranglé six fois), et elles sont dessinées à CHAQUE image. Un
// liseré sombre donne la même lisibilité pour presque rien.
