const MODELO_BASE = {
    idCliente: 0,
    nombre: "",
    correo: "",
    rfc: "",
    domicilioFiscalReceptor: "",
    regimenFiscalReceptor: "",
    esActivo: 1
}

let tablaData;

$(document).ready(function () {
    // Verificar la respuesta del API primero
    $.ajax({
        url: `${API_URL}/Api/Client`,
        type: "GET",
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: function (response) {
            console.log("Respuesta del API:", response);
            initializeDataTable();
        },
        error: function (xhr, status, error) {
            console.error("Error al obtener datos:", error);
            console.log("Respuesta completa:", xhr.responseText);
        }
    });

    function initializeDataTable() {
        tablaData = $('#tbdata').DataTable({
            responsive: true,
            "ajax": {
                "url": `${API_URL}/Api/Client`,
                "type": "GET",
                "datatype": "json",
                "headers": {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                "dataSrc": "" 
            },
            "columns": [
                { "data": "idCliente", "visible": false, "searchable": false },
                { "data": "nombre" },
                { "data": "correo" },
                { "data": "rfc" },
                { "data": "domicilioFiscalReceptor" },
                { "data": "regimenFiscalReceptor" },
                {
                    "data": "esActivo",
                    "render": function (data) {
                        if (data == 1)
                            return '<span class="badge badge-info">Activo</span>';
                        else
                            return '<span class="badge badge-danger">No Activo</span>';
                    }
                },
                {
                    "defaultContent": '<button class="btn btn-primary btn-editar btn-sm mr-2"><i class="fas fa-pencil-alt"></i></button>' +
                        '<button class="btn btn-danger btn-eliminar btn-sm"><i class="fas fa-trash-alt"></i></button>',
                    "orderable": false,
                    "searchable": false,
                    "width": "80px"
                }
            ],
            "order": [[1, "asc"]], // Cambié a ordenar por la columna nombre (índice 1)
            "dom": "Bfrtip",
            "buttons": [
                {
                    text: 'Exportar Excel',
                    extend: 'excelHtml5',
                    title: '',
                    filename: 'Reporte Clientes',
                    exportOptions: {
                        columns: [1, 2, 3, 4, 5, 6] // Ajusté los índices
                    }
                },
                'pageLength'
            ],
            "language": {
                url: "https://cdn.datatables.net/plug-ins/1.11.5/i18n/es-ES.json"
            }
        });
    }
});

function mostrarModal(modelo = MODELO_BASE) {
    $("#txtId").val(modelo.idCliente)
    $("#txtNombre").val(modelo.nombre)
    $("#txtCorreo").val(modelo.correo)
    $("#txtDomicilio").val(modelo.domicilioFiscalReceptor)
    $("#txtRFC").val(modelo.rfc)

    $("#clienteEstado").val(modelo.esActivo);

    $("#cboRegimenFiscal").val(modelo.regimenFiscalReceptor)
    $("#modalData").modal("show")
}

$("#btnNuevo").click(function () {
    mostrarModal()
})


$("#btnGuardar").click(function () {
    const inputs = $("input.input-validar").serializeArray();
    const inputs_sin_valor = inputs.filter((item) => item.value.trim() === "");

    if (inputs_sin_valor.length > 0) {
        const mensaje = `Debe completar el campo: "${inputs_sin_valor[0].name}"`;
        toastr.warning("", mensaje);
        $(`input[name="${inputs_sin_valor[0].name}"]`).focus();
        return;
    }

    const modelo = structuredClone(MODELO_BASE);

    modelo.idCliente = parseInt($("#txtId").val());
    modelo.nombre = $("#txtNombre").val();
    modelo.correo = $("#txtCorreo").val();
    modelo.rfc = $("#txtRFC").val();
    modelo.domicilioFiscalReceptor = $("#txtDomicilio").val();
    modelo.esActivo = $("#clienteEstado").val() == "1" ? true : false;
    modelo.regimenFiscalReceptor = $("#cboRegimenFiscal").val();

    $("#modalData").find("div.modal-content").LoadingOverlay("show");

    const url = modelo.idCliente === 0
        ? `${API_URL}/Api/Client`
        : `${API_URL}/Api/Client/${modelo.idCliente}`;

    const method = modelo.idCliente === 0 ? "POST" : "PUT";

    $.ajax({
        url: url,
        method: method,
        contentType: "application/json",
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        data: JSON.stringify(modelo),
        success: function (responseJson) {
            console.log(responseJson)
            $("#modalData").find("div.modal-content").LoadingOverlay("hide");

            if (modelo.idCliente === 0) {
                tablaData.row.add(responseJson).draw(false);
                swal("Listo!", "El Cliente fue creado", "success");
            } else {
                tablaData.row(filaSeleccionada).data(responseJson).draw(false);

                filaSeleccionada = null;
                swal("Listo!", "El Cliente fue modificado", "success");
            }
            $("#modalData").modal("hide");
        },
        error: function (jqXHR) {
            console.log(jqXHR)
            $("#modalData").find("div.modal-content").LoadingOverlay("hide");
            console.error("Error:", jqXHR.responseText || jqXHR.statusText);
            swal("Error", "Ocurrió un error al procesar la solicitud", "error");
        }
    });

    $("#modalData").find("div.modal-content").LoadingOverlay("hide");
});


let filaSeleccionada;
$("#tbdata tbody").on("click", ".btn-editar", function () {
    if ($(this).closest("tr").hasClass("child")) {
        filaSeleccionada = $(this).closest("tr").prev();
    } else {
        filaSeleccionada = $(this).closest("tr");
    }

    const data = tablaData.row(filaSeleccionada).data();

    mostrarModal(data);

})

$("#tbdata tbody").on("click", ".btn-eliminar", function () {

    let fila;
    if ($(this).closest("tr").hasClass("child")) {
        fila = $(this).closest("tr").prev();
    } else {
        fila = $(this).closest("tr");
    }

    const data = tablaData.row(fila).data();

    swal({
        title: "¿Está seguro?",
        text: `Eliminar al Cliente "${data.nombre}"`,
        type: "warning",
        showCancelButton: true,
        confirmButtonClass: "btn-danger",
        confirmButtonText: "Si, eliminar",
        cancelButtonText: "No, cancelar",
        closeOnConfirm: true,
        closeOnCancel: true
    },
        function (respuesta) {

            if (respuesta) {
                $(".showSweetAlert").LoadingOverlay("show");

                $.ajax({
                    url: `${API_URL}/Api/Client/${data.idCliente}`,
                    method: "DELETE",
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    },
                    success: function () {
                        tablaData.row(fila).remove().draw()
                        swal("Listo!", "El cliente fue eliminado", "success")
                    }
                })

                $(".showSweetAlert").LoadingOverlay("hide");
            }
        }
    )


})