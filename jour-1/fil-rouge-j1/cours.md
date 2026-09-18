# Fil rouge J1 — Mini-banque : 6 premiers tests

## Objectif de la séance

Appliquer sur une application locale tout ce qui a été vu dans la journée : installation et configuration (M1.1), locators et assertions web-first (M1.2), Codegen et trace (M2.1), iframe, shadow DOM, tags et anti-flaky (M2.2).

Livrable : le dossier `fil-rouge/frontend/tests` contient 6 tests verts, exécutables trois fois de suite sans échec.

## L'application au Jour 1

- Le code est fourni dans `fil-rouge/`. Vous ne le modifiez pas.
- Vous êtes QA : votre périmètre est `frontend/tests`.
- L'application est présentée en début de séance.

### Fonctionnalités

| Écran | Fonctionnalité | Notion Playwright visée |
|---|---|---|
| `/login` | Identification e-mail + mot de passe, puis code MFA (fixe : `123456`) | Formulaire en deux étapes, `getByLabel`, `getByRole('form')`, `test.step` |
| `/login` | Messages d'erreur (`role="alert"`) : identifiants incorrects, code invalide | `getByRole('alert')`, `toHaveText` |
| `/` | Tableau de bord : solde global dans un Web Component `<bank-balance>` (shadow DOM), tableau des comptes avec IBAN | Shadow DOM transparent, `data-testid` pour le masquage |
| `/virement` | Formulaire de virement, iframe « Conditions du virement » servie par l'API, bouton désactivé tant que la case de l'iframe n'est pas cochée | `contentFrame()`, `toBeDisabled` / `toBeEnabled`, `role="status"` |
| En-tête | Bouton « Se déconnecter », pages protégées redirigées vers `/login` | Effet de la déconnexion, `toHaveURL` |
| API | `POST /api/dev/reset` remet les données initiales sans fermer les sessions | Isolation des tests (règle anti-flaky n°2) |

### Architecture

```
fil-rouge/
├── docker-compose.yml         # front 5173, back 8000
├── backend/                   # FastAPI, données en mémoire (app/data.py, app/main.py)
└── frontend/                  # React 18 + Vite + TypeScript
    ├── src/
    │   ├── pages/             # LoginPage, DashboardPage, TransferPage
    │   ├── components/        # Layout (nav + déconnexion), BankBalance (Web Component)
    │   ├── api.ts             # appels HTTP
    │   └── auth.tsx           # contexte d'authentification (token en localStorage)
    ├── playwright.config.ts
    └── tests/                 # <- votre périmètre
```

### Choix de conception liés à la formation

- **HTML sémantique** : vrais `<label>`, `<button>`, `<form aria-label>`, `role="alert"` et `role="status"`. Les tests utilisent des locators de niveaux 1 à 3.
- **`data-testid`** uniquement sur `account-row`, `transaction-row`, `iban` : lignes de tableaux (sans nom accessible) et donnée à masquer.
- **Shadow DOM** : `<bank-balance>` expose `role="group"` et `aria-label` à l'intérieur de son shadow root. Un `getByRole('group', { name })` le trouve depuis la page.
- **Iframe cross-origin** : `/legal` est servie par le backend (port 8000) dans le front (port 5173). La case à cocher informe le parent par `postMessage`. C'est le fonctionnement réel d'un widget de consentement ou de paiement.
- **MFA à code fixe** : configurable par `MFA_CODE`. En production, on utiliserait un fournisseur SMS mocké (M4.2).
- **Reset sans déconnexion** : `reset_data()` conserve les sessions ; des tests parallèles connectés ne sont pas éjectés.

## Déroulé

| Durée | Étape |
|---|---|
| 5 min | `docker compose up --build -d`, vérifier http://localhost:5173 et http://localhost:8000/docs |
| 5 min | Tour de l'application, lecture de `playwright.config.ts` et de `tests/helpers.ts` |
| 35 min | Écriture des 6 tests (énoncé dans `exercice.md`) |
| 10 min | Correction collective, `--repeat-each 3`, revue des locators choisis |
| 5 min | Diagnostic d'un échec par la trace : un test passe au rouge, vous ouvrez la trace, lisez l'erreur et le snapshot, et concluez (régression ou changement légitime à répercuter) |

## Lien avec les modules du jour

| Module | Ce qui est appliqué dans le fil rouge |
|---|---|
| M1.1 | `playwright.config.ts` avec `baseURL` locale, `trace: 'retain-on-failure'`, un projet chromium, reporter html + list |
| M1.2 | Tous les locators sont par rôle, label ou texte ; `toHaveCount(0)` pour vérifier une absence ; regex pour les montants formatés |
| M2.1 | `test.step` sur le login MFA et le virement ; trace lue sur l'échec de fin de séance |
| M2.2 | `contentFrame()` sur l'iframe des conditions, shadow DOM du solde, tag `@smoke`, reset des données avant le test qui modifie l'état |
