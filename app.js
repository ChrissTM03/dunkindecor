// Firebase
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
  "Anillo Chocoarcoiris",
  "Boston Cream",
  "Glaseada",
  "Rellena Fresa"
  // ...agrega más tipos aquí
];

// Utilidad para crear popups simples
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
  // Elimina cualquier estilo inline en el div interno:
  popup.innerHTML = `<div>${html}</div>`;
}
function cerrarPopup() {
  let popup = document.getElementById('popup-registro');
  if (popup) popup.remove();
  tempDonas = {};
}

// Mostrar todos los registros en la tabla principal
function renderTablaRegistros(registros) {
  const contenedor = document.getElementById('tabla-registros');
  contenedor.innerHTML = ''; // Limpia el contenedor antes de agregar la tabla
  const tabla = document.createElement('table');
  tabla.innerHTML = `
    <tr>
      <th>Fecha</th>
      <th>Estado</th>
      <th>Acciones</th>
    </tr>
    ${Object.entries(registros).map(([id, data]) => `
      <tr>
        <td>${data.fecha}</td>
        <td>${data.generado ? 'GENERADO' : 'EDITABLE'}</td>
        <td>
          <button onclick="verRegistro('${id}')">VER</button>
          <button onclick="eliminarRegistro('${id}')">ELIMINAR</button>
        </td>
      </tr>
    `).join('')}
  `;
  contenedor.appendChild(tabla);
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
};

// Renderiza el detalle de un registro (modo visualización o edición)
function renderRegistroDetalle(id, data, soloVer, esNuevo = false) {
  if (!data) data = {};
  if (!data.donas) data.donas = {};

  // Solo inicializa tempDonas si está vacío
  if (Object.keys(tempDonas).length === 0) {
    tempDonas = { ...data.donas };
  }

  // Lista de donas para este registro (predefinidas + agregadas)
  const todasLasDonas = Array.from(new Set([...Object.keys(tempDonas), ...DONAS]));

  let html = `<h2>Registro ${data.fecha}</h2>
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
            </td>
          ` : ''}
        </tr>
      `).join('')}
    </table>
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
  let ref = db.ref('registros/' + id);
  ref.set({
    fecha: fechaStr,
    donas: { ...tempDonas },
    generado: true
  }).then(() => {
    tempDonas = {};
    cerrarPopup();
  });
};

// Mostrar todos los registros al cargar la página y actualizar en tiempo real
db.ref('registros').on('value', snapshot => {
  const registros = snapshot.val() || {};
  renderTablaRegistros(registros);
});

// Botón para crear nuevo registro
document.getElementById('nuevoRegistroBtn').onclick = nuevoRegistroPopup;

// Eliminar el detalle antiguo de la página principal
document.getElementById('registro-detalle').innerHTML = '';

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
    const fecha = document.querySelector('h2').textContent.replace('Registro ', '');
    // Solo actualiza el contenido del popup, no crea uno nuevo
    document.querySelector('#popup-registro').innerHTML =
      `<div>${renderRegistroDetalle(id, { fecha, donas: { ...tempDonas }, generado: false }, false, id.startsWith('temp-'))}</div>`;
  }
  input.value = '';
};
