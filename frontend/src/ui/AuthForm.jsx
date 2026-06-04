import { Building2, LogIn, UserPlus } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuthErrorMessage } from "../lib/authErrors.js";
import { hasSupabaseConfig, supabase } from "../lib/supabase.js";

export function AuthForm({ mode }) {
  const navigate = useNavigate();
  const isRegister = mode === "registro";
  const [form, setForm] = useState({
    fullName: "",
    companyName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");

    if (!hasSupabaseConfig) {
      setError("Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env.local.");
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: {
              full_name: form.fullName,
              company_name: form.companyName,
            },
          },
        });

        if (signUpError) throw signUpError;

        navigate(data.session ? "/dashboard" : "/login?mensaje=confirma-email", { replace: true });
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (signInError) throw signInError;

      navigate("/dashboard", { replace: true });
    } catch (authError) {
      setError(getAuthErrorMessage(authError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-card">
      <div className="auth-icon">
        <Building2 size={22} />
      </div>
      <h1>{isRegister ? "Crear cuenta" : "Iniciar sesion"}</h1>
      <p>{isRegister ? "Registra tu empresa para empezar con CotizaPro SaaS." : "Entra al panel de tu empresa."}</p>

      <form onSubmit={submit} className="form">
        {isRegister ? (
          <>
            <label>
              Nombre del usuario
              <input name="fullName" value={form.fullName} onChange={updateField} placeholder="Juan Perez" required />
            </label>
            <label>
              Nombre de empresa
              <input name="companyName" value={form.companyName} onChange={updateField} placeholder="Servicios Ejemplo S.A." required />
            </label>
          </>
        ) : null}

        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={updateField} placeholder="correo@empresa.com" required />
        </label>

        <label>
          Contrasena
          <input name="password" type="password" minLength="6" value={form.password} onChange={updateField} required />
        </label>

        {error ? <div className="alert error">{error}</div> : null}

        <button type="submit" className="button primary" disabled={loading}>
          {isRegister ? <UserPlus size={18} /> : <LogIn size={18} />}
          {loading ? "Procesando..." : isRegister ? "Crear empresa" : "Entrar"}
        </button>
      </form>

      <p className="auth-link">
        {isRegister ? "Ya tienes cuenta?" : "No tienes cuenta?"}{" "}
        <Link to={isRegister ? "/login" : "/registro"}>{isRegister ? "Inicia sesion" : "Crea tu empresa"}</Link>
      </p>
    </section>
  );
}
