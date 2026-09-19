/**
 * LA FIN, dessinée.
 *
 * Quatre temps, toujours les mêmes formes que le reste du jeu : des carrés
 * arrondis, des ronds de lumière, du noir.
 *
 *   1. LES RETROUVAILLES — les âmes remontées montent dans la rue et se
 *      posent, chacune sur le sien. Les gens s'allument un par un.
 *   2. LE SIEN LE RECONNAÎT — il reste une silhouette éteinte, et Falot va
 *      vers elle. Un fil de lumière commence à se tendre entre eux.
 *   3. L'OUBLI — le fil casse. L'homme se détourne, Falot se vide.
 *   4. LA CHUTE — il retombe, tout en bas, et le jeu recommence.
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
import { dessinerTete } from './visages.js';

/** Combien de gens dans la rue. Assez pour faire une foule, assez peu pour
 *  qu'on les compte du regard. */
const GENS = 7;
/** Celui de Falot : le dernier à gauche, et le seul qui restera éteint. */
const SIEN = 0;

/** Le corps de Falot pendant la scène : il n'a plus de zone où être. */
const corps = {
  x: 0,
  y: 0,
  sx: 1,
  sy: 1,
  vsx: 0,
  vsy: 0,
  vx: 0,
  vy: 0,
  regard: -Math.PI / 2,
  tremble: 0,
  aveugle: 0,
  cligne: 0,
};

/** Une phrase posée en bas, qui apparaît et s'efface avec son temps. */
function phrase(ecran: Ecran, txt: string, y: number, k: number): void {
  const { ctx, W } = ecran;
  const vu = clamp(k / 0.16, 0, 1) * clamp((1 - k) / 0.16, 0, 1);
  if (vu <= 0.01) return;
  ctx.textAlign = 'center';
  ctx.font = 'italic 16px Georgia, serif';
  const lignes = decouper(txt, Math.max(24, Math.floor(W / 9)));
  for (let i = 0; i < lignes.length; i++)
    texteCerne(ecran, lignes[i], W / 2, y + i * 24, `rgba(232,232,240,${0.78 * vu})`, 3.5);
}

/**
 * Où se tient chacun dans la rue. Le sien se tient À L'ÉCART des autres : il
 * faut qu'on le repère avant même de comprendre pourquoi, et il faut la place
 * pour la scène à deux qui vient.
 */
const placeDe = (W: number, i: number) =>
  i === SIEN ? W * 0.12 : W * (0.38 + ((i - 1) / (GENS - 2)) * 0.54);

/**
 * QUELQU'UN. Un corps debout et une tête ronde, en silhouette : on ne dessine
 * jamais un visage d'en haut — ce sont des gens, pas des personnages.
 * `vif` va de 0 (éteint) à 1 (son âme lui est revenue).
 */
function personne(ecran: Ecran, x: number, sol: number, h: number, vif: number): void {
  const { ctx } = ecran;
  const l = h * 0.34;
  if (vif > 0.01) {
    const g = ctx.createRadialGradient(x, sol - h * 0.6, 0, x, sol - h * 0.6, h * 1.1);
    g.addColorStop(0, `rgba(255,214,140,${0.26 * vif})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, sol - h * 0.6, h * 1.1, 0, TAU);
    ctx.fill();
  }
  // le corps s'éclaircit avec la lumière qui lui revient
  const c = Math.round(20 + vif * 60);
  ctx.fillStyle = `rgb(${c + Math.round(vif * 90)},${c + Math.round(vif * 60)},${c + Math.round(vif * 20)})`;
  // Son reflet sur le pavé : une flaque de lumière à ses pieds, pas un
  // rectangle — un bord net au sol se lit comme un objet posé là.
  if (vif > 0.01) {
    ctx.save();
    ctx.translate(x, sol);
    ctx.scale(1, 0.34);
    const refl = ctx.createRadialGradient(0, 0, 0, 0, 0, h * 1.1);
    refl.addColorStop(0, `rgba(255,214,140,${0.22 * vif})`);
    refl.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = refl;
    ctx.beginPath();
    ctx.arc(0, 0, h * 1.1, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = `rgb(${c + Math.round(vif * 90)},${c + Math.round(vif * 60)},${c + Math.round(vif * 20)})`;
  const r = l * 0.32;
  ctx.beginPath();
  ctx.roundRect(x - l / 2, sol - h * 0.78, l, h * 0.78, [r, r, 0, 0]);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, sol - h * 0.88, l * 0.34, 0, TAU);
  ctx.fill();
}

/** La rue au crépuscule : le ciel, les immeubles, le sol. */
function rue(ecran: Ecran, sol: number, nuit: number): void {
  const { ctx, W, H } = ecran;
  // Elle déborde largement de l'écran : la caméra glisse sur la fin, et une
  // rue qui s'arrête au bord découvrirait le noir.
  const g0 = -W;
  const g1 = 2 * W;
  const ciel = ctx.createLinearGradient(0, 0, 0, sol);
  ciel.addColorStop(0, `rgba(20,24,46,${1 - nuit * 0.7})`);
  ciel.addColorStop(0.65, `rgba(44,40,64,${1 - nuit * 0.7})`);
  ciel.addColorStop(1, `rgba(88,58,56,${1 - nuit * 0.7})`);
  ctx.fillStyle = ciel;
  ctx.fillRect(g0, 0, g1 - g0, sol);
  // la ville derrière : des blocs sombres, bien plus hauts que les gens —
  // c'est ce qui donne l'échelle, et c'est tout ce qu'on en montre
  for (let i = -11; i < 22; i++) {
    const bw = W / 11;
    const bh = H * (0.16 + ((((i * 37) % 13) + 13) % 13) / 30);
    ctx.fillStyle = '#0b0b12';
    // pas d'interstice : deux blocs qui ne se touchent pas laissent passer une
    // raie de ciel, et la ville se lit comme un code-barres
    ctx.fillRect(i * bw, sol - bh, bw + 1, bh);
    // une fenêtre allumée de temps en temps, carrée et petite
    if (i % 3 === 1) {
      const c = bw * 0.16;
      ctx.fillStyle = 'rgba(255,214,140,0.14)';
      ctx.fillRect(i * bw + bw * 0.34, sol - bh * 0.78, c, c);
      ctx.fillRect(i * bw + bw * 0.34, sol - bh * 0.52, c, c);
    }
  }
  ctx.fillStyle = '#101018';
  ctx.fillRect(g0, sol, g1 - g0, H - sol);
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(g0, sol);
  ctx.lineTo(g1, sol);
  ctx.stroke();
}

/** Une petite lumière qui monte du bas de l'écran et se pose sur quelqu'un. */
function ameQuiRemonte(
  ecran: Ecran,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  k: number,
): void {
  const { ctx } = ecran;
  const e = 1 - (1 - k) * (1 - k); // elle ralentit en arrivant
  const x = x0 + (x1 - x0) * e;
  const y = y0 + (y1 - y0) * e + Math.sin(k * Math.PI) * -18;
  const g = ctx.createRadialGradient(x, y, 0, x, y, 22);
  g.addColorStop(0, 'rgba(168,240,200,0.55)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, 22, 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(214,255,232,0.92)';
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, TAU);
  ctx.fill();
}

export function dessinerFin(ecran: Ecran, partie: Partie, temps: number): void {
  const fin = partie.fin;
  if (!fin) return;
  const { ctx, W, H } = ecran;
  const { etape, k } = tempsFin(fin.t);

  // La caméra du jeu n'a plus de sens ici : la scène se dessine en
  // coordonnées d'écran, et `dessinerTete` lit `cam`. Sans cette remise à
  // zéro, Falot se dessinait quelque part hors champ, dans l'étage d'avant.
  ecran.cam.x = 0;
  ecran.cam.y = 0;
  ctx.fillStyle = '#08080e';
  ctx.fillRect(0, 0, W, H);

  const sol = H * 0.72;
  const haut = Math.min(H * 0.16, 96);

  // --- LA CHUTE : il n'y a plus de rue, il n'y a que le puits ---
  if (etape === 'chute') {
    const chute = k * k; // elle accélère
    const fy = H * 0.3 + chute * H * 0.5;
    // les paliers défilent vers le haut, de plus en plus vite
    ctx.strokeStyle = 'rgba(255,255,255,0.09)';
    ctx.lineWidth = 2;
    const large = Math.min(W * 0.34, CASE * 2.2);
    ctx.fillStyle = '#12121a';
    ctx.fillRect(0, 0, W / 2 - large, H);
    ctx.fillRect(W / 2 + large, 0, W, H);
    const ecart = 160;
    const defile = (chute * 2600) % ecart;
    ctx.beginPath();
    for (let i = -1; i < H / ecart + 2; i++) {
      const y = i * ecart - defile;
      ctx.moveTo(W / 2 - large, y);
      ctx.lineTo(W / 2 - D.taille * 1.3, y);
      ctx.moveTo(W / 2 + D.taille * 1.3, y);
      ctx.lineTo(W / 2 + large, y);
    }
    ctx.stroke();
    // Ce qui lui reste de lumière le suit avec du retard : des filets, pas des
    // boules — une traîne ronde se lit comme une chenille.
    for (let i = 1; i < 12; i++) {
      const ty = fy - i * 22 * (0.5 + chute);
      ctx.fillStyle = `rgba(143,208,255,${0.2 * (1 - i / 12)})`;
      ctx.fillRect(W / 2 - 1.2, ty, 2.4, 10 + 14 * chute);
    }
    corps.x = W / 2;
    corps.y = fy;
    corps.sx = 0.86;
    corps.sy = 1.16; // étiré par la chute
    ctx.save();
    ctx.translate(-0, 0);
    dessinerTete(ecran, corps, '#8fd0ff', D.taille, true, 1, 'peur', temps, 1);
    ctx.restore();
    phrase(ecran, FIN.chute, haut, clamp((k - 0.25) / 0.7, 0, 1));
    // le noir se referme à la toute fin
    if (k > 0.82) {
      ctx.fillStyle = `rgba(8,8,14,${(k - 0.82) / 0.18})`;
      ctx.fillRect(0, 0, W, H);
    }
    return;
  }

  // --- la rue, commune aux trois premiers temps ---
  // Elle s'éteint pendant l'oubli : la lumière revient aux autres, pas à lui.
  const nuit = etape === 'oubli' ? clamp((k - 0.55) / 0.45, 0, 1) : 0;
  const xSien = placeDe(W, SIEN);
  // LA CAMÉRA GLISSE VERS EUX. Les autres ont retrouvé les leurs ; à partir
  // de là il n'y a plus qu'eux deux, et le cadre doit le dire.
  const pano =
    (etape === 'retrouvailles'
      ? 0
      : etape === 'retrouve'
        ? clamp((k - 0.08) / 0.5, 0, 1)
        : 1) *
    (W * 0.5 - xSien);
  ctx.save();
  ctx.translate(pano, 0);

  rue(ecran, sol, nuit);

  // Combien d'âmes on a vraiment remontées. Au moins trois, sinon la rue ne
  // raconte rien ; jamais plus que de gens dedans.
  const remontees = partie.montee.reduce((a, m) => a + m.ames, 0);
  const combien = clamp(Math.max(3, remontees), 3, GENS - 1);

  for (let i = 0; i < GENS; i++) {
    const x = placeDe(W, i);
    const h = H * 0.1 * (0.9 + ((i * 29) % 7) / 30);
    // le sien reste éteint jusqu'au bout ; les autres s'allument tour à tour
    let vif = 0;
    if (i !== SIEN && i <= combien) {
      if (etape === 'retrouvailles') vif = clamp((k - 0.12 - i * 0.1) / 0.1, 0, 1);
      else vif = 1 - nuit * 0.8;
    }
    personne(ecran, x, sol, h, vif);
  }

  if (etape === 'retrouvailles') {
    // les petites lumières montent des Dessous et vont chacune à la sienne
    for (let i = 1; i <= combien; i++) {
      const depart = clamp((k - i * 0.1) / 0.22, 0, 1);
      if (depart <= 0 || depart >= 1) continue;
      ameQuiRemonte(ecran, W / 2, H + 40, placeDe(W, i), sol - H * 0.1 * 0.75, depart);
    }
    ctx.restore();
    phrase(ecran, FIN.retrouvailles, haut, k);
    return;
  }

  // --- Falot, et le sien ---
  const hSien = H * 0.1 * 0.9;
  // Il est petit : en bas il fait la taille d'une âme, ici il fait la taille
  // d'une lampe qu'on tient dans la main. C'est tout le personnage.
  const taille = D.taille * 0.62;
  // il monte du sol (il sort des Dessous), puis il s'approche, puis il recule
  const venue = etape === 'retrouve' ? clamp(k / 0.4, 0, 1) : 1;
  const approche = etape === 'retrouve' ? clamp((k - 0.35) / 0.55, 0, 1) : 1;
  const recul = etape === 'oubli' ? clamp((k - 0.45) / 0.35, 0, 1) : 0;
  const poitrine = sol - hSien * 0.62;
  const fx = xSien + taille * 2 - taille * 0.95 * approche + taille * 2.4 * recul;
  const fy = sol + taille - (sol + taille - poitrine) * venue;

  // le fil qui se tend entre eux, et qui casse
  const tendu = clamp((approche - 0.6) / 0.4, 0, 1) * (1 - recul);
  if (tendu > 0.01) {
    ctx.strokeStyle = `rgba(255,233,168,${0.55 * tendu})`;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(fx - taille * 0.4, fy);
    ctx.lineTo(xSien + hSien * 0.1, poitrine);
    ctx.stroke();
  }

  // Le sien : il s'éclaire un peu quand il reconnaît — juste assez pour qu'on
  // le voie, jamais autant que les autres. C'est ce qui rend l'oubli dur.
  const reconnait = etape === 'retrouve' ? clamp((k - 0.25) / 0.4, 0, 1) : 1 - recul;
  personne(ecran, xSien, sol, hSien, reconnait * 0.42);

  corps.x = fx;
  corps.y = fy;
  corps.sx = 1;
  corps.sy = 1;
  dessinerTete(
    ecran,
    corps,
    etape === 'oubli' && recul > 0.5 ? '#8fd0ff' : '#ffe9a8',
    taille,
    true,
    venue,
    etape === 'oubli' && recul > 0.2 ? 'inquiet' : 'intrigue',
    temps,
    1,
  );
  ctx.restore();

  if (etape === 'retrouve') phrase(ecran, FIN.retrouve, haut, k);
  else phrase(ecran, FIN.oubli, haut, clamp((k - 0.5) / 0.5, 0, 1));
}
