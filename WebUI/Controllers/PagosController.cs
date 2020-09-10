using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using WebUI.Models;
using Dominio.Abstracto;
using Dominio.Entidades;
using Dominio.Concreto;
using System.Web.Script.Serialization;
using System.Security.Claims;
using Microsoft.AspNet.Identity;
using System.Data.Entity;
using System.Net.Mail;
using System.Net;
using System.Net.Security;
using System.Security.Cryptography.X509Certificates;

namespace WebUI.Controllers
{
    [Authorize]
    public class PagosController : Controller
    {
        //Repositorios
        IProyectManagersRepository repositorioJefesProyecto;
        IDepartmentsRepository repositorioDepartamentos;
        IPaymentsRepository repositorioPagos;
        IReasonRepository repositorioRazones;
        IFacturasRepository repositorioFacturas;
        IEncargados repositorioEncargado;

        public PagosController(IProyectManagersRepository repoJefesProyecto, IDepartmentsRepository repoDepartamentos, IPaymentsRepository repoPagos,IReasonRepository repoRazones,IFacturasRepository repoFact,IEncargados repoEnc)
        {
            repositorioJefesProyecto = repoJefesProyecto;
            repositorioDepartamentos = repoDepartamentos;
            repositorioRazones = repoRazones;
            repositorioPagos = repoPagos;
            repositorioFacturas = repoFact;
            repositorioEncargado = repoEnc;
        }


        
        public ActionResult BusquedaDetalles(string ID)
        {
            var ListaPagos = repositorioPagos.pagos.Where(w => w.ID == int.Parse(ID))
              .Select(p => new
              {   ID =p.ID,
                  Beneficiario = p.Beneficiario,
                  FechaDePago = p.FechaDePago,
                  FechaSolicitud = p.FechaSolicitud,
                  Programacion = p.Programacion,
                  folio = p.folio,
                  Eliminado = p.Eliminado,
                  Razon = p.Razon,
                  Autorizo = p.Autorizo,
                  Solicito = p.Solicito,
                  FormaPago = p.FormaPago,
                  Observaciones = p.Observaciones,
                  CategoriaNP = p.CategoriaNP,
                  ResponsableNP = p.ResponsableNP,
                  MovInt = p.MovInt,
                  Conceptos = p.Conceptos.Where(c=> c.ID_Pagos == int.Parse(ID)).Select(
                      c=> new { Proyecto = c.Proyecto, Cuenta = c.Cuenta,Subcuenta = c.Subcuenta,Monto = c.Monto,Concepto = c.Concepto}
                      ).ToList(),
                  Monto = p.Conceptos.Sum(s => s.Monto)
              });

            return Json(ListaPagos, JsonRequestBehavior.AllowGet);
        }

        //Busqueda de Pagos
        [HttpPost]
        public ActionResult PagosLista(string year)
        {
            System.Diagnostics.Debug.WriteLine("Consolidado Año: " + year);
            var identity = (ClaimsIdentity)User.Identity;
            IEnumerable<Claim> claims = identity.Claims;
            string sid = claims.Where(c => c.Type == ClaimTypes.Sid).Select(c => c.Value).SingleOrDefault();

            var ListaPagos = repositorioPagos.pagos.Where(w => w.ID_Usuario == int.Parse(sid) && w.FechaSolicitud.Date.Year == int.Parse(year))
                .Select(p => new
                {
                    ID = p.ID,
                    Beneficiario = p.Beneficiario,
                    FechaDePago = p.FechaDePago,
                    FechaSolicitud = p.FechaSolicitud,
                    Programacion = p.Programacion,
                    folio = p.folio,
                    Eliminado = p.Eliminado,
                    Monto = p.Conceptos.Sum(s => s.Monto)
                });

            return Json(ListaPagos, JsonRequestBehavior.AllowGet);
        }




        public ActionResult GuardarPago(string Pago)
        {
            JavaScriptSerializer ser = new JavaScriptSerializer();
            var res = ser.Deserialize<Pagos[]>(Pago);

            var identity = (ClaimsIdentity)User.Identity;
            IEnumerable<Claim> claims = identity.Claims;
            string sid = claims.Where(c => c.Type == ClaimTypes.Sid).Select(c => c.Value).SingleOrDefault();
            string correoUsuario = claims.Where(c => c.Type == ClaimTypes.Email).Select(c => c.Value).SingleOrDefault();

            string Mensaje = repositorioPagos.SalvarPago(res, int.Parse(sid), correoUsuario);
            //string Mensaje = repositorioPagos.SalvarPago(res,1, "soporte@grupodesur.com");
            if (Mensaje == "Guardado")
            {
                return Json("Guardado", JsonRequestBehavior.AllowGet);
            }
            else
            {
                return Json(new { success = false, responseText = Mensaje }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult GuardarUnicoPago(string Pago)
        {
            try
            {
                JavaScriptSerializer ser = new JavaScriptSerializer();
                var res = ser.Deserialize<Pagos>(Pago);

                var identity = (ClaimsIdentity)User.Identity;
                IEnumerable<Claim> claims = identity.Claims;
                string sid = claims.Where(c => c.Type == ClaimTypes.Sid).Select(c => c.Value).SingleOrDefault();
                string correoUsuario = claims.Where(c => c.Type == ClaimTypes.Email).Select(c => c.Value).SingleOrDefault();

                string Mensaje = repositorioPagos.SalvarUnicoPago(res, int.Parse(sid), correoUsuario);
                //string Mensaje = repositorioPagos.SalvarPago(res,1, "soporte@grupodesur.com");
                if (Mensaje == "Guardado")
                {
                    //return Json("Guardado", JsonRequestBehavior.AllowGet);
                    return Json(new { success = true, responseText = "Guardado", cod = 0 }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Json(new { success = false, responseText = Mensaje, cod = 3 }, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, responseText = ex.ToString(), cod = 3 }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public ActionResult ConsolidadosAction(string consolidado)
        {
            //System.Diagnostics.Debug.WriteLine("Consolidado: " + consolidado);
            PaymentsModel modeloPagos = new PaymentsModel();
            modeloPagos.Razon = repositorioRazones.Razon.Select(s => new Cuentas{ID=s.ID, Cuenta = s.Cuenta, Banco = s.Banco,CtaBancaria = s.CtaBancaria }).ToList();
            modeloPagos.EncargadosLista = repositorioEncargado.encargado.Select(s => new SelectListItem() { Text = s.Puesto, Value = s.Nombre+" "+ s.Apellido }).ToList();
            //modeloPagos.Usuarios = repositorioJefesProyecto.usuario.Where(u => u.Cargo == "Jefe de Proyecto").Select(s => new SelectListItem() { Text = s.Nombre + " " + s.Apellidos, Value = s.Nombre }).ToList();
            modeloPagos.Departamentos = repositorioDepartamentos.departamentos.Select(s => new SelectListItem() { Text = s.Departamento, Value = s.Jefe }).ToList();

            var identity = (ClaimsIdentity)User.Identity;
            IEnumerable<Claim> claims = identity.Claims;
            string sid = claims.Where(c => c.Type == ClaimTypes.Sid).Select(c => c.Value).SingleOrDefault();
            var temUser = repositorioJefesProyecto.usuario.Where(u => u.ID == int.Parse(sid)).Single();

            modeloPagos.UsuarioNombre = (temUser.Nombre + " " + temUser.Apellidos);
            modeloPagos.ProgramaJueves = temUser.ProgramaJueves;
            string Aprobacion = modeloPagos.GetAdminPaqSQL();
            //string Aprobacion = modeloPagos.GetFakeAdminPaq();
            if (Aprobacion == null)
            {
                return Json(modeloPagos, JsonRequestBehavior.AllowGet);
            }
            else
            {
                return Json(new { success = false, responseText = Aprobacion }, JsonRequestBehavior.AllowGet);
            }
        }
        
        public ActionResult FacturasAsignadasLista()
        {
            var identity = (ClaimsIdentity)User.Identity;
            IEnumerable<Claim> claims = identity.Claims;
            string correoUsuario = claims.Where(c => c.Type == ClaimTypes.Email).Select(c => c.Value).SingleOrDefault();
            var ListaFactura = repositorioFacturas.facturas.Where(f => f.Correo == correoUsuario && f.Block == false).Select(f => new
            {
                ID = f.ID,
                Empresa = f.Empresa,
                RfcEmpresa = f.RfcEmpresa,
                FolioFiscal = f.FolioFiscal,
                Folio = f.Folio,
                Fecha = f.Fecha,
                Proveedor = f.Proveedor,
                RfcProveedor = f.RfcProveedor,
                Importe = f.Importe,
                CheckRfcProveedor = f.CheckRfcProveedor,
                CheckCP = f.CheckCP,
                CheckRegFiscal = f.CheckRegFiscal,
                CheckRfcCliente = f.CheckRfcCliente,
                CheckUnidad = f.CheckUnidad,
                CheckDescripcion = f.CheckDescripcion,
                CheckIvaDesglosado = f.CheckIvaDesglosado,
                CheckUsoCFDI = f.CheckUsoCFDI,
                CheckMetodoPago = f.CheckMetodoPago,
                CheckFormaPago = f.CheckFormaPago,
                CheckTipoCFDI = f.CheckTipoCFDI,
                EstatusPago = f.EstatusPago,
                Observaciones = f.Observaciones,
                FechaPago = f.FechaPago,
                Block = f.Block
            });

            return Json(ListaFactura, JsonRequestBehavior.AllowGet);
        }
        
        public ActionResult FacturasNoAsignadasLista()
        { 
            var ListaFactura = repositorioFacturas.facturas.Where(f => f.Correo == "No Especificado" && f.Block == false).Select(f => new
            {
                ID = f.ID,
                Empresa = f.Empresa,
                RfcEmpresa = f.RfcEmpresa,
                FolioFiscal = f.FolioFiscal,
                Folio = f.Folio,
                Fecha = f.Fecha,
                Proveedor = f.Proveedor,
                RfcProveedor = f.RfcProveedor,
                Importe = f.Importe,
                CheckRfcProveedor = f.CheckRfcProveedor,
                CheckCP = f.CheckCP,
                CheckRegFiscal = f.CheckRegFiscal,
                CheckRfcCliente = f.CheckRfcCliente,
                CheckUnidad = f.CheckUnidad,
                CheckDescripcion = f.CheckDescripcion,
                CheckIvaDesglosado = f.CheckIvaDesglosado,
                CheckUsoCFDI = f.CheckUsoCFDI,
                CheckMetodoPago = f.CheckMetodoPago,
                CheckFormaPago = f.CheckFormaPago,
                CheckTipoCFDI = f.CheckTipoCFDI,
                EstatusPago = f.EstatusPago,
                Observaciones = f.Observaciones,
                FechaPago = f.FechaPago,
                Block = f.Block

            });

            return Json(ListaFactura, JsonRequestBehavior.AllowGet);
        }

        public ActionResult FacturasDetalles(string id)
        {
            var Factura = repositorioFacturas.facturas.Where(w => w.ID == int.Parse(id)).Single();

            return Json(Factura, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult FacturasGuardado(string Factur)
        {
            //System.Diagnostics.Debug.WriteLine(Factur);
            JavaScriptSerializer ser = new JavaScriptSerializer();
            var res = ser.Deserialize<Dictionary<string, string>>(Factur);
            var Tempfecha = res["Fecha"].ToString().Split('T');
            int IDFact = int.Parse(res["Id"].ToString());
            //System.Diagnostics.Debug.WriteLine(fech[0]);
            try
            {
                var identity = (ClaimsIdentity)User.Identity;
                IEnumerable<Claim> claims = identity.Claims;
                string correoUsuario = claims.Where(c => c.Type == ClaimTypes.Email).Select(c => c.Value).SingleOrDefault();

                using (TesoreriaEntities servidor = new TesoreriaEntities())
                {
                    var TempFat = servidor.Facturas.Where(f => f.ID == IDFact ).Single();
                    TempFat.EstatusPago = res["Estatus"].ToString();
                    TempFat.FechaPago = Tempfecha[0];
                    TempFat.Block = true;
                    TempFat.Correo = correoUsuario;

                    servidor.SaveChanges();

                }
            }
            catch(Exception ex)
            {
                return Json(new { success = false, responseText = ex.Message }, JsonRequestBehavior.AllowGet);
            }
            return Json(new {success = true, responseText = "OK"}, JsonRequestBehavior.AllowGet);

        }

        [HttpPost]
        public ActionResult EliminarElemento(string id)
        {
            ServicePointManager.ServerCertificateValidationCallback = delegate (object s, X509Certificate certificate, X509Chain chain, SslPolicyErrors sslPolicyErrors) { return true; };
            var identity = (ClaimsIdentity)User.Identity;
            IEnumerable<Claim> claims = identity.Claims;
            string sid = claims.Where(c => c.Type == ClaimTypes.Sid).Select(c => c.Value).SingleOrDefault();
            string correoUsuario = claims.Where(c => c.Type == ClaimTypes.Email).Select(c => c.Value).SingleOrDefault();

            var Borrar = repositorioPagos.BorrarPago(int.Parse(id), correoUsuario);
            if (Borrar)
            {
                return Json("Eliminado", JsonRequestBehavior.AllowGet);
            }
            return Json(new { success = false, responseText = "No fue posible eliminarlo" }, JsonRequestBehavior.AllowGet);
        }


        [HttpPost]
        public ActionResult Reenviar(string id)
        {
            try
            {
            ServicePointManager.ServerCertificateValidationCallback = delegate (object s, X509Certificate certificate, X509Chain chain, SslPolicyErrors sslPolicyErrors) { return true; };
            var identity = (ClaimsIdentity)User.Identity;
            IEnumerable<Claim> claims = identity.Claims;
            string sid = claims.Where(c => c.Type == ClaimTypes.Sid).Select(c => c.Value).SingleOrDefault();
            string correoUsuario = claims.Where(c => c.Type == ClaimTypes.Email).Select(c => c.Value).SingleOrDefault();

            var TempRepo = repositorioPagos.pagos.Where(pf => pf.ID_Usuario == int.Parse(sid) && pf.Eliminado != true).ToList();

            var p = TempRepo.Where(s => s.ID == int.Parse(id)).First<Pagos>();
            string ColorProgramado = "#000";
            if (p.Programacion == "NO PROGRAMADO" || p.Programacion == "ESPECIAL NP" || p.Programacion == "CAJA CHICA NP")
            {
                ColorProgramado = "#e53935";
            }

                SmtpClient client = new SmtpClient();
            client.Host = "mail.grupodesur.com";
            client.Port = 587;
            client.EnableSsl = false;
            client.DeliveryMethod = SmtpDeliveryMethod.Network;
            client.UseDefaultCredentials = false;
            client.Credentials = new NetworkCredential("pagos@grupodesur.com", "}fUrvHvI*0Hw");
            //Enviando correo
            MailMessage mail = new MailMessage();
            mail.From = new MailAddress(correoUsuario);
            mail.To.Add(new MailAddress("solicitudes@grupodesur.com"));
            mail.To.Add(new MailAddress("tesoreria@grupodesur.com"));
            mail.To.Add(new MailAddress(correoUsuario));
           
            mail.Subject = "REENVIO DE SOLICITUD DE PAGO ";
            mail.IsBodyHtml = true;
            string Mail2 = string.Empty;

            Mail2 += "<span style=\"font-size:18px;font-weight:bold;\">ESTE ES UNICAMENTE UN REENVIO DE CORREO DE UN PAGO PREVIAMENTE SOLICITADO, NO SE HA REGISTRADO NI SOLICITADO UN PAGO NUEVO</span><br/>";
            Mail2 += "<br><br><h2>" + "Reenvio de Pago <span style =\"color:" + ColorProgramado + ";\">" + p.Programacion + "</span><br>" + "</h2>" +
                           "FOLIO:  <b>" + p.folio + "</b><br>" +
                           "Movimiento interno:  <b>" + (p.MovInt == true ? "Si" : "No") + "</b><br>" +
                           "Beneficiario:  <b>" + p.Beneficiario + "</b><br>" +
                           "Forma de Pago: <b>" + p.FormaPago + "</b><br>" +
                           "Razon Social:  <b>" + p.Razon + "</b><br>" +
                           "Solicitante:   <b>" + p.Solicito + "</b><br>" +
                           "Responsable del NP: <b>" + (p.CategoriaNP ?? "&nbsp") + "</b><br>" +
                           "Nombre de responsable del NP: <b>" + (p.ResponsableNP ?? "&nbsp") + "</b><br>" +
                           "Autorizo: <b>" + p.Autorizo + "</b><br>" +
                           "Fecha de Pago: <b>" + p.FechaDePago.Date.ToLongDateString() + "</b><br>" +
                           "Observaciones: <b>" + p.Observaciones + "</b><br>";
            //Añade la table en html
            Mail2 += "<table style=\"border-collapse:collapse; text-align:center;\">" +
                    "<tr style =\"background-color:#1e88e5; color:#ffffff;\">" +
                    "<th style =\"width:150;font-size:small;\">PROYECTO</th>" +
                    "<th style =\"width:150;font-size:small;\">CUENTA</th>" +
                    "<th style =\"width:150;font-size:small;\">SUBCUENTA</th>" +
                    "<th style =\"width:300;font-size:small;\">CONCEPTO</th>" +
                    "<th style =\"width:150;font-size:small;\">MONTO</th>" +
                    "</tr>";
            foreach (var m in p.Conceptos)
            {
                Mail2 += "<tr>" +
                       "<td style=\" border-color:#5c87b2; border-style:solid; width:150; border-width:thin; padding: 5px;\">" + m.Proyecto + "</td>" +
                       "<td style=\" border-color:#5c87b2; border-style:solid; width:150; border-width:thin; padding: 5px;\">" + m.Cuenta + "</td>" +
                       "<td style=\" border-color:#5c87b2; border-style:solid; width:150; border-width:thin; padding: 5px;\">" + m.Subcuenta + "</td>" +
                       "<td style=\" border-color:#5c87b2; border-style:solid; width:300; border-width:thin; padding: 5px; max-width: 200px; \">" + m.Concepto + "</td>" +
                       "<td style=\" border-color:#5c87b2; border-style:solid; width:150; border-width:thin; padding: 5px;\">" + String.Format("$ {0:0,0.00}", m.Monto) + "</td>" +
                       "</tr>";

            }


            Mail2 += "<tr>" +
                      "<td colspan=\"3\" style =\" border-color:#5c87b2; border-style:solid; width:150; border-width:thin; padding: 3px; background-color:#1e88e5; color:#ffffff;\"></td>" +
                      "<td style=\" border-color:#5c87b2; border-style:solid; width:300; border-width:thin; padding: 3px; max-width: 200px; font-size:small; background-color:#1e88e5; color:#ffffff; \"> MONTO TOTAL: </td>" +
                      "<td style=\" border-color:#5c87b2; border-style:solid; width:150; border-width:thin; padding: 3px; font-size:medium; background-color:#1e88e5; color:#ffffff; \">" + String.Format("$ {0:0,0.00}", p.Conceptos.Sum(s => s.Monto)) + "</td>" +
                      "</tr>" +
                      "<tr>" +
                        "<td  colspan=\"5\"  style = \"font-size:8px; font-family:Verdana; color:#959595; line-height: 10px;\">" +
                                        "<p style = \"margin: 0px; padding-top: 10px; \" >" +
                                        "<span style = \"font-size:10px; \" >GRUPO DESUR SA DE CV &bull;Prol. Montejo No. 497a x 25 y 56ª. Torre Banorte Nivel 4. Col. Centro &bull;Merida &bull;97000 &bull;Yucatan</span><br/>" +
                                        "Este mensaje es confidencial.Igualmente protegido por reglas legales de la empresa.Si has recibido este correo por error, porfavor contacta al departamento de Tesoreria o Soporte y eliminalo de tu sistema; no debes copiar este mensaje o su contenido a nadien no autorizado.Porfavor envianos un mensaje con la fecha en la que recibio el mensaje. Atte. Gerencia GRUPO DESUR" +
                                "</p>" +
                        "</td>" +
                      "</tr>";
            Mail2 += "</table><br><br>";

            mail.Body = Mail2;
            client.Send(mail);
            client.Dispose();
            mail.Dispose();
            }

            catch (Exception ex)
            {
                return Json(new { success = false, responseText = ex.Message }, JsonRequestBehavior.AllowGet);
            }

            return Json("Enviado", JsonRequestBehavior.AllowGet);
        }

    }
}