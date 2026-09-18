/**
 * COMPARER LE JEU AU POC GELÉ.
 *
 * C'est la réponse honnête à « est-ce le même rendu ? » : on ouvre les deux
 * pages sur la même graine, au même étage, on pilote les deux de la même façon
 * et on pose les deux captures côte à côte. Un test unitaire ne dira jamais ça.
 *
 *   npx vite --port 8099            # dans un autre terminal
 *   node outils/comparer.mjs        # puis on regarde captures/
 *
 * Playwright n'est pas une dépendance du projet : il pèse plus que le jeu. Pour
 * l'installer : `npm i -D playwright && npx playwright install chromium`, ou
 * bien donner le chemin d'une installation existante dans PLAYWRIGHT.
 */

import { mkdir } from 'node:fs/promises';

const RACINE = process.env.HOTE ?? 'http://127.0.0.1:8099';
const OU = 'captures';

const { chromium } = await import(process.env.PLAYWRIGHT ?? 'playwright');

/** Les scènes comparées. `pilote` s'exécute dans la page, des deux côtés. */
const SCENES = [
  {
    nom: 'depart',
    url: '?etage=3&graine=LUX-COMPARE',
    poc: '',
    neuf: '',
  },
  {
    nom: 'faisceau',
    url: '?etage=4&graine=FAISCEAU',
    // Des deux côtés on passe par le VRAI chemin de progression : `evoluer`
    // colore le bouton, remplit la poche et crache ses particules.
    poc: '__lux.monter(60); __lux.regarder(0.6);',
    neuf: `(async () => {
      const m = await import('/src/coeur/regles/progression.ts');
      const p = window.__lux.partie;
      p.joueur.sommet = p.joueur.eclat = 60;
      p.joueur.niveau = 0;
      for (let i = 0; i < 5; i++) m.evoluer(p);
      p.joueur.regard = 0.6;
    })()`,
  },
];

const PAGES = {
  poc: '/reference/poc-2026-09.html',
  neuf: '/index.html',
};

await mkdir(OU, { recursive: true });
const navigateur = await chromium.launch();
let souci = 0;

for (const scene of SCENES) {
  for (const cote of ['poc', 'neuf']) {
    const page = await navigateur.newPage({
      viewport: { width: 420, height: 860 },
      deviceScaleFactor: 2,
    });
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(String(e)));
    await page.goto(RACINE + PAGES[cote] + scene.url, { waitUntil: 'load' });
    await page.waitForTimeout(1400);
    if (scene[cote]) {
      await page.evaluate(scene[cote]);
      await page.waitForTimeout(300);
    }
    const chemin = `${OU}/${scene.nom}-${cote}.png`;
    await page.screenshot({ path: chemin });
    if (erreurs.length) {
      souci++;
      console.error(`✗ ${chemin}\n  ${erreurs.join('\n  ')}`);
    } else {
      console.log(`✓ ${chemin}`);
    }
    await page.close();
  }
}

await navigateur.close();
process.exit(souci ? 1 : 0);
