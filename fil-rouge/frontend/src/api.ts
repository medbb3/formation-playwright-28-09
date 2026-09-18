export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export type User = { id: number; email: string; name: string; role: 'client' | 'advisor' };
export type Account = { id: number; user_id: number; label: string; iban: string; balance: number; owner?: string };
export type Beneficiary = { id: number; user_id: number; name: string; iban: string };
export type Rates = { base: string; date: string; rates: Record<string, number> };
export type Transaction = { id: number; account_id: number; date: string; label: string; amount: number };
export type ImportResult = { created: number; ignored: number; errors: string[] };

/** Taille maximale acceptée pour un import (contrôlée côté client ET côté serveur). */
export const MAX_IMPORT_BYTES = 100 * 1024;

/** Déclenche le téléchargement d'un blob sous le nom donné. */
export function telecharger(blob: Blob, nomFichier: string) {
  const url = URL.createObjectURL(blob);
  const lien = document.createElement('a');
  lien.href = url;
  lien.download = nomFichier;
  document.body.appendChild(lien);
  lien.click();
  lien.remove();
  URL.revokeObjectURL(url);
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(options.headers as Record<string, string>) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    let message = `Erreur ${res.status}`;
    try {
      const body = await res.json();
      if (typeof body.detail === 'string') message = body.detail;
    } catch {
      /* corps non JSON */
    }
    throw new ApiError(res.status, message);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  login: (email: string, password: string) =>
    request<{ mfa_required: boolean; mfa_token: string }>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  verifyMfa: (mfa_token: string, code: string) =>
    request<{ access_token: string; user: User }>('/api/auth/mfa', { method: 'POST', body: JSON.stringify({ mfa_token, code }) }),
  logout: (token: string) => request<void>('/api/auth/logout', { method: 'POST' }, token),
  me: (token: string) => request<User>('/api/me', {}, token),
  accounts: (token: string) => request<Account[]>('/api/accounts', {}, token),
  transactions: (token: string, accountId: number) => request<Transaction[]>(`/api/accounts/${accountId}/transactions`, {}, token),
  beneficiaries: (token: string) => request<Beneficiary[]>('/api/beneficiaries', {}, token),
  addBeneficiary: (token: string, body: { name: string; iban: string }) =>
    request<Beneficiary>('/api/beneficiaries', { method: 'POST', body: JSON.stringify(body) }, token),
  deleteBeneficiary: (token: string, id: number) => request<void>(`/api/beneficiaries/${id}`, { method: 'DELETE' }, token),
  rates: () => request<Rates>('/api/rates'),
  /** Télémétrie : envoyée sans attendre la réponse, les erreurs sont ignorées. */
  track: (event: string, path: string) => {
    void fetch(`${API_URL}/api/analytics/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, path }),
      keepalive: true,
    }).catch(() => undefined);
  },
  /** Relevé CSV : réponse binaire, donc on n'utilise pas request<T>(). */
  statementCsv: async (token: string, accountId: number): Promise<Blob> => {
    const res = await fetch(`${API_URL}/api/accounts/${accountId}/statement.csv`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new ApiError(res.status, `Export impossible (${res.status})`);
    return res.blob();
  },
  /** Import de bénéficiaires : multipart, donc pas de Content-Type imposé à la main. */
  importBeneficiaries: async (token: string, file: File): Promise<ImportResult> => {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${API_URL}/api/beneficiaries/import`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiError(res.status, typeof body.detail === 'string' ? body.detail : `Erreur ${res.status}`);
    return body as ImportResult;
  },
  transfer: (token: string, body: { from_account_id: number; to_iban: string; amount: number; label: string }) =>
    request<{ transfer_id: number; new_balance: number }>('/api/transfers', { method: 'POST', body: JSON.stringify(body) }, token),
};

export const formatEuro = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);
