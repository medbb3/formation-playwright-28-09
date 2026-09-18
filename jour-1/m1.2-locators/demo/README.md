# Démo M1.2

```powershell
npm install
npx playwright install chromium
npx playwright test --ui      # pour montrer "Pick locator"
npx playwright test
```

Pour provoquer la `strict mode violation`, décommenter la ligne « Version 1 » dans le test 2.

`tests/assertions-avancees.spec.ts` accompagne la section 1.6 du cours : `expect.soft` et l'assertion web-first standard (2 tests, validés avec `--repeat-each 2`).
