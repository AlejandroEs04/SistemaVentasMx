let tablaData;
$(document).ready(function () {
    console.log(`${API_URL}/Api/Sale`)

    $.datepicker.setDefaults($.datepicker.regional["es"])

    $("#txtFechaInicio").datepicker({ dateFormat: "dd/mm/yy" })
    $("#txtFechaFin").datepicker({ dateFormat: "dd/mm/yy" })


    tablaData = $('#tbdata').DataTable({
        responsive: true,
        "ajax": {
            "url": `${API_URL}/Api/Sale`,
            "type": "GET",
            "datatype": "json",
            "headers": {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            "dataSrc": ""
        },
        "columns": [
            { "data": "fechaRegistro" },
            { "data": "numeroVenta" },
            { "data": "documentoVenta" },
            { "data": "subTotal" },
            { "data": "impuestoTotal" },
            { "data": "total" },
            { "data": "cantidadProductos" },
            { "data": "cantidad" },
        ],
        order: [[0, "desc"]],
        dom: "Bfrtip",
        buttons: [
            {
                text: 'Exportar Excel',
                extend: 'excelHtml5',
                title: '',
                filename: 'Reporte Ventas'
            }, 'pageLength'
        ],
        language: {
            url: "https://cdn.datatables.net/plug-ins/1.11.5/i18n/es-ES.json"
        },
    });
})

$("#btnBuscar").click(function () {

    if ($("#txtFechaInicio").val().trim() == "" || $("#txtFechaFin").val().trim() == "") {
        toastr.warning("", "Debe ingresar fecha inicio y fin")
        return;
    }

    let fechaInicio = $("#txtFechaInicio").val().trim();
    let fechaFin = $("#txtFechaFin").val().trim();

    const [sDia, sMes, sAño] = fechaInicio.split("/");
    const nuevaFechaInicio = new Date(sAño, sMes - 1, sDia);

    const [dia, mes, año] = fechaFin.split("/");
    const nuevaFechaFin = new Date(año, mes - 1, dia);

    let nueva_url = `${API_URL}/Api/Sale?startTime=${new Date(nuevaFechaInicio).toISOString()}&endTime=${new Date(nuevaFechaFin).toISOString()}`;

    tablaData.ajax.url(nueva_url).load();


})