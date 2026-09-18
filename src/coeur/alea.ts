/**
 * Le hasard du jeu, et il est TOUJOURS reproductible. Une graine donnée doit
 * rendre le même étage, sur n'importe quelle machine et dans dix ans : c'est ce
 * qui permet de tester la génération, et c'est aussi ce qui rend un plan
 * partageable par son seul nom.
 */

/** Générateur de bruit blanc de Mulberry, 32 bits d'état. */
export function mulberry32(a: number): () => number {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Une graine numérique à partir d'un nom lisible (« LUX-1042 »), par FNV-1a. */
export function grainDepuisTexte(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
