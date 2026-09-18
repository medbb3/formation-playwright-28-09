# Usage des agents IA sur ce projet (résumé de la policy)

1. Outils : GitHub Copilot (VS Code, CLI) et les serveurs MCP de `.vscode/mcp.json` uniquement (versions épinglées). Modèle : celui déclaré dans les agents.
2. Environnement atteignable par l'agent : l'application locale (`localhost:5173`, `localhost:8000`) ou le mode mock. Rien d'autre.
3. Données : fabriques Faker, comptes jetables (`commeUtilisateurWorker`), secrets via `secrets.env` (MCP) et `.auth/` ; jamais dans un prompt ni dans le code.
4. Agents : `.github/agents/` avec outils restreints ; confirmation manuelle des écritures ; interdits listés dans `copilot-instructions.md`.
5. Revue : grille `GRILLE-QUALITE.md`, second relecteur en PR, le testeur est l'auteur du commit ; healer sans changement de valeur attendue ni affaiblissement.
6. Traçabilité : `JOURNAL-GENERATION.md`, sessions sauvegardées dans `.mcp-output/`, mention dans la PR.
7. Incident (secret ou donnée envoyée à un modèle, action destructive) : déclaration immédiate au QA Lead et au RSSI, rotation, analyse.
