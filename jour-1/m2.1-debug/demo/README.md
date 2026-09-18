# Démo M2.1

```powershell
npm install
npx playwright install chromium
npx playwright codegen https://www.demoblaze.com --output=tests/brouillon2.spec.ts
npx playwright test achat --ui
npx playwright test achat --trace on
npx playwright show-report
npx playwright test achat --debug
```

Bug volontaire pour la trace : dans `achat.spec.ts`, remplacer `'Place Order'` par `'Place order', exact: true`.
