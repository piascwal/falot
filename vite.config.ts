import { defineConfig } from 'vitest/config';

// `base` relatif : le jeu doit tourner aussi bien à la racine d'un domaine que
// dans un sous-dossier de GitHub Pages, sans qu'on ait à le reconstruire.
// La DATE DE CONSTRUCTION, affichée en tout petit sur l'écran-titre. GitHub
// Pages garde `index.html` en cache une dizaine de minutes : on recharge, on
// voit l'ancienne version, et on croit que le déploiement a échoué. Ce timbre
// répond à la question en une seconde, sans ouvrir les outils du navigateur.
const BATI = new Date().toISOString().slice(0, 16).replace('T', ' ');

export default defineConfig({
  base: './',
  define: { __BATI__: JSON.stringify(BATI) },
  build: { target: 'es2022', sourcemap: true },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
