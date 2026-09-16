import { useEffect, useMemo, useState } from "react";
import { AREAS, NIVELES, RECURSOS_INICIALES, ROLES, TIPOS } from "./data/recursos.js";
import "./App.css";

const LS_KEY = "repo-recursos-v1";

function loadRecursos() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return RECURSOS_INICIALES;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return RECURSOS_INICIALES;
    return parsed;
  } catch {
    return RECURSOS_INICIALES;
  }
}

function Stars({ value }) {
  const full = Math.round(value);
  return (
    <span className="stars" aria-label={`Calificación ${value} de 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= full ? "on" : "off"}>★</span>
      ))}
    </span>
  );
}

export default function App() {
  const [vista, setVista] = useState("inicio");
  const [recursos, setRecursos] = useState(loadRecursos);
  const [q, setQ] = useState("");
  const [fTipo, setFTipo] = useState("Todos");
  const [fArea, setFArea] = useState("Todas");
  const [fNivel, setFNivel] = useState("Todos");
  const [orden, setOrden] = useState("relevancia");
  const [rol, setRol] = useState("docente");
  const [detalle, setDetalle] = useState(null);
  const [miVoto, setMiVoto] = useState(5);
  const [form, setForm] = useState({
    titulo: "", autor: "", tipo: "Video", area: "Didáctica TIC",
    nivel: "Superior", descripcion: "", licencia: "CC BY 4.0", formato: "PDF", url: "",
  });

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(recursos));
  }, [recursos]);

  const filtrados = useMemo(() => {
    let list = [...recursos];
    const query = q.trim().toLowerCase();
    if (query) {
      list = list.filter((r) =>
        [r.titulo, r.autor, r.descripcion, r.tipo, r.area].join(" ").toLowerCase().includes(query)
      );
    }
    if (fTipo !== "Todos") list = list.filter((r) => r.tipo === fTipo);
    if (fArea !== "Todas") list = list.filter((r) => r.area === fArea);
    if (fNivel !== "Todos") list = list.filter((r) => r.nivel === fNivel || r.nivel === "Todos");
    if (orden === "rating") list.sort((a, b) => b.rating - a.rating);
    if (orden === "descargas") list.sort((a, b) => b.descargas - a.descargas);
    if (orden === "recientes") list.sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""));
    return list;
  }, [recursos, q, fTipo, fArea, fNivel, orden]);

  const stats = useMemo(() => ({
    total: recursos.length,
    descargas: recursos.reduce((s, r) => s + (r.descargas || 0), 0),
    autores: new Set(recursos.map((r) => r.autor)).size,
    tipos: new Set(recursos.map((r) => r.tipo)).size,
  }), [recursos]);

  function descargar(recurso) {
    setRecursos((prev) => prev.map((r) => r.id === recurso.id ? { ...r, descargas: (r.descargas || 0) + 1 } : r));
    if (detalle && detalle.id === recurso.id) {
      setDetalle({ ...detalle, descargas: (detalle.descargas || 0) + 1 });
    }
  }

  function votar() {
    if (!detalle) return;
    const nuevoVotos = (detalle.votos || 0) + 1;
    const nuevoRating = ((detalle.rating * (detalle.votos || 0) + miVoto) / nuevoVotos);
    const actualizado = { ...detalle, votos: nuevoVotos, rating: Math.round(nuevoRating * 10) / 10 };
    setRecursos((prev) => prev.map((r) => r.id === detalle.id ? actualizado : r));
    setDetalle(actualizado);
  }

  function eliminar(id) {
    if (rol !== "admin") return alert("Solo el rol Administrador puede eliminar (demo de permisos por rol).");
    if (!confirm("¿Eliminar este recurso del prototipo?")) return;
    setRecursos((prev) => prev.filter((r) => r.id !== id));
    setDetalle(null);
  }

  function subir(e) {
    e.preventDefault();
    if (rol === "estudiante") return alert("El rol Estudiante no puede subir (demo de permisos). Cambia a Docente.");
    if (!form.titulo.trim() || !form.autor.trim() || !form.descripcion.trim()) {
      return alert("Completa título, autor y descripción (metadatos mínimos).");
    }
    const nuevo = {
      id: "r" + Date.now(),
      ...form,
      fecha: new Date().toISOString().slice(0, 10),
      idioma: "Español",
      descargas: 0,
      rating: 5,
      votos: 1,
    };
    setRecursos((prev) => [nuevo, ...prev]);
    setForm({ titulo: "", autor: "", tipo: "Video", area: "Didáctica TIC", nivel: "Superior", descripcion: "", licencia: "CC BY 4.0", formato: "PDF", url: "" });
    setVista("explorar");
    alert("Recurso publicado en el prototipo (flujo: borrador → revisión → publicado).");
  }

  const rolActual = ROLES.find((r) => r.id === rol);

  return (
    <div className="page">
      <header className="topbar">
        <div className="brand" onClick={() => setVista("inicio")}>
          <span className="logo">◈</span>
          <div>
            <strong>EduRepo · Didáctica TIC</strong>
            <small>Prototipo Actividad 2 · Unicartagena</small>
          </div>
        </div>
        <nav>
          <button className={vista === "inicio" ? "active" : ""} onClick={() => setVista("inicio")}>Inicio</button>
          <button className={vista === "explorar" ? "active" : ""} onClick={() => setVista("explorar")}>Explorar</button>
          <button className={vista === "subir" ? "active" : ""} onClick={() => setVista("subir")}>Subir</button>
          <button className={vista === "roles" ? "active" : ""} onClick={() => setVista("roles")}>Roles</button>
          <button className={vista === "teoria" ? "active" : ""} onClick={() => setVista("teoria")}>Teoría</button>
        </nav>
        <div className="role-switch">
          <label>Rol:</label>
          <select value={rol} onChange={(e) => setRol(e.target.value)}>
            {ROLES.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
          </select>
        </div>
      </header>

      {vista === "inicio" && (
        <main>
          <section className="hero">
            <div>
              <span className="pill">Actividad 2 · Diseño y prototipo de un repositorio</span>
              <h1>Repositorio de Recursos Digitales para la enseñanza</h1>
              <p>
                Prototipo navegable para un contexto educativo específico: la Especialización en Didáctica TIC.
                Almacena, organiza con metadatos, comparte y evalúa RED: videos, guías, OVA, infografías y simuladores.
              </p>
              <div className="cta">
                <button className="primary" onClick={() => setVista("explorar")}>Explorar {stats.total} recursos</button>
                <button onClick={() => setVista("subir")}>Subir un recurso</button>
              </div>
              <div className="mini-stats">
                <div><strong>{stats.total}</strong><span>recursos</span></div>
                <div><strong>{stats.descargas}</strong><span>descargas</span></div>
                <div><strong>{stats.tipos}</strong><span>tipos</span></div>
                <div><strong>{stats.autores}</strong><span>autores</span></div>
              </div>
            </div>
            <div className="hero-card">
              <h3>¿Qué incluye este prototipo?</h3>
              <ul>
                <li>✓ Tipos de recursos + metadatos Dublin Core</li>
                <li>✓ Roles: admin, docente, estudiante</li>
                <li>✓ Flujo carga → revisión → descarga</li>
                <li>✓ Búsqueda, filtros y evaluación 1-5</li>
              </ul>
              <p className="muted">Todo funciona en local (localStorage). Listo para sustentar sin backend.</p>
            </div>
          </section>

          <section className="grid3">
            <div className="card"><h3>📚 Tipos incluidos</h3><p>{TIPOS.join(" · ")}</p></div>
            <div className="card"><h3>🏷️ Metadatos</h3><p>Título, autor, tipo, área, nivel, descripción, licencia, formato, fecha, idioma, URL.</p></div>
            <div className="card"><h3>⭐ Evaluación</h3><p>Rating 1-5, votos, contador de descargas y comentarios de aula.</p></div>
          </section>

          <section className="card wide">
            <h2>Diferencia clave: repositorio vs biblioteca</h2>
            <div className="table-wrap">
              <table>
                <thead><tr><th></th><th>Repositorio (este prototipo)</th><th>Biblioteca</th></tr></thead>
                <tbody>
                  <tr><td>Contenido</td><td>Académico digital de la institución</td><td>Variado, múltiples autores</td></tr>
                  <tr><td>Formato</td><td>Digital</td><td>Físico y digital</td></tr>
                  <tr><td>Acceso</td><td>Abierto, en línea</td><td>Consulta / préstamo</td></tr>
                  <tr><td>Organización</td><td>Metadatos</td><td>Catálogo bibliográfico</td></tr>
                </tbody>
              </table>
            </div>
          </section>
        </main>
      )}

      {vista === "explorar" && (
        <main>
          <section className="toolbar card">
            <input placeholder="Buscar por título, autor, tema… (ej. metadatos, APA, rural)" value={q} onChange={(e) => setQ(e.target.value)} />
            <div className="filters">
              <select value={fTipo} onChange={(e) => setFTipo(e.target.value)}>
                <option>Todos</option>{TIPOS.map((t) => <option key={t}>{t}</option>)}
              </select>
              <select value={fArea} onChange={(e) => setFArea(e.target.value)}>
                <option>Todas</option>{AREAS.map((a) => <option key={a}>{a}</option>)}
              </select>
              <select value={fNivel} onChange={(e) => setFNivel(e.target.value)}>
                <option>Todos</option>{NIVELES.map((n) => <option key={n}>{n}</option>)}
              </select>
              <select value={orden} onChange={(e) => setOrden(e.target.value)}>
                <option value="relevancia">Orden: relevancia</option>
                <option value="rating">Mejor calificados</option>
                <option value="descargas">Más descargados</option>
                <option value="recientes">Más recientes</option>
              </select>
            </div>
            <p className="muted">{filtrados.length} resultado(s) · Rol actual: <strong>{rolActual.nombre}</strong></p>
          </section>

          <section className="cards">
            {filtrados.map((r) => (
              <article key={r.id} className="card recurso">
                <div className="tags"><span className="tag">{r.tipo}</span><span className="tag ghost">{r.area}</span><span className="tag ghost">{r.nivel}</span></div>
                <h3>{r.titulo}</h3>
                <p className="muted">por {r.autor} · {r.fecha}</p>
                <p className="desc">{r.descripcion}</p>
                <div className="row"><Stars value={r.rating} /><small>{r.rating} ({r.votos} votos) · ⬇ {r.descargas}</small></div>
                <div className="row">
                  <button className="primary sm" onClick={() => setDetalle(r)}>Ver ficha</button>
                  <button className="sm" onClick={() => descargar(r)}>Descargar</button>
                </div>
              </article>
            ))}
            {filtrados.length === 0 && <p className="muted">Sin resultados. Prueba con otra búsqueda o limpia los filtros.</p>}
          </section>
        </main>
      )}

      {vista === "subir" && (
        <main>
          <section className="card wide">
            <h2>Subir recurso — flujo: borrador → revisión → publicado</h2>
            <p className="muted">Rol actual: <strong>{rolActual.nombre}</strong>. {rol === "estudiante" ? "Los estudiantes no pueden subir en esta demo." : "Completa los metadatos mínimos (Dublin Core adaptado)."}</p>
            <form onSubmit={subir} className="form">
              <label>Título*<input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Ej. Guía: …" /></label>
              <label>Autor*<input value={form.autor} onChange={(e) => setForm({ ...form, autor: e.target.value })} placeholder="Ej. Grupo 3" /></label>
              <div className="form-row">
                <label>Tipo<select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>{TIPOS.map((t) => <option key={t}>{t}</option>)}</select></label>
                <label>Área<select value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })}>{AREAS.map((a) => <option key={a}>{a}</option>)}</select></label>
                <label>Nivel<select value={form.nivel} onChange={(e) => setForm({ ...form, nivel: e.target.value })}>{NIVELES.map((n) => <option key={n}>{n}</option>)}</select></label>
              </div>
              <label>Descripción* (¿para qué sirve en clase?)<textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} rows={4} /></label>
              <div className="form-row">
                <label>Licencia<select value={form.licencia} onChange={(e) => setForm({ ...form, licencia: e.target.value })}><option>CC BY 4.0</option><option>CC BY-SA 4.0</option><option>CC BY-NC 4.0</option><option>CC BY-NC-SA 4.0</option></select></label>
                <label>Formato<input value={form.formato} onChange={(e) => setForm({ ...form, formato: e.target.value })} /></label>
                <label>URL / enlace<input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://…" /></label>
              </div>
              <button className="primary" type="submit">Publicar en el prototipo</button>
            </form>
          </section>
        </main>
      )}

      {vista === "roles" && (
        <main>
          <section className="grid3">
            {ROLES.map((r) => (
              <div key={r.id} className={`card ${rol === r.id ? "selected" : ""}`}>
                <h3>{r.nombre}</h3>
                <p className="muted">{r.descripcion}</p>
                <ul>{r.permisos.map((p) => <li key={p}>{p}</li>)}</ul>
                <button className={rol === r.id ? "primary sm" : "sm"} onClick={() => setRol(r.id)}>
                  {rol === r.id ? "Rol activo" : "Probar este rol"}
                </button>
              </div>
            ))}
          </section>
          <section className="card wide">
            <h2>Flujo de trabajo (para el documento)</h2>
            <p><strong>Carga:</strong> docente completa metadatos → estado <em>revisión</em> → admin aprueba → <em>publicado</em>.</p>
            <p><strong>Descarga:</strong> visitante busca/filtra → abre ficha → verifica licencia → descarga → el contador aumenta.</p>
            <p><strong>Evaluación:</strong> rating 1-5 + votos + descargas como señal de calidad para la rúbrica del docente.</p>
          </section>
        </main>
      )}

      {vista === "teoria" && (
        <main>
          <section className="card wide">
            <h2>Marco del prototipo (insumo para tu PDF APA v7)</h2>
            <p><strong>Contexto:</strong> Repositorio temático de Recursos Educativos Digitales para la Especialización en Didáctica TIC, Universidad de Cartagena.</p>
            <p><strong>Definición:</strong> espacio digital que almacena, preserva, organiza (con metadatos) y comparte RED para apoyar educación e investigación sin depender de tiempo ni lugar.</p>
            <h3>Tipos de repositorios</h3>
            <p>Institucional · Temático (este) · Científico · De datos · Multimedia · De software · Acceso abierto · Privado.</p>
            <h3>Metadatos del prototipo</h3>
            <p>Título, autor, tipo, área, nivel, descripción, licencia, formato, fecha, idioma, URL, descargas, rating.</p>
            <h3>Derechos y entrega</h3>
            <p>Respeto a Ley 23 de 1982 y Ley 1915 de 2018, cita APA v7 y declaración de uso de IA. Entrega: PDF formal (portada, introducción, producto/enlace, citas, referencias) + enlace a esta interfaz.</p>
          </section>
        </main>
      )}

      {detalle && (
        <div className="modal" onClick={() => setDetalle(null)}>
          <div className="modal-body" onClick={(e) => e.stopPropagation()}>
            <div className="tags"><span className="tag">{detalle.tipo}</span><span className="tag ghost">{detalle.area}</span><span className="tag ghost">{detalle.nivel}</span></div>
            <h2>{detalle.titulo}</h2>
            <p className="muted">por {detalle.autor}</p>
            <p>{detalle.descripcion}</p>
            <div className="table-wrap">
              <table>
                <tbody>
                  {[["Licencia", detalle.licencia], ["Formato", detalle.formato], ["Fecha", detalle.fecha], ["Idioma", detalle.idioma], ["Descargas", detalle.descargas], ["Calificación", `${detalle.rating} (${detalle.votos} votos)`]].map(([k, v]) => (
                    <tr key={k}><td><strong>{k}</strong></td><td>{v}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="row">
              <button className="primary sm" onClick={() => descargar(detalle)}>⬇ Descargar</button>
              <label className="vote">Tu voto:
                <select value={miVoto} onChange={(e) => setMiVoto(Number(e.target.value))}>
                  {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </label>
              <button className="sm" onClick={votar}>Votar</button>
              <button className="sm danger" onClick={() => eliminar(detalle.id)}>Eliminar (admin)</button>
              <button className="sm" onClick={() => setDetalle(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      <footer>
        <small>EduRepo · Prototipo Actividad 2 — Especialización Didáctica TIC · Universidad de Cartagena · Uso académico · Respeta derechos de autor (Ley 23/1982, Ley 1915/2018) y cita en APA v7.</small>
      </footer>
    </div>
  );
}
