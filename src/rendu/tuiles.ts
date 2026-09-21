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
/** Les tailles des objets, en pixels de jeu. Elles viennent de `torches.ts` et
 *  de la scène : la planche doit être dessinée à la taille où elle s'affiche,
 *  sinon on la redimensionne et le grain se brouille. */
export const TORCHE = { haut: CASE * 0.42, large: CASE * 0.1, tete: CASE * 0.17 };
export const PIERRE = 9;

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

/**
 * ÉGALISE LA MOYENNE D'UNE TUILE.
 *
 * C'était LE défaut, et il n'avait rien à voir avec la lumière : les six
 * variantes n'avaient pas la même luminosité moyenne, parce qu'une grande
 * dalle claire ou une nappe sombre décale la moyenne de toute la case. Posées
 * côte à côte, elles dessinaient donc une grille — et sous une lampe, ça se
 * lit comme si chaque tuile s'éclairait toute seule, par paliers, au lieu
 * d'un halo continu.
 *
 * On recale donc chaque tuile sur la MÊME moyenne après l'avoir dessinée. Le
 * détail reste (le grain, les joints, les fêlures), la marche disparaît.
 */
function egaliser(c: CanvasRenderingContext2D, cible: number): void {
  const img = c.getImageData(0, 0, T, T);
  const p = img.data;
  let somme = 0;
  for (let i = 0; i < p.length; i += 4) somme += p[i] + p[i + 1] + p[i + 2];
  const ecart = cible - somme / (p.length / 4) / 3;
  if (Math.abs(ecart) < 0.4) return;
  for (let i = 0; i < p.length; i += 4) {
    p[i] = Math.max(0, Math.min(255, p[i] + ecart));
    p[i + 1] = Math.max(0, Math.min(255, p[i + 1] + ecart));
    p[i + 2] = Math.max(0, Math.min(255, p[i + 2] + ecart));
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

/**
 * LES OBJETS — la torche et la pierre.
 *
 * Même règle que les tuiles : de la MATIÈRE, aucune lumière peinte. Un manche
 * de torche a du fil de bois et un collier de fer ; une pierre a des facettes
 * et du grain. Ce qui brille — la tête qui brûle — est peint par la scène,
 * par-dessus, parce que c'est elle qui sait ce qu'il reste de flamme.
 *
 * Ils étaient deux rectangles pleins et un rond blanc : à côté d'un sol qui a
 * maintenant du grain, ça se voyait.
 */
function objet(
  w: number,
  h: number,
  dessiner: (c: CanvasRenderingContext2D, d: () => number) => void,
): HTMLCanvasElement {
  const t = document.createElement('canvas');
  t.width = Math.round(w * FIN);
  t.height = Math.round(h * FIN);
  const c = t.getContext('2d');
  if (c) {
    c.scale(FIN, FIN);
    dessiner(c, des(0x5e1f));
  }
  return t;
}

/** Du grain sur un objet : le même bruit que sur la pierre, par blocs de deux
 *  pixels, mais découpé dans ce qui est déjà dessiné. */
function grainObjet(
  c: CanvasRenderingContext2D,
  w: number,
  h: number,
  force: number,
): void {
  const d = des(0x9a3c);
  c.save();
  c.globalCompositeOperation = 'source-atop';
  for (let y = 0; y < h; y += 1)
    for (let x = 0; x < w; x += 1) {
      const n = (d() - 0.5) * force;
      c.fillStyle = n > 0 ? `rgba(255,255,255,${n / 255})` : `rgba(0,0,0,${-n / 255})`;
      c.fillRect(x, y, 1, 1);
    }
  c.restore();
}

export interface Tuiles {
  sol: HTMLCanvasElement;
  mur: HTMLCanvasElement;
  cendre: HTMLCanvasElement;
  /** Le manche et le collier d'une torche : ce qui ne brûle pas. */
  torche: HTMLCanvasElement;
  /** Sa tête éteinte : du charbon. Allumée, c'est la scène qui la peint. */
  charbon: HTMLCanvasElement;
  /** Une pierre : la seule chose ici qui ne brille pas. */
  pierre: HTMLCanvasElement;
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
  /** La luminosité moyenne que TOUTES les variantes auront, de 0 à 255. */
  moyenne: number,
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
    egaliser(u, moyenne);
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

/**
 * ---------------------------------------------------------------------------
 * TROIS MURS À CHOISIR
 * ---------------------------------------------------------------------------
 *
 * Le sol et le mur parlaient le MÊME vocabulaire : `caillou()`, c'est-à-dire
 * des galets épars posés au hasard. Deux tailles, deux contrastes, mais le
 * même motif — donc on confondait une paroi avec un dallage, et un trait de
 * séparation ne suffit pas à dire « ça monte ».
 *
 * Le sol est parfait et on n'y touche pas. Ce qui change, c'est la GRAMMAIRE
 * du mur : un sol est posé, un mur est BÂTI ou TAILLÉ. Trois propositions.
 */

/** Une tuile est un carré de T sur T : toute distance s'y mesure en faisant
 *  le tour, sinon le motif ne se raccorde pas d'une case à l'autre. */
function distanceBouclee(dx: number, dy: number): number {
  const x = Math.min(Math.abs(dx), T - Math.abs(dx));
  const y = Math.min(Math.abs(dy), T - Math.abs(dy));
  return Math.hypot(x, y);
}

/**
 * A — L'APPAREIL. De vraies assises : des blocs rectangulaires posés en
 * rangées, décalés d'un demi-bloc d'une rangée à l'autre, et du mortier noir
 * entre eux. C'est la grammaire d'un MUR, celle qu'on lit sans y penser —
 * horizontale, régulière, empilée.
 *
 * Les mesures tombent juste sur la tuile (quatre assises de T/4, des blocs de
 * T/2) : les rangées se prolongent donc d'une case à l'autre au lieu de se
 * casser, et l'appareil traverse toute une paroi.
 */
const MUR_APPAREIL = (c: CanvasRenderingContext2D, d: () => number): void => {
  const assise = T / 4;
  const large = T / 2;
  const joint = T * 0.026;
  for (let rang = 0; rang < 4; rang++) {
    const y = rang * assise;
    const decal = rang % 2 ? large / 2 : 0;
    for (let i = -1; i <= 2; i++) {
      const x = decal + i * large;
      const g = 16 + Math.round(d() * 42); // chaque pierre a son ton
      const bx = x + joint;
      const by = y + joint;
      const bw = large - joint * 2;
      const bh = assise - joint * 2;
      c.fillStyle = `rgb(${g},${g},${g + 8})`;
      c.fillRect(bx, by, bw, bh);
      // Le lit et la table de la pierre, un ton de part et d'autre : sans eux
      // un bloc est un rectangle, avec eux c'est une pierre posée sur une
      // autre. Ce n'est pas de la lumière, c'est de l'usure — le haut d'une
      // assise s'écaille, le bas retient la crasse.
      c.fillStyle = `rgb(${g + 14},${g + 14},${g + 22})`;
      c.fillRect(bx, by, bw, joint);
      c.fillStyle = `rgb(${Math.max(0, g - 10)},${Math.max(0, g - 10)},${Math.max(0, g - 4)})`;
      c.fillRect(bx, by + bh - joint, bw, joint);
      // un éclat sur un bloc sur trois : la pierre a servi
      if (d() < 0.34) {
        const r = assise * (0.12 + d() * 0.16);
        c.fillStyle = `rgb(${Math.max(0, g - 16)},${Math.max(0, g - 16)},${Math.max(0, g - 10)})`;
        c.beginPath();
        c.ellipse(bx + d() * bw, by + d() * bh, r, r * 0.7, d() * 3, 0, TAU);
        c.fill();
      }
    }
  }
  nappes(c, d, 16);
  grain(c, d, 14);
  for (let i = 0; i < 3; i++) felure(c, d, 'rgba(0,0,0,0.85)');
};

/**
 * B — LE CYCLOPÉEN. Pas d'assises : de grosses pierres polygonales ajustées
 * les unes aux autres, chacune d'un ton différent, séparées par un joint noir
 * épais. C'est du mur monté sans équerre — et c'est le plus loin possible du
 * dallage régulier du sol.
 *
 * Le découpage est un Voronoï à distance bouclée : chaque pixel appartient à
 * la pierre dont le germe est le plus proche, en faisant le tour de la tuile.
 * C'est ce qui le rend raccordable sans une seule ligne de plus.
 */
const MUR_CYCLOPEEN = (c: CanvasRenderingContext2D, d: () => number): void => {
  const n = 7;
  const gx: number[] = [];
  const gy: number[] = [];
  const ton: number[] = [];
  for (let i = 0; i < n; i++) {
    gx.push(d() * T);
    gy.push(d() * T);
    ton.push(14 + Math.round(d() * 44));
  }
  const img = c.getImageData(0, 0, T, T);
  const p = img.data;
  const joint = T * 0.03;
  for (let y = 0; y < T; y++)
    for (let x = 0; x < T; x++) {
      let d1 = 1e9;
      let d2 = 1e9;
      let quel = 0;
      for (let i = 0; i < n; i++) {
        const dd = distanceBouclee(x - gx[i], y - gy[i]);
        if (dd < d1) {
          d2 = d1;
          d1 = dd;
          quel = i;
        } else if (dd < d2) d2 = dd;
      }
      // Près d'une frontière, c'est du mortier. Plus loin, c'est la pierre —
      // et elle s'assombrit vers son bord, ce qui lui donne du galbe.
      const bord = d2 - d1;
      const g =
        bord < joint
          ? 2 + Math.round((bord / joint) * 6)
          : ton[quel] - Math.round(Math.max(0, 1 - (bord - joint) / (T * 0.16)) * 12);
      const k = (y * T + x) * 4;
      p[k] = g;
      p[k + 1] = g;
      p[k + 2] = g + 8;
      p[k + 3] = 255;
    }
  c.putImageData(img, 0, 0);
  nappes(c, d, 18);
  grain(c, d, 16);
  for (let i = 0; i < 2; i++) felure(c, d, 'rgba(0,0,0,0.85)');
};

/**
 * C — LA PAROI TAILLÉE. Pas de blocs du tout : de la roche creusée, avec ses
 * strates horizontales et les coups de pic verticaux qui l'ont ouverte. C'est
 * un couloir percé, pas un mur monté — et dans les Dessous, c'est peut-être
 * plus juste que de la maçonnerie.
 */
const MUR_TAILLE = (c: CanvasRenderingContext2D, d: () => number): void => {
  // LES COUPS DE PIC : des colonnes verticales de tons voisins. C'est la
  // verticale qui dit « ça monte » — le sol n'a aucune direction, lui.
  const img = c.getImageData(0, 0, T, T);
  const p = img.data;
  const pas = Math.round(T * 0.045);
  const colonnes: number[] = [];
  for (let x = 0; x < T; x += pas) colonnes.push(10 + Math.round(d() * 34));
  // LES STRATES : quatre bandes horizontales, chacune d'un ton propre. Elles
  // se prolongent d'une case à l'autre parce qu'elles tombent sur la tuile.
  const strates = [0, 1, 2, 3].map(() => Math.round((d() - 0.5) * 18));
  for (let y = 0; y < T; y++) {
    const st = strates[Math.floor((y / T) * 4)];
    // le creux d'une strate : plus sombre juste sous sa limite
    const dans = ((y / T) * 4) % 1;
    const creux = dans < 0.1 ? -10 : dans > 0.9 ? 6 : 0;
    for (let x = 0; x < T; x++) {
      const col = colonnes[Math.floor(x / pas) % colonnes.length];
      // le coup de pic ondule : une colonne droite ferait un peigne
      const onde = Math.round(Math.sin(y * 0.08 + x * 0.3) * 4);
      const g = Math.max(0, Math.min(255, col + st + creux + onde));
      const k = (y * T + x) * 4;
      p[k] = g;
      p[k + 1] = g;
      p[k + 2] = g + 9;
      p[k + 3] = 255;
    }
  }
  c.putImageData(img, 0, 0);
  // quelques saillies : la roche n'est pas plane
  for (let i = 0; i < 5; i++) {
    const w = T * (0.06 + d() * 0.1);
    const h = T * (0.2 + d() * 0.5);
    const g = 6 + Math.round(d() * 34);
    caillou(
      c,
      d() * T,
      d() * T,
      w,
      h,
      T * 0.02,
      (d() - 0.5) * 0.1,
      `rgb(${g},${g},${g + 8})`,
    );
  }
  nappes(c, d, 20);
  grain(c, d, 15);
  for (let i = 0; i < 4; i++) felure(c, d, 'rgba(0,0,0,0.8)');
};

/** Les trois propositions, pour pouvoir les comparer côte à côte. */
export const MURS = {
  appareil: MUR_APPAREIL,
  cyclopeen: MUR_CYCLOPEEN,
  taille: MUR_TAILLE,
} as const;
export type NomMur = keyof typeof MURS;

/** Celui qui est en jeu. Provisoire : il n'en restera qu'un. */
let murChoisi: NomMur = 'appareil';
export function choisirMur(n: NomMur): void {
  murChoisi = n;
  planches = null;
}

/** Les trois murs dessinés, pour la planche de comparaison. Provisoire. */
export function apercuMurs(): Record<NomMur, HTMLCanvasElement> {
  return {
    appareil: planche('#050509', 26, MUR_APPAREIL),
    cyclopeen: planche('#050509', 26, MUR_CYCLOPEEN),
    taille: planche('#050509', 26, MUR_TAILLE),
  };
}

let planches: Tuiles | null = null;

/** Fabrique les planches une fois, et les garde. */
export function tuiles(): Tuiles {
  if (planches) return planches;
  // LE SOL : lisse, poussiéreux, de grandes dalles à joints fins. Il doit se
  // faire oublier — c'est dessus qu'on marche, pas lui qu'on regarde.
  const sol = planche('#20202e', 38, (c, d) => {
    // DES DALLES PETITES. Une grande dalle occupe presque toute la case, donc
    // son bord tombe sur le bord de la case : la grille se redessine toute
    // seule. Plus nombreuses et plus petites, elles se lisent comme un
    // appareillage irrégulier, et la case disparaît dedans.
    for (let i = 0; i < 14; i++) {
      const w = T * (0.16 + d() * 0.26);
      const h = T * (0.14 + d() * 0.22);
      const g = 34 + Math.round(d() * 10); // peu de contraste : c'est plat
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
    nappes(c, d, 10);
    grain(c, d, 12);
    for (let i = 0; i < 2; i++) felure(c, d, 'rgba(8,8,14,0.45)');
  });

  // LE MUR : voir les trois propositions plus haut. Le sol et lui parlaient
  // le même vocabulaire — des galets épars — et on confondait une paroi avec
  // un dallage. Ce qui les sépare maintenant, c'est la GRAMMAIRE : un sol est
  // posé, un mur est bâti ou taillé.
  const mur = planche('#050509', 26, MURS[murChoisi]);

  const cendre = planche('#2a2a38', 48, (c, d) => {
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

  // LE MANCHE D'UNE TORCHE : du bois fendu, un collier de fer. C'était une
  // barre pleine de 6 px de large, et elle n'avait plus rien à voir avec le
  // sol depuis que le sol a du grain.
  const torche = objet(TORCHE.large, TORCHE.haut, (c, d) => {
    const w = TORCHE.large;
    const h = TORCHE.haut;
    c.fillStyle = '#3a332c';
    c.beginPath();
    c.roundRect(0, 0, w, h, w * 0.3);
    c.fill();
    // le fil du bois : trois ou quatre traits verticaux, jamais droits
    for (let i = 0; i < 4; i++) {
      c.strokeStyle = d() > 0.5 ? 'rgba(90,78,64,0.55)' : 'rgba(18,15,12,0.6)';
      c.lineWidth = 0.7;
      let x = w * (0.2 + d() * 0.6);
      c.beginPath();
      c.moveTo(x, 0);
      for (let y = 0; y < h; y += h / 5) {
        x += (d() - 0.5) * w * 0.25;
        c.lineTo(x, y);
      }
      c.stroke();
    }
    // le collier : la seule pièce de métal, sous la tête
    c.fillStyle = '#5a5a64';
    c.fillRect(-w * 0.15, h * 0.16, w * 1.3, h * 0.1);
    c.fillStyle = 'rgba(0,0,0,0.45)';
    c.fillRect(-w * 0.15, h * 0.16 + h * 0.07, w * 1.3, h * 0.03);
    grainObjet(c, w, h, 34);
  });

  // LA TÊTE ÉTEINTE : du charbon, pas un carré gris.
  const charbon = objet(TORCHE.tete, TORCHE.tete, (c, d) => {
    const s = TORCHE.tete;
    for (let i = 0; i < 5; i++) {
      const g = 30 + Math.round(d() * 34);
      c.fillStyle = `rgb(${g},${g - 2},${g - 6})`;
      c.save();
      c.translate(s * (0.2 + d() * 0.6), s * (0.2 + d() * 0.6));
      c.rotate(d() * 3);
      c.beginPath();
      c.roundRect(-s * 0.3, -s * 0.24, s * 0.6, s * 0.48, s * 0.1);
      c.fill();
      c.restore();
    }
    grainObjet(c, s, s, 46);
  });

  // LA PIERRE : la seule chose ici qui ne brille pas. Des facettes, donc, et
  // aucune rondeur — un rond blanc se lisait comme une petite lumière, ce qui
  // est exactement le contraire de ce qu'elle est.
  const pierre = objet(PIERRE, PIERRE, (c, d) => {
    const s = PIERRE;
    c.fillStyle = '#4b505d';
    c.beginPath();
    c.moveTo(s * 0.5, s * 0.06);
    for (let i = 1; i < 7; i++) {
      const a2 = (i / 7) * TAU;
      const r = s * (0.36 + d() * 0.12);
      c.lineTo(s * 0.5 + Math.cos(a2 - 1.4) * r, s * 0.5 + Math.sin(a2 - 1.4) * r);
    }
    c.closePath();
    c.fill();
    // deux facettes, une claire et une sombre : c'est ça qui fait un caillou
    c.globalCompositeOperation = 'source-atop';
    c.fillStyle = 'rgba(150,160,182,0.4)';
    c.beginPath();
    c.moveTo(s * 0.18, s * 0.42);
    c.lineTo(s * 0.54, s * 0.16);
    c.lineTo(s * 0.66, s * 0.46);
    c.closePath();
    c.fill();
    c.fillStyle = 'rgba(20,22,30,0.5)';
    c.beginPath();
    c.moveTo(s * 0.3, s * 0.62);
    c.lineTo(s * 0.8, s * 0.5);
    c.lineTo(s * 0.62, s * 0.9);
    c.closePath();
    c.fill();
    c.globalCompositeOperation = 'source-over';
    grainObjet(c, s, s, 40);
  });

  planches = {
    sol,
    mur,
    cendre,
    torche,
    charbon,
    pierre,
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
