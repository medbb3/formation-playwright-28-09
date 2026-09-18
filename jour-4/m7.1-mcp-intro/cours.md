# M7.1 — Introduction à MCP et installation de @playwright/mcp

## 1. Cours théorique

### 1.1 Le problème que résout MCP

- Un assistant IA (Copilot, Claude, ChatGPT) ne voit que du texte : pas de navigateur, pas de test lancé, pas de ticket lu.
- Avant MCP : un « plugin » maison par éditeur.
- **Model Context Protocol** (MCP) : publié par Anthropic en novembre 2024 ; adopté par OpenAI, Google, Microsoft (VS Code, Copilot), JetBrains, Cursor...
- Il standardise l'accès d'un modèle à des **outils** et à des **données** externes : l'USB-C des assistants IA.
- Un serveur MCP écrit une fois fonctionne avec tous les clients.
- Pour le test logiciel : l'agent **pilote un vrai navigateur** via Playwright, observe, agit, vérifie, puis écrit un test à partir de ce qu'il a vu, sans deviner les locators.

### 1.2 Architecture : client → serveur → navigateur

L'essentiel à retenir tient en une chaîne :

```
Client (VS Code / Copilot Chat)  ──►  Serveur MCP Playwright (@playwright/mcp)  ──►  Navigateur
```

- Le **client** vit dans VS Code (ou une autre app compatible) : c'est lui qui parle au modèle (Copilot) et qui relaie ses demandes.
- Le **serveur MCP Playwright** expose des **outils** : des fonctions que le modèle peut appeler (`browser_navigate`, `browser_click`, `test_run`...). C'est la seule capacité qui nous sert dans cette formation.
- Le modèle décide d'appeler un outil ; VS Code demande confirmation (ou non, si auto-approuvé) ; le serveur exécute réellement l'action dans le **navigateur** et renvoie le résultat (texte structuré) au modèle, qui continue.
- En pratique, le serveur tourne en local, lancé par VS Code lui-même : rien à héberger, rien n'écoute sur le réseau.

En contexte bancaire, cette chaîne se lit comme un empilement de frontières de confiance : l'agent et le modèle sont isolés des outils, qui sont eux-mêmes isolés de l'application et de ses données réelles.

![Architecture de confiance MCP en contexte bancaire : la zone agent/LLM, la zone MCP/outils et la zone application bancaire sont séparées par des contrôles (allowlist d'outils, redaction PII, environnement isolé à données synthétiques, journal d'audit, revue humaine des actions sensibles).](assets/mcp-bancaire.png)

*Figure — MCP en contexte bancaire : isoler l'agent, restreindre les outils, masquer les données et journaliser sous revue humaine.*

### 1.3 L'écosystème Playwright pour les agents

Trois briques Microsoft complémentaires, issues du dépôt Playwright :

| Brique | Paquet | Ce que c'est | Quand |
|---|---|---|---|
| **Playwright MCP** | `@playwright/mcp` | Serveur MCP qui expose un navigateur : naviguer, cliquer, saisir, lire un **snapshot d'accessibilité** de la page (texte structuré, pas d'image), gérer les onglets, le réseau, les dialogues | Exploration, génération de tests, agents généralistes |
| **Agents de test Playwright** | `npx playwright init-agents --loop vscode` (Playwright 1.56+) | Trois agents prêts à l'emploi pour VS Code / Copilot : **planner** (explore et écrit un plan de test en Markdown), **generator** (exécute chaque étape dans le navigateur et écrit le `.spec.ts`), **healer** (lance les tests, débogue les échecs, corrige). Ils utilisent un serveur MCP dédié, `playwright run-test-mcp-server`, qui connaît le projet de tests (config, fixtures, `test_run`, `test_debug`) | Le cœur de M7.2 et du fil rouge |
| **Playwright CLI** | `@playwright/cli` (`npx playwright-cli`) | Les mêmes commandes qu'MCP, mais en ligne de commande (`open`, `click`, `snapshot`, `state-save`...), économes en jetons, utilisables par un agent terminal (Copilot CLI) ou par un humain | Agents en terminal, scripts, sessions nommées |

Le snapshot d'accessibilité fait la fiabilité :

- l'agent lit `button "Se connecter" [ref=e12]` et agit sur `e12` ;
- pas de vision, pas de coordonnées, pas de devinette : la même information que `getByRole` (M1.2) ;
- d'où des tests générés avec des locators de niveau 1.

### 1.4 Copilot dans VS Code : Ask, Edit, Agent, agents personnalisés

| Mode | Ce qu'il fait | Outils MCP |
|---|---|---|
| **Ask** | Répond, propose du code, ne modifie rien | Non |
| **Edit** | Modifie les fichiers ouverts selon l'instruction | Non |
| **Agent** | Boucle autonome : lit le projet, appelle des outils (terminal, fichiers, **serveurs MCP**), édite, relance | Oui |
| **Agents personnalisés** (`.github/agents/*.agent.md`) | Un agent avec un rôle, un prompt système, une liste d'outils autorisée et un modèle | Oui, restreints à la liste |

Fichiers de configuration du projet (versionnés, donc revus en PR) :

| Fichier | Rôle |
|---|---|
| `.vscode/mcp.json` | Serveurs MCP du projet (commande, transport, variables) |
| `.github/copilot-instructions.md` | Instructions permanentes : conventions du projet, règles de génération (locators, fixtures, pas de `waitForTimeout`...) |
| `.github/instructions/*.instructions.md` | Instructions ciblées par motif de fichier (`applyTo: "tests/**/*.spec.ts"`) |
| `.github/agents/*.agent.md` | Agents personnalisés (planner, generator, healer, ou les vôtres) |
| `.github/prompts/*.prompt.md` | Prompts réutilisables (`/playwright-test-generate` dans le chat) |

Modèle : choisi par agent (`model:` dans l'en-tête) ou dans le sélecteur du chat ; liste dépendante de la licence Copilot de l'entreprise et de sa politique (M7.4).

Le même agent existe aussi en ligne de commande (`npm install -g @github/copilot`, puis `copilot`) : utile sur un poste sans interface graphique ou en pipeline, avec les mêmes fichiers `.github/` versionnés et confirmation avant chaque commande.

### 1.5 Installer et configurer `@playwright/mcp`

Prérequis : Node 20+, VS Code récent, extension GitHub Copilot Chat, licence Copilot Business/Enterprise avec MCP autorisé par l'administrateur.

**Étape 1 : déclarer le serveur** dans `.vscode/mcp.json` :

```json
{
  "servers": {
    "playwright": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "@playwright/mcp@latest",
        "--isolated",
        "--headless",
        "--viewport-size", "1280x720",
        "--allowed-origins", "http://localhost:5173;http://localhost:8000",
        "--output-dir", ".mcp-output"
      ]
    }
  }
}
```

Options essentielles à connaître pour cette formation (liste complète : `npx @playwright/mcp --help`) :

| Option | Effet |
|---|---|
| `--isolated` | Profil navigateur en mémoire, rien sur disque : aucune session persistante |
| `--allowed-origins` / `--blocked-origins` | Limite les origines accessibles au navigateur : empêche l'agent d'aller sur la production ou sur Internet |
| `--secrets <fichier .env>` / `--storage-state <fichier>` | Fournit un mot de passe ou une session déjà connectée sans jamais les faire transiter par le prompt |
| `--output-dir` | Dossier des captures et traces, à ignorer par git |

**Étape 2 : démarrer**

- Dans `mcp.json`, cliquer « Start » au-dessus du serveur (ou commande *MCP: List Servers*).
- VS Code affiche la liste des outils disponibles (`browser_navigate`, `browser_snapshot`, `browser_click`, `browser_type`...).

**Étape 3 : premier dialogue** (mode Agent)

- Prompt : « Ouvre https://www.saucedemo.com et décris les éléments interactifs de la page de connexion ».
- L'agent appelle `browser_navigate` puis `browser_snapshot`, et répond à partir du snapshot.
- Chaque appel d'outil est affiché : à confirmer, refuser ou auto-approuver.

**Étape 4 : les agents de test Playwright**

- `npx playwright init-agents --loop vscode --prompts` crée `.github/agents/playwright-test-{planner,generator,healer}.agent.md`, `.github/prompts/*.prompt.md`, `specs/`, `seed.spec.ts`, et ajoute le serveur `playwright-test` à `mcp.json`.
- **Seed** : test minimal qui charge les fixtures du projet ; l'agent démarre dans le contexte de la suite (connecté, backend mock...).

### 1.6 Ce que MCP change, et ne change pas, pour un QA

Change : exploration d'une application inconnue en minutes ; premier jet de tests ancré dans le DOM réel ; réparation guidée des locators ; conversion spec → test.

Ne change pas : la responsabilité du test.

- Un test généré est une **proposition**.
- Même revue que le code manuel : POM, fixtures, assertions d'effet, données, isolation. La grille de qualité du fil rouge J4 la formalise.
- Les règles de M7.4 s'appliquent avant le premier prompt.

### 1.7 Bonnes pratiques

1. `--isolated`, `--allowed-origins` : configuration par défaut de tout `mcp.json`.
2. Secrets par `--secrets` ou `--storage-state`, jamais dans un prompt.
3. Configuration versionnée dans le projet (`.vscode/mcp.json`, `.github/`), revue comme du code.
4. Instructions de projet (`copilot-instructions.md`) écrites **avant** de générer : elles portent les conventions du J2 et du J3.
5. Serveur `playwright-test` (connaît le projet) pour générer et réparer ; serveur `playwright` générique pour explorer un site externe.
6. Confirmation manuelle des appels d'outils tant que l'on apprend ; auto-approbation seulement sur une liste blanche d'outils de lecture.

### 1.8 Erreurs fréquentes

| Erreur | Cause | Correction |
|---|---|---|
| Le serveur ne démarre pas : `npx` introuvable | Node absent du PATH de VS Code | Redémarrer VS Code après installation de Node |
| « MCP servers are disabled by policy » | Administration Copilot | Demander l'activation (M7.4, checklist) |
| L'agent « voit » une page blanche | Application non démarrée, ou origine bloquée | `docker compose up -d`, vérifier `--allowed-origins` |
| L'agent utilise des coordonnées ou du XPath | Serveur générique sans instructions de projet | `copilot-instructions.md` avec les règles de locators |
| Deux serveurs, outils en doublon (`browser_*`) | `playwright` et `playwright-test` démarrés ensemble | Un seul à la fois, ou agents personnalisés avec liste d'outils |
| Le navigateur reste ouvert entre deux sessions | Profil persistant | `--isolated` |
| Le mot de passe apparaît dans l'historique du chat | Saisi dans le prompt | `--secrets` / `--storage-state` |

### 1.9 Points à retenir

- MCP standardise l'accès d'un modèle à des outils ; chaîne essentielle : client (VS Code/Copilot) → serveur MCP Playwright → navigateur.
- `@playwright/mcp` pilote un navigateur par snapshot d'accessibilité ; `playwright-test` connaît le projet ; `playwright-cli` fait la même chose en terminal.
- VS Code : `mcp.json`, `copilot-instructions.md`, agents et prompts versionnés ; mode Agent ; CLI Copilot pour le terminal.
- Configuration sûre par défaut : `--isolated`, `--allowed-origins`, secrets hors prompt.

---

## 2. Démonstration

**Objectif** : installer `@playwright/mcp` dans un projet vide, dialoguer avec l'agent sur SauceDemo, observer les appels d'outils, initialiser les agents de test Playwright, puis passer par la CLI Copilot et `playwright-cli`.

**Site** : https://www.saucedemo.com

### Étapes

1. Ouvrir `demo/` dans VS Code. Lire `.vscode/mcp.json` (serveur `playwright`, stdio, options sûres). « Start », puis lire la liste des outils.
2. Copilot Chat, mode **Agent**, prompt 1 : « Ouvre https://www.saucedemo.com, connecte-toi avec l'utilisateur standard_user (le mot de passe est dans le fichier de secrets) et liste les six produits avec leur prix. » Observer : `browser_navigate`, `browser_snapshot`, `browser_type`, `browser_click`, réponse tabulaire. Le snapshot dans le panneau est du texte structuré, pas une image.
3. Refuser un appel d'outil (confirmation), puis le ré-autoriser.
4. Prompt 2 : « Sans écrire de code, décris comment tu ciblerais le bouton Add to cart du Sauce Labs Backpack de façon robuste. » Attendu : rôle + nom dans le conteneur du produit (cf. M1.2).
5. Terminal : `npx playwright init-agents --loop vscode --prompts`. Parcourir `.github/agents/playwright-test-planner.agent.md` (rôle, outils autorisés, modèle), `mcp.json` complété du serveur `playwright-test`, `seed.spec.ts`. Pas encore de génération : c'est M7.2.
6. Terminal : `npx playwright-cli open https://www.saucedemo.com`, `npx playwright-cli snapshot`, `npx playwright-cli fill e5 standard_user`... : mêmes primitives, sans modèle.
7. Terminal : `copilot`, `/mcp add` (stdio, `npx @playwright/mcp@latest --isolated`), prompt 1 rejoué. Quitter.

### Fichiers de la démo

`demo/` : `.vscode/mcp.json` (deux serveurs), `.github/copilot-instructions.md` (conventions de génération), `secrets.env.example`, `README.md` (déroulé et prompts).

### Explication

- Le snapshot renvoie des références `[ref=eNN]` sur lesquelles l'agent agit : l'arbre d'accessibilité de `toMatchAriaSnapshot` (M6.1) et d'axe (M6.2).
- `--secrets secrets.env` : le prompt nomme le secret (« le secret SAUCE_PASSWORD »), la valeur ne quitte jamais le poste ; le serveur MCP la substitue lors de `browser_type`.
- `copilot-instructions.md` est lu à chaque requête : règles des jours précédents (locators, fixtures, pas de `waitForTimeout`) ; il oriente la génération dès M7.2.

### Résultat attendu

- L'agent liste les six produits et leurs prix exacts.
- Il décrit un locator par rôle.
- Le projet contient les trois agents et les quatre prompts.
- La CLI répond au même prompt dans le terminal.

---

## 3. Exercice (25 minutes)

Voir `exercice.md`.

## 4. Correction

Voir `correction/`.

## 5. Contribution au projet fil rouge

**Ce qui est ajouté dans `fil-rouge/frontend`** (séance fil rouge) :

- `.vscode/mcp.json` : serveurs `playwright` (générique, `--allowed-origins` limité à localhost, `--storage-state .auth/real/alice.json`, `--secrets`) et `playwright-test` ;
- `.github/copilot-instructions.md` : structure des tests (helpers `commeRole` / `commeUtilisateurWorker`, Page Objects, flow de virement, règles de locators, interdits) ;
- agents et prompts Playwright initialisés avec `--loop vscode` ;
- `specs/` : spécifications fictives SPEC-MB-03 à 06.

**Lien avec la notion** : le fil rouge est la cible réelle de la génération ; sa configuration MCP applique dès le départ les restrictions du contexte bancaire (M7.4).

## Ressources externes

- Spécification MCP : https://modelcontextprotocol.io/introduction
- Playwright MCP : https://github.com/microsoft/playwright-mcp
- Agents de test Playwright : https://playwright.dev/docs/test-agents
- Playwright CLI : https://github.com/microsoft/playwright-cli
- MCP dans VS Code : https://code.visualstudio.com/docs/copilot/chat/mcp-servers
- Agents personnalisés Copilot : https://code.visualstudio.com/docs/copilot/customization/custom-agents
- Instructions Copilot : https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot
- CLI Copilot : https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-copilot-cli
