# Démo M7.3 — Exploratoire assisté et Gherkin

Prérequis : `.vscode/mcp.json` avec le serveur `playwright` limité à `https://practicesoftwaretesting.com;https://api.practicesoftwaretesting.com` et `--secrets secrets.env` (`PST_PASSWORD=welcome01`).

## Prompts

1. Exploration : commande `/explorer` (prompt `.github/prompts/explorer.prompt.md`).
2. Interruption pendant la session : `Reviens sur la fiche du produit et essaie d'ajouter deux fois le même produit aux favoris. Que se passe-t-il ?`
3. Conversion : `/gherkin-vers-test` avec le scénario :

```gherkin
Scénario: Ajouter un favori depuis une fiche produit
  Étant donné que je suis connecté en tant que client
  Quand j'ouvre la fiche du produit "Combination Pliers"
  Et que je clique sur "Add to favourites"
  Alors la page "My favorites" liste "Combination Pliers"
```

## Bonus : aperçu playwright-bdd (non exécuté, hors parcours principal)

`bdd-apercu/favoris.feature` et `bdd-apercu/favoris.steps.ts` montrent la forme des définitions de pas si l'équipe choisit un jour le Gherkin exécutable. Le parcours enseigné dans ce module reste le Gherkin comme spécification (§1.4 du cours).
