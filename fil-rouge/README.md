# Mini-banque — projet fil rouge de la formation Playwright

Application volontairement simple : connexion avec code MFA, tableau de bord des comptes, virement.

| Composant | Techno | Port |
|---|---|---|
| Frontend | React 18 + Vite + TypeScript | 5173 |
| Backend | FastAPI (données en mémoire) | 8000 |
| Tests | Playwright, dans `frontend/tests` | |

## Démarrage avec Docker (recommandé en formation)

```powershell
docker compose up --build -d
# Front : http://localhost:5173   API (Swagger) : http://localhost:8000/docs
docker compose logs -f
docker compose down
```

## Démarrage sans Docker

```powershell
# Terminal 1 : backend
cd backend
python -m venv .venv ; .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Terminal 2 : frontend
cd frontend
npm install
npm run dev
```

## Comptes de test

| Utilisateur | E-mail | Mot de passe | Rôle |
|---|---|---|---|
| Alice Martin | alice@bank.test | Alice123! | client (2 comptes) |
| Bob Durand | bob@bank.test | Bob123! | client (1 compte, solde faible) |
| Carol Petit | carol@bank.test | Carol123! | conseiller (voit tous les comptes) |

Code MFA : **123456** (variable d'environnement `MFA_CODE`).

## Endpoints utiles

- `POST /api/auth/login`, `POST /api/auth/mfa`, `POST /api/auth/logout`, `GET /api/me`
- `GET /api/accounts`, `GET /api/accounts/{id}/transactions`, `POST /api/transfers`
- `GET/POST /api/beneficiaries`, `GET/PUT/DELETE /api/beneficiaries/{id}` (Jour 2)
- `GET /api/accounts/{id}/statement.csv` : relevé CSV en pièce jointe (M6.3)
- `POST /api/beneficiaries/import` : import multipart d'un CSV « nom;iban », 100 Ko maximum (M6.3)
- `GET /api/rates` : cours de change simulés (Jour 2, cible du mocking)
- `POST /api/analytics/event` : télémétrie (Jour 2, à bloquer dans les tests)
- `GET /legal` : page HTML embarquée en iframe sur l'écran de virement
- `POST /api/dev/users`, `DELETE /api/dev/users/{id}` : utilisateur de test jetable avec un compte (Jour 3, un utilisateur par worker)
- `POST /api/dev/reset` : remet les données à l'état initial (utilisé par les tests)
- `GET /api/health`

## Lancer les tests Playwright

```powershell
cd frontend
npm install
npx playwright install chromium
```

Projets Playwright (voir `frontend/playwright.config.ts`) :

| Commande | Projets | Ce qu'il faut démarrer |
|---|---|---|
| `npm run test:real` | `setup-real` + `chromium` (UI, backend réel) + `api` | `docker compose up -d` |
| `npm run test:mock` | `setup-mock` + `mocked` (UI, backend simulé) | **Rien** : le front est lancé par `webServer` |
| `npm run test:visuel` | `visuel` (captures, backend simulé, viewport 1280x720) | Rien |
| `npm run test:mobile` | `mobile` (smoke en émulation Pixel 5, backend simulé) | Rien |
| `npm run test:a11y` | tests tagués `@a11y` (dans les projets UI) | Selon le projet |
| `npm run test:api` | `api` seulement | Docker |

- **Authentification** : `tests/auth.setup.ts` produit `.auth/<backend>/<rôle>.json` (Alice, Bob, Carol) par l'API, sans écran de login. Le helper `commeRole` (`tests/support/connexion.ts`) ouvre un contexte avec ce fichier.
- **Isolation** : `commeUtilisateurWorker` fournit un utilisateur jetable **par worker** (`POST /api/dev/users`, mémorisé le temps du worker). Les tests qui modifient des données l'utilisent : aucun reset, aucune collision.
- **Mode `mocked`** : `tests/mocks/fake-backend.ts` reproduit le contrat de l'API en mémoire ; le faux backend accepte les jetons `mock-token-<id>`.
- **Données** : `tests/utils/factories.ts` (Faker, locale fr), `tests/data/virements-invalides.csv` + `tests/utils/data.ts` (csv-parse).
- **Visuel** : baselines dans `tests/visuel/__screenshots__/visuel/<plateforme>/` ; `npm run test:update-snapshots` après revue.
- **Accessibilité** : `tests/utils/a11y.ts` (axe, WCAG 2.2 AA), tests dans `tests/ui/a11y/`.
- **Fichiers, onglets et temps (M6.3)** : export CSV du relevé (bouton du tableau de bord), import de bénéficiaires par un bouton masquant son `input file`, lien « Conditions » en nouvel onglet sur l'écran de virement, et bandeau d'expiration de session (5 minutes, alerte à une minute) piloté par `page.clock` dans `tests/ui/session.spec.ts`. Tests : `tests/ui/fichiers.spec.ts` et `tests/ui/session.spec.ts`.
- **Agents IA (Jour 4)** : `.vscode/mcp.json` (serveurs `playwright` et `playwright-test`, versions épinglées, origines locales, secrets via `secrets.env`), `.github/copilot-instructions.md`, agents `.github/agents/` (planner, generator, healer) et prompts `.github/prompts/` (`/generer-ca`, `/gherkin-vers-test`, `/explorer`), `tests/seed.spec.ts`, specs dans `specs/`, tests générés relus dans `tests/ui/generes/`, `JOURNAL-GENERATION.md`, `GRILLE-QUALITE.md`, `POLICY-IA.md`.

Variables : `BASE_URL` (front, défaut http://localhost:5173), `API_URL` (back, défaut http://localhost:8000).
