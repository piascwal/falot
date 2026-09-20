/**
 * Le générateur d'étages. Tout est tiré d'une graine : à graine égale, plan
 * égal — c'est ce qui rend un étage partageable par son nom et testable pour de
 * bon (voir `tests/generation.test.ts`).
 *
 * L'ORDRE DES TIRAGES EST UN CONTRAT. Déplacer un `rnd()` regénère un autre
 * monde pour toutes les graines existantes. Ajouter un tirage au milieu aussi.
 */

import { grainDepuisTexte, mulberry32 } from '../alea.js';
import { CASE } from '../dimensions.js';
import { BONUS, EMOTIONS, type TypeLueur } from '../formes.js';
import { TAU } from '../geometrie.js';
import type {
  Case,
  Dalle,
  Fissure,
  Lueur,
  Perso,
  PointRonde,
  Porte,
  Salle,
  Torche,
  Zone,
} from '../types.js';
import { distances, type Plan } from './grille.js';
import { palier, traitsEtage } from './paliers.js';
import { nouveauPerso } from './perso.js';

/** Le plan nu, avant qu'on y pose quoi que ce soit. */
interface PlanNu extends Plan {
  salles: Salle[];
}

// une grille : la seule chose à garantir ici, c'est « peut-on aller d'ici à
// là », et sur une grille un parcours en largeur y répond exactement.
function construireZone(rnd: () => number, numero: number): PlanNu | null {
  const cols = 15 + Math.min(6, numero);
  const lignes = 20 + Math.min(8, numero * 2);
  const mur: number[][] = [];
  for (let y = 0; y < lignes; y++) mur.push(new Array<number>(cols).fill(1));

  const salles: Salle[] = [];
  const vise = 6 + Math.min(5, Math.floor(numero * 0.8));
  for (let essai = 0; essai < 220 && salles.length < vise; essai++) {
    const w = 3 + Math.floor(rnd() * 4);
    const h = 3 + Math.floor(rnd() * 4);
    const x = 1 + Math.floor(rnd() * (cols - w - 2));
    const y = 1 + Math.floor(rnd() * (lignes - h - 2));
    const chevauche = salles.some(
      (s) => x < s.x + s.w + 1 && x + w + 1 > s.x && y < s.y + s.h + 1 && y + h + 1 > s.y,
    );
    if (chevauche) continue;
    salles.push({ x, y, w, h, cx: x + (w >> 1), cy: y + (h >> 1) });
  }
  if (salles.length < 3) return null;

  for (const s of salles) {
    for (let y = s.y; y < s.y + s.h; y++)
      for (let x = s.x; x < s.x + s.w; x++) mur[y][x] = 0;
  }

  const couloir = (a: Salle, b: Salle) => {
    let x = a.cx,
      y = a.cy;
    while (x !== b.cx) {
      mur[y][x] = 0;
      x += x < b.cx ? 1 : -1;
    }
    while (y !== b.cy) {
      mur[y][x] = 0;
      y += y < b.cy ? 1 : -1;
    }
    mur[y][x] = 0;
  };
  for (let i = 1; i < salles.length; i++) couloir(salles[i - 1], salles[i]);
  // deux raccourcis : sans ça le plan est un couloir unique et se parcourt bêtement
  for (let i = 0; i < 2; i++) {
    const a = salles[Math.floor(rnd() * salles.length)];
    const b = salles[Math.floor(rnd() * salles.length)];
    if (a !== b) couloir(a, b);
  }

  return { mur, cols, lignes, salles };
}

export function genererZone(
  grainTexte: string,
  numero: number,
  formeJoueur: number,
): Zone | null {
  const base = grainDepuisTexte(grainTexte);
  // Ce que cet étage porte de neuf. Tiré à part, avec sa propre graine : les
  // tirages du générateur sont un contrat, on n'en décale pas un seul.
  const pal = palier(numero);
  const traits = traitsEtage(numero, grainTexte);
  // types de lueurs disponibles à ce stade de la progression
  const types = (Object.keys(BONUS) as TypeLueur[]).filter(
    (k) => BONUS[k].forme <= formeJoueur,
  );

  for (let variante = 0; variante < 30; variante++) {
    const rnd = mulberry32(base + variante * 7919 + numero * 104729);
    const z = construireZone(rnd, numero);
    if (!z) continue;

    const depart = z.salles[0];
    const d = distances(z, depart);

    let sortie: Salle | null = null;
    let loin = -1;
    for (const s of z.salles) {
      if (d[s.cy][s.cx] > loin) {
        loin = d[s.cy][s.cx];
        sortie = s;
      }
    }
    if (!sortie || loin < 12) continue;
    // `sortie` ne peut plus être nul passé ce garde-fou : on le nomme une fois,
    // et tout ce qui suit lit ce nom-là.
    const leSeuil: Salle = sortie;

    const lueurs: Lueur[] = [];
    for (const s of z.salles) {
      if (s === depart) continue;
      const combien = 2 + Math.floor(rnd() * 3);
      for (let i = 0; i < combien; i++) {
        const cx = s.x + Math.floor(rnd() * s.w);
        const cy = s.y + Math.floor(rnd() * s.h);
        if (d[cy][cx] < 0) continue;
        // une lueur sur cinq est spéciale, tirée parmi ce qui est débloqué
        const special = types.length > 1 && rnd() < 0.22;
        const type = special ? types[1 + Math.floor(rnd() * (types.length - 1))] : 'eclat';
        lueurs.push({
          x: (cx + 0.5) * CASE,
          y: (cy + 0.5) * CASE,
          type,
          prise: false,
          vue: false,
          phase: rnd() * TAU,
        });
      }
    }
    if (lueurs.length < 14) continue;

    // PORTES. On ne les met que dans les couloirs, à la bouche d'une salle :
    // une case libre hors salle, avec exactement deux voisines libres et
    // opposées (donc un vrai couloir, pas un carrefour), dont l'une est dans
    // la salle. Fermée, elle coupe le regard d'une sentinelle qui balaye le
    // couloir — c'est là tout son intérêt : un abri qui existe sans lumière.
    const dansUneSalle = (cx: number, cy: number) =>
      z.salles.some((s) => cx >= s.x && cx < s.x + s.w && cy >= s.y && cy < s.y + s.h);
    const libreEn = (cx: number, cy: number) =>
      cx >= 0 && cy >= 0 && cx < z.cols && cy < z.lignes && !z.mur[cy][cx];
    const portes: Porte[] = [];
    const candidates: { cx: number; cy: number; couloirH: boolean }[] = [];
    for (let cy = 1; cy < z.lignes - 1; cy++) {
      for (let cx = 1; cx < z.cols - 1; cx++) {
        if (z.mur[cy][cx] || d[cy][cx] < 0 || dansUneSalle(cx, cy)) continue;
        const h = [libreEn(cx - 1, cy), libreEn(cx + 1, cy)];
        const v = [libreEn(cx, cy - 1), libreEn(cx, cy + 1)];
        const nb = h.filter(Boolean).length + v.filter(Boolean).length;
        if (nb !== 2) continue; // carrefour ou cul-de-sac
        const couloirH = h[0] && h[1],
          couloirV = v[0] && v[1];
        if (!couloirH && !couloirV) continue; // coude : le battant n'a pas d'axe
        const touche = couloirH
          ? dansUneSalle(cx - 1, cy) || dansUneSalle(cx + 1, cy)
          : dansUneSalle(cx, cy - 1) || dansUneSalle(cx, cy + 1);
        if (!touche) continue; // pas à la bouche d'une salle
        candidates.push({ cx, cy, couloirH });
      }
    }
    // Écartées les unes des autres, et jamais sur le seuil ni sur le portail :
    // une porte collée au départ enferme, une porte sur la sortie bloque la fin.
    const interdit = (cx: number, cy: number) =>
      (Math.abs(cx - depart.cx) <= 1 && Math.abs(cy - depart.cy) <= 1) ||
      (Math.abs(cx - leSeuil.cx) <= 1 && Math.abs(cy - leSeuil.cy) <= 1);
    for (let k = candidates.length - 1; k > 0; k--) {
      // mélange déterministe
      const j = Math.floor(rnd() * (k + 1));
      [candidates[k], candidates[j]] = [candidates[j], candidates[k]];
    }
    const maxPortes = 3 + Math.min(5, numero);
    for (const c of candidates) {
      if (portes.length >= maxPortes) break;
      if (interdit(c.cx, c.cy)) continue;
      if (portes.some((q) => Math.abs(q.cx - c.cx) + Math.abs(q.cy - c.cy) < 3)) continue;
      portes.push({
        cx: c.cx,
        cy: c.cy,
        x: (c.cx + 0.5) * CASE,
        y: (c.cy + 0.5) * CASE,
        // le couloir est horizontal -> le battant barre verticalement
        verticale: c.couloirH,
        ouverte: 0,
        scellee: false,
        sens: 1,
        // Un couloir tiré au sort fait une case de large : les deux côtés
        // perpendiculaires sont de la pierre, le gond tient donc toujours.
        gond: 1,
        phase: rnd() * TAU,
      });
    }

    // table de consultation : `solide` est appelé des milliers de fois par
    // image, il ne peut pas parcourir une liste à chaque fois. Elle est posée
    // sur `z` AVANT les personnages : c'est elle qui dit aux rondes des
    // sentinelles où elles n'ont pas le droit d'aller.
    const porteDe: (Porte | null)[][] = [];
    for (let y = 0; y < z.lignes; y++)
      porteDe.push(new Array<Porte | null>(z.cols).fill(null));
    for (const pt of portes) porteDe[pt.cy][pt.cx] = pt;
    z.porteDe = porteDe;

    // On pose d'abord les PLACES, on décide la composition ensuite. Tirer
    // l'émotion place par place ne garantissait rien : une zone pouvait naître
    // avec une seule âme à calmer — le portail en réclamait alors plus qu'il
    // n'en existait — ou, après qu'on eut écarté ces variantes-là, sans la
    // moindre sentinelle, c'est-à-dire sans le moindre danger.
    const places: Case[] = [];
    for (const s of z.salles) {
      if (s === depart) continue;
      const combien = 1 + Math.floor(rnd() * 2);
      for (let i = 0; i < combien; i++) {
        const cx = s.x + Math.floor(rnd() * s.w);
        const cy = s.y + Math.floor(rnd() * s.h);
        if (d[cy][cx] < 0) continue;
        places.push({ cx, cy });
      }
    }
    // Il faut de quoi tenir les deux quotas à la fois. Sous ce seuil la zone
    // est trop peu peuplée pour être intéressante : variante suivante.
    const MINI_AMES = 4,
      MINI_ROUGES = 2;
    if (places.length < MINI_AMES + MINI_ROUGES) continue;

    // mélange déterministe, puis quotas garantis avant de compléter au hasard
    for (let k = places.length - 1; k > 0; k--) {
      const j = Math.floor(rnd() * (k + 1));
      [places[k], places[j]] = [places[j], places[k]];
    }
    const douces = [EMOTIONS.PEUR, EMOTIONS.CURIEUX];
    const reste =
      numero === 1
        ? [EMOTIONS.PEUR, EMOTIONS.CURIEUX, EMOTIONS.COLERE]
        : [EMOTIONS.PEUR, EMOTIONS.CURIEUX, EMOTIONS.COLERE, EMOTIONS.COLERE];
    const emotions = places.map((_, i) =>
      i < MINI_AMES
        ? douces[Math.floor(rnd() * douces.length)]
        : i < MINI_AMES + MINI_ROUGES
          ? EMOTIONS.COLERE
          : reste[Math.floor(rnd() * reste.length)],
    );

    const persos: Perso[] = [];
    for (let iPlace = 0; iPlace < places.length; iPlace++) {
      const { cx, cy } = places[iPlace];
      const emotion = emotions[iPlace];
      persos.push(
        nouveauPerso(
          (cx + 0.5) * CASE,
          (cy + 0.5) * CASE,
          emotion,
          rnd,
          // Points de ronde. Ils doivent être NETTEMENT écartés du poste et
          // les uns des autres : tirés sans distance minimale, ils pouvaient
          // tomber tous les trois dans la case de la sentinelle. Elle
          // « arrivait » alors à chaque frame, passait au point suivant, et
          // ne bougeait jamais — une sentinelle sur 29 restait ainsi plantée.
          (): PointRonde[] => {
            const pts: PointRonde[] = [];
            // Son monde s'arrête aux portes : un point de ronde de l'autre
            // côté d'un battant la ferait pousser contre le bois sans fin.
            // Le parcours part de SON poste, pas du seuil de la zone, puisque
            // les portes découpent le plan en quartiers.
            const sien = emotion === EMOTIONS.COLERE ? distances(z, { cx, cy }, true) : d;
            const loinDeTout = (ox: number, oy: number) => {
              if (Math.hypot(ox - cx, oy - cy) < 1.8) return false;
              return pts.every((q) => Math.hypot(ox - q.cx, oy - q.cy) >= 1.8);
            };
            for (let k = 0; k < 40 && pts.length < 3; k++) {
              const ox = cx + Math.floor(rnd() * 11) - 5;
              const oy = cy + Math.floor(rnd() * 11) - 5;
              if (ox < 0 || oy < 0 || ox >= z.cols || oy >= z.lignes) continue;
              if (z.mur[oy][ox] || sien[oy][ox] < 0) continue;
              if (!loinDeTout(ox, oy)) continue;
              pts.push({ cx: ox, cy: oy, x: (ox + 0.5) * CASE, y: (oy + 0.5) * CASE });
            }
            // moins de deux points utilisables : elle tient son poste et
            // balaye, ce qui est un garde statique parfaitement lisible
            return pts.length >= 2 ? pts : [];
          },
        ),
      );
    }

    const joignable = (p: { x: number; y: number }) => {
      const cx = Math.floor(p.x / CASE),
        cy = Math.floor(p.y / CASE);
      return d[cy] && d[cy][cx] >= 0;
    };
    if (!lueurs.every(joignable)) continue;

    // Filet de sécurité : les quotas sont déjà garantis plus haut, mais une
    // place peut être perdue en chemin. Une zone sans assez d'âmes est
    // infinissable, une zone sans sentinelle est sans danger.
    const calmables = persos.filter((q) => q.emotion !== EMOTIONS.COLERE).length;
    if (calmables < MINI_AMES) continue;
    if (persos.length - calmables < MINI_ROUGES) continue;

    // Torches fixées aux murs : gratuites mais temporaires, contrairement aux
    // braises qu'on porte. En passant devant, on les allume pour un moment.
    const torches: Torche[] = [];
    for (const sl of z.salles) {
      for (let essai = 0; essai < 14 && torches.length < 3 + numero; essai++) {
        const cx = sl.x + Math.floor(rnd() * sl.w);
        const cy = sl.y + Math.floor(rnd() * sl.h);
        if (z.mur[cy][cx] || d[cy][cx] < 0) continue;
        // il faut un mur juste à côté : une torche se fixe à une paroi
        const cotes = [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ].filter(([ox, oy]) => {
          const nx = cx + ox,
            ny = cy + oy;
          return nx < 0 || ny < 0 || nx >= z.cols || ny >= z.lignes || z.mur[ny][nx];
        });
        if (!cotes.length) continue;
        const [ox, oy] = cotes[Math.floor(rnd() * cotes.length)];
        torches.push({
          x: (cx + 0.5 + ox * 0.36) * CASE,
          y: (cy + 0.5 + oy * 0.36) * CASE,
          r: CASE * 2.1,
          duree: 26,
          reste: 0,
          phase: rnd() * TAU,
          ox,
          oy,
        });
        break;
      }
    }

    // MURS FÊLÉS. De la pierre d'un seul rang entre deux endroits déjà
    // atteignables, mais LOIN l'un de l'autre par le chemin normal. Les
    // casser ouvre un raccourci et jamais un passage obligatoire : la zone
    // reste finissable par quelqu'un qui n'a pas compris la pierre.
    const fissures: Fissure[] = [];
    {
      const candidates: { cx: number; cy: number; gain: number }[] = [];
      for (let cy = 1; cy < z.lignes - 1; cy++) {
        for (let cx = 1; cx < z.cols - 1; cx++) {
          if (!z.mur[cy][cx] || porteDe[cy][cx]) continue;
          for (const [[ax, ay], [bx, by]] of [
            [
              [cx - 1, cy],
              [cx + 1, cy],
            ],
            [
              [cx, cy - 1],
              [cx, cy + 1],
            ],
          ]) {
            if (z.mur[ay][ax] || z.mur[by][bx]) continue;
            if (d[ay][ax] < 0 || d[by][bx] < 0) continue;
            const gain = Math.abs(d[ay][ax] - d[by][bx]);
            if (gain < 6) continue; // pas un vrai raccourci
            candidates.push({ cx, cy, gain });
            break;
          }
        }
      }
      for (let k = candidates.length - 1; k > 0; k--) {
        const j = Math.floor(rnd() * (k + 1));
        [candidates[k], candidates[j]] = [candidates[j], candidates[k]];
      }
      const maxF = 1 + Math.min(2, Math.floor(numero / 2));
      for (const c of candidates) {
        if (fissures.length >= maxF) break;
        if (Math.abs(c.cx - depart.cx) + Math.abs(c.cy - depart.cy) < 3) continue;
        if (Math.abs(c.cx - leSeuil.cx) + Math.abs(c.cy - leSeuil.cy) < 3) continue;
        if (fissures.some((q) => Math.abs(q.cx - c.cx) + Math.abs(q.cy - c.cy) < 4))
          continue;
        fissures.push({
          cx: c.cx,
          cy: c.cy,
          x: (c.cx + 0.5) * CASE,
          y: (c.cy + 0.5) * CASE,
          casse: 0,
          phase: rnd() * TAU,
          gain: c.gain,
        });
      }
    }

    // LE TRAQUEUR. Un des Guets n'a plus de ronde : il refait le chemin du
    // joueur. Un seul suffit — deux, et l'étage devient une chasse à courre.
    if (traits.includes('traqueur')) {
      const rouges = persos.filter((q) => q.emotion === EMOTIONS.COLERE);
      const t = rouges[Math.floor(rnd() * rouges.length)];
      t.traqueur = true;
      t.ronde = [];
    }

    // L'ŒIL. Un Guet qui ne balaye pas : il n'a pas de ronde et il regarde
    // tout ce qui est éclairé autour de lui.
    if (traits.includes('oeil')) {
      const rouges = persos.filter((q) => q.emotion === EMOTIONS.COLERE && !q.traqueur);
      const o = rouges[Math.floor(rnd() * rouges.length)];
      if (o) {
        o.oeil = true;
        o.ronde = [];
      }
    }

    // LA MEUTE. Ils ne se quittent plus : le second reprend la ronde du
    // premier, décalée d'une étape — donc ils tournent ensemble sans jamais
    // se superposer, et on ne peut plus en contourner un seul.
    if (traits.includes('meute')) {
      const enRonde = persos.filter(
        (q) => q.emotion === EMOTIONS.COLERE && !q.traqueur && !q.oeil && q.ronde.length,
      );
      for (let i = 0; i + 1 < enRonde.length; i += 2) {
        enRonde[i + 1].ronde = enRonde[i].ronde;
        enRonde[i + 1].etape = 1;
      }
    }

    // LES FAROUCHES. Toutes les âmes de cet étage ont trop vu de lumière :
    // aucune ne se laisse rallumer au faisceau. C'est la salle entière qui
    // enseigne, pas une exception cachée dans un coin.
    if (traits.includes('farouches')) {
      for (const q of persos) if (q.emotion !== EMOTIONS.COLERE) q.farouche = true;
    }

    // LA PESÉE. Une porte scellée, et la dalle qui la commande. On ne scelle
    // JAMAIS un passage obligé : la règle est la même que pour les fissures —
    // le Seuil doit rester atteignable avec cette porte condamnée, sinon
    // laisser une âme derrière soi deviendrait un piège au lieu d'un choix.
    const dalles: Dalle[] = [];
    if (traits.includes('pesee') && portes.length) {
      const ordre = [...portes];
      for (let k = ordre.length - 1; k > 0; k--) {
        const j = Math.floor(rnd() * (k + 1));
        [ordre[k], ordre[j]] = [ordre[j], ordre[k]];
      }
      for (const pt of ordre) {
        // on la condamne le temps de poser la question, puis on la rouvre
        z.mur[pt.cy][pt.cx] = 1;
        const sans = distances(z, depart);
        z.mur[pt.cy][pt.cx] = 0;
        if (sans[leSeuil.cy][leSeuil.cx] < 0) continue; // c'est un passage obligé
        // la dalle : à portée de la porte, du côté par où l'on arrive
        let posee: Case | null = null;
        for (let r = 2; r <= 5 && !posee; r++) {
          for (let cy = pt.cy - r; cy <= pt.cy + r && !posee; cy++) {
            for (let cx = pt.cx - r; cx <= pt.cx + r; cx++) {
              if (cx < 0 || cy < 0 || cx >= z.cols || cy >= z.lignes) continue;
              if (Math.abs(cx - pt.cx) + Math.abs(cy - pt.cy) !== r) continue;
              if (z.mur[cy][cx] || porteDe[cy][cx] || sans[cy][cx] < 0) continue;
              if (cx === depart.cx && cy === depart.cy) continue;
              if (cx === leSeuil.cx && cy === leSeuil.cy) continue;
              posee = { cx, cy };
              break;
            }
          }
        }
        if (!posee) continue;
        pt.scellee = true;
        dalles.push({
          cx: posee.cx,
          cy: posee.cy,
          x: (posee.cx + 0.5) * CASE,
          y: (posee.cy + 0.5) * CASE,
          porte: pt,
          pesee: false,
        });
        break;
      }
    }

    // LA CENDRE. Une ou deux salles entières où le sol a brûlé : il faut les
    // traverser lentement. Posée en DERNIER, et seulement si l'étage porte le
    // trait : les tirages du générateur sont un contrat, et un étage sans
    // cendre ne doit pas en consommer un seul.
    const cendre: number[][] = [];
    for (let cy = 0; cy < z.lignes; cy++) cendre.push(new Array<number>(z.cols).fill(0));
    const cendres: Case[] = [];
    if (traits.includes('cendre')) {
      const candidates = z.salles.filter((s) => s !== depart);
      for (let k = candidates.length - 1; k > 0; k--) {
        const j = Math.floor(rnd() * (k + 1));
        [candidates[k], candidates[j]] = [candidates[j], candidates[k]];
      }
      for (const sl of candidates.slice(0, 2)) {
        for (let cy = sl.y; cy < sl.y + sl.h; cy++)
          for (let cx = sl.x; cx < sl.x + sl.w; cx++) {
            if (z.mur[cy][cx] || cendre[cy][cx]) continue;
            cendre[cy][cx] = 1;
            cendres.push({ cx, cy });
          }
      }
    }

    const fissureDe: (Fissure | null)[][] = [];
    for (let cy = 0; cy < z.lignes; cy++)
      fissureDe.push(new Array<Fissure | null>(z.cols).fill(null));
    for (const f of fissures) fissureDe[f.cy][f.cx] = f;

    return {
      ...z,
      numero,
      grain: grainTexte,
      lueurs,
      persos,
      torches,
      portes,
      porteDe,
      fissures,
      fissureDe,
      dalles,
      versionPortes: 0,
      braises: [],
      // Réservés aux étages écrits à la main. Vides ici, mais présents : le
      // reste du jeu les parcourt sans avoir à demander de quel type de zone
      // il s'agit.
      reprises: [],
      // Le murmure de l'étage : sa nouveauté, dite une fois, à l'entrée. Posé
      // sur le départ, donc lu en se levant — jamais en travers du chemin.
      murmures: pal?.murmure
        ? [
            {
              x: (depart.cx + 0.5) * CASE,
              y: (depart.cy + 0.5) * CASE,
              texte: pal.murmure,
              dit: false,
            },
          ]
        : [],
      nom: pal?.nom ?? `Puits — ${numero}`,
      traits,
      cendre,
      cendres,
      vues: z.mur.map((rang) => rang.map(() => 0)),
      depart: { x: (depart.cx + 0.5) * CASE, y: (depart.cy + 0.5) * CASE },
      // Le portail ne compte plus des lueurs mais des ÂMES : il faut lui
      // amener des bonhommes calmés. Les lueurs redeviennent ce qu'elles
      // auraient toujours dû être — du carburant, pas un objectif.
      sortie: {
        x: (leSeuil.cx + 0.5) * CASE,
        y: (leSeuil.cy + 0.5) * CASE,
        r: CASE * 0.55,
        vue: false,
        ames: 0,
      },
      // Nombre d'âmes à livrer. Il en reste toujours au moins une de rab :
      // une âme rattrapée par un rouge panique et redevient à calmer, et on
      // ne doit jamais se retrouver coincé pour autant.
      requis: Math.max(2, Math.min(calmables - 1, 2 + Math.floor(numero / 2))),
      largeur: z.cols * CASE,
      hauteur: z.lignes * CASE,
      longueur: loin,
    };
  }
  return null;
}
