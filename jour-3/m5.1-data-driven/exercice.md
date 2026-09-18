# Exercice M5.1 — Données JSON et CSV sur The Internet

**Difficulté** : moyenne
**Durée** : 30 minutes
**Site** : https://the-internet.herokuapp.com

## Objectif

Écrire trois suites data-driven : une depuis un tableau en code, une depuis un JSON, une depuis un CSV fourni par le métier, avec un chargeur typé et validé.

## Énoncé

### 1. Tableau en code : `tests/status-codes.spec.ts`

La page `/status_codes` propose des liens vers `/status_codes/200`, `301`, `404`, `500`. Pour chacun de ces quatre codes, un test vérifie que :

- la page `/status_codes/<code>` contient le texte `This page returned a <code> status code` ;
- la réponse HTTP de la navigation (`const res = await page.goto(...)`) a bien `res.status()` égal au code.

Attention pour 301 : le navigateur suit la redirection. Que renvoie `res.status()` ? Notez-le en commentaire et adaptez l'attendu dans les données (une colonne `statutAttendu` distincte du `code`).

### 2. JSON : `tests/login.spec.ts` avec `data/logins.json`

- Un fichier JSON de cinq cas de connexion sur `/login` : identifiants valides, mot de passe faux, utilisateur inconnu, champ utilisateur vide, champ mot de passe vide.
- Colonnes : `cas`, `username`, `password`, `messageAttendu`.
- Le test vérifie le message flash.
- Messages réels à découvrir sur le site : `You logged into a secure area!`, `Your password is invalid!`, `Your username is invalid!`.

### 3. CSV : `tests/inputs.spec.ts` avec `data/nombres.csv`

Le métier fournit ce CSV (créez-le), séparateur `;` :

```
cas;saisie;valeurAttendue
entier;42;42
negatif;-7;-7
decimal;3,5;3.5
grand;1000000;1000000
```

- La page `/inputs` a un champ `<input type="number">`.
- Pour chaque ligne : saisir `saisie` avec `fill`, vérifier `toHaveValue(valeurAttendue)`.
- Piège : un champ `number` n'accepte pas la virgule. Que se passe-t-il avec « 3,5 » ? Explorez, puis décidez ce que le chargeur doit faire : convertir la virgule en point avant `fill`, ou considérer la ligne comme une saisie utilisateur invalide et vérifier la valeur vide. Documentez votre choix en commentaire.
- Écrivez `utils/data.ts` avec `chargerNombres()` : `csv-parse`, colonnes typées, erreur explicite si une colonne manque.

## Consignes

- Un test par ligne, titre contenant `cas`.
- Aucun `if` sur le type de cas dans le corps des tests 2 et 3 (le test 1 peut en avoir besoin pour 301 : préférez la colonne `statutAttendu`).
- Chemins de fichiers avec `path.join(__dirname, ...)`.
- Annotez chaque test avec sa ligne de données (`test.info().annotations`).

## Résultat attendu

```
Running 13 tests using N workers   (4 + 5 + 4)
  13 passed
```

Bonus : ajoutez une ligne invalide au CSV (colonne manquante) et vérifiez que **tout le fichier** échoue au chargement avec votre message, avant qu'aucun test ne tourne.
