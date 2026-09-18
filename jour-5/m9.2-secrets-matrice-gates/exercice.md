# Exercice M9.2 — Secrets, shards, planification et gates sur SauceDemo

**Difficulté** : difficile
**Durée** : 25 minutes
**Dépôt** : `saucedemo-tests`

## Énoncé

1. **Secret** : créez un variable group `saucedemo` avec `SAUCE_PASSWORD` (secret). Modifiez `fixtures/test.ts` pour lire `process.env.SAUCE_PASSWORD` (avec repli sur la valeur publique en local, commenté). Référencez le groupe dans le YAML et mappez la variable avec `env:` sur le step de test. Vérifiez dans le log qu'elle est masquée.
2. **Shards** : ajoutez un stage `Nuit` (condition `Schedule` ou `FORCE_NUIT=true`) avec 2 shards `--reporter=blob`, un job de fusion `merge-reports --reporter html,junit,json`, publication du JUnit fusionné.
3. **Planification** : `schedules` à 03:00 UTC du lundi au vendredi, `always: true`.
4. **Gates** : copiez `scripts/quality-gate.mjs` et `quality-gates.json` ; ajoutez le reporter `json` ; exécutez le gate après la fusion (`nightly`) et après le job de PR (`pr`). Rendez un test instable (`if (Math.random() < 0.5) throw new Error('instable')`) dans une branche, lancez avec `FORCE_NUIT=true`, lisez le message du gate. Retirez.
5. **Bonus** : matrice `chromium` / `firefox` sur le smoke dans un stage `Hebdo` (ajouter les projets à la config).

## Résultat attendu

- Run manuel « nuit » : 2 shards, rapport fusionné, onglet Tests complet.
- Gate stabilité rouge avec le test instable (« 1 test(s) flaky »), vert sans.
- Le secret n'apparaît jamais en clair.

Question : pourquoi le gate de flakiness est-il à 0 en PR mais à 2 % la nuit ?
