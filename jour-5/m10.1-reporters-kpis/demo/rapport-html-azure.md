# Publier le rapport HTML et les résultats JUnit depuis Azure Pipelines

Azure DevOps ne sert pas le rapport HTML de Playwright (ce n'est pas un onglet Tests) ; il se télécharge comme artefact et s'ouvre en local ou via une extension.

```yaml
- task: PublishTestResults@2
  condition: succeededOrFailed()
  inputs:
    testResultsFormat: JUnit
    testResultsFiles: frontend/test-results/junit.xml
    testRunTitle: 'Playwright'
    failTaskOnFailedTests: false
  displayName: Publier les résultats (onglet Tests)
- task: PublishPipelineArtifact@1
  condition: succeededOrFailed()
  inputs: { targetPath: frontend/playwright-report, artifact: playwright-report }
  displayName: Publier le rapport HTML
```

- `PublishTestResults@2` (JUnit) alimente l'onglet **Tests** du run et de la PR : c'est la vue « résultats Azure DevOps » utilisée pour les KPIs 1 et 2.
- L'artefact `playwright-report` se télécharge et s'ouvre avec `npx playwright show-report <dossier>`, ou en ligne via l'extension marketplace « HTML Viewer », ou un hébergement statique. Aucun outil tiers n'est nécessaire pour la formation.
