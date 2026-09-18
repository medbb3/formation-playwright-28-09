# Exercice M6.1 — Baselines, masques et structure sur The Internet

**Difficulté** : moyenne
**Durée** : 30 minutes
**Site** : https://the-internet.herokuapp.com

## Objectif

Créer des baselines stables sur des pages dont certaines ont un contenu volontairement changeant, provoquer et lire une régression, et comparer une structure ARIA.

## Énoncé (`tests/visuel.spec.ts`, tag `@visual`, viewport 1280x720)

1. **Formulaire de login** (`/login`) : capture du **composant** formulaire (`getByRole('form')` ou le conteneur `#login`) sous le nom `login-form.png`. Vérifiez qu'un second run est vert.
2. **Régression volontaire** : même capture `login-form.png` après `page.addStyleTag` qui met le bouton Login en `background: red`. Le test doit échouer ; marquez-le `test.fail()` avec une raison pour le garder comme démonstration. Piège : au premier run, ce test ne doit **pas** écrire la baseline avec le bouton rouge (les deux tests tournent en parallèle). Sautez-le tant que la baseline n'existe pas (`fs.existsSync(test.info().snapshotPath('login-form.png'))`). Ouvrez le rapport et décrivez le diff en commentaire.
3. **Contenu dynamique** (`/dynamic_content`) : la page affiche trois lignes avec une image et un texte aléatoires à chaque chargement. Obtenez une capture **stable** de la page en masquant ce qui change (indice : les images sont des `img` dans `#content`, les textes sont dans les `div.large-10`). Vérifiez avec `--repeat-each 3`.
4. **Page longue** (`/large`) : capture `fullPage: true` du tableau sous le nom `large-table.png`, puis une capture du seul `getByRole('table')`. Comparez les tailles des deux fichiers PNG et notez-les en commentaire.
5. **Structure ARIA** (`/login`) : `toMatchAriaSnapshot` sur `#login` avec le titre, les deux champs et le bouton. Écrivez le YAML à la main d'après l'arbre (astuce : l'UI Mode ou `npx playwright codegen` en mode « Assert snapshot » le génère).

## Consignes

- `snapshotPathTemplate` regroupant par projet et plateforme.
- Aucune tolérance globale (`maxDiffPixels: 0`) ; si un test a besoin d'un seuil, justifiez-le en commentaire et gardez-le local au test.
- Avant chaque capture, une assertion prouvant que la page est prête.
- `.auth/` et `test-results/` ignorés ; les baselines, elles, sont committées.

## Résultat attendu

- Premier run : 5 baselines écrites, tests en échec (normal).
- Deuxième run et `--repeat-each 3` : verts, sauf le test 2 en `test.fail` (comptabilisé comme attendu).

Question : les baselines générées sur votre poste Windows seront-elles valides sur la CI Linux ? Que proposez-vous ?
