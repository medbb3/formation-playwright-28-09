// Gates 2 et 3 : réussite et stabilité, à partir du reporter JSON de Playwright.
// Usage : node scripts/quality-gate.mjs frontend/test-results/report.json [pr|nightly]
import { readFileSync } from 'node:fs';

const [, , rapportPath = 'frontend/test-results/report.json', mode = 'pr'] = process.argv;
const seuils = JSON.parse(readFileSync(new URL('../quality-gates.json', import.meta.url), 'utf-8'));
const rapport = JSON.parse(readFileSync(rapportPath, 'utf-8'));

const compte = { passed: 0, failed: 0, flaky: 0, skipped: 0 };
const flakys = [];
const visite = (suite) => {
  for (const spec of suite.specs ?? []) {
    for (const t of spec.tests ?? []) {
      const statut = t.status;   // expected | unexpected | flaky | skipped
      if (statut === 'expected') compte.passed++;
      else if (statut === 'unexpected') compte.failed++;
      else if (statut === 'flaky') { compte.flaky++; flakys.push(`${spec.file} › ${spec.title}`); }
      else compte.skipped++;
    }
  }
  for (const s of suite.suites ?? []) visite(s);
};
for (const s of rapport.suites ?? []) visite(s);

const total = compte.passed + compte.failed + compte.flaky;
const dureeMin = (rapport.stats?.duration ?? 0) / 60000;
console.log(`Résultats : ${JSON.stringify(compte)} ; durée ${dureeMin.toFixed(1)} min ; mode ${mode}`);

const erreurs = [];
if (compte.failed > seuils.failedMax) erreurs.push(`Gate réussite : ${compte.failed} test(s) en échec (max ${seuils.failedMax})`);
if (mode === 'pr') {
  if (compte.flaky > seuils.flakyMaxPr) erreurs.push(`Gate stabilité : ${compte.flaky} test(s) flaky en PR (max ${seuils.flakyMaxPr})`);
  if (dureeMin > seuils.durationMaxPrMin) erreurs.push(`Gate durée : ${dureeMin.toFixed(1)} min (max ${seuils.durationMaxPrMin})`);
} else {
  const pct = total ? (compte.flaky / total) * 100 : 0;
  if (pct > seuils.flakyMaxNightlyPct) erreurs.push(`Gate stabilité : ${pct.toFixed(1)} % de tests flaky (max ${seuils.flakyMaxNightlyPct} %)`);
}
if (flakys.length) console.log('Tests flaky :\n  ' + flakys.join('\n  '));

if (erreurs.length) {
  for (const e of erreurs) console.log(`##vso[task.logissue type=error]${e}`);
  console.log('##vso[task.complete result=Failed;]Quality gates non satisfaits');
  process.exit(1);
}
console.log('Quality gates : OK');
