# Fil rouge J5 — Énoncé (fil conducteur des exercices M8 à M10)

- Les exercices des modules du Jour 5 portent sur `saucedemo-tests` : pratique sans dépendre de Docker.
- Le fil rouge `mini-banque` reçoit les mêmes éléments, fournis, que vous installez dans votre organisation :

1. **M8.1** : `git init`, hygiène, premier commit, push vers votre organisation, hooks installés (`npm run hooks:install`).
2. **M8.2** : policies sur `main`, template de PR ; ouvrir la PR `test/42-plafond-virement` et la faire relire.
3. **M9.1** : `npm run test:docker` en local (résultat attendu : voir `correction.md`) ; créer le pipeline depuis `azure-pipelines.yml` ; l'attacher en Build validation.
4. **M9.2** : variable group `mini-banque-tests` ; lancer le pipeline avec `FORCE_NUIT=true` ; lire les gates.
5. **M10.1** : `npm run kpi` ; compléter `RAPPORT-HEBDO.md` avec deux trouvailles (par exemple QA-51 du J4) ; relire la DoD.

Résultat attendu :

- Dépôt `mini-banque` dans votre organisation, `main` protégé.
- Pipeline vert en PR.
- Run nocturne manuel vert avec rapport fusionné.
- Rapport hebdomadaire produit.
