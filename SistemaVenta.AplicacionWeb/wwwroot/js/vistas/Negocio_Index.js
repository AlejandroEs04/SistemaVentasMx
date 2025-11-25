let businessInfo

$(document).ready(function () {
    $(".card-body").LoadingOverlay("show");

    $.ajax({
        url: `${API_URL}/Api/Business`,
        method: "GET",
        headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
        },
        success: function (data) {
            businessInfo = data

            $("#txtNumeroDocumento").val(businessInfo.numeroDocumento)
            $("#txtRazonSocial").val(businessInfo.nombre)
            $("#txtCorreo").val(businessInfo.correo)
            $("#txtDireccion").val(businessInfo.direccion)
            $("#txTelefono").val(businessInfo.telefono)
            $("#txtImpuesto").val(businessInfo.porcentajeImpuesto)
            $("#txtSimboloMoneda").val(businessInfo.simboloMoneda)
            $("#imgLogo").attr("src", businessInfo.urlLogo)
        }
    })

    $(".card-body").LoadingOverlay("hide");
})


$("#btnGuardarCambios").click(async function () {
    const inputs = $("input.input-validar").serializeArray();
    const inputs_sin_valor = inputs.filter((item) => item.value.trim() == "")

    if (inputs_sin_valor.length > 0) {
        const mensaje = `Debe completar el campo : "${inputs_sin_valor[0].name}"`;
        toastr.warning("", mensaje)
        $(`input[name="${inputs_sin_valor[0].name}"]`).focus()
        return;
    }

    const modelo = {
        idNegocio: businessInfo.idNegocio,
        numeroDocumento: $("#txtNumeroDocumento").val(),
        nombre: $("#txtRazonSocial").val(),
        correo: $("#txtCorreo").val(),
        direccion: $("#txtDireccion").val(),
        telefono: $("#txTelefono").val(),
        porcentajeImpuesto: $("#txtImpuesto").val(),
        simboloMoneda: $("#txtSimboloMoneda").val()
    }

    const inputLogo = document.getElementById("txtLogo")

    const formData = new FormData()

    formData.append("file", inputLogo.files[0])

    if (inputLogo.files.length > 0) {
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

        modelo["urlLogo"] = response.url;
        modelo["nombreLogo"] = response.fileName;
    }
    else {
        modelo.urlLogo = businessInfo.urlLogo
        modelo.nombreLogo = businessInfo.nombreLogo
    }

    $(".card-body").LoadingOverlay("show");

    $.ajax({
        url: `${API_URL}/Api/Business`,
        method: 'PUT',
        data: JSON.stringify(modelo),
        contentType: "application/json",
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: function (response) {
            $("#imgLogo").attr("src", response.urlLogo)

            swal("Listo!", "El negocio fue actualizado", "success")
        }
    })
        .fail(function (err) {
            console.log(err)
        })

    $(".card-body").LoadingOverlay("hide");
})