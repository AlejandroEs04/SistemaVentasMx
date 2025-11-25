const MODELO_BASE = {
    idCategoria: 0,
    descripcion: "",
    esActivo: 1,
}


let tablaData;

$(document).ready(function () {
    tablaData = $('#tbdata').DataTable({
        responsive: true,
        "ajax": {
            "url": `${API_URL}/Api/Category`,
            "type": "GET",
            "datatype": "json",
            "headers": {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            "dataSrc": ""
        },
        "columns": [
            { "data": "idCategoria", "visible": false, "searchable": false },
            { "data": "descripcion" },
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
                filename: 'Reporte Categorias',
                exportOptions: {
                    columns: [1, 2]
                }
            }, 'pageLength'
        ],
        language: {
            url: "https://cdn.datatables.net/plug-ins/1.11.5/i18n/es-ES.json"
        },
    });

})


function mostrarModal(modelo = MODELO_BASE) {
    $("#txtId").val(modelo.idCategoria)
    $("#txtDescripcion").val(modelo.descripcion)
    $("#cboEstado").val(modelo.esActivo)

    $("#modalData").modal("show")
}

$("#btnNuevo").click(function () {
    mostrarModal()
})


$("#btnGuardar").click(function () {
    if ($("#txtDescripcion").val().trim() == "") {
        toastr.warning("", "Debe completa el campo : descripcion")
        $("#txtDescripcion").focus()
        return;
    }

    const modelo = structuredClone(MODELO_BASE);
    modelo["idCategoria"] = parseInt($("#txtId").val())
    modelo["descripcion"] = $("#txtDescripcion").val()
    modelo["esActivo"] = $("#cboEstado").val() == "1" ? true : false

    $("#modalData").find("div.modal-content").LoadingOverlay("show");

    if (modelo.idCategoria == 0) {
        $.ajax({
            url: `${API_URL}/Api/Category`,
            method: 'POST',
            data: JSON.stringify(modelo),
            contentType: "application/json",
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            success: function (response) {
                tablaData.row.add(response).draw(false)
                $("#modalData").modal("hide")
                swal("Listo!", "La categoria fue creada", "success")
            }
        })
            .fail(function (err) {
                console.log(err)
            })
    } else {
        $.ajax({
            url: `${API_URL}/Api/Category/${modelo.idCategoria}`,
            method: 'PUT',
            data: JSON.stringify(modelo),
            contentType: "application/json",
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            success: function (response) {
                tablaData.row(filaSeleccionada).data(response).draw(false);
                $("#modalData").modal("hide")
                swal("Listo!", "El producto fue actualizado", "success")
            }
        })
            .fail(function (err) {
                console.log(err)
            })
    }

    $("#modalData").find("div.modal-content").LoadingOverlay("hide");
})


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
        text: `Eliminar la categoria "${data.descripcion}"`,
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
                    url: `${API_URL}/Api/Category/${data.idCategoria}`,
                    method: "DELETE",
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    },
                    success: function () {
                        tablaData.row(fila).remove().draw()
                        swal("Listo!", "La categoría fue eliminada", "success")
                    }
                })
            }
        }
    )


})