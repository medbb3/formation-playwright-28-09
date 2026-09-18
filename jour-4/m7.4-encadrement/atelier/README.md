# Atelier de rédaction — Policy d'usage des agents IA pour les tests (35 minutes, solo)

## Cas

**Banque Fictive Régionale (BFR)** : 2 000 collaborateurs, DSI de 300 personnes, équipe QA de 12 testeurs sur 4 squads (banque en ligne, crédit, épargne, back-office).

- Licences GitHub Copilot Business déployées ; MCP désactivé par défaut par l'administrateur ; demande d'activation en cours.
- Environnements : DEV (données synthétiques), RECETTE (copie de production **pseudonymisée** : noms remplacés, IBAN réels conservés « pour les tests de virement »), PRÉPROD (copie de prod), PROD.
- Dépôts sur Azure DevOps ; pipelines Azure Pipelines (J5).
- Incident récent : un développeur a collé un jeton d'API dans un chat d'assistant grand public.
- Le RSSI exige : aucune donnée client vers un fournisseur externe, traçabilité, revue humaine.
- Le métier veut : des tests plus vite, une couverture des règles de virement, et pouvoir relire les scénarios.

## Consigne

Ouvrez `POLICY-A-COMPLETER.md` : c'est le squelette d'une policy de deux pages, avec la structure et les phrases fixes déjà en place. Chaque `[À COMPLÉTER: ...]` est une décision ou une règle que vous devez rédiger à partir du cas BFR et du cours (§1.1 à §1.5). Ne réécrivez pas ce qui est déjà rédigé ; complétez uniquement les blancs, en une phrase ou une ligne de tableau à chaque fois.

Points à ne pas manquer (chaque `[À COMPLÉTER]` du fichier y correspond) :

- environnements que l'agent peut atteindre, et en particulier ce que fait la policy de RECETTE tant que les IBAN réels y subsistent ;
- serveurs MCP et configuration (versions, `mcp.json`) ;
- agents et outils autorisés par agent (planner / generator / healer) ;
- fourniture des secrets (mécanisme technique, pas une simple consigne) ;
- ce qui est revu, par qui, avant quoi ;
- ce qui est journalisé ;
- conduite en cas d'incident ;
- les 3 décisions techniques immédiates et les 2 demandes en fin de document.

## Mise en commun (10 minutes)

Présentez un blanc que vous avez rempli avec certitude et un blanc où vous avez hésité, puis comparez votre `POLICY-A-COMPLETER.md` rempli avec `correction/POLICY-EXEMPLE.md` (la version de référence, entièrement rédigée).
