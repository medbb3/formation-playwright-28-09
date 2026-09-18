# Exercice M6.2 — Audit d'accessibilité de The Internet

**Difficulté** : moyenne
**Durée** : 30 minutes
**Site** : https://the-internet.herokuapp.com

## Objectif

Utiliser le helper `scanA11y` (fourni dans `utils/a11y.ts`) pour inventorier plusieurs pages, cibler des composants, appliquer un filet par impact, et vérifier un critère manuel au clavier.

## Énoncé (`tests/a11y.spec.ts`)

1. **Inventaire data-driven** : pour chacune des pages `/login`, `/checkboxes`, `/tables`, `/iframe`, `/dropdown`, un test qui scanne la page entière, attache les violations et annote le nombre par impact. Aucune assertion bloquante, mais le test échoue si le scan lui-même échoue.
2. **Formulaire de login ciblé** : `include('#login')`. Quelles violations restent ? Assertion sur la liste exacte des `id` de règles trouvées (à constater, puis à figer). Expliquez en commentaire pourquoi figer la liste est utile (détection d'une nouvelle violation) et risqué (faux échec si axe ajoute une règle).
3. **Iframe** : sur `/iframe`, le scan doit inclure l'iframe (axe le fait par défaut). Vérifiez que la règle `frame-title` n'est **pas** violée (l'iframe a un `title`) et notez si `label` ou autre apparaît.
4. **Tableaux** : sur `/tables`, scan ciblé de la première table (`#table1`). Vérifiez l'absence de violation `td-headers-attr` et `th-has-data-cells`. Un tableau de données bien formé passe.
5. **Filet global** : un test sur `/login` avec `expect(bloquantes(violations)).toEqual([])`. Passe-t-il ? Si non, `test.fail()` avec la raison et le détail dans le résumé.
6. **Clavier** : sur `/login`, depuis le champ Username, `Tab` mène au mot de passe puis au bouton Login ; `Enter` sur le bouton soumet le formulaire (vérifiez l'erreur de mot de passe invalide affichée sans utiliser la souris).

## Consignes

- Utilisez le helper, ne réinstanciez pas `AxeBuilder` dans les tests.
- Toute règle désactivée ou zone exclue est commentée avec une raison.
- Assertion web-first sur un élément clé avant chaque scan.

## Résultat attendu

```
Running 10 tests using N workers
  10 passed
```

Les tests 1 à 4 produisent des pièces jointes JSON ; le rapport montre les annotations chiffrées.

Bonus : écrivez un tableau (Markdown) des violations trouvées sur `/login` avec, pour chacune, le critère WCAG et le critère RGAA correspondants.
