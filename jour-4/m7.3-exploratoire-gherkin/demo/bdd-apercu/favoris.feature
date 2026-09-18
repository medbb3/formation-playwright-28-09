# language: fr
Fonctionnalité: Favoris

  Scénario: Ajouter un favori depuis une fiche produit
    Étant donné que je suis connecté en tant que client
    Quand j'ouvre la fiche du produit "Combination Pliers"
    Et que je clique sur "Add to favourites"
    Alors la page "My favorites" liste "Combination Pliers"
