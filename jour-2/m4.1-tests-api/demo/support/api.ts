import type { APIRequestContext, PlaywrightWorkerArgs } from '@playwright/test';

const CREDENTIALS = { email: 'eve.holt@reqres.in', password: 'cityslicka' };

/**
 * Ouvre un contexte API portant le token obtenu par `POST /api/login`, exécute `run`, puis le
 * ferme. Remplace la fixture `authRequest` : aucun `test.extend`, le test appelle la fonction
 * lui-même, comme les helpers de `fil-rouge/frontend/tests/support/connexion.ts`.
 */
export async function avecAuthRequest<T>(
  playwright: PlaywrightWorkerArgs['playwright'],
  baseURL: string,
  run: (authRequest: APIRequestContext) => Promise<T>,
): Promise<T> {
  const anon = await playwright.request.newContext({ baseURL });
  const login = await anon.post('/api/login', { data: CREDENTIALS });
  if (!login.ok()) throw new Error(`Login API échoué : ${login.status()} ${await login.text()}`);
  const { token } = (await login.json()) as { token: string };
  await anon.dispose();

  // Sur une API réelle : Authorization: `Bearer ${token}`.
  // ReqRes n'a aucune ressource protégée et rejette tout en-tête Authorization (il le lit comme
  // clé d'API). On transporte donc le token dans un en-tête neutre : le motif reste identique.
  const ctx = await playwright.request.newContext({
    baseURL,
    extraHTTPHeaders: { 'x-api-key': 'reqres-free-v1', 'x-session-token': token },
  });
  try {
    return await run(ctx);
  } finally {
    await ctx.dispose();
  }
}
