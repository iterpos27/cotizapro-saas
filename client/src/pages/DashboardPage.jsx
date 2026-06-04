import { LogOut, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api.js";
import { hasSupabaseConfig, supabase } from "../lib/supabase.js";

export function DashboardPage() {
  const navigate = useNavigate();
  const [checkingSession, setCheckingSession] = useState(true);
  const [session, setSession] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      if (!hasSupabaseConfig) {
        setCheckingSession(false);
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;

      setSession(data.session);
      setCheckingSession(false);

      if (data.session) {
        try {
          const me = await apiFetch("/api/me");
          if (isMounted) setProfileData(me);
        } catch (apiError) {
          if (isMounted) setError(apiError.message);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  }

  if (!hasSupabaseConfig) {
    return (
      <main className="center-page">
        <section className="panel narrow">
          <h1>Supabase pendiente</h1>
          <p>Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env.local para activar el dashboard protegido.</p>
        </section>
      </main>
    );
  }

  if (checkingSession) {
    return <main className="center-page">Cargando...</main>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="dashboard">
      <header className="topbar">
        <div>
          <p>CotizaPro SaaS</p>
          <h1>{profileData?.empresa?.nombre || "Empresa"}</h1>
        </div>
        <button className="button secondary" type="button" onClick={logout}>
          <LogOut size={18} />
          Salir
        </button>
      </header>

      <section className="dashboard-grid">
        <article className="panel">
          <h2>Dashboard protegido</h2>
          <p>La sesion esta activa y Express valido el token del usuario antes de devolver datos del tenant.</p>
          {error ? <div className="alert error">{error}</div> : null}
          <div className="stats">
            <div>
              <span>Usuario</span>
              <strong>{profileData?.perfil?.nombre || session.user.email}</strong>
            </div>
            <div>
              <span>Rol</span>
              <strong>{profileData?.perfil?.rol || "admin"}</strong>
            </div>
            <div>
              <span>Tenant</span>
              <strong>{profileData?.perfil?.empresa_id ? "empresa_id activo" : "pendiente"}</strong>
            </div>
          </div>
        </article>

        <article className="panel">
          <div className="panel-icon">
            <Users size={22} />
          </div>
          <h2>Siguiente fase</h2>
          <p>Cuando registro, login y dashboard esten probados, avanzamos a clientes.</p>
        </article>
      </section>
    </main>
  );
}
