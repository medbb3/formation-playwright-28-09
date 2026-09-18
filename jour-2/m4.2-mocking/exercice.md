# Exercice M4.2 — Mocker la boutique Practice Software Testing

**Difficulté** : moyenne à difficile
**Durée** : 30 minutes
**Site** : https://practicesoftwaretesting.com (front Angular) et son API https://api.practicesoftwaretesting.com

## Objectif

Contrôler, bloquer et observer les appels de la boutique : afficher un catalogue inventé, simuler une panne, accélérer le test en bloquant les images, vérifier un appel réel.

## Repérage (5 min)

Ouvrez la page d'accueil avec les DevTools (onglet Réseau, filtre XHR/Fetch). Repérez :

- l'appel qui charge les produits (`GET .../products`, sans paramètres au premier chargement, avec `?page=`... ensuite) et la forme de sa réponse (`data: [...]`, `total`, `current_page`...) ;
- l'appel des catégories ou marques ;
- les images des produits (`.../img/products/...`).

## Énoncé (`tests/boutique.spec.ts`)

1. **Catalogue inventé** : mockez l'appel des produits pour renvoyer exactement deux produits, `Marteau Playwright` (prix 12.5) et `Tournevis Mock` (prix 7.99), en conservant la structure de pagination attendue par le front (recopiez depuis la vraie réponse : `data`, `current_page`, `from`, `last_page`, `per_page`, `to`, `total`). Vérifiez que la page affiche ces deux noms et aucun autre produit (indice : les cartes ont un `data-test="product-name"` ; l'attribut de test id du site est `data-test`).
2. **Panne** : mockez l'appel des produits en 500. Vérifiez qu'aucune carte produit n'apparaît, puis observez ce que la page affiche à la place. Notez-le : c'est un résultat d'exploration (le site n'affiche peut-être aucun message). Faites une assertion sur ce que vous constatez, et une remarque en commentaire sur ce qu'un testeur devrait signaler.
3. **Modifier une réponse réelle** : avec `route.fetch()`, récupérez le vrai catalogue et mettez le prix du premier produit à `0.01`. Vérifiez que la première carte affiche `$0.01`.
4. **Bloquer les images** : bloquez toutes les requêtes de `resourceType()` `image`, chargez la page, vérifiez avec `page.on('requestfailed')` qu'au moins une image a été bloquée, et que les noms de produits restent visibles.
5. **Observer** : sans mock, tapez `hammer` dans la recherche, attendez la réponse de l'API de recherche (`waitForResponse` sur une URL contenant `search`), vérifiez que son JSON contient au moins un produit dont le nom contient « Hammer », puis que la page affiche autant de cartes que `data.length`.

## Consignes

- Motif précis : une regex qui accepte `/products` avec ou sans query string mais **pas** `/products/search` ni `/products/{id}`. Pas de `**/*`.
- Enregistrez les routes **avant** `page.goto('/')`.
- Les `waitForResponse` sont enregistrés avant l'action qui les déclenche.
- Aucun `waitForTimeout`.

## Résultat attendu

```
Running 5 tests using N workers
  5 passed
```

Bonus : enregistrez un HAR du catalogue (`routeFromHAR` avec `update: true`), puis rejouez-le hors ligne (coupez le Wi-Fi ou ajoutez `route.abort()` sur tout le reste) : le test 1 doit encore passer.
