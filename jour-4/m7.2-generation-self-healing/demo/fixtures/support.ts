import type { TestInfo } from '@playwright/test';
import { PageObjectManager } from '../pages';

/** Connecte l'utilisateur du projet et arrive sur le catalogue. Point de départ commun à tous les tests. */
export async function connecterCatalogue(pages: PageObjectManager, defaultUser: string): Promise<void> {
  await pages.login.goto();
  await pages.login.login(defaultUser, 'secret_sauce');
}

/** Utilisateur par défaut du projet courant (option `defaultUser` définie dans playwright.config.ts). */
export function utilisateurDuProjet(testInfo: TestInfo): string {
  return (testInfo.project.use as { defaultUser?: string }).defaultUser ?? 'standard_user';
}

// Un worker Playwright est déjà un process Node isolé : une simple variable de module suffit
// comme « fixture worker », sans mécanisme de fixtures personnalisées dédié (cf. M7.2/M3.2).
let runId: string | undefined;

/** Identifiant unique pour ce worker, calculé une seule fois. */
export function idDeCeWorker(testInfo: TestInfo): string {
  return (runId ??= `w${testInfo.workerIndex}-${Date.now().toString(36)}`);
}
