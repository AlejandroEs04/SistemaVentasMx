
$(document).ready(function () {
    $(".container-fluid").LoadingOverlay("show");

    getAuth(function (data) {
        const d = data

        $("#imgFoto").attr("src", d.urlFoto)
        $("#txtNombre").val(d.nombre)
        $("#txtCorreo").val(d.correo)
        $("#txTelefono").val(d.telefono)
        $("#txtRol").val(d.nombreRol)

        $(".container-fluid").LoadingOverlay("hide");
    })
})

$("#btnGuardarCambios").click(function () {
    if ($("#txtCorreo").val().trim() == "") {
        toastr.warning("", "Debe completar el campo correo")
        $("#txtCorreo").focus()
        return;
    }
    if ($("#txTelefono").val().trim() == "") {
        toastr.warning("", "Debe completar el campo telefono")
        $("#txTelefono").focus()
        return;
    }

    swal({
        title: "¿Desea guardar los cambios?",
        type: "warning",
        showCancelButton: true,
        confirmButtonClass: "btn-primary",
        confirmButtonText: "Si",
        cancelButtonText: "No",
        closeOnConfirm: false,
        closeOnCancel: true
    },
        function (respuesta) {

            if (respuesta) {
                $(".showSweetAlert").LoadingOverlay("show");

                getAuth(function (res) {
                    const correo = $("#txtCorreo").val().trim()
                    const telefono = $("#txTelefono").val().trim()

                    res.clave = "";
                    res.correo = correo;
                    res.telefono = telefono;

                    $.ajax({
                        url: `${API_URL}/Api/User/${res.idUsuario}`,
                        method: 'PUT',
                        data: JSON.stringify(res),
                        contentType: "application/json",
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem('token')
                        },
                        success: function (response) {
                            console.log(response)
                            swal("Listo!", "Los cambios fueron guardados", "success")
                        }
                    })
                        .fail(function (err) {
                            swal("Los sentimos", err, "error")
                        })
                })

                $(".showSweetAlert").LoadingOverlay("hide");
            }
        }
    )

})


$("#btnCambiarClave").click(function () {
    const inputs = $("input.input-validar").serializeArray();
    const inputs_sin_valor = inputs.filter((item) => item.value.trim() == "")

    if (inputs_sin_valor.length > 0) {
        const mensaje = `Debe completar el campo : "${inputs_sin_valor[0].name}"`;
        toastr.warning("", mensaje)
        $(`input[name="${inputs_sin_valor[0].name}"]`).focus()
        return;
    }

    if ($("#txtClaveNueva").val().trim() != $("#txtConfirmarClave").val().trim()) {
        toastr.warning("", "Las contraseñas no coinciden")
        return;
    }

    let modelo = {
        claveActual: $("#txtClaveActual").val().trim(),
        nuevaClave: $("#txtClaveNueva").val().trim(),
        nuevaClaveRepetida: $("#txtConfirmarClave").val().trim()
    }

    getAuth(function (res) {
        $.ajax({
            url: `${API_URL}/Api/User/ChangePassword/${res.idUsuario}`,
            method: 'PUT',
            data: JSON.stringify(modelo),
            contentType: "application/json",
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            success: function (response) {
                console.log(response)
                swal("Listo!", "Los cambios fueron guardados", "success")
            }
        })
            .fail(function (err) {
                swal("Los sentimos", err, "error")
            })
    })

    $("#txtClaveActual").val('')
    $("#txtClaveNueva").val('')
    $("#txtConfirmarClave").val('')

    $(".showSweetAlert").LoadingOverlay("hide");
})