import { test, expect } from '@playwright/test';
import { avecAuthRequest } from '../support/api';

test("l'inscription sans mot de passe est refusée", async ({ request }) => {
  const res = await request.post('/api/register', { data: { email: 'sydney@fife' } });

  expect(res.status()).toBe(400);
  expect(await res.json()).toMatchObject({ error: 'Missing password' });
});

test('un contexte authentifié envoie le token sur chaque appel', async ({ playwright, baseURL }) => {
  await avecAuthRequest(playwright, baseURL!, async (authRequest) => {
    const res = await authRequest.get('/api/users/2');

    await expect(res).toBeOK();
    expect((await res.json()).data).toMatchObject({ id: 2 });
  });
});

test('la connexion avec un mauvais mot de passe est refusée', async ({ request }) => {
  const res = await request.post('/api/login', { data: { email: 'eve.holt@reqres.in' } });
  expect(res.status()).toBe(400);
  expect(await res.json()).toMatchObject({ error: 'Missing password' });
});
