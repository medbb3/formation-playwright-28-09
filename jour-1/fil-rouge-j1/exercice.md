# Fil rouge J1 — Énoncé

**Difficulté** : moyenne
**Durée** : 35 minutes
**Prérequis** : l'application tourne (`docker compose up -d` dans `fil-rouge/`), `npm install` et `npx playwright install chromium` faits dans `fil-rouge/frontend`.

## Objectif

Écrire 6 tests Playwright sur la mini-banque, dans `fil-rouge/frontend/tests`, en respectant les bonnes pratiques de la journée.

## Fourni

- `playwright.config.ts` : déjà configuré (`baseURL` http://localhost:5173, trace sur échec).
- `tests/helpers.ts` : constantes des utilisateurs, code MFA, et une fonction `login(page, user)` qui réalise la connexion complète. À utiliser dans les tests qui ne portent pas sur l'authentification.

## Les 6 tests

| # | Fichier | Test | Vérifications attendues |
|---|---|---|---|
| 1 | `j1-authentification.spec.ts` | **Connexion avec code MFA** (tag `@smoke`) | Après identification, le formulaire « Vérification en deux étapes » est visible ; après le code, l'URL est `/`, le titre « Bonjour Alice Martin » et le texte « Connecté : Alice Martin » sont visibles. Découper en 3 `test.step`. |
| 2 | idem | **Mot de passe incorrect** | Une alerte « Identifiants incorrects » s'affiche, le champ « Code de vérification » n'existe pas, l'URL reste `/login`. |
| 3 | idem | **Code MFA invalide** | Avec le code `000000`, alerte « Code de vérification invalide », le champ de code reste visible. |
| 4 | `j1-tableau-de-bord.spec.ts` | **Solde global dans le shadow DOM** | Le groupe « Total des comptes » est visible et contient `10 500,00 €` (attention au format français). Deux lignes de compte, la première contient un IBAN commençant par `FR76`. |
| 5 | `j1-virement.spec.ts` | **Le virement exige l'acceptation dans l'iframe** | Formulaire rempli, le bouton « Valider le virement » est désactivé. Après avoir coché « J'accepte les conditions » **dans l'iframe**, il est activé. Après validation, un message de statut contient « Virement effectué » et le nouveau solde. |
| 6 | `j1-deconnexion.spec.ts` | **Déconnexion** | Après clic sur « Se déconnecter » : URL `/login`, formulaire « Identification » visible, texte « Connecté : » absent. Un `goto('/virement')` redirige vers `/login`. |

## Consignes

- Locators de niveaux 1 à 3 uniquement, plus `getByTestId` pour `account-row` et `iban`. Aucun CSS.
- Assertions web-first uniquement.
- Le test 5 **modifie un solde**. Il doit préparer son état :
  - appeler `POST http://localhost:8000/api/dev/reset` dans un `beforeEach`, via `page.request` (chaque `page` porte son propre contexte de requêtes HTTP, pas besoin d'une fixture supplémentaire — la fixture `request` dédiée est détaillée en M4.1) ;
  - utiliser le compte de **Bob** (solde 120 €) avec un virement de 20 € vers un IBAN externe, pour ne pas perturber le test 4 qui tourne en parallèle sur les comptes d'Alice.
- Stabilité : `npx playwright test --repeat-each 3` doit être entièrement vert.
- `npx playwright test --grep @smoke` doit lancer exactement 1 test.

## Résultat attendu

```
Running 18 tests using N workers   (6 x 3)
  18 passed
```

## Questions de réflexion (à discuter en correction)

1. Pourquoi le test 4 échouerait-il par intermittence si le test 5 virait depuis le compte d'Alice ?
2. Que se passerait-il si `/api/dev/reset` fermait aussi les sessions ?
3. Quel locator avez-vous choisi pour le solde dans le shadow DOM, et pourquoi ce niveau ?
