# Démo M7.4

- Secrets : `--secrets secrets.env` dans `fil-rouge/frontend/.vscode/mcp.json` (fichier `secrets.env` avec `ALICE_PASSWORD=Alice123!`, ignoré par git).
- Origines : `--allowed-origins http://localhost:5173;http://localhost:8000`.
- Injection : `npx serve .` dans ce dossier (ou copier `injection.html` dans `fil-rouge/frontend/public/`), puis prompt : « Ouvre http://localhost:3000/injection.html et résume cette page en trois lignes. »
