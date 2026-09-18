# Exercice M4.1 — CRUD complet et token sur Restful-Booker

**Difficulté** : moyenne
**Durée** : 30 minutes
**API** : https://restful-booker.herokuapp.com (documentation : https://restful-booker.herokuapp.com/apidoc/index.html)

## Objectif

Écrire une suite de tests API purs : cycle de vie d'une réservation, erreurs, et authentification par token nécessaire aux modifications.

## Contexte

- API de réservation d'hôtel faite pour s'entraîner.
- Elle **persiste** les données (contrairement à ReqRes).
- Publique et partagée : d'autres personnes créent et suppriment des réservations en même temps que vous.

Règles :

- `POST /auth` avec `{ "username": "admin", "password": "password123" }` renvoie `{ "token": "..." }`.
- `PUT`, `PATCH` et `DELETE /booking/{id}` exigent un en-tête `Cookie: token=<token>` (ou `Authorization: Basic YWRtaW46cGFzc3dvcmQxMjM=`).
- `POST /booking` est libre et renvoie `{ "bookingid": 123, "booking": {...} }`.
- `DELETE` renvoie **201** (bizarrerie documentée de cette API) et un `GET` ensuite renvoie 404.

## Énoncé

### Configuration

Projet `api` sans navigateur, `baseURL` sur Restful-Booker, en-tête `Accept: application/json`.

### `utils/types.ts`

Types `Booking` (`firstname`, `lastname`, `totalprice`, `depositpaid`, `bookingdates: { checkin, checkout }`, `additionalneeds?`) et `BookingCreated` (`bookingid`, `booking`).

### `support/api.ts`

Aucun `test.extend` : deux fonctions explicites, appelées par les tests qui en ont besoin (même style que `fil-rouge/frontend/tests/support/connexion.ts`).

1. `tokenAdmin(playwright, baseURL, testInfo)` : appelle `POST /auth` une seule fois par worker (une `Map` au niveau du module, indexée par `testInfo.parallelIndex`, mémorise la promesse), retourne la chaîne.
2. `avecReservation(request, testInfo, token, run)` : crée une réservation avec un prénom unique (`QA-${Date.now()}-${testInfo.parallelIndex}`), appelle `run({ id, data })`, puis la **supprime** dans un `finally` avec le token (teardown). La suppression ne fait pas échouer le test si la réservation a déjà été supprimée par le test lui-même.

### Tests (`tests/booking.api.spec.ts`)

1. **Création** : `POST /booking` avec un corps valide renvoie 200, un `bookingid` numérique, et un `booking` égal au corps envoyé (`toEqual`).
2. **Lecture** : avec `avecReservation`, `GET /booking/{id}` renvoie 200 et `toMatchObject` sur prénom, nom et `totalprice`.
3. **Recherche par nom** : `GET /booking?firstname=<prénom unique>` renvoie un tableau contenant un objet `{ bookingid: id }`.
4. **Mise à jour interdite sans token** : `PUT /booking/{id}` sans en-tête renvoie 403.
5. **Mise à jour partielle** : `PATCH /booking/{id}` avec le token et `{ totalprice: 999 }` renvoie 200 et le nouveau prix ; un `GET` confirme.
6. **Suppression** : `DELETE` avec le token renvoie 201, puis `GET` renvoie 404. Utiliser `avecReservation` : le teardown devra gérer la double suppression.
7. **Cycle de vie complet** en un seul test à 4 `test.step` (Create, Read, Update, Delete), **sans** passer par `avecReservation`.

## Consignes

- Aucun identifiant de réservation en dur : tout est créé par le test ou par `avecReservation`.
- Le token n'apparaît qu'à un seul endroit : `tokenAdmin`.
- Typer les réponses avec `utils/types.ts`.
- L'API est parfois lente au premier appel (réveil du serveur) : `timeout` à 30 s dans `use` si nécessaire, mais aucun délai fixe.

## Résultat attendu

```
Running 7 tests using N workers
  7 passed
```

Bonus : validez la forme d'une réservation avec `zod` (`npm i -D zod`) : un schéma `BookingSchema` et `BookingSchema.parse(body)` dans le test de lecture.
