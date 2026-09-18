# Checklist de revue QA (relecteur)

Répondre à chaque question ; un « non » sur Intention, Preuve ou Sécurité est bloquant.

## Intention
- [ ] Le titre de la PR et des tests décrivent un comportement, pas une action technique.
- [ ] Le work item est lié ; la spec ou le critère est référencé (`// spec:`).

## Preuve
- [ ] Chaque action significative est suivie d'une assertion d'effet.
- [ ] En retirant mentalement chaque assertion, le test échouerait si la fonctionnalité était cassée.
- [ ] Les valeurs attendues viennent de la spec, pas de l'écran du jour.

## Robustesse
- [ ] Locators de niveaux 1 à 5, `filter` pour les listes, pas de `nth` gratuit.
- [ ] Aucun `waitForTimeout`, `networkidle`, `force`, `only`, `pause`.
- [ ] Données isolées (worker user, Faker) ; aucune dépendance à l'ordre ; `--repeat-each 2` mentionné.

## Architecture
- [ ] Page Objects, fixtures, flows existants utilisés ; nouveaux éléments au bon endroit.
- [ ] `playwright.config.ts`, CI, dépendances : inchangés ou justifiés.

## Sécurité
- [ ] Aucun secret, jeton, donnée réelle ; `.gitignore` respecté (`git diff --name-only` sans `.auth`, `secrets`).
- [ ] Dépendance ajoutée : licence compatible, version épinglée.

## CI et artefacts
- [ ] Build de PR vert ; durée acceptable ; `@smoke` sur les tests critiques.
- [ ] Baselines PNG regardées (pas seulement approuvées) ; aria snapshots cohérents.

## Lisibilité et traçabilité
- [ ] Un lecteur métier comprend le scénario ; commentaires utiles.
- [ ] Si agent : section renseignée, entrée de journal, grille remplie.

Verdict : Approve / Approve with suggestions / Wait for author / Reject. Commentaires marqués **bloquant** ou **suggestion**.
