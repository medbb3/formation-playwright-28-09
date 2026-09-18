# Grille de qualité d'un test généré (à remplir avant tout commit)

| # | Critère | Question | OK / KO / N.A. | Commentaire |
|---|---|---|---|---|
| 1 | Fidélité | Chaque étape Gherkin a son action, chaque « Alors » son assertion ; en-tête `// spec:` présent | | |
| 2 | Locators | Rôle / label / texte / test id uniquement ; `filter` pour les listes ; pas de `nth` gratuit, pas de CSS/XPath | | |
| 3 | Structure | Import depuis `@playwright/test` + helper de `support/connexion.ts` (`commeUtilisateurWorker`...) ; Page Objects et flow de virement ; pas de connexion réécrite | | |
| 4 | Attentes | Assertions web-first ; aucun `waitForTimeout`, `networkidle`, `force` | | |
| 5 | Données | Fictives, en constantes ou fabriques ; aucun secret ; valeurs de la spec respectées | | |
| 6 | Isolation | Le test crée son état, n'en laisse pas ; pas de dépendance à un autre test ; passe en `--repeat-each 2` | | |
| 7 | Sens | Si la fonctionnalité était cassée, le test échouerait-il ? (retirer mentalement chaque assertion) | | |
| 8 | Hallucination | Tout élément référencé existe ; toute étape impossible est en `fixme` documenté | | |

Verdict : accepté / accepté après correction / rejeté (régénérer). Relecteur, date, entrée du journal.
