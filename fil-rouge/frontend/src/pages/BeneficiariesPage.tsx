import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { api, ApiError, MAX_IMPORT_BYTES, type Beneficiary } from '../api';
import { useAuth } from '../auth';

export function BeneficiariesPage() {
  const { token } = useAuth();
  const [list, setList] = useState<Beneficiary[]>([]);
  const [name, setName] = useState('');
  const [iban, setIban] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const reload = () => {
    if (!token) return;
    api.beneficiaries(token).then(setList).catch((e) => setError(e.message));
  };

  useEffect(reload, [token]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setStatus(null);
    try {
      const created = await api.addBeneficiary(token, { name, iban });
      setStatus(`Bénéficiaire « ${created.name} » ajouté`);
      setName('');
      setIban('');
      reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Service indisponible');
    }
  };

  const fichierRef = useRef<HTMLInputElement>(null);

  const importer = async (e: ChangeEvent<HTMLInputElement>) => {
    const fichier = e.target.files?.[0];
    e.target.value = '';   // permet de re-choisir le même fichier
    if (!fichier || !token) return;
    setError(null);
    setStatus(null);
    // Contrôles côté client : le serveur les refait, mais l'utilisateur a un retour immédiat.
    if (!fichier.name.toLowerCase().endsWith('.csv')) {
      setError('Format non supporté (attendu : .csv)');
      return;
    }
    if (fichier.size > MAX_IMPORT_BYTES) {
      setError('Fichier trop volumineux (100 Ko maximum)');
      return;
    }
    try {
      const res = await api.importBeneficiaries(token, fichier);
      setStatus(`${res.created} bénéficiaire(s) importé(s), ${res.ignored} ignoré(s)`);
      reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Service indisponible');
    }
  };

  const remove = async (b: Beneficiary) => {
    if (!token) return;
    setError(null);
    setStatus(null);
    try {
      await api.deleteBeneficiary(token, b.id);
      setStatus(`Bénéficiaire « ${b.name} » supprimé`);
      reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Service indisponible');
    }
  };

  return (
    <>
      <h1>Mes bénéficiaires</h1>
      {error && <p role="alert">{error}</p>}
      {status && <p role="status">{status}</p>}

      <section className="card" aria-labelledby="titre-liste">
        <h2 id="titre-liste">Bénéficiaires enregistrés</h2>
        {list.length === 0 ? (
          <p>Aucun bénéficiaire.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th scope="col">Nom</th>
                <th scope="col">IBAN</th>
                <th scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {list.map((b) => (
                <tr key={b.id} data-testid="beneficiary-row">
                  <td>{b.name}</td>
                  <td className="iban" data-testid="iban">{b.iban}</td>
                  <td>
                    <button type="button" className="secondary" onClick={() => remove(b)} aria-label={`Supprimer ${b.name}`}>
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="card" aria-labelledby="titre-import">
        <h2 id="titre-import">Importer des bénéficiaires</h2>
        <p>Fichier CSV « nom;iban », 100 Ko maximum.</p>
        {/* L'input est masqué : c'est le bouton qui l'ouvre. Côté test, on passe par filechooser. */}
        <input ref={fichierRef} type="file" accept=".csv" onChange={importer} hidden data-testid="import-input" />
        <button type="button" className="secondary" onClick={() => fichierRef.current?.click()}>
          Importer un CSV
        </button>
      </section>

      <section className="card" aria-labelledby="titre-ajout">
        <h2 id="titre-ajout">Ajouter un bénéficiaire</h2>
        <form onSubmit={submit} aria-label="Nouveau bénéficiaire">
          <label>
            Nom
            <input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={60} />
          </label>
          <label>
            IBAN
            <input value={iban} onChange={(e) => setIban(e.target.value)} required minLength={15} placeholder="FR76 ..." />
          </label>
          <button type="submit">Ajouter</button>
        </form>
      </section>
    </>
  );
}
