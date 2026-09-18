# M6.2 — Tests d'accessibilité avec @axe-core/playwright

## 1. Cours théorique

### 1.1 Pourquoi tester l'accessibilité

L'accessibilité numérique permet aux personnes en situation de handicap (vision, motricité, cognition, audition) d'utiliser une application : lecteur d'écran, navigation clavier, zoom, contrastes. Trois raisons de la tester automatiquement :

1. **Obligation légale** : en France, le RGAA s'impose aux services publics et, depuis la loi de 2023 transposant l'*European Accessibility Act* (applicable depuis juin 2025), aux services bancaires en ligne, e-commerce, transports... Une banque est directement concernée.
2. **Qualité** : sémantique correcte = locators de niveau 1 (M1.2). Les deux vont ensemble.
3. **Coût** : un défaut détecté en développement coûte moins qu'un audit externe ou une plainte.

Limite :

- L'automatisation détecte **30 à 40 %** des critères (contrastes, attributs, structure).
- Le reste (pertinence des alternatives, ordre de lecture, compréhension) est manuel : navigation clavier, lecteur d'écran (NVDA gratuit), zoom 200 %.
- Le test automatisé est un **filet** anti-régression sur ce qui est détectable.

### 1.2 Référentiels : WCAG 2.1 AA et RGAA

- **WCAG** (Web Content Accessibility Guidelines, W3C) : norme internationale, trois niveaux de conformité (**A**, **AA**, **AAA**). **WCAG 2.1 AA** est la cible légale en Europe (norme EN 301 549).
- **RGAA** (Référentiel Général d'Amélioration de l'Accessibilité, France) : méthode française d'application de WCAG, avec ses propres numéros de critères et une déclaration de conformité.
- En test automatisé, on retient surtout le nom de la **règle axe** (`label`, `color-contrast`, `frame-title`...) : plus lisible dans un rapport que les numéros de critères.

Deux correspondances à connaître, parce qu'elles reviennent dans l'exercice et la correction :

| Sujet | WCAG | RGAA | Règle axe |
|---|---|---|---|
| Contraste texte | 1.4.3 (AA) | 3.2 | `color-contrast` |
| Iframe sans titre | 4.1.2 | 2.1 | `frame-title` |

Pour les autres règles axe (`image-alt`, `label`, `button-name`, `html-has-lang`...), le nom de la règle suffit à situer le défaut sans mémoriser un numéro de critère.

### 1.3 axe-core et `@axe-core/playwright`

**axe-core** (Deque) : le moteur d'analyse d'accessibilité le plus utilisé (Lighthouse, extensions navigateur, la plupart des outils).

- Injecte un script dans la page, parcourt le DOM (shadow DOM et iframes inclus).
- Renvoie des **violations** par règle et par impact (`minor`, `moderate`, `serious`, `critical`), avec les nœuds concernés (sélecteur, HTML, explication, lien vers la documentation).

```powershell
npm i -D @axe-core/playwright
```

```ts
import AxeBuilder from '@axe-core/playwright';

test('la page de virement n\'a pas de violation détectable', async ({ page }) => {
  await page.goto('/virement');
  const resultats = await new AxeBuilder({ page }).analyze();
  expect(resultats.violations).toEqual([]);
});
```

Structure de `resultats` :

- `violations` (à corriger), `passes`, `incomplete` (à vérifier à la main : axe n'a pas pu conclure, par exemple un contraste sur image de fond), `inapplicable`.
- Chaque violation : `id`, `impact`, `description`, `help`, `helpUrl`, `tags` (wcag2a, wcag2aa, wcag22aa, best-practice...), `nodes[]` avec `target` (sélecteur), `html`, `failureSummary`.

### 1.4 Configurer le scan

```ts
new AxeBuilder({ page })
  .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])   // niveau visé : WCAG 2.2 AA
  .include('#formulaire-virement')      // scanner un composant seulement
  .exclude('#chat-widget-tiers')        // ignorer une zone (widget externe non maîtrisé)
  .disableRules(['color-contrast'])     // désactiver une règle, avec justification tracée
  .options({ runOnly: { type: 'rule', values: ['label', 'button-name'] } })   // ne lancer que ces règles
  .analyze();
```

- **Tags** : sans `withTags`, axe lance toutes ses règles, y compris `best-practice` et `experimental`. Fixer explicitement le référentiel visé. `wcag22aa` n'inclut pas les niveaux inférieurs : lister tous les tags.
- **`include` / `exclude`** : sélecteurs CSS. Scan **par composant** (formulaire, tableau, modale) : ciblé, rapide, à sa place dans le test fonctionnel du composant (modale ouverte, puis scannée).
- **`disableRules`** : réservé aux faux positifs avérés ou aux règles couvertes ailleurs, toujours avec un commentaire (ticket ou raison). Sans justification, c'est une violation cachée.
- **Scan après action** : axe analyse le DOM courant. Pour un état (erreur de formulaire affichée, menu ouvert) : agir, puis scanner. Plusieurs scans par test sont normaux.

### 1.5 Rattacher les violations au rapport

Un tableau de violations dans la console est illisible. Trois niveaux :

```ts
// 1. Pièce jointe JSON complète (exploitable par un script ou un outil)
await testInfo.attach('axe-violations', {
  body: JSON.stringify(resultats.violations, null, 2),
  contentType: 'application/json',
});

// 2. Résumé lisible dans le message d'assertion
const resume = resultats.violations.map(
  (v) => `${v.impact} ${v.id} (${v.nodes.length} nœud(s)) : ${v.help}\n  ${v.nodes.map((n) => n.target.join(' ')).join('\n  ')}`,
).join('\n');
expect(resultats.violations, resume).toEqual([]);

// 3. Un helper partagé (utils/a11y.ts) qui fait les deux, plus une annotation par violation
```

Reporters dédiés : `axe-html-reporter` produit une page HTML par scan (à attacher) ; en CI, le JSON permet de compter les violations par impact dans un tableau de bord (M10.1 : KPI accessibilité).

### 1.6 Stratégie de mise en place sur une application existante

Une application jamais testée a des dizaines de violations : `toEqual([])` serait rouge d'emblée et la suite ignorée. Par étapes :

1. **Inventaire** : un scan par écran clé, pièces jointes, aucune assertion bloquante. On sait où on en est.
2. **Filet sur les `critical` et `serious`** : `expect(violations.filter(v => ['critical','serious'].includes(v.impact))).toEqual([])`. Bloquant dès maintenant.
3. **Budget** : `expect(violations.length).toBeLessThanOrEqual(N)`, N baisse à chaque sprint jusqu'à zéro.
4. **Zéro violation** sur les nouveaux écrans dès leur création (Definition of Done, M10.1).
5. Règles désactivées temporairement listées dans un fichier unique avec leur ticket ; revue mensuelle.

Compléments manuels à planifier :

- Parcours clavier complet (Tab, Entrée, Échap), lecteur d'écran sur les parcours critiques, zoom 200 % et 400 %, préférence `prefers-reduced-motion`.
- Aide de Playwright : `page.keyboard.press('Tab')` et `toBeFocused()` pour l'ordre de tabulation, `page.emulateMedia({ reducedMotion: 'reduce' })`.

### 1.7 Bonnes pratiques

1. Tags explicites (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`) dans un helper unique.
2. Un scan par écran clé, plus un scan ciblé par composant après ses interactions (formulaire en erreur, modale ouverte).
3. Violations attachées au rapport, résumé dans le message d'assertion.
4. `disableRules` et `exclude` justifiés par un commentaire et un ticket.
5. Progression par impact puis par budget, jamais un `skip` global.
6. Lire `incomplete` : ce sont les points à vérifier à la main.
7. Ordre de tabulation des formulaires critiques vérifié avec `Tab` + `toBeFocused()`.

### 1.8 Erreurs fréquentes

| Erreur | Cause | Correction |
|---|---|---|
| `toEqual([])` rouge avec 40 violations le premier jour | Pas de stratégie de mise en place | Inventaire puis impacts puis budget |
| Scan avant que la page soit rendue | axe analyse un DOM incomplet | Assertion web-first sur un élément clé avant `analyze()` |
| `withTags(['wcag22aa'])` seul | Ne teste que les critères nouveaux de 2.2 AA | Lister tous les niveaux |
| Faux positif de contraste sur un texte sur image | Limite d'axe : dans `incomplete` | Vérifier manuellement, ne pas désactiver la règle |
| Violations d'un widget tiers (chat, cookies) | Hors périmètre | `exclude`, et signaler au fournisseur |
| Scan d'une modale : violations de l'arrière-plan | Scan global | `include` sur la modale, ou vérifier `aria-hidden` du fond |
| Test vert mais aucune violation vérifiée | `analyze()` sans assertion | `expect(...)` |
| `disableRules` sans commentaire | Dette invisible | Justification et ticket |

### 1.9 Points à retenir

- L'automatisation couvre un tiers des critères ; le reste est manuel.
- WCAG 2.2 AA est la cible ; le RGAA est la méthode française, alignée sur WCAG 2.1 AA.
- `AxeBuilder` : `withTags`, `include`, `exclude`, `disableRules`, `analyze()` ; scanner après les actions.
- Violations dans le rapport (JSON + résumé) ; mise en place par impact puis budget.

---

## 2. Démonstration

**Objectif** : sur Demoblaze (site riche en défauts), inventaire d'un écran avec pièces jointes, lecture des impacts, ciblage de la modale de connexion, exclusion d'une zone, règle désactivée avec justification, filet sur `critical`/`serious`, contrôle clavier.

**Site** : https://www.demoblaze.com

### Étapes

1. Installer `@axe-core/playwright` ; `utils/a11y.ts` : helper `scan(page, testInfo, options)` avec tags WCAG 2.2 AA, pièce jointe JSON et résumé texte.
2. Test 1 « inventaire » : scan de la home, aucune assertion bloquante, `test.info().annotations` avec le nombre de violations par impact. Dans le rapport : pièce jointe, `helpUrl`.
3. Test 2 : modale « Log in » ouverte, `include('#logInModal')` : champs sans label associé (`label`), la difficulté rencontrée en M5.2 avec `getByLabel`. Lien direct entre accessibilité et testabilité.
4. Test 3 : `exclude('#tbodyid')` (catalogue chargé dynamiquement, hors sujet pour l'en-tête) et `disableRules(['color-contrast'])` commenté « ticket DEM-12, charte graphique en cours ». Différence de nombre de violations.
5. Test 4 : filet `critical`/`serious` sur la home : échoue sur Demoblaze, laissé en `test.fail()` avec la raison. Sur la mini-banque, il sera bloquant.
6. Test 5 : clavier dans la modale de connexion : `Tab` depuis Username, `toBeFocused()` sur Password puis sur le bouton.

### Code complet

Voir `demo/`. Extrait, `utils/a11y.ts` :

```ts
import AxeBuilder from '@axe-core/playwright';
import { type Page, type TestInfo } from '@playwright/test';

export const WCAG_22_AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

export type ScanOptions = { include?: string; exclude?: string[]; disableRules?: string[]; nom?: string };

export async function scanA11y(page: Page, testInfo: TestInfo, options: ScanOptions = {}) {
  let builder = new AxeBuilder({ page }).withTags(WCAG_22_AA);
  if (options.include) builder = builder.include(options.include);
  for (const sel of options.exclude ?? []) builder = builder.exclude(sel);
  if (options.disableRules?.length) builder = builder.disableRules(options.disableRules);

  const resultats = await builder.analyze();
  const nom = options.nom ?? 'axe';
  await testInfo.attach(`${nom}-violations.json`, { body: JSON.stringify(resultats.violations, null, 2), contentType: 'application/json' });

  const parImpact: Record<string, number> = {};
  for (const v of resultats.violations) parImpact[v.impact ?? 'inconnu'] = (parImpact[v.impact ?? 'inconnu'] ?? 0) + 1;
  testInfo.annotations.push({ type: `${nom}`, description: `${resultats.violations.length} violation(s) ${JSON.stringify(parImpact)}, ${resultats.incomplete.length} à vérifier` });

  const resume = resultats.violations
    .map((v) => `[${v.impact}] ${v.id} : ${v.help} (${v.nodes.length} nœud(s))\n    ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join('\n    ')}`)
    .join('\n');
  return { ...resultats, resume };
}
```

### Explication du code

- Le helper centralise les tags : un seul endroit pour changer de référentiel.
- Pièce jointe JSON nommée par scan (`nom`), pour distinguer plusieurs scans dans un test.
- Le résumé sert de message d'assertion : l'échec liste les règles et les trois premiers sélecteurs.
- Le test de filet filtre par impact ; le test d'inventaire n'a qu'une annotation, pas d'assertion.

### Résultat attendu

- Tests 1, 2, 3 verts avec pièces jointes et annotations chiffrées (Demoblaze : de l'ordre de 5 à 10 règles violées sur la home, dont `label`, `image-alt`, `color-contrast`).
- Test 4 en échec attendu. Test 5 vert.

---

## 3. Exercice (30 minutes)

Voir `exercice.md`.

## 4. Correction

Voir `correction/`.

## 5. Contribution au projet fil rouge

**Ce qui change dans les tests de la mini-banque** (séance fil rouge) :

- `tests/utils/a11y.ts` : helper partagé.
- `tests/a11y/virement.spec.ts` : scan de l'écran de virement à trois états (formulaire vide, erreur « Solde insuffisant » affichée, iframe des conditions incluse), filet bloquant `toEqual([])` sur WCAG 2.2 AA, contrôle de l'ordre de tabulation du formulaire.
- Page Bénéficiaires et tableau de bord scannés en inventaire (annotations).

**Ce qui change dans l'application** : l'écran de virement livré pour la séance contient des défauts d'accessibilité. Vous les détectez avec axe, les documentez dans le rapport, puis les corrigez dans le front (ou décrivez la correction). Après correction : zéro violation.

**Lien avec la notion** : une application accessible est une application testable, même constat que sur Demoblaze en M5.2. L'iframe des conditions vérifie le critère `frame-title` (RGAA 2.1).

## Ressources externes

- Accessibility testing : https://playwright.dev/docs/accessibility-testing
- @axe-core/playwright : https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright
- Règles axe (liste, tags, impacts) : https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md
- WCAG 2.2 : https://www.w3.org/TR/WCAG22/ (traduction : https://www.w3.org/Translations/WCAG22-fr/)
- RGAA 4.1.2 : https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/
- Correspondance RGAA / WCAG : https://accessibilite.numerique.gouv.fr/methode/correspondance-wcag/
- NVDA (lecteur d'écran gratuit) : https://www.nvaccess.org
