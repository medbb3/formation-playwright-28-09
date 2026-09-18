# M7.3 — Testing exploratoire assisté et conversion Gherkin → test

## 1. Cours théorique

### 1.1 Le testing exploratoire, et ce que l'agent y apporte

Testing exploratoire (Cem Kaner, James Bach) :

- apprentissage, conception et exécution de tests **simultanés** ;
- guidé par une **charte** : mission bornée dans le temps (« explorer l'écran de virement avec le rôle conseiller pendant 30 minutes, en cherchant les écarts avec les règles métier ») ;
- trouve ce que les tests scriptés ne cherchent pas : incohérences, oublis de spec, comportements limites, problèmes d'ergonomie.

Apport d'un agent avec navigateur MCP :

| Apport | Comment |
|---|---|
| **Cartographie rapide** | Snapshot de chaque écran, liste des éléments interactifs, parcours possibles en quelques minutes |
| **Systématicité** | Il essaie ce qu'un humain oublie : champs vides, valeurs limites, retour arrière, double clic, rôles différents |
| **Trace** | Chaque action est journalisée ; les captures et snapshots sont conservés (`--output-dir`, `--save-session`) |
| **Reformulation** | Il transforme une observation en scénario Gherkin, en ticket, ou en test |

Ce qu'il n'apporte pas : le **jugement**.

- « Le conseiller accède à l'écran de virement » est une observation.
- Défaut (RM-4 de SPEC-MB-06) ou fonctionnalité ? Le testeur et le PO décident.
- L'agent explore ; le testeur évalue.

### 1.2 Une session exploratoire assistée, pas à pas

**1. Charte** (rédigée par le testeur, 2 minutes) :

```
Mission : explorer la vue conseiller de la mini-banque (Carol) et confronter le comportement aux règles RM-1 à RM-4 de specs/SPEC-MB-06-conseiller.md.
Périmètre : tableau de bord, opérations, écran de virement, bénéficiaires. Rôle : advisor.
Hors périmètre : authentification, cours de change.
Durée : 20 minutes. Livrables : observations numérotées, écarts avec la spec, questions au PO, critères d'acceptation proposés en Gherkin.
```

**2. Prompt à l'agent** (mode Agent, serveur `playwright` avec `--storage-state .auth/real/carol.json` ou seed sur `asCarol`) :

```
Tu es un testeur exploratoire. Voici ta charte : #file:specs/charte-conseiller.md et la spec #file:specs/SPEC-MB-06-conseiller.md.
Explore l'application écran par écran. Pour chaque écran : ce que tu vois (éléments, données), ce que tu essaies (au moins un cas limite), ce que tu observes.
Ne modifie aucune donnée irréversiblement (pas de suppression) ; les virements sont autorisés uniquement depuis un compte dont le solde dépasse 1 000 €, pour un montant de 1 €.
Termine par : (1) tableau des observations, (2) écarts avec RM-1 à RM-4, (3) questions pour le PO, (4) critères d'acceptation Gherkin proposés pour RM-1 à RM-3.
```

Les contraintes de données du prompt appliquent M7.4 : l'agent ne sait pas juger ce qui est réversible.

**3. Pendant la session** :

- le testeur lit le fil des outils ;
- il interrompt et oriente (« attends, reviens sur le tableau de bord et clique sur Voir les opérations du compte de Bob ») ;
- **pair testing** : l'agent conduit, le testeur navigue.

**4. Après** :

- le testeur trie les observations (défaut, question, non-problème) ;
- il crée les tickets et garde les scénarios Gherkin utiles pour le PO ;
- captures et journal de session en pièce jointe du compte rendu.

### 1.3 Charte et prompts : ce qui fait la qualité

- **Périmètre et interdits explicites** : sans limite, l'agent explore la déconnexion, supprime un bénéficiaire, ou part sur un autre site (d'où `--allowed-origins`).
- **Une hypothèse à vérifier** plutôt qu'une exploration libre : « vérifie si le conseiller peut voir des données d'un client qui n'est pas dans son portefeuille » cadre la recherche.
- **Format de sortie imposé** : tableau, numérotation, séparation observation / interprétation. Sinon l'agent mélange les deux.
- **Durée et budget d'actions** : « au plus 40 actions » évite les boucles.
- **Rôle** : « tu es un testeur, pas un utilisateur » change les comportements testés (valeurs limites, retours arrière).

### 1.4 Gherkin : rappel et place dans la chaîne

Gherkin (`Fonctionnalité / Scénario / Étant donné / Quand / Alors / Et`) décrit un comportement en langage métier ; c'est le contrat entre PO, dev et QA. Dans cette formation, l'approche retenue est **Gherkin comme spécification** : les critères vivent dans les specs, et un test Playwright par critère porte un commentaire par ligne Gherkin, avec le titre = identifiant du critère. Simple, sans outil supplémentaire, et c'est ce que produit le generator (M7.2).

La conversion **automatique** scénario → test est l'un des usages les plus fiables de l'agent : l'entrée est structurée.

> **Bonus (hors parcours principal)** : il existe une deuxième façon d'exécuter du Gherkin avec Playwright, le **Gherkin exécutable** (`playwright-bdd`) — les `.feature` sont la source, des *step definitions* TypeScript implémentent chaque phrase, et l'outil génère les specs lancées par le runner Playwright. Traçabilité totale et rapports Cucumber utiles si le métier relit directement les `.feature`, au prix d'une couche supplémentaire (pas à maintenir, tentation du pas générique « Quand je clique sur "<x>" »). Un aperçu non exécuté est fourni en §2 (`demo/bdd-apercu/`) ; ce n'est pas le chemin enseigné ici.

### 1.5 Convertir un scénario Gherkin en test : la méthode

1. **Une phrase = une ligne de code, ou un appel de Page Object.** « Quand je choisis le bénéficiaire « Loyer » » → `transfer.beneficiarySelect.selectOption({ label: 'Loyer' })`.
2. **« Étant donné » = préparation** : fixture ou appel API (jamais dix clics pour préparer un état).
3. **« Alors » = assertion web-first**, une par phrase ; « Et » après « Alors » = assertion supplémentaire.
4. **Le plan de scénario = boucle data-driven** (J3).
5. **Ce qui n'est pas dans l'interface** (« aucune opération créée ») = vérification API dans le test (`page.request` ou fixture `api`).
6. **Les valeurs** restent celles de la spec, en constantes ; si la spec dit « un compte crédité de 500 € », la fixture doit le garantir (`workerUser` avec `balance: 500`).

Prompt de conversion (`.github/prompts/gherkin-vers-test.prompt.md`) :

```
Convertis le scénario suivant en test Playwright, avec les règles du projet :
${input:scenario}
- Étant donné → fixture ou préparation par API (indique laquelle), Quand → actions via Page Objects, Alors/Et → une assertion par phrase.
- Exécute le scénario dans le navigateur avant d'écrire, et signale toute phrase que tu ne peux pas réaliser.
- Un commentaire par phrase Gherkin, titre = libellé du scénario, fichier tests/generes/<nom>.spec.ts.
```

### 1.6 Bonnes pratiques

1. Charte écrite avant la session : périmètre, interdits, données autorisées, durée, livrables.
2. Compte de test dédié à l'exploration, jamais un compte partagé ; mode mock quand l'exploration peut modifier des données.
3. Séparer observation et interprétation dans les livrables ; le testeur tranche.
4. Un scénario Gherkin par comportement, phrases métier (pas « je clique sur le bouton #btn-3 »).
5. Convertir critère par critère, exécuter, relire avec la grille de M7.2.
6. Garder la spec comme référence : un test qui contredit la spec est une question, pas une correction.

### 1.7 Erreurs fréquentes

| Erreur | Conséquence | Correction |
|---|---|---|
| Exploration sans charte | L'agent tourne en rond, sort du périmètre | Charte avec périmètre et budget |
| Agent connecté avec un compte réel ou partagé | Données modifiées, incident | Compte dédié, mock |
| Prendre les observations de l'agent pour des défauts | Faux tickets | Tri par le testeur |
| Gherkin technique (« je clique sur `#submit` ») | Illisible pour le métier, fragile | Phrases métier, détail dans le Page Object |
| Scénario de 20 phrases | Test illisible, plusieurs comportements | Découper |
| « Étant donné » réalisé par des clics | Test lent et fragile | Fixture ou API |
| Convertir sans exécuter | Locators inventés | Serveur `playwright-test`, exécution avant écriture |

### 1.8 Points à retenir

- L'agent explore vite et systématiquement ; le testeur cadre (charte) et juge.
- Prompt d'exploration = charte + interdits + données autorisées + format de sortie.
- Gherkin comme spécification (convention, commentaire par phrase) : l'approche enseignée. `playwright-bdd` (Gherkin exécutable) : bonus, hors parcours principal.
- Conversion : une phrase = une ligne, Étant donné = fixture/API, Alors = assertion, plan = boucle.

---

## 2. Démonstration

**Objectif** : sur Practice Software Testing (catalogue, compte client, panier, favoris), mener une session exploratoire assistée de 15 minutes sur les « favoris » à partir d'une charte, obtenir des scénarios Gherkin, puis en convertir un en test avec le generator.

**Site** : https://practicesoftwaretesting.com (compte de test public : `customer@practicesoftwaretesting.com` / `welcome01`, données réinitialisées régulièrement par le site).

### Étapes

1. Lire `specs/charte-favoris.md` : mission (les favoris d'un client connecté), périmètre, interdits (ne pas modifier le profil, ne pas commander), durée, livrables.
2. Mode Agent, serveur `playwright` (`--allowed-origins` sur le site et son API), prompt d'exploration (`README.md`). Suivre le fil : connexion, ajout d'un favori depuis une fiche produit, page « My favorites », suppression, tentative d'ajout en double, tentative non connecté.
3. Interrompre une fois : « reviens sur la fiche et essaie d'ajouter deux fois le même produit ». Observer la réponse du site (message d'erreur ? doublon ?).
4. Lire le livrable : tableau d'observations, questions, scénarios Gherkin proposés. Trier : défaut, question, normal.
5. Copier les scénarios retenus dans `specs/SPEC-PST-07-favoris.md` (correction : version relue).
6. Prompt `/gherkin-vers-test` avec le scénario « Ajouter un favori ». Observer l'exécution, relire le test, le lancer.
7. Bonus (hors parcours principal) : lire, sans l'installer, la version `playwright-bdd` : `features/favoris.feature` + `steps/favoris.steps.ts` (fichiers dans `demo/bdd-apercu/`).

### Fichiers de la démo

`demo/specs/charte-favoris.md`, `demo/.github/prompts/explorer.prompt.md` et `gherkin-vers-test.prompt.md`, `demo/README.md` (prompts complets), `demo/bdd-apercu/` (bonus : aperçu `playwright-bdd`, non exécuté, hors parcours principal).

### Résultat attendu

- Compte rendu structuré : 6 à 10 observations, 2 à 3 questions, 4 à 6 scénarios Gherkin.
- Test `tests/generes/ajouter-un-favori.spec.ts` vert.

---

## 3. Exercice (30 minutes)

Voir `exercice.md`.

## 4. Correction

Voir `correction/`.

## 5. Contribution au projet fil rouge

**Ce qui est ajouté dans `fil-rouge/frontend`** (séance fil rouge) :

- `specs/charte-conseiller.md` et le compte rendu d'exploration de la vue conseiller (SPEC-MB-06) avec les critères Gherkin proposés ;
- le prompt `gherkin-vers-test` ;
- SPEC-MB-05 (virement programmé, absent) soumise au generator pour obtenir un `test.fixme()` documenté : preuve que l'agent n'invente pas.

**Lien avec la notion** : l'exploration assistée comble une spec sans critères (MB-06) ; la conversion Gherkin produit les tests du fil rouge depuis MB-03 et MB-04.

## Ressources externes

- Testing exploratoire (chartes, session-based) : https://www.satisfice.com/exploratory-testing
- Gherkin : https://cucumber.io/docs/gherkin/reference/
- playwright-bdd : https://vitalets.github.io/playwright-bdd/
- Prompt files VS Code : https://code.visualstudio.com/docs/copilot/customization/prompt-files
- Practice Software Testing (données et comptes) : https://github.com/testsmith-io/practice-software-testing
