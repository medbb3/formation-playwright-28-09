import { test, expect } from '@playwright/test';
import { API_URL, USERS, login } from './helpers';

test('mock complet : le cours USD affiché est celui du mock', async ({ page }) => {
  await page.route('**/api/rates', (route) =>
    route.fulfill({ json: { base: 'EUR', date: '2026-01-01', rates: { USD: 2.5 } } }),
  );

  await login(page);

  const cours = page.getByRole('list', { name: 'Cours de change' });
  await expect(cours.getByRole('listitem')).toHaveCount(1);
  await expect(cours).toContainText('1 EUR = 2.50 USD');
});

test('affiche une erreur quand le service de cours renvoie 503', async ({ page }) => {
  await page.route('**/api/rates', (route) =>
    route.fulfill({ status: 503, json: { detail: 'Fournisseur de cours en maintenance' } }),
  );

  await login(page);

  const alerte = page.getByRole('alert');
  await expect(alerte).toContainText('Cours indisponibles');
  await expect(alerte).toContainText('maintenance');
});

test('un solde négatif venu de la vraie API est affiché en découvert', async ({ page }) => {
  await page.route('**/api/accounts', async (route) => {
    const response = await route.fetch();          // vraie réponse du backend
    const accounts = await response.json();
    accounts[0].balance = -250.75;                 // on ne modifie que ce qui compte
    await route.fulfill({ response, json: accounts });
  });

  await login(page);

  await expect(page.getByTestId('account-row').first()).toContainText(/-250,75\s?€/);
  // Le total (shadow DOM) reflète aussi la modification : 8000 - 250,75
  await expect(page.getByRole('group', { name: 'Total des comptes' })).toContainText(/7\s?749,25\s?€/);
});

test('la télémétrie est émise par le front, puis bloquée par abort', async ({ page }) => {
  const emises: string[] = [];
  const echouees: string[] = [];
  page.on('request', (req) => { if (req.url().includes('/api/analytics')) emises.push(req.url()); });
  page.on('requestfailed', (req) => { if (req.url().includes('/api/analytics')) echouees.push(req.url()); });

  await page.route('**/api/analytics/**', (route) => route.abort());

  await login(page);   // le tableau de bord envoie un événement page_view

  await expect.poll(() => emises.length, { message: 'le front doit émettre la télémétrie' }).toBeGreaterThan(0);
  await expect.poll(() => echouees.length, { message: 'abort doit faire échouer la requête' }).toBe(emises.length);
});

test('observer le POST réel du virement et sa réponse', async ({ page, request }) => {
  await request.post(`${API_URL}/api/dev/reset`);
  await login(page, USERS.bob);
  await page.getByRole('link', { name: 'Virement' }).click();

  await page.getByLabel('IBAN du bénéficiaire').fill('FR76 9999 0000 0000 0000 0000 001');
  await page.getByLabel('Montant (€)').fill('15');
  await page.getByLabel('Libellé').fill('Observation réseau');
  await page.getByTitle('Conditions du virement').contentFrame().getByLabel("J'accepte les conditions").check();

  // Enregistrer AVANT l'action déclenchante
  const requete = page.waitForRequest((r) => r.url().endsWith('/api/transfers') && r.method() === 'POST');
  const reponse = page.waitForResponse((r) => r.url().endsWith('/api/transfers'));
  await page.getByRole('button', { name: 'Valider le virement' }).click();

  const req = await requete;
  expect(req.postDataJSON()).toMatchObject({ amount: 15, label: 'Observation réseau' });
  expect(req.headers()['authorization']).toMatch(/^Bearer /);

  const res = await reponse;
  expect(res.status()).toBe(201);
  expect(await res.json()).toMatchObject({ new_balance: 105 });
});
