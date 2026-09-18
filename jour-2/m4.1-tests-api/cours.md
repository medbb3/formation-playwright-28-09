# M4.1 — Tests API purs avec Playwright

## 1. Cours théorique

### 1.1 Pourquoi tester l'API avec Playwright ?

- Un test end-to-end passe par l'interface : lent, sensible au HTML, difficile à diagnostiquer.
- Une grande partie des règles métier (calculs, validations, droits) vit dans l'API : plus vite et plus précisément testée à ce niveau.
- Pyramide de tests : les tests API se placent entre unitaires et UI.

Playwright inclut un client HTTP, `APIRequestContext`, avec trois usages :

| Usage | Exemple | Module |
|---|---|---|
| **Tests API purs** : aucun navigateur | Vérifier qu'un `POST /transfers` refuse un montant négatif | M4.1 |
| **Préparer ou nettoyer l'état** d'un test UI | Créer un bénéficiaire via l'API, puis tester son affichage | M4.1, J3 |
| **Vérifier un effet** d'une action UI | Après un virement à l'écran, lire le solde via `GET /accounts` | M4.1 |

Même outil, même rapport, même CI pour UI et API : l'argument principal face à Postman ou REST Assured dans une équipe QA.

### 1.2 `APIRequestContext` : trois façons de l'obtenir

```ts
// 1. La fixture `request` : un contexte neuf par test, configuré par `use.baseURL` et `use.extraHTTPHeaders`
test('liste', async ({ request }) => {
  const res = await request.get('/api/users?page=2');
});

// 2. Depuis une page : partage les cookies du contexte navigateur (session UI réutilisée)
const res = await page.request.get('/api/me');

// 3. Créé à la main : configuration propre, utile pour une fixture worker ou un autre domaine
const api = await playwright.request.newContext({
  baseURL: 'https://api.exemple.com',
  extraHTTPHeaders: { Authorization: `Bearer ${token}` },
});
await api.dispose();   // à ne pas oublier
```

- Méthodes : `get`, `post`, `put`, `patch`, `delete`, `head`, `fetch(url, { method })`.
- Options communes : `data` (corps JSON, sérialisé automatiquement), `form` (formulaire url-encoded), `multipart` (upload), `headers`, `params` (query string), `timeout`, `failOnStatusCode`, `ignoreHTTPSErrors`, `maxRedirects`.

```ts
const res = await request.post('/api/users', {
  data: { name: 'Alice', job: 'QA' },          // Content-Type: application/json ajouté
  headers: { 'x-api-key': 'reqres-free-v1' },
  params: { verbose: 1 },                      // ?verbose=1
});
```

### 1.3 Lire une réponse

```ts
res.status();          // 201
res.ok();              // true si 200-299
res.statusText();
res.headers();         // objet clé/valeur (clés en minuscules)
res.headersArray();
await res.json();      // corps parsé (any) : typer avec `as`
await res.text();
await res.body();      // Buffer
res.url();
```

Assertions :

```ts
expect(res.status()).toBe(201);
expect(res.ok()).toBeTruthy();
await expect(res).toBeOK();                      // assertion dédiée, message d'erreur avec le corps
const body = await res.json();
expect(body).toHaveProperty('id');
expect(body).toMatchObject({ name: 'Alice', job: 'QA' });   // sous-ensemble
expect(body.data).toHaveLength(6);
expect(body.data[0]).toEqual(expect.objectContaining({ id: expect.any(Number), email: expect.stringContaining('@') }));
```

- `toMatchObject` et `expect.objectContaining` vérifient un sous-ensemble : un champ ajouté par l'API ne casse pas le test.
- `toEqual` exige l'égalité exacte : réservé aux réponses entièrement maîtrisées.

### 1.4 Un CRUD complet : le scénario standard

Deux formes complémentaires :

- **Tests indépendants** par règle (validation d'un champ, code d'erreur, droits) : chacun crée ce dont il a besoin.
- **Un test de cycle de vie** en `test.step` : Create, Read, Update, Delete, puis Read qui renvoie 404. Un seul test : les étapes dépendent les unes des autres.
- Alternative acceptable : `test.describe.configure({ mode: 'serial' })` sur plusieurs tests ; mais un échec saute les suivants et le rapport est moins lisible.

```ts
test('cycle de vie d\'un utilisateur', async ({ request }) => {
  let id: number;

  await test.step('Create', async () => {
    const res = await request.post('/api/users', { data: { name: 'Alice', job: 'QA' } });
    expect(res.status()).toBe(201);
    id = (await res.json()).id;
  });

  await test.step('Read', async () => { ... });
  await test.step('Update', async () => { ... });
  await test.step('Delete', async () => { ... });
});
```

### 1.5 Authentification par token

Schéma le plus courant : `POST /auth/login` renvoie un token, envoyé ensuite dans `Authorization: Bearer <token>`.

Trois niveaux d'intégration, du plus simple au plus réutilisable :

```ts
// a. Dans le test : simple, mais répété
const login = await request.post('/api/login', { data: { email, password } });
const { token } = await login.json();
const me = await request.get('/api/me', { headers: { Authorization: `Bearer ${token}` } });

// b. Helper explicite : un contexte authentifié, construit à la demande par le test qui en a besoin
export async function avecAuthRequest<T>(playwright, baseURL: string, run: (ctx: APIRequestContext) => Promise<T>) {
  const anon = await playwright.request.newContext({ baseURL });
  const login = await anon.post('/api/login', { data: CREDENTIALS });
  const { token } = await login.json();
  await anon.dispose();
  const ctx = await playwright.request.newContext({ baseURL, extraHTTPHeaders: { Authorization: `Bearer ${token}` } });
  try { return await run(ctx); } finally { await ctx.dispose(); }
}
// dans le test :
await avecAuthRequest(playwright, baseURL, async (authRequest) => {
  const res = await authRequest.get('/api/me');
  await expect(res).toBeOK();
});

// c. Token mémorisé par worker : une Map au niveau du module, indexée par testInfo.parallelIndex
// (chaque worker Playwright est un process Node distinct, la Map se comporte déjà comme une
// portée « worker », sans mécanisme de fixture) — un token obtenu une seule fois, réutilisé par
// tous les tests de ce worker. Voir §2 et la correction.
```

Le token peut aussi être stocké avec `storageState` (M5.2) et partagé entre tests UI et API.

Cas à tester systématiquement :

- sans token (401) ;
- token invalide (401) ;
- token valide mais ressource d'un autre utilisateur (403 ou 404 selon la politique) ;
- token expiré, si l'API le gère.

### 1.6 Typage des réponses

Sans typage, `await res.json()` est `any` : plus d'autocomplétion, une faute de nom de champ passe inaperçue jusqu'à l'exécution.

```ts
// utils/types.ts
export type User = { id: number; email: string; first_name: string; last_name: string; avatar: string };
export type Page<T> = { page: number; per_page: number; total: number; total_pages: number; data: T[] };

// dans le test
const body = (await res.json()) as Page<User>;
expect(body.data[0].first_name).toBeTruthy();   // autocomplété
```

Pour valider la **forme** complète d'une réponse (contrat) :

- librairie de schéma : `zod` (`schema.parse(body)` lève une erreur détaillée) ou `ajv` avec un JSON Schema exporté de l'OpenAPI ;
- en formation : `toMatchObject` et `expect.objectContaining`, exemple `zod` en bonus dans la correction.

### 1.7 Organisation des tests API dans le projet

```
tests/
├── api/
│   ├── users.api.spec.ts
│   └── auth.api.spec.ts
└── ui/
playwright.config.ts :
projects: [
  { name: 'api', testMatch: /.*\.api\.spec\.ts/, use: { baseURL: 'https://api.exemple.com' } },
  { name: 'chromium', testIgnore: /.*\.api\.spec\.ts/, use: { ...devices['Desktop Chrome'] } },
]
```

- Projet `api` sans navigateur : les tests ne demandent pas `page`, aucun navigateur n'est lancé.
- `--project=api` répond en quelques secondes : idéal en pré-commit ou en première étape de pipeline (J5).

### 1.8 Bonnes pratiques

1. Tester le statut **et** le corps ; les messages d'erreur font partie du contrat.
2. `toMatchObject` / `objectContaining` par défaut ; `toEqual` seulement sur des structures figées.
3. Chaque test crée ses données avec un identifiant unique (`Date.now()`, `workerIndex`) et les supprime après (`finally` du test, ou d'un helper comme `avecReservation` qui encapsule un `try`/`finally`).
4. Jamais de dépendance à un enregistrement « qui existe toujours » sur une API partagée : il finira par disparaître.
5. Typer les réponses ; centraliser types et URL dans `utils/`.
6. Secrets hors du code : `process.env.API_TOKEN`, `.env` ignoré par git, variable de pipeline (M9.2).
7. Le projet `api` tourne en premier en CI : API cassée, inutile de lancer 200 tests UI.

### 1.9 Erreurs fréquentes

| Erreur | Cause | Correction |
|---|---|---|
| `res.json()` sans `await` | Promise non résolue | `await` |
| `expect(res.status).toBe(200)` | `status` est une méthode | `res.status()` |
| `data` envoyé comme chaîne JSON `JSON.stringify(...)` | Double encodage, l'API reçoit une chaîne | Passer l'objet, Playwright sérialise |
| 415 Unsupported Media Type | En-tête `Content-Type` manquant avec `fetch` brut | Utiliser `data`, ou fixer l'en-tête |
| Test qui passe alors que l'API renvoie 500 | Pas d'assertion sur le statut | `expect(res).toBeOK()` ou `expect(res.status()).toBe(...)` |
| Token en dur dans le code | Fuite dans git | Variable d'environnement |
| Contexte `newContext()` jamais `dispose()` | Fuite de ressources, warning en fin de run | `dispose()` dans le teardown |
| `baseURL` de l'UI utilisée pour l'API | 404 ou HTML au lieu de JSON | Projet `api` avec sa propre `baseURL` |

### 1.10 Points à retenir

- `request` (fixture), `page.request` (partage la session UI), `playwright.request.newContext()` (sur mesure).
- Statut + corps, `toMatchObject`, réponses typées.
- Cycle de vie CRUD en `test.step`, règles isolées en tests indépendants.
- Token : helper explicite qui construit un contexte authentifié, mémorisé par worker (`Map` indexée par `testInfo.parallelIndex`) pour la performance.
- Projet `api` sans navigateur, exécuté en premier.

---

## 2. Démonstration

**Objectif** : sur ReqRes, tests API purs dans un projet `api` sans navigateur : lecture paginée typée, cycle CRUD en `test.step`, validation d'erreur (400), authentification par token avec un helper explicite.

**API** : https://reqres.in (documentation https://reqres.in/api-docs).

- Depuis 2025, en-tête `x-api-key: reqres-free-v1` obligatoire sur les appels gratuits.
- Les écritures ne sont pas persistées : le `GET` après un `POST` ne renvoie pas l'objet créé. Limite d'une API de démonstration.

### Étapes

1. `playwright.config.ts` : projet `api` seul, `baseURL: 'https://reqres.in'`, `extraHTTPHeaders` avec la clé. `npx playwright test` : aucun navigateur, 2 secondes.
2. Test 1 : `GET /api/users?page=2` ; statut, pagination, `objectContaining` sur le premier utilisateur, typage `Page<User>`.
3. Test 2 : cycle CRUD `POST` / `GET` / `PUT` / `DELETE` en étapes. Le rapport montre les 4 étapes. Read lit l'utilisateur 2 : ReqRes ne persiste pas.
4. Test 3 : `POST /api/register` sans mot de passe renvoie 400 avec `error: 'Missing password'`.
5. Test 4 : helper `avecAuthRequest` dans `support/api.ts` : `POST /api/login`, puis contexte portant le token, passé à un callback `run`. Limite : ReqRes n'a pas de ressource protégée et rejette tout en-tête `Authorization` (lu comme clé d'API) ; le helper met donc le token dans un en-tête neutre. Sur une API réelle : `Authorization: Bearer`. L'exercice Restful-Booker a une vraie protection (403 sans token).
6. Faire échouer volontairement une assertion de corps : le rapport affiche le diff JSON.

### Code complet

Voir `demo/`. Extrait : `tests/users.api.spec.ts`

```ts
import { test, expect } from '@playwright/test';
import type { Page, User } from '../utils/types';

test('la liste des utilisateurs est paginée', async ({ request }) => {
  const res = await request.get('/api/users', { params: { page: 2 } });

  await expect(res).toBeOK();
  const body = (await res.json()) as Page<User>;
  expect(body).toMatchObject({ page: 2, per_page: 6 });
  expect(body.data).toHaveLength(6);
  expect(body.data[0]).toEqual(
    expect.objectContaining({ id: expect.any(Number), email: expect.stringMatching(/@reqres\.in$/) }),
  );
});

test('cycle de vie CRUD d\'un utilisateur', async ({ request }) => {
  let id = '';

  await test.step('Create', async () => {
    const res = await request.post('/api/users', { data: { name: 'Alice', job: 'QA' } });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body).toMatchObject({ name: 'Alice', job: 'QA' });
    expect(body).toHaveProperty('createdAt');
    id = body.id;
  });

  await test.step('Read (ReqRes ne persiste pas : on lit un utilisateur de référence)', async () => {
    const res = await request.get('/api/users/2');
    await expect(res).toBeOK();
    expect((await res.json()).data).toMatchObject({ id: 2, first_name: 'Janet' });
  });

  await test.step('Update', async () => {
    const res = await request.put(`/api/users/${id}`, { data: { name: 'Alice', job: 'Lead QA' } });
    await expect(res).toBeOK();
    expect(await res.json()).toMatchObject({ job: 'Lead QA' });
  });

  await test.step('Delete', async () => {
    const res = await request.delete(`/api/users/${id}`);
    expect(res.status()).toBe(204);
  });
});
```

### Explication du code

- `params: { page: 2 }` construit la query string ; `data` sérialise en JSON.
- `toBeOK()` échoue avec un message contenant le statut et le début du corps : plus lisible que `expect(res.ok()).toBe(true)`.
- `expect.stringMatching` et `expect.any` sont des **matchers asymétriques** : à utiliser dans `objectContaining`, `toEqual`, `toMatchObject`.
- `id` est partagé entre les étapes : l'intérêt de `test.step` face à des tests séparés.

### Résultat attendu

```
Running 6 tests using 1 worker
  6 passed (2.1s)
```

- Aucune fenêtre de navigateur.
- Le rapport montre, par test, les requêtes en étapes (`apiRequestContext.get`, etc.) avec leur durée.

---

## 3. Exercice (30 minutes)

Voir `exercice.md`.

## 4. Correction

Voir `correction/`.

## 5. Contribution au projet fil rouge

**Ce qui change dans l'application** (séance fil rouge) : le backend reçoit une ressource **bénéficiaires** en CRUD complet, propre à chaque utilisateur :

- `GET /api/beneficiaries`, `POST /api/beneficiaries` (`name`, `iban`, 201, 422 si IBAN invalide ou doublon), `PUT /api/beneficiaries/{id}`, `DELETE /api/beneficiaries/{id}` (204, 404 si inconnu ou appartenant à un autre utilisateur).
- Le front reçoit une page **Bénéficiaires** (liste, ajout, suppression) ; le formulaire de virement propose un bénéficiaire enregistré.

**Tests Playwright du fil rouge** :

- Un projet `api` dans `playwright.config.ts` (baseURL http://localhost:8000).
- Un helper explicite `apiCommeAlice(playwright, testInfo)` (login + MFA via l'API), mémorisé par worker dans `support/connexion.ts`.
- Deux tests API : cycle de vie d'un bénéficiaire ; règles d'accès (Bob ne peut ni voir ni supprimer un bénéficiaire d'Alice, virement refusé si solde insuffisant).

**Lien avec la notion** : le même helper `apiLogin` préparera l'état des tests UI (créer un bénéficiaire avant de tester le virement à l'écran) : usage n°2 du tableau de la section 1.1.

## Ressources externes

- API testing : https://playwright.dev/docs/api-testing
- Classe APIRequestContext : https://playwright.dev/docs/api/class-apirequestcontext
- Classe APIResponse : https://playwright.dev/docs/api/class-apiresponse
- Assertions (matchers asymétriques) : https://playwright.dev/docs/api/class-genericassertions
- ReqRes : https://reqres.in
- Restful-Booker (exercice) : https://restful-booker.herokuapp.com/apidoc/index.html
- Zod : https://zod.dev
