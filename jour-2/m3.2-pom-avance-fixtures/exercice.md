# Exercice M3.2 — POM avancé pour The Internet

**Difficulté** : moyenne
**Durée** : 35 minutes
**Site** : https://the-internet.herokuapp.com

## Objectif

Construire une petite architecture de Page Objects avancée : un composant partagé, un `PageObjectManager`, un flow métier réutilisé, et des tests où le setup reste visible. Aucune fixture personnalisée.

## Énoncé

### Composant (`pages/components/`)

- `FlashComponent` : le bandeau de message (`#flash`, avec son bouton de fermeture `×`) affiché par plusieurs pages du site. Expose `banner` (le `Locator`) et `dismiss()` (clique sur `×`).

### Page Objects (`pages/`)

- `LoginPage` (`/login`) : `usernameInput`, `passwordInput`, `loginButton`, `flash` (un `FlashComponent`), `goto()`, `login(user, password)`.
- `SecureAreaPage` (`/secure`) : `heading` (« Secure Area »), `flash` (un `FlashComponent`), `logoutButton` (lien « Logout »), `logout()`.
- `DropdownPage` (`/dropdown`) : `select`, `goto()`, `choose(label)`.
- `PageObjectManager` avec les trois pages (`login`, `secure`, `dropdown`), instanciation paresseuse comme dans le cours.

### Flow (`flows/`)

- `LoginFlow.login(pages, username, password)` : appelle `pages.login.goto()` puis `pages.login.login(username, password)`. Pas d'assertion à l'intérieur. Il traverse deux Page Objects (`LoginPage` → `SecureAreaPage` une fois la connexion réussie) et sert dans plusieurs tests : c'est le candidat naturel au flow, contrairement à un setup à usage unique.

### Tests

1. `tests/secure.spec.ts` : via `LoginFlow.login`, se connecter avec `tomsmith` / `SuperSecretPassword!`, vérifier le titre « Secure Area » et le flash « You logged into a secure area! ».
2. `tests/secure.spec.ts` : via `LoginFlow.login`, se connecter puis appeler `logout()`, vérifier le flash « You logged out of the secure area! ».
3. `tests/secure.spec.ts` : connexion **explicite** dans le test (pas de flow) avec un mauvais mot de passe, vérifier le flash « Your password is invalid! ». Cas ponctuel, hors du chemin nominal : pas un bon candidat pour le flow.
4. `tests/dropdown.spec.ts` : avec le seul `PageObjectManager` (pas de connexion, `/dropdown` n'en a pas besoin), choisir « Option 1 » et vérifier la valeur `1`.

## Consignes

- Un seul `new PageObjectManager(page)` par test, en première ligne.
- `LoginFlow` ne contient aucun `expect` : les assertions vivent dans les tests.
- Le test 3 n'utilise pas `LoginFlow` : justifiez en commentaire pourquoi (cas ponctuel, pas répété, ne traverse pas la connexion réussie vers `/secure`).
- Pas de `test.extend`, pas de fixture personnalisée : `{ page }` (natif) et éventuellement `test.beforeEach` suffisent.

## Résultat attendu

```
Running 4 tests using 1 worker
  4 passed
```

Bonus : ajoutez un composant `NavComponent` pour le lien « Fork me on GitHub » (présent sur toutes les pages) et composez-le dans les trois Page Objects, pour vous entraîner à repérer un second élément partagé.
