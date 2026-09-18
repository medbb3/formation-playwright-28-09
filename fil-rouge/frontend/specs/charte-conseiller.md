# Charte d'exploration — Vue conseiller (mini-banque)

- **Mission** : confronter le comportement de l'application, avec le rôle conseiller (Carol Petit), aux règles RM-1 à RM-4 de SPEC-MB-06.
- **Périmètre** : tableau de bord (section comptes, opérations), écran de virement, page bénéficiaires.
- **Hors périmètre** : authentification, cours de change, télémétrie.
- **Compte** : `carol@bank.test`, session fournie par `--storage-state .auth/real/carol.json` (mot de passe jamais saisi dans le chat).
- **Interdits** : aucune suppression ; aucun virement sauf 1 € depuis un compte dont le solde dépasse 1 000 € ; aucune saisie de données personnelles réelles.
- **Budget** : 20 minutes, 40 actions.
- **Livrables** : observations numérotées (écran, action, résultat), écarts avec RM-1 à RM-4, questions PO, critères Gherkin proposés pour RM-1 à RM-3.
