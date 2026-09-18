# Variable group `mini-banque-tests` (Pipelines > Library)

| Variable | Secret | Valeur (formation) |
|---|---|---|
| ALICE_PASSWORD | oui | Alice123! |
| BOB_PASSWORD | oui | Bob123! |
| CAROL_PASSWORD | oui | Carol123! |
| API_URL | non | http://backend:8000 |

- « Pipeline permissions » : autoriser uniquement le pipeline `mini-banque`.
- Mention orale seulement : l'écran propose aussi « Link secrets from an Azure key vault as variables » (rotation centralisée, abonnement Azure requis) — une option pour la production, non utilisée en formation (pas d'abonnement) ; le variable group seul suffit pour l'exercice.
- Dans le YAML : `variables: - group: mini-banque-tests`, puis `env: { ALICE_PASSWORD: $(ALICE_PASSWORD) }` sur le step qui en a besoin.
- Les tests lisent `process.env.ALICE_PASSWORD ?? (valeur de data.ts en local)` : en formation, les mots de passe de la mini-banque sont publics ; le mécanisme est ce qui compte.
