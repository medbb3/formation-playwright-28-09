# SPEC-SD-01 — Parcours de commande (SauceDemo)

**Application** : https://www.saucedemo.com (site public de démonstration)
**Version** : 1.2 — **Auteur** : PO fictif — **Statut** : validée

## Contexte

Un client connecté choisit des produits, les place dans le panier, renseigne ses informations de livraison et confirme la commande. Le site propose plusieurs profils utilisateurs de test ; seul `standard_user` est dans le périmètre de cette spécification.

## Règles métier

- RM-1 : le badge du panier affiche le nombre d'articles ; il disparaît quand le panier est vide.
- RM-2 : les trois champs de livraison (prénom, nom, code postal) sont obligatoires.
- RM-3 : le récapitulatif affiche le sous-total (`Item total`), la taxe (`Tax`) et le total (`Total`) = sous-total + taxe.
- RM-4 : la confirmation affiche « Thank you for your order! » et un bouton « Back Home » qui vide le panier.

## Critères d'acceptation

```gherkin
Fonctionnalité: Commande d'articles

  Contexte:
    Étant donné que je suis connecté en tant que "standard_user"

  Scénario: CA-1 Ajouter un article met à jour le badge
    Quand j'ajoute "Sauce Labs Backpack" au panier
    Alors le badge du panier affiche "1"
    Et le bouton du produit devient "Remove"

  Scénario: CA-2 Retirer le dernier article vide le badge
    Étant donné que "Sauce Labs Bike Light" est dans le panier
    Quand je retire "Sauce Labs Bike Light" depuis le panier
    Alors le panier ne contient aucun article
    Et le badge du panier n'est pas affiché

  Plan du scénario: CA-3 Les informations de livraison sont obligatoires
    Étant donné que "Sauce Labs Onesie" est dans le panier
    Et que je suis sur l'étape des informations de livraison
    Quand je renseigne le prénom "<prenom>", le nom "<nom>" et le code postal "<cp>"
    Et que je continue
    Alors le message d'erreur "<erreur>" est affiché

    Exemples:
      | prenom | nom    | cp    | erreur                     |
      |        | Martin | 75001 | Error: First Name is required |
      | Alice  |        | 75001 | Error: Last Name is required  |
      | Alice  | Martin |       | Error: Postal Code is required |

  Scénario: CA-4 Le total est la somme du sous-total et de la taxe
    Étant donné que "Sauce Labs Backpack" et "Sauce Labs Bike Light" sont dans le panier
    Et que j'ai renseigné des informations de livraison valides
    Alors le sous-total affiché est "$39.98"
    Et le total affiché est égal au sous-total plus la taxe affichée

  Scénario: CA-5 La confirmation vide le panier
    Étant donné que j'ai finalisé une commande
    Alors le message "Thank you for your order!" est affiché
    Quand je clique sur "Back Home"
    Alors je suis sur le catalogue
    Et le badge du panier n'est pas affiché
```

## Hors périmètre

- Les profils `locked_out_user`, `problem_user`, `performance_glitch_user`, `error_user`, `visual_user`.
- Le tri du catalogue.

## Questions ouvertes

- Q1 : le montant de la taxe est-il un pourcentage fixe ? (non précisé : le test ne doit pas coder 8 %)
