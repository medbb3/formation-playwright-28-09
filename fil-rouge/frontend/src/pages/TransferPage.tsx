import { useEffect, useState, type FormEvent } from 'react';
import { API_URL, api, ApiError, formatEuro, type Account, type Beneficiary } from '../api';
import { useAuth } from '../auth';

export function TransferPage() {
  const { token } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [fromId, setFromId] = useState<number | ''>('');
  const [iban, setIban] = useState('');
  const [amount, setAmount] = useState('');
  const [label, setLabel] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) return;
    api.accounts(token)
      .then((list) => {
        setAccounts(list);
        if (list[0]) setFromId(list[0].id);
      })
      .catch((e) => setError(e.message));
    api.beneficiaries(token).then(setBeneficiaries).catch(() => setBeneficiaries([]));
    api.track('page_view', '/virement');
  }, [token]);

  // La case "J'accepte les conditions" vit dans l'iframe /legal : elle nous informe par postMessage
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== API_URL) return;
      if (event.data?.type === 'legal-accepted') setAccepted(Boolean(event.data.accepted));
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token || fromId === '') return;
    setError(null);
    setSuccess(null);
    setBusy(true);
    try {
      const res = await api.transfer(token, { from_account_id: fromId, to_iban: iban, amount: Number(amount), label });
      setSuccess(`Virement effectué. Nouveau solde : ${formatEuro(res.new_balance)}`);
      setAmount('');
      setLabel('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Service indisponible');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card">
      <h1>Effectuer un virement</h1>
      <form onSubmit={submit} aria-label="Virement">
        <label>
          Compte à débiter
          <select value={fromId} onChange={(e) => setFromId(Number(e.target.value))} required>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label} ({formatEuro(a.balance)})
              </option>
            ))}
          </select>
        </label>
        <label>
          Bénéficiaire enregistré
          <select
            value=""
            onChange={(e) => {
              const b = beneficiaries.find((x) => x.id === Number(e.target.value));
              if (b) setIban(b.iban);
            }}
          >
            <option value="">— Saisir un IBAN manuellement —</option>
            {beneficiaries.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          IBAN du bénéficiaire
          <input
            value={iban}
            onChange={(e) => setIban(e.target.value)}
            placeholder="FR76 ..."
            required
            minLength={15}
            aria-describedby="aide-iban"
          />
        </label>
        <p id="aide-iban" className="aide">
          Format attendu : FR76 suivi de 23 caractères, espaces facultatifs.
        </p>
        <label>
          Montant (€)
          <input type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </label>
        <label>
          Libellé
          <input value={label} onChange={(e) => setLabel(e.target.value)} required maxLength={80} />
        </label>

        <iframe src={`${API_URL}/legal`} title="Conditions du virement" />
        <p>
          <a href={`${API_URL}/legal`} target="_blank" rel="noreferrer">
            Ouvrir les conditions dans un nouvel onglet
          </a>
        </p>

        {error && <p role="alert">{error}</p>}
        {success && <p role="status">{success}</p>}
        <button type="submit" disabled={!accepted || busy}>
          Valider le virement
        </button>
      </form>
    </div>
  );
}
