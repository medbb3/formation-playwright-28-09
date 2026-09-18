# SPEC-MB-03 — Virement (Mini-banque)

**Application** : mini-banque, écran `/virement`
**Version** : 2.0 — **Statut** : validée

## Contexte

Un client connecté effectue un virement depuis un de ses comptes vers un IBAN saisi ou un bénéficiaire enregistré. Le virement exige l'acceptation des conditions, présentées dans un cadre embarqué.

## Règles métier

- RM-1 : le bouton « Valider le virement » est désactivé tant que la case « J'accepte les conditions » (dans le cadre) n'est pas cochée.
- RM-2 : montant strictement positif, plafond 10 000 € par opération.
- RM-3 : IBAN français (FR + 25 caractères, espaces ignorés) ; sinon « IBAN invalide ».
- RM-4 : libellé obligatoire, 80 caractères maximum.
- RM-5 : en cas de solde insuffisant, message « Solde insuffisant », aucune opération créée.
- RM-6 : après un virement réussi, un message de statut indique « Virement effectué. Nouveau solde : <montant> ».
- RM-7 : choisir un bénéficiaire enregistré remplit automatiquement l'IBAN.

## Critères d'acceptation

```gherkin
Fonctionnalité: Virement

  Contexte:
    Étant donné que je suis connecté en tant que client disposant d'un compte courant crédité de 500,00 €

  Scénario: CA-1 Le virement exige l'acceptation des conditions
    Étant donné que je suis sur l'écran de virement
    Et que j'ai saisi l'IBAN "FR76 9999 0000 0000 0000 0000 001", le montant "20" et le libellé "Remboursement"
    Alors le bouton "Valider le virement" est désactivé
    Quand je coche "J'accepte les conditions" dans le cadre des conditions
    Alors le bouton "Valider le virement" est activé

  Scénario: CA-2 Virement réussi
    Étant donné que j'ai rempli un virement valide de 20,00 € et accepté les conditions
    Quand je valide le virement
    Alors le message de statut contient "Virement effectué"
    Et le message de statut contient "480,00 €"

  Scénario: CA-3 Solde insuffisant
    Quand je valide un virement de 9 999,00 € vers un IBAN valide, conditions acceptées
    Alors le message d'alerte est "Solde insuffisant"
    Et aucun message de statut n'est affiché

  Scénario: CA-4 IBAN étranger refusé
    Quand je valide un virement de 10,00 € vers "DE89 3704 0044 0532 0130 00", conditions acceptées
    Alors le message d'alerte est "IBAN invalide"

  Scénario: CA-5 Bénéficiaire enregistré
    Étant donné que j'ai un bénéficiaire "Loyer Agence Immo" avec l'IBAN "FR76 2000 2000 0100 0000 0000 123"
    Quand je choisis le bénéficiaire "Loyer Agence Immo"
    Alors le champ IBAN contient "FR76 2000 2000 0100 0000 0000 123"
```

## Hors périmètre

- Virement programmé (voir SPEC-MB-05, non livrée).
- Virement instantané, virement international.

## Questions ouvertes

- Q1 : que doit afficher l'écran si le fournisseur de cours de change est indisponible ? (non lié au virement, à traiter dans SPEC tableau de bord)
