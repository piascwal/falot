/**
 * Les couleurs du jeu sont écrites en hexadécimal une seule fois, dans
 * `formes.ts`. Tout le reste s'en sert par ces quatre fonctions : un corps
 * éclairé s'éclaircit, un contour s'assombrit, un halo se transparentise.
 */

function melange(hex: string, vers: number, t: number): string {
  const n = Number.parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) =>
    Math.round(v + (vers - v) * t),
  );
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

export const eclaircir = (hex: string, t: number): string => melange(hex, 255, t);
export const assombrir = (hex: string, t: number): string => melange(hex, 0, t);

export const rgba = (hex: string, a: number): string => {
  const n = Number.parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};
