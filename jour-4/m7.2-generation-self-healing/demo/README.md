# Démo M7.2 — Génération et self-healing

```powershell
npm install
npx playwright install chromium
npm run agents:init          # agents + prompts Playwright, serveur playwright-test dans mcp.json
npx playwright test --project=standard   # état initial : commande.spec.ts vert, casse/* rouges
```

Dans VS Code, Copilot Chat, mode Agent :

1. Agent `playwright-test-generator`, commande `/generer-ca` → critere `CA-1`, spec `specs/SPEC-SD-01-commande.md`.
2. Relire `tests/generes/ca-1.spec.ts` avec la grille ; reprendre le `beforeEach` du seed si nécessaire ; `npx playwright test generes`.
3. Agent `playwright-test-healer`, commande `/playwright-test-heal` (ou : « Lance les tests du dossier tests/casse et répare ceux qui échouent »).
4. Lire le diff de `tests/casse/panier.spec.ts` (locators seulement) et refuser la modification de `prix.spec.ts`.
