# Exercice M7.3 — Explorer la vue conseiller, écrire et convertir les critères manquants

**Difficulté** : difficile
**Durée** : 30 minutes
**Application** : mini-banque (`docker compose up -d`), rôle conseiller (Carol)
**Spécification** : `jour-4/00-specs-fictives/SPEC-MB-06-conseiller.md` (règles sans critères d'acceptation)

## Partie A — Session exploratoire assistée (15 min)

1. Rédigez `specs/charte-conseiller.md` :
   - mission : confronter RM-1 à RM-4 au comportement réel ;
   - périmètre : tableau de bord, opérations, virement, bénéficiaires ;
   - interdits : aucune suppression ; virement autorisé uniquement de 1 € depuis un compte de plus de 1 000 € ;
   - compte `carol@bank.test` via `--storage-state .auth/real/carol.json` (ou seed sur `asCarol`) ;
   - 20 minutes ; livrables.
2. Adaptez le prompt `/explorer` à cette charte et lancez la session. Intervenez au moins une fois pour orienter l'agent vers RM-4 (accès à l'écran de virement).
3. Triez le livrable dans `EXPLORATION-CONSEILLER.md` : pour chaque observation, votre verdict (défaut / question / conforme) et, pour les défauts, un titre de ticket.

## Partie B — Critères et conversion (15 min)

4. Rédigez dans `specs/SPEC-MB-06-conseiller.md` (copie locale) les critères CA-1 à CA-3 en Gherkin pour RM-1 à RM-3 : réutilisez les propositions de l'agent en les corrigeant (phrases métier, un comportement par scénario). Pour RM-4, écrivez CA-4 tel que la règle le décrit, marqué « à confirmer par le PO ».
5. Convertissez CA-1 et CA-3 en tests avec `/gherkin-vers-test`, agent generator, seed sur `asCarol`. Relisez avec la grille, lancez.
6. Soumettez CA-4 au generator. Attendu : l'agent constate que le conseiller **accède** à l'écran de virement et produit un `test.fixme()` ou un test en échec. Décidez quoi committer et pourquoi ; notez-le dans le journal.

## Consignes

- Mode réel avec le compte de Carol : respectez les interdits de la charte (l'agent aussi).
- Aucun test généré sans exécution préalable par l'agent, aucun commit sans grille.
- Les critères Gherkin ne contiennent aucun locator ni identifiant technique.

## Résultat attendu

- `charte-conseiller.md`.
- `EXPLORATION-CONSEILLER.md` : observations triées, au moins un écart (RM-4).
- `SPEC-MB-06-conseiller.md` complétée.
- Deux tests verts dans `tests/generes/`.
- Un `fixme` documenté pour CA-4.
- Journal à jour.
