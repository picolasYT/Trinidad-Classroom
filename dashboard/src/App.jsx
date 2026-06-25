import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function formatBytes(value) {
  if (!value) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let size = value;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size.toFixed(1)} ${units[unit]}`;
}

function StatCard({ title, value, tone }) {
  return (
    <div className={`rounded-3xl border border-white/10 bg-white/5 p-5 shadow-panel backdrop-blur ${tone}`}>
      <div className="text-sm uppercase tracking-[0.25em] text-slate-300">{title}</div>
      <div className="mt-3 text-3xl font-semibold text-white">{value}</div>
    </div>
  );
}

function Login({ onLogin }) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("trinidad@2026");
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setError("");

    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "No se pudo iniciar sesion");
      return;
    }

    localStorage.setItem("trinidad_token", data.token);
    localStorage.setItem("trinidad_user", JSON.stringify(data.user));
    onLogin(data.token, data.user);
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-panel backdrop-blur">
        <div className="text-sm uppercase tracking-[0.3em] text-ocean">Aula Trinidad</div>
        <h1 className="mt-3 text-3xl font-semibold text-white">Panel administrador</h1>
        <p className="mt-2 text-sm text-slate-300">Profesores y directivos pueden administrar el aula en tiempo real.</p>
        <input className="mt-6 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Usuario" />
        <input className="mt-3 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Clave" type="password" />
        {error ? <div className="mt-3 text-sm text-rose-300">{error}</div> : null}
        <button className="mt-6 w-full rounded-2xl bg-ocean px-4 py-3 font-medium text-slate-950 transition hover:bg-teal-300">Entrar</button>
      </form>
    </div>
  );
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("trinidad_token"));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("trinidad_user");
    return raw ? JSON.parse(raw) : null;
  });
  const [dashboard, setDashboard] = useState({ computers: [], summary: {} });
  const [selected, setSelected] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!token) return;

    const socket = io(API_URL);
    socket.emit("dashboard:join");
    socket.on("dashboard:update", (data) => {
      setDashboard(data);
      if (selectedId) {
        const nextSelected = data.computers.find((pc) => pc.computer_id === selectedId);
        setSelected(nextSelected || null);
      }
    });

    fetch(`${API_URL}/api/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => setDashboard(data));

    return () => socket.disconnect();
  }, [token, selectedId]);

  if (!token || !user) {
    return <Login onLogin={(nextToken, nextUser) => { setToken(nextToken); setUser(nextUser); }} />;
  }

  const summary = dashboard.summary || {};

  async function sendAction(path, body = {}) {
    if (!selected) return;
    await fetch(`${API_URL}/api/computers/${selected.computer_id}/${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
  }

  return (
    <div className="min-h-screen px-6 py-8">
      <header className="mx-auto max-w-7xl">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-panel backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-sm uppercase tracking-[0.35em] text-ocean">Trinidad Classroom</div>
              <h1 className="mt-2 text-4xl font-semibold text-white">Control del aula en tiempo real</h1>
              <p className="mt-2 max-w-3xl text-slate-300">
                Estado de equipos, alumnos activos, avisos, bloqueos, red y vista rapida de pantalla.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-200">
              {user.username} | {user.role}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto mt-6 grid max-w-7xl gap-6 lg:grid-cols-[1.35fr_0.9fr]">
        <section className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard title="Equipos" value={summary.total || 0} tone="from-emerald-400/10" />
            <StatCard title="Conectadas" value={summary.connected || 0} tone="from-teal-400/10" />
            <StatCard title="Libres" value={summary.free || 0} tone="from-sky-400/10" />
            <StatCard title="Bloqueadas" value={summary.locked || 0} tone="from-rose-400/10" />
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-panel backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-medium text-white">Computadoras del aula</h2>
              <span className="text-sm text-slate-400">Vista general</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {dashboard.computers.map((pc) => (
                <button
                  key={pc.computer_id}
                  onClick={() => {
                    setSelected(pc);
                    setSelectedId(pc.computer_id);
                  }}
                  className={`rounded-3xl border p-5 text-left transition ${
                    selected?.computer_id === pc.computer_id
                      ? "border-ocean bg-ocean/10"
                      : "border-white/10 bg-slate-950/30 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-semibold text-white">{pc.computer_id}</div>
                    <div className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em] ${
                      pc.status === "connected"
                        ? "bg-emerald-400/20 text-emerald-200"
                        : pc.status === "free"
                          ? "bg-sky-400/20 text-sky-200"
                          : "bg-slate-500/20 text-slate-300"
                    }`}>
                      {pc.status}
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-slate-300">
                    Alumno: {pc.current_student_name || "Sin sesion"}
                  </div>
                  <div className="mt-2 text-sm text-slate-400">
                    IP: {pc.ip_address || "sin dato"}
                  </div>
                  <div className="mt-2 text-sm text-slate-400">
                    Bloqueo: {pc.is_locked ? "Si" : "No"}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-panel backdrop-blur">
            <h2 className="text-xl font-medium text-white">Detalle del equipo</h2>
            {!selected ? (
              <p className="mt-4 text-sm text-slate-400">Selecciona una computadora para ver y administrar su sesion.</p>
            ) : (
              <>
                <div className="mt-4 text-2xl font-semibold text-white">{selected.computer_id}</div>
                <div className="mt-1 text-sm text-slate-300">Alumno actual: {selected.current_student_name || "Sin alumno"}</div>
                <div className="mt-1 text-sm text-slate-300">Ultima conexion: {selected.last_seen_at || "sin datos"}</div>
                <div className="mt-1 text-sm text-slate-300">Red: RX {formatBytes(selected.network_rx_bytes)} | TX {formatBytes(selected.network_tx_bytes)}</div>

                <div className="mt-5 grid gap-3">
                  <textarea
                    value={notice}
                    onChange={(e) => setNotice(e.target.value)}
                    className="min-h-24 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
                    placeholder="Escribe un aviso para el alumno..."
                  />
                  <button onClick={() => sendAction("message", { message: notice })} className="rounded-2xl bg-sand px-4 py-3 font-medium text-slate-950">
                    Enviar aviso
                  </button>
                  <button onClick={() => sendAction("lock")} className="rounded-2xl bg-rose-500 px-4 py-3 font-medium text-white">
                    Bloquear equipo
                  </button>
                  <button onClick={() => sendAction("unlock")} className="rounded-2xl bg-emerald-500 px-4 py-3 font-medium text-slate-950">
                    Desbloquear equipo
                  </button>
                  <button onClick={() => sendAction("logout")} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-medium text-white">
                    Cerrar sesion del alumno
                  </button>
                </div>

                {selected.last_screenshot ? (
                  <div className="mt-5">
                    <div className="mb-2 text-sm uppercase tracking-[0.2em] text-slate-400">Vista de pantalla</div>
                    <img src={selected.last_screenshot} alt="Captura del alumno" className="w-full rounded-2xl border border-white/10 object-cover" />
                  </div>
                ) : null}

                <div className="mt-5">
                  <div className="mb-2 text-sm uppercase tracking-[0.2em] text-slate-400">Aplicaciones recientes</div>
                  <div className="flex flex-wrap gap-2">
                    {(selected.recentApps || []).map((item, index) => (
                      <span key={`${item.app_name}-${index}`} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                        {item.app_name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5">
                  <div className="mb-2 text-sm uppercase tracking-[0.2em] text-slate-400">Sitios recientes</div>
                  <div className="space-y-2">
                    {(selected.recentWebsites || []).map((item, index) => (
                      <div key={`${item.url}-${index}`} className="rounded-2xl border border-white/10 bg-black/20 p-3 text-sm">
                        <div className="text-white">{item.title || "Sitio escolar detectado"}</div>
                        <div className="truncate text-slate-400">{item.url}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}
