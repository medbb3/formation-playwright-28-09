# M8.1 — Git essentiel et Azure Repos

## 1. Cours théorique

### 1.1 Pourquoi Git pour un testeur

- Les tests sont du code : ils se versionnent, se relisent, se déploient.
- Avec Git, vous travaillez en parallèle des développeurs, proposez vos tests en revue, revenez à un état connu et faites tourner la suite en CI.
- Niveau visé : autonomie sur le cycle branche, commit, push, PR, mise à jour, sans casser l'historique partagé.

### 1.2 Le modèle mental

```
Répertoire de travail  --add-->  Index (staging)  --commit-->  Dépôt local (.git)  --push/pull-->  Dépôt distant (Azure Repos)
```

- Un **commit** est un instantané complet, identifié par un hash, avec auteur, date, message et parent(s).
- Une **branche** est un pointeur mobile vers un commit ; `main` est la branche d'intégration.
- `HEAD` est « où je suis » ; `origin` est le nom par défaut du dépôt distant.
- Un **tag** marque un commit (version livrée).

### 1.3 Commandes clés (celles que l'on utilise chaque jour)

| Besoin | Commande | Remarque |
|---|---|---|
| Cloner | `git clone <url>` | Azure Repos : URL HTTPS avec PAT ou SSH |
| État | `git status`, `git log --oneline --graph -15`, `git diff`, `git diff --staged` | Avant tout commit |
| Branche | `git switch -c feat/virement-tests` (créer), `git switch main` | `switch` remplace `checkout` pour les branches |
| Préparer | `git add tests/ui/virement.spec.ts` ou `git add -p` (par morceaux) | Jamais `git add .` sans `git status` avant |
| Committer | `git commit -m "test(virement): ajoute le cas plafond dépassé"` | Message en convention (1.4) |
| Synchroniser | `git fetch`, `git pull --rebase`, `git push -u origin feat/...` | `--rebase` garde l'historique linéaire |
| Mettre à jour sa branche | `git rebase main` (ou `git merge main`) | Rebase avant PR, jamais sur une branche partagée |
| Annuler | `git restore <fichier>` (travail), `git restore --staged <fichier>` (index), `git revert <hash>` (commit publié), `git reset --soft HEAD~1` (dernier commit local) | `reset --hard` et `push --force` : interdits sur les branches partagées |
| Mettre de côté | `git stash`, `git stash pop` | Pour changer de branche sans committer |
| Voir un changement | `git show <hash>`, `git blame <fichier>` | Qui a écrit cette ligne, et dans quel commit |
| Nettoyer | `git branch -d feat/...`, `git fetch --prune` | Après merge de la PR |

Fichiers de configuration du dépôt :

- `.gitignore` : `node_modules/`, `test-results/`, `playwright-report/`, `blob-report/`, `.auth/`, `.mcp-output/`, `secrets.env`, `.env`.
- `.gitattributes` : `* text=auto eol=lf` pour éviter les différences CRLF/LF entre Windows et Linux (CI) ; `*.png binary` pour les baselines visuelles.
- `.editorconfig` : indentation, fin de ligne.

### 1.4 Convention de commits

**Conventional Commits** : `type(portée): description` à l'impératif, 72 caractères maximum, corps optionnel, pied avec référence de ticket.

| Type | Usage QA |
|---|---|
| `test` | Ajout ou modification de tests |
| `fix` | Correction d'un test cassé ou d'un Page Object |
| `feat` | Nouvelle capacité de la suite (fixture, projet, reporter) |
| `refactor` | Restructuration sans changement de comportement (POM) |
| `chore` | Dépendances, config, CI |
| `docs` | README, journal, specs |
| `ci` | Pipeline |

Exemples :

```
test(virement): couvre les 7 cas de refus du CSV métier

Un test API par ligne de data/virements-invalides.csv, trois cas en UI.
Réf: AB#1234
```

- `AB#1234` lie le commit au work item Azure Boards.
- Un commit = une intention ; « corrections diverses » est interdit.

### 1.5 Stratégies de branches

| Stratégie | Principe | Pour | Contre |
|---|---|---|---|
| **Trunk-based avec branches courtes** (recommandée) | `main` toujours vert et déployable ; branches de quelques heures à quelques jours ; PR obligatoire ; feature flags pour le non fini | Intégration continue réelle, conflits rares, CI simple | Discipline : petites PR, tests rapides |
| **GitHub Flow** | Identique, sans flags, déploiement depuis `main` | Simple | Pas de gestion de versions multiples |

- Nommage : `test/<ticket>-<sujet>`, `fix/<ticket>-<sujet>`, `chore/<sujet>` ; minuscules, tirets.
- Durée de vie : une PR. Suppression après merge.

Tests et application : **même dépôt** (monorepo, comme la mini-banque) ou **dépôt séparé** ?

- Même dépôt : les tests évoluent avec l'application ; une PR contient le changement et son test ; la CI teste le bon couple.
- Dépôt séparé : équipes distinctes, mais désynchronisation fréquente.
- Recommandation : même dépôt quand c'est possible.

### 1.6 Azure Repos

- **Organisation > Projet > Dépôts** : un projet peut contenir plusieurs dépôts Git.
- **Authentification** : SSH (clé publique dans les paramètres utilisateur) ou HTTPS avec **Personal Access Token** (PAT, portée `Code (Read & Write)`, expiration courte, stocké par Git Credential Manager). Jamais de PAT dans un fichier du dépôt.
- **Interface** : Files, Commits, Branches, Tags, Pull requests ; comparaison de branches ; historique par fichier.
- **Liens Boards** : `AB#<id>` dans le message de commit ou de PR crée le lien avec le work item.
- **Branch policies** (M8.2) : protègent `main`.
- **Import** : un dépôt existant (GitHub, local) s'importe par « Import repository » ou par `git remote add azure <url>` puis `git push azure --all`.

Flux quotidien :

```powershell
git switch main
git pull --rebase
git switch -c test/1234-virement-plafond
# ... travail, npx playwright test ...
git add tests/ui/virement.spec.ts tests/data/virements-invalides.csv
git commit -m "test(virement): ajoute le cas plafond dépassé" -m "Réf: AB#1234"
git push -u origin test/1234-virement-plafond
# créer la PR dans Azure Repos (M8.2)
```

### 1.7 Bonnes pratiques

1. Petits commits, messages en convention, un ticket par branche.
2. `git status` et `git diff --staged` avant chaque commit ; `git add -p` pour ne committer que l'intention.
3. `pull --rebase` pour garder un historique local propre ; jamais de `push --force` sur une branche partagée.
4. `.gitignore` et `.gitattributes` dès le premier commit ; baselines PNG en `binary`.
5. Aucun secret dans l'historique : scan (gitleaks) en pre-commit et en CI ; un secret committé est compromis même après suppression.
6. Supprimer les branches mergées ; `fetch --prune`.

### 1.8 Erreurs fréquentes

| Erreur | Conséquence | Correction |
|---|---|---|
| `git add .` avec `test-results/` non ignoré | Rapports et traces dans le dépôt | `.gitignore`, `git rm -r --cached test-results` |
| Commit de `.auth/alice.json` | Jeton dans l'historique | Révoquer le jeton, `.gitignore`, réécrire l'historique seulement si la branche n'est pas partagée |
| `git pull` sans `--rebase` | Commits de merge parasites | `git config --global pull.rebase true` |
| Travail directement sur `main` | Impossible de faire une PR propre | `git switch -c`, `git stash` si besoin |
| `push --force` sur `main` | Perte de commits des autres | Branch policy interdisant le force push |
| Fins de ligne CRLF | Diffs entiers, tests différents entre Windows et CI | `.gitattributes`, `core.autocrlf=input` |
| Message « fix » | Historique inexploitable | Convention et hook `commit-msg` |

### 1.9 Bonus : mettre à jour sa branche par rebase, et hooks Git

Ce n'est pas indispensable pour le cycle de base (branche, commit, push, PR) mais c'est exercé en démo et en exercice :

- **`git rebase main`** (au lieu de `git merge main`) rejoue les commits de la branche sur le dernier `main` : historique linéaire, sans commit de fusion. À faire avant d'ouvrir ou de mettre à jour une PR, jamais sur une branche partagée par plusieurs personnes.
- **`git push --force-with-lease`** est le seul push forcé acceptable, et uniquement sur sa propre branche de PR après un rebase : il échoue (au lieu d'écraser) si quelqu'un d'autre a poussé sur cette branche entre-temps, contrairement à `--force`.
- **Hooks Git** (`.git/hooks/pre-commit`, `commit-msg`, installés localement, non versionnés par Git mais fournis en `demo/`) : le hook `pre-commit` lance lint et scan de secrets en quelques secondes (pas la suite complète) ; le hook `commit-msg` refuse un message hors convention.

### 1.10 Points à retenir

- Cycle : branche courte, commits en convention, `pull --rebase`, `push`, PR, suppression.
- Trunk-based : `main` toujours vert, protégé par policies.
- `.gitignore`, `.gitattributes`, scan de secrets : dès le premier commit.
- Azure Repos : PAT ou SSH, `AB#` pour les liens Boards.
- Bonus : rebase de branche et `--force-with-lease` avant PR, hooks locaux.

---

## 2. Démonstration

**Objectif** : initialiser proprement le dépôt du projet fil rouge (non encore versionné), créer le dépôt Azure Repos, pousser, puis dérouler le cycle branche, commit conventionnel, rebase, push, pièges compris (fichier ignoré oublié, `pull` sans rebase).

### Étapes

1. `cd fil-rouge`, `git init -b main`, `git status` : des centaines de fichiers, dont `node_modules` et `.auth`. Écrire `.gitignore` racine (fourni dans `demo/`) et `.gitattributes`. `git status` à nouveau.
2. `git add .`, `git commit -m "chore: import du projet fil rouge (mini-banque et tests Playwright)"`.
3. Azure DevOps : créer le projet `formation-playwright`, dépôt `mini-banque`, copier l'URL ; `git remote add origin <url>` ; `git push -u origin main` (authentification PAT via Git Credential Manager).
4. Cycle : `git switch -c test/42-plafond-virement`, modifier `tests/data/virements-invalides.csv` (ajouter une ligne), `git add -p`, `git commit -m "test(virement): ajoute le cas libellé trop long" -m "Réf: AB#42"`, `git push -u origin test/42-plafond-virement`. Vérifier la branche dans Azure Repos.
5. `git log --oneline --graph`, `git blame tests/data/virements-invalides.csv`.
6. **Bonus** — Piège : dans une seconde copie de travail (ou directement sur Azure Repos, édition en ligne du README), committer sur `main` ; revenir sur la branche, `git rebase main` : résultat linéaire, puis `git push --force-with-lease`.
7. **Bonus** — le hook pre-commit (`demo/pre-commit.sh`) qui lance `gitleaks` et `eslint` sur les fichiers indexés.

### Fichiers de la démo

`demo/.gitignore`, `demo/.gitattributes`, `demo/.editorconfig`, `demo/pre-commit.sh`, `demo/commit-msg.sh`, `demo/commandes.md` (toutes les commandes dans l'ordre).

### Résultat attendu

Un dépôt Azure Repos avec `main` (1 commit) et une branche de test, historique linéaire, aucun fichier généré ni secret versionné, hooks fonctionnels.

---

## 3. Exercice (20 minutes)

Voir `exercice.md`.

## 4. Correction

Voir `correction/`.

## 5. Contribution au projet fil rouge

**Ce qui est ajouté** :

- `.gitignore`, `.gitattributes`, `.editorconfig` à la racine de `fil-rouge/`.
- Hooks `pre-commit` (gitleaks + eslint sur les fichiers indexés) et `commit-msg` (convention), installés par `npm run hooks:install`.
- `eslint.config.js` avec `eslint-plugin-playwright` dans `frontend/`.
- Dépôt poussé dans votre organisation Azure DevOps.

**Lien avec la notion** :

- Le scan de secrets en pre-commit est la parade technique au risque n°2 de M7.4.
- La convention de commits alimente les KPIs de M10.1 (volume de `fix` sur les tests).

## Ressources externes

- Pro Git (livre, français) : https://git-scm.com/book/fr/v2
- Conventional Commits : https://www.conventionalcommits.org/fr/
- Azure Repos, démarrer : https://learn.microsoft.com/azure/devops/repos/git/
- PAT Azure DevOps : https://learn.microsoft.com/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate
- Trunk-based development : https://trunkbaseddevelopment.com
- gitleaks : https://github.com/gitleaks/gitleaks
- eslint-plugin-playwright : https://github.com/playwright-community/eslint-plugin-playwright
