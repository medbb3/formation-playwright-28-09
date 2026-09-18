# M1.2 — Stratégie de locators, actions et assertions web-first

## 1. Cours théorique

### 1.1 Qu'est-ce qu'un locator ?

Un **locator** décrit comment trouver un ou plusieurs éléments dans la page. Point essentiel :

> Un locator ne cherche rien au moment où on le crée. Il cherche au moment où on l'utilise (action ou assertion), et il recherche à nouveau à chaque tentative.

```ts
const bouton = page.getByRole('button', { name: 'Login' }); // rien ne se passe
await bouton.click();                                        // recherche + attente + clic
```

Conséquences :

- Déclarer les locators en haut du test ou dans un Page Object (J2) : ils ne sont jamais « périmés ».
- Si React redessine le DOM, le locator retrouve le nouvel élément. Fin du `StaleElementReferenceException` de Selenium.
- Locator **strict** : plusieurs éléments au moment d'une action = erreur `strict mode violation`, pas de clic sur le premier au hasard.

### 1.2 Les 6 niveaux de priorité

Cibler les éléments comme l'utilisateur les perçoit, pas comme le développeur les a codés. Du plus robuste au plus fragile :

| Niveau | Locator | Cible | Quand l'utiliser |
|---|---|---|---|
| 1 | `getByRole(role, { name })` | Rôle ARIA + nom accessible | Boutons, liens, cases, titres, champs, onglets. **Premier réflexe.** |
| 2 | `getByLabel(text)` / `getByPlaceholder(text)` | Champs de formulaire par leur libellé ou placeholder | Inputs, selects, textareas |
| 3 | `getByText(text)` | Texte visible d'un élément non interactif | Messages, paragraphes, cellules |
| 4 | `getByAltText(text)` / `getByTitle(text)` | Attributs `alt` d'image et `title` | Images, icônes avec infobulle |
| 5 | `getByTestId(id)` | Attribut `data-testid` posé exprès | Quand aucun des précédents n'est stable (widgets, listes générées) |
| 6 | `locator(css)` / `locator('xpath=...')` | Structure du DOM | Dernier recours : SVG, éléments sans sémantique, code legacy |

Pourquoi cet ordre :

- Rôle + nom **valide aussi l'accessibilité**. Si `getByRole('button', { name: 'Valider' })` ne trouve rien, le bouton est souvent un `<div onClick>`, invisible aussi pour un lecteur d'écran.
- CSS (`.btn-primary:nth-child(2)`) casse au premier refactoring de style, sans changement de comportement.

#### Niveau 1 en détail : `getByRole`

Rôles principaux : `button`, `link`, `textbox`, `checkbox`, `radio`, `combobox`, `option`, `heading`, `list`, `listitem`, `table`, `row`, `cell`, `dialog`, `alert`, `tab`, `menuitem`, `img`, `navigation`.

**Nom accessible** : calculé comme par un lecteur d'écran : texte du bouton, `aria-label`, `<label>` associé, `alt` d'une image dans un lien, etc.

```ts
page.getByRole('button', { name: 'Valider' });            // sous-chaîne, insensible à la casse
page.getByRole('button', { name: 'Valider', exact: true }); // égalité stricte
page.getByRole('button', { name: /valid/i });             // regex
page.getByRole('heading', { level: 2 });                  // <h2>
page.getByRole('checkbox', { checked: true });
page.getByRole('link', { name: 'Accueil' });
page.getByRole('textbox', { name: 'Adresse e-mail' });    // input associé au label
```

Attention : `<input type="password">` n'a aucun rôle (pas `textbox`). Ciblez-le par `getByLabel`.

#### Niveau 2 : `getByLabel` et `getByPlaceholder`

```ts
page.getByLabel('Mot de passe');        // <label for="pwd"> ou aria-label ou aria-labelledby
page.getByPlaceholder('Rechercher...');
```

`getByLabel` : le meilleur locator pour un formulaire. Inputs de tous types, selects, textareas.

#### Niveau 3 : `getByText`

```ts
page.getByText('Bienvenue');                    // sous-chaîne, casse ignorée, espaces normalisés
page.getByText('Bienvenue', { exact: true });   // texte entier
page.getByText(/^Total : \d+ €$/);
```

Pour vérifier un affichage, pas pour cliquer. Texte dans un bouton : `getByRole`.

#### Niveau 5 : `getByTestId`

```ts
page.getByTestId('cart-badge');   // <span data-testid="cart-badge">
```

- Attribut configurable : `use: { testIdAttribute: 'data-test' }` dans la config (SauceDemo utilise `data-test`).
- Indépendant du texte et du style, mais ne valide rien de ce que voit l'utilisateur.
- Réservé aux cas où les niveaux 1 à 4 ne suffisent pas. À faire poser par les développeurs (fil rouge).

#### Niveau 6 : CSS et XPath

```ts
page.locator('#username');
page.locator('.product-card >> nth=2');   // ancienne syntaxe, à éviter
page.locator('xpath=//button[contains(., "OK")]');
```

Acceptable pour du legacy. Interdit en formation sauf autorisation explicite dans l'énoncé.

### 1.3 Composer et affiner les locators

Les locators se chaînent : chaque méthode restreint la recherche au sous-arbre du précédent.

```ts
// Chaînage : le bouton "Ajouter" à l'intérieur de la carte produit "Sac à dos"
page.getByRole('listitem').filter({ hasText: 'Sac à dos' }).getByRole('button', { name: 'Ajouter' });

// filter : garder les éléments qui contiennent un texte ou un autre locator
page.getByRole('row').filter({ hasText: 'Alice' });
page.getByRole('row').filter({ has: page.getByRole('checkbox', { checked: true }) });
page.getByRole('row').filter({ hasNot: page.getByText('Archivé') });

// Position dans une liste (uniquement si l'ordre a un sens métier)
page.getByRole('listitem').first();
page.getByRole('listitem').last();
page.getByRole('listitem').nth(2);

// Combiner : l'un OU l'autre
page.getByRole('button', { name: 'Nouveau' }).or(page.getByRole('button', { name: 'Créer' }));

// Intersection : l'un ET l'autre
page.getByRole('button').and(page.getByTitle('Enregistrer'));

// Dénombrer
await expect(page.getByRole('listitem')).toHaveCount(6);
```

Erreur classique : `page.getByRole('button').click()` sur une page à 10 boutons donne `strict mode violation: resolved to 10 elements`. Le message liste les candidats : une aide, pas une punition.

### 1.4 Les actions et l'actionnabilité

Avant chaque action, Playwright attend que toutes les **vérifications d'actionnabilité** soient vraies (timeout d'action 0 par défaut, donc borné par le timeout du test de 30 s) :

| Vérification | Signification |
|---|---|
| Attached | L'élément est dans le DOM |
| Visible | Boîte non vide, pas de `visibility:hidden`, pas de `display:none` |
| Stable | Même position sur deux frames consécutives (fin d'animation) |
| Enabled | Pas d'attribut `disabled` |
| Editable | Enabled et non `readonly` (pour `fill`) |
| Receives events | L'élément est bien celui qui recevra le clic au point visé (pas masqué par un overlay) |

| Action | Vérifications | Note |
|---|---|---|
| `click()` | Visible, Stable, Enabled, Receives events | Options `{ button: 'right' }`, `{ modifiers: ['Control'] }`, `{ force: true }` désactive les vérifications (à éviter) |
| `dblclick()` | idem | |
| `fill(texte)` | Visible, Enabled, Editable | Vide le champ puis saisit d'un coup. Déclenche `input`. |
| `pressSequentially(texte)` | idem | Frappe touche par touche, pour les champs à autocomplétion |
| `press('Enter')` | | Touches : `Enter`, `Tab`, `Escape`, `ArrowDown`, `Control+a` |
| `check()` / `uncheck()` | Visible, Stable, Enabled | Case à cocher, radio ; idempotent |
| `selectOption('fr')` | Visible, Enabled | Par valeur, label `{ label: 'France' }` ou tableau |
| `hover()` | Visible, Stable, Receives events | |
| `setInputFiles(chemin)` | | Upload |
| `dragTo(cible)` | | Glisser-déposer |
| `focus()`, `blur()`, `clear()` | | |

Par rapport à Selenium :

- Plus de `WebDriverWait(...).until(element_to_be_clickable)`.
- Si l'attente échoue, l'erreur nomme la vérification en cause (« element is not visible », « element intercepts pointer events »).

### 1.5 Les assertions web-first

`expect` de Playwright a deux familles :

1. **Génériques**, immédiates, sur une valeur JavaScript : `expect(x).toBe(1)`, `toEqual`, `toContain`, `toBeTruthy`. Sans attente.
2. **Web-first**, sur un `Locator` ou une `Page` : **réessaient** jusqu'à réussite ou timeout (5 s par défaut, `expect.timeout` dans la config).

```ts
// MAUVAIS : lit la valeur une fois, échoue si le texte n'est pas encore rendu
expect(await page.getByTestId('total').textContent()).toBe('42 €');

// BON : réessaie jusqu'à ce que le texte soit '42 €'
await expect(page.getByTestId('total')).toHaveText('42 €');
```

Principales assertions web-first :

| Assertion | Vérifie |
|---|---|
| `toBeVisible()` / `toBeHidden()` | Visibilité (`toBeHidden` passe aussi si l'élément n'existe pas) |
| `toBeAttached()` | Présence dans le DOM |
| `toHaveText(texte \| regex \| tableau)` | Texte complet (normalisé) ; tableau pour une liste |
| `toContainText(texte)` | Sous-chaîne |
| `toHaveValue(valeur)` | Valeur d'un input |
| `toHaveCount(n)` | Nombre d'éléments |
| `toBeEnabled()` / `toBeDisabled()` | État |
| `toBeChecked()` | Case cochée |
| `toHaveAttribute(nom, valeur)` | Attribut |
| `toHaveClass(regex)` | Classe CSS |
| `toHaveCSS(prop, valeur)` | Style calculé |
| `toBeFocused()` | Focus |
| `toBeInViewport()` | Visible à l'écran |
| `toHaveURL(url \| regex)` | Sur `page` |
| `toHaveTitle(titre \| regex)` | Sur `page` |
| `toHaveScreenshot()` | Comparaison visuelle (M6.1) |

- Négation : `await expect(locator).not.toBeVisible()`.
- Options utiles : `{ timeout: 10_000 }` pour un cas lent identifié, `{ ignoreCase: true }`, `{ useInnerText: true }`.
- **Soft assertions** : `await expect.soft(locator).toHaveText('x')` note l'échec et continue. Utile pour remonter d'un coup plusieurs champs d'un formulaire.

### 1.6 Vérifier plusieurs choses sans s'arrêter à la première erreur : `expect.soft`

`await expect(locator).toXxx()` couvre l'immense majorité des besoins. Une situation reste à part : vérifier plusieurs champs indépendants d'un même écran sans que le premier échec masque les suivants.

- Une assertion classique interrompt le test au premier échec : sur un relevé de dix champs, dix exécutions pour tout voir.
- `expect.soft` enregistre l'échec, laisse continuer, et marque le test en échec à la fin.

```ts
await expect.soft(recap.getByTestId('montant')).toHaveText('150,00 €');
await expect.soft(recap.getByTestId('beneficiaire')).toHaveText('Alice Martin');
await expect.soft(recap.getByTestId('date')).toHaveText('15/01/2026');
// Le rapport liste les trois écarts d'un coup.
```

- Réservé aux assertions **indépendantes** de vérification d'affichage.
- Une assertion qui conditionne la suite (l'écran est-il chargé ?) reste dure : continuer sur un écran absent produit dix échecs illisibles.
- `test.info().errors` permet de couper explicitement après un groupe de soft.

Repère rapide :

| Besoin | Outil |
|---|---|
| Un élément de la page | `await expect(locator).toXxx()` |
| Plusieurs vérifications indépendantes d'un coup | `expect.soft` |
| Une valeur déjà lue, figée | `expect(valeur)` — sans réessai, à éviter |

Code exécutable : `demo/tests/assertions-avancees.spec.ts`.

### 1.7 Bonnes pratiques

1. Rôle et nom d'abord. Descendre de niveau seulement si nécessaire, avec justification en commentaire.
2. `exact: true` quand un libellé est le préfixe d'un autre (« Enregistrer » et « Enregistrer et quitter »).
3. Une action = un utilisateur. Pas de `page.evaluate` pour contourner un élément désactivé ; pas de `force: true` sans ticket expliquant pourquoi.
4. Vérifier l'effet d'une action par une assertion web-first, jamais par `waitForTimeout`.
5. Vérifier l'état final, pas la mécanique : « le panier affiche 1 article », pas « la classe `badge-active` est présente ».
6. Listes : `filter({ hasText })` plutôt que `nth()`, qui dépend de l'ordre.
7. `data-testid` demandés aux développeurs uniquement pour les éléments sans sémantique (graphiques, canvases, widgets tiers).

### 1.8 Erreurs fréquentes

| Erreur | Cause | Correction |
|---|---|---|
| `strict mode violation: ... resolved to N elements` | Locator trop large | Affiner avec `name`, `exact`, `filter`, ou chaîner depuis un conteneur |
| `getByRole('textbox', { name: 'Password' })` ne trouve rien | Le type password n'a pas de rôle | `getByLabel('Password')` |
| `getByText('Login')` cible le titre au lieu du bouton | `getByText` ne filtre pas par rôle | `getByRole('button', { name: 'Login' })` |
| `expect(await locator.isVisible()).toBe(true)` échoue aléatoirement | Assertion générique, pas de retry | `await expect(locator).toBeVisible()` |
| `element is not visible` après un clic sur un menu | Animation en cours | Rien à faire, Playwright attend « stable » ; sinon vérifier l'overlay avec `receives events` |
| `toHaveText('Total: 42')` échoue avec texte identique | Espaces insécables, texte enfant | Utiliser `toContainText`, ou regex, ou `useInnerText` |
| Le test clique sur le mauvais élément d'une liste | `nth(0)` sur une liste dont l'ordre change | `filter({ hasText })` |
| `click()` sans `await` puis assertion | Course entre le clic et la vérification | `await` |
| `expect.soft` sur une assertion qui conditionne la suite | Dix échecs illisibles sur un écran non chargé | Garder une assertion dure d'abord, soft ensuite |
| `waitForTimeout` pour « laisser le temps » | Test lent et instable | Assertion web-first sur l'état attendu |

### 1.9 Points à retenir

- Un locator est une recette, réévaluée à chaque utilisation, et stricte.
- Ordre de priorité : rôle, label/placeholder, texte, alt/title, test id, CSS.
- Les actions attendent l'actionnabilité : visible, stable, activé, reçoit les événements.
- `await expect(locator).toXxx()` réessaie ; `expect(valeur).toBe()` n'attend pas.
- Composer avec `filter`, chaînage, `or`, `and` avant de recourir à `nth`.
- Quand une assertion classique s'arrêterait trop tôt sur plusieurs vérifications indépendantes : `expect.soft`. Jamais `waitForTimeout`.

---

## 2. Démonstration

**Objectif** : sur SauceDemo, trouver le bon locator pour chaque niveau, provoquer une `strict mode violation`, la résoudre par `filter`, comparer assertion générique et assertion web-first.

**Site** : https://www.saucedemo.com. Attribut de test id du site : `data-test`, configuré par `testIdAttribute: 'data-test'` dans `playwright.config.ts`.

### Étapes

1. DevTools sur le site : le bouton « Login » est un `<input type="submit" value="Login">`, rôle `button`, nom accessible `Login`. Un champ : placeholder `Username`, `data-test="username"`.
2. `npx playwright test --ui`, test « niveaux de locators », **Pick locator** sur chaque élément. À retenir : l'outil propose toujours le niveau le plus haut possible.
3. Test « strict mode violation » : il échoue. Lire l'erreur et la liste des 6 boutons candidats.
4. Corriger avec `filter({ hasText: 'Sauce Labs Backpack' })`. Relancer.
5. Test « assertion générique vs web-first » : comparer les deux variantes.
6. Tri des produits : `selectOption`, puis `toHaveText` avec un tableau pour vérifier l'ordre complet.

### Code complet : `demo/tests/locators.spec.ts`

```ts
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/inventory/);
});

test('niveaux de locators : un exemple par niveau', async ({ page }) => {
  // Niveau 1 : rôle + nom accessible
  await expect(page.getByRole('button', { name: 'Open Menu' })).toBeVisible();
  // Piège réel : le produit a DEUX liens portant ce nom (l'image via son alt, et le titre).
  // Un locator strict refuse de choisir : on le montre, puis on affine par le texte visible.
  await expect(page.getByRole('link', { name: 'Sauce Labs Backpack' })).toHaveCount(2);
  await expect(
    page.getByRole('link', { name: 'Sauce Labs Backpack' }).filter({ hasText: 'Sauce Labs Backpack' }),
  ).toBeVisible();

  // Niveau 2 : label / placeholder (pas de formulaire ici, on montre sur la page de login)
  // page.getByPlaceholder('Username')

  // Niveau 3 : texte visible
  await expect(page.getByText('Products')).toBeVisible();

  // Niveau 4 : alt d'image
  await expect(page.getByAltText('Sauce Labs Backpack')).toBeVisible();

  // Niveau 5 : test id (attribut data-test configuré dans playwright.config.ts)
  await expect(page.getByTestId('inventory-list')).toBeVisible();

  // Niveau 6 : CSS, à éviter, montré pour comparaison
  await expect(page.locator('.inventory_item')).toHaveCount(6);
});

test('strict mode violation puis correction', async ({ page }) => {
  // Version 1 (à décommenter pour montrer l'erreur) : 6 boutons "Add to cart"
  // await page.getByRole('button', { name: 'Add to cart' }).click();

  // Version 2 : on part du conteneur produit, puis on descend
  const backpack = page.getByTestId('inventory-item').filter({ hasText: 'Sauce Labs Backpack' });
  await backpack.getByRole('button', { name: 'Add to cart' }).click();

  // Le bouton a changé de libellé : preuve que l'action a eu un effet
  await expect(backpack.getByRole('button', { name: 'Remove' })).toBeVisible();
  await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');
});

test('assertion générique vs assertion web-first', async ({ page }) => {
  const backpack = page.getByTestId('inventory-item').filter({ hasText: 'Sauce Labs Backpack' });
  await backpack.getByRole('button', { name: 'Add to cart' }).click();

  // Générique : lit UNE fois. Fonctionne ici car le badge est rendu de façon synchrone,
  // mais échouera sur toute application qui appelle une API avant de mettre à jour.
  const texte = await page.getByTestId('shopping-cart-badge').textContent();
  expect(texte).toBe('1');

  // Web-first : réessaie jusqu'à 5 s. Toujours préférer cette forme.
  await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');
});

test('tri des produits par prix croissant', async ({ page }) => {
  await page.getByTestId('product-sort-container').selectOption('lohi');

  const prix = page.getByTestId('inventory-item-price');
  await expect(prix).toHaveCount(6);
  await expect(prix.first()).toHaveText('$7.99');
  await expect(prix.last()).toHaveText('$49.99');

  // Vérification de l'ordre complet
  await expect(prix).toHaveText(['$7.99', '$9.99', '$15.99', '$15.99', '$29.99', '$49.99']);
});
```

### Explication du code

- `testIdAttribute: 'data-test'` dans la config : `getByTestId` fonctionne sur les attributs du site.
- `beforeEach` : login de M1.1 réutilisé. La connexion est un prérequis, pas le sujet du test.
- `filter({ hasText })` sur le conteneur produit, puis `getByRole` dedans : motif standard pour toute liste de cartes.
- Libellé du bouton « Add to cart » devenu « Remove » : assertion sur l'effet visible de l'action.
- `toHaveText` avec un tableau : vérifie le nombre et l'ordre.

### Résultat attendu

4 tests verts. Version 1 du test 2 décommentée : échec `strict mode violation: getByRole('button', { name: 'Add to cart' }) resolved to 6 elements`, avec la liste des six boutons.

---

## 3. Exercice (35 minutes)

Voir `exercice.md`.

## 4. Correction

Voir `correction/`.

## 5. Contribution au projet fil rouge

**Ce qui est ajouté** : composants React de la mini-banque avec une sémantique HTML correcte (vrais `<button>`, `<label for>`, `<nav>`, `<table>`, `role="alert"` pour les messages). `data-testid` uniquement sur les éléments sans sémantique : carte de solde du tableau de bord, lignes du relevé.

**Lien avec la notion** : ces choix permettent d'écrire les 6 tests du fil rouge J1 avec des locators de niveaux 1 à 5 seulement. En fin de journée, vous justifiez le niveau choisi pour chaque locator.

**Extrait de ce que vous verrez** (composant de login, à ne pas coder maintenant) :

```tsx
<form onSubmit={handleSubmit} aria-label="Connexion">
  <label htmlFor="email">Adresse e-mail</label>
  <input id="email" type="email" value={email} onChange={...} />
  <label htmlFor="password">Mot de passe</label>
  <input id="password" type="password" value={password} onChange={...} />
  {error && <p role="alert">{error}</p>}
  <button type="submit">Se connecter</button>
</form>
```

Tests correspondants : `getByLabel('Adresse e-mail')`, `getByLabel('Mot de passe')`, `getByRole('button', { name: 'Se connecter' })`, `getByRole('alert')`.

## Ressources externes

- Locators : https://playwright.dev/docs/locators
- Actions : https://playwright.dev/docs/input
- Actionnabilité : https://playwright.dev/docs/actionability
- Assertions : https://playwright.dev/docs/test-assertions
- Bonnes pratiques : https://playwright.dev/docs/best-practices
- Rôles ARIA (référence) : https://www.w3.org/TR/wai-aria-1.2/#role_definitions
- Nom accessible (calcul) : https://www.w3.org/TR/accname-1.2/
