import AxeBuilder from '@axe-core/playwright';
import { type Page, type TestInfo } from '@playwright/test';

/** Référentiel visé : WCAG 2.2 niveau AA (inclut A et les versions 2.0 / 2.1). */
export const WCAG_22_AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

export type ScanOptions = { include?: string; exclude?: string[]; disableRules?: string[]; nom?: string };

/** Lance axe, attache les violations au rapport (JSON), annote le test et retourne un résumé lisible. */
export async function scanA11y(page: Page, testInfo: TestInfo, options: ScanOptions = {}) {
  let builder = new AxeBuilder({ page }).withTags(WCAG_22_AA);
  if (options.include) builder = builder.include(options.include);
  for (const sel of options.exclude ?? []) builder = builder.exclude(sel);
  if (options.disableRules?.length) builder = builder.disableRules(options.disableRules);

  const resultats = await builder.analyze();
  const nom = options.nom ?? 'axe';
  await testInfo.attach(`${nom}-violations.json`, {
    body: JSON.stringify(resultats.violations, null, 2),
    contentType: 'application/json',
  });

  const parImpact: Record<string, number> = {};
  for (const v of resultats.violations) {
    const impact = v.impact ?? 'inconnu';
    parImpact[impact] = (parImpact[impact] ?? 0) + 1;
  }
  testInfo.annotations.push({
    type: nom,
    description: `${resultats.violations.length} violation(s) ${JSON.stringify(parImpact)}, ${resultats.incomplete.length} à vérifier manuellement`,
  });

  const resume = resultats.violations
    .map((v) => `[${v.impact}] ${v.id} : ${v.help} (${v.nodes.length} nœud(s))\n    ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join('\n    ')}`)
    .join('\n');
  return { ...resultats, resume };
}

export const bloquantes = (violations: { impact?: string | null }[]) =>
  violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
