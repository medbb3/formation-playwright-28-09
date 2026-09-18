# Exercice M7.2 — Générer depuis une spec, réparer un test hérité

**Difficulté** : difficile
**Durée** : 35 minutes
**Sites** : https://www.saucedemo.com (génération), https://the-internet.herokuapp.com (self-healing)
**Matériel** : `exercice-materiel/` (projet prêt : POM et fixtures SauceDemo, spec SPEC-SD-01, test cassé pour The Internet)

## Partie A — Génération (20 min)

1. Initialisez les agents (`npm run agents:init`), démarrez `playwright-test`.
2. Avec `/generer-ca`, générez **un test par critère** pour CA-2, CA-3 et CA-5 de `specs/SPEC-SD-01-commande.md`. Une nouvelle session de chat par critère. CA-3 est un plan de scénario : un test par ligne d'exemples, ou une boucle data-driven du J3 ; à vous de choisir et de justifier.
3. Relisez chaque test avec la grille de M7.2 (8 critères). Notez dans `JOURNAL.md`, pour chaque génération : critère, prompt utilisé, modèle, durée approximative, écarts constatés et corrections apportées, verdict.
4. Lancez `npx playwright test generes --project=standard` : tout doit être vert.

## Partie B — Self-healing (15 min)

`tests/casse/login.spec.ts` (The Internet, projet `the-internet`) a été écrit sur une ancienne version du site : bouton « Sign in », message dans `#message`, titre « Secure Zone ». Il échoue.

5. Lancez le healer sur ce fichier. Lisez le diff : quels changements ? Sont-ils tous des locators ?
6. Le test 3 attend « You logged in successfully! » ; le site affiche « You logged into a secure area! ». Le healer va vouloir changer la valeur. Décidez : évolution légitime ou régression ? Justifiez en commentaire dans le test et dans le journal. Indice : SPEC-TI-02 est la référence.

## Consignes

- Aucun test généré n'est committé sans passer la grille.
- Si l'agent produit un locator CSS, ne corrigez pas à la main : régénérez avec une instruction plus précise, et notez la différence dans le journal.
- Pour CA-3 en boucle data-driven : l'agent génère une seule fois, puis vous transformez ; notez-le.

## Résultat attendu

- `tests/generes/` : 3 fichiers (ou 5 si un test par exemple), tous verts, tous relus.
- `tests/casse/login.spec.ts` réparé (locators), avec une décision documentée pour l'assertion de message.
- `JOURNAL.md` à jour.

Question : combien de temps a pris la génération + relecture par test, comparé à l'écriture manuelle du J2 ? Où est le gain, où est la perte ?
