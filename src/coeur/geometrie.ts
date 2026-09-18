/** Les quelques mesures qui servent partout. Rien ici ne connaît le jeu. */

export const TAU = Math.PI * 2;

export const clamp = (v: number, a: number, b: number): number =>
  v < a ? a : v > b ? b : v;

/** L'écart signé le plus court de `a` vers `b`, dans ]-π, π]. */
export function ecartAngle(a: number, b: number): number {
  let d = (b - a) % TAU;
  if (d > Math.PI) d -= TAU;
  if (d < -Math.PI) d += TAU;
  return d;
}

export const distance = (x1: number, y1: number, x2: number, y2: number): number =>
  Math.hypot(x2 - x1, y2 - y1);
