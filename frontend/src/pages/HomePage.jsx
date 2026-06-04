import { ArrowRight, FileText, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero">
        <div className="eyebrow">
          <ShieldCheck size={18} />
          Multi-tenant con Supabase
        </div>
        <h1>CotizaPro SaaS</h1>
        <p>
          Plataforma para crear empresas, usuarios y luego gestionar clientes y cotizaciones sin mezclar datos entre tenants.
        </p>
        <div className="actions">
          <Link className="button primary" to="/registro">
            Crear cuenta
            <ArrowRight size={18} />
          </Link>
          <Link className="button secondary" to="/login">
            <FileText size={18} />
            Iniciar sesion
          </Link>
        </div>
      </section>
    </main>
  );
}
