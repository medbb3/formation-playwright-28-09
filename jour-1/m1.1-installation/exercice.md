# Exercice M1.1 — Premier projet Playwright sur The Internet

**Difficulté** : facile
**Durée** : 20 minutes
**Site** : https://the-internet.herokuapp.com

## Objectif

Créer seul un projet Playwright de zéro, le configurer pour un seul navigateur avec une `baseURL`, écrire trois tests et lire le rapport HTML.

## Énoncé

Page de login : `/login`. Identifiants valides : `tomsmith` / `SuperSecretPassword!`.

Écrivez le fichier `tests/the-internet.spec.ts` avec trois tests :

1. **La page d'accueil liste les exemples** : aller sur `/`, vérifier que le titre de la page est `The Internet` et que le lien `Form Authentication` est visible.
2. **Connexion réussie** : aller sur `/login`, saisir les identifiants valides, cliquer sur `Login`, vérifier que l'URL contient `/secure` et que le message flash contient `You logged into a secure area!`.
3. **Connexion refusée** : aller sur `/login`, saisir `tomsmith` / `mauvais`, cliquer sur `Login`, vérifier que le message flash contient `Your password is invalid!` et que l'URL est toujours `/login`.

## Consignes

- Créer le projet avec `npm init playwright@latest` dans un dossier `exo-m11`.
- Dans `playwright.config.ts` : ne garder que le projet `chromium`, ajouter `baseURL: 'https://the-internet.herokuapp.com'`.
- `beforeEach` si vous jugez qu'il évite une répétition (attention : les trois tests ne vont pas sur la même page).
- Aucun sélecteur CSS ni XPath : uniquement `getByRole`, `getByLabel`, `getByText`, `getByPlaceholder`. Indices : les champs ont des `<label>` ; le message flash a l'`id` `flash`, mais on peut le cibler par son texte.
- Lancer les tests en `--headed` une fois, puis en headless, puis ouvrir le rapport.
- Bonus : faites échouer volontairement le test 2 en attendant `/secured`, lisez l'erreur dans le rapport, puis corrigez.

## Résultat attendu

```
Running 3 tests using 3 workers
  3 passed
```

Le rapport HTML montre les trois tests dans le projet `chromium`, chacun avec ses étapes (goto, fill, click, expect).
