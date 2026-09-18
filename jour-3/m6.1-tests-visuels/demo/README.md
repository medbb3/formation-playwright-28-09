# Démo M6.1

```powershell
npm install
npx playwright install chromium
npx playwright test          # 1er run : baselines écrites, tests visuels en échec (normal)
npx playwright test          # 2e run : vert (sauf les test.fail volontaires, attendus)
npx playwright show-report
npx playwright test --update-snapshots   # après revue d'un changement voulu
```

Les baselines sont dans `tests/__screenshots__/visuel/<plateforme>/`. Elles dépendent de la plateforme : à régénérer sur chaque OS, ou à produire dans Docker.
