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
let registrosActuales = {};

const DONAS = [
  "Anillo Choco arcoiris",
  "Anillo Chocolate",
  "Anillo Fresa arcoiris",
  "Anillo Vainilla arcoiris",
  "Anillo Chicle arcoiris",
  "Anillo Avellana",
  "Anillo Glaseado",
  "Anillo Vainilla oreo",
  "Anillo Indecisa",
  "Rellena Manjar",
  "Rellena Chocomanjar",
  "Rellena Carita Feliz",
  "Rellena Manjar Oreo",
  "Rellena Cookie Monster",
  "Rellena Bavaria",
  "Rellena Boston Cream",
  "Rellena Mora",
  "Rellena Mora Glaseada",
  "Antojito Manjar",
  "Antojito Glaseado",
  "Antojito Mora",
  "Antojito Bavaria",
  "Crema Bavaria",
  "Te Limon",
  "Te Arandanos",
  "Glucosa"
];

// Utilidad para crear popups simples
function mostrarPopup(html) {
  let popup = document.getElementById('popup-registro');
  if (!popup) {
    popup = document.createElement('div');
    popup.id = 'popup-registro';
    popup.className = 'modal-backdrop';
    popup.setAttribute('role', 'presentation');
    document.body.appendChild(popup);
  }
  popup.innerHTML = `<div class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="registro-title" tabindex="-1">${html}</div>`;
  popup.querySelector('.modal-dialog').focus();
  popup.onclick = event => {
    if (event.target === popup) cerrarPopup();
  };
  popup.onkeydown = event => {
    if (event.key === 'Escape') cerrarPopup();
  };
}
function cerrarPopup() {
  let popup = document.getElementById('popup-registro');
  if (popup) popup.remove();
  tempDonas = {};
}

function fechaRegistroComoISO(fecha) {
  const coincidencia = /^(\d{2})-(\d{2})-(\d{4})$/.exec(fecha || '');
  if (!coincidencia) return null;

  const [, dia, mes, anio] = coincidencia;
  const fechaLocal = new Date(Number(anio), Number(mes) - 1, Number(dia));
  if (fechaLocal.getFullYear() !== Number(anio) ||
      fechaLocal.getMonth() !== Number(mes) - 1 ||
      fechaLocal.getDate() !== Number(dia)) {
    return null;
  }
  return `${anio}-${mes}-${dia}`;
}

function actualizarResumen(registros) {
  const valores = Object.values(registros);
  const generados = valores.filter(registro => registro && registro.generado).length;
  document.getElementById('resumen-total').textContent = valores.length;
  document.getElementById('resumen-generados').textContent = generados;
  document.getElementById('resumen-editables').textContent = valores.length - generados;
}

function escaparHTML(valor) {
  return String(valor).replace(/[&<>"']/g, caracter => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[caracter]);
}

function obtenerFechaISOHoy() {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

window.abrirConsolidado = function() {
  const panel = document.getElementById('consolidado-panel');
  const hoy = obtenerFechaISOHoy();
  const fechaDesde = document.getElementById('fecha-desde');
  if (!fechaDesde.value) fechaDesde.value = `${hoy.slice(0, 7)}-01`;
  const fechaHasta = document.getElementById('fecha-hasta');
  if (!fechaHasta.value) fechaHasta.value = hoy;
  panel.hidden = false;
  fechaDesde.focus();
};

window.cerrarConsolidado = function() {
  document.getElementById('consolidado-panel').hidden = true;
  document.getElementById('consolidadoProdBtn').focus();
};

function calcularConsolidado(event) {
  event.preventDefault();
  const fechaDesde = document.getElementById('fecha-desde').value;
  const fechaHasta = document.getElementById('fecha-hasta').value;
  const resultado = document.getElementById('resultado-consolidado');

  if (fechaDesde > fechaHasta) {
    resultado.innerHTML = '<p class="form-message form-message--error">La fecha «Desde» debe ser anterior o igual a «Hasta».</p>';
    document.getElementById('fecha-desde').focus();
    return;
  }

  let fechasInvalidas = 0;
  const registrosEnRango = Object.values(registrosActuales).filter(registro => {
    if (!registro) return false;
    const fecha = fechaRegistroComoISO(registro.fecha);
    if (!fecha) {
      fechasInvalidas += 1;
      return false;
    }
    return fecha >= fechaDesde && fecha <= fechaHasta;
  });

  const cantidades = {};
  let totalUnidades = 0;
  registrosEnRango.forEach(registro => {
    Object.entries(registro.donas || {}).forEach(([nombre, cantidad]) => {
      const valor = Number(cantidad);
      if (Number.isFinite(valor) && valor > 0) {
        cantidades[nombre] = (cantidades[nombre] || 0) + valor;
        totalUnidades += valor;
      }
    });
  });

  const filas = Object.entries(cantidades).sort((a, b) => a[0].localeCompare(b[0], 'es'));
  const generados = registrosEnRango.filter(registro => registro.generado).length;
  const filasHTML = filas.map(([nombre, cantidad]) => `
    <tr><td>${escaparHTML(nombre)}</td><td>${cantidad}</td></tr>
  `).join('');
  const avisoFechas = fechasInvalidas
    ? `<p class="form-message">${fechasInvalidas} ${fechasInvalidas === 1 ? 'registro tiene' : 'registros tienen'} una fecha no válida y ${fechasInvalidas === 1 ? 'fue omitido' : 'fueron omitidos'}.</p>`
    : '';

  if (registrosEnRango.length === 0) {
    resultado.innerHTML = `
      <p class="table-empty"><strong>No hay registros en este rango</strong><span>Prueba con otras fechas para consultar la producción.</span></p>
      ${avisoFechas}
    `;
    return;
  }

  resultado.innerHTML = `
    <div class="consolidation-summary">
      <div><span>Registros incluidos</span><strong>${registrosEnRango.length}</strong></div>
      <div><span>Donas contabilizadas</span><strong>${totalUnidades}</strong></div>
      <div><span>Generados</span><strong>${generados}</strong></div>
    </div>
    ${filas.length ? `
      <div class="table-scroll">
        <table class="records-table consolidation-table">
          <thead><tr><th scope="col">Tipo de dona</th><th scope="col">Cantidad total</th></tr></thead>
          <tbody>${filasHTML}</tbody>
        </table>
      </div>
    ` : '<p class="table-empty"><strong>Sin cantidades registradas</strong><span>Los registros del rango no contienen cantidades mayores que cero.</span></p>'}
    ${avisoFechas}
  `;
}

document.getElementById('consolidado-form').addEventListener('submit', calcularConsolidado);

// Mostrar todos los registros en la tabla principal
function renderTablaRegistros(registros) {
  const contenedor = document.getElementById('tabla-registros');
  actualizarResumen(registros);
  const entradas = Object.entries(registros);
  if (entradas.length === 0) {
    contenedor.innerHTML = '<div class="table-empty"><strong>Aún no hay registros</strong><span>Cuando crees un registro, aparecerá aquí.</span></div>';
    return;
  }

  const registrosOrdenados = Object.entries(registros).sort((a, b) => {
    const fechaA = fechaRegistroComoISO(a[1].fecha) || '';
    const fechaB = fechaRegistroComoISO(b[1].fecha) || '';
    return fechaB.localeCompare(fechaA) || b[0].localeCompare(a[0]);
  });
  contenedor.innerHTML = `
    <div class="table-scroll">
      <table class="records-table">
        <thead>
          <tr><th scope="col">Fecha</th><th scope="col">Estado</th><th scope="col">Acciones</th></tr>
        </thead>
        <tbody>
          ${registrosOrdenados.map(([id, data]) => `
            <tr>
              <td><span class="record-date">${data.fecha || 'Sin fecha'}</span></td>
              <td><span class="status-badge ${data.generado ? 'status-badge--generated' : 'status-badge--editable'}">
                <span aria-hidden="true"></span>${data.generado ? 'Generado' : 'Editable'}
              </span></td>
              <td class="record-actions">
                <button class="table-action" type="button" onclick="verRegistro('${id}')">Ver registro</button>
                <button class="table-action table-action--danger" type="button" onclick="eliminarRegistro('${id}')">Eliminar</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// Abrir popup para ver o editar un registro
window.verRegistro = function(id) {
  db.ref('registros/' + id).once('value').then(snapshot => {
    const data = snapshot.val();
    mostrarPopup(renderRegistroDetalle(id, data, data.generado));
  });
};

// Abrir popup para crear un nuevo registro
function nuevoRegistroPopup() {
  const fechaStr = getFechaStr();
  const registro = {};
  DONAS.forEach(dona => registro[dona] = 0);

  // Genera un ID temporal para el popup (no se guarda aún)
  const tempId = 'temp-' + Date.now();
  mostrarPopup(renderRegistroDetalle(tempId, { fecha: fechaStr, donas: registro, generado: false }, false, true));
}

// Declarar sumarTemp en el ámbito global
window.sumarTemp = function(nombre, cantidad) {
  tempDonas[nombre] = (tempDonas[nombre] || 0) + cantidad;
  let td = document.getElementById('total-' + nombre);
  if (td) td.textContent = tempDonas[nombre];
  // Obtener el id del registro actual de manera segura
  const btn = document.querySelector('#popup-registro button[onclick*="guardarRegistro"], #popup-registro button[onclick*="generarRegistro"]');
  if (btn) {
    const id = btn.getAttribute('onclick').match(/'([^']+)'/)[1];
    if (!id.startsWith('temp-')) {
      guardarAuto(id);
    }
  }
};

// NUEVO: función para restar
window.restarTemp = function(nombre, cantidad) {
  tempDonas[nombre] = Math.max(0, (tempDonas[nombre] || 0) - cantidad);
  let td = document.getElementById('total-' + nombre);
  if (td) td.textContent = tempDonas[nombre];
  // Obtener el id del registro actual de manera segura
  const btn = document.querySelector('#popup-registro button[onclick*="guardarRegistro"], #popup-registro button[onclick*="generarRegistro"]');
  if (btn) {
    const id = btn.getAttribute('onclick').match(/'([^']+)'/)[1];
    if (!id.startsWith('temp-')) {
      guardarAuto(id);
    }
  }
};

// Renderiza el detalle de un registro (modo visualización o edición)
function renderRegistroDetalle(id, data, soloVer, esNuevo = false) {
  if (!data) data = {};
  if (!data.donas) data.donas = {};

  // Solo inicializa tempDonas si está vacío
  if (Object.keys(tempDonas).length === 0) {
    tempDonas = { ...data.donas };
  }

  // Mostrar solo las donas guardadas si es soloVer (generado)
  const todasLasDonas = soloVer
    ? Object.keys(data.donas)
    : Array.from(new Set([...Object.keys(tempDonas), ...DONAS]));

  // Calcular totales por tipo
  let totalAnillos = 0, totalRellenas = 0, totalAntojitos = 0;
  Object.entries(tempDonas).forEach(([nombre, cantidad]) => {
    if (cantidad > 0) {
      if (nombre.toUpperCase().startsWith("ANILLO")) totalAnillos += cantidad;
      else if (nombre.toUpperCase().startsWith("RELLENA")) totalRellenas += cantidad;
      else if (nombre.toUpperCase().startsWith("ANTOJITO")) totalAntojitos += cantidad;
    }
  });

  let html = `<h2 id="registro-title">Registro ${data.fecha}</h2>
    <table>
      <tr>
        <th>Nombre Dona</th>
        <th>Total</th>
        ${!soloVer ? '<th>Sumar</th>' : ''}
      </tr>
      ${todasLasDonas.map(nombre => `
        <tr>
          <td>${nombre}</td>
          <td id="total-${nombre}">${tempDonas[nombre] || 0}</td>
          ${!soloVer ? `
            <td>
              <button onclick="window.sumarTemp('${nombre}',1)">+1</button>
              <button onclick="window.sumarTemp('${nombre}',5)">+5</button>
              <button onclick="window.sumarTemp('${nombre}',10)">+10</button>
              <button onclick="window.restarTemp('${nombre}',1)">-1</button>
            </td>
          ` : ''}
        </tr>
      `).join('')}
    </table>
    <div style="margin:15px 0 10px 0; font-weight:bold;">
      <label>ANILLOS: <span id="total-anillos">${totalAnillos}</span></label> &nbsp;&nbsp;
      <label>RELLENAS: <span id="total-rellenas">${totalRellenas}</span></label> &nbsp;&nbsp;
      <label>ANTOJITOS: <span id="total-antojitos">${totalAntojitos}</span></label>
    </div>
    ${!soloVer ? `
      <div style="margin:10px 0;">
        <input type="text" id="nueva-dona" placeholder="Nuevo sabor de dona" style="margin-right:5px;">
        <button onclick="window.agregarDona('${id}')">Agregar sabor</button>
      </div>
    ` : ''}
    <div style="margin-top:20px;">
      ${!soloVer && esNuevo ? `
        <button onclick="window.guardarRegistro('${id}')">Guardar</button>
        <button id="generarBtn" onclick="window.generarRegistro('${id}')" disabled>Generar</button>
      ` : ''}
      ${!soloVer && !esNuevo ? `
        <button onclick="window.guardarRegistro('${id}')">Guardar</button>
        <button id="generarBtn" onclick="window.generarRegistro('${id}')">Generar</button>
      ` : ''}
      <button onclick="window.cerrarPopup()">Cerrar</button>
    </div>
  `;
  return html;
}

// Función para obtener la fecha en formato dd-mm-aaaa
function getFechaStr() {
  const fecha = new Date();
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const anio = fecha.getFullYear();
  return `${dia}-${mes}-${anio}`; // formato: 08-06-2025
}

// Guardar registro (nuevo o editado)
window.guardarRegistro = function(id) {
  const fechaStr = getFechaStr();
  // Si es un registro nuevo, genera un ID con push()
  let ref;
  if (id.startsWith('temp-')) {
    ref = db.ref('registros').push();
    id = ref.key;
  } else {
    ref = db.ref('registros/' + id);
  }
  ref.set({
    fecha: fechaStr,
    donas: { ...tempDonas },
    generado: false
  }).then(() => {
    tempDonas = {};
    cerrarPopup();
  });
  // Habilitar el botón generar después de guardar
  const popup = document.getElementById('popup-registro');
  if (popup) {
    const btn = popup.querySelector('#generarBtn');
    if (btn) btn.disabled = false;
  }
};

// Generar registro (bloquear edición)
window.generarRegistro = function(id) {
  const fechaStr = getFechaStr();
  // Filtrar donas con valor distinto de 0
  const donasFiltradas = Object.fromEntries(
    Object.entries(tempDonas).filter(([_, cantidad]) => cantidad !== 0)
  );
  let ref = db.ref('registros/' + id);
  ref.set({
    fecha: fechaStr,
    donas: donasFiltradas,
    generado: true
  }).then(() => {
    tempDonas = {};
    cerrarPopup();
  });
};

// Mostrar todos los registros al cargar la página y actualizar en tiempo real
db.ref('registros').on('value', snapshot => {
  registrosActuales = snapshot.val() || {};
  const indicador = document.getElementById('connection-indicator');
  indicador.classList.remove('connection-indicator--error');
  document.getElementById('connection-title').textContent = 'Datos sincronizados';
  document.getElementById('connection-detail').textContent = 'Actualización en tiempo real';
  renderTablaRegistros(registrosActuales);
}, error => {
  const indicador = document.getElementById('connection-indicator');
  indicador.classList.add('connection-indicator--error');
  document.getElementById('connection-title').textContent = 'Sin acceso a los registros';
  document.getElementById('connection-detail').textContent = 'Verifica conexión o permisos';
  document.getElementById('tabla-registros').innerHTML = `
    <div class="table-empty table-empty--error">
      <strong>No se pudieron cargar los registros</strong>
      <span>Verifica la conexión y los permisos de acceso. ${escaparHTML(error.message)}</span>
    </div>
  `;
});

// Botón para crear nuevo registro
document.getElementById('nuevoRegistroBtn').onclick = nuevoRegistroPopup;

let tempDonas = {};

window.eliminarRegistro = function(id) {
  if (confirm('¿Estás seguro de que deseas eliminar este registro?')) {
    db.ref('registros/' + id).remove();
  }
};

window.agregarDona = function(id) {
  const input = document.getElementById('nueva-dona');
  const nombre = input.value.trim();
  if (nombre && !tempDonas[nombre]) {
    tempDonas[nombre] = 0;
    const fecha = document.getElementById('registro-title').textContent.replace('Registro ', '');
    // Solo actualiza el contenido del popup, no crea uno nuevo
    document.querySelector('#popup-registro .modal-dialog').innerHTML =
    renderRegistroDetalle(id, { fecha, donas: { ...tempDonas }, generado: false }, false, id.startsWith('temp-'));
  }
  input.value = '';
};

// Guardar automáticamente si no es un registro nuevo
function guardarAuto(id) {
  // Solo guarda si NO es un registro nuevo (id real de Firebase)
  if (!id.startsWith('temp-')) {
    const fechaStr = getFechaStr();
    db.ref('registros/' + id).set({
      fecha: fechaStr,
      donas: { ...tempDonas },
      generado: false
    });
  }
}
