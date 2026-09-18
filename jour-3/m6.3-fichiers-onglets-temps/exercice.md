# Exercice M6.3 — Relevé, justificatif, onglet et session qui expire

**Difficulté** : moyenne
**Durée** : 30 minutes
**Site** : https://the-internet.herokuapp.com + la page `fixtures/session.html` fournie

## Objectif

Traiter les quatre situations où l'effet d'une action sort de la page : un fichier qui sort, un fichier qui entre, un onglet qui s'ouvre, et le temps qui passe.

## Point de départ

Copiez `exercice-materiel/` : `package.json`, `playwright.config.ts` (baseURL déjà réglée) et `fixtures/session.html`, une page qui simule une session bancaire de 5 minutes avec une alerte à une minute. Écrivez vos tests dans `tests/fichiers.spec.ts`.

```powershell
npm install
npx playwright install chromium
```

## Énoncé

1. **Télécharger un relevé** (`/download`) : cliquez sur le premier lien `.txt`. Vérifiez que `suggestedFilename()` correspond au libellé affiché et que le téléchargement n'a pas échoué. Enregistrez le fichier sous `.telechargements/releve.txt`, vérifiez qu'il n'est **pas vide**, joignez-le au rapport HTML. Nettoyez le dossier en fin de fichier de test.

2. **Télécharger un document protégé** (`/download_secure`) : page protégée par une authentification HTTP (`admin` / `admin`). Passez les identifiants par le **contexte**, pas par un formulaire, et téléchargez le premier fichier. Vérifiez qu'il n'y a pas d'échec.

3. **Envoyer un fichier** (`/upload`) : envoyez un CSV de bénéficiaires **fabriqué en mémoire** (aucun fichier sur le disque) ; vérifiez que la page confirme l'envoi et affiche le nom. Puis, sur une page construite avec `setContent` contenant un bouton « Joindre un justificatif » qui masque son input, envoyez un `rib.pdf` via le sélecteur de fichiers et vérifiez le message affiché.

4. **Ouvrir un onglet** (`/windows`) : cliquez sur « Click Here », vérifiez le titre de l'onglet ouvert et que le contexte compte bien deux pages. Fermez l'onglet ; vérifiez qu'il n'en reste qu'une et que la page d'origine est intacte.

5. **Faire expirer la session** (`fixtures/session.html`, en `file://`) : positionnez l'horloge au 15 janvier 2026 à 10:00 **avant** le chargement ; vérifiez la date affichée et que le compteur part de 300. Avancez jusqu'à ce qu'il reste une minute : l'alerte devient visible, le message d'expiration reste vide. Avancez de la dernière minute : le compteur tombe à 0, l'alerte disparaît, le message « Votre session a expiré » s'affiche.

## Consignes

- Aucun `waitForTimeout`, aucune attente réelle de plus de 2 secondes : le test 5 doit durer moins d'une seconde et demie.
- Abonnement aux événements **avant** l'action déclenchante.
- Assertions web-first uniquement, sauf pour ce qui vient du système de fichiers (`fs.statSync`) et pour les métadonnées du téléchargement.
- Le test 1 doit laisser le disque propre : rien dans `.telechargements/` à la fin, et ce dossier dans `.gitignore`.
- Pour le test 5, le compteur doit valoir **exactement** 300 au départ : réfléchissez à l'ordre `install` / `pauseAt` / `goto`.
- Bonus 1 : dans le test 3, vérifiez aussi `isMultiple()` sur le sélecteur de fichiers.
- Bonus 2 : dans le test 4, vérifiez l'`href` du lien **sans** ouvrir l'onglet, et expliquez en commentaire dans quel cas cette variante est préférable.

## Résultat attendu

```
Running 5 tests using N workers
  5 passed
```

Le rapport HTML contient `releve.txt` en pièce jointe du test 1. L'ensemble tourne en moins de 15 secondes et reste vert avec `--repeat-each 2`.

Question : votre application affiche « virement exécuté le 20 janvier ». Le test avance l'horloge du navigateur au 20 janvier, mais l'écran affiche toujours « programmé ». Pourquoi, et que faut-il faire ?
