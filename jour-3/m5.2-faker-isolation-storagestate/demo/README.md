# Démo M5.2

```powershell
npm install
npx playwright install chromium
npx playwright test --project=setup        # crée .auth/standard.json et .auth/visual.json
npx playwright test --project=standard
npx playwright test --project=visual
npx playwright test                         # tout, setup inclus
```
