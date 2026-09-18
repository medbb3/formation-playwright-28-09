# M8.2 — Pull Requests, revue de code QA et branch policies

## 1. Cours théorique

### 1.1 La Pull Request comme unité de travail

- Une PR (Azure Repos) demande l'intégration d'une branche dans `main`, avec description, discussion, validations automatiques (build) et relecteurs.
- Pour une suite de tests, la PR vérifie que le test **prouve** quelque chose, respecte l'architecture et ne cache pas de secret.
- Elle sert de preuve d'audit : qui a écrit, qui a relu, ce qui a tourné.

Cycle : création (titre conventionnel, description depuis le template, work item lié) → build automatique (pipeline de PR, J5 M9) → revue (commentaires, suggestions, « approve » ou « wait for author ») → mise à jour (nouveaux commits ou rebase) → complétion (squash merge, suppression de la branche) → policies vérifiées à chaque étape.

- Taille : relecture en moins de 30 minutes ; au-delà de 400 lignes, découper.
- Une PR = un ticket = une intention.

### 1.2 Le template de PR

- Azure Repos lit `.azuredevops/pull_request_template.md` (ou `pull_request_template.md` à la racine, ou par branche cible dans `.azuredevops/pull_request_template/branches/main.md`).
- Le template pré-remplit la description.

```markdown
## Quoi
<!-- Une phrase : ce que cette PR ajoute ou change. -->

## Pourquoi
<!-- Ticket, règle métier, régression observée. AB#___ -->

## Comment vérifier
<!-- Commande(s) pour rejouer localement : npm run test:real -- --grep "virement" -->

## Checklist auteur
- [ ] Tests lancés localement (réel et mock si applicable), `--repeat-each 2` sur les nouveaux tests
- [ ] Aucun `test.only`, `waitForTimeout`, `force: true`, `page.pause()`
- [ ] Locators de niveaux 1 à 5, Page Objects et fixtures utilisés
- [ ] Données fictives, aucun secret, `.auth/` et `secrets.env` non versionnés
- [ ] Baselines visuelles générées dans Docker si modifiées
- [ ] Si généré par un agent : entrée dans `JOURNAL-GENERATION.md`, grille remplie, mention ci-dessous

## Généré avec un agent ?
<!-- Non / Oui : agent, modèle, entrée de journal, relecteur -->
```

### 1.3 La checklist de revue QA

La grille de M7.2 s'applique à tout test, généré ou non ; la dimension « suite » s'y ajoute. Le relecteur répond à des questions précises :

| Dimension | Questions du relecteur |
|---|---|
| **Intention** | Le titre du test décrit-il un comportement ? Le test correspond-il au ticket ? Une spec ou un critère est-il référencé ? |
| **Preuve** | Chaque action a-t-elle une assertion d'effet ? Le test échouerait-il si la fonctionnalité était cassée ? Les valeurs attendues viennent-elles de la spec ? |
| **Robustesse** | Locators conformes, pas d'attente fixe, pas de dépendance à l'ordre, données propres (worker user, Faker) ; `--repeat-each` passé ? |
| **Architecture** | Page Objects, fixtures, flows utilisés ; pas de duplication ; nouveaux Page Objects bien placés ; config non modifiée sans raison |
| **Sécurité** | Aucun secret, aucune donnée réelle, `.gitignore` respecté, dépendance ajoutée justifiée et licence compatible |
| **CI** | Le build de PR est vert ; durée raisonnable ; tags `@smoke` sur les tests critiques ; baselines et snapshots cohérents |
| **Lisibilité** | Un lecteur métier comprend-il le scénario ? Commentaires utiles (pas de paraphrase du code) ; journal à jour si agent |

Posture du relecteur :

- Commenter le code, pas la personne.
- Distinguer **bloquant** (« doit ») de **suggestion** (« pourrait »).
- Proposer la correction via « suggestion » Azure Repos quand elle est triviale.
- Approuver avec des suggestions plutôt que bloquer pour du style.
- L'auteur répond à chaque commentaire : résolu, ou pourquoi non.

### 1.4 Branch policies sur `main`

- Réglage : Azure Repos > Branches > `main` > Branch policies.
- Dès qu'une policy est active, plus personne ne pousse directement sur `main` : tout passe par PR.

Cinq policies suffisent pour une suite de tests :

- **Relecteur minimum** (1, jamais l'auteur, votes réinitialisés à chaque push) → revue humaine obligatoire.
- **Work item lié** (Required) → traçabilité ticket.
- **Commentaires résolus** (Required) → chaque commentaire traité.
- **Squash merge uniquement** → un commit par PR, historique de `main` lisible.
- **Build validation** : pipeline de PR (M9.1) en Required, expiration immédiate → `main` toujours vert.

Deux options en plus si besoin : relecteurs automatiques sur des chemins sensibles (ex. le lead sur `playwright.config.ts`), et un bypass réservé à un groupe d'administration en urgence, avec justification obligatoire — jamais de contournement silencieux.

Autres protections : « Lock » de branche (gel temporaire), permissions « Force push » et « Delete » refusées à tous sur `main`.

### 1.5 Stratégie de merge et historique

| Type | Résultat sur `main` | Usage |
|---|---|---|
| **Squash** (recommandé) | Un commit par PR, message = titre de la PR | Historique lisible, revert simple |
| Merge (no fast-forward) | Commit de merge + tous les commits de la branche | Conserve le détail, historique chargé |
| Rebase and fast-forward | Commits de la branche rejoués linéairement | Historique linéaire détaillé, exige des commits propres |

- Avec le squash, le titre de la PR devient le message du commit : il suit la convention (`test(virement): ...`).
- La branche est supprimée automatiquement (« Delete source branch » coché par défaut).

### 1.6 Auto-complétion, brouillons, PR de tests générés

- **Draft PR** : ouvrir tôt pour montrer l'avancement et obtenir le build, sans demander la revue.
- **Auto-complete** : « Set auto-complete » complète la PR dès que les policies sont satisfaites ; évite d'attendre.
- **PR contenant des tests générés par un agent** (M7.4) : la section « Généré avec un agent ? » est obligatoire ; le relecteur vérifie l'entrée du journal et la grille ; un second relecteur peut être imposé par policy sur `tests/ui/generes/**`.
- **Annotations de build** : le pipeline publie les résultats de tests (M10.1) directement dans l'onglet Tests de la PR ; un échec est visible sans ouvrir le rapport.

### 1.7 Bonnes pratiques

1. PR petite, titre conventionnel, template rempli, work item lié.
2. Build de PR obligatoire et rapide (smoke + projet `api` + lint en moins de 10 minutes ; suite complète la nuit, M9.2).
3. Un relecteur minimum, jamais l'auteur ; commentaires bloquants ou suggestions, tous résolus.
4. Squash merge, suppression de branche, `main` protégé sans bypass.
5. Le relecteur lance localement au moindre doute (`git fetch`, `git switch <branche>`, `npm run test:real -- --grep ...`).
6. Revue des baselines visuelles : Azure Repos affiche les PNG côte à côte ; regarder, pas seulement approuver.
7. Les tests générés par agent sont relus avec la grille et signalés dans la PR.

### 1.8 Erreurs fréquentes

| Erreur | Conséquence | Correction |
|---|---|---|
| PR de 40 fichiers « refacto globale » | Relecture impossible, approuvée sans lecture | Découper |
| Auteur qui approuve sa PR | Policy contournée | « Prohibit the most recent pusher » |
| Commentaires non résolus | Décisions perdues | Policy « comment resolution » |
| Build validation en « Optional » | `main` rouge | Required |
| Merge sans squash | `main` avec 30 commits « wip » | Limit merge types |
| Baseline PNG approuvée sans être regardée | Régression visuelle validée | Ouvrir l'image dans la revue |
| PR sans lien de ticket | Pas de traçabilité | Policy work items |
| Secret détecté seulement en revue | Déjà dans l'historique de la branche | Pre-commit et scan CI ; révoquer |

### 1.9 Points à retenir

- La PR est l'unité de revue et la preuve d'audit ; petite, titrée en convention, template rempli.
- Checklist QA : intention, preuve, robustesse, architecture, sécurité, CI, lisibilité.
- Policies sur `main` : relecteur, work item, commentaires résolus, squash, build validation obligatoire, pas de bypass.
- Tests générés par agent : déclarés dans la PR, journal et grille vérifiés.

---

## 2. Démonstration

**Objectif** : configurer les branch policies sur `main` du dépôt `mini-banque`, ajouter le template de PR, ouvrir une PR depuis la branche du M8.1, la relire avec la checklist (avec un défaut planté), la corriger, la compléter en squash.

### Étapes

1. Azure Repos > Branches > `main` > Branch policies : activer relecteur minimum 1 (interdire l'auteur), work item requis, commentaires résolus, squash uniquement. Laisser Build validation pour M9.1 (pipeline pas encore créé) et le noter.
2. Ajouter `.azuredevops/pull_request_template.md` (fourni) sur `main` via une PR : impossible sans relecteur. Constater le blocage, puis utiliser temporairement le bypass administrateur avec justification, ou faire relire par un binôme. Leçon : les policies s'appliquent aussi à leur auteur.
3. Ouvrir la PR `test/42-plafond-virement` → `main` : titre `test(virement): ajoute le cas libellé trop long`, template rempli, `AB#42` lié.
4. Défaut planté dans la branche : un `test.only` oublié dans `virement.spec.ts`. Le relecteur (binôme) le trouve avec la checklist, commente en « bloquant » avec une suggestion. L'auteur applique la suggestion depuis l'interface ; la PR se met à jour ; les votes sont réinitialisés.
5. Second passage : approbation, commentaires résolus ; « Complete » en squash, suppression de branche. Vérifier `main` : un commit, message = titre de la PR.
6. « Automatically included reviewers » sur `frontend/tests/ui/generes/**` (relecteur QA lead) pour les tests générés.

### Fichiers de la démo

`demo/pull_request_template.md`, `demo/CHECKLIST-REVUE-QA.md`, `demo/policies.md` (captures textuelles des réglages).

### Résultat attendu

`main` protégé, PR complétée en squash avec un commentaire bloquant résolu, template actif pour les PR suivantes.

---

## 3. Exercice (20 minutes)

Voir `exercice.md`.

## 4. Correction

Voir `correction/`.

## 5. Contribution au projet fil rouge

**Ce qui est ajouté** :

- `.azuredevops/pull_request_template.md`, `docs/CHECKLIST-REVUE-QA.md`.
- Policies sur `main` : relecteur, work item, commentaires, squash (build validation ajoutée en M9.1).
- Relecteurs automatiques sur `tests/ui/generes/**`.

**Lien avec la notion** :

- La PR est le point de passage de tout test, y compris généré.
- La checklist reprend la grille de M7.2 et la policy de M7.4.

## Ressources externes

- Pull requests Azure Repos : https://learn.microsoft.com/azure/devops/repos/git/pull-requests
- Templates de PR : https://learn.microsoft.com/azure/devops/repos/git/pull-request-templates
- Branch policies : https://learn.microsoft.com/azure/devops/repos/git/branch-policies
- Revue de code, bonnes pratiques (Google) : https://google.github.io/eng-practices/review/
