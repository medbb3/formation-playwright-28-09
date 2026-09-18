# Démo M3.2

```powershell
npm install
npx playwright install chromium
npx playwright test
npx playwright show-report
```

`pages/PageObjectManager.ts` agrège les Page Objects du catalogue ; `flows/OrderFlow.ts` est le flow de commande, appelé explicitement dans `tests/commande.spec.ts`. `tests/catalogue.spec.ts` connecté via `test.beforeEach` (setup local, standard_user) et un test isolé avec `problem_user` (connexion explicite, hors `beforeEach`) : le tri par prix y échoue volontairement (bug connu du site pour ce profil).
