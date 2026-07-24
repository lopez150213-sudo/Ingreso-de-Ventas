// Asegúrate de colocar tu URL larga generada por Google Apps Script
const URL_API = "https://script.google.com/macros/s/AKfycbwHOXKG-_hMSM9Rai_XfxGoRo1UR7gWKQ6rd1gE43J_J2fk74SIAnZ8WlmO6a-e_edp/exec";

const MAESTRO_SERVICIOS = ["Cable Basico", "Combo 150 Mbps", "Combo 180 Mbps", "Combo 220 Mbps", "Combo 300 Mbps", "Internet 150 Mbps", "Internet 180 Mbps", "Internet 220 Mbps", "Internet 300 Mbps"];
const MAESTRO_SECTORES = ["El Pochote", "Reparto Camilo Ortega", "Calle Nueva", "El Escudo", "Reparto Rosario", "El Madroño", "Sector Pila de Agua", "Nueva Esperanza", "Reparto San Carlos", "Adelita No 1", "Adelita No 2", "Posintepe", "Pantanal", "Praderas del mombacho", "El Resbalon", "Calle Palmira", "Santa Isabel", "La Sabaneta", "La Bolsa", "Boca Negra", "El almendro", "Reparto Guzman", "El Hormiguero", "el Consulado", "Calle Real Xalteva", "Pueblo Chiquito", "Sector Monisa", "Villa Nuevo Amanecer", "La Otra banda", "La Islita", "Calle Atravezada", "Silvio Ruiz", "Santa Lucia", "17 de Julio", "El Arsenal", "Brisas del Lago", "Jose Antonio Urbina", "La Merced", "El Ganado", "Calle Corrales", "Calle la Libertad", "Juan de Dios", "Calle el caimito", "Cuiscoma", "Loma Del Mico", "Calle San Juan del Sur", "Santa Rosa", "Solidaridad", "Villa Progreso", "La Calzada", "El Leonora", "Maria Elena Asunsin", "Villa Esperanza", "Fortin", "Villa Sonja", "Cleto Ordoñez", "Domingazo", "Pancasan", "Villa Sultana", "Calle la Inmaculada", "Hermita del Socorro", "Julian Quintana", "La Estacion", "Bartolome No 1", "Bartolome No 2", "La Loquera", "Emer Gomez", "Calle la Ceiba", "Avenida Arellano", "Rpto Arcos de Granada", "Campo de Aterrizaje", "San Matias", "El tamarindo", "Sector la Polvora", "Las Camelias", "El Bolson", "Calle el Cementerio", "Bismarck Martinez", "Silvia Ferrufino", "Manuel Montiel", "EL DIAMANTE", "CHILAMATES", "SAN BLASS", "El Hormigon", "Prusias", "DULCE NIÑO", "Capulin", "Hossana", "Anexo Hossana", "EL Coyol", "Villa Walter Ferreti", "Villa tepetate Sur", "Villa Cocibolca", "Mira Lagos", "Villa Sandino", "Santa Emilia", "Villa tepetate Norte", "CAMINO DE LAS DILIGENCIA", "LOS ORTIZ", "El astillero"];
const CREDENCIALES = {
    "rudy#1": { pass: "r.leiva1", nombre: "RUDY" }, "clara#2": { pass: "c.sacasa2", nombre: "CLARA" }, "milton#3": { pass: "m.torrez3", nombre: "MILTON" },
    "jose#4": { pass: "j.ortiz4", nombre: "JOSE" }, "marcos#5": { pass: "m.ortiz#5", nombre: "MARCOS" }, "steven#6": { pass: "s.nuñez#6", nombre: "STEVEN" }, "fcuevas": { pass: "f.cuevas", nombre: "FLABIO" }
};

let usuarioLogueado = null;
let coordenadas = { latitud: "", longitud: "" };

window.onload = function() {
    const dataSectores = document.getElementById("lista-sectores");
    MAESTRO_SECTORES.forEach(sec => { let opt = document.createElement("option"); opt.value = sec; dataSectores.appendChild(opt); });
    const dataServicios = document.getElementById("lista-servicios");
    MAESTRO_SERVICIOS.forEach(ser => { let opt = document.createElement("option"); opt.value = ser; dataServicios.appendChild(opt); });
};

function login() {
    const userIn = document.getElementById("username").value.trim().toLowerCase();
    const passIn = document.getElementById("password").value.trim();
    
    if (CREDENCIALES[userIn] && CREDENCIALES[userIn].pass === passIn) {
        usuarioLogueado = CREDENCIALES[userIn].nombre;
        document.getElementById("vendedor-tag").innerText = "Vendedor: " + usuarioLogueado;
        document.getElementById("login-screen").classList.add("hidden");
        document.getElementById("app-screen").classList.remove("hidden");
        
        // Cargar los valores del arqueo inmediatamente al entrar
        consultarArqueoServidor(usuarioLogueado);
    } else {
        alert("Usuario o contraseña incorrectos.");
    }
}

// Alternar visualización de la tabla de clientes
function toggleTablaClientes() {
    const contenedor = document.getElementById("contenedor-tabla-clientes");
    const icono = document.getElementById("toggle-icon");
    if (contenedor.classList.contains("hidden")) {
        contenedor.classList.remove("hidden");
        icono.innerText = "⯅";
    } else {
        contenedor.classList.add("hidden");
        icono.innerText = "⯆";
    }
}

// Actualizar visualmente el cuadro de arqueo y la tabla de clientes
function actualizarInterfazArqueo(data) {
    document.getElementById("arq-subtotal").innerText = data.subtotal;
    document.getElementById("arq-deduccion").innerText = data.deduccion;
    document.getElementById("arq-neto").innerText = data.neto;
    document.getElementById("arq-cneto").innerText = data.clienteNeto;
    document.getElementById("arq-adenda").innerText = data.adenda;
    document.getElementById("arq-total").innerText = data.total;

    // Cargar clientes en la tabla
    const tbody = document.getElementById("body-tabla-clientes");
    tbody.innerHTML = "";

    if (data.ventas && data.ventas.length > 0) {
        data.ventas.forEach(v => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${v.contrato}</strong></td>
                <td>${v.cliente}</td>
                <td>${v.sector}</td>
                <td>${v.servicio}</td>
            `;
            tbody.appendChild(tr);
        });
    } else {
        tbody.innerHTML = '<tr><td colspan="4" class="sin-registros">Sin ventas ingresadas aún</td></tr>';
    }
}

function consultarArqueoServidor(vendedor) {
    fetch(`${URL_API}?vendedor=${vendedor}`)
    .then(res => res.json())
    .then(resJson => {
        if (resJson.status === "success") {
            actualizarInterfazArqueo(resJson.data);
        }
    }).catch(e => console.log("Error cargando arqueo estático inicial:", e));
}

function validarContrato(input) {
    input.value = input.value.replace(/\D/g, ''); 
    if (input.value.length > 6) input.value = input.value.slice(0, 6);
    const errorMsg = document.getElementById("contrato-error");
    if (input.value.length < 6 && input.value.length > 0) {
        input.classList.add("input-error"); errorMsg.classList.remove("hidden");
    } else {
        input.classList.remove("input-error"); errorMsg.classList.add("hidden");
    }
}

function toggleNap(checkbox) {
    const napInput = document.getElementById("nap");
    if (checkbox.checked) { napInput.value = "NAP SIN ROTULAR"; napInput.disabled = true; } 
    else { napInput.value = ""; napInput.disabled = false; }
}

function obtenerUbicacion() {
    const statusGeo = document.getElementById("geo-status");
    statusGeo.className = "geo-indicator"; statusGeo.innerText = "Buscando satélites...";
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            coordenadas.latitud = pos.coords.latitude.toFixed(6);
            coordenadas.longitud = pos.coords.longitude.toFixed(6);
            statusGeo.className = "geo-indicator success"; statusGeo.innerText = "📍 Ubicación capturada";
        },
        () => { statusGeo.className = "geo-indicator alert"; statusGeo.innerText = "Error/Sin Permiso"; },
        { enableHighAccuracy: true, timeout: 15000 }
    );
}

function mostrarMensajeApp(texto, tipo) {
    const msgBox = document.getElementById("app-message");
    msgBox.innerText = texto; msgBox.className = "app-message " + tipo;
    msgBox.classList.remove("hidden"); window.scrollTo(0, 0); 
}

function prepararEnvio() {
    const contrato = document.getElementById("contrato").value.trim();
    const cliente = document.getElementById("cliente").value.trim();
    const sector = document.getElementById("sector").value.trim();
    const servicio = document.getElementById("servicio").value.trim();
    const nap = document.getElementById("nap").value.trim();
    
    document.getElementById("app-message").classList.add("hidden");

    if (!contrato || !cliente || !sector || !servicio || !nap) { mostrarMensajeApp("⚠️ Todos los campos con (*) son obligatorios.", "error"); return; }
    if (contrato.length !== 6) { mostrarMensajeApp("⚠️ El contrato debe tener 6 dígitos.", "error"); return; }
    if (!MAESTRO_SECTORES.some(s => s.toLowerCase() === sector.toLowerCase())) { mostrarMensajeApp("⚠️ Sector no válido.", "error"); return; }
    if (!MAESTRO_SERVICIOS.some(s => s.toLowerCase() === servicio.toLowerCase())) { mostrarMensajeApp("⚠️ Paquete no válido.", "error"); return; }
    if (!coordenadas.latitud) { mostrarMensajeApp("⚠️ Debe capturar geoposición primero.", "error"); return; }

    const loadBox = document.getElementById("loading-container");
    const fill = document.getElementById("progress-fill");
    const btnSubmit = document.getElementById("btn-entregar");
    
    btnSubmit.disabled = true; loadBox.classList.remove("hidden"); fill.style.width = "0%";
    setTimeout(() => { fill.style.width = "40%"; }, 150);

    const payload = { vendedor: usuarioLogueado, contrato, cliente, sector, servicio, nap, latitud: coordenadas.latitud, longitud: coordenadas.longitud };

    // Enviar y esperar respuesta con los datos de arqueo calculados tras la venta
    fetch(URL_API, {
        method: "POST",
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(resJson => {
        fill.style.width = "100%";
        setTimeout(() => {
            loadBox.classList.add("hidden"); btnSubmit.disabled = false;
            if(resJson.status === "success") {
                mostrarMensajeApp("🎉 ¡Venta guardada y comisiones actualizadas con éxito!", "success");
                if (resJson.data) actualizarInterfazArqueo(resJson.data);
                limpiarFormulario();
            } else {
                mostrarMensajeApp("❌ Error en servidor: " + resJson.message, "error");
            }
        }, 400);
    })
    .catch(err => {
        loadBox.classList.add("hidden"); btnSubmit.disabled = false;
        // Si cae en no-cors pero guarda, refrescar datos manualmente
        mostrarMensajeApp("🎉 Registro enviado con éxito.", "success");
        consultarArqueoServidor(usuarioLogueado);
        limpiarFormulario();
    });
}

function limpiarFormulario() {
    document.getElementById("contrato").value = ""; document.getElementById("cliente").value = "";
    document.getElementById("sector").value = ""; document.getElementById("servicio").value = "";
    document.getElementById("nap").value = ""; document.getElementById("nap-unmarked").checked = false;
    document.getElementById("nap").disabled = false; document.getElementById("geo-status").className = "geo-indicator alert";
    document.getElementById("geo-status").innerText = "Ubicación obligatoria: No capturada aún";
    coordenadas = { latitud: "", longitud: "" };
}
