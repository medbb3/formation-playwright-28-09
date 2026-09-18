# Branch policies `main` — réglages de référence (Azure Repos > Branches > main > Branch policies)

| Policy | Réglage |
|---|---|
| Require a minimum number of reviewers | On ; 1 ; Allow requestors to approve their own changes : **off** ; Prohibit the most recent pusher from approving their own changes : **on** ; When new changes are pushed : Reset all approval votes |
| Check for linked work items | On, Required |
| Check for comment resolution | On, Required |
| Limit merge types | On ; Squash merge : **on** ; Basic merge, Rebase and fast-forward, Rebase with merge commit : off |
| Build validation | (M9.1) Pipeline `mini-banque-pr` ; Trigger : Automatic ; Policy requirement : Required ; Build expiration : Immediately when main is updated ; Path filter : `/frontend/*;/backend/*;/azure-pipelines*.yml` |
| Automatically included reviewers | Groupe `[formation-playwright]\QA` sur `/frontend/tests/*` (Required) ; QA lead sur `/frontend/playwright.config.ts;/azure-pipelines*.yml;/frontend/tests/ui/generes/*` (Required) |
| Bypass policies | Aucun utilisateur ; le groupe Project Administrators uniquement, avec justification dans la PR |

Permissions de branche `main` : Force push (rewrite history, delete branches and tags) : **Deny** pour tous ; Delete : Deny.
