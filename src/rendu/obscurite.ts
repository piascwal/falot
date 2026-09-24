/**
 * L'OBSCURITÉ — le calque des trous, adouci, retourné en nuit, posé sur l'image.
 *
 * `scene.ts` perce les trous de lumière dans `ecran.trou` (voir `lumiere.ts`).
 * Ce fichier fait le reste : adoucir leur bord (la PÉNOMBRE), en déduire la nuit
 * qui reste, et la poser sur l'image. C'était trois lignes — un `filter: blur`
 * et deux `drawImage` — et c'était LA MOITIÉ DU COÛT DE L'IMAGE.
 *
 * Mesuré en coupant chaque étape tour à tour, processeur bridé ×4 : le calque
 * d'obscurité prenait 35 à 40 ms sur une image de 55 à 65. Les perçages
 * eux-mêmes ne coûtaient presque rien : vider le calque des trous juste avant
 * de le flouter ne changeait rien au temps. C'est le FILTRE qui coûtait, quel
 * que soit ce qu'il floute — il alloue une surface, la floute en deux passes,
 * et le navigateur le rastérise sur le processeur quand la toile n'est pas sur
 * la carte graphique. C'est lui aussi qui faisait tomber la finesse de l'écran
 * à 0,8 au bout d'une seconde.
 *
 * Et même sans le filtre, il restait la copie : la nuit, calculée à
 * demi-résolution, était recopiée sur l'image étirée du double — un cinquième
 * du temps de calcul à elle seule, mesuré au profileur. ELLE N'EST PLUS
 * RECOPIÉE : sa toile est posée dans la page, par-dessus le jeu, et c'est le
 * navigateur qui l'étire en composant la page. Ce qui se dessinait après elle
 * va sur les calques `lueur` et `dessus` (voir `ecran.ts`).
 *
 * TROIS FAÇONS DE FAIRE LA MÊME IMAGE, choisies une fois pour toutes :
 *
 *   — `webgl` : le flou est un vrai flou gaussien, en deux passes sur la carte
 *     graphique, et la nuit est calculée dans la même passe. Le calque des
 *     trous y monte comme texture, et la toile WebGL est elle-même le calque
 *     posé dans la page : aucune copie entre WebGL et le canevas 2D.
 *   — `reduction` : sans WebGL, on n'utilise plus de filtre. On réduit le
 *     calque deux fois de moitié (chaque réduction exacte de moitié fait la
 *     moyenne de quatre pixels), puis on le ré-agrandit en lissage bilinéaire.
 *     Une boîte de quatre suivie d'une tente de quatre, c'est un flou d'écart
 *     type 2 : exactement la `PENOMBRE` d'avant, pour trois petits `drawImage`.
 *   — `filtre` : l'ancienne façon, gardée pour comparer (`?lumiere=filtre`).
 *
 * WebGL n'est pris que s'il tourne VRAIMENT sur une carte graphique : un WebGL
 * émulé sur le processeur (SwiftShader, llvmpipe…) est plus lent que la
 * réduction. Et s'il se perd en route (onglet en arrière-plan sur un téléphone,
 * pilote qui décroche), on bascule sur la réduction sans rien dire.
 */

import type { Ecran } from './ecran.js';
import { PENOMBRE } from './lumiere.js';

export type Mode = 'webgl' | 'reduction' | 'filtre';

/** La nuit elle-même : un bleu-noir presque opaque. */
const NUIT = [8, 8, 14] as const;
const OPACITE = 0.975;

let mode: Mode | null = null;

/** Le mode retenu, pour l'afficher ou le mesurer. */
export function modeObscurite(): Mode | null {
  return mode;
}

/** Ce qu'on peut forcer à la main pour comparer : `?lumiere=reduction`. */
function force(): Mode | null {
  try {
    const m = new URLSearchParams(location.search).get('lumiere');
    return m === 'webgl' || m === 'reduction' || m === 'filtre' ? m : null;
  } catch {
    return null;
  }
}

/**
 * Adoucit `ecran.trou`, en déduit la nuit et la pose sur `ecran.ctx`, à la
 * taille de l'écran. `ecran.trou` doit être complet : tous les perçages de
 * l'image y sont.
 */
export function poserLObscurite(ecran: Ecran): void {
  utilise = true;
  if (!mode) {
    const voulu = force();
    mode = voulu ?? (gl.ouvrir(ecran, false) ? 'webgl' : 'reduction');
    if (mode === 'webgl' && !gl.ouvrir(ecran, voulu === 'webgl')) mode = 'reduction';
  }
  if (mode === 'webgl' && !gl.poser(ecran)) mode = 'reduction';
  if (mode === 'webgl' && gl.etat) {
    montrer(ecran, gl.etat.toile);
    return;
  }
  montrer(ecran, ecran.lum);

  const { lum, lctx } = ecran;
  lctx.setTransform(1, 0, 0, 1, 0, 0);
  lctx.globalCompositeOperation = 'source-over';
  lctx.fillStyle = `rgba(${NUIT[0]},${NUIT[1]},${NUIT[2]},${OPACITE})`;
  lctx.fillRect(0, 0, lum.width, lum.height);
  lctx.globalCompositeOperation = 'destination-out';
  if (mode === 'filtre') {
    lctx.filter = `blur(${PENOMBRE}px)`;
    lctx.drawImage(ecran.trou, 0, 0);
    lctx.filter = 'none';
  } else {
    lctx.imageSmoothingEnabled = true;
    // on ne reprend que la partie utile du quart : l'arrondi des tailles y
    // laisse parfois une rangée vide, qui décalerait tout à l'agrandissement
    const q = reduire(ecran.trou);
    const t = ecran.trou;
    lctx.drawImage(q, 0, 0, t.width / 4, t.height / 4, 0, 0, lum.width, lum.height);
  }
  lctx.globalCompositeOperation = 'source-over';
}

// ---------------------------------------------------------------------------
// LES CALQUES DANS LA PAGE
// ---------------------------------------------------------------------------

/** La toile qui porte la nuit en ce moment : `lum`, ou celle de WebGL. */
let nuit: HTMLCanvasElement | null = null;
/** La nuit a-t-elle été posée pendant l'image en cours ? */
let utilise = false;
let visibles = false;

function montrer(ecran: Ecran, toile: HTMLCanvasElement): void {
  if (nuit === toile) return;
  nuit?.remove();
  nuit = toile;
  toile.className = 'calque';
  toile.hidden = !visibles;
  // juste après le jeu, donc sous `lueur` et `dessus`
  ecran.canvas.after(toile);
}

/** Au début de chaque image. */
export function ouvrirLesCalques(): void {
  utilise = false;
}

/**
 * À la fin de chaque image : les calques ne restent affichés que si le monde
 * a été dessiné. Le bilan, la cage, la fin se dessinent seuls sur le jeu, et
 * la nuit de la dernière image resterait sinon posée sur eux.
 */
export function fermerLesCalques(ecran: Ecran): void {
  if (utilise === visibles) return;
  visibles = utilise;
  for (const t of [nuit, ecran.lueur, ecran.dessus]) if (t) t.hidden = !visibles;
}

/** Vide un calque et le remet à l'échelle du monde. */
export function effacer(c: CanvasRenderingContext2D, echelle: number): void {
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.globalCompositeOperation = 'source-over';
  c.globalAlpha = 1;
  c.clearRect(0, 0, c.canvas.width, c.canvas.height);
  c.setTransform(echelle, 0, 0, echelle, 0, 0);
}

// ---------------------------------------------------------------------------
// LA RÉDUCTION — le flou sans filtre
// ---------------------------------------------------------------------------

// créées au premier usage : le module se charge aussi hors navigateur (tests)
let moitie: HTMLCanvasElement | null = null;
let quart: HTMLCanvasElement | null = null;

/**
 * Deux réductions de moitié. Chacune place le centre de chaque pixel d'arrivée
 * exactement au coin commun de quatre pixels de départ : le lissage bilinéaire
 * en fait alors la moyenne exacte, sans en sauter aucun. D'où le choix de deux
 * réductions de moitié plutôt qu'une seule au quart, qui ne lirait qu'un pixel
 * sur quatre et scintillerait.
 */
function reduire(source: HTMLCanvasElement): HTMLCanvasElement {
  moitie ??= document.createElement('canvas');
  quart ??= document.createElement('canvas');
  const w1 = Math.ceil(source.width / 2);
  const h1 = Math.ceil(source.height / 2);
  const w2 = Math.ceil(w1 / 2);
  const h2 = Math.ceil(h1 / 2);
  if (moitie.width !== w1 || moitie.height !== h1) {
    moitie.width = w1;
    moitie.height = h1;
  }
  if (quart.width !== w2 || quart.height !== h2) {
    quart.width = w2;
    quart.height = h2;
  }
  const c1 = moitie.getContext('2d');
  const c2 = quart.getContext('2d');
  if (!c1 || !c2) return source;
  c1.clearRect(0, 0, w1, h1);
  c1.imageSmoothingEnabled = true;
  c1.drawImage(source, 0, 0, source.width / 2, source.height / 2);
  c2.clearRect(0, 0, w2, h2);
  c2.imageSmoothingEnabled = true;
  c2.drawImage(moitie, 0, 0, w1, h1, 0, 0, w1 / 2, h1 / 2);
  return quart;
}

// ---------------------------------------------------------------------------
// WEBGL — le flou sur la carte graphique
// ---------------------------------------------------------------------------

const SOMMETS = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`;

/**
 * Une passe de flou gaussien, sur l'alpha seul — c'est tout ce que porte le
 * calque des trous. Treize prises, de -6 à +6 : trois écarts types, au-delà
 * le poids ne se voit plus. Pour la seconde passe, `nuit` vaut 1 et on sort
 * directement la nuit qui reste, prémultipliée.
 */
const FLOU = `
precision mediump float;
uniform sampler2D t;
uniform vec2 taille;
uniform vec2 pas;
uniform float nuit;
uniform vec3 couleur;
uniform float opacite;
void main() {
  vec2 uv = gl_FragCoord.xy / taille;
  float a = 0.0;
  float somme = 0.0;
  for (int i = -6; i <= 6; i++) {
    float f = float(i);
    float w = exp(-f * f / ${(2 * PENOMBRE * PENOMBRE).toFixed(1)});
    a += texture2D(t, uv + pas * f).a * w;
    somme += w;
  }
  a /= somme;
  if (nuit > 0.5) {
    float reste = opacite * (1.0 - a);
    gl_FragColor = vec4(couleur * reste, reste);
  } else {
    gl_FragColor = vec4(0.0, 0.0, 0.0, a);
  }
}
`;

interface Etat {
  toile: HTMLCanvasElement;
  g: WebGLRenderingContext;
  prog: WebGLProgram;
  source: WebGLTexture;
  inter: WebGLTexture;
  fbo: WebGLFramebuffer;
  u: Record<
    'taille' | 'pas' | 'nuit' | 'couleur' | 'opacite' | 't',
    WebGLUniformLocation | null
  >;
  w: number;
  h: number;
  perdu: boolean;
}

const gl = {
  etat: null as Etat | null,

  /** Prépare le contexte. `memeEmule` : on le prend même sur un WebGL émulé
   *  (quand on le force à la main pour le mesurer). */
  ouvrir(ecran: Ecran, memeEmule: boolean): boolean {
    if (this.etat) return !this.etat.perdu;
    try {
      const toile = document.createElement('canvas');
      const g = toile.getContext('webgl', {
        alpha: true,
        premultipliedAlpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        preserveDrawingBuffer: false,
      });
      if (!g) return false;
      if (!memeEmule && emule(g)) return false;
      const prog = programme(g);
      const source = g.createTexture();
      const inter = g.createTexture();
      const fbo = g.createFramebuffer();
      const tampon = g.createBuffer();
      if (!prog || !source || !inter || !fbo || !tampon) return false;
      // un seul triangle qui couvre tout l'écran
      g.bindBuffer(g.ARRAY_BUFFER, tampon);
      g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), g.STATIC_DRAW);
      const p = g.getAttribLocation(prog, 'p');
      g.enableVertexAttribArray(p);
      g.vertexAttribPointer(p, 2, g.FLOAT, false, 0, 0);
      g.useProgram(prog);
      for (const t of [source, inter]) {
        g.bindTexture(g.TEXTURE_2D, t);
        g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.LINEAR);
        g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.LINEAR);
        g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE);
        g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);
      }
      const u = {
        taille: g.getUniformLocation(prog, 'taille'),
        pas: g.getUniformLocation(prog, 'pas'),
        nuit: g.getUniformLocation(prog, 'nuit'),
        couleur: g.getUniformLocation(prog, 'couleur'),
        opacite: g.getUniformLocation(prog, 'opacite'),
        t: g.getUniformLocation(prog, 't'),
      };
      g.uniform3f(u.couleur, NUIT[0] / 255, NUIT[1] / 255, NUIT[2] / 255);
      g.uniform1f(u.opacite, OPACITE);
      g.uniform1i(u.t, 0);
      // Le calque des trous arrive d'une toile 2D, la tête en bas pour WebGL.
      g.pixelStorei(g.UNPACK_FLIP_Y_WEBGL, true);
      const etat: Etat = {
        toile,
        g,
        prog,
        source,
        inter,
        fbo,
        u,
        w: 0,
        h: 0,
        perdu: false,
      };
      toile.addEventListener('webglcontextlost', (e) => {
        e.preventDefault();
        etat.perdu = true;
      });
      this.etat = etat;
      return this.taille(ecran);
    } catch {
      return false;
    }
  },

  taille(ecran: Ecran): boolean {
    const e = this.etat;
    if (!e) return false;
    const w = ecran.trou.width;
    const h = ecran.trou.height;
    if (e.w === w && e.h === h) return true;
    const { g } = e;
    e.toile.width = w;
    e.toile.height = h;
    g.bindTexture(g.TEXTURE_2D, e.inter);
    g.texImage2D(g.TEXTURE_2D, 0, g.RGBA, w, h, 0, g.RGBA, g.UNSIGNED_BYTE, null);
    g.bindFramebuffer(g.FRAMEBUFFER, e.fbo);
    g.framebufferTexture2D(g.FRAMEBUFFER, g.COLOR_ATTACHMENT0, g.TEXTURE_2D, e.inter, 0);
    const ok = g.checkFramebufferStatus(g.FRAMEBUFFER) === g.FRAMEBUFFER_COMPLETE;
    g.bindFramebuffer(g.FRAMEBUFFER, null);
    e.w = w;
    e.h = h;
    return ok;
  },

  /** Rend faux s'il faut basculer sur la réduction. */
  poser(ecran: Ecran): boolean {
    const e = this.etat;
    if (!e || e.perdu || e.g.isContextLost() || !this.taille(ecran)) return false;
    const { g, u, w, h } = e;
    g.viewport(0, 0, w, h);
    g.uniform2f(u.taille, w, h);
    g.activeTexture(g.TEXTURE0);
    // 1. le calque des trous monte
    g.bindTexture(g.TEXTURE_2D, e.source);
    g.texImage2D(g.TEXTURE_2D, 0, g.RGBA, g.RGBA, g.UNSIGNED_BYTE, ecran.trou);
    // 2. flou horizontal, dans la texture intermédiaire
    g.bindFramebuffer(g.FRAMEBUFFER, e.fbo);
    g.uniform2f(u.pas, 1 / w, 0);
    g.uniform1f(u.nuit, 0);
    g.drawArrays(g.TRIANGLES, 0, 3);
    // 3. flou vertical, et la nuit qui reste, dans la toile
    g.bindFramebuffer(g.FRAMEBUFFER, null);
    g.bindTexture(g.TEXTURE_2D, e.inter);
    g.uniform2f(u.pas, 0, 1 / h);
    g.uniform1f(u.nuit, 1);
    g.drawArrays(g.TRIANGLES, 0, 3);
    return true;
  },
};

/**
 * Un WebGL qui tourne sur le processeur. Mesuré ici même (SwiftShader,
 * processeur bridé ×4) : 50 ms de calcul par image au lieu de 11 pour la
 * réduction. Le flou y est fait pixel par pixel en logiciel, et la toile doit
 * en plus faire l'aller-retour entre les deux mondes.
 */
export const estEmule = (nomDuRendu: string): boolean =>
  /swiftshader|llvmpipe|softpipe|software|basic render/i.test(nomDuRendu);

function emule(g: WebGLRenderingContext): boolean {
  const info = g.getExtension('WEBGL_debug_renderer_info');
  return estEmule(
    String(g.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : g.RENDERER) || ''),
  );
}

function programme(g: WebGLRenderingContext): WebGLProgram | null {
  const vs = g.createShader(g.VERTEX_SHADER);
  const fs = g.createShader(g.FRAGMENT_SHADER);
  const p = g.createProgram();
  if (!vs || !fs || !p) return null;
  g.shaderSource(vs, SOMMETS);
  g.shaderSource(fs, FLOU);
  g.compileShader(vs);
  g.compileShader(fs);
  g.attachShader(p, vs);
  g.attachShader(p, fs);
  g.linkProgram(p);
  return g.getProgramParameter(p, g.LINK_STATUS) ? p : null;
}
