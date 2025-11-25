$(document).ready(function () {
    $("#loginForm").on("submit", function (e) {
        e.preventDefault()

        const correo = $("#emailInput").val()
        const clave = $("#passInput").val()

        const data = {
            correo, clave
        }

        $.ajax({
            type: "POST", 
            url: `${API_URL}/Api/Auth`,
            data: JSON.stringify(data),
            contentType: "application/json",
            dataType: "text"
        })
            .done(function (res) {
                localStorage.setItem("token", res)
                window.location.replace("http://localhost:5048")
            })
            .fail(function (err) {
                console.log(err)
            })
    })
})