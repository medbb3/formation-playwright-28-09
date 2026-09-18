# SPEC-MB-04 — Bénéficiaires (Mini-banque)

**Application** : mini-banque, écran `/beneficiaires`
**Statut** : validée

## Règles métier

- RM-1 : un bénéficiaire = nom (2 à 60 caractères) + IBAN français.
- RM-2 : pas de doublon d'IBAN pour un même client : « Ce bénéficiaire existe déjà ».
- RM-3 : IBAN non français : « IBAN invalide (attendu : FR + 25 caractères) ».
- RM-4 : après ajout, message « Bénéficiaire « <nom> » ajouté » et formulaire vidé.
- RM-5 : chaque ligne a un bouton « Supprimer <nom> » ; après suppression, message « Bénéficiaire « <nom> » supprimé ».
- RM-6 : un client ne voit que ses propres bénéficiaires.

## Critères d'acceptation

```gherkin
Fonctionnalité: Gestion des bénéficiaires

  Contexte:
    Étant donné que je suis connecté en tant que nouveau client sans bénéficiaire

  Scénario: CA-1 Liste vide
    Quand j'ouvre la page des bénéficiaires
    Alors le message "Aucun bénéficiaire." est affiché

  Scénario: CA-2 Ajout
    Quand j'ajoute le bénéficiaire "Caisse des écoles" avec l'IBAN "FR76 3000 3000 0300 0000 0000 003"
    Alors le message de statut est "Bénéficiaire « Caisse des écoles » ajouté"
    Et la liste contient "Caisse des écoles"
    Et le champ Nom est vide

  Scénario: CA-3 Doublon
    Étant donné que le bénéficiaire "Caisse des écoles" existe avec l'IBAN "FR76 3000 3000 0300 0000 0000 003"
    Quand j'ajoute un bénéficiaire "Autre nom" avec le même IBAN
    Alors le message d'alerte est "Ce bénéficiaire existe déjà"

  Scénario: CA-4 Suppression
    Étant donné que le bénéficiaire "Caisse des écoles" existe
    Quand je supprime "Caisse des écoles"
    Alors le message de statut est "Bénéficiaire « Caisse des écoles » supprimé"
    Et la liste ne contient plus "Caisse des écoles"
```
