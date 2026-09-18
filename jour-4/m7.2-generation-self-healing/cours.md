# M7.2 — Génération de tests et self-healing avec les agents

## 1. Cours théorique

### 1.1 Le flux planner → generator → healer

Trois rôles, chacun avec un prompt système, une liste d'outils restreinte et un modèle :

| Agent | Entrée | Ce qu'il fait | Sortie |
|---|---|---|---|
| **planner** | Une intention (« plan de test pour le virement »), un seed, éventuellement une spec | Explore l'application avec le navigateur, cartographie les parcours, écrit des scénarios numérotés (étapes, résultats attendus, état initial) | `specs/<nom>.plan.md` |
| **generator** | Un scénario du plan (« 1.2 ») | **Exécute réellement** chaque étape dans le navigateur, lit le journal des actions (`generator_read_log`), écrit un test par scénario avec les locators observés | `tests/<scenario>.spec.ts` |
| **healer** | Une suite qui échoue | Lance `test_run`, `test_debug` sur les échecs, inspecte le snapshot au point d'arrêt, corrige le locator ou l'assertion, relance | Fichiers de tests modifiés |

Deux idées structurantes :

1. **L'agent agit avant d'écrire.** Le generator clique, lit le snapshot ; le code reflète ce qu'il a vu. Différence avec un test « inventé » par un chat sans outil.
2. **Le seed ancre l'agent dans le projet.** `seed.spec.ts` porte le `beforeEach` du point de départ partagé (connexion via un helper explicite, backend mock...) ; `generator_setup_page` l'exécute jusqu'à ce point. L'agent commence connecté, avec les bonnes données ; le test généré reprend le même `beforeEach`.

Le plan Markdown intermédiaire est le point de contrôle humain le plus rentable : cinq minutes pour relire un plan, soixante pour vingt tests générés.

### 1.2 Depuis une spécification : le prompt de génération

Spec existante (SPEC-SD-01 avec critères Gherkin) : on court-circuite le planner, la spec **est** le plan. Contenu du prompt au generator :

| Élément | Pourquoi |
|---|---|
| **Le rôle et le périmètre** : « génère un test pour le critère CA-2 de `specs/SPEC-SD-01-commande.md` » | Un critère par test, un test par appel : la revue reste possible |
| **Le point de départ** : seed (« reprends le `beforeEach` de `tests/seed.spec.ts` ») | Pas de login réécrit dans chaque test |
| **Les conventions** : déjà dans `copilot-instructions.md`, rappeler ce qui est spécifique (« utilise `InventoryPage` de `pages/` ») | Évite les locators dans le test |
| **La forme attendue** : fichier, nom du describe, un commentaire par étape Gherkin | Traçabilité spec → test |
| **Ce qu'il ne faut pas faire** : « si une étape n'est pas réalisable dans l'interface, arrête-toi et signale-le » | Contre les hallucinations |

Exemple de prompt (à conserver dans `.github/prompts/generer-ca.prompt.md`, appel par `/generer-ca`) :

```
Génère un test Playwright pour le critère ${input:critere} de la spécification ${input:spec}.
- Exécute chaque étape Gherkin dans le navigateur avant d'écrire le code ; n'invente aucun élément.
- Point de départ : reprends tel quel le `beforeEach` de `tests/seed.spec.ts` (ne réécris pas la connexion).
- Utilise les Page Objects de `pages/` ; s'il manque une méthode, propose-la dans le Page Object, pas dans le test.
- Un commentaire par ligne Gherkin, titre du test = identifiant + libellé du critère, fichier `tests/generes/<critere>.spec.ts`.
- Si une étape est impossible ou ambiguë, écris `test.fixme()` avec la raison et arrête-toi.
Termine par un résumé : locators choisis et pourquoi, points à revoir par un humain.
```

Les `${input:...}` sont demandés par VS Code au lancement du prompt.

### 1.3 Lire un test généré : la grille de revue

Un test généré est une proposition. Grille (reprise dans le fil rouge) :

| Critère | Question | Sanction |
|---|---|---|
| Fidélité | Chaque étape Gherkin a-t-elle son action et chaque « Alors » son assertion ? | Manque = à compléter |
| Locators | Niveaux 1 à 5 uniquement, `filter` pour les listes, pas de `nth` gratuit | CSS/XPath = à réécrire |
| Structure | Page Objects du projet utilisés, connexion reprise du `beforeEach` du seed, pas réécrite | Duplication = à refactorer |
| Attentes | Aucune attente fixe, assertions web-first | `waitForTimeout` = rejet |
| Données | Fictives, en constantes ou fabriques, pas de secret | Secret = rejet immédiat |
| Isolation | Le test crée son état, n'en laisse pas | Dépendance = à corriger |
| Sens | Le test échouerait-il si la fonctionnalité était cassée ? (retirer une assertion mentalement) | Test vert sans preuve = rejet |
| Hallucination | Tout élément référencé existe-t-il dans l'application ? | Élément inventé = rejet |

Test qui passe la grille : committé **par le testeur**, sous son nom ; prompt et modèle notés dans le journal de génération (M7.4).

### 1.4 Self-healing : réparer sans changer l'intention

Deux causes de casse :

- l'interface a changé (libellé, structure) : le cas prévu pour le **healer** ;
- le comportement a changé (régression) : le healer doit le **reconnaître** et s'arrêter.

Flux du healer :

1. `test_run` → échecs.
2. `test_debug` : arrêt sur l'erreur, navigateur ouvert.
3. `browser_snapshot` au point d'échec.
4. Diagnostic : locator introuvable, ambigu, assertion fausse, timing.
5. Modification minimale, relance.
6. Échec persistant malgré un code correct : `test.fixme()` avec un commentaire décrivant l'écart observé.

Self-healing acceptable en contexte bancaire :

- **Modification minimale et lisible** : un locator remplace un locator ; une valeur attendue change avec justification ; pas de réécriture du test.
- **Jamais d'affaiblissement d'assertion** : `toHaveText('Solde insuffisant')` → `toBeVisible()` fait passer le test sans rien prouver. La grille l'attrape ; les instructions de projet l'interdisent.
- **Régression ou évolution ?** Une valeur attendue changée (montant, message) est **peut-être** un bug. Règle : ticket ou validation du PO avant merge.
- **Journal** : quoi, pourquoi, quel modèle, qui a validé.

![Séquence du self-healing gouverné : sur échec, le healer distingue une dérive d'interface (locator corrigé par un diff minimal puis relance) d'une régression métier ambiguë (oracle inchangé, ticket/validation PO) ; la revue et le commit restent humains, sans merge automatique.](assets/self-healing-gouverne.png)

*Figure — Self-healing gouverné : réparer une dérive d'interface sans affaiblir une assertion ni masquer une régression métier.*

Outil clé : `browser_generate_locator` propose, depuis un élément du snapshot, le locator recommandé (comme le Pick locator de l'UI Mode, M2.1).

### 1.5 Bonnes pratiques de prompt pour les tests

1. **Un critère par prompt.** Dix tests en un prompt = dix tests non relus.
2. **Contexte pointé, pas décrit** : `#file:pages/InventoryPage.ts`, `#file:specs/SPEC-SD-01-commande.md` plutôt qu'une paraphrase.
3. **Contraintes négatives explicites** : « pas de waitForTimeout », « pas de CSS », « n'invente rien ».
4. **Raisonnement demandé en fin** : « résume tes choix de locators et ce qu'un humain doit vérifier ». C'est le matériau du journal.
5. **Itérer sur le plan, pas sur le code** : résultat mauvais → corriger le plan ou les instructions, régénérer ; ne pas patcher le code généré.
6. **Nouvelle session par tâche** : un long historique dégrade la qualité et propage les erreurs.
7. **Modèle** : « raisonneurs » pour planifier, rapides pour une étape connue ; rester dans la liste autorisée par l'entreprise.
8. **Température zéro de fait** : inaccessible dans Copilot ; compenser par des instructions précises et un seed.

### 1.6 Ce que la génération ne remplace pas

- La **conception** : scénarios utiles, limites, risques. Le planner propose, le testeur décide.
- Le **POM et le seed partagé** : l'agent les utilise s'ils existent ; sans eux (J1), tests plats. D'où l'architecture avant l'IA dans cette formation.
- La **revue** : un test généré non relu est une dette, avec un faux sentiment de couverture pour intérêts.
- La **donnée** : l'agent ne connaît ni les comptes de test ni les règles de données de l'entreprise (M7.4).

### 1.7 Erreurs fréquentes

| Erreur | Symptôme | Correction |
|---|---|---|
| Générer sans reprendre le seed | Chaque test réécrit la connexion, avec le mot de passe | Seed (`beforeEach`) + `copilot-instructions.md` |
| Prompt « écris tous les tests de la spec » | 15 tests, locators variables, aucun relu | Un critère par prompt |
| Test vert sur une fonctionnalité absente (SPEC-MB-05) | Hallucination : l'agent a testé autre chose | Instruction « n'invente rien », grille « Hallucination » |
| Healer qui remplace `toHaveText` par `toBeVisible` | Test vert, régression masquée | Règle « jamais d'affaiblissement », revue du diff |
| Healer qui met à jour un montant attendu | Régression métier validée | Ticket obligatoire pour tout changement de valeur |
| Locator `nth(3)` accepté | Cassera au premier tri | Grille « Locators » |
| Session de chat de 2 heures | Qualité en baisse, répétitions | Nouvelle session par tâche |
| Générer contre un environnement partagé | Données polluées | Utilisateur par worker ou mode mock (J3) |

### 1.8 Points à retenir

- planner (plan Markdown, relu), generator (exécute puis écrit), healer (débogue, modification minimale).
- Prompt = critère + point de départ + conventions + forme + interdits + résumé.
- Grille de revue en 8 critères ; un test généré est une proposition committée par un humain.
- Self-healing : jamais d'affaiblissement d'assertion, ticket pour tout changement de valeur attendue, `fixme` documenté quand la régression est réelle.

---

## 2. Démonstration

**Objectif** : sur SauceDemo, avec le projet POM/fixtures du M3.2 (copié dans `demo/`), générer le test du critère CA-1 de SPEC-SD-01 avec le generator, le relire avec la grille, puis lancer le healer sur un test volontairement cassé.

### Étapes

1. Ouvrir `demo/` (projet M3.2 + agents initialisés + `specs/SPEC-SD-01-commande.md` + prompt `generer-ca`). Démarrer `playwright-test`. Lire `seed.spec.ts` (`beforeEach` : `connecterCatalogue`).
2. Chat, agent **playwright-test-generator**, prompt `/generer-ca` avec `critere = CA-1`, `spec = specs/SPEC-SD-01-commande.md`. Observer : `generator_setup_page`, `browser_snapshot`, `browser_click` (Add to cart), `browser_verify_text_visible` (badge « 1 »), `generator_read_log`, `generator_write_test`. Ouvrir le fichier produit.
3. Relire avec la grille. Points typiques : `beforeEach` de connexion pas repris du seed (à copier depuis `tests/seed.spec.ts`) ; `getByTestId('inventory-item')` + `filter` (bien) ; badge et bouton Remove vérifiés (fidèle à CA-1). Corriger si besoin, lancer : vert.
4. Comparer avec `correction/tests/generes/ca-1.spec.ts` (version relue et committée) et `JOURNAL.md` (prompt, modèle, durée, écarts corrigés).
5. Self-healing : `tests/casse/panier.spec.ts` (locators d'une ancienne version : bouton « Add to basket », badge `.cart-count`). `npx playwright test casse` : 2 échecs. Chat, agent **playwright-test-healer**, prompt `/playwright-test-heal`. Observer `test_run`, `test_debug`, `browser_snapshot`, `browser_generate_locator`, édition, relance. Diff : seuls les locators ont changé.
6. Contre-exemple : `tests/casse/prix.spec.ts` attend « $30.99 » pour le Backpack (prix réel $29.99). Le healer propose de mettre à jour la valeur. Évolution ou régression ? On ne sait pas : ticket, pas de merge. Règle dans `copilot-instructions.md`.
7. SPEC-MB-05 (fonctionnalité absente) : avec les instructions, l'agent produit un `fixme` ; sans, observer ce qu'il invente.

### Fichiers de la démo

`demo/` : projet M3.2 (`pages/`, `flows/`, `fixtures/support.ts`), `specs/SPEC-SD-01-commande.md`, `.github/prompts/generer-ca.prompt.md`, `.github/copilot-instructions.md`, `tests/seed.spec.ts`, `tests/casse/*.spec.ts` (à réparer), `README.md` avec les prompts.

### Résultat attendu

- `tests/generes/ca-1.spec.ts` fidèle à CA-1, vert après correction de l'import.
- Deux tests cassés réparés par changement de locators uniquement ; le troisième laissé en l'état avec un ticket.
- Une entrée de journal par génération.

---

## 3. Exercice (35 minutes)

Voir `exercice.md`. Matériel dans `exercice-materiel/`.

## 4. Correction

Voir `correction/`.

## 5. Contribution au projet fil rouge

**Ce qui est ajouté dans `fil-rouge/frontend`** (séance fil rouge) :

- `specs/` : SPEC-MB-03, 04, 05, 06 ;
- `tests/seed.spec.ts` avec un `beforeEach` sur un utilisateur de worker isolé (backend mock ou réel) ;
- prompt `generer-ca` ;
- dossier `tests/generes/` ;
- `JOURNAL-GENERATION.md` et `GRILLE-QUALITE.md`.

Les 5 tests du fil rouge J4 sont générés critère par critère depuis SPEC-MB-03 et 04, relus avec la grille, puis committés.

**Lien avec la notion** : le seed sur l'utilisateur de worker fait démarrer l'agent avec un utilisateur isolé (J3) ; la génération respecte l'isolation sans que l'agent en ait conscience.

## Ressources externes

- Agents de test Playwright : https://playwright.dev/docs/test-agents
- Fichiers de prompt VS Code : https://code.visualstudio.com/docs/copilot/customization/prompt-files
- Agents personnalisés : https://code.visualstudio.com/docs/copilot/customization/custom-agents
- Bonnes pratiques Playwright (rappel) : https://playwright.dev/docs/best-practices
