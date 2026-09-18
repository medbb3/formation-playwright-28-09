// Extrait : bloc `reporter` de playwright.config.ts (état final du fil rouge)
// Un seul jeu de reporters actif : diagnostic local (html), résultats Azure DevOps (junit), scripts (json).
reporter: [
  ['list'],
  ['html', { open: 'never' }],
  ['junit', { outputFile: 'test-results/junit.xml' }],   // Azure DevOps (onglet Tests)
  ['json', { outputFile: 'test-results/report.json' }],  // gates et KPIs
],
