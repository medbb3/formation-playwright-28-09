# Suite Playwright mini-banque — semaine 36

## En un coup d'œil
| Réussite main | Flakiness | PR P90 |
|---|---|---|
| 97 % (▲ +2) | 1,4 % (▼ 0,6) | 8 min |

## Ce qui a été trouvé
- QA-51 : le conseiller peut initier un virement (SPEC-MB-06 RM-4) — en attente de décision PO.
- BUG-207 : aucun message quand le fournisseur de cours est en panne sur l'écran conseiller — corrigé, test mock ajouté.
- BUG-211 : le libellé de 80 caractères est refusé (limite à 79 côté front) — ouvert.

## Tests instables (âge)
- `tableau-de-bord › les cours de change réels sont affichés` (3 j) : latence du backend Docker au premier appel → QA-58, correction : assertion sur la liste plutôt que sur le compteur.

## Évolution de la suite
+7 tests (5 générés via MCP et relus, 2 conseiller), 2 critères non couverts : SPEC-MB-04 CA-1, CA-4 (sprint 12).

## Décisions attendues
- PO : confirmer RM-4.
- DSI : lier le variable group à Key Vault.
