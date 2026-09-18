# M1.1 — Installation et premier test

## 1. Cours théorique

### 1.1 Qu'est-ce que Playwright ?

- Framework de test end-to-end open source, créé par Microsoft en 2020.
- Pilote un vrai navigateur comme un utilisateur : ouvrir une page, cliquer, saisir, vérifier l'affichage.

Trois idées clés :

1. **Un seul outil, tous les navigateurs.** Chromium (Chrome, Edge), Firefox et WebKit (Safari) : même API. Binaires téléchargés par Playwright, indépendants du Chrome du poste.
2. **Auto-wait intégré.** Avant chaque action : élément visible, stable, activé, recevant les événements. Fini la majorité des `sleep()` des suites Selenium.
3. **Isolation par contexte.** Un `BrowserContext` neuf par test, équivalent d'une fenêtre de navigation privée : cookies, localStorage, session vierges. Un contexte coûte quelques millisecondes ; un navigateur, plusieurs secondes.

### 1.2 L'écosystème Playwright

| Composant | Rôle |
|---|---|
| `@playwright/test` | Le test runner : découverte des tests, exécution parallèle, assertions, fixtures, rapports. C'est ce que l'on installe. |
| `playwright` (librairie) | L'API de pilotage seule, sans runner. Utile pour du scraping ou pour l'intégrer à Jest. On ne l'utilisera pas en formation. |
| Navigateurs | Chromium, Firefox, WebKit, installés par `npx playwright install`. |
| Outils | Codegen (enregistreur), Inspector (pas-à-pas), Trace Viewer (rejeu après coup), UI Mode (interface graphique). Vus en M2.1. |
| Extension VS Code | Lancer, débugger et enregistrer les tests depuis l'éditeur. |
| Langages | TypeScript / JavaScript (référence), Python, Java, .NET. La formation utilise TypeScript. |

### 1.3 Par rapport à Selenium et Cypress

Playwright n'est pas « à la mode » : il ajoute l'auto-wait et l'isolation par contexte que Selenium n'a pas nativement, et couvre Chromium/Firefox/WebKit avec le parallélisme et les tests API en natif là où Cypress reste plus limité sur ces deux derniers points.

### 1.4 Rappel TypeScript et async/await (10 minutes maximum)

Rappel limité à ce qui apparaît dans chaque test.

```ts
import { test, expect } from '@playwright/test';   // import ES modules

test('nom du test', async ({ page }) => {          // fonction asynchrone
  await page.goto('https://example.com');          // chaque action retourne une Promise
  await expect(page).toHaveTitle(/Example/);       // les assertions aussi
});
```

- `async` : la fonction contient des opérations asynchrones.
- `await` : suspend la fonction jusqu'à la fin de l'opération. **Oublier un `await` : erreur numéro 1 des débutants.** Le test continue sans attendre ; l'assertion passe ou échoue au hasard.
- `{ page }` : **destructuration**. Le runner fournit un objet de fixtures ; on prend `page`. Détail en M3.2.
- Types TypeScript : `page` est un `Page`, VS Code complète `page.goto`, `page.click`, etc. Aucune configuration : Playwright transpile lui-même.

### 1.5 Installation avec `npm init playwright@latest`

```powershell
mkdir demo-playwright; cd demo-playwright
npm init playwright@latest
```

L'assistant pose 4 questions :

| Question | Réponse conseillée | Pourquoi |
|---|---|---|
| TypeScript ou JavaScript ? | TypeScript | Autocomplétion, cohérence avec la doc |
| Nom du dossier des tests ? | `tests` | Convention |
| Ajouter un workflow GitHub Actions ? | false | On fera Azure DevOps au J5 |
| Installer les navigateurs ? | true | Télécharge Chromium, Firefox, WebKit (environ 500 Mo) |

Poste lent : `npx playwright install chromium` (Chromium seul).

### 1.6 Arborescence générée

```
demo-playwright/
├── node_modules/
├── package.json              # dépendance @playwright/test
├── package-lock.json
├── playwright.config.ts      # LA configuration du runner
├── tests/
│   └── example.spec.ts       # 2 tests d'exemple sur playwright.dev
└── tests-examples/
    └── demo-todo-app.spec.ts # suite complète sur une todo app (bon exemple à lire)
```

Convention : un fichier de test se termine par `.spec.ts` ou `.test.ts`. Pattern par défaut : `testMatch: '**/*.@(spec|test).?(c|m)[jt]s?(x)'`.

### 1.7 Le fichier `playwright.config.ts`, ligne par ligne

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',            // où chercher les tests
  fullyParallel: true,           // les tests d'un même fichier peuvent tourner en parallèle
  forbidOnly: !!process.env.CI,  // en CI, un test.only oublié fait échouer le build
  retries: process.env.CI ? 2 : 0,   // relances en CI seulement
  workers: process.env.CI ? 1 : undefined, // nb de processus (undefined = moitié des CPU)
  reporter: 'html',              // rapport HTML dans playwright-report/
  use: {
    trace: 'on-first-retry',     // trace enregistrée seulement à la 1re relance
    // baseURL: 'http://localhost:5173',  // permet page.goto('/')
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
  ],
});
```

Notions clés :

- **Worker** et **project** : un worker exécute les tests (processus Node avec son propre navigateur), un project est une configuration nommée qui fait tourner chaque test une fois par navigateur listé. En formation : `chromium` seul, pour gagner du temps.
- **`use`** : options transmises aux fixtures (navigateur, viewport, baseURL, trace, screenshot, video).
- **`retries`** : filet de sécurité en CI, jamais une solution à un test flaky (M2.2).

### 1.8 Anatomie d'un test

```ts
import { test, expect } from '@playwright/test';

test.describe('Page d\'accueil', () => {          // groupe optionnel

  test.beforeEach(async ({ page }) => {           // exécuté avant chaque test du groupe
    await page.goto('https://playwright.dev/');
  });

  test('a un titre', async ({ page }) => {
    await expect(page).toHaveTitle(/Playwright/);
  });

  test('le lien Get started mène à l\'installation', async ({ page }) => {
    await page.getByRole('link', { name: 'Get started' }).click();
    await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
  });
});
```

Structure : **Arrange** (aller sur la page, préparer l'état), **Act** (une action utilisateur), **Assert** (une vérification web-first avec `expect`).

### 1.9 Exécuter les tests

| Commande | Effet |
|---|---|
| `npx playwright test` | Tout, en headless, sur tous les projets |
| `npx playwright test --project=chromium` | Un seul navigateur |
| `npx playwright test tests/login.spec.ts` | Un fichier |
| `npx playwright test -g "titre"` | Les tests dont le nom contient « titre » |
| `npx playwright test --headed` | Navigateur visible |
| `npx playwright test --ui` | UI Mode, exploration interactive |
| `npx playwright test --debug` | Inspector, pas-à-pas |
| `npx playwright test --workers=1` | Séquentiel |
| `npx playwright show-report` | Ouvre le dernier rapport HTML |

### 1.10 Le rapport HTML

- Généré dans `playwright-report/index.html`. Ouverture automatique en cas d'échec (`open: 'on-failure'` par défaut).
- Par test : statut, durée, projet, étapes (`test.step`), pièces jointes (screenshot, vidéo, trace), erreur avec diff attendu / obtenu.
- Filtres : passed, failed, flaky, skipped. **Flaky** = échoué puis réussi après relance.
- `test-results/` : artefacts bruts (captures, traces). Les deux dossiers vont dans `.gitignore`.

### 1.11 Bonnes pratiques dès le premier jour

1. Un `.spec.ts` par fonctionnalité. Nom de test = comportement attendu : « affiche une erreur si le mot de passe est vide », pas « test 3 ».
2. `await` devant chaque action et chaque assertion.
3. Pas de `page.waitForTimeout()`. Le besoin signale un locator ou une assertion manquants.
4. `baseURL` dans la config, pas d'URL en dur dans les tests.
5. Committer `playwright.config.ts` et `package-lock.json` ; ignorer `node_modules/`, `test-results/`, `playwright-report/`.
6. Fixer la version : `npm install -D @playwright/test@1.xx` puis `npx playwright install` à chaque mise à jour, sinon les binaires ne correspondent plus.

### 1.12 Erreurs fréquentes

| Symptôme | Cause | Correction |
|---|---|---|
| `Executable doesn't exist at ...chromium...` | Navigateurs non installés ou version de `@playwright/test` changée | `npx playwright install` |
| Test qui passe sans rien vérifier | `await` oublié devant `expect` | Ajouter `await`, activer la règle ESLint `@typescript-eslint/no-floating-promises` |
| `Test timeout of 30000ms exceeded` | Un locator ne trouve rien, l'action attend indéfiniment | Vérifier le locator dans l'Inspector (M2.1) |
| `Error: No tests found` | Fichier mal nommé (`login.ts` au lieu de `login.spec.ts`) ou hors `testDir` | Renommer |
| `test.only` committé, CI verte avec 1 test | `forbidOnly` désactivé | Garder `forbidOnly: !!process.env.CI` |
| Rapport vide après `show-report` | Lancé depuis le mauvais dossier | Se placer à la racine du projet |

### 1.13 Points à retenir

- Playwright = runner + API navigateur + outils, installé en une commande.
- L'auto-wait et l'isolation par contexte sont les deux fondations de sa fiabilité.
- `playwright.config.ts` pilote tout : dossier, parallélisme, navigateurs, rapports.
- Un test = `test('nom', async ({ page }) => { ... })`, toujours avec `await`.
- Le rapport HTML est l'outil de lecture des résultats ; `test-results/` contient les preuves.

---

## 2. Démonstration

**Objectif** : installer Playwright, lire l'arborescence, lancer les tests d'exemple, écrire un premier test sur SauceDemo, lire le rapport HTML avec un échec volontaire.

**Site** : https://www.saucedemo.com (identifiants `standard_user` / `secret_sauce`).

### Étapes

1. Créer le projet.

```powershell
mkdir demo-m11; cd demo-m11
npm init playwright@latest
# TypeScript, tests, pas de GitHub Actions, installer les navigateurs
```

2. Ouvrir dans VS Code : `package.json`, `playwright.config.ts`, `tests/example.spec.ts`. Relire les options de la config (section 1.7).

3. `npx playwright test` : 6 tests (2 tests x 3 projets), les workers, la durée.

4. `npx playwright show-report` : les filtres, un test, ses étapes.

5. Réduire la config au seul Chromium (commenter firefox et webkit). Ajouter `baseURL: 'https://www.saucedemo.com'`.

6. Créer `tests/saucedemo.spec.ts` (code ci-dessous). Lancer en `--headed` pour voir le navigateur.

7. Casser le second test (titre « Product » au lieu de « Products »). Relancer, lire l'erreur dans le rapport : diff attendu / obtenu, capture d'écran, 5 secondes d'attente de l'assertion.

8. Réparer, relancer : `test-results/` vide, rapport vert.

### Code complet : `demo/playwright.config.ts`

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'https://www.saucedemo.com',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
```

### Code complet : `demo/tests/saucedemo.spec.ts`

```ts
import { test, expect } from '@playwright/test';

test.describe('SauceDemo - connexion', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('la page de login affiche le formulaire', async ({ page }) => {
    await expect(page).toHaveTitle('Swag Labs');
    await expect(page.getByPlaceholder('Username')).toBeVisible();
    await expect(page.getByPlaceholder('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });

  test('un utilisateur standard peut se connecter', async ({ page }) => {
    await page.getByPlaceholder('Username').fill('standard_user');
    await page.getByPlaceholder('Password').fill('secret_sauce');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL(/inventory\.html/);
    await expect(page.getByText('Products')).toBeVisible();
  });

  test('un utilisateur bloqué voit un message d\'erreur', async ({ page }) => {
    await page.getByPlaceholder('Username').fill('locked_out_user');
    await page.getByPlaceholder('Password').fill('secret_sauce');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByRole('heading', { name: /locked out/i })).toBeVisible();
    await expect(page).toHaveURL('/');
  });
});
```

### Explication du code

- `test.describe` : regroupe les trois tests, préfixe dans le rapport.
- `beforeEach` : évite de répéter `page.goto('/')`. Le `/` est résolu par `baseURL`.
- `getByPlaceholder`, `getByRole`, `getByText` : locators « orientés utilisateur » (détail en M1.2). Aucun sélecteur CSS.
- `toHaveURL(/inventory\.html/)` accepte une expression régulière. `toHaveURL('/')` compare avec `baseURL + '/'`.
- Chaque `expect(...)` attend jusqu'à 5 secondes que la condition soit vraie : assertion web-first.

### Résultat attendu

```
Running 3 tests using 3 workers
  3 passed (4.2s)
```

Après l'échec volontaire : test en rouge, erreur `Expected: visible, Received: hidden`, liste des locators essayés, capture d'écran de la page au moment de l'échec.

---

## 3. Exercice (20 minutes)

Voir `exercice.md`.

## 4. Correction

Voir `correction/`.

## 5. Contribution au projet fil rouge

**Ce qui est ajouté** : rien dans l'application. En séance fil rouge, vous initialisez Playwright **dans `fil-rouge/frontend`** avec la même commande que la démo, puis `baseURL: 'http://localhost:5173'` et un seul projet `chromium`.

**Lien avec la notion** : la config de 1.7 sert toute la semaine. Deux différences : `baseURL` (application locale) et, au Jour 5, l'option `webServer` qui lance l'application avant les tests.

**Extrait de la config cible du fil rouge (pour information, à ne pas faire maintenant)** :

```ts
use: {
  baseURL: process.env.BASE_URL ?? 'http://localhost:5173',
  trace: 'retain-on-failure',
  screenshot: 'only-on-failure',
},
projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
```

## Ressources externes

- Installation : https://playwright.dev/docs/intro
- Écrire des tests : https://playwright.dev/docs/writing-tests
- Lancer des tests : https://playwright.dev/docs/running-tests
- Configuration : https://playwright.dev/docs/test-configuration
- Rapport HTML : https://playwright.dev/docs/test-reporters#html-reporter
- Extension VS Code : https://playwright.dev/docs/getting-started-vscode
- Notes de version (à consulter à chaque montée de version) : https://playwright.dev/docs/release-notes
