# M3.2 — Page Objects avancés : composition, PageObjectManager et flows métier

## 1. Cours théorique

### 1.1 Composition : un Page Object fait de composants

- M3.1 a introduit le composant (`HeaderComponent`) pour un élément partagé entre plusieurs pages.
- La règle se généralise : un Page Object **complexe** se compose d'autres classes plus petites, il ne fait pas tout lui-même.

```ts
// pages/SecureAreaPage.ts
export class SecureAreaPage {
  readonly flash: FlashComponent;   // composant réutilisé par plusieurs pages
  readonly heading: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.flash = new FlashComponent(page);
    this.heading = page.getByRole('heading', { name: 'Secure Area', exact: true });
    this.logoutButton = page.getByRole('link', { name: 'Logout' });
  }

  async logout() {
    await this.logoutButton.click();
  }
}
```

- **Composition, pas héritage** : `SecureAreaPage` contient un `FlashComponent`, il n'en hérite pas. Un `BasePage` avec `goto` reste la seule exception raisonnable (M3.1 §1.6).
- Un composant expose ses propres locators et actions ; la page qui le contient les réexpose via une propriété (`page.flash.banner`, pas `page.flashBanner`).
- Bénéfice concret : si le message flash change d'implémentation (id, rôle, timing), une seule classe à corriger, quel que soit le nombre de pages qui l'utilisent.

### 1.2 Le PageObjectManager : agrégateur par composition

- Avec 5 ou 6 Page Objects, un test qui touche plusieurs pages commence par autant de `new XxxPage(page)`.
- Le **PageObjectManager** regroupe cette construction dans une seule classe, avec instanciation paresseuse (getter + `??=`) :

```ts
// pages/PageObjectManager.ts
export class PageObjectManager {
  private _login?: LoginPage;
  private _secure?: SecureAreaPage;
  private _dropdown?: DropdownPage;

  constructor(private readonly page: Page) {}

  get login() { return (this._login ??= new LoginPage(this.page)); }
  get secure() { return (this._secure ??= new SecureAreaPage(this.page)); }
  get dropdown() { return (this._dropdown ??= new DropdownPage(this.page)); }
}
```

```ts
// dans un test
const pages = new PageObjectManager(page);
await pages.login.goto();
await pages.login.login('tomsmith', 'SuperSecretPassword!');
await expect(pages.secure.heading).toBeVisible();
```

- Un seul `new PageObjectManager(page)` par test, explicite, en première ligne : pas de mécanisme caché.
- Le manager **compose** des Page Objects, il ne remplace ni ne surcharge `page` : `pages.secure.heading` reste un `Locator` Playwright normal.
- Il devient utile à partir de 4-5 Page Objects, ou dès qu'un flow (§1.3) a besoin d'accéder à plusieurs pages en une fois. En dessous, `new LoginPage(page)` seul suffit très bien (M3.1).

### 1.3 Action métier (flow) : au-dessus des pages

Après M3.1 et §1.2, un test de commande ressemble à :

```ts
await pages.inventory.addToCart('Sauce Labs Backpack');
await pages.inventory.header.openCart();
await pages.cart.checkout();
await pages.checkoutInfo.fillAndContinue(customer);
await pages.overview.finish();
```

- Cinq lignes, répétées dans chaque test qui passe une commande.
- Une **action métier** (*flow*) regroupe des actions sur plusieurs pages en une opération nommée par le métier : « passer une commande », « effectuer un virement ».
- Elle vit dans un module à part (`flows/`), pas dans un Page Object : un Page Object décrit une page, un flow traverse plusieurs pages.

```ts
// flows/OrderFlow.ts
export class OrderFlow {
  constructor(private readonly pages: PageObjectManager) {}

  async placeOrder(product: string, customer: Customer) {
    await this.pages.inventory.addToCart(product);
    await this.pages.inventory.header.openCart();
    await this.pages.cart.checkout();
    await this.pages.checkoutInfo.fillAndContinue(customer);
    await this.pages.overview.finish();
  }
}
```

Trois niveaux, du bas vers le haut :

| Niveau | Contenu | Exemple |
|---|---|---|
| Page Object / composant | Locators + actions d'une page | `CartPage.checkout()` |
| Flow (action métier) | Enchaînement de pages, nommé par le métier | `OrderFlow.placeOrder()` |
| Test | Scénario + assertions | « une commande complète affiche la confirmation » |

- Un flow **agit**, il n'affirme rien : pas d'`expect` à l'intérieur. Les assertions restent dans le test (M3.1 §1.6).
- Un flow reçoit un `PageObjectManager` (ou les Page Objects dont il a besoin), jamais `page` directement : il reste au niveau « pages », pas « navigateur ».

### 1.4 Quand utiliser un flow, quand rester explicite

Un flow qui cache **tout**, y compris la connexion, rend le test illisible : on ne voit plus ce que le scénario suppose comme état de départ. Règle de visibilité :

| Situation | Dans le test |
|---|---|
| Setup court (connexion en 2 lignes), propre à ce test ou ce fichier | Explicite dans le test, ou dans un `test.beforeEach` local (§1.5) |
| Enchaînement métier de plusieurs pages, identique et répété dans plusieurs tests (« passer une commande », « effectuer un virement ») | Un flow nommé, appelé explicitement (`await order.placeOrder(...)`) |
| Cas particulier, ponctuel (un formulaire refusé, un utilisateur cassé) | Explicite dans le test, jamais dans le flow générique |

- Un flow se justifie par la **répétition** et la **traversée de plusieurs pages**, pas par le nombre de lignes à lui seul.
- Le nom du flow appel de le fait : `await order.placeOrder(...)` se lit comme une phrase métier, sans exposer les étapes internes ; le test garde `await pages.login.login(...)` visible parce que la connexion **n'est pas** l'objet du test.
- Cette règle vaut aussi en sens inverse : ne pas répéter un flow existant « à la main » dans un nouveau test sous prétexte d'aller plus vite — c'est la duplication que le flow existe pour éviter.

### 1.5 Rappel : `{ page }` est une fixture native

- Depuis le Jour 1, chaque test reçoit `{ page }` : une page de navigateur déjà ouverte, dans un contexte neuf, fermée automatiquement à la fin du test.
- `page` est une **fixture** : un objet préparé par Playwright avant le test. `context`, `browser`, `request` (M4.1) en sont d'autres, natives elles aussi.
- Playwright permet aussi de **créer ses propres fixtures** (`test.extend`, portées `test`/`worker`, fixtures automatiques, options par projet). Ce mécanisme existe et se rencontre dans des projets réels, mais il n'est pas traité dans ce module : il ajoute une couche d'indirection qui ne se justifie qu'une fois le POM composé (§1.1-1.3) déjà en place et ses limites atteintes.
- Pour du setup local à un fichier de tests, `test.beforeEach` suffit :

```ts
test.describe('zone sécurisée', () => {
  let pages: PageObjectManager;

  test.beforeEach(async ({ page }) => {
    pages = new PageObjectManager(page);
    await pages.login.goto();
    await pages.login.login('tomsmith', 'SuperSecretPassword!');
  });

  test('la zone sécurisée est accessible', async () => {
    await expect(pages.secure.heading).toBeVisible();
  });
});
```

- `beforeEach` copie le setup en tête de chaque fichier qui en a besoin : c'est un coût acceptable pour un module de POM, et beaucoup plus lisible pour un junior qu'une fixture personnalisée. Il redevient limitant seulement à grande échelle (dizaines de fichiers, setup coûteux à partager) : hors sujet ici.

### 1.6 Bonnes pratiques

1. Un composant par élément d'interface partagé (en-tête, message flash, modale), composé dans les Page Objects qui l'affichent — jamais dupliqué.
2. `PageObjectManager` à partir de 4-5 Page Objects ou dès qu'un flow doit en toucher plusieurs ; en dessous, l'instanciation directe (M3.1) suffit.
3. Un flow par action métier répétée sur plusieurs pages, nommé par le métier (`placeOrder`, pas `doStuff`), sans assertion à l'intérieur.
4. Le setup court et propre à un test reste visible dans le test (ou dans un `beforeEach` local) : ne pas le déplacer dans un flow pour « faire propre ».
5. `new PageObjectManager(page)` en première ligne de chaque test : explicite, pas de mécanisme caché à ce stade de la formation.

### 1.7 Erreurs fréquentes

| Erreur | Conséquence | Correction |
|---|---|---|
| Assertion dans un flow (`await expect(...)` dans `OrderFlow`) | L'échec est attribué au flow, le test ne dit plus ce qu'il vérifie | Assertions dans le test, uniquement des actions dans le flow |
| Flow qui inclut la connexion | Le test ne montre plus son état de départ, revue de code plus difficile | Connexion explicite (ou `beforeEach`), flow réservé à l'enchaînement métier |
| `PageObjectManager` avec deux pages seulement | Complexité ajoutée sans bénéfice | Instanciation directe des Page Objects (M3.1) |
| Un flow qui prend `page` au lieu du `PageObjectManager` | Le flow retombe au niveau locators, perd l'intérêt de la composition | Le flow dépend des Page Objects, pas du navigateur brut |
| Setup dupliqué copié-collé dans chaque test d'un même fichier | Dix lignes identiques, un oubli lors d'un changement | `test.beforeEach` dans le même fichier |
| Component Object composé par héritage (`class SecureAreaPage extends FlashComponent`) | Couplage fort, la page hérite de méthodes qui n'ont pas de sens pour elle | Composition : une propriété, pas une classe mère |

### 1.8 Points à retenir

- Composition partout : composants dans les Page Objects, Page Objects dans le `PageObjectManager`. Jamais d'héritage au-delà d'un `BasePage` minimal.
- `PageObjectManager` agrège et instancie à la demande ; il ne surcharge pas `page`, il la complète.
- Un flow traverse plusieurs pages pour une action métier répétée, sans assertion ; le test garde le setup court visible et fait les vérifications.
- `{ page }` est une fixture Playwright native. Les fixtures personnalisées (`test.extend`) existent mais restent hors du périmètre de ce module ; `test.beforeEach` couvre le setup local ici.

---

## 2. Démonstration

**Objectif** : sur SauceDemo, partir du projet POM de M3.1 ; composer un `FlashComponent`-like `HeaderComponent` (déjà vu) dans les pages, ajouter un `PageObjectManager`, un flow `OrderFlow`, puis des tests qui les appellent explicitement — connexion visible dans chaque test ou dans un `beforeEach` local.

**Site** : https://www.saucedemo.com

### Étapes

1. `pages/PageObjectManager.ts` : instanciation paresseuse des 6 Page Objects du catalogue (getters avec `??=`).
2. `flows/OrderFlow.ts` : `placeOrder(product, customer)`, sans assertion ; il traverse inventaire → panier → informations → récapitulatif.
3. `tests/catalogue.spec.ts` : `test.describe` avec `test.beforeEach` qui construit le `PageObjectManager` et connecte `standard_user` — setup local, visible en tête de fichier.
4. `tests/commande.spec.ts` : connexion explicite dans chaque test (pas de `beforeEach`, pour montrer l'autre style), puis `new OrderFlow(pages)` pour le scénario de bout en bout ; un test de détail (formulaire refusé) reste écrit page par page, sans flow.
5. Comparer les deux styles de setup (`beforeEach` vs explicite) : même résultat, à choisir selon que le fichier partage un seul contexte de départ ou plusieurs.

### Code complet

Voir `demo/`. Extrait central, `flows/OrderFlow.ts` :

```ts
import { type PageObjectManager, type Customer } from '../pages';

/** Action métier : traverse 4 pages. Suppose l'utilisateur déjà connecté et sur le catalogue. */
export class OrderFlow {
  constructor(private readonly pages: PageObjectManager) {}

  async placeOrder(product: string, customer: Customer) {
    await this.pages.inventory.addToCart(product);
    await this.pages.inventory.header.openCart();
    await this.pages.cart.checkout();
    await this.pages.checkoutInfo.fillAndContinue(customer);
    await this.pages.overview.finish();
  }
}
```

Et `tests/commande.spec.ts`, connexion explicite puis flow explicite :

```ts
import { test, expect } from '@playwright/test';
import { PageObjectManager } from '../pages';
import { OrderFlow } from '../flows/OrderFlow';

const CLIENT = { firstName: 'Alice', lastName: 'Martin', postalCode: '75001' };

test('une commande complète affiche la confirmation', async ({ page }) => {
  const pages = new PageObjectManager(page);
  await pages.login.goto();
  await pages.login.login('standard_user', 'secret_sauce');

  const order = new OrderFlow(pages);
  await order.placeOrder('Sauce Labs Backpack', CLIENT);

  await expect(pages.confirmation.heading).toBeVisible();
});
```

### Explication du code

- `pages` est construit une fois par test, en première ligne : aucune construction implicite.
- La connexion (`pages.login.goto()` + `pages.login.login(...)`) reste visible : c'est l'état de départ du scénario, pas un détail à cacher.
- `order.placeOrder(...)` remplace les cinq lignes de navigation intermédiaires par une phrase métier ; le test garde les deux assertions qui vérifient le résultat.
- `tests/catalogue.spec.ts` montre l'alternative `beforeEach` quand plusieurs tests d'un même fichier partagent exactement le même départ.

### Résultat attendu

- `npx playwright test` : tous les tests passent avec `standard_user`.
- Un test dédié avec `problem_user` (connexion explicite, sans flow ni `beforeEach` partagé) échoue volontairement sur le tri des prix : bug connu du site, utile pour montrer une assertion qui échoue pour la bonne raison.

---

## 3. Exercice (35 minutes)

Voir `exercice.md`.

## 4. Correction

Voir `correction/`.

## 5. Contribution au projet fil rouge

**Ce qui change dans les tests de la mini-banque** (séance fil rouge) :

- `tests/pages/PageObjectManager.ts` : `LoginPage`, `DashboardPage`, `TransferPage`, `BeneficiariesPage` (nouvelle page du J2), composés des composants déjà existants (en-tête, message flash).
- Un flow `TransferFlow.transfer(from, iban, amount, label)` qui gère l'iframe des conditions : action métier répétée dans plusieurs tests de virement.
- La connexion reste explicite (ou en `beforeEach` de fichier) dans les tests : pas de fixture personnalisée à ce stade du parcours.

**Ce qui change dans l'application** : rien dans ce module (les nouveautés back/front arrivent avec M4.1 et M4.2).

**Lien avec la notion** :

- De `helpers.login()` (J1) à la connexion explicite via `PageObjectManager` : même niveau de lisibilité, structure en plus.
- Le virement (formulaire + iframe + confirmation) est le candidat naturel au flow : plusieurs pages, répété dans plusieurs tests, jamais le même deux fois de suite.

## Ressources externes

- POM : https://playwright.dev/docs/pom
- Fixtures Playwright (pour référence, hors périmètre de ce module) : https://playwright.dev/docs/test-fixtures
- `beforeEach` / hooks : https://playwright.dev/docs/api/class-test#test-before-each
