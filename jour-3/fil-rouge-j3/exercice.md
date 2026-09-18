# Fil rouge J3 — Énoncé

**Difficulté** : difficile
**Durée** : 30 minutes
**Prérequis** : `docker compose up --build -d` (l'application a évolué), `npm install` dans `frontend/`.

## Fourni

Tout le squelette du J3 est livré : `auth.setup.ts`, les helpers de `tests/support/connexion.ts` (`commeRole` pour alice/bob/carol, `commeUtilisateurWorker`), fabriques, helper a11y, config à 6 projets, et les tests J1/J2 déjà migrés sur `commeUtilisateurWorker`.

## À faire

### Partie A — Accessibilité (10 min)

1. Lancez `npm run test:a11y -- --project=chromium`. Deux tests de l'écran de virement échouent. Lisez le résumé dans le message d'erreur et la pièce jointe `virement-vide-violations.json`.
2. Pour chaque violation : règle axe, impact, critère WCAG, critère RGAA, élément concerné (tableau dans `A11Y.md`).
3. Corrigez le front (`src/pages/TransferPage.tsx`, `src/styles.css`) : remettez un `<label>` sur le libellé et un contraste suffisant sur le texte d'aide (indice : `#4b5563` sur blanc = 7:1). Relancez : zéro violation.

### Partie B — Données (10 min)

4. Ajoutez au CSV deux lignes : « libellé trop long » (81 caractères, message « Le libellé dépasse 80 caractères ») et « IBAN vide ». Le test API data-driven doit passer à 9 lignes sans modifier son code.
5. Dans `tests/ui/virement.spec.ts`, essayez d'ajouter « montant nul » aux cas UI. Observez l'échec, expliquez-le en commentaire (validation navigateur `min=0.01`), retirez-le.

### Partie C — Rôles et visuel (10 min)

6. Écrivez un test avec **deux rôles** : l'utilisateur du worker effectue un virement (`commeUtilisateurWorker`), puis Carol (`commeRole(..., 'carol', ...)`) voit sur son tableau de bord le compte de cet utilisateur avec le nouveau solde (`accountRow` filtré par le nom de l'utilisateur, `workerUser.name`). Les deux helpers s'appellent l'un après l'autre dans le même test, chacun ouvrant et fermant son propre contexte. En mode mock, `commeUtilisateurWorker` et `commeRole` construiraient chacun leur propre backend simulé si on les laisse faire, donc rien ne relierait les deux instances : créez `const fake = creerFakePartage(testInfo);` en tête du test et passez-le en dernier argument des deux appels, pour qu'ils partagent le même faux backend (`undefined` en mode réel, sans effet).
7. Générez les baselines visuelles (`npm run test:visuel` deux fois), ouvrez `tableau-de-bord.png`, puis modifiez la couleur d'en-tête dans `styles.css` (`header { background: #1e3a8a }` vers `#111`) et relancez : lisez le diff, revenez en arrière.

## Consignes

- Aucun `resetData` dans les tests UI ; `commeUtilisateurWorker` pour tout ce qui modifie des données.
- Les corrections front sont minimales et gardent la sémantique HTML.
- Les trois commandes doivent être vertes à la fin :

```powershell
npm run test:real
docker compose down
npm run test:mock
npm run test:visuel
```

## Résultat attendu

| Commande | Résultat |
|---|---|
| `npm run test:real` | 43 tests verts (40 + 2 lignes CSV + test deux rôles) |
| `npm run test:mock` | 29 tests verts sans Docker (le test deux rôles tourne aussi en mock grâce à `creerFakePartage`) |
| `npm run test:visuel` | 3 tests verts |

## Questions de réflexion

1. Pourquoi `utilisateurWorker` utilise-t-il `parallelIndex` et non `workerIndex` dans l'e-mail ?
2. Le projet `visuel` tourne en mode mock : que perd-on, que gagne-t-on ?
3. Que se passerait-il si le test de déconnexion utilisait `commeRole(..., 'alice', ...)` ?
