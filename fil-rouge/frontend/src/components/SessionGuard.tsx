import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';

/** Durée d'inactivité avant expiration, et seuil d'alerte (en secondes). */
export const DUREE_SESSION_S = 300;
export const SEUIL_ALERTE_S = 60;

/**
 * Compte à rebours d'inactivité. Toute action de l'utilisateur le réarme.
 * Côté test, il se pilote avec page.clock (M6.3) : aucune attente réelle de 5 minutes.
 */
export function SessionGuard() {
  const { token, signOut } = useAuth();
  const navigate = useNavigate();
  const [restant, setRestant] = useState(DUREE_SESSION_S);

  useEffect(() => {
    if (!token) return;
    const rearmer = () => setRestant(DUREE_SESSION_S);
    const evenements = ['click', 'keydown'] as const;
    evenements.forEach((e) => window.addEventListener(e, rearmer));
    const timer = window.setInterval(() => setRestant((r) => Math.max(r - 1, 0)), 1000);
    return () => {
      evenements.forEach((e) => window.removeEventListener(e, rearmer));
      window.clearInterval(timer);
    };
  }, [token]);

  useEffect(() => {
    if (token && restant === 0) {
      void signOut().then(() => navigate('/login'));
    }
  }, [restant, token, signOut, navigate]);

  if (!token || restant > SEUIL_ALERTE_S) return null;

  return (
    <div role="alert" data-testid="session-alerte" className="session-alerte">
      Votre session expire dans <span data-testid="session-restant">{restant}</span> secondes
    </div>
  );
}
