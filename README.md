# Formation Playwright — 5 jours

Public : développeurs et juniors QA, travail en solo. Outils imposés : TypeScript, VS Code + GitHub Copilot (MCP, agents, CLI), Azure DevOps, Docker.

## Organisation des fichiers

```
formation/
├── fil-rouge/                     # mini-banque : React (5173) + FastAPI (8000), Docker, pipeline (les tests Playwright sont à écrire par le stagiaire)
├── jour-1/  objectifs.md, 00-accueil (checklist), m1.1-installation, m1.2-locators, m2.1-debug, m2.2-frames-shadow-antiflaky, fil-rouge-j1, synthese.md
├── jour-2/  objectifs.md, m3.1-pom-base, m3.2-pom-avance-fixtures, m4.1-tests-api, m4.2-mocking, fil-rouge-j2, synthese.md
├── jour-3/  objectifs.md, m5.1-data-driven, m5.2-faker-isolation-storagestate, m6.1-tests-visuels, m6.2-accessibilite, m6.3-fichiers-onglets-temps, fil-rouge-j3, synthese.md
├── jour-4/  objectifs.md, 00-specs-fictives, m7.1-mcp-intro, m7.2-generation-self-healing, m7.3-exploratoire-gherkin, m7.4-encadrement, fil-rouge-j4, synthese.md
└── jour-5/  objectifs.md, m8.1-git-azure-repos, m8.2-pull-requests, m9.1-pipeline-yaml, m9.2-secrets-matrice-gates, m10.1-reporters-kpis, qcm-evaluation, fil-rouge-j5, synthese.md
```

Chaque jour commence par `objectifs.md` (objectifs de la journée). Chaque module contient : `cours.md` (théorie, démonstration commentée, contribution au fil rouge, ressources), `demo/` (code exécutable de la démonstration), `exercice.md` (objectif, énoncé, consignes, résultat attendu, difficulté, durée). Certains modules ont un `exercice-materiel/` (projet de départ) ou un `atelier/`.

## Module M6.3 (transversal)

`jour-3/m6.3-fichiers-onglets-temps` couvre les téléchargements, l'upload, les nouveaux onglets et `page.clock`. Il ne dépend que des Jours 1 et 2 ; sa place dans la semaine est annoncée en séance. Sa contribution au fil rouge (export CSV du relevé, import de bénéficiaires, lien CGU en nouvel onglet, expiration de session) est **déjà implémentée** dans `fil-rouge/`.

## Sites publics utilisés

SauceDemo, The Internet, Demoblaze, Practice Software Testing, RahulShettyAcademy, demoqa, ReqRes (clé `x-api-key: reqres-free-v1`), Restful-Booker.

## Prérequis techniques

Node 20+ (22 recommandé), Git, VS Code (Playwright, Copilot), Docker Desktop, compte GitHub Copilot, organisation Azure DevOps personnelle (demander le parallélisme gratuit à l'avance, ou agent auto-hébergé Docker). Détail : `jour-1/00-accueil/cours.md`.

## Versions

Tout le code a été exécuté avec Playwright 1.62.1 (Node 22, Linux). Les baselines visuelles fournies sont Linux ; les postes Windows régénèrent les leurs.
