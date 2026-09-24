/**
 * LE DIAGNOSTIC — `?diag` dans l'adresse.
 *
 * On ne mesure le jeu que sur une machine sans carte graphique, processeur
 * bridé pour imiter un téléphone. Ça dit où part le calcul ; ça ne dit rien de
 * ce que fait la carte graphique d'un vrai téléphone, et c'est justement là
 * qu'une optimisation s'est retournée contre nous (les calques, voir
 * `rendu/ecran.ts`). Ce bandeau donne, sur l'appareil lui-même, les chiffres
 * qui permettent de trancher : combien d'images par seconde, combien de
 * millisecondes entre deux, combien de calcul dedans, à quelle finesse, et
 * par quel chemin passe la nuit.
 *
 * Rien n'est mesuré ni affiché sans `?diag` : pas un octet de plus pour qui
 * joue.
 */

import { CALQUES, type Ecran } from '../rendu/ecran.js';
import { modeObscurite } from '../rendu/obscurite.js';

/** Le nom de la carte graphique, tel que le navigateur le donne. */
function carte(): string {
  try {
    const g = document.createElement('canvas').getContext('webgl');
    if (!g) return 'pas de WebGL';
    const info = g.getExtension('WEBGL_debug_renderer_info');
    const nom = String(g.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : g.RENDERER));
    g.getExtension('WEBGL_lose_context')?.loseContext();
    return nom;
  } catch {
    return '?';
  }
}

export function brancherDiagnostic(ecran: Ecran): void {
  const bandeau = document.createElement('div');
  bandeau.className = 'diagnostic';
  document.body.appendChild(bandeau);
  const nomCarte = carte();

  const ecarts: number[] = [];
  let avant = performance.now();
  const compter = (t: number) => {
    ecarts.push(t - avant);
    avant = t;
    if (ecarts.length > 120) ecarts.shift();
    requestAnimationFrame(compter);
  };
  requestAnimationFrame(compter);

  const moyenne = (v: number[]) => (v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0);
  setInterval(() => {
    const tri = [...ecarts].sort((a, b) => a - b);
    const image = moyenne(ecarts);
    const p95 = tri[Math.floor(tri.length * 0.95)] ?? 0;
    const calcul = moyenne(ecran.coutsImage.slice(-60));
    bandeau.textContent = [
      `${image ? Math.round(1000 / image) : 0} i/s`,
      `image ${image.toFixed(1)} ms (p95 ${p95.toFixed(0)})`,
      `calcul ${calcul.toFixed(1)} ms`,
      `finesse ${ecran.DPR.toFixed(2)} · ${ecran.canvas.width}×${ecran.canvas.height}`,
      `nuit ${modeObscurite() ?? '—'}${CALQUES ? ' · calques' : ''}`,
      nomCarte,
    ].join('\n');
  }, 500);
}
