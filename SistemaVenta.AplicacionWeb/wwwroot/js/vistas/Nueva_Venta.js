let valorImpuesto = 0;
let tableData;
let idCliente = null;
$(document).ready(function () {
    $("#cboBuscarCliente").select2({
        ajax: {
            url: `${API_URL}/Api/Client`,
            type: 'GET',
            dataType: 'json',
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem('token')
            },
            data: function (params) {
                return {
                    busqueda: params.term
                };
            },
            processResults: function (respuesta) {
                var data = respuesta;
                return {
                    results: data.map(function (client) {
                        return {
                            id: client.idCliente,
                            nombre: client.nombre,
                            correo: client.correo,
                            rfc: client.rfc,
                            domicilioFiscalReceptor: client.domicilioFiscalReceptor,
                            regimenFiscalReceptor: client.regimenFiscalReceptor
                        };
                    })
                };
            }
        },
        placeholder: 'Buscar Cliente...',
        minimumInputLength: 1,
        templateResult: formatoResultadosClientes
    });
    function formatoResultadosClientes(data) {
        if (data.loading)
            return data.text;

        var contenedor = $(
            `<table width="100%">
            <tr>
                <td>
                    <p style="font-weight: bolder;margin:2px">${data.id}-${data.nombre}</p>
                    <p style="margin:2px">${data.rfc}</p>
                </td>
            </tr>
         </table>`
        );

        return contenedor;
    }

    // Capturar evento de selección de cliente
    $("#cboBuscarCliente").on("select2:select", function (ev) {
        dataCliente = ev.params.data;
        idCliente = dataCliente.id;
        $("#idCliente").val(dataCliente.id);
        $("#nombreRazonSocial").val(dataCliente.nombre);
        $("#txtRFC").val(dataCliente.rfc);
        $("#txtCorreo").val(dataCliente.correo);
    });

    $(document).on("select2:open", function () {
        document.querySelector(".select2-search__field").focus();
    });

    $.ajax({
        url: `${API_URL}/Api/SaleDocument`,
        method: "GET",
        headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
        },
        success: function (data) {
            data.forEach((item) => {
                $("#cboTipoDocumentoVenta").append(
                    $("<option>").val(item.idTipoDocumentoVenta).text(item.descripcion)
                )
            })
        }
    })

    $.ajax({
        url: `${API_URL}/Api/Business`,
        method: "GET",
        headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
        },
        success: function (data) {
            console.log(data)
            $("#inputGroupSubTotal").text(`Sub total - ${data.simboloMoneda}`)
            $("#inputGroupIGV").text(`IVA(${data.porcentajeImpuesto}%) - ${data.simboloMoneda}`)
            $("#inputGroupTotal").text(`Total - ${data.simboloMoneda}`)

            ValorImpuesto = parseFloat(data.porcentajeImpuesto)
        }
    })

    $("#cboBuscarProducto").select2({
        ajax: {
            url: `${API_URL}/Api/Product`,
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            delay: 250,
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem('token')
            },
            data: function (params) {
                return {
                    busqueda: params.term
                };
            },
            processResults: function (data,) {

                return {
                    results: data.map((item) => (
                        {
                            id: item.idProducto,
                            text: item.descripcion,
                            descuento: item.descuento,
                            marca: item.marca,
                            categoria: item.nombreCategoria,
                            urlImagen: item.urlImagen,
                            precio: parseFloat(item.precio)
                        }
                    ))
                };
            }
        },
        language: "es",
        placeholder: 'Buscar Producto...',
        minimumInputLength: 1,
        templateResult: formatoResultados
    });

})

function formatoResultados(data) {
    if (data.loading)
        return data.text;

    var contenedor = $(
        `<table width="100%">
            <tr>
                <td style="width:60px">
                    <img style="height:60px;width:60px;margin-right:10px" src="${data.urlImagen}"/>
                </td>
                <td>
                    <p style="font-weight: bolder;margin:2px">${data.marca}</p>
                    <p style="margin:2px">${data.text} y tambien ${data.descuento}% de descuento!</p>
                </td>
            </tr>
         </table>`
    );

    return contenedor;
}

$(document).on("select2:open", function () {
    document.querySelector(".select2-search__field").focus();
})

let ProductosParaVenta = [];
$("#cboBuscarProducto").on("select2:select", function (e) {
    const data = e.params.data;

    let producto_encontrado = ProductosParaVenta.filter(p => p.idProducto == data.id)
    if (producto_encontrado.length > 0) {
        $("#cboBuscarProducto").val("").trigger("change")
        toastr.warning("", "El producto ya fue agregado")
        return false
    }

    swal({
        title: data.marca,
        text: data.text,
        imageUrl: data.urlImagen,
        type: "input",
        showCancelButton: true,
        closeOnConfirm: false,
        inputPlaceholder: "Ingrese Canitdad"
    },
        function (valor) {

            if (valor === false) return false;

            if (valor === "") {
                toastr.warning("", "Necesita ingresar la cantidad")
                return false;
            }
            if (isNaN(parseInt(valor))) {
                toastr.warning("", "Debe ingresar un valor númerico")
                return false;
            }
            let descuentoTotal = (parseFloat(valor) * parseFloat(data.precio) * (parseInt(data.descuento) / 100));
            let producto = {
                idProducto: data.id,
                marcaProducto: data.marca,
                descripcionProducto: data.text,
                categoriaProducto: data.categoria,
                cantidad: parseInt(valor),
                precio: data.precio.toString(),
                descuento: descuentoTotal.toString(),
                total: (parseFloat(valor) * data.precio * (1 - parseInt(data.descuento) / 100)).toString(),

            }

            ProductosParaVenta.push(producto)

            mostrarProducto_Precios();
            $("#cboBuscarProducto").val("").trigger("change")
            swal.close()
        }
    )

})

function mostrarProducto_Precios() {

    let total = 0;
    let descuentoTotal = 0;
    let igv = 0;
    let subtotal = 0;
    let porcentaje = ValorImpuesto / 100;

    $("#tbProducto tbody").html("")

    ProductosParaVenta.forEach((item) => {
        console.log(item)
        subtotal = subtotal + parseFloat(item.precio) * parseFloat(item.cantidad)
        descuentoTotal = descuentoTotal + parseFloat(item.descuento)
        $("#tbProducto tbody").append(
            $("<tr>").append(
                $("<td>").append(
                    $("<button>").addClass("btn btn-danger btn-eliminar btn-sm").append(
                        $("<i>").addClass("fas fa-trash-alt")
                    ).data("idProducto", item.idProducto)
                ),
                $("<td>").text(item.descripcionProducto),
                $("<td>").text(item.cantidad),
                $("<td>").text(item.precio),
                $("<td>").text(item.descuento),
                $("<td>").text(item.total)
            )
        )
    })
    descuentoTotal = descuentoTotal;
    subtotal = subtotal;
    igv = subtotal * 0.16;
    total = subtotal + igv - descuentoTotal;

    $("#txtDescuento").val(descuentoTotal.toFixed(2))
    $("#txtSubTotal").val(subtotal.toFixed(2))
    $("#txtIGV").val(igv.toFixed(2))
    $("#txtTotal").val(total.toFixed(2))


}

$(document).on("click", "button.btn-eliminar", function () {

    const _idproducto = $(this).data("idProducto")

    ProductosParaVenta = ProductosParaVenta.filter(p => p.idProducto != _idproducto);

    mostrarProducto_Precios();
})


$("#btnTerminarVenta").click(function () {

    if (idCliente === null) {
        toastr.warning("", "Seleccione un usuario");
        return;
    }

    if (ProductosParaVenta.length < 1) {
        toastr.warning("", "Debe ingresar productos")
        return;
    }

    const vmDetalleVenta = ProductosParaVenta;

    const venta = {
        idTipoDocumentoVenta: 2,
        idCliente: idCliente,
        descuento: $("#txtDescuento").val(),
        subTotal: $("#txtSubTotal").val(),
        impuestoTotal: $("#txtIGV").val(),
        total: $("#txtTotal").val(),
        Detalles: vmDetalleVenta
    }

    $("#btnTerminarVenta").LoadingOverlay("show");

    $.ajax({
        url: `${API_URL}/Api/Sale`,
        method: 'POST',
        data: JSON.stringify(venta),
        contentType: "application/json",
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: function (response) {
            ProductosParaVenta = [];
            mostrarProducto_Precios();

            $("#modalData").modal("hide")
            swal("Registrado!", `Numero Venta : ${response.idVenta}`, "success")
            $("#btnTerminarVenta").LoadingOverlay("hide");
        }
    })
        .fail(function (err) {
            console.log(err)
        })
})