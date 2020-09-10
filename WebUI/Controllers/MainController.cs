using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace WebUI.Controllers
{
    [Authorize]
    public class MainController : Controller
    {
        // GET: Main
        public ActionResult Pagos()
        {
            return View("Pagos");
        }

        public ActionResult Programar()
        {
            return View("CapturaPago");
        }

        public ActionResult ResponsableNp()
        {
            return View("ViewResponsableNP");
        }

        public ActionResult BusquedaVista()
        {
            return View("BusquedaView");
        }

        public ActionResult FacturaVista()
        {
            return View("Facturas");
        }

        public ActionResult BusquedaDetallePago()
        {
            return View("ViewDetalles");
        }

        public ActionResult DetalleFactura()
        {
            return View("DetalleFactura");
        }
    }
}