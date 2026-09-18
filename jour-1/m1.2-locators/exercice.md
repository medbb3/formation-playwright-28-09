# Exercice M1.2 — Choisir le bon locator sur The Internet

**Difficulté** : moyenne
**Durée** : 35 minutes
**Site** : https://the-internet.herokuapp.com

## Objectif

Écrire six tests sur six pages différentes. À chaque fois : le locator du niveau le plus élevé possible, l'action adaptée (`check`, `selectOption`, `hover`, `click`), et uniquement des assertions web-first.

## Énoncé

Créez `tests/locators.spec.ts` dans un nouveau projet (ou réutilisez celui de M1.1 avec la même `baseURL`). Un test par page :

1. **Checkboxes** (`/checkboxes`) : cocher les deux cases, vérifier que les deux sont cochées, décocher la seconde, vérifier qu'elle ne l'est plus.
2. **Dropdown** (`/dropdown`) : sélectionner « Option 2 » **par son libellé**, vérifier que la valeur de la liste est `2`.
3. **Dynamic Loading** (`/dynamic_loading/2`) : cliquer sur « Start », vérifier que le texte « Hello World! » apparaît. Le chargement dure environ 5 secondes.
4. **Add/Remove Elements** (`/add_remove_elements/`) : cliquer trois fois sur « Add Element », vérifier qu'il y a 3 boutons « Delete », cliquer sur l'un d'eux, vérifier qu'il en reste 2.
5. **Hovers** (`/hovers`) : survoler la première image, vérifier que le texte « name: user1 » devient visible et que le lien « View profile » associé est visible.
6. **Tables** (`/tables`) : dans la première table, trouver la ligne de « Bach » et vérifier que sa cellule « Due » contient `$51.00`. Puis vérifier que la table a bien 4 lignes de données.

## Consignes

- Locators autorisés : `getByRole`, `getByLabel`, `getByPlaceholder`, `getByText`, `getByAltText`, `getByTitle`, chaînage, `filter`, `first`/`last`/`nth`.
- `locator(css)` autorisé **uniquement** pour le test 6 si vous ne trouvez pas d'alternative, et pour le test 1 si les checkboxes n'ont pas de label. Dans ce cas, commentaire obligatoire expliquant pourquoi.
- Aucune assertion générique sur une valeur lue avec `textContent()`, `isVisible()`, `isChecked()`.
- Aucun `waitForTimeout`. Pour le test 3, utilisez l'option `timeout` de l'assertion.
- Chaque test contient au moins une assertion vérifiant l'**effet** de l'action.
- Bonus : dans le test 4, remplacez les trois clics par une boucle ; dans le test 6, vérifiez que les lignes sont triées par nom de famille après un clic sur l'en-tête « Last Name ».

## Résultat attendu

```
Running 6 tests using N workers
  6 passed
```

Le test 3 dure environ 5 à 6 secondes, les autres moins de 2 secondes.
