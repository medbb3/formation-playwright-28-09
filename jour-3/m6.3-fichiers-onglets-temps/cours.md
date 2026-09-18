# M6.3 — Fichiers, onglets et maîtrise du temps

Ce module est **transversal** : il ne dépend que des acquis du Jour 1 (locators, assertions, événements) et du Jour 2 (POM, fixtures). Sa place dans la semaine est annoncée en séance.

## 1. Cours théorique

### 1.1 Pourquoi ces trois sujets ensemble

Un test fonctionne tant que l'action et son effet restent dans la page. Quatre situations en sortent, toutes présentes dans une application bancaire :

- l'effet est un **fichier** qui quitte le navigateur (relevé PDF, export CSV d'opérations, RIB) ;
- l'effet est un fichier qui **entre** dans l'application (justificatif de domicile, pièce d'identité, import de bénéficiaires) ;
- l'effet est **ailleurs** : un nouvel onglet (conditions générales, page 3-D Secure de la banque émettrice) ;
- l'effet dépend du **temps** : expiration de session, virement programmé, date de valeur.

Playwright traite les trois premiers par des **événements** (`download`, `filechooser`, `popup`) et le quatrième par une **horloge contrôlable** (`page.clock`). Point commun : on s'abonne **avant** de déclencher, comme pour les dialogues natifs (M2.1).

### 1.2 Téléchargements

Le téléchargement est un événement de la page. Trois lignes, dans le bon ordre :

```ts
const telechargementPromis = page.waitForEvent('download');   // 1. s'abonner
await page.getByRole('link', { name: 'Relevé de janvier' }).click();   // 2. déclencher
const telechargement = await telechargementPromis;            // 3. récupérer
```

Erreur classique : `await page.waitForEvent('download')` **après** le clic. L'événement est déjà passé, le test attend jusqu'au timeout.

L'objet `Download` expose :

| Méthode | Ce qu'elle donne | Attend la fin du transfert ? |
|---|---|---|
| `suggestedFilename()` | Le nom proposé par le serveur (`Content-Disposition`) ou déduit de l'URL | Non |
| `url()` | L'URL téléchargée | Non |
| `path()` | Le chemin du fichier temporaire géré par Playwright | **Oui** |
| `saveAs(chemin)` | Déplace le fichier à l'endroit voulu (crée les dossiers) | **Oui** |
| `createReadStream()` | Un flux Node pour lire le contenu sans passer par un chemin | **Oui** |
| `failure()` | `null` si tout va bien, sinon le message d'erreur | Oui |
| `cancel()` | Annule le transfert (test d'un gros export interrompu) | — |
| `delete()` | Supprime le fichier temporaire | — |

Configuration :

- `acceptDownloads` vaut `true` par défaut depuis la 1.20 ; à `false`, sert à vérifier qu'un téléchargement est **refusé**.
- Fichiers temporaires supprimés à la fermeture du contexte : ce qu'on garde, on le `saveAs` et on le nettoie soi-même.
- Preuve dans le rapport plutôt qu'un fichier sur le disque : `await testInfo.attach('releve.pdf', { path })`. Visible dans le rapport HTML et les artefacts de CI (J5).

**Que vérifier ?**

- Le nom, puis le **contenu**, pas seulement l'existence.
- Export CSV : lecture et comparaison ligne à ligne.
- PDF : a minima taille et signature (`%PDF`) ; le texte si l'équipe accepte une dépendance d'extraction.
- `expect(fs.existsSync(chemin)).toBe(true)` seul passe avec un fichier vide ou une page d'erreur HTML.

**Téléchargement protégé** (authentification HTTP ou cookie, fréquent en banque) : le cookie vient de `storageState` (M5.2) ; l'authentification HTTP se déclare au **contexte** :

```ts
test.use({ httpCredentials: { username: process.env.DOC_USER!, password: process.env.DOC_PASS! } });
```

Options de contexte du même registre, à connaître pour un intranet : `ignoreHTTPSErrors` (certificat interne auto-signé), `proxy` (proxy d'entreprise), `clientCertificates` (certificat client, depuis la 1.46), et `channel: 'msedge'` dans la config si le poste de référence est sous Edge.

### 1.3 Upload de fichiers

Deux cas, selon que l'`<input type="file">` est atteignable ou non.

**Cas 1 — l'input existe et est atteignable** : `setInputFiles`, trois formes.

```ts
await page.getByLabel('Justificatif').setInputFiles('fixtures/rib.pdf');          // depuis le disque
await page.getByLabel('Justificatif').setInputFiles(['a.pdf', 'b.pdf']);          // plusieurs (input multiple)
await page.getByLabel('Import').setInputFiles({                                    // fabriqué en mémoire
  name: 'beneficiaires.csv',
  mimeType: 'text/csv',
  buffer: Buffer.from('beneficiaire;iban\nAlice;FR76...\n', 'utf-8'),
});
await page.getByLabel('Justificatif').setInputFiles([]);                           // vider la sélection
```

- Forme **en mémoire** à privilégier : rien à versionner, donnée visible dans le test, générable avec Faker (M5.2).
- Fixture sur le disque seulement pour un vrai binaire (PDF, image) dont le contenu compte.
- Input caché par CSS : pas de problème, `setInputFiles` n'exige pas la visibilité, contrairement à `click`.

**Cas 2 — pas d'input à cibler** (bouton stylé, glisser-déposer, composant maison) : on intercepte l'ouverture du sélecteur de fichiers.

```ts
const selecteurPromis = page.waitForEvent('filechooser');
await page.getByRole('button', { name: 'Joindre un justificatif' }).click();
const selecteur = await selecteurPromis;
expect(selecteur.isMultiple()).toBe(false);
await selecteur.setFiles({ name: 'rib.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4') });
```

**À tester au-delà du chemin nominal** (là où les applications bancaires se trompent) : refus d'une extension interdite, dépassement de taille, message sans fichier sélectionné, comportement pendant l'envoi (barre de progression, bouton désactivé).

### 1.4 Nouveaux onglets et fenêtres

- **Pas** de `switchTo()` en Playwright.
- Un nouvel onglet est un objet `Page` de plus dans le contexte ; les deux existent en parallèle, chacun avec ses locators.

```ts
const ongletPromis = page.waitForEvent('popup');     // l'onglet est ouvert PAR cette page
await page.getByRole('link', { name: 'Conditions générales' }).click();
const onglet = await ongletPromis;
await onglet.waitForLoadState();
await expect(onglet.getByRole('heading', { name: 'Conditions générales' })).toBeVisible();
await onglet.close();
```

- `context.waitForEvent('page')` : écoute **toutes** les nouvelles pages du contexte, quelle que soit leur origine (iframe, worker, page inconnue).
- `context.pages()` : la liste à tout moment, pour vérifier qu'aucun onglet parasite n'a été ouvert.

Trois pièges :

1. **`waitForLoadState()` est nécessaire** : à l'arrivée de l'événement, l'onglet peut être encore sur `about:blank`. Une assertion web-first absorbe le décalage, pas `onglet.url()`.
2. **Fermer l'onglet** en fin de test : un onglet ouvert fausse `context.pages()` du test suivant si le contexte est partagé, et alourdit la trace.
3. **Faut-il vraiment l'ouvrir ?** Site tiers (CGU hébergées ailleurs, page 3-D Secure d'un partenaire) : attendre le chargement de l'onglet rend le test dépendant d'un service non maîtrisé. Deux options plus légères : vérifier les attributs `href` et `target` du lien sans cliquer, ou récupérer le popup avec `waitForEvent('popup')` comme d'habitude puis lire seulement son `url()` avant de le refermer, sans `waitForLoadState()`. Même logique qu'en M4.2 : on ne teste pas le tiers, on teste que notre application l'appelle correctement.

### 1.5 Maîtriser le temps : `page.clock`

- Sans outil, ce qui dépend de l'heure est lent ou instable : expiration de session au bout de 15 minutes, message « virement programmé pour demain », date de valeur, badge « nouveau » pendant 24 h.
- `page.clock` (stable depuis la 1.45) remplace `Date`, `setTimeout` et `setInterval` **dans le navigateur** par des versions pilotées par le test.

| Appel | Effet |
|---|---|
| `clock.install({ time })` | Installe l'horloge simulée, positionnée à `time`. Elle continue d'avancer au rythme réel tant qu'on ne la met pas en pause |
| `clock.setFixedTime(time)` | `Date.now()` renvoie toujours `time`. Les timers, eux, continuent : idéal pour figer une date **affichée** |
| `clock.pauseAt(time)` | Saute jusqu'à `time` **puis arrête** l'horloge : l'interface est figée, plus aucune dérive |
| `clock.runFor(duree)` | Déroule la durée demandée en déclenchant **tous** les timers rencontrés |
| `clock.fastForward(duree)` | **Saute** la durée : un timer répétitif n'est déclenché qu'**une seule fois** |
| `clock.resume()` | Reprend l'écoulement normal après une pause |
| `clock.setSystemTime(time)` | Déplace l'heure sans toucher aux timers en attente |

La distinction `runFor` / `fastForward` est la plus délicate. Sur un compte à rebours d'une seconde :

```ts
await page.clock.runFor('05:00');        // 300 déclenchements : le compteur descend de 300
await page.clock.fastForward('05:00');   // 1 déclenchement : la date avance de 5 min, le compteur perd 1
```

`fastForward` sert à **arriver à une date** (le lendemain, la fin du mois) ; `runFor` sert à **vivre la durée** (compte à rebours, polling).

Deux règles d'usage :

- **Installer avant de charger la page.** `clock.install` précède `goto` ou `setContent`, sinon le script de la page a déjà lu l'heure réelle. Horloge partagée par plusieurs tests : fixture `auto` (M3.2).
- **Mettre en pause pour être exact.** Après `install`, le temps continue de s'écouler : une valeur exacte devient instable. `pauseAt` immédiatement après `install` rend le test reproductible.

Limite : `page.clock` agit **dans le navigateur uniquement**, le backend garde son heure réelle. Virement programmé validé côté serveur : `clock` pour l'affichage, et une donnée préparée par l'API (M4.1) ou un mock (M4.2) pour la logique serveur.

### 1.6 Bonnes pratiques

1. S'abonner à l'événement **avant** l'action, toujours (`download`, `filechooser`, `popup`, `dialog`).
2. Vérifier le **contenu** d'un fichier téléchargé, pas seulement son existence ; joindre la preuve au rapport avec `testInfo.attach`.
3. Fichiers envoyés fabriqués **en mémoire** ; fixture sur le disque seulement pour un vrai binaire.
4. Fermer les onglets ouverts ; pour un tiers, tester l'intention plutôt qu'ouvrir réellement.
5. `clock.install` avant le chargement, `pauseAt` pour l'exactitude, `runFor` pour vivre la durée, `fastForward` pour atteindre une date.
6. Nettoyer les fichiers écrits (`afterAll`) ; ne jamais committer un dossier de téléchargements.
7. Ce qui dépend du serveur (heure de valeur, planification) se prépare par l'API, pas par l'horloge du navigateur.

### 1.7 Erreurs fréquentes

| Erreur | Symptôme | Correction |
|---|---|---|
| `waitForEvent('download')` après le clic | Timeout de 30 s | S'abonner avant, sans `await` sur la promesse |
| `expect(fs.existsSync(f)).toBe(true)` comme seule assertion | Test vert avec un fichier vide ou une page d'erreur | Vérifier la taille et le contenu |
| Fichier temporaire utilisé après le test | `ENOENT` | `saveAs` avant la fin, ou `testInfo.attach` |
| `setInputFiles` sur un input caché qui échoue | En réalité c'est le `click` qui échoue | `setInputFiles` n'exige pas la visibilité ; ne pas cliquer d'abord |
| `onglet.url()` vaut `about:blank` | Assertion trop tôt | `await onglet.waitForLoadState()` |
| Onglet non fermé | `context.pages()` inattendu, trace lourde | `await onglet.close()` |
| `clock.install` après `goto` | La date affichée reste réelle | Installer avant le chargement |
| `fastForward` sur un compte à rebours | Le compteur ne bouge presque pas | Utiliser `runFor` |
| Valeurs exactes instables après `install` | Le temps continue de s'écouler | `pauseAt` juste après `install` |
| Test qui attend vraiment 15 minutes | Suite interminable | `clock` |

### 1.8 Points à retenir

- Téléchargement, sélecteur de fichiers et nouvel onglet sont des **événements** : s'abonner avant l'action.
- `saveAs` / `createReadStream` pour le contenu, `testInfo.attach` pour la preuve.
- `setInputFiles` avec un buffer : pas de fixture à versionner. `filechooser` quand l'input est inatteignable.
- Un onglet est une `Page` de plus : pas de `switchTo`, on ferme ce qu'on ouvre.
- `runFor` vit la durée, `fastForward` atteint la date ; `install` avant le chargement, `pauseAt` pour l'exactitude.
- L'horloge est **côté navigateur** : le serveur, lui, se prépare par l'API.

---

## 2. Démonstration

**Objectif** : télécharger un fichier et vérifier son contenu, envoyer un fichier de deux façons, récupérer un onglet, faire expirer une session de 5 minutes en une seconde.

**Site** : https://the-internet.herokuapp.com (pages `/download`, `/upload`, `/windows`) et deux pages minimales construites avec `setContent`.

### Étapes

1. `/download` : abonnement, clic, `suggestedFilename()`, `path()`, pièce jointe visible dans le rapport HTML.
2. Même page : `saveAs('.telechargements/releve.txt')`, lecture du contenu, nettoyage. Puis `createReadStream()` sans passer par le disque.
3. `/upload` : `setInputFiles` depuis `fixtures/beneficiaires.csv`, puis avec un buffer en mémoire. L'input de cette page n'a pas de label : CSS justifié (niveau 6 de M1.2), inacceptable sur l'application maison.
4. Bouton personnalisé (page `setContent`) : `waitForEvent('filechooser')`, `isMultiple()`, `setFiles`. Puis sélection multiple et `setInputFiles([])` pour vider.
5. `/windows` : `waitForEvent('popup')`, assertions sur l'onglet, `close()` ; variante `context.waitForEvent('page')` et `context.pages()` ; enfin un `window.open` vers un site tiers : même `waitForEvent('popup')`, mais on lit seulement l'URL demandée avant de refermer, sans attendre le chargement du tiers.
6. Page « session » (`setContent`) : `setFixedTime` pour la date affichée ; puis `install` + `pauseAt` + `runFor(3000)` + `fastForward('05:00')` + `runFor('05:00')`, chaque valeur du compteur commentée ; enfin `pauseAt` / `resume`.

### Code complet

Voir `demo/` : `tests/telechargement.spec.ts`, `tests/upload.spec.ts`, `tests/onglets.spec.ts`, `tests/horloge.spec.ts`. Extraits :

```ts
const telechargementPromis = page.waitForEvent('download');
await lien.click();
const telechargement = await telechargementPromis;
expect(telechargement.suggestedFilename()).toBe(nomAffiche);
await testInfo.attach(nomAffiche, { path: await telechargement.path() });
```

```ts
await page.clock.install({ time: new Date('2026-01-15T10:00:00') });
await page.setContent(PAGE_SESSION);
await page.clock.pauseAt(new Date('2026-01-15T10:00:05'));
await expect(page.locator('#restant')).toHaveText('299');   // le saut n'a déclenché l'intervalle qu'une fois
await page.clock.runFor(3000);
await expect(page.locator('#restant')).toHaveText('296');   // trois déclenchements réels
await page.clock.fastForward('05:00');
await expect(page.locator('#restant')).toHaveText('295');   // 5 minutes sautées, un seul déclenchement
await page.clock.runFor('05:00');
await expect(page.locator('#message')).toHaveText('Votre session a expiré');
```

### Explication du code

- Les quatre valeurs `299 / 296 / 295 / 0` sont le cœur pédagogique : elles rendent visible la différence entre sauter le temps et le vivre. Prédisez-les avant de lancer.
- `testInfo.attach` transforme un fichier éphémère en preuve consultable dans le rapport, y compris depuis les artefacts de CI (J5).
- Le test « `window.open` vers un tiers » réutilise `waitForEvent('popup')`, mais s'arrête à l'URL demandée : pas d'attente du chargement d'un site qu'on ne maîtrise pas.

### Résultat attendu

`13 passed` en une quinzaine de secondes. Le rapport HTML contient le fichier téléchargé en pièce jointe du premier test.

---

## 3. Exercice (30 minutes)

Voir `exercice.md`. Point de départ fourni : `exercice-materiel/`.

## 4. Correction

Voir `correction/`.

## 5. Contribution au projet fil rouge

**Ce qui change dans l'application** (mini-banque) :

- `GET /api/accounts/{id}/statement.csv` : export CSV des opérations d'un compte, servi avec `Content-Disposition: attachment`.
- Écran Bénéficiaires : bouton « Importer un CSV » (input caché derrière un bouton stylé, donc `filechooser`), avec refus des extensions autres que `.csv` et des fichiers de plus de 100 Ko.
- Lien « Conditions générales » en `target="_blank"` sur l'écran de virement.
- Bandeau d'expiration de session au bout de 5 minutes d'inactivité, avec alerte à une minute.

**Ce qui change dans les tests** :

- `tests/ui/fichiers.spec.ts` : export CSV vérifié ligne à ligne contre les opérations lues par l'API, import d'un CSV fabriqué en mémoire, refus d'un `.txt`.
- `tests/ui/session.spec.ts` : alerte puis expiration avec `page.clock`.
- Une assertion d'onglet dans le test de virement.
- Ces tests tournent en projet `mocked` comme en projet réel.

**Lien avec la notion** : l'export CSV réutilise le chargeur typé de M5.1 ; l'expiration de session est le premier test du fil rouge impossible sans horloge simulée (5 minutes d'attente réelle par exécution).

## Ressources externes

- Téléchargements : https://playwright.dev/docs/downloads
- Upload : https://playwright.dev/docs/input#upload-files
- Pages et popups : https://playwright.dev/docs/pages
- Horloge : https://playwright.dev/docs/clock
- API `Download` : https://playwright.dev/docs/api/class-download
- API `Clock` : https://playwright.dev/docs/api/class-clock
- Options de contexte (httpCredentials, proxy, clientCertificates) : https://playwright.dev/docs/api/class-browser#browser-new-context
