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
  'On m’a vidé. Il m’en faudrait un peu de la tienne — elle est trop petite.',
  'Regarde-moi assez longtemps et je me rallumerai.',
  'Je ne peux pas marcher sans lumière. Reviens.',
];

// Le récit de fond, une phrase ou deux par étage. Il se lit EN MONTANT, pas
// à l'arrêt : un paragraphe se superposait au décor et ne se finissait
// jamais. Une ligne qu'on attrape au passage vaut mieux qu'un texte qu'on
// abandonne au milieu.
export const RECIT_CAGE: Readonly<Record<number, string>> = {
  2: 'Elles sont entrées avant toi. Ce que tu as donné au Seuil, tu ne l’as plus.',
  3: 'Personne n’a bâti les Dessous. On y a entassé, jusqu’à ce que ça ressemble à une prison.',
  4: 'Ils veulent éteindre le monde. Ce n’est pas toi qu’ils cherchent : c’est ce que tu portes.',
  5: 'Le Seuil prend ta lumière. Jamais tes gestes.',
  6: 'Certains ne cherchent plus au hasard : ils remontent ta trace.',
  7: 'Toutes ne veulent pas de ta lumière. Certaines en ont trop vu.',
  8: 'L’air s’épaissit. Ta lumière n’ira pas loin ; les torches feront la carte.',
  9: 'Ici, une porte tient tant qu’on pèse dessus. Quelqu’un devra rester.',
  10: 'Celui d’en haut ne balaye rien : il voit tout ce qui est éclairé.',
  11: 'Ils ne se quittent plus.',
  12: 'C’est le dernier. Au-dessus, il y a une rue, et des lampes qu’on allume.',
};
export const RECIT_PLUS_HAUT: readonly string[] = [
  'Tu ne comptes plus les étages. Elles, si.',
  "Plus haut, paraît-il, il y a des fenêtres. Personne n'en a vu.",
  'Tu recommences petit à chaque fois, et tu ne te souviens pas assez pour ' +
    "t'en lasser.",
];

/**
 * LA FIN. Falot ne sort pas : il reste, et il devient la lampe du Seuil.
 *
 * Tout le jeu répète qu'il donne ce qu'il vient de retrouver ; la dernière
 * fois, il n'a plus que lui-même à donner. La lampe qu'il cherchait depuis le
 * premier étage, c'était lui — et la première salle du jeu était éclairée
 * parce qu'un autre avant lui tenait déjà cette porte-là.
 */
export const FIN = {
  refus: 'Il en faut plus. Il ne reste que toi.',
  don: 'Il pousse les siens dedans, et il entre à leur suite.',
  lampe: 'La lampe qu’il cherchait, c’était lui.',
  avant: 'La première salle, tout en bas, était éclairée. Quelqu’un tenait déjà la porte.',
  dehors: 'En haut, c’est le soir. Quelqu’un allume les lampes, une par une.',
  puits: 'Le Puits sans fin s’ouvre. Redescends, si tu veux.',
} as const;
