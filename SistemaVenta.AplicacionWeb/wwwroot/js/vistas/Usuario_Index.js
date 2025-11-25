const MODELO_BASE = {
    idUsuario: 0,
    nombre: "",
    correo: "",
    telefono: "",
    idRol: 0,
    esActivo: 1,
    urlFoto: "",
    nombreFoto: ""
}

let tablaData;

$(document).ready(function () {
    $.ajax({
        url: `${API_URL}/Api/Rol`,
        method: "GET",
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: function (data) {
            data.forEach((item) => {
                $("#cboRol").append(
                    $("<option>").val(item.idRol).text(item.descripcion)
                )
            })
        }
    })


    tablaData = $('#tbdata').DataTable({
        responsive: true,
        "ajax": {
            "url": `${API_URL}/Api/User`,
            "type": "GET",
            "headers": {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            "datatype": "json",
            "dataSrc": ""
        },
        "columns": [
            { "data": "idUsuario", "visible": false, "searchable": false },
            {
                "data": "urlFoto", render: function (data) {
                    return `<img style="height:60px" src=${data} class="rounded mx-auto d-block"/>`
                }
            },
            { "data": "nombre" },
            { "data": "correo" },
            { "data": "telefono" },
            { "data": "idRol" },
            {
                "data": "esActivo", render: function (data) {
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
        order: [[0, "desc"]],
        dom: "Bfrtip",
        buttons: [
            {
                text: 'Exportar Excel',
                extend: 'excelHtml5',
                title: '',
                filename: 'Reporte Usuarios',
                exportOptions: {
                    columns: [2, 3, 4, 5, 6]
                }
            }, 'pageLength'
        ],
        language: {
            url: "https://cdn.datatables.net/plug-ins/1.11.5/i18n/es-ES.json"
        },
    });

})


function mostrarModal(modelo = MODELO_BASE) {
    $("#txtId").val(modelo.idUsuario)
    $("#txtNombre").val(modelo.nombre)
    $("#txtCorreo").val(modelo.correo)
    $("#txtTelefono").val(modelo.telefono)
    $("#cboRol").val(modelo.idRol == 0 ? $("#cboRol option:first").val() : modelo.idRol)
    $("#cboEstado").val(modelo.esActivo ? 1 : 0)
    $("#txtFoto").val("")
    $("#imgUsuario").attr("src", modelo.urlFoto)

    $("#modalData").modal("show")
}

$("#btnNuevo").click(function () {
    mostrarModal()
})

let filaSeleccionada;
$("#btnGuardar").click(async function () {
    const inputs = $("input.input-validar").serializeArray();
    const inputs_sin_valor = inputs.filter((item) => item.value.trim() == "")

    if (inputs_sin_valor.length > 0) {
        const mensaje = `Debe completar el campo : "${inputs_sin_valor[0].name}"`;
        toastr.warning("", mensaje)
        $(`input[name="${inputs_sin_valor[0].name}"]`).focus()
        return;
    }

    const modelo = structuredClone(MODELO_BASE);
    modelo["idUsuario"] = parseInt($("#txtId").val())
    modelo["nombre"] = $("#txtNombre").val()
    modelo["correo"] = $("#txtCorreo").val()
    modelo["telefono"] = $("#txtTelefono").val()
    modelo["idRol"] = $("#cboRol").val()
    modelo["esActivo"] = $("#cboEstado").val() == "1" ? true : false

    const inputFoto = document.getElementById("txtFoto")

    const formData = new FormData();

    formData.append("file", inputFoto.files[0])
    formData.append("folder", "profiles")

    if (inputFoto.files.length > 0) {
        const response = await $.ajax({
            url: `${API_URL}/Api/File`,
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        })

        modelo["urlFoto"] = response.url;
        modelo["nombreFoto"] = response.fileName;
    }

    $("#modalData").find("div.modal-content").LoadingOverlay("show");

    console.log(modelo)

    if (modelo.idUsuario == 0) {
        $.ajax({
            url: `${API_URL}/Api/User`,
            method: 'POST',
            data: JSON.stringify(modelo),
            contentType: "application/json",
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            success: function (response) {
                tablaData.row.add(response).draw(false)
                $("#modalData").modal("hide")
                swal("Listo!", "El usuario fue creado", "success")
            }
        })
            .fail(function (err) {
                console.log(err)
            })
    } else {
        $.ajax({
            url: `${API_URL}/Api/User/${modelo.idUsuario}`,
            method: 'PUT',
            data: JSON.stringify(modelo),
            contentType: "application/json",
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            success: function (response) {
                tablaData.row(filaSeleccionada).data(response).draw(false);
                $("#modalData").modal("hide")
                swal("Listo!", "El usuario fue actualizado", "success")
            }
        })
            .fail(function (err) {
                console.log(err)
            })
    }

    $("#modalData").find("div.modal-content").LoadingOverlay("hide");
})

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
        text: `Eliminar al usuario "${data.nombre}"`,
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
                    url: `${API_URL}/Api/User/${data.idUsuario}`,
                    method: "DELETE", 
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    },
                    success: function () {
                        tablaData.row(fila).remove().draw()
                        swal("Listo!", "El usuario fue eliminado", "success")
                    }
                })
            }
        }
    )


})