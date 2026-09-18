# Jour 3 — Synthèse

## Ce que l'on retient

1. **Data-driven** : boucle `for` autour de `test`, titre unique avec la donnée ; JSON importé, CSV via `csv-parse` et un chargeur typé qui valide au chargement. Règles nombreuses en API, parcours représentatifs en UI.
2. **Faker** : données réalistes (locale fr, IBAN valides), fabriques avec surcharges, graine pour rejouer, annotation pour tracer.
3. **Isolation** : reset global, données uniques par test, ou espace par worker (`parallelIndex`). La mini-banque est passée à la stratégie 3.
4. **storageState** : projet setup + `dependencies`, un fichier par rôle, connexion par l'API, tests de login sans état. Un test qui détruit une session doit posséder la sienne.
5. **Visuel** : `toHaveScreenshot`, baseline validée par un humain, nom = projet + plateforme, masque ou donnée figée avant seuil, `toMatchAriaSnapshot` pour la structure.
6. **Fichiers, onglets et temps** (M6.3, si traité ce jour) : `download` / `filechooser` / `popup` sont des événements, s'abonner avant l'action ; vérifier le **contenu** d'un fichier, pas son existence ; `setInputFiles` avec un buffer ; un onglet est une `Page` de plus ; `clock.runFor` vit la durée, `clock.fastForward` atteint la date.
7. **Accessibilité** : axe couvre un tiers des critères ; WCAG 2.2 AA en cible, RGAA en méthode ; scans par état, violations dans le rapport, mise en place par impact puis budget.

## Fil rouge

Six projets Playwright, un utilisateur par worker, CSV métier testé en API et en UI, baselines visuelles déterministes en mode mock, écran de virement à zéro violation après correction des défauts d'accessibilité.

## Questions flash

1. Pourquoi le titre d'un test data-driven doit-il contenir la donnée ?
2. `faker.seed()` : quand l'utiliser, quand l'éviter ?
3. Que contient un fichier `storageState` ?
4. Pourquoi une baseline Windows ne sert-elle pas en CI Linux ?
5. Un scan axe vert signifie-t-il que la page est accessible ?
6. Quelle règle axe correspond à un champ sans étiquette ?
7. (M6.3) Un compte à rebours affiche 300. Que vaut-il après `clock.fastForward('05:00')` ?
8. (M6.3) L'input file est masqué derrière un bouton stylé : comment envoyer le fichier ?

Réponses :

1. Unicité et lisibilité du rapport.
2. Pour rejouer un échec ou stabiliser un visuel ; à éviter pour des identifiants qui doivent être uniques.
3. Cookies, localStorage (et IndexedDB) par origine.
4. Rendu des polices différent, suffixe de plateforme dans le nom.
5. Non, seulement l'absence de violations détectables (30 à 40 % des critères).
6. `label`.
7. 299 : un saut ne déclenche un timer répétitif qu'une fois, il fallait `runFor`.
8. `waitForEvent('filechooser')` avant le clic, puis `setFiles`.

## Préparer le Jour 4

- Installer et vérifier l'extension GitHub Copilot Chat dans VS Code (mode Agent disponible).
- Lire https://github.com/microsoft/playwright-mcp (README) et https://modelcontextprotocol.io/introduction (15 min).
- Node 20+ obligatoire pour `@playwright/mcp`.

## Ressources du jour

- https://playwright.dev/docs/test-parameterize
- https://fakerjs.dev
- https://playwright.dev/docs/auth
- https://playwright.dev/docs/test-snapshots
- https://playwright.dev/docs/accessibility-testing
- https://accessibilite.numerique.gouv.fr
