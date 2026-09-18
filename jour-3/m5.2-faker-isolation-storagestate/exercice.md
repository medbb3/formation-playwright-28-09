# Exercice M5.2 — Compte généré, session durable et deux rôles sur Demoblaze

**Difficulté** : difficile
**Durée** : 35 minutes
**Site** : https://www.demoblaze.com

## Objectif

Créer un compte avec des données Faker dans un projet de setup, sauvegarder la session, écrire des tests qui démarrent connectés, un test non connecté, et un test à deux contextes.

## Contexte

- Inscription : « Sign up » (nom d'utilisateur + mot de passe), confirmation par une alerte « Sign up successful. ».
- Connexion : « Log in », alerte en cas d'erreur, puis « Welcome <nom> » dans la barre de navigation.
- Session stockée dans `localStorage` (clé `tokenp_<nom>`) et un cookie : `storageState` capture les deux.

## Énoncé

### 1. Fabrique et graine (`utils/factories.ts`)

- `unCompte()` retourne `{ username, password }`.
- Nom d'utilisateur `qa_<mot>_<nombre>` généré avec Faker, unique à chaque run : n'utilisez **pas** de graine pour le nom, le site refuse les doublons avec « This user already exist. ».
- Mot de passe : `faker.internet.password({ length: 12 })`.
- Écrivez le compte généré dans `.auth/compte.json` pour que les tests puissent l'afficher.

### 2. Setup (`tests/auth.setup.ts`)

Un projet `setup` avec un test qui :

- génère un compte ;
- s'inscrit (gérer l'alerte et vérifier son message) ;
- se connecte et vérifie « Welcome <username> » ;
- sauvegarde `.auth/user.json` et `.auth/compte.json`.

### 3. Projet `connecte` dépendant de `setup`, `storageState: '.auth/user.json'`

- `tests/session.spec.ts` : aller sur `/`, vérifier « Welcome <username> » sans aucune action de login (lire le nom dans `.auth/compte.json`).
- `tests/deux-contextes.spec.ts` : le contexte connecté ajoute « Nexus 6 » au panier ; un second contexte **vierge** (`browser.newContext()` sans storageState) ouvre le panier et le trouve vide ; le fermer.

### 4. Test non connecté (`tests/login-errors.spec.ts`)

- Désactiver le storageState.
- Un login avec un mot de passe faux déclenche une alerte contenant « Wrong password. » et « Welcome » n'apparaît pas.

### 5. Données Faker dans un formulaire (`tests/commande.spec.ts`, projet `connecte`)

- Avec `faker.seed(7)`, générer nom, pays, ville, carte (`faker.finance.creditCardNumber()`), mois, année.
- Passer une commande de « Nexus 6 ».
- Vérifier la confirmation « Thank you for your purchase! » et que le récapitulatif contient le nom généré.
- Annoter le test avec les données.

## Consignes

- Les alertes se gèrent avec `waitForEvent('dialog')` enregistré **avant** le clic.
- `.auth/` dans `.gitignore`.
- Le nom d'utilisateur ne doit jamais être en dur dans un test : il vient du fichier écrit par le setup.
- Si le site est lent, augmentez `expect.timeout` à 10 s dans la config plutôt que d'ajouter des attentes.

## Résultat attendu

```
[setup] › auth.setup.ts › inscription et connexion du compte généré
[connecte] › session.spec.ts › ...
[connecte] › deux-contextes.spec.ts › ...
[connecte] › commande.spec.ts › ...
[connecte] › login-errors.spec.ts › ...
  5 passed
```

Question de réflexion : le compte créé reste sur le site. Quelle stratégie d'isolation (1, 2 ou 3) avez-vous appliquée, et que faudrait-il pour la rendre propre ?
