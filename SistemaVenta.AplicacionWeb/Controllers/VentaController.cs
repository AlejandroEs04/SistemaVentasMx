using Microsoft.AspNetCore.Mvc;

namespace SistemaVenta.AplicacionWeb.Controllers
{
    public class VentaController : Controller
    {
        public IActionResult NuevaVenta()
        {
            return View();
        }

        public IActionResult HistorialVenta()
        {
            return View();
        }

        //public IActionResult MostrarPDFVenta(string numeroVenta)
        //{

        //    string urlPlantillaVista = $"{this.Request.Scheme}://{this.Request.Host}/Plantilla/PDFVenta?numeroVenta={numeroVenta}";

        //    var pdf = new HtmlToPdfDocument()
        //    {
        //        GlobalSettings = new GlobalSettings()
        //        {
        //            PaperSize = PaperKind.A4,
        //            Orientation = Orientation.Portrait,
        //        },
        //        Objects = {
        //            new ObjectSettings(){
        //                Page = urlPlantillaVista
        //            }
        //        }
        //    };

        //    var archivoPDF = _converter.Convert(pdf);

        //    return File(archivoPDF, "application/pdf");

        //}
    }
}
