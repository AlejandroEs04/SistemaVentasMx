$(document).ready(function () {
    $("#fotoPerfilUsuario").hide()

    const token = localStorage.getItem("token")
    if (!token) return redirectToLogin();

    getAuth(function (data) {
        const { clave, ...userCopy } = data
        user = userCopy

        fillMenu()

        $("#nombreUsuario").text(user.nombre)

        if (user.urlFoto.lenght > 0) {
            $("#fotoPerfilUsuario").show()
            $("#fotoPerfilUsuario").attr("src", user.urlFoto)
        }
    })
})

function getAuth(successFnc) {
    $.ajax({
        url: `${API_URL}/Api/Auth/GetAuth`,
        method: "GET",
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: successFnc,
        error: function (err) {
            localStorage.removeItem("token")

            if (err.status === 401 || err.status === 403) {
                window.location.href = `${window.location.origin}/acceso/login`;
            }
        }
    })
}

function logout() {
    localStorage.removeItem("token")
    window.location.href = `${window.location.origin}/acceso/login`;
}

function fillMenu() {
    $.ajax({
        url: `${API_URL}/Api/Menu`,
        method: "GET",
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        success: function (data) {
            let menuList = ""
            let correlativo = 0
            let menucollapse = "menucollapse"

            data.forEach(function (menu) {
                if (menu.subMenus.length == 0) {
                    menuList += `<li class="nav-item"><a class="nav-link" href="/${menu.controlador}/${menu.paginaAccion}"><i class="${menu.icono}"></i><span>${menu.descripcion}</span></a></li>`
                } else {
                    let subMenuList = "";

                    menu.subMenus.forEach(function (submenu) {
                        subMenuList += `<a class="collapse-item" href="/${submenu.controlador}/${submenu.paginaAccion}">${submenu.descripcion}</a>`
                    })

                    menuList += `<li class="nav-item">
                        <a class="nav-link collapsed" href="#" data-toggle="collapse" data-target="#${menucollapse}${correlativo}">
                            <i class="${menu.icono}"></i>
                            <span>${menu.descripcion}</span>
                        </a>

                        <div id="${menucollapse}${correlativo}" class="collapse" data-parent="#accordionSidebar">
                            <div class="bg-white py-2 collapse-inner rounded">
                                ${subMenuList}
                            </div>
                        </div>

                    </li>`
                }

                correlativo++;
            })

            $("#menuTab").append(menuList)
        },
        error: function (err) {
            localStorage.removeItem("token")

            if (err.status === 401 || err.status === 403) {
                window.location.href = `${window.location.origin}/acceso/login`;
            }
        }
    })
}

function redirectToLogin() {
    window.location.href = 'http://localhost:5048/Acceso/Login';
}