let productoData = "";
let cliente = "";
let dataCliente = "";
let negocioData = "";

const VISTA_BUSQUEDA = {
    busquedaFecha: () => {
        $("#txtFechaInicio").val("")
        $("#txtFechaFin").val("")
        $("#txtNumeroVenta").val("")

        $(".busqueda-fecha").show()
        $(".busqueda-venta").hide()
    }, busquedaVenta: () => {

        $("#txtFechaInicio").val("")
        $("#txtFechaFin").val("")
        $("#txtNumeroVenta").val("")

        $(".busqueda-fecha").hide()
        $(".busqueda-venta").show()
    }
}

$(document).ready(function () {
    VISTA_BUSQUEDA["busquedaFecha"]()

    $.datepicker.setDefaults($.datepicker.regional["es"])

    $("#txtFechaInicio").datepicker({ dateFormat: "dd/mm/yy" })
    $("#txtFechaFin").datepicker({ dateFormat: "dd/mm/yy" })

    getAllSales()
})

function getAllSales(url = `${API_URL}/Api/Sale`) {
    $.ajax({
        url,
        type: "GET",
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: function (response) {
            $("#tbventa tbody").empty();

            response.forEach((venta, index) => {
                $.ajax({
                    url: `${API_URL}/Api/Client/${venta.idCliente}`,
                    type: "GET",
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    },
                    success: function (client) {
                        const btnsHtml = `
                          <div>
                            <button class="btn btn-info mr-1 btn-detalles" data-venta="${venta.idVenta}">
                              <i class="fas fa-clipboard-list"></i> Ver Detalles
                            </button>
                            <button type="button" class="btn btn-success btn-factura" data-venta="${venta.idVenta}">
                              <i class="far fa-money-bill-alt"></i> Solicitar Factura
                            </button>
                          </div>
                        `;

                        const rowHtml = `
                          <tr>
                            <td class="align-middle">${venta.fechaRegistro ?? ''}</td>
                            <td class="align-middle">${(client && client.nombre) || ''}</td>
                            <td class="align-middle">${venta.numeroVenta ?? ''}</td>
                            <td class="align-middle text-center">${venta.total ?? ''}</td>
                            <td class="text-center">${btnsHtml}</td>
                          </tr>
                        `;

                        const row = $("<tr>").append(
                            $('<td>').addClass("align-middle").text(venta.fechaRegistro),
                            $("<td>").addClass("align-middle").text(client.nombre),
                            $("<td>").addClass("align-middle").text(venta.numeroVenta),
                            $("<td>").addClass("align-middle text-center").text(venta.total),
                            $('<td class="text-center">').append(
                                $("<div>").append(
                                    $("<button>").addClass("btn btn-info mr-1").data("venta", venta.idVenta).append(
                                        $("<i>").addClass("fas fa-clipboard-list").text(" Ver Detalles")
                                    ),
                                    $("<button>").attr("type", "button").addClass("btn btn-success").data("venta", venta.idVenta).append(
                                        $("<i>").addClass("far fa-money-bill-alt").text(" Solicitar Factura")
                                    )
                                )
                            )
                        )

                        setTimeout(() => {
                            $("#tbventa tbody").append(rowHtml);
                            row.addClass('animate__animated animate__fadeInLeft');
                        }, index);

                    }
                })
            })
        },
        error: function (xhr, status, error) {
            console.error("Error al obtener datos:", error);
            console.log("Respuesta completa:", xhr.responseText);
        }
    });
}

$("#cboBuscarPor").change(function () {

    if ($("#cboBuscarPor").val() == "fecha") {
        VISTA_BUSQUEDA["busquedaFecha"]()
    } else {
        VISTA_BUSQUEDA["busquedaVenta"]()
    }

})

$("#btnBuscar").click(function () {

    if ($("#cboBuscarPor").val() == "fecha") {

        if ($("#txtFechaInicio").val().trim() == "" || $("#txtFechaFin").val().trim() == "") {
            toastr.warning("", "Debe ingresar fecha inicio y fin")
            return;
        }
    } else {

        if ($("#txtNumeroVenta").val().trim() == "") {
            toastr.warning("", "Debe ingresar el numero de venta")
            return;
        }
    }

    let numeroVenta = $("#txtNumeroVenta").val()
    let fechaInicio = $("#txtFechaInicio").val()
    let fechaFin = $("#txtFechaFin").val()

    const [sDia, sMes, sAño] = fechaInicio.split("/");
    const nuevaFechaInicio = new Date(sAño, sMes - 1, sDia);

    const [dia, mes, año] = fechaFin.split("/");
    const nuevaFechaFin = new Date(año, mes - 1, dia);

    let nueva_url = `${API_URL}/Api/Sale?startTime=${new Date(nuevaFechaInicio).toISOString()}&endTime=${new Date(nuevaFechaFin).toISOString()}`;
    getAllSales(nueva_url)
})

$("#tbventa tbody").on("click", ".btn-success", function () {
    let idVenta = $(this).data("venta");

    $.ajax({
        url: `${API_URL}/Api/Sale/GenerateXml/${idVenta}`,
        method: "GET", 
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: function (res) {
            window.location.href = res.url;
        }
    })
})

$("#tbventa tbody").on("click", ".btn-info", function () {
    let d = $(this).data("venta");

    $.ajax({
        url: `${API_URL}/Api/Sale/${d}`,
        method: "GET",
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: function (res) {
            $("#txtFechaRegistro").val(res.fechaRegistro)
            $("#txtNumVenta").val(res.numeroVenta)
            $("#txtUsuarioRegistro").val(res.report.usuarioNombre)
            $("#txtTipoDocumento").val(res.tipoDocumentoVenta)
            $("#txtCliente").val(res.report.clienteNombre)
            $("#txtRFC").val(res.report.clienteRfc)
            $("#txtCorreo").val(res.report.clienteCorreo)
            $("#txtSubTotal").val(res.subTotal)
            $("#txtIGV").val(res.impuestoTotal)
            $("#txtTotal").val(res.total)

            res.productos.forEach((item) => {

                $("#tbProductos tbody").append(
                    $("<tr>").append(
                        $("<td>").text(item.descripcionProducto),
                        $("<td>").text(item.cantidad),
                        $("<td>").text(item.precio),
                        $("<td>").text(item.total),
                    )
                )
            })

            $("#modalData").modal("show");
            $("#linkImprimir").attr("href", `${API_URL}/Api/Sale/Report/Download/${d}`)
        }
    })
})


async function buscarProducto(idProducto) {
    try {
        const response = await fetch("/Producto/ObtenerPorId?idProducto=" + idProducto);
        if (!response.ok) {
            throw new Error('Error al obtener datos del producto');
        }
        const dataProductoResponse = await response.json();
        const dataProducto = dataProductoResponse.data;
        return dataProducto;
    } catch (error) {
        console.error('Error:', error);
        // Maneja el error según sea necesario
        return null; // O devuelve algún valor por defecto
    }
}