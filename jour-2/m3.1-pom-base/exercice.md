# Exercice M3.1 — Page Objects pour Demoblaze

**Difficulté** : moyenne
**Durée** : 30 minutes
**Site** : https://www.demoblaze.com

## Objectif

Construire trois Page Objects et un composant pour Demoblaze, puis trois tests sans aucun `getBy` direct.

## Énoncé

Créez l'arborescence `pages/` et `tests/` avec :

### `pages/components/NavbarComponent.ts`

- Barre de navigation présente sur toutes les pages.
- Liens **Home**, **Cart** (`exact: true`, à cause de « Add to cart »), **Log in**, **Sign up**.
- Action `openCart()`.

### `pages/HomePage.ts`

- `goto()` vers `/`.
- Locator paramétré `productLink(name)` : le lien du produit dans le catalogue.
- Locator `categoryLink(name)` : les catégories « Phones », « Laptops », « Monitors » de la colonne de gauche.
- Action `openProduct(name)`.
- Action `filterByCategory(name)`.
- Locator `productCards` : les cartes du catalogue (indice : chaque carte a un titre `h4` ; utilisez `getByRole('heading', { level: 4 })`).

### `pages/ProductPage.ts`

- Locators `title` (le `h2` avec le nom du produit), `price` (le `h3` commençant par `$`), `addToCartLink`.
- Action `addToCart()` : clique et **accepte l'alerte** native. Retourne le message de l'alerte (string), à vérifier dans le test.

### `pages/CartPage.ts`

- Locator `rows` : les lignes du tableau du panier (`getByRole('row')` dans le tableau, sans l'en-tête : indice, `filter({ has: page.getByRole('button', { name: 'Delete' }) })`).
- Locator paramétré `row(productName)`.
- Locator `total` (le `h3` du total, contenant un nombre).
- Locator `placeOrderButton`.
- Action `deleteProduct(name)`.

### `pages/index.ts` qui ré-exporte tout.

### Tests (`tests/catalogue.spec.ts` et `tests/panier.spec.ts`)

1. **Le filtre par catégorie réduit le catalogue** : sur la home, cliquer « Laptops » ; le premier titre de carte contient « Sony vaio i5 » et le catalogue a au plus 9 cartes.
2. **Ajouter un produit affiche le bon message et le bon total** : ouvrir « Samsung galaxy s6 », vérifier le prix `$360`, ajouter au panier ; le message d'alerte contient « Product added » ; ouvrir le panier : la ligne du produit est visible, le total est `360`.
3. **Supprimer un produit du panier** : ajouter « Nokia lumia 1520 », ouvrir le panier, supprimer ; plus aucune ligne.

## Consignes

- Aucun `page.getBy...` ni `page.locator` dans `tests/`.
- Assertions dans les tests, aucune dans les Page Objects (sauf méthode `expectXxx` clairement nommée).
- L'alerte (`page.waitForEvent('dialog')`) est gérée par `ProductPage`, pas par le test.
- Demoblaze charge le panier de façon asynchrone : assertions web-first, jamais de délai.

## Résultat attendu

```
Running 3 tests using 3 workers
  3 passed
```

Bonus : ajoutez un test qui vérifie que le panier est vide au chargement d'un nouveau contexte (chaque test part d'un panier vide : pourquoi ?).
