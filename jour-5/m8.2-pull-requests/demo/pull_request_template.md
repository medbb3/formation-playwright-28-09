## Quoi
<!-- Une phrase : ce que cette PR ajoute ou change. -->

## Pourquoi
<!-- Ticket, règle métier, régression observée. -->
AB#

## Comment vérifier
```powershell
npm run test:real -- --grep ""
```

## Checklist auteur
- [ ] Tests lancés localement (réel et mock si applicable), `--repeat-each 2` sur les nouveaux tests
- [ ] Aucun `test.only`, `waitForTimeout`, `force: true`, `page.pause()`
- [ ] Locators de niveaux 1 à 5, Page Objects et fixtures utilisés
- [ ] Données fictives, aucun secret, `.auth/` et `secrets.env` non versionnés
- [ ] Baselines visuelles générées dans Docker si modifiées
- [ ] Si généré par un agent : entrée dans `JOURNAL-GENERATION.md`, grille remplie, mention ci-dessous

## Généré avec un agent ?
<!-- Non / Oui : agent, modèle, entrée de journal (G-xx), relecteur -->
Non
