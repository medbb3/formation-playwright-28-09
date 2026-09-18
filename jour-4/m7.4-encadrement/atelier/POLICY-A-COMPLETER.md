# Policy d'usage des agents IA pour les tests — Banque Fictive Régionale (BFR)

Version 1.0 — [À COMPLÉTER: date] — Propriétaire : [À COMPLÉTER: rôle responsable] — Validée par : [À COMPLÉTER: qui valide, au moins 2 fonctions] — Revue : [À COMPLÉTER: fréquence]

## 1. Objet et périmètre

Cette policy encadre l'usage des assistants et agents IA (GitHub Copilot, agents personnalisés, serveurs MCP) par les équipes QA pour concevoir, générer, réparer et exécuter des tests automatisés. Elle s'applique à [À COMPLÉTER: quelle population, quels projets]. Elle complète la charte informatique et la politique de sécurité ; en cas de conflit, [À COMPLÉTER: quelle règle s'applique].

## 2. Outils et serveurs autorisés

| Outil | Version | Usage autorisé | Responsable |
|---|---|---|---|
| GitHub Copilot Business (VS Code, CLI) | gérée par l'admin | [À COMPLÉTER] | [À COMPLÉTER] |
| `@playwright/mcp` | [À COMPLÉTER: épinglée ou `@latest` ? pourquoi] | [À COMPLÉTER: quel(s) environnement(s)] | [À COMPLÉTER] |
| `playwright run-test-mcp-server` | [À COMPLÉTER] | [À COMPLÉTER] | [À COMPLÉTER] |
| Azure DevOps MCP (officiel Microsoft) | [À COMPLÉTER] | [À COMPLÉTER: lecture seule ? écriture ?] | [À COMPLÉTER] |

Tout autre outil d'IA ([À COMPLÉTER: lister au moins 2 catégories à interdire explicitement, en pensant à l'incident récent de BFR]) est **interdit** sur les postes BFR. Ajout d'un serveur MCP : [À COMPLÉTER: décrivez la procédure — qui demande, qui revoit, quel registre]. Modèles autorisés : [À COMPLÉTER: quels critères de choix].

## 3. Données et environnements

| Environnement | Règle (autorisé / interdit, conditions) | Preuve |
|---|---|---|
| DEV | [À COMPLÉTER] | [À COMPLÉTER] |
| RECETTE | [À COMPLÉTER : attention, l'énoncé précise que RECETTE conserve des IBAN réels « pour les tests de virement » — un agent peut-il y accéder tel quel ?] | [À COMPLÉTER] |
| PRÉPROD | [À COMPLÉTER] | [À COMPLÉTER] |
| PROD | [À COMPLÉTER] | [À COMPLÉTER] |

| Sujet | Règle | Preuve |
|---|---|---|
| Données dans les prompts, fichiers lus, snapshots | [À COMPLÉTER] | [À COMPLÉTER] |
| Jeux de données | [À COMPLÉTER] | [À COMPLÉTER] |
| Secrets | [À COMPLÉTER : quel(s) mécanisme(s) technique(s), pas une simple consigne] | [À COMPLÉTER] |
| Captures et snapshots | [À COMPLÉTER] | [À COMPLÉTER] |

## 4. Configuration de référence

- `mcp.json` du dépôt (obligatoire, revu en PR) : [À COMPLÉTER : lister au moins 4 options et leur valeur, cf. cours.md §1.5].
- `.github/copilot-instructions.md` : [À COMPLÉTER : quelles règles de projet doivent y figurer].
- Agents personnalisés (`.github/agents/`) : [À COMPLÉTER : pour planner, generator, healer — quels outils chacun a le droit d'appeler, ce qui est explicitement exclu].
- Auto-approbation : [À COMPLÉTER : activée ou non, sur quelle liste d'outils].

## 5. Actions autorisées

| Action | Statut (autorisé / autorisé avec confirmation / interdit à l'agent) |
|---|---|
| Explorer un environnement, lire le code, proposer des plans et des tests | [À COMPLÉTER] |
| Écrire dans `tests/`, `specs/`, `pages/` | [À COMPLÉTER] |
| Modifier `playwright.config.ts`, la CI, `package.json` (dépendances) | [À COMPLÉTER] |
| Commandes git (`push`, `reset`, `rebase`), suppression de fichiers | [À COMPLÉTER] |
| Supprimer des données, opérations irréversibles sur un compte partagé | [À COMPLÉTER] |
| Agent autonome en pipeline (healer nocturne) | [À COMPLÉTER] |

## 6. Revue, responsabilité, traçabilité

- [À COMPLÉTER : qui relit un artefact généré, avec quelle grille, avant quoi]
- La PR indique : [À COMPLÉTER : quelle mention obligatoire]
- [À COMPLÉTER : nom et contenu du fichier de journal ; ce qu'il trace, ligne par ligne]
- Quality gates CI concernées : [À COMPLÉTER]

## 7. Incidents

- En cas de [À COMPLÉTER : lister au moins 3 types d'incidents visés par ce module] : [À COMPLÉTER : déclaration à qui, sous quel délai, quelles actions immédiates (ex. rotation d'un secret)].
- [À COMPLÉTER : politique de sanction ou non pour une déclaration de bonne foi — et pourquoi ce choix compte pour la culture de déclaration]

## 8. Formation et revue

- [À COMPLÉTER : formation obligatoire, à quel rythme, quelle preuve conservée]
- Revue trimestrielle : [À COMPLÉTER : quels points sont réexaminés à chaque revue]

---

## Décisions techniques immédiates (projet de tests)

1. [À COMPLÉTER]
2. [À COMPLÉTER]
3. [À COMPLÉTER]

## Demandes

1. [À COMPLÉTER : une demande à l'administration Copilot]
2. [À COMPLÉTER : une demande au RSSI ou au DPO]
