/**
 * Coupe une phrase en lignes courtes, sans couper les mots. Les murmures sont
 * dessinés dans le monde : une ligne trop longue sortirait de l'écran.
 */
export function decouper(texte: string, max: number): string[] {
  const mots = texte.split(' ');
  const out: string[] = [];
  let ligne = '';
  for (const m of mots) {
    if (ligne && `${ligne} ${m}`.length > max) {
      out.push(ligne);
      ligne = m;
    } else ligne = ligne ? `${ligne} ${m}` : m;
  }
  if (ligne) out.push(ligne);
  return out;
}
