# Jour 1 — Accueil

## Déroulé de l'accueil

| Durée | Activité |
|---|---|
| 5 min | Présentation du programme des 5 jours |
| 10 min | Tour de table : prénom, expérience dev, expérience test, attente principale |
| 15 min | Vérification des prérequis avec la checklist ci-dessous, clone du repo |

## Checklist d'installation (à faire avant la formation)

Cochez les cases et copiez le résultat des commandes dans le canal de la formation.

### 1. Node.js et npm

- [ ] Node.js LTS 20 ou 22 installé depuis https://nodejs.org
- [ ] Vérification :

```powershell
node -v      # attendu : v20.x ou v22.x
npm -v       # attendu : 10.x
```

### 2. Git

- [ ] Git installé depuis https://git-scm.com
- [ ] Identité configurée :

```powershell
git --version
git config --global user.name "Prénom Nom"
git config --global user.email "prenom.nom@exemple.com"
```

### 3. Visual Studio Code

- [ ] VS Code installé : https://code.visualstudio.com
- [ ] Extensions installées :
  - **Playwright Test for VSCode** (éditeur : Microsoft) — exécution et debug des tests depuis l'éditeur.
  - **GitHub Copilot** et **GitHub Copilot Chat** — nécessaires pour le Jour 4 (MCP).
  - **ESLint** et **Prettier** (optionnel mais recommandé).

### 4. Docker Desktop

- [ ] Docker Desktop installé et démarré (WSL 2 activé sur Windows).
- [ ] Vérification :

```powershell
docker --version
docker compose version
docker run --rm hello-world
```

### 5. Comptes en ligne

- [ ] Compte GitHub (pour Copilot, licence fournie par le client).
- [ ] Compte Microsoft + organisation Azure DevOps personnelle créée sur https://dev.azure.com (Jour 5).
- [ ] Demande de parallélisme gratuit Azure Pipelines envoyée (formulaire https://aka.ms/azpipelines-parallelism-request). Délai 2 à 3 jours ouvrés.

### 6. Réseau

- [ ] Accès autorisé aux sites publics utilisés en TP :
  - https://www.saucedemo.com
  - https://the-internet.herokuapp.com
  - https://rahulshettyacademy.com
  - https://www.demoblaze.com
  - https://practicesoftwaretesting.com
  - https://reqres.in
- [ ] Le proxy d'entreprise laisse passer `npm install` et le téléchargement des navigateurs Playwright (domaine `playwright.azureedge.net` et `cdn.playwright.dev`).

Si un proxy bloque : définir `HTTPS_PROXY` avant l'installation des navigateurs.

```powershell
$env:HTTPS_PROXY="http://proxy.entreprise:8080"
npx playwright install
```

### 7. Test final de l'environnement (5 minutes)

```powershell
mkdir test-env; cd test-env
npm init playwright@latest
npx playwright test
npx playwright show-report
```

Résultat attendu : 2 tests verts et le rapport HTML ouvert dans le navigateur. Si ce test passe, le poste est prêt.

## Clone du repo de formation

```powershell
git clone <URL_DU_REPO_FORMATION> formation-playwright
cd formation-playwright
```

Contenu du repo :

- `fil-rouge/` : la mini-banque (React + FastAPI), lancée chaque fin de journée avec `docker compose up`.
- `jour-1/` à `jour-5/` : supports de cours, démos, énoncés et corrections.

Démarrage de la mini-banque pour vérifier Docker (à refaire en séance fil rouge) :

```powershell
cd fil-rouge
docker compose up --build -d
# Front : http://localhost:5173   Back : http://localhost:8000/docs
```

## Règles de fonctionnement

- Travail en **solo** sur les exercices, correction collective au vidéoprojecteur.
- Chaque exercice a une durée cible. Quand la moitié du groupe a fini, on corrige.
- Questions bloquantes : à voix haute. Les autres vont sur le tableau « parking » et sont traitées en synthèse.

## Annexe — Playwright dans un environnement d'entreprise

Proxy, certificats auto-signés, authentification HTTP, certificat client : configuration hors programme mais utile au retour au poste. Détail dans `annexe-proxy-certificats.md`.
