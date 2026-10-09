const URL_API = "https://script.google.com/macros/s/AKfycbwHMfbIPcPlsrNiwlPbSG3SA0ZXMf4SI7lL2ymWjxiOP52iqiit5TkyRMe_PhuwxDIs/exec";

// MAESTRO DE SERVICIOS ACTUALIZADO CON PRECIOS (USD Y C$)
const MAESTRO_SERVICIOS = [
    { nombre: "Cable Basico", usd: 15.53, nio: 568.59 },
    { nombre: "Combo 150 Mbps", usd: 31.99, nio: 1171.29 },
    { nombre: "Combo 180 Mbps", usd: 34.99, nio: 1281.22 },
    { nombre: "Combo 250 Mbps", usd: 37.99, nio: 1391.15 },
    { nombre: "Combo 300 Mbps", usd: 41.99, nio: 1537.95 },
    { nombre: "Internet 150 Mbps", usd: 25.99, nio: 951.50 },
    { nombre: "Internet 180 Mbps", usd: 28.99, nio: 1061.30 },
    { nombre: "Internet 250 Mbps", usd: 32.99, nio: 1207.80 },
    { nombre: "Internet 300 Mbps", usd: 37.99, nio: 1390.80 }
];

const MAESTRO_SECTORES = ["El Pochote", "Reparto Camilo Ortega", "Calle Nueva", "El Escudo", "Reparto Rosario", "El Madroño", "Sector Pila de Agua", "Nueva Esperanza", "Reparto San Carlos", "Adelita No 1", "Adelita No 2", "Posintepe", "Pantanal", "Praderas del mombacho", "El Resbalon", "Calle Palmira", "Santa Isabel", "La Sabaneta", "La Bolsa", "Boca Negra", "El almendro", "Reparto Guzman", "El Hormiguero", "el Consulado", "Calle Real Xalteva", "Pueblo Chiquito", "Sector Monisa", "Villa Nuevo Amanecer", "La Otra banda", "La Islita", "Calle Atravezada", "Silvio Ruiz", "Santa Lucia", "17 de Julio", "El Arsenal", "Brisas del Lago", "Jose Antonio Urbina", "La Merced", "El Ganado", "Calle Corrales", "Calle la Libertad", "Juan de Dios", "Calle el caimito", "Cuiscoma", "Loma Del Mico", "Calle San Juan del Sur", "Santa Rosa", "Solidaridad", "Villa Progreso", "La Calzada", "El Leonora", "Maria Elena Asunsin", "Villa Esperanza", "Fortin", "Villa Sonja", "Cleto Ordoñez", "Domingazo", "Pancasan", "Villa Sultana", "Calle la Inmaculada", "Hermita del Socorro", "Julian Quintana", "La Estacion", "Bartolome No 1", "Bartolome No 2", "La Loquera", "Emer Gomez", "Calle la Ceiba", "Avenida Arellano", "Rpto Arcos de Granada", "Campo de Aterrizaje", "San Matias", "El tamarindo", "Sector la Polvora", "Las Camelias", "El Bolson", "Calle el Cementerio", "Bismarck Martinez", "Silvia Ferrufino", "Manuel Montiel", "EL DIAMANTE", "CHILAMATES", "SAN BLASS", "El Hormigon", "Prusias", "DULCE NIÑO", "Capulin", "Hossana", "Anexo Hossana", "EL Coyol", "Villa Walter Ferreti", "Villa tepetate Sur", "Villa Cocibolca", "Mira Lagos", "Villa Sandino", "Santa Emilia", "Villa tepetate Norte", "CAMINO DE LAS DILIGENCIA", "LOS ORTIZ", "El astillero"];

const CREDENCIALES = {
    "rudy#1": { pass: "r.leiva1", nombre: "RUDY" }, 
    "clara#2": { pass: "c.sacasa2", nombre: "CLARA" }, 
    "milton#3": { pass: "m.torrez3", nombre: "MILTON" },
    "jose#4": { pass: "j.ortiz4", nombre: "JOSE" }, 
    "marcos#5": { pass: "m.ortiz#5", nombre: "MARCOS" }, 
    "steven#6": { pass: "s.nuñez#6", nombre: "STEVEN" }, 
    "fcuevas": { pass: "f.cuevas", nombre: "FLABIO" }
};

let usuarioLogueado = null;
let coordenadas = { latitud: "", longitud: "" };

window.onload = function() {
    const dataSectores = document.getElementById("lista-sectores");
    if (dataSectores) {
        MAESTRO_SECTORES.forEach(sec => { 
            let opt = document.createElement("option"); 
            opt.value = sec; 
            dataSectores.appendChild(opt); 
        });
    }
    const dataServicios = document.getElementById("lista-servicios");
    if (dataServicios) {
        MAESTRO_SERVICIOS.forEach(ser => { 
            let opt = document.createElement("option"); 
            opt.value = ser.nombre; 
            opt.textContent = `${ser.nombre} ($${ser.usd} / C$ ${ser.nio})`;
            dataServicios.appendChild(opt); 
        });
    }
};

// Función auxiliar para determinar el saludo según la hora del día
function obtenerSaludo() {
    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12) return 'Buenos días';
    if (hora >= 12 && hora < 18) return 'Buenas tardes';
    return 'Buenas noches';
}

function login() {
    const userIn = document.getElementById("username").value.trim().toLowerCase();
    const passIn = document.getElementById("password").value.trim();
    
    if (CREDENCIALES[userIn] && CREDENCIALES[userIn].pass === passIn) {
        usuarioLogueado = CREDENCIALES[userIn].nombre;
        document.getElementById("vendedor-tag").innerText = "Vendedor: " + usuarioLogueado;
        document.getElementById("login-screen").classList.add("hidden");
        document.getElementById("app-screen").classList.remove("hidden");
        // Consulta los datos del servidor inmediatamente al iniciar sesión
        consultarArqueoServidor(usuarioLogueado);
    } else {
        alert("Usuario o contraseña incorrectos.");
    }
}

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

function actualizarInterfazArqueo(data) {
    if (!data) return;

    // Función auxiliar para formatear los números a Córdobas (C$)
    const aCordobas = (val) => "C$ " + (val !== undefined ? Number(val).toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00");

    // 1. Actualiza sección de COMISIONES agregando C$
    if (document.getElementById("arq-subtotal")) document.getElementById("arq-subtotal").innerText = aCordobas(data.subtotal);
    if (document.getElementById("arq-deduccion")) document.getElementById("arq-deduccion").innerText = aCordobas(data.deduccion);
    if (document.getElementById("arq-neto")) document.getElementById("arq-neto").innerText = aCordobas(data.neto);

    // 2. Actualiza sección de RESUMEN DE CONTRATOS
    if (document.getElementById("arq-cneto")) document.getElementById("arq-cneto").innerText = data.clienteNeto !== undefined ? data.clienteNeto : 0;
    if (document.getElementById("arq-adenda")) document.getElementById("arq-adenda").innerText = data.adenda !== undefined ? data.adenda : 0;
    if (document.getElementById("arq-total")) document.getElementById("arq-total").innerText = data.total !== undefined ? data.total : 0;

    // 3. Renderiza la tabla con los clientes ingresados
    const tbody = document.getElementById("body-tabla-clientes");
    if (tbody) {
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
}

function consultarArqueoServidor(vendedor) {
    fetch(`${URL_API}?vendedor=${vendedor}`)
    .then(res => res.json())
    .then(resJson => {
        const datosArqueo = resJson.data ? resJson.data : resJson;
        actualizarInterfazArqueo(datosArqueo);
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

/* --- EXTRACCIÓN CON GEMINI DESDE EL BACKEND --- */
async function procesarFotoContrato(input) {
    if (!input.files || !input.files[0]) return;
    const archivo = input.files[0];
    const statusIa = document.getElementById("ia-status");
    statusIa.classList.remove("hidden");
    statusIa.innerText = "⏳ Enviando documento al servidor para lectura IA...";

    try {
        const base64 = await convertirBase64(archivo);
        const base64Clean = base64.split(',')[1];

        // Se envía la lista de nombres de servicios a la IA
        const payload = {
            accion: "procesar_ia",
            imagenBase64: base64Clean,
            mimeType: archivo.type,
            sectores: MAESTRO_SECTORES,
            servicios: MAESTRO_SERVICIOS.map(s => s.nombre)
        };

        const res = await fetch(URL_API, {
            method: "POST",
            body: JSON.stringify(payload)
        });

        const resultJson = await res.json();

        if (resultJson.status !== "success") {
            throw new Error(resultJson.message || "Error procesando imagen");
        }

        const datos = resultJson.datos;

        if (datos.contrato) document.getElementById("contrato").value = datos.contrato;
        if (datos.cliente) document.getElementById("cliente").value = datos.cliente;
        if (datos.telefono) document.getElementById("telefono").value = datos.telefono;
        if (datos.sector) document.getElementById("sector").value = datos.sector;
        if (datos.servicio) document.getElementById("servicio").value = datos.servicio;
        if (datos.nap) {
            if (datos.nap.toUpperCase() === "NAP SIN ROTULAR") {
                document.getElementById("nap-unmarked").checked = true;
                toggleNap(document.getElementById("nap-unmarked"));
            } else {
                document.getElementById("nap").value = datos.nap;
            }
        }

        statusIa.innerText = "✅ Datos extraídos con éxito";
    } catch (err) {
        console.error("Error al procesar la imagen:", err);
        statusIa.innerText = "❌ No se pudo leer el documento";
    }
}

function convertirBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function enviarWhatsAppBienvenida(cliente, telefono, contrato, servicioNombre) {
    // Formatear número de teléfono para Nicaragua (505)
    let numLimpio = telefono.replace(/\D/g, '');
    if (numLimpio.length === 8) {
        numLimpio = '505' + numLimpio;
    }

    const saludo = obtenerSaludo();
    const nombreFormateado = cliente ? `*${cliente}*` : 'estimado/a cliente';
    const contratoFormateado = contrato ? `*${contrato}*` : 'N/A';

    // Lógica para determinar si es un Servicio Anexado (Internet -> Combo) o Nueva Contratación
    let detallePrecio = "";
    const nombreBuscado = (servicioNombre || "").trim();
    const esSoloInternet = nombreBuscado.toLowerCase().startsWith("internet");

    if (esSoloInternet) {
        // Extrae los megas (ej. "150 Mbps") para armar la equivalencia en Combo
        const MBs = nombreBuscado.replace(/internet/i, "").trim(); 
        const nombreComboEquivalente = `Combo ${MBs}`;
        const infoCombo = MAESTRO_SERVICIOS.find(s => s.nombre.toLowerCase() === nombreComboEquivalente.toLowerCase());

        if (infoCombo && infoCombo.nio > 0) {
            detallePrecio = `💰 *Servicio Anexado:*\nAcaba de anexar *${nombreBuscado}* a su factura y el monto total en *${infoCombo.nombre}* es de *$${infoCombo.usd} USD / C$ ${infoCombo.nio.toFixed(2)} NIO*\n\n`;
        } else {
            // Si no encuentra la equivalencia exacta, usa el servicio actual
            const infoServicio = MAESTRO_SERVICIOS.find(s => s.nombre.toLowerCase() === nombreBuscado.toLowerCase());
            if (infoServicio) {
                detallePrecio = `💰 *Servicio Anexado:*\nAcaba de anexar *${nombreBuscado}* a su factura y el monto total en combo es de *$${infoServicio.usd} USD / C$ ${infoServicio.nio.toFixed(2)} NIO*\n\n`;
            }
        }
    } else {
        // Para Cable Básico o Combos nuevos
        const infoServicio = MAESTRO_SERVICIOS.find(s => s.nombre.toLowerCase() === nombreBuscado.toLowerCase());
        if (infoServicio && infoServicio.nio > 0) {
            detallePrecio = `💰 *Plan Contratado:*\n${infoServicio.nombre} ($${infoServicio.usd} USD / C$ ${infoServicio.nio.toFixed(2)} NIO)\n\n`;
        }
    }

    // Códigos Unicode para emojis
    const emojiMano = "\u{1F44B}";          // 👋
    const emojiCorazon = "\u{1F9E1}";       // 🧡
    const emojiFiesta = "\u{1F389}";        // 🎉
    const emojiNicaragua = "\u{1F1F3}\u{1F1EE}"; // 🇳🇮
    const emojiReloj = "\u{23F1}\u{FE0F}";  // ⏱️
    const emojiCalendario = "\u{1F4C5}";   // 📅
    const emojiPin = "\u{1F4CD}";          // 📍
    const emojiHerramienta = "\u{1F6E0}\u{FE0F}"; // 🛠️
    const emojiTelefono = "\u{1F4DE}";     // 📞
    const emojiDocumento = "\u{1F4DC}";    // 📜
    const emojiChispas = "\u{2728}";       // ✨

    const mensajeBienvenida = `${saludo}, ${nombreFormateado} ${emojiMano}\n\n` +
      `¡Bienvenid@ a la *Familia Naranja* de *TELECABLE GRANADA*! ${emojiCorazon}${emojiFiesta} Nos alegra enormemente que formes parte de nosotros, porque en esta tierra ¡entre nicas nos conectamos! ${emojiNicaragua}\n\n` +
      `A continuación, te compartimos la información importante sobre tu contrato N° ${contratoFormateado}:\n\n` +
      detallePrecio +
      `${emojiReloj} *Periodo de Instalación:*\nSu servicio será instalado en un lapso máximo de *72 horas hábiles*. Nuestro equipo técnico se pondrá en contacto previo a la visita.\n\n` +
      `${emojiCalendario} *Fechas de Pago:*\nEl período de pago de su factura es del *1 al 10 de cada mes* para mantener su servicio activo y sin interrupciones.\n\n` +
      `${emojiPin} *PUNTOS DE PAGO AUTORIZADOS:*\nAirpack\nSúper Express y AMPM\nRapiBac y Agentes Banpro\nTelepago BAC: 1800-1524\nPago en línea: https://pago.telecablegranada.com/\nSucursal TELECABLE Granada\nGestor de cobro asignado\n\n` +
      `${emojiHerramienta} *Soporte Técnico y Atención al Cliente:*\nSi presenta alguna eventualidad con su servicio, puede reportarlo directamente a nuestras líneas de atención:\n${emojiTelefono} *7833-4590* / **2272*\n\n` +
      `${emojiDocumento} *Términos y Condiciones:*\nAl contratar nuestro servicio, usted acepta los términos y condiciones operativos de la empresa.\n\n` +
      `Agradecemos nuevamente su confianza en nosotros. ¡Es un orgullo conectarte con lo que más querés! ${emojiCorazon}${emojiChispas}`;

    const urlWhatsApp = `https://api.whatsapp.com/send?phone=${numLimpio}&text=${encodeURIComponent(mensajeBienvenida)}`;
    window.location.href = urlWhatsApp;
}

function prepararEnvio() {
    const contrato = document.getElementById("contrato").value.trim();
    const cliente = document.getElementById("cliente").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const sector = document.getElementById("sector").value.trim();
    const servicio = document.getElementById("servicio").value.trim();
    const nap = document.getElementById("nap").value.trim();
    
    document.getElementById("app-message").classList.add("hidden");

    if (!contrato || !cliente || !telefono || !sector || !servicio || !nap) { mostrarMensajeApp("⚠️ Todos los campos con (*) son obligatorios.", "error"); return; }
    if (contrato.length !== 6) { mostrarMensajeApp("⚠️ El contrato debe tener 6 dígitos.", "error"); return; }
    if (!MAESTRO_SECTORES.some(s => s.toLowerCase() === sector.toLowerCase())) { mostrarMensajeApp("⚠️ Sector no válido.", "error"); return; }
    if (!MAESTRO_SERVICIOS.some(s => s.nombre.toLowerCase() === servicio.toLowerCase())) { mostrarMensajeApp("⚠️ Paquete no válido.", "error"); return; }
    if (!coordenadas.latitud) { mostrarMensajeApp("⚠️ Debe capturar geoposición primero.", "error"); return; }

    const loadBox = document.getElementById("loading-container");
    const fill = document.getElementById("progress-fill");
    const btnSubmit = document.getElementById("btn-entregar");
    
    btnSubmit.disabled = true; loadBox.classList.remove("hidden"); fill.style.width = "0%";
    setTimeout(() => { fill.style.width = "40%"; }, 150);

    // Obtener objeto de servicio para extraer precios
    const objServicio = MAESTRO_SERVICIOS.find(s => s.nombre.toLowerCase() === servicio.toLowerCase());
    const precioUsd = objServicio ? objServicio.usd : 0;
    const precioNio = objServicio ? objServicio.nio : 0;

    const payload = { 
        accion: "guardar_venta", 
        vendedor: usuarioLogueado, 
        contrato, 
        cliente, 
        telefono, 
        sector, 
        servicio, 
        precioUsd,
        precioNio,
        nap, 
        latitud: coordenadas.latitud, 
        longitud: coordenadas.longitud 
    };

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
                mostrarMensajeApp("🎉 ¡Venta guardada con éxito! Redirigiendo a WhatsApp...", "success");
                if (resJson.data) actualizarInterfazArqueo(resJson.data);
                limpiarFormulario();
                // Redirección inmediata a WhatsApp incluyendo el nombre del servicio
                enviarWhatsAppBienvenida(cliente, telefono, contrato, servicio);
            } else {
                mostrarMensajeApp("❌ Error en servidor: " + resJson.message, "error");
            }
        }, 400);
    })
    .catch(err => {
        loadBox.classList.add("hidden"); btnSubmit.disabled = false;
        mostrarMensajeApp("🎉 Registro enviado con éxito. Redirigiendo a WhatsApp...", "success");
        consultarArqueoServidor(usuarioLogueado);
        limpiarFormulario();
        // Redirección a WhatsApp en el respaldo catch
        enviarWhatsAppBienvenida(cliente, telefono, contrato, servicio);
    });
}

function limpiarFormulario() {
    document.getElementById("contrato").value = ""; document.getElementById("cliente").value = "";
    document.getElementById("telefono").value = ""; document.getElementById("sector").value = ""; 
    document.getElementById("servicio").value = ""; document.getElementById("nap").value = ""; 
    document.getElementById("nap-unmarked").checked = false; document.getElementById("nap").disabled = false; 
    document.getElementById("geo-status").className = "geo-indicator alert";
    document.getElementById("geo-status").innerText = "Ubicación obligatoria: No capturada aún";
    document.getElementById("ia-status").classList.add("hidden");
    coordenadas = { latitud: "", longitud: "" };
}