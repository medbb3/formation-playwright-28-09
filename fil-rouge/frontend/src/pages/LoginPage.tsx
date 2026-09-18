import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ApiError } from '../api';
import { useAuth } from '../auth';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [mfaToken, setMfaToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const submitCredentials = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await api.login(email, password);
      setMfaToken(res.mfa_token);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Service indisponible');
    } finally {
      setBusy(false);
    }
  };

  const submitCode = async (e: FormEvent) => {
    e.preventDefault();
    if (!mfaToken) return;
    setError(null);
    setBusy(true);
    try {
      const res = await api.verifyMfa(mfaToken, code);
      signIn(res.access_token, res.user);
      navigate('/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Service indisponible');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card">
      <h1>Connexion</h1>
      {!mfaToken ? (
        <form onSubmit={submitCredentials} aria-label="Identification">
          <label>
            Adresse e-mail
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required />
          </label>
          <label>
            Mot de passe
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
          </label>
          {error && <p role="alert">{error}</p>}
          <button type="submit" disabled={busy}>Se connecter</button>
        </form>
      ) : (
        <form onSubmit={submitCode} aria-label="Vérification en deux étapes">
          <p>Un code de vérification vous a été envoyé par SMS.</p>
          <label>
            Code de vérification
            <input inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} required />
          </label>
          {error && <p role="alert">{error}</p>}
          <button type="submit" disabled={busy}>Valider le code</button>
        </form>
      )}
    </div>
  );
}
