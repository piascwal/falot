/**
 * LA FIN, dessinée.
 *
 * Quatre temps, toujours les mêmes formes que le reste du jeu : des carrés
 * arrondis, des ronds de lumière, du noir. On ne montre jamais Falot dans la
 * dernière image — il n'y est pas.
 *
 * `regles/fin.ts` compte le temps ; ce fichier ne fait que regarder.
 */

import { CASE, D } from '../coeur/dimensions.js';
import { clamp, TAU } from '../coeur/geometrie.js';
import { tempsFin } from '../coeur/regles/fin.js';
import { decouper } from '../coeur/texte.js';
import { FIN } from '../coeur/textes.js';
import type { Partie } from '../coeur/types.js';
import type { Ecran } from './ecran.js';
import { texteCerne } from './texte.js';

/** Une phrase posée au milieu, qui apparaît et s'efface avec son temps. */
function phrase(ecran: Ecran, txt: string, y: number, k: number, taille = 17): void {
  const { ctx, W } = ecran;
  const vu = clamp(k / 0.18, 0, 1) * clamp((1 - k) / 0.18, 0, 1);
  if (vu <= 0.01) return;
  ctx.textAlign = 'center';
  ctx.font = `italic ${taille}px Georgia, serif`;
  const lignes = decouper(txt, Math.max(24, Math.floor(W / (taille * 0.52))));
  for (let i = 0; i < lignes.length; i++)
    texteCerne(
      ecran,
      lignes[i],
      W / 2,
      y + i * (taille * 1.5),
      `rgba(232,232,240,${0.8 * vu})`,
      3.5,
    );
}

/** Le Seuil : un rond de lumière qui ne s'éteindra plus. */
function portail(ecran: Ecran, x: number, y: number, r: number, force: number): void {
  const { ctx } = ecran;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3.4);
  g.addColorStop(0, `rgba(255,233,168,${0.5 * force})`);
  g.addColorStop(0.45, `rgba(255,233,168,${0.12 * force})`);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r * 3.4, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = `rgba(255,233,168,${0.5 + 0.4 * force})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.stroke();
}

export function dessinerFin(ecran: Ecran, partie: Partie, temps: number): void {
  const fin = partie.fin;
  if (!fin) return;
  const { ctx, W, H } = ecran;
  const { etape, k } = tempsFin(fin.t);

  ctx.fillStyle = '#08080e';
  ctx.fillRect(0, 0, W, H);

  const cx = W / 2;
  const cy = H * 0.42;

  if (etape === 'don') {
    // Il entre dedans. Sa lumière quitte son corps et va au portail : la même
    // image qu'à chaque étage, sauf qu'elle ne s'arrête pas.
    portail(ecran, cx, cy, CASE * 0.75, 0.25 + k * 0.75);
    const monte = k * k;
    const y = cy + D.taille * 3.4 * (1 - monte);
    const reste = clamp(1 - k * 1.25, 0, 1);
    if (reste > 0.01) {
      ctx.globalAlpha = reste;
      ctx.fillStyle = '#ffe9a8';
      const c = D.taille * (0.35 + reste * 0.65);
      ctx.beginPath();
      ctx.roundRect(cx - c / 2, y - c / 2, c, c, c * 0.32);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    // des motes qui montent vers le rond
    ctx.fillStyle = 'rgba(255,233,168,0.55)';
    for (let i = 0; i < 40; i++) {
      const u = (i * 0.137 + temps * 0.35) % 1;
      const my = y - (y - cy) * u;
      const mx = cx + Math.sin(i * 12.9 + temps * 2) * CASE * 0.5 * (1 - u);
      ctx.globalAlpha = 0.5 * (1 - u) * (0.3 + k);
      ctx.fillRect(mx, my, 2, 2);
    }
    ctx.globalAlpha = 1;
    phrase(ecran, k < 0.5 ? FIN.refus : FIN.don, H * 0.72, k < 0.5 ? k * 2 : (k - 0.5) * 2);
    return;
  }

  if (etape === 'lampe') {
    // Le Seuil est allumé, et il le restera. Personne devant.
    portail(ecran, cx, cy, CASE * 0.75, 1);
    phrase(
      ecran,
      k < 0.5 ? FIN.lampe : FIN.avant,
      H * 0.72,
      k < 0.5 ? k * 2 : (k - 0.5) * 2,
    );
    return;
  }

  if (etape === 'dehors') {
    // LA SEULE IMAGE DU MONDE D'EN HAUT, et elle ne sert qu'une fois : une
    // fenêtre, une rue au crépuscule, des lampes qu'on allume les unes après
    // les autres. Falot n'y est pas.
    const ouvre = clamp((k - 0.05) / 0.25, 0, 1);
    const w = Math.min(W * 0.72, 420) * ouvre;
    const h = Math.min(H * 0.42, 300) * ouvre;
    const x0 = cx - w / 2,
      y0 = cy - h / 2;
    // le ciel du soir, du bleu profond au chaud à l'horizon
    const ciel = ctx.createLinearGradient(0, y0, 0, y0 + h);
    ciel.addColorStop(0, 'rgba(24,28,52,1)');
    ciel.addColorStop(0.62, 'rgba(46,42,66,1)');
    ciel.addColorStop(1, 'rgba(86,58,58,1)');
    ctx.fillStyle = ciel;
    ctx.fillRect(x0, y0, w, h);
    // les immeubles d'en face : des rectangles, rien de plus
    ctx.fillStyle = '#12121a';
    const sol = y0 + h * 0.72;
    for (let i = 0; i < 7; i++) {
      const bw = w / 7;
      const bh = h * (0.2 + ((i * 37) % 11) / 26);
      ctx.fillRect(x0 + i * bw, sol - bh, bw - 2, bh + h * 0.28);
    }
    // et les lampes, une par une : c'est tout le sujet du jeu
    const lampes = 6;
    for (let i = 0; i < lampes; i++) {
      const allume = clamp((k - 0.32 - i * 0.085) / 0.07, 0, 1);
      if (allume <= 0.01) continue;
      const lx = x0 + w * (0.1 + i * 0.16);
      const ly = sol + h * 0.1;
      const g = ctx.createRadialGradient(lx, ly, 0, lx, ly, 26 * allume);
      g.addColorStop(0, `rgba(255,214,140,${0.55 * allume})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(lx, ly, 26 * allume, 0, TAU);
      ctx.fill();
      ctx.fillStyle = `rgba(255,236,190,${0.9 * allume})`;
      ctx.fillRect(lx - 2, ly - 2, 4, 4);
    }
    // le cadre de la fenêtre, par-dessus
    ctx.strokeStyle = 'rgba(232,232,240,0.28)';
    ctx.lineWidth = 3;
    ctx.strokeRect(x0, y0, w, h);
    ctx.beginPath();
    ctx.moveTo(cx, y0);
    ctx.lineTo(cx, y0 + h);
    ctx.moveTo(x0, cy);
    ctx.lineTo(x0 + w, cy);
    ctx.stroke();
    phrase(ecran, FIN.dehors, y0 + h + 52, clamp((k - 0.25) / 0.7, 0, 1));
    return;
  }

  // le noir se referme, et le Puits sans fin s'ouvre
  portail(ecran, cx, cy, CASE * 0.75, clamp(1 - k * 1.6, 0, 1));
  phrase(ecran, FIN.puits, H * 0.62, k);
}
