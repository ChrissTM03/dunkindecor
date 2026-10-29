// Configura tu Firebase aquí (debes crear un proyecto en https://console.firebase.google.com/)
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

// Convierte dd-mm-aaaa a yyyy-mm-dd para comparar rangos sin errores de formato.
function fechaISO(fechaTexto) {
  if (!fechaTexto || typeof fechaTexto !== 'string') return '';
  const partes = fechaTexto.split('-');
  if (partes.length !== 3) return '';
  const [dia, mes, anio] = partes;
  if (!dia || !mes || !anio) return '';
  return `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}
function fechaDesdeISO(fechaTexto) {
  if (!fechaTexto) return '';
  const [anio, mes, dia] = fechaTexto.split('-');
  return `${dia}-${mes}-${anio}`;
}
function sumarPorTipo(donas) {
  const totales = { anillos: 0, rellenas: 0, antojitos: 0, cuadradas: 0, general: 0 };
  Object.entries(donas || {}).forEach(([nombre, cantidad]) => {
    const numero = Number(cantidad) || 0;
    if (numero <= 0) return;
    const tipo = String(nombre).trim().toUpperCase();
    if (tipo.startsWith('ANILLO')) totales.anillos += numero;
    else if (tipo.startsWith('RELLENA')) totales.rellenas += numero;
    else if (tipo.startsWith('ANTOJITO')) totales.antojitos += numero;
    else if (tipo.startsWith('CUADRADA')) totales.cuadradas += numero;
    totales.general += numero;
  });
  return totales;
}
function actualizarTotalesPopup() {
  const totales = sumarPorTipo(tempDonas);
  const referencias = {
    'total-anillos': totales.anillos,
    'total-rellenas': totales.rellenas,
    'total-antojitos': totales.antojitos,
    'total-cuadradas': totales.cuadradas
  };
  Object.entries(referencias).forEach(([id, cantidad]) => {
    const elemento = document.getElementById(id);
    if (elemento) elemento.textContent = cantidad;
  });
}

// Utilidad para crear popups simples. Se conserva el estilo definido en styles.css.
function mostrarPopup(html) {
  let popup = document.getElementById('popup-registro');
  if (!popup) {
    popup = document.createElement('div');
    popup.id = 'popup-registro';
    popup.style.position = 'fixed';
    popup.style.top = '0';
    popup.style.left = '0';
    popup.style.width = '100vw';
    popup.style.height = '100vh';
    popup.style.background = 'rgba(0,0,0,0.5)';
    popup.style.display = 'flex';
    popup.style.alignItems = 'center';
    popup.style.justifyContent = 'center';
    document.body.appendChild(popup);
  }
  popup.innerHTML = `<div>${html}</div>`;
}
function cerrarPopup() {
  const popup = document.getElementById('popup-registro');
  if (popup) popup.remove();
  tempDonas = {};
}
window.cerrarPopup = cerrarPopup;

// Consolidado: agrega controles discretos sobre la tabla existente, sin modificar styles.css.
function renderTablaRegistros(registros) {
  const contenedor = document.getElementById('tabla-registros');
  contenedor.innerHTML = '';

  const consolidado = document.createElement('section');
  consolidado.id = 'consolidado-fechas';
  consolidado.style.width = '100%';
  consolidado.style.boxSizing = 'border-box';
  consolidado.style.margin = '0 0 22px 0';
  consolidado.style.padding = '14px 0';
  consolidado.innerHTML = `
    <h2 style="color:var(--color-principal);margin:8px 0 12px">Consolidado por fechas</h2>
    <div style="display:flex;gap:10px;align-items:end;flex-wrap:wrap">
      <label style="color:var(--color-texto)">Desde<br><input id="consolidado-desde" type="date"></label>
      <label style="color:var(--color-texto)">Hasta<br><input id="consolidado-hasta" type="date"></label>
      <button type="button" id="btn-consultar-consolidado">Consultar</button>
      <button type="button" id="btn-limpiar-consolidado">Limpiar</button>
    </div>
    <div id="resultado-consolidado" style="margin-top:14px"></div>
  `;
  contenedor.appendChild(consolidado);

  const tabla = document.createElement('table');
  const registrosOrdenados = Object.entries(registros || {}).sort((a, b) => {
    const fechaA = fechaISO(a[1]?.fecha);
    const fechaB = fechaISO(b[1]?.fecha);
    if (fechaA === fechaB) return b[0].localeCompare(a[0]);
    return fechaB.localeCompare(fechaA);
  });
  tabla.innerHTML = `
    <tr><th>Fecha</th><th>Estado</th><th>Acciones</th></tr>
    ${registrosOrdenados.map(([id, data]) => `
      <tr>
        <td>${data.fecha || ''}</td>
        <td>${data.generado ? 'GENERADO' : 'EDITABLE'}</td>
        <td>
          <button onclick="verRegistro('${id}')">VER</button>
          <button onclick="eliminarRegistro('${id}')">ELIMINAR</button>
        </td>
      </tr>
    `).join('')}
  `;
  contenedor.appendChild(tabla);

  document.getElementById('btn-consultar-consolidado').onclick = () => consultarConsolidado(registros || {});
  document.getElementById('btn-limpiar-consolidado').onclick = () => {
    document.getElementById('consolidado-desde').value = '';
    document.getElementById('consolidado-hasta').value = '';
    document.getElementById('resultado-consolidado').innerHTML = '';
  };
}

function consultarConsolidado(registros) {
  const desde = document.getElementById('consolidado-desde').value;
  const hasta = document.getElementById('consolidado-hasta').value;
  const salida = document.getElementById('resultado-consolidado');
  if (!desde || !hasta) {
    salida.innerHTML = '<p>Selecciona la fecha inicial y la fecha final.</p>';
    return;
  }
  if (desde > hasta) {
    salida.innerHTML = '<p>La fecha inicial no puede ser posterior a la fecha final.</p>';
    return;
  }

  const registrosDelRango = Object.entries(registros).filter(([, registro]) => {
    const fecha = fechaISO(registro?.fecha);
    return fecha && fecha >= desde && fecha <= hasta;
  });
  const donasConsolidadas = {};
  registrosDelRango.forEach(([, registro]) => {
    Object.entries(registro?.donas || {}).forEach(([nombre, cantidad]) => {
      donasConsolidadas[nombre] = (donasConsolidadas[nombre] || 0) + (Number(cantidad) || 0);
    });
  });
  const totales = sumarPorTipo(donasConsolidadas);
  const detalle = Object.entries(donasConsolidadas)
    .filter(([, cantidad]) => Number(cantidad) !== 0)
    .sort((a, b) => a[0].localeCompare(b[0], 'es'));

  salida.innerHTML = `
    <p><strong>Período:</strong> ${fechaDesdeISO(desde)} al ${fechaDesdeISO(hasta)}</p>
    <p><strong>Registros incluidos:</strong> ${registrosDelRango.length}</p>
    <p><strong>Total general:</strong> ${totales.general}
      &nbsp; | &nbsp; <strong>Anillos:</strong> ${totales.anillos}
      &nbsp; | &nbsp; <strong>Rellenas:</strong> ${totales.rellenas}
      &nbsp; | &nbsp; <strong>Antojitos:</strong> ${totales.antojitos}
      &nbsp; | &nbsp; <strong>Cuadradas:</strong> ${totales.cuadradas}</p>
    ${detalle.length ? `
      <table>
        <tr><th>Sabor</th><th>Total en el período</th></tr>
        ${detalle.map(([nombre, cantidad]) => `<tr><td>${nombre}</td><td>${cantidad}</td></tr>`).join('')}
      </table>` : '<p>No hay cantidades registradas en ese rango de fechas.</p>'}
  `;
}

// Abrir popup para ver o editar un registro.
window.verRegistro = function(id) {
  db.ref('registros/' + id).once('value').then(snapshot => {
    const data = snapshot.val();
    if (!data) return;
    tempDonas = { ...(data.donas || {}) };
    mostrarPopup(renderRegistroDetalle(id, data, data.generado));
  });
};

function nuevoRegistroPopup() {
  const fechaStr = getFechaStr();
  const registro = {};
  DONAS.forEach(dona => registro[dona] = 0);
  const tempId = 'temp-' + Date.now();
  tempDonas = { ...registro };
  mostrarPopup(renderRegistroDetalle(tempId, { fecha: fechaStr, donas: registro, generado: false }, false, true));
}

window.sumarTemp = function(nombre, cantidad) {
  tempDonas[nombre] = (Number(tempDonas[nombre]) || 0) + cantidad;
  const td = document.getElementById('total-' + nombre);
  if (td) td.textContent = tempDonas[nombre];
  actualizarTotalesPopup();
  const btn = document.querySelector('#popup-registro button[onclick*="guardarRegistro"], #popup-registro button[onclick*="generarRegistro"]');
  if (btn) {
    const match = btn.getAttribute('onclick').match(/'([^']+)'/);
    if (match && !match[1].startsWith('temp-')) guardarAuto(match[1]);
  }
};
window.restarTemp = function(nombre, cantidad) {
  tempDonas[nombre] = Math.max(0, (Number(tempDonas[nombre]) || 0) - cantidad);
  const td = document.getElementById('total-' + nombre);
  if (td) td.textContent = tempDonas[nombre];
  actualizarTotalesPopup();
  const btn = document.querySelector('#popup-registro button[onclick*="guardarRegistro"], #popup-registro button[onclick*="generarRegistro"]');
  if (btn) {
    const match = btn.getAttribute('onclick').match(/'([^']+)'/);
    if (match && !match[1].startsWith('temp-')) guardarAuto(match[1]);
  }
};

function renderRegistroDetalle(id, data, soloVer, esNuevo = false) {
  if (!data) data = {};
  if (!data.donas) data.donas = {};
  if (Object.keys(tempDonas).length === 0) tempDonas = { ...data.donas };
  const todasLasDonas = soloVer
    ? Object.keys(data.donas)
    : Array.from(new Set([...Object.keys(tempDonas), ...DONAS]));
  const totales = sumarPorTipo(tempDonas);
  return `<h2>Registro ${data.fecha || ''}</h2>
    <table>
      <tr><th>Nombre Dona</th><th>Total</th>${!soloVer ? '<th>Sumar</th>' : ''}</tr>
      ${todasLasDonas.map(nombre => `
        <tr>
          <td>${nombre}</td>
          <td id="total-${nombre}">${Number(tempDonas[nombre]) || 0}</td>
          ${!soloVer ? `<td>
            <button onclick="window.sumarTemp('${nombre}',1)">+1</button>
            <button onclick="window.sumarTemp('${nombre}',5)">+5</button>
            <button onclick="window.sumarTemp('${nombre}',10)">+10</button>
            <button onclick="window.restarTemp('${nombre}',1)">-1</button>
          </td>` : ''}
        </tr>`).join('')}
    </table>
    <div style="margin:15px 0 10px 0; font-weight:bold;">
      <label>ANILLOS: <span id="total-anillos">${totales.anillos}</span></label> &nbsp;&nbsp;
      <label>RELLENAS: <span id="total-rellenas">${totales.rellenas}</span></label> &nbsp;&nbsp;
      <label>ANTOJITOS: <span id="total-antojitos">${totales.antojitos}</span></label> &nbsp;&nbsp;
      <label>CUADRADAS: <span id="total-cuadradas">${totales.cuadradas}</span></label>
    </div>
    ${!soloVer ? `<div style="margin:10px 0;">
      <input type="text" id="nueva-dona" placeholder="Nuevo sabor de dona" style="margin-right:5px;">
      <button onclick="window.agregarDona('${id}')">Agregar sabor</button>
    </div>` : ''}
    <div style="margin-top:20px;">
      ${!soloVer && esNuevo ? `<button onclick="window.guardarRegistro('${id}')">Guardar</button>
        <button id="generarBtn" onclick="window.generarRegistro('${id}')" disabled>Generar</button>` : ''}
      ${!soloVer && !esNuevo ? `<button onclick="window.guardarRegistro('${id}')">Guardar</button>
        <button id="generarBtn" onclick="window.generarRegistro('${id}')">Generar</button>` : ''}
      <button onclick="window.cerrarPopup()">Cerrar</button>
    </div>`;
}

function getFechaStr() {
  const fecha = new Date();
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const anio = fecha.getFullYear();
  return `${dia}-${mes}-${anio}`;
}
window.guardarRegistro = function(id) {
  const fechaStr = getFechaStr();
  let ref;
  if (id.startsWith('temp-')) ref = db.ref('registros').push();
  else ref = db.ref('registros/' + id);
  ref.set({ fecha: fechaStr, donas: { ...tempDonas }, generado: false }).then(() => {
    cerrarPopup();
  }).catch(error => alert('No se pudo guardar el registro: ' + error.message));
  const popup = document.getElementById('popup-registro');
  if (popup) {
    const btn = popup.querySelector('#generarBtn');
    if (btn) btn.disabled = false;
  }
};
window.generarRegistro = function(id) {
  if (id.startsWith('temp-')) {
    alert('Primero guarda el registro y después pulsa Generar.');
    return;
  }
  const fechaStr = getFechaStr();
  const donasFiltradas = Object.fromEntries(Object.entries(tempDonas).filter(([_, cantidad]) => Number(cantidad) !== 0));
  db.ref('registros/' + id).set({ fecha: fechaStr, donas: donasFiltradas, generado: true }).then(() => {
    cerrarPopup();
  }).catch(error => alert('No se pudo generar el registro: ' + error.message));
};

db.ref('registros').on('value', snapshot => {
  renderTablaRegistros(snapshot.val() || {});
});
document.getElementById('nuevoRegistroBtn').onclick = nuevoRegistroPopup;
document.getElementById('registro-detalle').innerHTML = '';

window.eliminarRegistro = function(id) {
  if (confirm('¿Estás seguro de que deseas eliminar este registro?')) {
    db.ref('registros/' + id).remove();
  }
};
window.agregarDona = function(id) {
  const input = document.getElementById('nueva-dona');
  const nombre = input.value.trim();
  if (nombre && !Object.prototype.hasOwnProperty.call(tempDonas, nombre)) {
    tempDonas[nombre] = 0;
    const encabezado = document.querySelector('#popup-registro h2');
    const fecha = encabezado ? encabezado.textContent.replace('Registro ', '') : getFechaStr();
    document.querySelector('#popup-registro').innerHTML = `<div>${renderRegistroDetalle(id, { fecha, donas: { ...tempDonas }, generado: false }, false, id.startsWith('temp-'))}</div>`;
  }
  input.value = '';
};
function guardarAuto(id) {
  if (!id.startsWith('temp-')) {
    const fechaStr = getFechaStr();
    db.ref('registros/' + id).set({ fecha: fechaStr, donas: { ...tempDonas }, generado: false });
  }
}
