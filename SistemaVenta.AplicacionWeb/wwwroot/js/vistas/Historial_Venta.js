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

    $.ajax({
        url: `${API_URL}/Api/Sale`,
        type: "GET",
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: function (response) {
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
})

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


    $(".card-body").find("div.row").LoadingOverlay("show");

    fetch(`/Venta/Historial?numeroVenta=${numeroVenta}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`)
        .then(response => {
            $(".card-body").find("div.row").LoadingOverlay("hide");
            return response.ok ? response.json() : Promise.reject(response);
        })
        .then(responseJson => {
            $("#tbventa tbody").html("");

            if (responseJson.length > 0) {

                responseJson.forEach((venta, index) => {
                    fetch(`/Cliente/ObtenerPorId?clienteId=${venta.idCliente}`)
                        .then(response => response.json())
                        .then(clienteData => {
                            const nombreCliente = clienteData.data;

                            const row = $("<tr>").append(
                                    $('<td>').addClass("align-middle").text(venta.fechaRegistro),
                                    $("<td>").addClass("align-middle").text(nombreCliente.nombre),
                                    $("<td>").addClass("align-middle").text(venta.numeroVenta),
                                    $("<td>").addClass("align-middle text-center").text(venta.total),
                                    $('<td class="text-center">').append(
                                        $("<div>").append(
                                            $("<button>").addClass("btn btn-info btn-lg mr-1").append(
                                                $("<i>").addClass("fas fa-clipboard-list").text(" Ver Detalles")
                                            ).data("venta", venta),
                                            $("<button>").attr("type", "button").addClass("btn btn-success btn-lg").append(
                                                $("<i>").addClass("far fa-money-bill-alt").text(" Solicitar Factura")
                                            ).data("venta", venta.idVenta)
                                        )
                                    )
                            )

                            setTimeout(() => {
                                $("#tbventa tbody").append(row);

                                // Agregar la clase después de insertar el elemento si es necesario
                                row.addClass('animate__animated animate__fadeInLeft'); // Puedes cambiar 'fadeIn' a la clase que prefieras
                            }, 300 * index); // Multiplicamos por el índice para que haya un retraso incremental para cada fila

                        })
                        .catch(error => {
                            console.error("Error al obtener datos del cliente:", error);
                        });

                })

            }

        })

})

$("#tbventa tbody").on("click", ".btn-success", function () {
    let idVenta = $(this).data("venta");

    $.ajax({
        url: `${API_URL}/Api/Sale/GenerateXml/${idVenta}`,
        method: "GET", 
        success: function (res) {
            window.location.href = res.url;
        }
    })
})




/*=========================================
=============ANTIGUOO======================
===========================================*/
$("#tbventa tbody").on("click", ".btn-info", function () {
    
    /*AQUI ESTA SE OBTIENE TODA LA VENTA*/
    let d = $(this).data("venta");
    console.log("Datos de venta:", d.detalleVenta)

    fetch("/Cliente/ObtenerPorId?clienteId=" + d.idCliente)
        .then(response => response.json()) 
        .then(data => {
            cliente = data.data; 
            /*console.log("Datos del cliente:", cliente)*/
            dataCliente = cliente;


            $("#txtFechaRegistro").val(d.fechaRegistro)
            $("#txtNumVenta").val(d.numeroVenta)
            $("#txtUsuarioRegistro").val(d.usuario)
            $("#txtTipoDocumento").val(d.tipoDocumentoVenta)
            $("#txtCliente").val(cliente.nombre)
            $("#txtRFC").val(cliente.rfc)
            $("#txtCorreo").val(cliente.correo)
            $("#txtSubTotal").val(d.subTotal)
            $("#txtIGV").val(d.impuestoTotal)
            $("#txtTotal").val(d.total)

            $("#tbProductos tbody").html("");

            d.detalleVenta.forEach((item) => {

                $("#tbProductos tbody").append(
                    $("<tr>").append(
                        $("<td>").text(item.descripcionProducto),
                        $("<td>").text(item.cantidad),
                        $("<td>").text(item.precio),
                        $("<td>").text(item.total),
                    )
                )
                buscarProducto(item.idProducto);
            })

            $("#modalData").modal("show");
            $("#linkImprimir").attr("href", `/Venta/MostrarPDFVenta?numeroVenta=${d.numeroVenta}`)

        })
        .catch(error => {
            console.error('Error:', error);
        });
})


async function buscarProducto(idProducto) {
    try {
        const response = await fetch("/Producto/ObtenerPorId?idProducto=" + idProducto);
        if (!response.ok) {
            throw new Error('Error al obtener datos del producto');
        }
        const dataProductoResponse = await response.json();
        const dataProducto = dataProductoResponse.data;
        console.log("dataProducto Devuelve lo sig:",dataProducto);
        return dataProducto;
    } catch (error) {
        console.error('Error:', error);
        // Maneja el error según sea necesario
        return null; // O devuelve algún valor por defecto
    }
}

function obtenerInfoNegocio() {
    return fetch("/Negocio/Obtener")
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener datos del negocio');
            }
            $(".card-body").LoadingOverlay("hide");
            return response.json();
        })
        .then(responseJson => {
            if (responseJson.estado) {
                negocioData = responseJson.objeto;
            } else {
                swal("Lo sentimos", responseJson.mensaje, "error");
            }
        })
        .catch(error => {
            console.error('Error:', error);
            // Agrega manejo de errores más específico según sea necesario
        });
}

function generarXML(datos) {
    let xml = `<Comprobante>`;
    xml += `<idLocal>1231231-${datos.Venta.idLocal}</idLocal>`;
    xml += `<version>${datos.Venta.version}</version>`;
    xml += `<serie/>`;
    xml += `<folio>${datos.Venta.folio}</folio>`;
    xml += `<formaPago>${datos.Venta.formaPago}</formaPago>`;
    xml += `<condicionesDePago>CONTADO</condicionesDePago>`;
    xml += `<subTotal>${datos.Venta.subTotal}</subTotal>`;
    xml += `<descuento>${datos.Venta.descuento}</descuento>`;
    xml += `<moneda>${datos.Venta.moneda}</moneda>`;
    xml += `<tipoCambio>${datos.Venta.tipoCambio}</tipoCambio>`;
    xml += `<exportacion>01</exportacion>`;
    xml += `<total>${datos.Venta.total}</total>`;
    xml += `<tipoDeComprobante>${datos.Venta.tipoDeComprobante}</tipoDeComprobante>`;
    xml += `<metodoPago>${datos.Venta.metodoPago}</metodoPago>`;
    xml += `<lugarExpedicion>${datos.Venta.lugarExpedicion}</lugarExpedicion>`;
    xml += `<confirmacion></confirmacion>`;
    xml += `<Relacionado/>`;
    xml += `<regimenFiscal>${datos.Venta.regimenFiscal}</regimenFiscal>`;
    xml += `<rfc>${datos.Venta.rfc}</rfc>`;
    xml += `<nombre>${datos.Venta.nombre}</nombre>`;
    xml += `<residenciaFiscal></residenciaFiscal>`;
    xml += `<numRegIdTrib></numRegIdTrib>`;
    xml += `<domicilioFiscalReceptor>${datos.Venta.domicilioFiscalReceptor}</domicilioFiscalReceptor>`;
    xml += `<regimenFiscalReceptor>${datos.Venta.regimenFiscalReceptor}</regimenFiscalReceptor>`;
    xml += `<usoCFDI>${datos.Venta.usoCFDI}</usoCFDI>`;

    // Agregar cada Concepto dinámicamente (pueden ser múltiples)
    datos.DetalleVenta.forEach(detalle => {
        xml += `<Concepto>`;
        xml += `<claveProdServ>${detalle.claveProdServ}</claveProdServ>`;
        xml += `<noIdentificacion>${detalle.noIdentificacion}</noIdentificacion>`;
        xml += `<cantidad>${detalle.cantidad}</cantidad>`;
        xml += `<claveUnidad>${detalle.claveUnidad}</claveUnidad>`;
        xml += `<unidad>${detalle.unidad}</unidad>`;
        xml += `<descripcion>${detalle.descripcion}</descripcion>`;
        xml += `<valorUnitario>${detalle.valorUnitario}</valorUnitario>`;
        xml += `<importe>${detalle.importe}</importe>`;
        xml += `<descuento>${detalle.descuento}</descuento>`;
        xml += `<objetoImp>${detalle.objetoImp}</objetoImp>`;
        xml += `<Traslado>`;
        xml += `<base>${detalle.base}</base>`;
        xml += `<impuesto>${detalle.impuesto}</impuesto>`;
        xml += `<tipoFactor>${detalle.tipoFactor}</tipoFactor>`;
        xml += `<tasaOCuota>${detalle.tasaOCuota}</tasaOCuota>`;
        xml += `<importe>${detalle.importeTranslado}</importe>`;
        xml += `</Traslado>`;
        xml += `</Concepto>`;
    });

    xml += `<totalImpuestosTrasladados>${datos.totalImporteTranslado}</totalImpuestosTrasladados>`;
    xml += `</Comprobante>`;

    return xml;
}

function mostrarPantallaDeCarga() {
    // Mostrar la pantalla de carga
    document.getElementById('pantalla-de-carga').style.display = 'flex';
}

function ocultarPantallaDeCarga() {
    // Ocultar la pantalla de carga
    document.getElementById('pantalla-de-carga').style.display = 'none';
}
function mostrarMensajeExito() {
    // Mostrar mensaje de éxito
    document.getElementById('mensaje-exito').style.display = 'block';
}

function mostrarMensajeError() {
    // Mostrar mensaje de error
    document.getElementById('mensaje-error').style.display = 'block';
}