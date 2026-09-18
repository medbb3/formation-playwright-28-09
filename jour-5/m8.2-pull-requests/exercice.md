# Exercice M8.2 — Policies, template et revue croisée

**Difficulté** : moyenne
**Durée** : 20 minutes
**Dépôt** : `saucedemo-tests` (M8.1) dans votre organisation Azure DevOps

## Énoncé

1. Configurez sur `main` les policies : 1 relecteur (auteur exclu, votes réinitialisés), work item lié, commentaires résolus, squash uniquement. Interdisez le force push.
2. Ajoutez `.azuredevops/pull_request_template.md` (adapter celui de la démo : commande de vérification `npx playwright test --project=standard`). Vous ne pouvez pas pousser sur `main` : passez par une branche et une PR, qui exige un relecteur. Invitez votre binôme comme membre du projet (Project settings > Teams) : il est votre relecteur pour la suite, et vous le sien.
3. Ouvrez la PR de la branche `test/7-tri-catalogue` (M8.1). Avant, plantez un défaut : remplacez `toHaveText('$49.99')` par `toBeVisible()` et ajoutez un `page.waitForTimeout(500)`.
4. Relisez la PR de votre binôme avec `CHECKLIST-REVUE-QA.md` : trouvez les deux défauts, commentez (bloquant) avec une suggestion de correction pour chacun.
5. Corrigez votre PR depuis les suggestions reçues, résolvez les commentaires, obtenez l'approbation, complétez en squash avec suppression de branche.
6. Vérifiez `main` : `git switch main`, `git pull`, `git log --oneline -3`.

## Résultat attendu

- `main` protégé.
- Deux PR complétées en squash (la vôtre et celle relue), commentaires bloquants résolus.
- Historique de `main` : un commit par PR, message = titre conventionnel.

Question : la policy « Build validation » n'est pas encore activée. Quel risque cela laisse-t-il, et que fera-t-on en M9.1 ?
