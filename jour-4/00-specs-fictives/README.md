# Spécifications fictives — matériel d'entrée du Jour 4

Ces documents imitent ce qu'une équipe QA reçoit réellement : une spécification fonctionnelle rédigée par un Product Owner, avec des critères d'acceptation en Gherkin, parfois incomplets ou ambigus. Ils servent d'**entrée** aux prompts de génération (M7.2), d'exploration (M7.3) et à l'atelier d'encadrement (M7.4).

| Fichier | Application | Usage |
|---|---|---|
| `SPEC-SD-01-commande.md` | SauceDemo (public) | M7.2 : génération depuis un prompt, exercice |
| `SPEC-TI-02-authentification.md` | The Internet (public) | M7.2 : self-healing (locator cassé) |
| `SPEC-MB-03-virement.md` | Mini-banque | Fil rouge J4 : 5 tests générés |
| `SPEC-MB-04-beneficiaires.md` | Mini-banque | Fil rouge J4 |
| `SPEC-MB-05-virement-programme.md` | Mini-banque, **fonctionnalité non implémentée** | M7.3 / fil rouge : l'agent ne doit pas inventer |
| `SPEC-MB-06-conseiller.md` | Mini-banque | M7.3 : exploratoire assisté |

Conventions :

- identifiant `SPEC-<app>-<n°>` ;
- critères `CA-<n°>` en Gherkin français (`Étant donné / Quand / Alors`) ;
- sections « Hors périmètre » et « Questions ouvertes » volontairement présentes : un bon agent (et un bon testeur) les relève au lieu de les deviner.

**Aucune donnée réelle** : comptes, IBAN, noms et montants sont fictifs (voir M7.4, règle n°1 du contexte bancaire).
