// En las primeras líneas elimina GEMINI_API_KEY
const URL_API = "https://script.google.com/macros/s/AKfycbz8h5KUnxJ_GLJHTNFjv2yjYgW40tHvJy92Z7BWl72_4ZtxgyVrfBJx_OybXk2l3DCt/exec";

// ... [Mantén tus constantes MAESTRO_SERVICIOS, MAESTRO_SECTORES, CREDENCIALES, etc.] ...

async function procesarFotoContrato(input) {
    if (!input.files || !input.files[0]) return;
    const archivo = input.files[0];
    const statusIa = document.getElementById("ia-status");
    statusIa.classList.remove("hidden");
    statusIa.innerText = "⏳ Enviando imagen al servidor...";

    try {
        const base64 = await convertirBase64(archivo);
        const base64Clean = base64.split(',')[1];

        // Se envía a la misma URL_API de Google Apps Script
        const res = await fetch(URL_API, {
            method: "POST",
            body: JSON.stringify({
                action: "procesarIA",
                imagenBase64: base64Clean,
                mimeType: archivo.type
            })
        });

        const resJson = await res.json();

        if (resJson.status !== "success") {
            throw new Error(resJson.message || "Error procesando la imagen.");
        }

        const datos = resJson.data;

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
        console.error("Error al procesar con la IA:", err);
        statusIa.innerText = "❌ No se pudo leer el documento";
    }
}