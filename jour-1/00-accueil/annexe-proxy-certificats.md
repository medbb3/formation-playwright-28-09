# Annexe — Playwright dans un environnement d'entreprise

- Les TP de la semaine tournent sur des sites publics et sur la mini-banque locale.
- Sur les applications internes, quatre obstacles reviennent systématiquement.
- Ils se règlent tous par des **options de contexte** ou de lancement, jamais par du code dans les tests.

| Obstacle | Réponse | Où la déclarer |
|---|---|---|
| Le site interne demande une authentification HTTP (fenêtre du navigateur, pas un formulaire) | `httpCredentials: { username, password }` | `use` de la config, ou `test.use` pour un fichier |
| Certificat auto-signé de la préproduction : `net::ERR_CERT_AUTHORITY_INVALID` | `ignoreHTTPSErrors: true` | `use` de la config, limité au projet concerné |
| Proxy d'entreprise obligatoire pour sortir | `proxy: { server: 'http://proxy:8080', bypass: 'localhost,.interne.fr', username, password }` | `use` de la config ; variables `HTTPS_PROXY` / `NO_PROXY` pour l'installation des navigateurs |
| L'application exige un certificat client (authentification forte) | `clientCertificates: [{ origin, certPath, keyPath, passphrase }]` (depuis 1.46) | `use` de la config |

```ts
export default defineConfig({
  use: {
    baseURL: process.env.BASE_URL,
    httpCredentials: process.env.APP_USER
      ? { username: process.env.APP_USER, password: process.env.APP_PASS! }
      : undefined,
    ignoreHTTPSErrors: process.env.ENV === 'recette',
  },
});
```

Trois compléments utiles :

- **Navigateur du poste de référence.** Si l'entreprise impose Edge ou Chrome installé plutôt que le Chromium livré avec Playwright : `use: { channel: 'msedge' }` (ou `'chrome'`). Le navigateur doit alors être installé sur la machine et sur l'agent de CI. C'est aussi la seule façon de tester les fonctionnalités propres à Edge.
- **Installation derrière un proxy** : `npm config set proxy`, et `HTTPS_PROXY` positionné avant `npx playwright install`. Si le téléchargement des navigateurs est bloqué, l'image Docker `mcr.microsoft.com/playwright` (J5) contourne le problème.
- **Ne jamais mettre d'identifiants en dur** : tout passe par `process.env`, alimenté par un fichier `.env` local ignoré par git et par un variable group en CI (J5, M9.2).

Ces options sont hors programme, mais elles font gagner la première journée de retour au poste : notez-les maintenant.
