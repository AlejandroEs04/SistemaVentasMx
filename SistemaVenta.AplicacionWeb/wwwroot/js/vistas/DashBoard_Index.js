

$(document).ready(function () {
    $("div.container-fluid").LoadingOverlay("show");

    $.ajax({
        url: `${API_URL}/Api/Sale/Report?month=${new Date().getMonth() + 1}`,
        method: "GET",
        headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
        },
        success: function (data) {
            const MXPeso = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

            $("#totalVenta").text(data.salesQuantity)
            $("#totalIngresos").text(MXPeso.format(+data.totalAmount))
            $("#totalProductos").text(data.totalQuantity)

            let barchart_labels;
            let barchart_data;

            const hoy = new Date();
            const hace7Dias = new Date();
            hace7Dias.setDate(hoy.getDate() - 7);

            const ventasUltimos7Dias = data.sales.filter(item => {
                const fechaVenta = new Date(item.fechaRegistro);
                return fechaVenta >= hace7Dias;   // solo las que son más recientes
            });

            if (data.sales.length > 0) {
                barchart_labels = ventasUltimos7Dias.map((item) => { return new Date(item.fechaRegistro).toLocaleDateString("es-ES") })
                barchart_data = ventasUltimos7Dias.map((item) => { return item.total })
            } else {
                barchart_labels = ["sin resultados"]
                barchart_data = [0]
            }

            let piechar_labels;
            let piechart_data;
            if (data.productSales.length > 0) {
                piechar_labels = data.productSales.slice(0,5).map((item) => { return item.descripcionProducto })
                piechart_data = data.productSales.slice(0, 5).map((item) => { return item.totalCantidadVendida })
            } else {
                piechar_labels = ["sin resultados"]
                piechart_data = [0]
            }


            // Bar Chart Example
            let controlVenta = document.getElementById("chartVentas");
            let myBarChart = new Chart(controlVenta, {
                type: 'bar',
                data: {
                    labels: barchart_labels,
                    datasets: [{
                        label: "Cantidad",
                        backgroundColor: "#4e73df",
                        hoverBackgroundColor: "#2e59d9",
                        borderColor: "#4e73df",
                        data: barchart_data,
                    }],
                },
                options: {
                    maintainAspectRatio: false,
                    legend: {
                        display: false
                    },
                    scales: {
                        xAxes: [{
                            gridLines: {
                                display: false,
                                drawBorder: false
                            },
                            maxBarThickness: 50,
                        }],
                        yAxes: [{
                            ticks: {
                                min: 0,
                                maxTicksLimit: 5
                            }
                        }],
                    },
                }
            });

            // Pie Chart Example
            let controlProducto = document.getElementById("chartProductos");
            let myPieChart = new Chart(controlProducto, {
                type: 'doughnut',
                data: {
                    labels: piechar_labels,
                    datasets: [{
                        data: piechart_data,
                        backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', "#FF785B"],
                        hoverBackgroundColor: ['#2e59d9', '#17a673', '#2c9faf', "#FF5733"],
                        hoverBorderColor: "rgba(234, 236, 244, 1)",
                    }],
                },
                options: {
                    maintainAspectRatio: false,
                    tooltips: {
                        backgroundColor: "rgb(255,255,255)",
                        bodyFontColor: "#858796",
                        borderColor: '#dddfeb',
                        borderWidth: 1,
                        xPadding: 15,
                        yPadding: 15,
                        displayColors: false,
                        caretPadding: 10,
                    },
                    legend: {
                        display: true
                    },
                    cutoutPercentage: 80,
                },
            });

            $("div.container-fluid").LoadingOverlay("hide");
        }
    })
})
