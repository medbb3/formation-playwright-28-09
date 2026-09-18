# Exercice M8.1 — Versionner le projet M3.2 dans Azure Repos

**Difficulté** : facile à moyenne
**Durée** : 20 minutes
**Projet** : votre correction du M3.2 (SauceDemo, POM + fixtures), ou la correction fournie

## Énoncé

1. Initialisez un dépôt Git dans le projet, avec `.gitignore`, `.gitattributes`, `.editorconfig` adaptés (les baselines `.png` du M6.1 doivent être en binaire ; `.auth/` ignoré).
2. Premier commit conventionnel. Vérifiez avec `git ls-files | Select-String node_modules` qu'aucun fichier généré n'est versionné.
3. Créez le dépôt `saucedemo-tests` dans votre projet Azure DevOps et poussez `main`.
4. Créez une branche `test/7-tri-catalogue`, ajoutez un test de tri par prix décroissant (`hilo`), committez avec un message conventionnel référençant `AB#7`, poussez.
5. **Bonus** — Depuis Azure Repos, éditez en ligne `README.md` sur `main` (une ligne) et validez. Revenez en local : mettez votre branche à jour par rebase et poussez.
6. **Bonus** — Installez les hooks `pre-commit` et `commit-msg` fournis (`demo/`) ; vérifiez qu'un message `wip` est refusé et qu'un fichier contenant `password=secret_sauce` est signalé par gitleaks (si installé).
7. Bonus : créez un tag `v0.1.0` sur `main` et poussez-le ; retrouvez-le dans Azure Repos > Tags.

## Résultat attendu

- `git log --oneline --graph --all` montre `main` (2 commits) et la branche de test rebasée dessus (1 commit), sans commit de merge.
- Azure Repos affiche les deux branches et le tag.
- Les hooks bloquent les messages non conformes.

Question : pourquoi `--force-with-lease` plutôt que `--force` après un rebase ?
