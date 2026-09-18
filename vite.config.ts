import { defineConfig } from 'vitest/config';

// `base` relatif : le jeu doit tourner aussi bien à la racine d'un domaine que
// dans un sous-dossier de GitHub Pages, sans qu'on ait à le reconstruire.
export default defineConfig({
  base: './',
  build: { target: 'es2022', sourcemap: true },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
