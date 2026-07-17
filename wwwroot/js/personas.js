// ============================================================
//  Registro de Personas — CRUD por AJAX (GET / POST / DELETE)
// ============================================================
(function () {
    "use strict";

    // --- Rutas del controlador ---
    const URL = {
        list: "/Personas/List",
        get: (id) => `/Personas/Get/${id}`,
        save: "/Personas/Save",
        remove: (id) => `/Personas/Delete/${id}`
    };

    // --- Estado en memoria del listado (para búsqueda sin recargar) ---
    let personas = [];

    // --- Referencias del DOM ---
    const tbody = document.getElementById("tablaPersonas");
    const buscador = document.getElementById("buscador");
    const contador = document.getElementById("contadorRegistros");
    const estadoCarga = document.getElementById("estadoCarga");
    const estadoVacio = document.getElementById("estadoVacio");
    const estadoSinResultados = document.getElementById("estadoSinResultados");

    const modalPersonaEl = document.getElementById("modalPersona");
    const modalPersona = new bootstrap.Modal(modalPersonaEl);
    const formPersona = document.getElementById("formPersona");
    const modalPersonaLabel = document.getElementById("modalPersonaLabel");

    const modalEliminarEl = document.getElementById("modalEliminar");
    const modalEliminar = new bootstrap.Modal(modalEliminarEl);

    // Token antiforgery emitido por @Html.AntiForgeryToken() en la vista.
    const antiforgeryToken = document.querySelector('input[name="__RequestVerificationToken"]').value;

    // --------------------------------------------------------
    //  Utilidades
    // --------------------------------------------------------
    function escapeHtml(value) {
        if (value === null || value === undefined) return "";
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function badgeSexo(sexo) {
        const clases = {
            Masculino: "sexo-m",
            Femenino: "sexo-f"
        };
        const clase = clases[sexo]
        return `<span class="badge-sexo ${clase}">${escapeHtml(sexo)}</span>`;
    }

    function mostrarToast(mensaje, tipo) {
        const container = document.getElementById("toastContainer");
        const colores = { success: "text-bg-success", error: "text-bg-danger", info: "text-bg-primary" };
        const wrapper = document.createElement("div");
        wrapper.className = `toast align-items-center border-0 ${colores[tipo] || colores.info}`;
        wrapper.setAttribute("role", "alert");
        wrapper.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${escapeHtml(mensaje)}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Cerrar"></button>
            </div>`;
        container.appendChild(wrapper);
        const toast = new bootstrap.Toast(wrapper, { delay: 3500 });
        toast.show();
        wrapper.addEventListener("hidden.bs.toast", () => wrapper.remove());
    }

    // --------------------------------------------------------
    //  Listar (GET) y renderizar la tabla
    // --------------------------------------------------------
    async function cargarPersonas() {
        estadoCarga.classList.remove("d-none");
        estadoVacio.classList.add("d-none");
        estadoSinResultados.classList.add("d-none");
        try {
            const resp = await fetch(URL.list, { headers: { "Accept": "application/json" } });
            if (!resp.ok) throw new Error("No se pudo obtener el listado.");
            personas = await resp.json();
            renderTabla();
        } catch (err) {
            mostrarToast(err.message || "Error al cargar los registros.", "error");
        } finally {
            estadoCarga.classList.add("d-none");
        }
    }

    function filtrar(lista) {
        const q = (buscador.value || "").trim().toLowerCase();
        if (!q) return lista;
        return lista.filter((p) =>
            [p.primerApellido, p.segundoApellido, p.nombres, p.direccion, p.sexo]
                .filter(Boolean)
                .some((campo) => campo.toLowerCase().includes(q))
        );
    }

    function renderTabla() {
        const lista = filtrar(personas);
        contador.textContent = `${personas.length} ${personas.length === 1 ? "registro" : "registros"}`;

        if (personas.length === 0) {
            tbody.innerHTML = "";
            estadoVacio.classList.remove("d-none");
            estadoSinResultados.classList.add("d-none");
            return;
        }
        estadoVacio.classList.add("d-none");

        if (lista.length === 0) {
            tbody.innerHTML = "";
            estadoSinResultados.classList.remove("d-none");
            return;
        }
        estadoSinResultados.classList.add("d-none");

        tbody.innerHTML = lista.map((p) => `
            <tr>
                <td data-label="Primer Apellido">${escapeHtml(p.primerApellido)}</td>
                <td data-label="Segundo Apellido">${escapeHtml(p.segundoApellido)}</td>
                <td data-label="Nombres">${escapeHtml(p.nombres)}</td>
                <td data-label="Dirección" class="col-direccion">${escapeHtml(p.direccion)}</td>
                <td data-label="Sexo">${badgeSexo(p.sexo)}</td>
                <td data-label="Acciones" class="text-end text-nowrap">
                    <button type="button" class="btn btn-sm btn-outline-primary btn-editar" data-id="${p.id}">Visualizar/Editar</button>
                    <button type="button" class="btn btn-sm btn-outline-danger btn-eliminar" data-id="${p.id}">Eliminar</button>
                </td>
            </tr>`).join("");
    }

    // --------------------------------------------------------
    //  Modal Crear / Editar
    // --------------------------------------------------------
    function limpiarErrores() {
        formPersona.querySelectorAll(".is-invalid").forEach((el) => el.classList.remove("is-invalid"));
        formPersona.querySelectorAll(".invalid-feedback").forEach((el) => (el.textContent = ""));
    }

    function abrirModalNueva() {
        formPersona.reset();
        limpiarErrores();
        document.getElementById("Id").value = "0";
        modalPersonaLabel.textContent = "Nueva persona";
        modalPersona.show();
    }

    async function abrirModalEditar(id) {
        limpiarErrores();
        try {
            const resp = await fetch(URL.get(id), { headers: { "Accept": "application/json" } });
            if (!resp.ok) throw new Error("No se pudo cargar la persona.");
            const p = await resp.json();

            document.getElementById("Id").value = p.id;
            document.getElementById("PrimerApellido").value = p.primerApellido || "";
            document.getElementById("SegundoApellido").value = p.segundoApellido || "";
            document.getElementById("Nombres").value = p.nombres || "";
            document.getElementById("Direccion").value = p.direccion || "";
            document.getElementById("Sexo").value = p.sexo || "";

            modalPersonaLabel.textContent = "Editar persona";
            modalPersona.show();
        } catch (err) {
            mostrarToast(err.message || "Error al abrir el registro.", "error");
        }
    }

    function pintarErrores(errores) {
        Object.keys(errores).forEach((campo) => {
            const input = document.getElementById(campo);
            const feedback = formPersona.querySelector(`.invalid-feedback[data-field="${campo}"]`);
            const mensaje = Array.isArray(errores[campo]) ? errores[campo].join(" ") : errores[campo];
            if (input) input.classList.add("is-invalid");
            if (feedback) feedback.textContent = mensaje;
        });
        // Errores no asociados a un campo concreto → toast.
        const sinCampo = Object.keys(errores).filter((k) => !document.getElementById(k));
        if (sinCampo.length) {
            mostrarToast(errores[sinCampo[0]], "error");
        }
    }

    // Guardar (POST) — crea o actualiza según el Id.
    async function guardarPersona(event) {
        event.preventDefault();
        limpiarErrores();

        const btn = document.getElementById("btnGuardar");
        const spinner = document.getElementById("spinnerGuardar");
        btn.disabled = true;
        spinner.classList.remove("d-none");

        try {
            const formData = new FormData(formPersona);
            const resp = await fetch(URL.save, {
                method: "POST",
                headers: { "RequestVerificationToken": antiforgeryToken },
                body: formData
            });

            const data = await resp.json().catch(() => ({}));

            if (resp.ok && data.success) {
                modalPersona.hide();
                await cargarPersonas();
                mostrarToast(data.message || "Operación realizada correctamente.", "success");
            } else if (resp.status === 400 && data.errors) {
                pintarErrores(data.errors);
            } else {
                mostrarToast(data.message || "No se pudo guardar el registro.", "error");
            }
        } catch (err) {
            mostrarToast("Error de comunicación con el servidor.", "error");
        } finally {
            btn.disabled = false;
            spinner.classList.add("d-none");
        }
    }

    // --------------------------------------------------------
    //  Modal Eliminar (DELETE)
    // --------------------------------------------------------
    function abrirModalEliminar(id) {
        const p = personas.find((x) => x.id === Number(id));
        if (!p) return;
        document.getElementById("idEliminar").value = p.id;
        const nombre = [p.nombres, p.primerApellido, p.segundoApellido].filter(Boolean).join(" ");
        document.getElementById("nombreEliminar").textContent = nombre;
        modalEliminar.show();
    }

    async function confirmarEliminar() {
        const id = document.getElementById("idEliminar").value;
        const btn = document.getElementById("btnConfirmarEliminar");
        const spinner = document.getElementById("spinnerEliminar");
        btn.disabled = true;
        spinner.classList.remove("d-none");

        try {
            const resp = await fetch(URL.remove(id), {
                method: "DELETE",
                headers: { "RequestVerificationToken": antiforgeryToken }
            });
            const data = await resp.json().catch(() => ({}));

            if (resp.ok && data.success) {
                modalEliminar.hide();
                await cargarPersonas();
                mostrarToast(data.message || "Registro eliminado.", "success");
            } else {
                mostrarToast(data.message || "No se pudo eliminar el registro.", "error");
            }
        } catch (err) {
            mostrarToast("Error de comunicación con el servidor.", "error");
        } finally {
            btn.disabled = false;
            spinner.classList.add("d-none");
        }
    }

    // --------------------------------------------------------
    //  Enlace de eventos
    // --------------------------------------------------------
    document.getElementById("btnNueva").addEventListener("click", abrirModalNueva);
    formPersona.addEventListener("submit", guardarPersona);
    document.getElementById("btnConfirmarEliminar").addEventListener("click", confirmarEliminar);
    buscador.addEventListener("input", renderTabla);

    // Delegación de eventos para los botones Editar / Eliminar (filas dinámicas).
    tbody.addEventListener("click", (e) => {
        const editar = e.target.closest(".btn-editar");
        const eliminar = e.target.closest(".btn-eliminar");
        if (editar) abrirModalEditar(editar.dataset.id);
        if (eliminar) abrirModalEliminar(eliminar.dataset.id);
    });

    // Carga inicial.
    cargarPersonas();
})();
