import { ArrowLeft, LogOut, Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api.js";
import { hasSupabaseConfig, supabase } from "../lib/supabase.js";

const emptyForm = {
  nombre: "",
  email: "",
  telefono: "",
  identificacion: "",
  direccion: "",
};

export function ClientesPage() {
  const navigate = useNavigate();
  const [checkingSession, setCheckingSession] = useState(true);
  const [session, setSession] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadPage() {
      if (!hasSupabaseConfig) {
        setCheckingSession(false);
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;

      setSession(data.session);
      setCheckingSession(false);

      if (data.session) {
        await loadClientes(isMounted);
      }
    }

    loadPage();

    return () => {
      isMounted = false;
    };
  }, []);

  async function loadClientes(isMounted = true) {
    try {
      setError("");
      const data = await apiFetch("/api/clientes");
      if (isMounted) setClientes(data.clientes || []);
    } catch (apiError) {
      if (isMounted) setError(apiError.message);
    }
  }

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function editCliente(cliente) {
    setEditingId(cliente.id);
    setForm({
      nombre: cliente.nombre || "",
      email: cliente.email || "",
      telefono: cliente.telefono || "",
      identificacion: cliente.identificacion || "",
      direccion: cliente.direccion || "",
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = editingId ? `/api/clientes/${editingId}` : "/api/clientes";
      const method = editingId ? "PUT" : "POST";

      await apiFetch(endpoint, {
        method,
        body: JSON.stringify(form),
      });

      resetForm();
      await loadClientes();
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteCliente(cliente) {
    const confirmed = window.confirm(`Eliminar cliente "${cliente.nombre}"?`);

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      await apiFetch(`/api/clientes/${cliente.id}`, { method: "DELETE" });
      await loadClientes();
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  }

  if (!hasSupabaseConfig) {
    return (
      <main className="center-page">
        <section className="panel narrow">
          <h1>Supabase pendiente</h1>
          <p>Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env.local para activar clientes.</p>
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
          <h1>Clientes</h1>
        </div>
        <div className="topbar-actions">
          <Link className="button secondary" to="/dashboard">
            <ArrowLeft size={18} />
            Dashboard
          </Link>
          <button className="button secondary" type="button" onClick={logout}>
            <LogOut size={18} />
            Salir
          </button>
        </div>
      </header>

      <section className="clients-layout">
        <article className="panel">
          <h2>{editingId ? "Editar cliente" : "Crear cliente"}</h2>
          <p>Los clientes se guardan con el `empresa_id` del usuario autenticado.</p>

          <form className="form clients-form" onSubmit={submit}>
            <label>
              Nombre
              <input name="nombre" value={form.nombre} onChange={updateField} placeholder="Cliente o empresa" required />
            </label>
            <label>
              Email
              <input name="email" type="email" value={form.email} onChange={updateField} placeholder="cliente@correo.com" />
            </label>
            <label>
              Telefono
              <input name="telefono" value={form.telefono} onChange={updateField} placeholder="0999999999" />
            </label>
            <label>
              Identificacion
              <input name="identificacion" value={form.identificacion} onChange={updateField} placeholder="RUC o cedula" />
            </label>
            <label className="full-field">
              Direccion
              <input name="direccion" value={form.direccion} onChange={updateField} placeholder="Direccion fiscal o comercial" />
            </label>

            {error ? <div className="alert error full-field">{error}</div> : null}

            <div className="form-actions full-field">
              <button className="button primary" type="submit" disabled={loading}>
                <Plus size={18} />
                {loading ? "Guardando..." : editingId ? "Guardar cambios" : "Crear cliente"}
              </button>
              {editingId ? (
                <button className="button secondary" type="button" onClick={resetForm}>
                  <X size={18} />
                  Cancelar
                </button>
              ) : null}
            </div>
          </form>
        </article>

        <article className="panel">
          <div className="section-header">
            <div>
              <h2>Listado</h2>
              <p>{clientes.length} cliente(s) registrados.</p>
            </div>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Telefono</th>
                  <th>Identificacion</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientes.length ? (
                  clientes.map((cliente) => (
                    <tr key={cliente.id}>
                      <td>
                        <strong>{cliente.nombre}</strong>
                        {cliente.direccion ? <span>{cliente.direccion}</span> : null}
                      </td>
                      <td>{cliente.email || "-"}</td>
                      <td>{cliente.telefono || "-"}</td>
                      <td>{cliente.identificacion || "-"}</td>
                      <td>
                        <div className="row-actions">
                          <button className="icon-button" type="button" onClick={() => editCliente(cliente)} title="Editar">
                            <Pencil size={16} />
                          </button>
                          <button className="icon-button danger" type="button" onClick={() => deleteCliente(cliente)} title="Eliminar">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="empty-cell">
                      Todavia no hay clientes registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </main>
  );
}
