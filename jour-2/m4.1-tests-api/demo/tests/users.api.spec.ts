import { test, expect } from '@playwright/test';
import type { Page, User } from '../utils/types';

test('la liste des utilisateurs est paginée', async ({ request }) => {
  const res = await request.get('/api/users', { params: { page: 2 } });

  await expect(res).toBeOK();
  const body = (await res.json()) as Page<User>;
  expect(body).toMatchObject({ page: 2, per_page: 6 });
  expect(body.data).toHaveLength(6);
  expect(body.data[0]).toEqual(
    expect.objectContaining({ id: expect.any(Number), email: expect.stringMatching(/@reqres\.in$/) }),
  );
});

test('un utilisateur inconnu renvoie 404 avec un corps vide', async ({ request }) => {
  const res = await request.get('/api/users/23');
  expect(res.status()).toBe(404);
  expect(await res.json()).toEqual({});
});

test("cycle de vie CRUD d'un utilisateur", async ({ request }) => {
  let id = '';

  await test.step('Create', async () => {
    const res = await request.post('/api/users', { data: { name: 'Alice', job: 'QA' } });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body).toMatchObject({ name: 'Alice', job: 'QA' });
    expect(body).toHaveProperty('createdAt');
    id = body.id;
  });

  await test.step('Read (ReqRes ne persiste pas : on lit un utilisateur de référence)', async () => {
    const res = await request.get('/api/users/2');
    await expect(res).toBeOK();
    expect((await res.json()).data).toMatchObject({ id: 2, first_name: 'Janet' });
  });

  await test.step('Update', async () => {
    const res = await request.put(`/api/users/${id}`, { data: { name: 'Alice', job: 'Lead QA' } });
    await expect(res).toBeOK();
    expect(await res.json()).toMatchObject({ job: 'Lead QA' });
  });

  await test.step('Delete', async () => {
    const res = await request.delete(`/api/users/${id}`);
    expect(res.status()).toBe(204);
  });
});
