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
const auth = firebase.auth();
let registrosActuales = {};
let registrosListener = null;

const accessScreen = document.getElementById('access-screen');
const appShell = document.getElementById('app-shell');
const accessForm = document.getElementById('access-form');
const accessEmailInput = document.getElementById('access-email');
const accessPasswordInput = document.getElementById('access-password');
const accessSubmit = document.getElementById('access-submit');
const accessMessage = document.getElementById('access-message');
const logoutButton = document.getElementById('logout-button');

const authorizedStaffUids = [
  'xnyOtwJ6EmU52Uyvv3GTsdwC7G42',
  'QefolDuUlZQZUZPmGajLvZfszDC2'
];
accessSubmit.disabled = false;

accessForm.addEventListener('submit', event => {
  event.preventDefault();
  accessSubmit.disabled = true;
  accessMessage.classList.remove('form-message--error');
  accessMessage.textContent = 'Iniciando sesión…';

  auth.signInWithEmailAndPassword(
    accessEmailInput.value.trim(),
    accessPasswordInput.value
  )
    .then(() => {
      accessPasswordInput.value = '';
      accessMessage.textContent = '';
    })
    .catch(error => {
      console.error('No se pudo iniciar sesión.', error);
      accessMessage.textContent = 'No se pudo iniciar sesión. Revisa el correo y la contraseña de la cuenta autorizada.';
      accessMessage.classList.add('form-message--error');
      accessPasswordInput.focus();
    })
    .finally(() => {
      accessSubmit.disabled = false;
    });
});

logoutButton.addEventListener('click', () => {
  auth.signOut().catch(error => {
    console.error('No se pudo cerrar la sesión.', error);
    alert('No se pudo cerrar la sesión. Inténtalo de nuevo.');
  });
});

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

const CODIGOS_SAP = {
  "Anillo Choco arcoiris": "91016784",
  "Anillo Chocolate": "91016789",
  "Anillo Fresa arcoiris": "91016783",
  "Anillo Vainilla arcoiris": "91016785",
  "Anillo Chicle arcoiris": "91016786",
  "Anillo Avellana": "91016795",
  "Anillo Glaseado": "91016782",
  "Anillo Vainilla oreo": "91016787",
  "Anillo Indecisa": "91016791",
  "Rellena Manjar": "91016664",
  "Rellena Chocomanjar": "91016697",
  "Rellena Carita Feliz": "91016696",
  "Rellena Manjar Oreo": "91016700",
  "Rellena Cookie Monster": "91016705",
  "Rellena Bavaria": "91016665",
  "Rellena Boston Cream": "91016698",
  "Rellena Mora": "91016702",
  "Rellena Mora Glaseada": "91016707",
  "Antojito Manjar": "91016709",
  "Antojito Glaseado": "91016708",
  "Antojito Mora": "91016711",
  "Antojito Bavaria": "91016710",
  "Crema Bavaria": "91016727",
  "Te Limon": "91016776",
  "Te Arandanos": "91016777",
  "Glucosa": "91016779"
};

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
  tempFechaRegistro = null;
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
    if (!data) {
      alert('No se encontró el registro solicitado.');
      return;
    }
    tempDonas = { ...(data.donas || {}) };
    tempFechaRegistro = data.fecha;
    mostrarPopup(renderRegistroDetalle(id, data, !!data.generado));
  }).catch(error => {
    console.error('No se pudo cargar el registro.', error);
    alert('No se pudo cargar el registro. Revisa la conexión e inténtalo de nuevo.');
  });
};

// Abrir popup para crear un nuevo registro
function nuevoRegistroPopup() {
  const boton = document.getElementById('nuevoRegistroBtn');
  if (boton) boton.disabled = true;

  db.ref('registros').once('value').then(snapshot => {
    registrosActuales = snapshot.val() || {};
    const fechaStr = getFechaStr();
    if (existeRegistroConFecha(registrosActuales, fechaStr)) {
      alert(`Ya existe un registro para ${fechaStr}. No se puede crear otro con la misma fecha.`);
      return;
    }

    const registro = {};
    DONAS.forEach(dona => registro[dona] = 0);
    tempDonas = registro;
    tempFechaRegistro = fechaStr;

    const tempId = 'temp-' + Date.now();
    mostrarPopup(renderRegistroDetalle(tempId, { fecha: fechaStr, donas: registro, generado: false }, false, true));
  }).catch(error => {
    console.error('No se pudo verificar si ya existe un registro para hoy.', error);
    alert('No se pudo verificar la fecha del registro. Revisa la conexión e inténtalo de nuevo.');
  }).then(() => {
    if (boton) boton.disabled = false;
  });
}

function existeRegistroConFecha(registros, fecha) {
  return Object.values(registros || {}).some(registro => registro && registro.fecha === fecha);
}

function mostrarRegistroBloqueado(id, ref) {
  ref.once('value').then(snapshot => {
    const data = snapshot.val();
    if (data && data.generado) {
      tempDonas = { ...(data.donas || {}) };
      tempFechaRegistro = data.fecha;
      mostrarPopup(renderRegistroDetalle(id, data, true));
      alert('Este registro ya fue generado y quedó bloqueado para edición.');
      return;
    }
    alert('No se pudo guardar el registro. Puede haber sido eliminado; actualiza la página e inténtalo de nuevo.');
  }).catch(error => {
    console.error('No se pudo comprobar el estado del registro.', error);
    alert('No se pudo confirmar el estado del registro. Revisa la conexión e inténtalo de nuevo.');
  });
}

function cantidadDona(nombre) {
  const cantidad = Number(tempDonas[nombre]);
  return Number.isFinite(cantidad) ? cantidad : 0;
}

function actualizarTotalesEspeciales() {
  const totalTeLimon = document.getElementById('total-te-limon');
  const totalTeArandanos = document.getElementById('total-te-arandanos');
  const totalCremaBavaria = document.getElementById('total-crema-bavaria');

  if (totalTeLimon) totalTeLimon.textContent = `${cantidadDona('Te Limon')} OZL`;
  if (totalTeArandanos) totalTeArandanos.textContent = `${cantidadDona('Te Arandanos')} OZL`;
  if (totalCremaBavaria) {
    const onzas = Number((cantidadDona('Crema Bavaria') * 13.4).toFixed(1));
    totalCremaBavaria.textContent = `${onzas} OZ`;
  }
}

// Declarar sumarTemp en el ámbito global
window.sumarTemp = function(nombre, cantidad) {
  tempDonas[nombre] = (tempDonas[nombre] || 0) + cantidad;
  let td = document.getElementById('total-' + nombre);
  if (td) td.textContent = tempDonas[nombre];
  actualizarTotalesEspeciales();
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
  actualizarTotalesEspeciales();
  // Obtener el id del registro actual de manera segura
  const btn = document.querySelector('#popup-registro button[onclick*="guardarRegistro"], #popup-registro button[onclick*="generarRegistro"]');
  if (btn) {
    const id = btn.getAttribute('onclick').match(/'([^']+)'/)[1];
    if (!id.startsWith('temp-')) {
      guardarAuto(id);
    }
  }
};

window.copiarColumna = async function(boton) {
  const columna = boton.dataset.copyColumn === 'codigoSap' ? 2 : 1;
  const filas = boton.closest('table').querySelectorAll('tr');
  const valores = Array.from(filas).slice(1).map(fila => fila.cells[columna].dataset.copyValue || '');
  const valor = valores.join('\n');
  const etiqueta = boton.dataset.copyLabel;
  try {
    await copiarTextoAlPortapapeles(valor);
    boton.innerHTML = '<svg aria-hidden="true" viewBox="0 0 16 16" focusable="false"><path d="m3.5 8.25 3 3 6-6.5"></path></svg>';
    boton.setAttribute('aria-label', `${etiqueta} copiada`);
    boton.title = `${etiqueta} copiada`;
    window.clearTimeout(boton.copyFeedbackTimeout);
    boton.copyFeedbackTimeout = window.setTimeout(() => {
      if (!boton.isConnected) return;
      boton.innerHTML = '<svg aria-hidden="true" viewBox="0 0 16 16" focusable="false"><rect x="5.25" y="2.25" width="8.5" height="10.5" rx="1.5"></rect><path d="M10.75 12.75v1A1.25 1.25 0 0 1 9.5 15h-6A1.25 1.25 0 0 1 2.25 13.75v-9A1.25 1.25 0 0 1 3.5 3.5h1.75"></path></svg>';
      boton.setAttribute('aria-label', `Copiar toda ${etiqueta}`);
      boton.title = `Copiar ${etiqueta}`;
    }, 1500);
  } catch (error) {
    console.error(`No se pudo copiar ${etiqueta}.`, error);
    alert(`No se pudo copiar ${etiqueta}. Inténtalo de nuevo o copia los valores manualmente.`);
  }
};

async function copiarTextoAlPortapapeles(valor) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(valor);
      return;
    } catch {
      copiarValorConFallback(valor);
      return;
    }
  }
  copiarValorConFallback(valor);
}

function copiarValorConFallback(valor) {
  const campoTemporal = document.createElement('textarea');
  campoTemporal.value = valor;
  campoTemporal.setAttribute('readonly', '');
  campoTemporal.style.position = 'fixed';
  campoTemporal.style.opacity = '0';
  document.body.appendChild(campoTemporal);
  campoTemporal.select();

  try {
    if (!document.execCommand('copy')) {
      throw new Error('El navegador rechazó la operación de copia.');
    }
  } finally {
    campoTemporal.remove();
  }
}

// Renderiza el detalle de un registro (modo visualización o edición)
function renderRegistroDetalle(id, data, soloVer, esNuevo = false) {
  if (!data) data = {};
  if (!data.donas) data.donas = {};

  // Solo inicializa tempDonas si está vacío
  if (Object.keys(tempDonas).length === 0) {
    tempDonas = { ...data.donas };
  }

  const totalTeLimon = cantidadDona('Te Limon');
  const totalTeArandanos = cantidadDona('Te Arandanos');
  const totalCremaBavaria = Number((cantidadDona('Crema Bavaria') * 13.4).toFixed(1));

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
    <table class="${soloVer ? 'generated-record-table' : ''}">
      <thead>
        <tr>
          <th>Nombre Dona</th>
          <th>${soloVer ? '<div class="column-copy-header"><span>Cantidad</span><button class="copy-button" type="button" data-copy-column="cantidad" data-copy-label="la columna Cantidad" aria-label="Copiar toda la columna Cantidad" title="Copiar columna Cantidad" onclick="window.copiarColumna(this)"><svg aria-hidden="true" viewBox="0 0 16 16" focusable="false"><rect x="5.25" y="2.25" width="8.5" height="10.5" rx="1.5"></rect><path d="M10.75 12.75v1A1.25 1.25 0 0 1 9.5 15h-6A1.25 1.25 0 0 1 2.25 13.75v-9A1.25 1.25 0 0 1 3.5 3.5h1.75"></path></svg></button></div>' : 'Cantidad'}</th>
          ${soloVer ? '<th><div class="column-copy-header"><span>Código SAP</span><button class="copy-button" type="button" data-copy-column="codigoSap" data-copy-label="la columna Código SAP" aria-label="Copiar toda la columna Código SAP" title="Copiar columna Código SAP" onclick="window.copiarColumna(this)"><svg aria-hidden="true" viewBox="0 0 16 16" focusable="false"><rect x="5.25" y="2.25" width="8.5" height="10.5" rx="1.5"></rect><path d="M10.75 12.75v1A1.25 1.25 0 0 1 9.5 15h-6A1.25 1.25 0 0 1 2.25 13.75v-9A1.25 1.25 0 0 1 3.5 3.5h1.75"></path></svg></button></div></th>' : ''}
          ${!soloVer ? '<th>Sumar</th>' : ''}
        </tr>
      </thead>
      <tbody>
      ${todasLasDonas.map(nombre => {
        const cantidad = tempDonas[nombre] || 0;
        const cantidadGenerada = nombre === 'Crema Bavaria'
          ? Number((Number(cantidad) * 13.4).toFixed(1))
          : cantidad;
        const codigoSap = Object.prototype.hasOwnProperty.call(CODIGOS_SAP, nombre)
          ? CODIGOS_SAP[nombre]
          : '';
        return `
        <tr>
          <td>${escaparHTML(nombre)}</td>
          <td id="total-${escaparHTML(nombre)}"${soloVer ? ` data-copy-value="${escaparHTML(cantidadGenerada)}"` : ''}>${escaparHTML(soloVer ? cantidadGenerada : cantidad)}</td>
          ${soloVer ? `<td data-copy-value="${escaparHTML(codigoSap)}">${escaparHTML(codigoSap)}</td>` : ''}
          ${!soloVer ? `
            <td>
              <button data-flavor="${escaparHTML(nombre)}" onclick="window.sumarTemp(this.dataset.flavor,1)">+1</button>
              <button data-flavor="${escaparHTML(nombre)}" onclick="window.sumarTemp(this.dataset.flavor,5)">+5</button>
              <button data-flavor="${escaparHTML(nombre)}" onclick="window.sumarTemp(this.dataset.flavor,10)">+10</button>
              <button data-flavor="${escaparHTML(nombre)}" onclick="window.restarTemp(this.dataset.flavor,1)">-1</button>
            </td>
          ` : ''}
        </tr>
      `}).join('')}
      </tbody>
    </table>
    <div style="margin:15px 0 10px 0; font-weight:bold;">
      <label>ANILLOS: <span id="total-anillos">${totalAnillos}</span></label> &nbsp;&nbsp;
      <label>RELLENAS: <span id="total-rellenas">${totalRellenas}</span></label> &nbsp;&nbsp;
      <label>ANTOJITOS: <span id="total-antojitos">${totalAntojitos}</span></label> &nbsp;&nbsp;
      <label>TE LIMON: <span id="total-te-limon">${totalTeLimon} OZL</span></label> &nbsp;&nbsp;
      <label>TE ARANDANOS: <span id="total-te-arandanos">${totalTeArandanos} OZL</span></label> &nbsp;&nbsp;
      <label>CREMA BAVARIA: <span id="total-crema-bavaria">${totalCremaBavaria} OZ</span></label>
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
  const fecha = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'America/Bogota',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date());
  return fecha.replace(/\//g, '-');
}

// Guardar registro (nuevo o editado)
window.guardarRegistro = function(id) {
  const fechaStr = tempFechaRegistro || getFechaStr();
  const ref = db.ref('registros');
  const botonGuardar = document.querySelector('#popup-registro button[onclick*="guardarRegistro"]');
  if (botonGuardar) botonGuardar.disabled = true;

  if (id.startsWith('temp-')) {
    const nuevoId = ref.push().key;
    const nuevoRegistro = {
      fecha: fechaStr,
      donas: { ...tempDonas },
      generado: false
    };

    ref.transaction(registros => {
      const actualizados = registros || {};
      if (existeRegistroConFecha(actualizados, fechaStr)) return;
      actualizados[nuevoId] = nuevoRegistro;
      return actualizados;
    }, (error, committed) => {
      if (error) {
        console.error('No se pudo guardar el nuevo registro.', error);
        alert('No se pudo guardar el registro. Revisa la conexión e inténtalo de nuevo.');
        if (botonGuardar) botonGuardar.disabled = false;
      } else if (!committed) {
        alert(`Ya existe un registro para ${fechaStr}. No se guardó otro registro con la misma fecha.`);
        if (botonGuardar) botonGuardar.disabled = false;
      } else {
        cerrarPopup();
      }
    }, false);
    return;
  }

  const registroRef = ref.child(id);
  registroRef.transaction(registro => {
    if (!registro || registro.generado) return;
    registro.fecha = registro.fecha || fechaStr;
    registro.donas = { ...tempDonas };
    registro.generado = false;
    return registro;
  }, (error, committed) => {
    if (error) {
      console.error('No se pudo guardar el registro.', error);
      alert('No se pudo guardar el registro. Revisa la conexión e inténtalo de nuevo.');
      if (botonGuardar) botonGuardar.disabled = false;
    } else if (!committed) {
      mostrarRegistroBloqueado(id, registroRef);
    } else {
      cerrarPopup();
    }
  });
};

// Generar registro (bloquear edición)
window.generarRegistro = function(id) {
  // Filtrar donas con valor distinto de 0
  const donasFiltradas = Object.fromEntries(
    Object.entries(tempDonas).filter(([_, cantidad]) => cantidad !== 0)
  );
  const ref = db.ref('registros/' + id);
  ref.transaction(registro => {
    if (!registro || registro.generado) return;
    registro.donas = donasFiltradas;
    registro.generado = true;
    return registro;
  }, (error, committed) => {
    if (error) {
      console.error('No se pudo generar el registro.', error);
      alert('No se pudo generar el registro. Revisa la conexión e inténtalo de nuevo.');
    } else if (!committed) {
      mostrarRegistroBloqueado(id, ref);
    } else {
      cerrarPopup();
    }
  });
};

function detenerSincronizacionRegistros() {
  if (registrosListener) {
    registrosListener.off();
    registrosListener = null;
  }
}

function iniciarSincronizacionRegistros() {
  detenerSincronizacionRegistros();
  registrosListener = db.ref('registros');
  registrosListener.on('value', snapshot => {
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
}

auth.onAuthStateChanged(user => {
  detenerSincronizacionRegistros();
  if (!user) {
    appShell.hidden = true;
    accessScreen.hidden = false;
    accessEmailInput.focus();
    return;
  }

  if (!authorizedStaffUids.includes(user.uid)) {
    accessMessage.textContent = 'Esta cuenta no está autorizada para consultar los registros.';
    accessMessage.classList.add('form-message--error');
    auth.signOut().catch(error => {
      console.error('No se pudo cerrar la sesión de una cuenta no autorizada.', error);
    });
    return;
  }

  accessScreen.hidden = true;
  appShell.hidden = false;
  iniciarSincronizacionRegistros();
});

// Botón para crear nuevo registro
document.getElementById('nuevoRegistroBtn').onclick = nuevoRegistroPopup;

let tempDonas = {};
let tempFechaRegistro = null;

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
  if (id.startsWith('temp-')) return;

  const ref = db.ref('registros/' + id);
  ref.transaction(registro => {
    if (!registro || registro.generado) return;
    registro.fecha = registro.fecha || tempFechaRegistro || getFechaStr();
    registro.donas = { ...tempDonas };
    registro.generado = false;
    return registro;
  }, (error, committed) => {
    if (error) {
      console.error('No se pudieron guardar automáticamente los cambios.', error);
      alert('No se pudieron guardar los cambios. Revisa la conexión e inténtalo de nuevo.');
    } else if (!committed) {
      mostrarRegistroBloqueado(id, ref);
    }
  });
}
