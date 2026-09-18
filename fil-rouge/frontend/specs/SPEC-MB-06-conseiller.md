# SPEC-MB-06 — Vue conseiller (Mini-banque)

**Application** : mini-banque, tableau de bord avec le rôle `advisor`
**Statut** : validée, **critères d'acceptation non rédigés** (le PO n'a livré que les règles)

## Règles métier

- RM-1 : un conseiller (Carol Petit) voit la section « Comptes de tous les clients » avec une colonne « Client ».
- RM-2 : un client ne voit pas cette colonne et voit « Mes comptes ».
- RM-3 : le conseiller peut consulter les opérations de n'importe quel compte.
- RM-4 : le conseiller n'a pas accès à l'écran de virement ? (à confirmer, non implémenté : aujourd'hui il y accède)

## Usage pédagogique

Cette spec sert au **testing exploratoire assisté** (M7.3) : l'agent explore l'application avec le rôle conseiller, propose des scénarios, relève l'écart entre RM-4 et le comportement réel, et rédige les critères d'acceptation manquants en Gherkin pour validation par le PO.
