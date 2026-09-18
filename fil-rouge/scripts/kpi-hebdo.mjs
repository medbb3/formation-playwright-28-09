// Produit RAPPORT-HEBDO.md à partir de report.json (et de la couverture des critères si disponible).
// Usage : node scripts/kpi-hebdo.mjs frontend/test-results/report.json > RAPPORT-HEBDO.md
import { readFileSync } from 'node:fs';

const [, , rapportPath = 'frontend/test-results/report.json'] = process.argv;
const r = JSON.parse(readFileSync(rapportPath, 'utf-8'));

const tests = [];
const visite = (suite, chemin = []) => {
  for (const spec of suite.specs ?? []) for (const t of spec.tests ?? []) {
    tests.push({ fichier: spec.file, titre: spec.title, statut: t.status, duree: t.results?.reduce((s, x) => s + (x.duration ?? 0), 0) ?? 0, projet: t.projectName });
  }
  for (const s of suite.suites ?? []) visite(s, [...chemin, s.title]);
};
for (const s of r.suites ?? []) visite(s);

const n = (st) => tests.filter((t) => t.statut === st).length;
const total = tests.length - n('skipped');
const reussite = total ? ((n('expected') / total) * 100).toFixed(1) : '0';
const flaky = tests.filter((t) => t.statut === 'flaky');
const flakyPct = total ? ((flaky.length / total) * 100).toFixed(1) : '0';
const dureeMin = ((r.stats?.duration ?? 0) / 60000).toFixed(1);
const lents = [...tests].sort((a, b) => b.duree - a.duree).slice(0, 5);
const semaine = (() => { const d = new Date(); const j = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); const jour = j.getUTCDay() || 7; j.setUTCDate(j.getUTCDate() + 4 - jour); const debut = new Date(Date.UTC(j.getUTCFullYear(), 0, 1)); return Math.ceil(((j - debut) / 86400000 + 1) / 7); })();

console.log(`# Suite Playwright — semaine ${semaine}

## En un coup d'œil (dernier run complet)
| Réussite | Flakiness | Durée du run | Tests exécutés | Sautés (fixme) |
|---|---|---|---|---|
| ${reussite} % | ${flakyPct} % (${flaky.length}) | ${dureeMin} min | ${total} | ${n('skipped')} |

## Ce qui a été trouvé
<!-- À compléter par le QA lead : tickets ouverts par la suite cette semaine (KPI 6) -->

## Tests instables (à corriger ou fixme + ticket)
${flaky.length ? flaky.map((t) => `- ${t.fichier} › ${t.titre} [${t.projet}]`).join('\n') : '- aucun'}

## Tests en échec
${tests.filter((t) => t.statut === 'unexpected').map((t) => `- ${t.fichier} › ${t.titre} [${t.projet}]`).join('\n') || '- aucun'}

## Les 5 tests les plus longs
${lents.map((t) => `- ${(t.duree / 1000).toFixed(1)} s — ${t.titre} [${t.projet}]`).join('\n')}

## Couverture des critères
<!-- Sortie de scripts/coverage-criteres.mjs -->

## Décisions attendues
<!-- À compléter -->
`);
