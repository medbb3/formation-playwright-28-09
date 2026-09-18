# Commandes de la démo M8.1

```powershell
cd fil-rouge
git init -b main
git status | Select-Object -First 20          # node_modules, .auth... apparaissent
Copy-Item ..\jour-5\m8.1-git-azure-repos\demo\.gitignore .
Copy-Item ..\jour-5\m8.1-git-azure-repos\demo\.gitattributes .
Copy-Item ..\jour-5\m8.1-git-azure-repos\demo\.editorconfig .
git status                                     # propre
git add .
git commit -m "chore: import du projet fil rouge (mini-banque et tests Playwright)"

# Azure DevOps : Repos > New repository "mini-banque" (sans README), copier l'URL HTTPS
git remote add origin https://dev.azure.com/<org>/formation-playwright/_git/mini-banque
git push -u origin main                        # PAT demandé par Git Credential Manager

git switch -c test/42-plafond-virement
# éditer frontend/tests/data/virements-invalides.csv
git add -p
git commit -m "test(virement): ajoute le cas libellé trop long" -m "Réf: AB#42"
git push -u origin test/42-plafond-virement

# Simuler un commit sur main (édition du README en ligne dans Azure Repos), puis :
git fetch
git rebase origin/main
git push --force-with-lease

git log --oneline --graph -10
git blame frontend/tests/data/virements-invalides.csv

# Hooks
Copy-Item ..\jour-5\m8.1-git-azure-repos\demo\pre-commit.sh .git\hooks\pre-commit
Copy-Item ..\jour-5\m8.1-git-azure-repos\demo\commit-msg.sh .git\hooks\commit-msg
git commit -m "fix" --allow-empty              # refusé par commit-msg
```
