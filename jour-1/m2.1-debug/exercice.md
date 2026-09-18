# Exercice M2.1 — Diagnostiquer avec la trace, puis refactorer un brouillon Codegen

**Difficulté** : moyenne
**Durée** : 30 minutes
**Site** : https://www.saucedemo.com
**Matériel** : dossier `exercice-materiel/` (projet prêt, un test qui échoue)

## Objectif

Trouver avec le Trace Viewer et l'Inspector les causes d'échec d'un test hérité d'un collègue, puis transformer ce brouillon Codegen en test livrable avec `test.step` et des assertions.

## Énoncé

Le fichier `tests/checkout.spec.ts` a été enregistré avec Codegen puis modifié à la main. Il devait valider le parcours d'achat complet sur SauceDemo : connexion, ajout d'un produit, panier, formulaire de livraison, confirmation, retour aux produits. Il échoue.

### Partie A — Diagnostic (15 min)

1. Lancez `npx playwright test --trace on`, ouvrez le rapport puis la trace.
2. Identifiez la **première** cause d'échec : notez l'action en rouge, le message du call log, et ce que montre le snapshot Before.
3. Corrigez-la, relancez. Recommencez jusqu'à ce que le test passe. Il y a **trois** problèmes distincts. L'un des trois ne fait pas échouer le test mais le rend inutile : indice, regardez les `await`.
4. Pour au moins un des problèmes, utilisez `--debug` et « Pick locator » plutôt que la trace, pour comparer les deux approches.

Notez dans un fichier `DIAGNOSTIC.md`, pour chaque problème : le symptôme, la cause, la correction, et l'outil qui vous l'a révélé.

### Partie B — Refactoring (15 min)

Réécrivez le test dans `tests/checkout.spec.ts` en appliquant les 6 étapes du cours :

1. Nom de test explicite.
2. `baseURL` et chemins relatifs.
3. Une assertion d'effet après chaque étape (URL, texte, compteur du panier, total).
4. Données en constantes (utilisateur, produit, adresse).
5. `test.step` par étape métier : connexion, ajout au panier, panier, informations, récapitulatif, confirmation.
6. Locators vérifiés : le produit ajouté est ciblé par son nom, pas par « le premier bouton ».

Bonus : dans l'étape récapitulatif, vérifiez que le sous-total affiché (« Item total ») correspond au prix du produit choisi.

## Consignes

- Pas de `waitForTimeout`, pas de `force: true`.
- Le `DIAGNOSTIC.md` est le livrable principal de la partie A : la correction collective part de vos notes.
- `trace: 'retain-on-failure'` est déjà dans la config : après vos corrections, vérifiez qu'aucune trace n'est produite quand le test passe.

## Résultat attendu

Partie A : un test vert et un `DIAGNOSTIC.md` avec trois entrées.
Partie B : un test vert, six étapes visibles dans le rapport HTML, chacune avec au moins une assertion.
