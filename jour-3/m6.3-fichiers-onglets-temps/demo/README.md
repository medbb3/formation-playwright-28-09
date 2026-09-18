# Démo M6.3

```powershell
npm install
npx playwright install chromium
npx playwright test
npx playwright show-report      # le 1er test attache le fichier téléchargé
```

13 tests, environ 15 secondes. Répartition :

| Fichier | Contenu |
|---|---|
| `tests/telechargement.spec.ts` | `waitForEvent('download')`, `suggestedFilename`, `path`, `saveAs`, `createReadStream`, `testInfo.attach` |
| `tests/upload.spec.ts` | `setInputFiles` (disque, buffer, multiple, vide), `waitForEvent('filechooser')` |
| `tests/onglets.spec.ts` | `waitForEvent('popup')`, `context.waitForEvent('page')`, `context.pages()`, `window.open` vers un tiers (URL vérifiée sans attendre le chargement) |
| `tests/horloge.spec.ts` | `setFixedTime`, `install`, `pauseAt`, `runFor`, `fastForward`, `resume` |

Le dossier `.telechargements/` est créé puis supprimé par le test qui l'utilise ; il est dans `.gitignore`.

Validé sur Playwright 1.62.1 (Node 22, Linux), y compris avec `--repeat-each 2`.
