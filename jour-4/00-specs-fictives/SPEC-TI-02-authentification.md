# SPEC-TI-02 — Authentification (The Internet)

**Application** : https://the-internet.herokuapp.com/login
**Statut** : validée

## Règles métier

- RM-1 : identifiants valides : `tomsmith` / `SuperSecretPassword!`.
- RM-2 : après connexion, la zone sécurisée affiche « Secure Area » et un message flash de succès.
- RM-3 : un mauvais mot de passe affiche « Your password is invalid! », un mauvais utilisateur « Your username is invalid! ».
- RM-4 : le bouton Logout ramène à la page de connexion avec « You logged out of the secure area! ».

## Critères d'acceptation

```gherkin
Fonctionnalité: Connexion à la zone sécurisée

  Scénario: CA-1 Connexion réussie
    Étant donné que je suis sur la page de connexion
    Quand je me connecte avec "tomsmith" et "SuperSecretPassword!"
    Alors je vois le titre "Secure Area"
    Et le message "You logged into a secure area!" est affiché

  Scénario: CA-2 Mot de passe invalide
    Quand je me connecte avec "tomsmith" et "faux"
    Alors le message "Your password is invalid!" est affiché
    Et je reste sur la page de connexion

  Scénario: CA-3 Déconnexion
    Étant donné que je suis connecté
    Quand je clique sur "Logout"
    Alors le message "You logged out of the secure area!" est affiché
```

## Note pour le lab de self-healing

Un test existant (`tests/login.spec.ts` dans le matériel M7.2) a été écrit sur une version antérieure du site où le bouton s'appelait « Sign in » et où le message était dans `#message`. Il échoue aujourd'hui. Mission : le réparer **sans changer son intention**.
