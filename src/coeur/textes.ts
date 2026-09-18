/**
 * Tout ce que le jeu écrit. Rassemblé ici pour que le texte se relise comme un
 * texte, et se retouche sans ouvrir une règle du jeu.
 *
 * Les mots du jeu ne coûtent JAMAIS un clic. Une phrase est soit un murmure
 * posé dans le décor, soit une réplique au-dessus d'une tête : elle apparaît,
 * elle s'efface, et on continue de jouer. C'est le canal de fond du récit —
 * celui de Dark Souls, pas celui du panneau à valider.
 */

import { EMOTIONS, type Emotion } from './formes.js';

// Ce que disent les âmes qu'on rallume. Le meilleur canal possible : il est
// mérité — on ne l'entend qu'après avoir sauvé quelqu'un —, il est diégétique
// — ce sont des gens qui parlent —, et il est inépuisable.
export const REPLIQUES: Partial<Record<Emotion, readonly string[]>> = {
  [EMOTIONS.PEUR]: [
    "Je croyais que j'étais éteinte pour de bon.",
    "Tu es tout petit. C'est pour ça que je te suis.",
    'Reste devant moi. Je ne vois plus rien sans toi.',
    "J'ai oublié qui j'éclairais. Toi aussi ?",
    "On ne m'avait pas regardé depuis très longtemps.",
  ],
  [EMOTIONS.CURIEUX]: [
    "Il y en a d'autres. Plus haut. Beaucoup d'autres.",
    "Ne les regarde pas trop longtemps. C'est comme ça qu'on tombe.",
    'Je marchais. Je ne sais plus vers quoi.',
    "Je peux éclairer devant. Ça te coûtera d'être vu.",
    "En haut, il paraît qu'il y a des fenêtres.",
  ],
};

// Ce que dit une âme qu'on ne peut pas ENCORE rallumer. Sans ça on tourne
// autour d'elle en cherchant quoi faire, et l'échec n'apprend rien.
export const ETEINTS: readonly string[] = [
  "On m'a vidé de ma lumière. Il m'en faudrait un peu de la tienne — mais la tienne est trop petite.",
  'Regarde-moi assez longtemps et je me rallumerai. Tu ne sais pas encore le faire.',
  'Je ne peux pas marcher sans lumière. Reviens quand tu en auras assez.',
];

// Le récit de fond. La cage est un arrêt de toute façon : deux à quatre
// phrases y passent sans rien coûter, et sur dix étages cela fait une
// histoire complète. C'est le seul endroit du jeu où l'on s'autorise un
// paragraphe.
export const RECIT_CAGE: Readonly<Record<number, string>> = {
  2:
    "Elles sont entrées avant toi. Un Seuil ne s'ouvre pas avec une clé : " +
    "il s'ouvre quand assez de lumière se tient dedans — et cette lumière, " +
    "c'était la tienne. Tu viens de tout lui donner. Tu ne te souviens déjà " +
    'plus de ce que tu savais faire il y a un instant.',
  3:
    "Il n'y a pas de jour dans les Dessous, seulement des lampes et ce " +
    "qu'elles montrent. Personne n'a construit cet endroit. On y a entassé " +
    "ce qui ne servait plus, jusqu'à ce que ça ressemble à une prison.",
  4:
    "Les Guets ne montent pas derrière toi. Ils n'ont nulle part " +
    "où aller : ils sont ce qui reste quand une lampe a renoncé, et c'est une " +
    "lampe qu'ils attendent — pas un corps. Une petite lumière seule dans le " +
    "noir, exactement la forme que tu as. C'est pour ça qu'une flamme posée " +
    "les désarme : dedans, tu n'as plus cette forme-là.",
};
export const RECIT_PLUS_HAUT: readonly string[] = [
  'Tu ne comptes plus les étages. Elles, si.',
  "Plus haut, paraît-il, il y a des fenêtres. Personne n'en a vu.",
  'Tu recommences petit à chaque fois, et tu ne te souviens pas assez pour ' +
    "t'en lasser.",
];
