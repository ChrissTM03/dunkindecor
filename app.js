// DunkinDecor - actualización: consolidado por fechas y total de Cuadradas
// Conserva Firebase Realtime Database y la estructura de datos existente.

const firebaseConfig = {
  apiKey: "AIzaSyDb4s_h95yOdIoPAoT53W6gFP4iBCC3q9Y",
  authDomain: "dunkindecor.firebaseapp.com",
  databaseURL: "https://dunkindecor-default-rtdb.firebaseio.com/",
  projectId: "dunkindecor",
  storageBucket: "dunkindecor.firebasestorage.app",
  messagingSenderId: "204804849164",
  appId: "1:204804849164:web:e3083e771d84662752f829",
  measurementId: "G-50DQMHRGH4"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const DONAS = [
  "Anillo Choco arcoiris", "Anillo Araña", "Anillo Chocolate",
  "Anillo Fresa arcoiris", "Anillo Vainilla arcoiris", "Anillo Chicle arcoiris",
  "Anillo Avellana", "Anillo Glaseado", "Anillo Vainilla oreo", "Anillo Indecisa",
  "Cuadrada Dracula",
  "Rellena Manjar", "Rellena Chocomanjar", "Rellena Carita Feliz",
  "Rellena Calavera", "Rellena Frankenstein", "Rellena Manjar Oreo",
  "Rellena Cookie Monster", "Rellena Bavaria", "Rellena Boston Cream",
  "Rellena Mora", "Rellena Mora Glaseada",
  "Antojito Manjar", "Antojito Glaseado", "Antojito Mora", "Antojito Bavaria"
];

let tempDonas = {};
let registrosCache = {};

function fechaAISO(fechaStr) {
  if (!fechaStr || typeof fechaStr !== "string") return "";
  const partes = fechaStr.split("-");
  if (partes.length !== 3) return "";
  const [dia, mes, anio] = partes;
  if (!dia || !mes || !anio) return "";
  return `${anio}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

function fechaDesdeISO(iso) {
  if (!iso) return getFechaStr();
  const [anio, mes, dia] = iso.split("-");
  return `${dia}-${mes}-${anio}`;
}

function getFechaStr() {
  const fecha = new Date();
  return `${String(fecha.getDate()).padStart(2, "0")}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${fecha.getFullYear()}`;
}

function escaparHTML(valor) {
  return String(valor ?? "").replace(/[&<>"']/g, caracter => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[caracter]));
}

function tipoDona(nombre) {
  const n = String(nombre).trim().toUpperCase();
  if (n.startsWith("ANILLO")) return "anillos";
  if (n.startsWith("RELLENA")) return "rellenas";
  if (n.startsWith("ANTOJITO")) return "antojitos";
  if (n.startsWith("CUADRADA")) return "cuadradas";
  return "otros";
}

function contarCategorias(donas) {
  const totales = { anillos: 0, rellenas: 0, antojitos: 0, cuadradas: 0, otros: 0, general: 0 };
  Object.entries(donas || {}).forEach(([nombre, cantidad]) => {
    const valor = Number(cantidad) || 0;
    if (valor <= 0) return;
    totales[tipoDona(nombre)] += valor;
    totales.general += valor;
  });
  return totales;
}

function mostrarPopup(html) {
  let popup = document.getElementById("popup-registro");
  if (!popup) {
    popup = document.createElement("div");
    popup.id = "popup-registro";
    Object.assign(popup.style, {
      position: "fixed", inset: "0", width: "100vw", height: "100vh",
      background: "rgba(0,0,0,.55)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: "9999",
      overflowY: "auto", padding: "16px", boxSizing: "border-box"
    });
    document.body.appendChild(popup);
  }
  popup.innerHTML = `<div class="popup-contenido" style="background:#fff;color:#222;max-width:950px;width:100%;max-height:90vh;overflow:auto;padding:20px;border-radius:12px;box-sizing:border-box">${html}</div>`;
}

function cerrarPopup() {
  document.getElementById("popup-registro")?.remove();
  tempDonas = {};
}

window.cerrarPopup = cerrarPopup;

function renderTablaRegistros(registros) {
  const contenedor = document.getElementById("tabla-registros");
  if (!contenedor) return;

  const ordenados = Object.entries(registros || {}).sort((a, b) => {
    const fa = fechaAISO(a[1]?.fecha);
    const fb = fechaAISO(b[1]?.fecha);
    return fb.localeCompare(fa) || b[0].localeCompare(a[0]);
  });

  contenedor.innerHTML = `
    <section class="filtro-consolidado" style="margin:18px 0;padding:16px;border:1px solid #ddd;border-radius:10px">
      <h2 style="margin-top:0">Consolidado por rango de fechas</h2>
      <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:end">
        <label>Desde<br><input type="date" id="consolidado-desde"></label>
        <label>Hasta<br><input type="date" id="consolidado-hasta"></label>
        <button type="button" id="consultar-consolidado">Consultar consolidado</button>
        <button type="button" id="limpiar-consolidado">Limpiar</button>
      </div>
      <div id="resultado-consolidado" style="margin-top:14px"></div>
    </section>
    <h2>Registros guardados</h2>
    <table>
      <thead><tr><th>Fecha</th><th>Estado</th><th>Acciones</th></tr></thead>
      <tbody>
        ${ordenados.map(([id, data]) => `
          <tr>
            <td>${escaparHTML(data?.fecha || "Sin fecha")}</td>
            <td>${data?.generado ? "GENERADO" : "EDITABLE"}</td>
            <td>
              <button type="button" onclick="verRegistro('${id}')">VER</button>
              <button type="button" onclick="eliminarRegistro('${id}')">ELIMINAR</button>
            </td>
          </tr>`).join("")}
      </tbody>
    </table>`;

  document.getElementById("consultar-consolidado").onclick = consultarConsolidado;
  document.getElementById("limpiar-consolidado").onclick = () => {
    document.getElementById("consolidado-desde").value = "";
    document.getElementById("consolidado-hasta").value = "";
    document.getElementById("resultado-consolidado").innerHTML = "";
  };
}

function consultarConsolidado() {
  const desde = document.getElementById("consolidado-desde").value;
  const hasta = document.getElementById("consolidado-hasta").value;
  const salida = document.getElementById("resultado-consolidado");

  if (!desde || !hasta) {
    salida.innerHTML = '<p style="color:#b00020">Selecciona la fecha inicial y la fecha final.</p>';
    return;
  }
  if (desde > hasta) {
    salida.innerHTML = '<p style="color:#b00020">La fecha inicial no puede ser posterior a la fecha final.</p>';
    return;
  }

  const seleccionados = Object.entries(registrosCache).filter(([, registro]) => {
    const fecha = fechaAISO(registro?.fecha);
    return fecha && fecha >= desde && fecha <= hasta;
  });

  const sumaSabores = {};
  seleccionados.forEach(([, registro]) => {
    Object.entries(registro?.donas || {}).forEach(([nombre, cantidad]) => {
      sumaSabores[nombre] = (sumaSabores[nombre] || 0) + (Number(cantidad) || 0);
    });
  });

  const categorias = contarCategorias(sumaSabores);
  const filas = Object.entries(sumaSabores)
    .filter(([, cantidad]) => cantidad !== 0)
    .sort((a, b) => a[0].localeCompare(b[0], "es"))
    .map(([nombre, cantidad]) => `<tr><td>${escaparHTML(nombre)}</td><td>${cantidad}</td></tr>`)
    .join("");

  salida.innerHTML = `
    <h3>Resultados del ${fechaDesdeISO(desde)} al ${fechaDesdeISO(hasta)}</h3>
    <p><strong>Registros encontrados:</strong> ${seleccionados.length}</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px;margin:12px 0">
      <div class="resumen-total"><strong>TOTAL GENERAL</strong><div>${categorias.general}</div></div>
      <div class="resumen-total"><strong>ANILLOS</strong><div>${categorias.anillos}</div></div>
      <div class="resumen-total"><strong>RELLENAS</strong><div>${categorias.rellenas}</div></div>
      <div class="resumen-total"><strong>ANTOJITOS</strong><div>${categorias.antojitos}</div></div>
      <div class="resumen-total"><strong>CUADRADAS</strong><div>${categorias.cuadradas}</div></div>
      ${categorias.otros ? `<div class="resumen-total"><strong>OTROS</strong><div>${categorias.otros}</div></div>` : ""}
    </div>
    <h3>Detalle por sabor</h3>
    ${filas ? `<table><thead><tr><th>Sabor</th><th>Cantidad total</th></tr></thead><tbody>${filas}</tbody></table>` : "<p>No hay cantidades registradas en ese rango de fechas.</p>"}
  `;
}

window.verRegistro = function(id) {
  db.ref("registros/" + id).once("value").then(snapshot => {
    const data = snapshot.val();
    if (!data) return alert("No se encontró el registro.");
    tempDonas = { ...(data.donas || {}) };
    mostrarPopup(renderRegistroDetalle(id, data, Boolean(data.generado)));
  }).catch(error => alert("No se pudo abrir el registro: " + error.message));
};

function nuevoRegistroPopup() {
  tempDonas = {};
  DONAS.forEach(nombre => tempDonas[nombre] = 0);
  const id = "temp-" + Date.now();
  mostrarPopup(renderRegistroDetalle(id, { fecha: getFechaStr(), donas: tempDonas, generado: false }, false, true));
}

function actualizarTotalesPopup() {
  const totales = contarCategorias(tempDonas);
  const mapa = {
    "total-anillos": totales.anillos,
    "total-rellenas": totales.rellenas,
    "total-antojitos": totales.antojitos,
    "total-cuadradas": totales.cuadradas,
    "total-general": totales.general
  };
  Object.entries(mapa).forEach(([id, valor]) => {
    const elemento = document.getElementById(id);
    if (elemento) elemento.textContent = valor;
  });
}

function guardarSiExiste(id) {
  if (!id || id.startsWith("temp-")) return;
  const actual = registrosCache[id];
  db.ref("registros/" + id).update({
    donas: { ...tempDonas },
    generado: actual?.generado || false
  });
}

window.sumarTemp = function(nombre, cantidad) {
  tempDonas[nombre] = (Number(tempDonas[nombre]) || 0) + cantidad;
  const celda = document.getElementById("total-" + nombre);
  if (celda) celda.textContent = tempDonas[nombre];
  actualizarTotalesPopup();
  const boton = document.querySelector('#popup-registro button[onclick*="guardarRegistro"], #popup-registro button[onclick*="generarRegistro"]');
  const coincidencia = boton?.getAttribute("onclick")?.match(/'([^']+)'/);
  if (coincidencia) guardarSiExiste(coincidencia[1]);
};

window.restarTemp = function(nombre, cantidad) {
  tempDonas[nombre] = Math.max(0, (Number(tempDonas[nombre]) || 0) - cantidad);
  const celda = document.getElementById("total-" + nombre);
  if (celda) celda.textContent = tempDonas[nombre];
  actualizarTotalesPopup();
  const boton = document.querySelector('#popup-registro button[onclick*="guardarRegistro"], #popup-registro button[onclick*="generarRegistro"]');
  const coincidencia = boton?.getAttribute("onclick")?.match(/'([^']+)'/);
  if (coincidencia) guardarSiExiste(coincidencia[1]);
};

function renderRegistroDetalle(id, data, soloVer, esNuevo = false) {
  const donas = data?.donas || {};
  if (!Object.keys(tempDonas).length) tempDonas = { ...donas };
  const nombres = soloVer ? Object.keys(donas) : Array.from(new Set([...Object.keys(tempDonas), ...DONAS]));
  const totales = contarCategorias(tempDonas);

  return `
    <h2>Registro ${escaparHTML(data?.fecha || getFechaStr())}</h2>
    <table>
      <thead><tr><th>Nombre dona</th><th>Total</th>${!soloVer ? "<th>Sumar / restar</th>" : ""}</tr></thead>
      <tbody>
      ${nombres.map(nombre => `
        <tr>
          <td>${escaparHTML(nombre)}</td>
          <td id="total-${nombre}">${Number(tempDonas[nombre]) || 0}</td>
          ${!soloVer ? `<td>
            <button type="button" onclick="window.sumarTemp('${nombre}',1)">+1</button>
            <button type="button" onclick="window.sumarTemp('${nombre}',5)">+5</button>
            <button type="button" onclick="window.sumarTemp('${nombre}',10)">+10</button>
            <button type="button" onclick="window.restarTemp('${nombre}',1)">-1</button>
          </td>` : ""}
        </tr>`).join("")}
      </tbody>
    </table>
    <div style="display:flex;gap:14px;flex-wrap:wrap;margin:15px 0 10px;font-weight:bold">
      <label>ANILLOS: <span id="total-anillos">${totales.anillos}</span></label>
      <label>RELLENAS: <span id="total-rellenas">${totales.rellenas}</span></label>
      <label>ANTOJITOS: <span id="total-antojitos">${totales.antojitos}</span></label>
      <label>CUADRADAS: <span id="total-cuadradas">${totales.cuadradas}</span></label>
      <label>TOTAL GENERAL: <span id="total-general">${totales.general}</span></label>
    </div>
    ${!soloVer ? `<div style="margin:10px 0">
      <input type="text" id="nueva-dona" placeholder="Nuevo sabor de dona">
      <button type="button" onclick="window.agregarDona('${id}')">Agregar sabor</button>
    </div>` : ""}
    <div style="margin-top:20px;display:flex;gap:8px;flex-wrap:wrap">
      ${!soloVer ? `<button type="button" onclick="window.guardarRegistro('${id}')">Guardar</button>
      <button type="button" id="generarBtn" onclick="window.generarRegistro('${id}')" ${esNuevo ? "disabled" : ""}>Generar</button>` : ""}
      <button type="button" onclick="window.cerrarPopup()">Cerrar</button>
    </div>`;
}

window.guardarRegistro = function(id) {
  const fecha = id.startsWith("temp-")
    ? getFechaStr()
    : (registrosCache[id]?.fecha || getFechaStr());
  const ref = id.startsWith("temp-") ? db.ref("registros").push() : db.ref("registros/" + id);
  ref.set({ fecha, donas: { ...tempDonas }, generado: false })
    .then(() => cerrarPopup())
    .catch(error => alert("No se pudo guardar: " + error.message));
};

window.generarRegistro = function(id) {
  if (id.startsWith("temp-")) {
    alert("Primero guarda el registro y después pulsa Generar.");
    return;
  }
  const fecha = registrosCache[id]?.fecha || getFechaStr();
  const donasFiltradas = Object.fromEntries(
    Object.entries(tempDonas).filter(([, cantidad]) => Number(cantidad) !== 0)
  );
  db.ref("registros/" + id).set({ fecha, donas: donasFiltradas, generado: true })
    .then(() => cerrarPopup())
    .catch(error => alert("No se pudo generar: " + error.message));
};

window.eliminarRegistro = function(id) {
  if (confirm("¿Estás seguro de que deseas eliminar este registro?")) {
    db.ref("registros/" + id).remove()
      .catch(error => alert("No se pudo eliminar: " + error.message));
  }
};

window.agregarDona = function(id) {
  const input = document.getElementById("nueva-dona");
  const nombre = input?.value.trim();
  if (!nombre) return;
  if (Object.prototype.hasOwnProperty.call(tempDonas, nombre)) {
    alert("Ese sabor ya existe en el registro.");
    return;
  }
  tempDonas[nombre] = 0;
  const fecha = document.querySelector("#popup-registro h2")?.textContent.replace("Registro ", "") || getFechaStr();
  document.querySelector("#popup-registro .popup-contenido").innerHTML =
    renderRegistroDetalle(id, { fecha, donas: { ...tempDonas }, generado: false }, false, id.startsWith("temp-"));
};

db.ref("registros").on("value", snapshot => {
  registrosCache = snapshot.val() || {};
  renderTablaRegistros(registrosCache);
});

document.getElementById("nuevoRegistroBtn").onclick = nuevoRegistroPopup;
document.getElementById("registro-detalle").innerHTML = "";
