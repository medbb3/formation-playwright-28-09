import { useEffect, useState } from 'react';
import { api, formatEuro, telecharger, type Account, type Rates, type Transaction } from '../api';
import { useAuth } from '../auth';
import '../components/BankBalance';

export function DashboardPage() {
  const { token, user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selected, setSelected] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [rates, setRates] = useState<Rates | null>(null);
  const [ratesError, setRatesError] = useState<string | null>(null);

  useEffect(() => {
    api.track('page_view', '/');
    api.rates().then(setRates).catch((e) => setRatesError(e.message));
  }, []);

  useEffect(() => {
    if (!token) return;
    api.accounts(token)
      .then((list) => {
        setAccounts(list);
        setSelected(list[0] ?? null);
      })
      .catch((e) => setError(e.message));
  }, [token]);

  useEffect(() => {
    if (!token || !selected) return;
    api.transactions(token, selected.id).then(setTransactions).catch((e) => setError(e.message));
  }, [token, selected]);

  const exporter = async () => {
    if (!token || !selected) return;
    setError(null);
    try {
      const blob = await api.statementCsv(token, selected.id);
      telecharger(blob, `releve-${selected.id}.csv`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Export impossible');
    }
  };

  const total = accounts.reduce((sum, a) => sum + a.balance, 0);
  const conseiller = user?.role === 'advisor';

  return (
    <>
      <h1>Bonjour {user?.name}</h1>
      {error && <p role="alert">{error}</p>}

      <section className="card" aria-labelledby="titre-solde">
        <h2 id="titre-solde">Solde global</h2>
        <bank-balance label="Total des comptes" amount={total} currency="EUR" />
      </section>

      <section className="card" aria-labelledby="titre-change">
        <h2 id="titre-change">Cours de change (base EUR)</h2>
        {ratesError && <p role="alert">Cours indisponibles : {ratesError}</p>}
        {!rates && !ratesError && <p>Chargement des cours…</p>}
        {rates && (
          <ul aria-label="Cours de change">
            {Object.entries(rates.rates).map(([devise, taux]) => (
              <li key={devise}>
                1 EUR = {taux.toFixed(2)} {devise}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card" aria-labelledby="titre-comptes">
        <h2 id="titre-comptes">{conseiller ? 'Comptes de tous les clients' : 'Mes comptes'}</h2>
        <table>
          <thead>
            <tr>
              {conseiller && <th scope="col">Client</th>}
              <th scope="col">Compte</th>
              <th scope="col">IBAN</th>
              <th scope="col">Solde</th>
              <th scope="col">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((a) => (
              <tr key={a.id} data-testid="account-row">
                {conseiller && <td>{a.owner}</td>}
                <td>{a.label}</td>
                <td className="iban" data-testid="iban">{a.iban}</td>
                <td className="amount">{formatEuro(a.balance)}</td>
                <td>
                  <button type="button" className="secondary" onClick={() => setSelected(a)} aria-pressed={selected?.id === a.id}>
                    Voir les opérations
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {selected && (
        <section className="card" aria-labelledby="titre-operations">
          <h2 id="titre-operations">Opérations : {selected.label}</h2>
          <button type="button" className="secondary" onClick={exporter} disabled={transactions.length === 0}>
            Exporter les opérations (CSV)
          </button>
          {transactions.length === 0 ? (
            <p>Aucune opération.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Libellé</th>
                  <th scope="col">Montant</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} data-testid="transaction-row">
                    <td data-testid="transaction-date">{t.date}</td>
                    <td>{t.label}</td>
                    <td className={`amount ${t.amount < 0 ? 'negative' : 'positive'}`}>{formatEuro(t.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}
    </>
  );
}
