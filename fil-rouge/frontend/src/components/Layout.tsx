import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { SessionGuard } from './SessionGuard';

export function Layout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <>
      <header>
        <strong>Mini-banque</strong>
        <nav aria-label="Navigation principale">
          <NavLink to="/">Tableau de bord</NavLink> · <NavLink to="/virement">Virement</NavLink> ·{' '}
          <NavLink to="/beneficiaires">Bénéficiaires</NavLink>
        </nav>
        <span className="spacer" />
        {user && (
          <>
            <span>Connecté : {user.name}</span>
            <button type="button" className="secondary" onClick={handleLogout}>
              Se déconnecter
            </button>
          </>
        )}
      </header>
      <main>
        <SessionGuard />
        <Outlet />
      </main>
    </>
  );
}
