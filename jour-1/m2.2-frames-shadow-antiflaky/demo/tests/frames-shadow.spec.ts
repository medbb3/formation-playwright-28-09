import { test, expect } from '@playwright/test';

test.describe('iframes', () => {
  test('lire dans un éditeur riche embarqué', { tag: '@smoke' }, async ({ page }) => {
    await page.goto('/iframe');

    // Échec pédagogique (à décommenter pour montrer) : le contenu est dans une iframe,
    // page.getByText ne le voit pas -> <element(s) not found>
    // await expect(page.getByText('Your content goes here.')).toBeVisible();

    const editeur = page.getByTitle('Rich Text Area').contentFrame();
    await expect(editeur.getByText('Your content goes here.')).toBeVisible();

    // Note : sur ce site l'éditeur TinyMCE est en lecture seule (contenteditable="false"),
    // on ne peut donc pas y saisir. C'est aussi une information que donne l'attribut :
    await expect(editeur.locator('body')).toHaveAttribute('contenteditable', 'false');
  });

  test('un site complet embarqué : locators par rôle à l\'intérieur', async ({ page }) => {
    await page.goto('https://rahulshettyacademy.com/AutomationPractice/');

    // L'iframe est identifiée par son name (attribut stable), pas par sa position
    const site = page.frameLocator('iframe[name="iframe-name"]');

    await expect(site.getByRole('heading', { name: /Learn Earn & Shine/ })).toBeVisible();
    await expect(site.getByRole('navigation').getByRole('link', { name: 'Courses' })).toBeVisible();
    // Le site embarqué contient deux liens "JOIN NOW" (bannière et pied de page)
    await expect(site.getByRole('link', { name: 'JOIN NOW' })).toHaveCount(2);

    // Le même rôle cherché sur la page parente ne trouve rien : les documents sont séparés
    await expect(page.getByRole('link', { name: 'JOIN NOW' })).toHaveCount(0);
  });

  test('frames imbriquées : lire chaque cadre', async ({ page }) => {
    await page.goto('/nested_frames');

    const haut = page.frameLocator('frame[name="frame-top"]');
    await expect(haut.frameLocator('frame[name="frame-left"]').getByText('LEFT')).toBeVisible();
    await expect(haut.frameLocator('frame[name="frame-middle"]').getByText('MIDDLE')).toBeVisible();
    await expect(haut.frameLocator('frame[name="frame-right"]').getByText('RIGHT')).toBeVisible();
    await expect(page.frameLocator('frame[name="frame-bottom"]').getByText('BOTTOM')).toBeVisible();
  });
});

test('shadow DOM : les locators traversent le shadow root', { tag: '@smoke' }, async ({ page }) => {
  await page.goto('/shadowdom');

  // Les composants <my-paragraph> ont un #shadow-root (open). Un CSS via locator() le traverse.
  const composants = page.locator('my-paragraph');
  await expect(composants).toHaveCount(2);

  // Piège réel : le texte existe dans le DOM clair (<span slot="my-text">) ET projeté dans le
  // shadow via <slot>. Un locator strict trouve les deux ; on restreint à la liste, qui est
  // dans le shadow. Aucune API spécifique au shadow DOM n'est nécessaire.
  await expect(page.getByText("Let's have some different text!")).toHaveCount(2);
  await expect(page.getByRole('list').getByText("Let's have some different text!")).toBeVisible();
  // Le texte par défaut d'un <slot> ne s'affiche que si rien n'est projeté. Ici les deux
  // composants projettent un contenu : le texte par défaut est présent dans le shadow
  // mais masqué. toBeHidden() le vérifie, et prouve au passage que le locator a traversé le shadow.
  await expect(composants.nth(1).getByText('My default text')).toBeHidden();
});

test('capture masquée attachée au rapport', async ({ page }, testInfo) => {
  await page.goto('/login');
  await page.getByLabel('Username').fill('tomsmith');
  await page.getByLabel('Password').fill('SuperSecretPassword!');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByText('You logged into a secure area!')).toBeVisible();

  // On considère le message flash comme une donnée sensible : masqué en rose
  const capture = await page.screenshot({
    mask: [page.locator('#flash')],
    maskColor: '#FF00FF',
  });
  await testInfo.attach('zone sécurisée (flash masqué)', { body: capture, contentType: 'image/png' });
});
