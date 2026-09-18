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
    "Les Guets ne montent pas derrière toi. Ils n'ont nulle part où aller, et " +
    "ils ne veulent rien d'autre : éteindre le monde, une lumière après " +
    "l'autre, et vider la tienne pendant qu'elle passe. Ce n'est pas toi " +
    "qu'ils cherchent — c'est ce que tu portes. Une flamme trop grande pour " +
    'eux les tient à distance ; tout le reste, ils viennent le prendre.',
  5:
    'Tu recommences petit à chaque étage, et ça ne te surprend plus. Ce que ' +
    "le Seuil te prend, c'est la lumière ; ce qu'il te laisse, ce sont les " +
    "gestes. Personne ne t'a jamais repris un geste.",
  6:
    "Certains d'entre eux ne cherchent plus au hasard. Ils ont compris qu'une " +
    "lumière laisse une trace, et qu'il suffit de la remonter. Rien ne les " +
    "presse : ils ont tout le temps qu'il te reste.",
  7:
    'Toutes ne veulent pas être rallumées. Il y en a qui ont vu de la lumière ' +
    'de trop près, et qui reculent quand la tienne approche. Celles-là, il ' +
    'faut venir les chercher dans le noir.',
  8:
    "L'air s'épaissit à mesure qu'on monte. Ta lumière n'y peut rien : elle " +
    "porte moins loin, c'est tout. Les torches d'ici ne sont plus un " +
    'confort, elles sont la carte.',
  9:
    'Une porte, ici, tient tant que quelque chose pèse dessus. Tu vas devoir ' +
    "laisser quelqu'un derrière. Elle le sait avant toi — elles savent " +
    'toujours avant toi.',
  10:
    "Celui de l'étage au-dessus ne balaye rien. Il voit tout ce qui est " +
    "éclairé, d'un seul coup, et il attend que ça bouge. Tout ce que tu as " +
    'appris à allumer, il va falloir le souffler.',
  11:
    'Ils ne se quittent plus. Tu ne peux plus en contourner un sans entrer ' +
    "dans le champ de l'autre. Il n'y a plus rien de neuf à comprendre — il " +
    'reste à savoir si tu sais le faire.',
  12:
    "C'est le dernier. Au-dessus, il n'y a plus d'étage : il y a une rue, des " +
    "fenêtres, et des lampes que quelqu'un allume le soir. Le Seuil demande " +
    "plus de lumière que tu n'en as jamais eu.",
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
