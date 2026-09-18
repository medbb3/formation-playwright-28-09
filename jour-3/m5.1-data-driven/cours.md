# M5.1 — Data-driven testing

## 1. Cours théorique

### 1.1 Le problème

- Un formulaire de virement a une dizaine de règles : montant nul, négatif, supérieur au solde, IBAN trop court, mauvais pays, libellé vide ou trop long.
- Dix tests copiés-collés : dix fois le même code, deux valeurs qui changent.
- **Data-driven testing** : logique du test identique, données variables. Une fonction, N jeux de données, N tests dans le rapport.

Bénéfices :

- Ajouter un cas = ajouter une ligne de données.
- Le métier peut relire ou fournir le tableau.
- Un test par cas dans le rapport : échec précis.

### 1.2 Le pattern natif : une boucle autour de `test`

- Pas d'API `test.each` dans Playwright : on écrit une boucle.
- Les tests sont **déclarés** au chargement du fichier, avant exécution : une boucle `for` ordinaire suffit.

```ts
const cas = [
  { user: 'standard_user', attendu: 'catalogue' },
  { user: 'locked_out_user', attendu: 'erreur' },
];

for (const { user, attendu } of cas) {
  test(`connexion de ${user} mène à ${attendu}`, async ({ page }) => {
    // ...
  });
}
```

Règles :

- **Titre unique**, avec la donnée discriminante. Deux titres identiques dans un fichier = erreur `duplicate test title`.
- Titre lisible : « refuse un montant de -5 » plutôt que « cas 3 ».
- Données **immuables** : ne pas muter un objet partagé entre itérations.
- Boucle possible dans un `test.describe` pour grouper.

Variante `test.describe` paramétré, quand plusieurs tests partagent une donnée :

```ts
for (const navigateur of ['chromium', 'firefox']) {
  test.describe(`sur ${navigateur}`, () => {
    test.use({ browserName: navigateur });   // ou tout autre option
    test('...', async ({ page }) => { ... });
  });
}
```

### 1.3 Paramétrer par projet plutôt que par boucle

- Variable d'**environnement** (navigateur, viewport, langue, utilisateur par défaut) : un **projet** dans la config, pas une boucle.
- Chaque test tourne une fois par projet (M1.1), avec une option `test.use`.

| Variable | Mécanisme |
|---|---|
| Données métier (montants, IBAN, profils) | Boucle sur un tableau / fichier |
| Environnement (navigateur, taille d'écran, locale, rôle par défaut) | Projets et options |

### 1.4 Charger un JSON

- Jeux de données stables et lisibles : un fichier JSON dans `data/`.
- Import direct en TypeScript via `resolveJsonModule` (activé par défaut par Playwright).

```json
// data/virements-invalides.json
[
  { "cas": "montant nul", "montant": "0", "erreur": "Le montant doit être positif" },
  { "cas": "montant négatif", "montant": "-5", "erreur": "Le montant doit être positif" }
]
```

```ts
import cas from '../data/virements-invalides.json';

for (const c of cas) {
  test(`virement refusé : ${c.cas}`, async ({ browser, baseURL }, testInfo) => {
    await commeRole(browser, baseURL!, testInfo, 'bob', async ({ pages }) => { ... });
  });
}
```

- Typage inféré depuis le contenu. Contrat explicite : `type Cas = { ... }` et `const liste: Cas[] = cas`.
- Sans import : `JSON.parse(fs.readFileSync(path.join(__dirname, '../data/x.json'), 'utf-8'))`, utile si le fichier dépend de l'environnement.

### 1.5 Charger un CSV métier

Le CSV est le format que le métier produit (Excel). Playwright recommande `csv-parse` :

```powershell
npm i -D csv-parse
```

```ts
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'csv-parse/sync';

type Ligne = { cas: string; montant: string; iban: string; attendu: string };

const lignes = parse(fs.readFileSync(path.join(__dirname, '../data/virements.csv'), 'utf-8'), {
  columns: true,          // 1re ligne = noms de colonnes
  skip_empty_lines: true,
  trim: true,
  delimiter: ';',         // Excel FR exporte souvent en ;
}) as Ligne[];

for (const l of lignes) {
  test(`virement : ${l.cas}`, async ({ page }) => { ... });
}
```

Points d'attention :

- Encodage UTF-8 avec ou sans BOM (`bom: true` dans les options).
- Séparateur `,` ou `;`.
- Virgule décimale : « 12,50 » est une chaîne.
- Booléens (« oui »/« non »), cellules vides.
- Tout est chaîne : convertir explicitement (`Number(l.montant.replace(',', '.'))`).

Conversion dans une fonction `charger()` de `utils/data.ts`, qui renvoie des objets typés et validés. Les tests ne manipulent jamais de CSV brut.

### 1.6 Données et rapport

- Titre avec la donnée : c'est ce qu'on lit dans le rapport et en CI.
- `test.info().annotations.push({ type: 'donnée', description: JSON.stringify(c) })` attache le cas complet au rapport, utile si le titre est court.
- 100 lignes = 100 tests UI = plusieurs minutes. Les règles de validation se testent mieux en API (M4.1) : data-driven sur `request`, 100 cas en 5 secondes.
- `--grep` fonctionne sur les titres générés : `--grep "montant négatif"`.

### 1.7 Bonnes pratiques

1. Données dans `data/`, logique dans `tests/`, chargeur typé dans `utils/`.
2. Un titre par cas, unique, avec la donnée discriminante.
3. Cas nominal, limites et erreurs dans le même tableau, avec une colonne « attendu ».
4. Pas de `if (c.type === 'erreur')` dans le corps du test : deux tableaux, deux boucles.
5. Valider les données au chargement (colonnes présentes, valeurs numériques) : échec au chargement, pas au 47e test.
6. Règles nombreuses en API, quelques parcours représentatifs en UI.
7. Fichiers de données versionnés avec les tests : ils font partie du code.

### 1.8 Erreurs fréquentes

| Erreur | Symptôme | Correction |
|---|---|---|
| Titres identiques | `Error: duplicate test title` | Inclure la donnée dans le titre |
| `test()` déclaré dans un `beforeAll` ou après `await` | « test() can only be called in a test file at the top level » | Boucle synchrone au niveau du fichier |
| Lecture de fichier avec un chemin relatif au cwd | Fonctionne en local, pas en CI | `path.join(__dirname, ...)` |
| CSV avec `;` lu avec le délimiteur par défaut | Une seule colonne contenant tout | `delimiter: ';'` |
| Nombre lu comme chaîne | `'12' + 1 === '121'` | Convertir |
| Mutation de la donnée dans le test | Effets entre itérations | `const`, objets non partagés |
| `if` sur le type de cas dans le test | Test illisible, assertions conditionnelles | Deux boucles |
| 200 cas UI | Suite de 20 minutes | Passer les règles en API |

### 1.9 Points à retenir

- Boucle `for` autour de `test`, titre unique avec la donnée.
- Données métier en boucle, environnement en projets.
- JSON importé, CSV via `csv-parse` avec un chargeur typé.
- Les validations nombreuses se font en data-driven **API**.

---

## 2. Démonstration

**Objectif** : sur SauceDemo, remplacer trois tests de connexion copiés-collés par une boucle, charger les mêmes cas depuis un JSON, puis vérifier le catalogue depuis un CSV « métier » (nom ; prix).

**Site** : https://www.saucedemo.com

### Étapes

1. `tests/avant.spec.ts` : trois tests presque identiques (standard, locked_out, mauvais mot de passe).
2. `tests/connexion.spec.ts` : tableau `cas` (`user`, `password`, `attendu` : `'catalogue'` ou un message) et une boucle. 3 tests, titres explicites.
3. Tableau déplacé dans `data/connexions.json` : résultat identique, autocomplétion sur `c.attendu`.
4. `data/produits.csv` (séparateur `;`, prix avec virgule) ; `utils/data.ts` avec `chargerProduits()` (csv-parse, conversion du prix) ; `tests/catalogue.spec.ts` : un test par produit sur le prix affiché. 6 tests.
5. Ligne fausse dans le CSV (prix erroné) : un seul échec, nommé d'après le produit. Ligne retirée ensuite.
6. `--grep "Backpack"` : un seul cas lancé.

### Code complet

Voir `demo/`. Extraits :

```ts
// tests/connexion.spec.ts
import cas from '../data/connexions.json';

for (const c of cas) {
  test(`connexion de ${c.user} : ${c.attendu}`, async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder('Username').fill(c.user);
    await page.getByPlaceholder('Password').fill(c.password);
    await page.getByRole('button', { name: 'Login' }).click();

    if (c.attendu === 'catalogue') {
      await expect(page).toHaveURL(/inventory/);
    } else {
      await expect(page.getByTestId('error')).toContainText(c.attendu);
    }
  });
}
```

Remarque : ce `if` est toléré ici (deux issues, assertion simple). Avec plus de branches : deux fichiers de données.

```ts
// utils/data.ts
export function chargerProduits(): Produit[] {
  const brut = fs.readFileSync(path.join(__dirname, '../data/produits.csv'), 'utf-8');
  const lignes = parse(brut, { columns: true, delimiter: ';', trim: true, bom: true }) as Record<string, string>[];
  return lignes.map((l) => {
    const prix = Number(l.prix.replace(',', '.'));
    if (!l.nom || Number.isNaN(prix)) throw new Error(`Ligne CSV invalide : ${JSON.stringify(l)}`);
    return { nom: l.nom, prix };
  });
}
```

### Explication du code

- Import JSON = tableau typé ; le titre embarque `user` et `attendu`.
- `chargerProduits` convertit et valide : une ligne cassée fait échouer le chargement du fichier, avec un message clair.
- Le test catalogue formate le prix attendu (`$${p.prix.toFixed(2)}`) et le compare au texte de la carte.

### Résultat attendu

`connexion.spec.ts` : 3 tests ; `catalogue.spec.ts` : 6 tests, tous verts. Avec la ligne fausse : 1 échec nommé d'après le produit.

---

## 3. Exercice (30 minutes)

Voir `exercice.md`.

## 4. Correction

Voir `correction/`.

## 5. Contribution au projet fil rouge

**Ce qui change dans les tests de la mini-banque** (séance fil rouge) :

- `tests/data/virements-invalides.csv`, fourni « par le métier » (cas, compte, IBAN, montant, libellé, message attendu), et un chargeur `utils/data.ts`.
- Data-driven **API** sur `POST /api/transfers` : un test par ligne, rapide.
- Data-driven **UI** : trois cas représentatifs seulement.

**Ce qui change dans l'application** : messages d'erreur métier explicites pour chaque règle de virement (montant nul ou négatif, IBAN invalide, libellé vide), à la place du détail Pydantic brut, pour un message attendu lisible dans le CSV.

**Lien avec la notion** : même règle testée à deux niveaux avec le même fichier de données ; un test par ligne du CSV dans le rapport.

## Ressources externes

- Paramétrer des tests : https://playwright.dev/docs/test-parameterize
- csv-parse : https://csv.js.org/parse/
- Projets : https://playwright.dev/docs/test-projects
- Annotations : https://playwright.dev/docs/test-annotations
