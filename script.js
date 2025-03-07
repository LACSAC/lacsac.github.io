document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("fechaHoy").innerText = new Date().toISOString().split("T")[0];
});

let registros = [];

function registrarHoras() {
    let nombre = document.getElementById("nombre").value.trim();
    let apellido = document.getElementById("apellido").value.trim();
    let fecha = document.getElementById("fecha").value;
    let entrada = document.getElementById("entrada").value;
    let salida = document.getElementById("salida").value;
    let tipoPago = document.getElementById("tipoPago").value;

    if (!nombre || !apellido || !fecha || !entrada || !salida || !tipoPago) {
        alert("Por favor, complete todos los campos.");
        return;
    }

    let horasTrabajadas = calcularHoras(entrada, salida);
    let pago = tipoPago === "hora" ? horasTrabajadas * 25 : 150;

    registros.push({ nombre, apellido, fecha, entrada, salida, horasTrabajadas, tipoPago, pago });
    actualizarTabla();
}

function calcularHoras(entrada, salida) {
    let [h1, m1] = entrada.split(":").map(Number);
    let [h2, m2] = salida.split(":").map(Number);
    let totalHoras = ((h2 * 60 + m2) - (h1 * 60 + m1)) / 60;
    return Math.max(totalHoras - 1, 0); // Resta 1 hora de almuerzo
}

function actualizarTabla() {
    let historial = document.getElementById("historial");
    historial.innerHTML = "";
    let sueldoTotal = 0;

    registros.forEach((r) => {
        let fila = `<tr>
            <td>${r.fecha}</td>
            <td>${r.entrada}</td>
            <td>${r.salida}</td>
            <td>${r.horasTrabajadas.toFixed(2)}</td>
            <td>${r.tipoPago}</td>
            <td>S/ ${r.pago.toFixed(2)}</td>
        </tr>`;
        historial.innerHTML += fila;
        sueldoTotal += r.pago;
    });

    document.getElementById("sueldoTotal").innerText = sueldoTotal.toFixed(2);
}
function actualizarTabla() {
    let historial = document.getElementById("historial");
    historial.innerHTML = "";
    let sueldoTotal = 0;

    registros.forEach((r, index) => {
        let fila = `<tr>
            <td>${r.fecha}</td>
            <td>${r.entrada}</td>
            <td>${r.salida}</td>
            <td>${r.horasTrabajadas.toFixed(2)}</td>
            <td>${r.tipoPago}</td>
            <td>S/ ${r.pago.toFixed(2)}</td>
            <td>
                <button onclick="eliminarRegistro(${index})" class="btn-eliminar">🗑️</button>
            </td>
        </tr>`;
        historial.innerHTML += fila;
        sueldoTotal += r.pago;
    });

    document.getElementById("sueldoTotal").innerText = sueldoTotal.toFixed(2);
}

function eliminarRegistro(index) {
    if (confirm("¿Estás seguro de que deseas eliminar este registro?")) {
        registros.splice(index, 1); // Elimina el registro del array
        actualizarTabla(); // Vuelve a mostrar la tabla
    }
}
function actualizarTabla() {
    let historial = document.getElementById("historial");
    historial.innerHTML = "";
    let sueldoTotal = 0;

    registros.forEach((r, index) => {
        let fila = `<tr>
            <td>${r.fecha}</td>
            <td>${r.entrada}</td>
            <td>${r.salida}</td>
            <td>${r.horasTrabajadas.toFixed(2)}</td>
            <td>${r.tipoPago}</td>
            <td>S/ ${r.pago.toFixed(2)}</td>
            <td>
                <button onclick="editarRegistro(${index})" class="btn-editar">✏️</button>
                <button onclick="eliminarRegistro(${index})" class="btn-eliminar">🗑️</button>
            </td>
        </tr>`;
        historial.innerHTML += fila;
        sueldoTotal += r.pago;
    });

    document.getElementById("sueldoTotal").innerText = sueldoTotal.toFixed(2);
}
function editarRegistro(index) {
    let registro = registros[index];

    // Llenar el formulario con los datos del registro seleccionado
    document.getElementById("nombre").value = registro.nombre;
    document.getElementById("apellido").value = registro.apellido;
    document.getElementById("fecha").value = registro.fecha;
    document.getElementById("entrada").value = registro.entrada;
    document.getElementById("salida").value = registro.salida;
    document.getElementById("tipoPago").value = registro.tipoPago;

    // Remover el registro actual para que se reemplace cuando se registre de nuevo
    registros.splice(index, 1);

    // Actualizar la tabla
    actualizarTabla();
}


function ordenarTabla() {
    let criterio = document.getElementById("ordenarPor").value;

    if (criterio === "fecha") {
        registros.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    } else if (criterio === "nombre") {
        registros.sort((a, b) => a.nombre.localeCompare(b.nombre));
    } else if (criterio === "pago") {
        registros.sort((a, b) => b.pago - a.pago);
    }

    actualizarTabla();
}

function importarExcel() {
    let fileInput = document.getElementById("fileInput");
    let file = fileInput.files[0];
    if (!file) {
        alert("Por favor, seleccione un archivo Excel.");
        return;
    }

    let reader = new FileReader();
    reader.onload = function (e) {
        let data = new Uint8Array(e.target.result);
        let workbook = XLSX.read(data, { type: "array" });
        let sheet = workbook.Sheets[workbook.SheetNames[0]];
        let rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        registros = [];
        rows.slice(1).forEach(row => {
            if (row.length < 4) return;
            let horasTrabajadas = calcularHoras(row[1], row[2]);
            let pago = row[3] === "hora" ? horasTrabajadas * 25 : 150;
            registros.push({
                fecha: row[0],
                entrada: row[1],
                salida: row[2],
                horasTrabajadas,
                tipoPago: row[3],
                pago
            });
        });

        actualizarTabla();
    };
    reader.readAsArrayBuffer(file);
}

// PDF
function imprimirReporte() {
    if (registros.length === 0) {
        alert("No hay datos para imprimir.");
        return;
    }

    let nombre = document.getElementById("nombre").value || "No registrado";
    let apellido = document.getElementById("apellido").value || "No registrado";
    let tipoPago = document.getElementById("tipoPago").value === "hora" ? "S/ 25 por Hora" : "S/ 150 por Día";
    let fechaActual = new Date().toLocaleDateString();

    // Obtener los meses únicos de los registros
    let meses = [...new Set(registros.map(r => {
        let fecha = new Date(r.fecha);
        return fecha.toLocaleString('es-ES', { month: 'long' }).toUpperCase(); // Convierte a mayúsculas
    }))].join(" Y "); // Une los meses si hay más de uno

    let nuevaVentana = window.open("", "_blank");
    nuevaVentana.document.write(`
        <html>
        <head>
            <title>Reporte de Asistencia</title>
            <style>
                @media print {
                    .btn-imprimir { display: none; } /* Ocultar botón al imprimir */
                }

                body { font-family: Arial, sans-serif; padding: 40px; width: 210mm; }
                .container { text-align: center; }
                h1 { color: #2C3E50; font-size: 20px; }
                h2 { font-size: 16px; margin-top: -5px; color: #555; } /* Subtítulo con el mes */
                .datos { text-align: left; margin-bottom: 20px; font-size: 14px; }
                .logo { width: 180px; margin-bottom: 10px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
                table, th, td { border: 1px solid black; padding: 5px; text-align: center; }
                th { background-color: #3498DB; color: white; padding: 8px; }
                td { padding: 6px; }
                .total { font-size: 16px; font-weight: bold; margin-top: 20px; text-align: right; }
                .firmas { margin-top: 80px; display: flex; justify-content: space-between; padding: 0 50px; }
                .firma-box { text-align: center; width: 40%; font-size: 14px; font-weight: bold; }
                .firma-box .linea { display: block; border-top: 2px solid black; width: 100%; margin-bottom: 5px; height: 2px; }
                .btn-imprimir { margin-top: 30px; padding: 10px 15px; font-size: 14px; background: #3498DB; color: white; border: none; cursor: pointer; }
                .btn-imprimir:hover { background: #2980B9; }
            </style>
        </head>
        <body>
            <div class="container">
                <img src="image.png" class="logo">
                <h1>Cálculo y Registro de Horas Trabajadas de Terceros</h1>
                <h2>MES: ${meses}</h2> <!-- Nuevo subtítulo con el mes o meses -->
                <div class="datos">
                    <p><strong>Fecha de Reporte:</strong> ${fechaActual}</p>
                    <p><strong>Trabajador:</strong> ${nombre} ${apellido}</p>
                    <p><strong>Tipo de Pago:</strong> ${tipoPago}</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Entrada</th>
                            <th>Salida</th>
                            <th>Horas Trabajadas</th>
                            <th>Tipo de Pago</th>
                            <th>Monto</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${registros.map(r => `
                            <tr>
                                <td>${r.fecha}</td>
                                <td>${r.entrada}</td>
                                <td>${r.salida}</td>
                                <td>${r.horasTrabajadas.toFixed(2)}</td>
                                <td>${r.tipoPago}</td>
                                <td>S/ ${r.pago.toFixed(2)}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
                <p class="total">Sueldo Total: S/ ${registros.reduce((total, r) => total + r.pago, 0).toFixed(2)}</p>

                <div class="firmas">
                    <div class="firma-box">
                        <span class="linea"></span>
                        TRABAJADOR
                    </div>
                    <div class="firma-box">
                        <span class="linea"></span>
                        JEFE INMEDIATO
                    </div>
                </div>

                <button class="btn-imprimir" onclick="window.print()">Imprimir</button>
            </div>
        </body>
        </html>
    `);

    nuevaVentana.document.close();
}
