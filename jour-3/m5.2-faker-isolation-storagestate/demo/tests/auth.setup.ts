import { test as setup, expect } from '@playwright/test';

const ROLES = { standard: 'standard_user', visual: 'visual_user' } as const;

for (const [role, user] of Object.entries(ROLES)) {
  setup(`authentifier ${role}`, async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder('Username').fill(user);
    await page.getByPlaceholder('Password').fill('secret_sauce');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/inventory/);

    await page.context().storageState({ path: `.auth/${role}.json` });
  });
}
