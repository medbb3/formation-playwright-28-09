// Gate 4 : chaque critère d'acceptation (CA-n) des specs validées a au moins un test qui le référence (// spec: ... CA-n),
// ou un fixme documenté. Usage : node scripts/coverage-criteres.mjs frontend/specs frontend/tests
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const [, , specsDir = 'frontend/specs', testsDir = 'frontend/tests'] = process.argv;
const seuils = JSON.parse(readFileSync(new URL('../quality-gates.json', import.meta.url), 'utf-8'));

const lire = (dir) => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? lire(p) : [p];
});

const criteres = [];
for (const spec of lire(specsDir).filter((f) => /SPEC-.*\.md$/.test(f))) {
  const texte = readFileSync(spec, 'utf-8');
  if (/\*\*Statut\*\*\s*:\s*\*\*en cours/i.test(texte)) continue;   // specs non livrées exclues
  const id = (texte.match(/^# (SPEC-[A-Z]+-\d+)/m) ?? [])[1];
  for (const m of texte.matchAll(/Scénario(?: |\s*:)\s*(CA-\d+)/g)) criteres.push({ spec: id, ca: m[1], fichier: spec });
  for (const m of texte.matchAll(/Plan du scénario\s*:\s*(CA-\d+)/g)) criteres.push({ spec: id, ca: m[1], fichier: spec });
}

const tests = lire(testsDir).filter((f) => f.endsWith('.spec.ts')).map((f) => readFileSync(f, 'utf-8'));
const couvert = ({ spec, ca }) => tests.some((t) => t.includes(spec) && new RegExp(`\\b${ca}\\b`).test(t));

const manquants = criteres.filter((c) => !couvert(c));
console.log(`Critères : ${criteres.length}, couverts : ${criteres.length - manquants.length}`);
for (const m of manquants) console.log(`##vso[task.logissue type=warning]Critère non couvert : ${m.spec} ${m.ca} (${m.fichier})`);
if (manquants.length > seuils.criteresNonCouvertsMax) {
  console.log(`##vso[task.complete result=Failed;]${manquants.length} critère(s) non couvert(s)`);
  process.exit(1);
}
console.log('Gate couverture des critères : OK');
