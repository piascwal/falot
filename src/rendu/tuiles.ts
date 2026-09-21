/**
 * LE TILESET — la matière du sol et des murs.
 *
 * Le sol était un aplat `#1a1a26` et les murs n'étaient pas dessinés du tout :
 * on voyait le fond noir. C'est lisible, et c'est vide. Ce fichier fabrique de
 * la PIERRE — des dalles, du grain, des joints, des éclats — et le jeu la pose
 * case par case.
 *
 * LA RÈGLE, et elle décide de tout : **une tuile ne contient aucune lumière.**
 * Pas de face claire en haut et sombre en bas, pas d'ombre portée d'un caillou,
 * pas de soleil imaginaire. Une torche peut arriver par la droite, et la tuile
 * dirait le contraire. Une tuile, c'est de la matière en nuances sombres — et
 * c'est le moteur qui la révèle, à chaque image, depuis la bonne direction.
 *
 * Une seule exception, et elle n'en est pas une : le CONTACT entre un mur et
 * un sol s'assombrit. Ça ne vient d'aucune direction — c'est de l'occlusion,
 * pas de l'éclairage, et sans elle les cases flottent les unes sur les autres.
 *
 * ON LES FABRIQUE AU CHARGEMENT, pas à la compilation : quelques millisecondes
 * une fois pour toutes, rien à télécharger, et on peut changer la pierre en
 * changeant trois nombres. Une vraie planche dessinée à la main prendra leur
 * place par `rendu/atlas.ts` le jour où elle existera.
 */

import { CASE } from '../coeur/dimensions.js';
import { TAU } from '../coeur/geometrie.js';

/** On dessine à deux fois la taille d'une case : net sur un écran à deux
 *  pixels par point, qui est la règle sur téléphone. */
const FIN = 2;
const T = CASE * FIN;
/** Combien de pierres différentes. Assez pour qu'on ne voie pas le damier,
 *  assez peu pour que la fabrication reste instantanée. */
const VARIANTES = 6;

/** Un hasard tenu en laisse : la même pierre à chaque partie. */
function des(graine: number): () => number {
  let a = graine >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Un caillou, dessiné NEUF FOIS : à sa place, et décalé d'une tuile dans les
 * huit directions. C'est ce qui rend la tuile raccordable — un caillou qui
 * déborde à droite rentre par la gauche, et on ne voit plus la grille.
 */
function caillou(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  angle: number,
  teinte: string,
): void {
  c.fillStyle = teinte;
  for (let dx = -1; dx <= 1; dx++)
    for (let dy = -1; dy <= 1; dy++) {
      const px = x + dx * T;
      const py = y + dy * T;
      if (px + w < -4 || px > T + 4 || py + h < -4 || py > T + 4) continue;
      c.save();
      // De travers, toujours un peu : des rectangles bien d'équerre se lisent
      // comme du carrelage, et personne n'a carrelé les Dessous.
      c.translate(px + w / 2, py + h / 2);
      c.rotate(angle);
      c.beginPath();
      c.roundRect(-w / 2, -h / 2, w, h, r);
      c.fill();
      c.restore();
    }
}

/**
 * LES TACHES DE FOND : trois ou quatre nappes très larges, à peine plus
 * claires ou plus sombres. C'est ce qui empêche une tuile d'être plate — sans
 * elles, le grain seul fait du bruit de télévision sur un aplat.
 */
function nappes(c: CanvasRenderingContext2D, d: () => number, force: number): void {
  for (let i = 0; i < 4; i++) {
    const x = d() * T;
    const y = d() * T;
    const r = T * (0.35 + d() * 0.4);
    const v = Math.round((d() - 0.5) * force);
    for (let dx = -1; dx <= 1; dx++)
      for (let dy = -1; dy <= 1; dy++) {
        const px = x + dx * T;
        const py = y + dy * T;
        if (px + r < 0 || px - r > T || py + r < 0 || py - r > T) continue;
        const g = c.createRadialGradient(px, py, 0, px, py, r);
        const t = v > 0 ? '255,255,255' : '0,0,0';
        g.addColorStop(0, `rgba(${t},${Math.abs(v) / 255})`);
        g.addColorStop(1, `rgba(${t},0)`);
        c.fillStyle = g;
        c.beginPath();
        c.arc(px, py, r, 0, TAU);
        c.fill();
      }
  }
}

/**
 * LE GRAIN. Du bruit, posé par blocs de deux pixels sur deux : pixel par
 * pixel, ça fait de la neige de téléviseur et pas de la pierre — le détail
 * était plus fin que ce que l'écran peut montrer une fois la tuile réduite.
 */
function grain(c: CanvasRenderingContext2D, d: () => number, force: number): void {
  const img = c.getImageData(0, 0, T, T);
  const p = img.data;
  for (let y = 0; y < T; y += 2)
    for (let x = 0; x < T; x += 2) {
      const n = (d() - 0.5) * force;
      for (let j = 0; j < 2; j++)
        for (let i = 0; i < 2; i++) {
          const k = ((y + j) * T + (x + i)) * 4;
          p[k] = Math.max(0, Math.min(255, p[k] + n));
          p[k + 1] = Math.max(0, Math.min(255, p[k + 1] + n));
          p[k + 2] = Math.max(0, Math.min(255, p[k + 2] + n));
        }
    }
  c.putImageData(img, 0, 0);
}

/** Une fêlure : une ligne brisée, plus sombre que la pierre. */
function felure(c: CanvasRenderingContext2D, d: () => number, teinte: string): void {
  c.strokeStyle = teinte;
  c.lineWidth = 1 + d() * 1.4;
  c.lineCap = 'round';
  let x = d() * T;
  let y = d() * T;
  c.beginPath();
  c.moveTo(x, y);
  for (let i = 0; i < 4; i++) {
    x += (d() - 0.5) * T * 0.5;
    y += (d() - 0.5) * T * 0.5;
    c.lineTo(x, y);
  }
  c.stroke();
}

export interface Tuiles {
  sol: HTMLCanvasElement;
  mur: HTMLCanvasElement;
  cendre: HTMLCanvasElement;
  /** L'ombre de contact, cuite une fois par côté : haut, bas, gauche, droite.
   *  Fabriquer un dégradé par case et par côté coûtait une image de temps en
   *  temps ; quatre images à poser n'en coûtent aucune. */
  contacts: [HTMLCanvasElement, HTMLCanvasElement, HTMLCanvasElement, HTMLCanvasElement];
  /** Le côté d'une tuile dans la planche, en pixels. */
  taille: number;
  variantes: number;
}

/**
 * Une planche : `VARIANTES` tuiles côte à côte.
 *
 * Chaque tuile est fabriquée sur SA PROPRE toile, puis recopiée dans la
 * planche. C'est indispensable : `getImageData` ignore la translation du
 * contexte, donc poser le grain sur une planche déjà assemblée le remettait
 * six fois sur la première tuile et jamais sur les autres.
 */
function planche(
  fond: string,
  dessiner: (c: CanvasRenderingContext2D, d: () => number) => void,
): HTMLCanvasElement {
  const t = document.createElement('canvas');
  t.width = T * VARIANTES;
  t.height = T;
  const c = t.getContext('2d');
  if (!c) return t;
  for (let v = 0; v < VARIANTES; v++) {
    const une = document.createElement('canvas');
    une.width = T;
    une.height = T;
    const u = une.getContext('2d');
    if (!u) continue;
    u.fillStyle = fond;
    u.fillRect(0, 0, T, T);
    dessiner(u, des(0x1a2b + v * 7919));
    c.drawImage(une, v * T, 0);
  }
  return t;
}

/** Une ombre de contact, cuite pour un côté. `dir` : 0 haut, 1 bas, 2 gauche,
 *  3 droite. Elle ne vient d'aucune lumière — c'est de l'occlusion. */
function contact(dir: number): HTMLCanvasElement {
  const t = document.createElement('canvas');
  t.width = T;
  t.height = T;
  const c = t.getContext('2d');
  if (!c) return t;
  const dur = T * 0.3;
  const p: [number, number, number, number] =
    dir === 0
      ? [0, 0, 0, dur]
      : dir === 1
        ? [0, T, 0, T - dur]
        : dir === 2
          ? [0, 0, dur, 0]
          : [T, 0, T - dur, 0];
  const g = c.createLinearGradient(p[0], p[1], p[2], p[3]);
  g.addColorStop(0, 'rgba(0,0,0,0.55)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = g;
  c.fillRect(0, 0, T, T);
  return t;
}

let planches: Tuiles | null = null;

/** Fabrique les planches une fois, et les garde. */
export function tuiles(): Tuiles {
  if (planches) return planches;
  // LE SOL : lisse, poussiéreux, de grandes dalles à joints fins. Il doit se
  // faire oublier — c'est dessus qu'on marche, pas lui qu'on regarde.
  const sol = planche('#1a1a26', (c, d) => {
    for (let i = 0; i < 5; i++) {
      const w = T * (0.42 + d() * 0.5);
      const h = T * (0.38 + d() * 0.42);
      const g = 26 + Math.round(d() * 10); // peu de contraste : c'est plat
      caillou(
        c,
        d() * T - w * 0.3,
        d() * T - h * 0.3,
        w,
        h,
        T * 0.05,
        (d() - 0.5) * 0.14,
        `rgb(${g},${g},${g + 12})`,
      );
    }
    nappes(c, d, 22);
    grain(c, d, 12);
    for (let i = 0; i < 2; i++) felure(c, d, 'rgba(8,8,14,0.45)');
  });

  // LE MUR : de gros blocs entassés, des JOINTS NOIRS ET ÉPAIS, et beaucoup
  // plus de contraste que le sol.
  //
  // Les deux avaient la même texture, et on ne distinguait plus un couloir
  // d'une salle : un trait de séparation ne suffit pas à dire « ça monte ».
  // Ce qui le dit, c'est la STRUCTURE — le sol est lisse et fait de grandes
  // dalles, le mur est un tas de blocs avec du noir entre eux.
  const mur = planche('#050509', (c, d) => {
    for (let i = 0; i < 5; i++) {
      // des blocs francs, bien plus gros que les dalles du sol ; le fond
      // presque noir qui reste entre eux fait le mortier
      const w = T * (0.4 + d() * 0.34);
      const h = T * (0.36 + d() * 0.3);
      const g = 13 + Math.round(d() * 22); // beaucoup de contraste : c'est un tas
      caillou(
        c,
        d() * T - w * 0.3,
        d() * T - h * 0.3,
        w,
        h,
        T * 0.03,
        (d() - 0.5) * 0.4,
        `rgb(${g},${g},${g + 8})`,
      );
    }
    // des éclats : la pierre a été cassée pour être entassée, pas taillée
    for (let i = 0; i < 14; i++) {
      const r = T * (0.02 + d() * 0.06);
      const g = 8 + Math.round(d() * 24);
      caillou(
        c,
        d() * T,
        d() * T,
        r * 2,
        r * 1.6,
        r * 0.5,
        d() * 3,
        `rgb(${g},${g},${g + 6})`,
      );
    }
    nappes(c, d, 30);
    grain(c, d, 16);
    for (let i = 0; i < 4; i++) felure(c, d, 'rgba(0,0,0,0.75)');
  });

  const cendre = planche('#242430', (c, d) => {
    // LE SOL BRÛLÉ : plus clair, grumeleux, et il craque sous qui se presse.
    for (let i = 0; i < 90; i++) {
      const x = d() * T;
      const y = d() * T;
      const r = T * (0.004 + d() * d() * 0.035); // beaucoup de fins, peu de gros
      c.fillStyle = `rgba(190,198,214,${0.05 + d() * 0.16})`;
      for (let dx = -1; dx <= 1; dx++)
        for (let dy = -1; dy <= 1; dy++) {
          const px = x + dx * T;
          const py = y + dy * T;
          if (px + r < 0 || px - r > T || py + r < 0 || py - r > T) continue;
          c.beginPath();
          c.arc(px, py, r, 0, TAU);
          c.fill();
        }
    }
    nappes(c, d, 20);
    grain(c, d, 16);
  });

  planches = {
    sol,
    mur,
    cendre,
    contacts: [contact(0), contact(1), contact(2), contact(3)],
    taille: T,
    variantes: VARIANTES,
  };
  return planches;
}

/** Quelle variante pour cette case : la case est sa propre graine, sinon la
 *  pierre bougerait sous les pieds du joueur. */
export const variante = (cx: number, cy: number): number =>
  (((cx * 73856093) ^ (cy * 19349663)) >>> 0) % VARIANTES;
