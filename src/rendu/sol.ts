/**
 * Le sol, les murs fêlés et les battants.
 *
 * On dessine le sol de TOUTES les cases à l'écran : le voile d'obscurité se
 * charge de ne montrer que ce qui est éclairé. Pas de brouillard de guerre —
 * seule la lumière révèle.
 */

import { CASE } from '../coeur/dimensions.js';
import { TAU } from '../coeur/geometrie.js';
import type { Partie } from '../coeur/types.js';
import type { Ecran } from './ecran.js';
import { carreArrondi } from './visages.js';

// Le sol de TOUTES les cases à l'écran : le voile se charge de ne montrer que
// ce qui est éclairé. Pas de brouillard de guerre — seule la lumière révèle.
export function dessinerSol(
  ecran: Ecran,
  partie: Partie,
  c0x: number,
  c1x: number,
  c0y: number,
  c1y: number,
): void {
  const { ctx, cam } = ecran;
  const zone = partie.zone;
  ctx.fillStyle = '#1a1a26';
  for (let cy = c0y; cy <= c1y; cy++)
    for (let cx = c0x; cx <= c1x; cx++)
      if (!zone.mur[cy][cx])
        ctx.fillRect(cx * CASE - cam.x, cy * CASE - cam.y, CASE + 1, CASE + 1);

  // LA CENDRE. Le sol brûlé est un peu plus clair, et grumeleux : quatre
  // grains par case, toujours aux mêmes endroits — la case est sa propre
  // graine, sinon la cendre grouillerait d'une image à l'autre. On la voit
  // d'un coup d'œil, et on comprend pourquoi ça craque avant d'avoir couru.
  if (zone.cendres.length) {
    for (let cy = c0y; cy <= c1y; cy++)
      for (let cx = c0x; cx <= c1x; cx++) {
        if (!zone.cendre[cy][cx]) continue;
        const x = cx * CASE - cam.x,
          y = cy * CASE - cam.y;
        ctx.fillStyle = '#242430';
        ctx.fillRect(x, y, CASE + 1, CASE + 1);
        ctx.fillStyle = 'rgba(178,186,204,0.16)';
        for (let i = 0; i < 4; i++) {
          const u = ((cx * 7919 + cy * 104729 + i * 6151) % 97) / 97;
          const v = ((cx * 104729 + cy * 7919 + i * 3571) % 89) / 89;
          const r = 1.2 + ((cx + cy + i) % 3) * 0.7;
          ctx.beginPath();
          ctx.arc(x + u * CASE, y + v * CASE, r, 0, TAU);
          ctx.fill();
        }
      }
  }

  // Ces traits soulignent l'ARCHITECTURE, donc ils lisent la pierre seule et
  // pas `solide` : une porte fermée y devenait un mur, et sa case se
  // retrouvait cernée d'un rectangle qui clignotait à chaque ouverture.
  const pierre = (cx: number, cy: number) =>
    cx < 0 || cy < 0 || cx >= zone.cols || cy >= zone.lignes || zone.mur[cy][cx] === 1;
  ctx.strokeStyle = 'rgba(255,255,255,0.13)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let cy = c0y; cy <= c1y; cy++) {
    for (let cx = c0x; cx <= c1x; cx++) {
      if (zone.mur[cy][cx]) continue;
      const x = cx * CASE - cam.x,
        y = cy * CASE - cam.y;
      if (pierre(cx, cy - 1)) {
        ctx.moveTo(x, y);
        ctx.lineTo(x + CASE, y);
      }
      if (pierre(cx, cy + 1)) {
        ctx.moveTo(x, y + CASE);
        ctx.lineTo(x + CASE, y + CASE);
      }
      if (pierre(cx - 1, cy)) {
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + CASE);
      }
      if (pierre(cx + 1, cy)) {
        ctx.moveTo(x + CASE, y);
        ctx.lineTo(x + CASE, y + CASE);
      }
    }
  }
  ctx.stroke();

  // --- les dalles de pesée ---
  // Un carré creusé dans le sol, et son cadre qui s'allume quand quelque chose
  // pèse dessus. Rien d'autre : on comprend en marchant dessus et en voyant la
  // porte bouger, pas en lisant une consigne.
  for (const dl of zone.dalles) {
    if (dl.cx < c0x - 1 || dl.cx > c1x + 1 || dl.cy < c0y - 1 || dl.cy > c1y + 1) continue;
    const x = dl.cx * CASE - cam.x,
      y = dl.cy * CASE - cam.y;
    const m = CASE * 0.18;
    ctx.fillStyle = dl.pesee ? 'rgba(200,176,136,0.20)' : 'rgba(255,255,255,0.05)';
    ctx.fillRect(x + m, y + m, CASE - m * 2, CASE - m * 2);
    ctx.strokeStyle = dl.pesee ? 'rgba(200,176,136,0.75)' : 'rgba(200,176,136,0.34)';
    ctx.lineWidth = dl.pesee ? 2.4 : 1.6;
    ctx.strokeRect(x + m, y + m, CASE - m * 2, CASE - m * 2);
  }

  // --- les murs fêlés : de la pierre, mais fendue ---
  // Deux fentes claires et un peu de poussière : assez pour qu'on le remarque
  // en passant le halo dessus, pas assez pour que ça ressemble à un objet à
  // ramasser. Une fois cassée, la pierre s'efface en fondu sur la case.
  for (const f of zone.fissures) {
    if (f.cx < c0x - 1 || f.cx > c1x + 1 || f.cy < c0y - 1 || f.cy > c1y + 1) continue;
    const x = f.cx * CASE - cam.x,
      y = f.cy * CASE - cam.y;
    if (f.casse >= 1) continue;
    if (f.casse > 0) {
      // l'éboulement
      ctx.fillStyle = `rgba(10,10,16,${1 - f.casse})`;
      ctx.fillRect(x, y, CASE + 1, CASE + 1);
      continue;
    }
    ctx.save();
    ctx.beginPath();
    ctx.rect(x + 2, y + 2, CASE - 4, CASE - 4);
    ctx.clip();
    // Une vraie toile de fractures, pas deux traits : trois fentes qui
    // traversent la case de haut en bas, leurs branches, et les éclats
    // détachés autour. Deux traits ressemblaient à une décoration ; ça, ça
    // ressemble à de la pierre qui a déjà renoncé.
    const o = Math.sin(f.phase),
      o2 = Math.cos(f.phase * 1.7);
    const X = (u: number) => x + CASE * u;
    const Y = (v: number) => y + CASE * v;
    ctx.beginPath();
    ctx.moveTo(X(0.13), Y(-0.04));
    ctx.lineTo(X(0.31 + o * 0.05), Y(0.25));
    ctx.lineTo(X(0.18), Y(0.52));
    ctx.lineTo(X(0.35 + o2 * 0.05), Y(0.77));
    ctx.lineTo(X(0.24), Y(1.04));
    ctx.moveTo(X(0.53 + o * 0.04), Y(-0.04));
    ctx.lineTo(X(0.43), Y(0.21));
    ctx.lineTo(X(0.61 + o2 * 0.04), Y(0.46));
    ctx.lineTo(X(0.46), Y(0.73));
    ctx.lineTo(X(0.59), Y(1.04));
    ctx.moveTo(X(0.87), Y(-0.04));
    ctx.lineTo(X(0.73 + o * 0.05), Y(0.29));
    ctx.lineTo(X(0.89), Y(0.57));
    ctx.lineTo(X(0.77 + o2 * 0.04), Y(1.04));
    // les branches : c'est elles qui font le réseau
    ctx.moveTo(X(0.31), Y(0.25));
    ctx.lineTo(X(0.47), Y(0.14));
    ctx.moveTo(X(0.18), Y(0.52));
    ctx.lineTo(X(-0.04), Y(0.61));
    ctx.moveTo(X(0.61), Y(0.46));
    ctx.lineTo(X(0.74), Y(0.4));
    ctx.moveTo(X(0.46), Y(0.73));
    ctx.lineTo(X(0.29), Y(0.87));
    ctx.moveTo(X(0.89), Y(0.57));
    ctx.lineTo(X(1.04), Y(0.65));
    ctx.moveTo(X(0.35), Y(0.77));
    ctx.lineTo(X(0.52), Y(0.9));
    // l'ombre de la fente d'abord, le bord éclairé par-dessus : c'est ce qui
    // donne du relief à deux traits
    ctx.strokeStyle = 'rgba(6,6,11,0.85)';
    ctx.lineWidth = 4.5;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(214,220,234,0.5)';
    ctx.lineWidth = 1.7;
    ctx.stroke();
    // les éclats détachés : de petits morceaux qui ne tiennent plus à rien
    const eclats = [
      [0.24, 0.38, 0.07],
      [0.68, 0.19, 0.055],
      [0.4, 0.6, 0.05],
      [0.8, 0.8, 0.065],
      [0.12, 0.82, 0.045],
      [0.63, 0.66, 0.04],
    ];
    for (let i = 0; i < eclats.length; i++) {
      const [u, v, t] = eclats[i];
      const a0 = f.phase + i * 1.1;
      ctx.beginPath();
      ctx.moveTo(X(u + Math.cos(a0) * t), Y(v + Math.sin(a0) * t));
      ctx.lineTo(X(u + Math.cos(a0 + 2.2) * t), Y(v + Math.sin(a0 + 2.2) * t));
      ctx.lineTo(X(u + Math.cos(a0 + 4.3) * t), Y(v + Math.sin(a0 + 4.3) * t));
      ctx.closePath();
      ctx.fillStyle = 'rgba(8,8,14,0.7)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(214,220,234,0.32)';
      ctx.lineWidth = 1.1;
      ctx.stroke();
    }
    ctx.restore();
  }

  // --- les battants ---
  for (const pt of zone.portes) {
    if (pt.cx < c0x - 1 || pt.cx > c1x + 1 || pt.cy < c0y - 1 || pt.cy > c1y + 1) continue;
    const x = pt.x - cam.x,
      y = pt.y - cam.y;
    const demi = CASE * 0.5;
    ctx.save();
    ctx.translate(x, y);
    if (pt.verticale) ctx.rotate(Math.PI / 2);
    // Le gond est scellé dans la pierre, d'un côté ou de l'autre du passage :
    // on retourne le repère pour que le battant parte de CE côté-là. Deux
    // battants voisins ont des gonds opposés, donc ils s'ouvrent en sens
    // inverse — ce sont des portes battantes, pas deux planches parallèles.
    ctx.scale(pt.gond, 1);
    // le battant pivote sur son gond : fermé il barre le couloir, ouvert il
    // se range le long de la paroi
    const angle = pt.ouverte * (Math.PI / 2) * 0.92 * (pt.sens || 1);
    ctx.translate(-demi, 0);
    ctx.rotate(angle);
    // Le battant reste dans les gris du décor : une porte en bois clair
    // attirait l'œil comme un objet à ramasser alors que c'est de
    // l'architecture. Seule la poignée a le droit d'être jaune.
    const g = ctx.createLinearGradient(0, -demi * 0.2, 0, demi * 0.2);
    g.addColorStop(0, '#31313d');
    g.addColorStop(1, '#191922');
    ctx.fillStyle = g;
    carreArrondi(ctx, 0, -CASE * 0.11, CASE * 0.96, CASE * 0.22, CASE * 0.06);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.16)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // poignée : elle dit de quel côté ça s'ouvre
    ctx.fillStyle = '#d6ba8c';
    ctx.beginPath();
    ctx.arc(CASE * 0.78, 0, CASE * 0.055, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
}
