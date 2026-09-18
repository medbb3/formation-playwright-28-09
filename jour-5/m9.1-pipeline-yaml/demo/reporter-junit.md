# Reporter JUnit (à ajouter dans `frontend/playwright.config.ts`)

```ts
reporter: [
  ['list'],
  ['html', { open: 'never' }],
  ['junit', { outputFile: 'test-results/junit.xml' }],   // lu par PublishTestResults@2
],
```

Le fichier JUnit contient un `<testcase>` par test, avec le projet et le fichier ; l'onglet Tests d'Azure DevOps en déduit l'historique par test et les tests instables.
