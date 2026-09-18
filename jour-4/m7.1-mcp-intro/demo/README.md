# Démo M7.1 — Playwright MCP dans VS Code

## Préparation

```powershell
npm install
npx playwright install chromium
copy secrets.env.example secrets.env
code .
```

Dans VS Code : ouvrir `.vscode/mcp.json`, cliquer **Start** au-dessus de `playwright`. Ouvrir Copilot Chat, choisir le mode **Agent**.

## Prompts de la démo

1. `Ouvre https://www.saucedemo.com, connecte-toi avec l'utilisateur standard_user et le secret SAUCE_PASSWORD, puis liste les six produits du catalogue avec leur prix dans un tableau.`
2. `Sans écrire de code, explique comment tu ciblerais de façon robuste le bouton "Add to cart" du produit "Sauce Labs Backpack", en respectant les instructions du projet.`
3. `Ferme le navigateur.`

## Agents de test Playwright

```powershell
npm run agents:init
```

Fichiers créés : `.github/agents/playwright-test-{planner,generator,healer}.agent.md`, `.github/prompts/playwright-test-*.prompt.md`, `specs/`, `seed.spec.ts`, et le serveur `playwright-test` dans `mcp.json`.

## Playwright CLI (sans modèle)

```powershell
npx playwright-cli open https://www.saucedemo.com
npx playwright-cli snapshot
npx playwright-cli fill <ref-du-champ-username> standard_user
npx playwright-cli close
```

## CLI Copilot

```powershell
npm install -g @github/copilot
copilot
/mcp add        # nom : playwright, type : stdio, commande : npx @playwright/mcp@latest --isolated
```

Puis rejouer le prompt 1.
