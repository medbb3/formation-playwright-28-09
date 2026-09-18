# Definition of Done — volet tests automatisés (mini-banque)

Une fonctionnalité est « Done » quand le relecteur de la PR a vérifié :

1. Chaque critère d'acceptation validé a au moins un test (`// spec: ... CA-n`) ou un `test.fixme()` lié à un ticket.
2. Les tests sont dans la PR de la fonctionnalité, relus avec `docs/CHECKLIST-REVUE-QA.md`, verts en PR et sur `main`.
3. Aucun nouveau test instable (`--repeat-each 2` passé ; gate stabilité PR à 0).
4. Les tests critiques du parcours sont tagués `@smoke` ; le pipeline de PR reste sous 10 minutes.
5. Écran nouveau ou modifié : scan axe sans violation critical/serious ; baseline visuelle validée si l'écran est dans le périmètre visuel.
6. Données synthétiques, aucun secret ; si génération par agent : `JOURNAL-GENERATION.md` et grille remplis, mention dans la PR.
7. La couverture des critères (`scripts/coverage-criteres.mjs`) est à jour ; le rapport hebdomadaire suivant la reflète.
