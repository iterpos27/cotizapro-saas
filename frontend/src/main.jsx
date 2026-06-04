import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Building2,
  CheckCircle2,
  ClipboardList,
  Download,
  Edit3,
  FileText,
  LogOut,
  Plus,
  Save,
  Send,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import "./styles.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const emptyCliente = {
  nombre: "",
  email: "",
  telefono: "",
  identificacion: "",
  direccion: "",
};

const emptyEmpresa = {
  nombre: "",
  razon_social: "",
  ruc: "",
  direccion: "",
  telefono: "",
  email: "",
  logo_url: "",
};

const emptyCotizacion = {
  cliente_id: "",
  fecha: new Date().toISOString().slice(0, 10),
  vencimiento: "",
  estado: "borrador",
  notas: "",
  items: [{ descripcion: "", cantidad: 1, precio_unitario: 0 }],
};

function getStoredSession() {
  const raw = localStorage.getItem("cotizapro_session");
  return raw ? JSON.parse(raw) : null;
}

async function request(path, options = {}, token) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 204) {
    return {};
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Error del servidor.");
  }

  return data;
}

function formatMoney(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function AuthPage({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    nombre: "",
    empresa: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const path = mode === "register" ? "/api/auth/register" : "/api/auth/login";
      const data = await request(path, {
        method: "POST",
        body: JSON.stringify(form),
      });

      if (data.emailConfirmationRequired) {
        setMessage("Cuenta creada. Confirma el email o desactiva confirmacion en Supabase para pruebas.");
        setMode("login");
        return;
      }

      if (data.session?.access_token) {
        onLogin(data.session);
      }
    } catch (authError) {
      setError(authError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand-mark">
          <Building2 size={24} />
        </div>
        <h1>{mode === "register" ? "Crear empresa" : "Iniciar sesion"}</h1>
        <p>{mode === "register" ? "Registra tu empresa para usar CotizaPro." : "Entra al panel de trabajo."}</p>

        <div className="segmented">
          <button className={mode === "login" ? "active" : ""} type="button" onClick={() => setMode("login")}>
            Login
          </button>
          <button className={mode === "register" ? "active" : ""} type="button" onClick={() => setMode("register")}>
            Registro
          </button>
        </div>

        <form className="form" onSubmit={submit}>
          {mode === "register" ? (
            <>
              <label>
                Nombre del usuario
                <input name="nombre" value={form.nombre} onChange={updateField} required />
              </label>
              <label>
                Nombre de empresa
                <input name="empresa" value={form.empresa} onChange={updateField} required />
              </label>
            </>
          ) : null}
          <label>
            Email
            <input name="email" type="email" value={form.email} onChange={updateField} required />
          </label>
          <label>
            Contrasena
            <input name="password" type="password" value={form.password} onChange={updateField} minLength="6" required />
          </label>

          {error ? <div className="alert error">{error}</div> : null}
          {message ? <div className="alert ok">{message}</div> : null}

          <button className="button primary full" type="submit" disabled={loading}>
            <UserPlus size={18} />
            {loading ? "Procesando..." : mode === "register" ? "Crear empresa" : "Entrar"}
          </button>
        </form>
      </section>
    </main>
  );
}

function Shell({ session, onLogout, children, active, setActive }) {
  const nav = [
    { id: "dashboard", label: "Dashboard", icon: ClipboardList },
    { id: "empresa", label: "Empresa", icon: Building2 },
    { id: "clientes", label: "Clientes", icon: Users },
    { id: "cotizaciones", label: "Cotizaciones", icon: FileText },
  ];

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Building2 size={22} />
          <strong>CotizaPro</strong>
        </div>
        <nav>
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} className={active === item.id ? "nav-item active" : "nav-item"} type="button" onClick={() => setActive(item.id)}>
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <button className="nav-item logout" type="button" onClick={onLogout}>
          <LogOut size={18} />
          Salir
        </button>
      </aside>
      <section className="workspace">
        <header className="topbar">
          <div>
            <span>Sesion activa</span>
            <strong>{session.user?.email}</strong>
          </div>
        </header>
        {children}
      </section>
    </main>
  );
}

function Dashboard({ data }) {
  return (
    <section className="content-grid">
      <article className="panel wide">
        <h2>Dashboard</h2>
        <p>Base frontend conectada al backend Express. Trabajaremos por modulos.</p>
        <div className="stats">
          <div>
            <span>Empresa</span>
            <strong>{data?.empresa?.nombre || "-"}</strong>
          </div>
          <div>
            <span>Usuario</span>
            <strong>{data?.perfil?.nombre || "-"}</strong>
          </div>
          <div>
            <span>Rol</span>
            <strong>{data?.perfil?.rol || "-"}</strong>
          </div>
        </div>
      </article>
    </section>
  );
}

function Empresa({ token, initialEmpresa, onSaved }) {
  const [form, setForm] = useState({ ...emptyEmpresa, ...(initialEmpresa || {}) });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setForm({ ...emptyEmpresa, ...(initialEmpresa || {}) });
  }, [initialEmpresa]);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function save(event) {
    event.preventDefault();
    setError("");
    setStatus("");
    try {
      const data = await request("/api/empresa", { method: "PUT", body: JSON.stringify(form) }, token);
      setStatus("Empresa actualizada.");
      onSaved(data.empresa);
    } catch (apiError) {
      setError(apiError.message);
    }
  }

  return (
    <section className="panel">
      <h2>Datos de empresa</h2>
      <form className="form grid-form" onSubmit={save}>
        {Object.keys(emptyEmpresa).map((field) => (
          <label key={field}>
            {field.replace("_", " ")}
            <input name={field} value={form[field] || ""} onChange={updateField} required={field === "nombre"} />
          </label>
        ))}
        {error ? <div className="alert error span-2">{error}</div> : null}
        {status ? <div className="alert ok span-2">{status}</div> : null}
        <button className="button primary span-2" type="submit">
          <Save size={18} />
          Guardar empresa
        </button>
      </form>
    </section>
  );
}

function Clientes({ token }) {
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState(emptyCliente);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    const data = await request("/api/clientes", {}, token);
    setClientes(data.clientes || []);
  }

  useEffect(() => {
    load().catch((apiError) => setError(apiError.message));
  }, []);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function save(event) {
    event.preventDefault();
    setError("");
    try {
      const path = editingId ? `/api/clientes/${editingId}` : "/api/clientes";
      const method = editingId ? "PUT" : "POST";
      await request(path, { method, body: JSON.stringify(form) }, token);
      setForm(emptyCliente);
      setEditingId(null);
      await load();
    } catch (apiError) {
      setError(apiError.message);
    }
  }

  async function remove(cliente) {
    if (!window.confirm(`Eliminar ${cliente.nombre}?`)) return;
    await request(`/api/clientes/${cliente.id}`, { method: "DELETE" }, token);
    await load();
  }

  return (
    <section className="split">
      <article className="panel">
        <h2>{editingId ? "Editar cliente" : "Crear cliente"}</h2>
        <form className="form" onSubmit={save}>
          {Object.keys(emptyCliente).map((field) => (
            <label key={field}>
              {field}
              <input name={field} value={form[field]} onChange={updateField} required={field === "nombre"} />
            </label>
          ))}
          {error ? <div className="alert error">{error}</div> : null}
          <button className="button primary full" type="submit">
            <Save size={18} />
            Guardar
          </button>
        </form>
      </article>
      <article className="panel table-panel">
        <h2>Clientes</h2>
        <DataTable
          rows={clientes}
          columns={["nombre", "email", "telefono", "identificacion"]}
          actions={(row) => (
            <>
              <button className="icon-button" type="button" onClick={() => { setEditingId(row.id); setForm({ ...emptyCliente, ...row }); }}>
                <Edit3 size={16} />
              </button>
              <button className="icon-button danger" type="button" onClick={() => remove(row)}>
                <Trash2 size={16} />
              </button>
            </>
          )}
        />
      </article>
    </section>
  );
}

function Cotizaciones({ token }) {
  const [clientes, setClientes] = useState([]);
  const [cotizaciones, setCotizaciones] = useState([]);
  const [form, setForm] = useState(emptyCotizacion);
  const [error, setError] = useState("");

  async function load() {
    const [clientesData, cotizacionesData] = await Promise.all([
      request("/api/clientes", {}, token),
      request("/api/cotizaciones", {}, token),
    ]);
    setClientes(clientesData.clientes || []);
    setCotizaciones(cotizacionesData.cotizaciones || []);
  }

  useEffect(() => {
    load().catch((apiError) => setError(apiError.message));
  }, []);

  const totals = useMemo(() => {
    const subtotal = form.items.reduce((sum, item) => sum + Number(item.cantidad || 0) * Number(item.precio_unitario || 0), 0);
    const iva = subtotal * 0.15;
    return { subtotal, iva, total: subtotal + iva };
  }, [form.items]);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function updateItem(index, field, value) {
    setForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)),
    }));
  }

  async function save(event) {
    event.preventDefault();
    setError("");
    try {
      await request("/api/cotizaciones", { method: "POST", body: JSON.stringify(form) }, token);
      setForm(emptyCotizacion);
      await load();
    } catch (apiError) {
      setError(apiError.message);
    }
  }

  async function setEstado(cotizacion, estado) {
    await request(`/api/cotizaciones/${cotizacion.id}/estado`, { method: "PATCH", body: JSON.stringify({ estado }) }, token);
    await load();
  }

  async function openPdf(cotizacion) {
    const response = await fetch(`${API_URL}/api/cotizaciones/${cotizacion.id}/pdf`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      setError("No se pudo abrir el PDF.");
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  }

  return (
    <section className="split">
      <article className="panel">
        <h2>Crear cotizacion</h2>
        <form className="form" onSubmit={save}>
          <label>
            Cliente
            <select name="cliente_id" value={form.cliente_id} onChange={updateField} required>
              <option value="">Seleccionar</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>{cliente.nombre}</option>
              ))}
            </select>
          </label>
          <label>
            Fecha
            <input name="fecha" type="date" value={form.fecha} onChange={updateField} required />
          </label>
          <label>
            Vencimiento
            <input name="vencimiento" type="date" value={form.vencimiento} onChange={updateField} />
          </label>
          <label>
            Notas
            <input name="notas" value={form.notas} onChange={updateField} />
          </label>

          <div className="items-box">
            {form.items.map((item, index) => (
              <div className="item-row" key={index}>
                <input value={item.descripcion} onChange={(event) => updateItem(index, "descripcion", event.target.value)} placeholder="Descripcion" required />
                <input value={item.cantidad} onChange={(event) => updateItem(index, "cantidad", event.target.value)} type="number" min="1" step="0.01" required />
                <input value={item.precio_unitario} onChange={(event) => updateItem(index, "precio_unitario", event.target.value)} type="number" min="0" step="0.01" required />
                <button className="icon-button danger" type="button" onClick={() => setForm((current) => ({ ...current, items: current.items.filter((_, itemIndex) => itemIndex !== index) }))}>
                  <X size={16} />
                </button>
              </div>
            ))}
            <button className="button secondary" type="button" onClick={() => setForm((current) => ({ ...current, items: [...current.items, { descripcion: "", cantidad: 1, precio_unitario: 0 }] }))}>
              <Plus size={18} />
              Agregar item
            </button>
          </div>

          <div className="totals">
            <span>Subtotal {formatMoney(totals.subtotal)}</span>
            <span>IVA {formatMoney(totals.iva)}</span>
            <strong>Total {formatMoney(totals.total)}</strong>
          </div>

          {error ? <div className="alert error">{error}</div> : null}
          <button className="button primary full" type="submit">
            <Save size={18} />
            Guardar cotizacion
          </button>
        </form>
      </article>
      <article className="panel table-panel">
        <h2>Cotizaciones</h2>
        <DataTable
          rows={cotizaciones}
          columns={["numero", "estado", "total"]}
          format={(column, value) => (column === "total" ? formatMoney(value) : value)}
          actions={(row) => (
            <>
              <button className="icon-button" type="button" onClick={() => setEstado(row, "enviada")}>
                <Send size={16} />
              </button>
              <button className="icon-button" type="button" onClick={() => setEstado(row, "aprobada")}>
                <CheckCircle2 size={16} />
              </button>
              <button className="icon-button" type="button" onClick={() => openPdf(row)}>
                <Download size={16} />
              </button>
            </>
          )}
        />
      </article>
    </section>
  );
}

function DataTable({ rows, columns, actions, format = (_column, value) => value }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => <th key={column}>{column}</th>)}
            {actions ? <th>acciones</th> : null}
          </tr>
        </thead>
        <tbody>
          {rows.length ? rows.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => <td key={column}>{format(column, row[column]) || "-"}</td>)}
              {actions ? <td><div className="row-actions">{actions(row)}</div></td> : null}
            </tr>
          )) : (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} className="empty">Sin registros.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function App() {
  const [session, setSession] = useState(getStoredSession);
  const [active, setActive] = useState("dashboard");
  const [me, setMe] = useState(null);
  const [error, setError] = useState("");

  const token = session?.access_token;

  useEffect(() => {
    if (!token) return;
    request("/api/me", {}, token)
      .then(setMe)
      .catch((apiError) => setError(apiError.message));
  }, [token]);

  function login(newSession) {
    localStorage.setItem("cotizapro_session", JSON.stringify(newSession));
    setSession(newSession);
  }

  function logout() {
    localStorage.removeItem("cotizapro_session");
    setSession(null);
    setMe(null);
  }

  if (!session) {
    return <AuthPage onLogin={login} />;
  }

  return (
    <Shell session={session} active={active} setActive={setActive} onLogout={logout}>
      {error ? <div className="alert error">{error}</div> : null}
      {active === "dashboard" ? <Dashboard data={me} /> : null}
      {active === "empresa" ? <Empresa token={token} initialEmpresa={me?.empresa} onSaved={(empresa) => setMe((current) => ({ ...current, empresa }))} /> : null}
      {active === "clientes" ? <Clientes token={token} /> : null}
      {active === "cotizaciones" ? <Cotizaciones token={token} /> : null}
    </Shell>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
