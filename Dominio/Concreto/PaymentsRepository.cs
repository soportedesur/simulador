using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Dominio.Abstracto;
using Dominio.Entidades;
using System.Data.Entity.Validation;
using System.Net.Mail;
using System.Net;
using System.Net.Security;
using System.Security.Cryptography.X509Certificates;
using System.Data.SqlClient;

namespace Dominio.Concreto
{
    public class PaymentsRepository:IPaymentsRepository
    {
        TesoreriaEntities contexto = new TesoreriaEntities();

        public IEnumerable<Pagos> pagos
        {
            get
            {
                return contexto.Pagos;
            }
            set { }
        }

        public string SalvarPago(Pagos[] pag, int idUsuario, string email)
        {    //Ignora el certificado del servidor del correo
            //ServicePointManager.ServerCertificateValidationCallback = delegate (object s, X509Certificate certificate, X509Chain chain, SslPolicyErrors sslPolicyErrors) { return true; };

            //try
            //{
            //    if (pag != null && pag.Count() > 0)
            //    {
            //        List<Pagos> TempPagos = new List<Pagos>();
            //        foreach (var p in pag)
            //        {
            //            TempPagos.Add(new Pagos()
            //            {
            //                folio = "GDS" + contexto.Database.SqlQuery<int>("SELECT NEXT VALUE FOR Tesoreria.CounterSeq").Single(),
            //                ID_Usuario = idUsuario,
            //                Beneficiario = pag.Beneficiario,
            //                Razon = pag.Razon,
            //                Autorizo = pag.Autorizo,
            //                Solicito = contexto.Usuarios.Where(u => u.ID == idUsuario).Select(c => c.Nombre + " " + c.Apellidos).Single(),
            //                FechaSolicitud = DateTime.Now.Date,
            //                FechaDePago = pag.FechaDePago.Date,
            //                Programacion = pag.Programacion,
            //                FormaPago = pag.FormaPago,
            //                Observaciones = pag.Observaciones,
            //                HoraSolicitud = DateTime.Now.TimeOfDay,
            //                CategoriaNP = pag.CategoriaNP,
            //                ResponsableNP = pag.ResponsableNP,
            //                Conceptos = pag.Conceptos.Select(c => new Conceptos() { Concepto = c.Concepto, Proyecto = c.Proyecto, Cuenta = c.Cuenta, Subcuenta = c.Subcuenta, Monto = c.Monto }).ToList()
            //            });
            //        }


            //        foreach (var p in TempPagos)
            //        {
            //            contexto.Pagos.Add(new Pagos()
            //            {
            //                folio = pag.folio,
            //                ID_Usuario = pag.ID_Usuario,
            //                Beneficiario = pag.Beneficiario,
            //                Razon = pag.Razon,
            //                Autorizo = pag.Autorizo,
            //                Solicito = pag.Solicito,
            //                FechaSolicitud = pag.FechaSolicitud.Date,
            //                FechaDePago = pag.FechaDePago.Date,
            //                Programacion = pag.Programacion,
            //                FormaPago = pag.FormaPago,
            //                Observaciones = pag.Observaciones,
            //                HoraSolicitud = pag.HoraSolicitud,
            //                CategoriaNP = pag.CategoriaNP,
            //                ResponsableNP = pag.ResponsableNP,
            //                Conceptos = pag.Conceptos.Select(c => new Conceptos() { Concepto = c.Concepto, Proyecto = c.Proyecto, Cuenta = c.Cuenta, Subcuenta = c.Subcuenta, Monto = c.Monto }).ToList()
            //            });
            //        }
            //        contexto.SaveChanges();

            //        foreach (var p in TempPagos)
            //        {
            //            SmtpClient client = new SmtpClient();
            //            client.Host = "mail.grupodesur.com";
            //            client.Port = 587;
            //            client.EnableSsl = false;
            //            client.DeliveryMethod = SmtpDeliveryMethod.Network;
            //            client.UseDefaultCredentials = false;
            //            client.Credentials = new NetworkCredential("pagos@grupodesur.com", "}fUrvHvI*0Hw");
            //            //Enviando correo
            //            MailMessage mail = new MailMessage();
            //            mail.From = new MailAddress(email);//DE

            //            //mail.To.Add(new MailAddress("soporte@grupodesur.com"));//Destinatario
            //            //mail.To.Add(new MailAddress("lacevedo@grupodesur.com"));//Destinatario

            //            mail.To.Add(new MailAddress("solicitudes@grupodesur.com"));
            //            mail.To.Add(new MailAddress("tesoreria@grupodesur.com"));
            //            mail.To.Add(new MailAddress(email));
            //            mail.Subject = "SOLICITUD DE PAGO ";
            //            mail.IsBodyHtml = true;
            //            string Mail = string.Empty;

            //            string ColorProgramado = "#000";
            //            if (pag.Programacion == "NO PROGRAMADO" || pag.Programacion == "ESPECIAL NP" || pag.Programacion == "CAJA CHICA NP")
            //            {
            //                ColorProgramado = "#e53935";
            //            }

            //            Mail += "<br><br><h2>" + "Nueva Solicitud de Pago <span style =\"color:" + ColorProgramado + ";\">" + pag.Programacion + "</span><br>" + "</h2>" +
            //                           "FOLIO:  <b>" + pag.folio + "</b><br>" +
            //                           "Beneficiario:  <b>" + pag.Beneficiario + "</b><br>" +
            //                           "Forma de Pago: <b>" + pag.FormaPago + "</b><br>" +
            //                           "Razon Social:  <b>" + pag.Razon + "</b><br>" +
            //                           "Solicitante:   <b>" + pag.Solicito + "</b><br>" +
            //                           "Responsable del NP: <b>" + (pag.CategoriaNP ?? "&nbsp") + "</b><br>" +
            //                           "Nombre de responsable del NP: <b>" + (pag.ResponsableNP ?? "&nbsp") + "</b><br>" +
            //                           "Autorizo: <b>" + pag.Autorizo + "</b><br>" +
            //                           "Fecha de Pago: <b>" + pag.FechaDePago.Date.ToLongDateString() + "</b><br>" +
            //                           "Observaciones: <b>" + pag.Observaciones + "</b><br>";
            //            //Añade la table en html
            //            Mail += "<table style=\"border-collapse:collapse; text-align:center;\">" +
            //       "<tr style =\"background-color:#1e88e5; color:#ffffff;\">" +
            //       "<th style =\"width:150;font-size:small;\">PROYECTO</th>" +
            //       "<th style =\"width:150;font-size:small;\">CUENTA</th>" +
            //       "<th style =\"width:150;font-size:small;\">SUBCUENTA</th>" +
            //       "<th style =\"width:300;font-size:small;\">CONCEPTO</th>" +
            //       "<th style =\"width:150;font-size:small;\">MONTO</th>" +
            //       "</tr>";
            //            foreach (var m in pag.Conceptos)
            //            {
            //                Mail += "<tr>" +
            //                       "<td style=\" border-color:#5c87b2; border-style:solid; width:150; border-width:thin; padding: 5px;\">" + m.Proyecto + "</td>" +
            //                       "<td style=\" border-color:#5c87b2; border-style:solid; width:150; border-width:thin; padding: 5px;\">" + m.Cuenta + "</td>" +
            //                       "<td style=\" border-color:#5c87b2; border-style:solid; width:150; border-width:thin; padding: 5px;\">" + m.Subcuenta + "</td>" +
            //                       "<td style=\" border-color:#5c87b2; border-style:solid; width:300; border-width:thin; padding: 5px; max-width: 200px; \">" + m.Concepto + "</td>" +
            //                       "<td style=\" border-color:#5c87b2; border-style:solid; width:150; border-width:thin; padding: 5px;\">" + String.Format("$ {0:0,0.00}", m.Monto) + "</td>" +
            //                       "</tr>";

            //            }


            //            Mail += "<tr>" +
            //                      "<td colspan=\"3\" style =\" border-color:#5c87b2; border-style:solid; width:150; border-width:thin; padding: 3px; background-color:#1e88e5; color:#ffffff;\"></td>" +
            //                      "<td style=\" border-color:#5c87b2; border-style:solid; width:300; border-width:thin; padding: 3px; max-width: 200px; font-size:small; background-color:#1e88e5; color:#ffffff; \"> MONTO TOTAL: </td>" +
            //                      "<td style=\" border-color:#5c87b2; border-style:solid; width:150; border-width:thin; padding: 3px; font-size:medium; background-color:#1e88e5; color:#ffffff; \">" + String.Format("$ {0:0,0.00}", pag.Conceptos.Sum(s => s.Monto)) + "</td>" +
            //                      "</tr>" +
            //                      "<tr>" +
            //                        "<td  colspan=\"5\"  style = \"font-size:8px; font-family:Verdana; color:#959595; line-height: 10px;\">" +
            //                                        "<p style = \"margin: 0px; padding-top: 10px; \" >" +
            //                                        "<span style = \"font-size:10px; \" >GRUPO DESUR SA DE CV &bull;Prol. Montejo No. 497a x 25 y 56ª. Torre Banorte Nivel 4. Col. Centro &bull;Merida &bull;97000 &bull;Yucatan</span><br/>" +
            //                                        "Este mensaje es confidencial.Igualmente protegido por reglas legales de la empresa.Si has recibido este correo por error, porfavor contacta al departamento de Tesoreria o Soporte y eliminalo de tu sistema; no debes copiar este mensaje o su contenido a nadien no autorizado.Porfavor envianos un mensaje con la fecha en la que recibio el mensaje. Atte. Gerencia GRUPO DESUR" +
            //                                "</p>" +
            //                        "</td>" +
            //                      "</tr>";
            //            Mail += "</table><br><br>";

            //            mail.Body = Mail;
            //            //mail.Attachments.Add(new Attachment(ruta + "\\" + NomArch + ".pdf"));
            //            client.Send(mail);
            //            client.Dispose();
            //            mail.Dispose();
            //        }
            //        return "Guardado";
            //    }
            //}
            ////catch(Exception e)
            ////{
            ////    return e.Message;
            ////}
            //catch (DbEntityValidationException ex)
            //{
            //    foreach (var entityValidationErrors in ex.EntityValidationErrors)
            //    {
            //        foreach (var validationError in entityValidationErrors.ValidationErrors)
            //        {
            //            System.Diagnostics.Debug.WriteLine("Property: " + validationError.PropertyName + " Error: " + validationError.ErrorMessage);
            //        }
            //    }
            //    return ex.Message;
            //}
            return "Error";
        }

        public string SalvarUnicoPago(Pagos pag, int idUsuario, string email)
        {    //Ignora el certificado del servidor del correo
            ServicePointManager.ServerCertificateValidationCallback = delegate (object s, X509Certificate certificate, X509Chain chain, SslPolicyErrors sslPolicyErrors) { return true; };

            try
            {
                if (pag != null)
                {
                    Pagos tempPago = new Pagos()
                    {
                        folio = "GDS" + contexto.Database.SqlQuery<int>("SELECT NEXT VALUE FOR Tesoreria.CounterSeq").Single(),
                        ID_Usuario = idUsuario,
                        Beneficiario = pag.Beneficiario,
                        Razon = pag.Razon,
                        Autorizo = pag.Autorizo,
                        Solicito = contexto.Usuarios.Where(u => u.ID == idUsuario).Select(c => c.Nombre + " " + c.Apellidos).Single(),
                        FechaSolicitud = DateTime.Now.Date,
                        FechaDePago = pag.FechaDePago.Date,
                        Programacion = pag.Programacion,
                        FormaPago = pag.FormaPago,
                        Observaciones = pag.Observaciones,
                        HoraSolicitud = DateTime.Now.TimeOfDay,
                        CategoriaNP = pag.CategoriaNP,
                        ResponsableNP = pag.ResponsableNP,
                        MovInt = pag.MovInt,
                        Conceptos = pag.Conceptos.Select(c => new Conceptos() { Concepto = c.Concepto, Proyecto = c.Proyecto, Cuenta = c.Cuenta, Subcuenta = c.Subcuenta, Monto = c.Monto }).ToList()
                    };

                    contexto.Pagos.Add(tempPago);

                    contexto.SaveChanges();


                    using (TesoreriaEntities servidor = new TesoreriaEntities())
                    {
                        var temp = servidor.Pagos.Where(p => p.folio == tempPago.folio).Single();
                    }


                    try
                    {

                        SmtpClient client = new SmtpClient();
                        client.Host = "mail.grupodesur.com";
                        client.Port = 587;
                        client.EnableSsl = false;
                        client.DeliveryMethod = SmtpDeliveryMethod.Network;
                        client.UseDefaultCredentials = false;
                        client.Credentials = new NetworkCredential("pagos@grupodesur.com", "}fUrvHvI*0Hw");
                        MailMessage mail = new MailMessage();
                        mail.From = new MailAddress(email);
                        mail.To.Add(new MailAddress("solicitudes@grupodesur.com"));
                        mail.To.Add(new MailAddress("tesoreria@grupodesur.com"));
                        mail.To.Add(new MailAddress(email));
                        mail.Subject = "SOLICITUD DE PAGO ";
                        mail.IsBodyHtml = true;
                        string Mail = string.Empty;

                        string ColorProgramado = "#000";
                        if (tempPago.Programacion == "NO PROGRAMADO" || tempPago.Programacion == "ESPECIAL NP" || tempPago.Programacion == "CAJA CHICA NP")
                        {
                            ColorProgramado = "#e53935";
                        }

                        Mail += "<br><br><h2>" + "Nueva Solicitud de Pago <span style =\"color:" + ColorProgramado + ";\">" + tempPago.Programacion + "</span><br>" + "</h2>" +
                                       "FOLIO:  <b>" + tempPago.folio + "</b><br>" +
                                       "Movimiento interno:  <b>" + (tempPago.MovInt== true ? "Si" : "No") + "</b><br>" +
                                       "Beneficiario:  <b>" + tempPago.Beneficiario + "</b><br>" +
                                       "Forma de Pago: <b>" + tempPago.FormaPago + "</b><br>" +
                                       "Razon Social:  <b>" + tempPago.Razon + "</b><br>" +
                                       "Solicitante:   <b>" + tempPago.Solicito + "</b><br>" +
                                       "Responsable del NP: <b>" + (tempPago.CategoriaNP ?? "&nbsp") + "</b><br>" +
                                       "Nombre de responsable del NP: <b>" + (tempPago.ResponsableNP ?? "&nbsp") + "</b><br>" +
                                       "Autorizo: <b>" + tempPago.Autorizo + "</b><br>" +
                                       "Fecha de Pago: <b>" + tempPago.FechaDePago.Date.ToLongDateString() + "</b><br>" +
                                       "Observaciones: <b>" + tempPago.Observaciones + "</b><br>";
                        //Añade la table en html
                        Mail += "<table style=\"border-collapse:collapse; text-align:center;\">" +
                   "<tr style =\"background-color:#1e88e5; color:#ffffff;\">" +
                   "<th style =\"width:150;font-size:small;\">PROYECTO</th>" +
                   "<th style =\"width:150;font-size:small;\">CUENTA</th>" +
                   "<th style =\"width:150;font-size:small;\">SUBCUENTA</th>" +
                   "<th style =\"width:300;font-size:small;\">CONCEPTO</th>" +
                   "<th style =\"width:150;font-size:small;\">MONTO</th>" +
                   "</tr>";
                        foreach (var m in tempPago.Conceptos)
                        {
                            Mail += "<tr>" +
                                   "<td style=\" border-color:#5c87b2; border-style:solid; width:150; border-width:thin; padding: 5px;\">" + m.Proyecto + "</td>" +
                                   "<td style=\" border-color:#5c87b2; border-style:solid; width:150; border-width:thin; padding: 5px;\">" + m.Cuenta + "</td>" +
                                   "<td style=\" border-color:#5c87b2; border-style:solid; width:150; border-width:thin; padding: 5px;\">" + m.Subcuenta + "</td>" +
                                   "<td style=\" border-color:#5c87b2; border-style:solid; width:300; border-width:thin; padding: 5px; max-width: 200px; \">" + m.Concepto + "</td>" +
                                   "<td style=\" border-color:#5c87b2; border-style:solid; width:150; border-width:thin; padding: 5px;\">" + String.Format("$ {0:0,0.00}", m.Monto) + "</td>" +
                                   "</tr>";

                        }


                        Mail += "<tr>" +
                                  "<td colspan=\"3\" style =\" border-color:#5c87b2; border-style:solid; width:150; border-width:thin; padding: 3px; background-color:#1e88e5; color:#ffffff;\"></td>" +
                                  "<td style=\" border-color:#5c87b2; border-style:solid; width:300; border-width:thin; padding: 3px; max-width: 200px; font-size:small; background-color:#1e88e5; color:#ffffff; \"> MONTO TOTAL: </td>" +
                                  "<td style=\" border-color:#5c87b2; border-style:solid; width:150; border-width:thin; padding: 3px; font-size:medium; background-color:#1e88e5; color:#ffffff; \">" + String.Format("$ {0:0,0.00}", tempPago.Conceptos.Sum(s => s.Monto)) + "</td>" +
                                  "</tr>" +
                                  "<tr>" +
                                    "<td  colspan=\"5\"  style = \"font-size:8px; font-family:Verdana; color:#959595; line-height: 10px;\">" +
                                                    "<p style = \"margin: 0px; padding-top: 10px; \" >" +
                                                    "<span style = \"font-size:10px; \" >GRUPO DESUR SA DE CV &bull; Calle 67 No. 118 x 16 y 18, Col. Montes de Amé &bull;Merida &bull;Cp. 97115 &bull;Yucatan</span><br/>" +
                                                    "Este mensaje es confidencial.Igualmente protegido por reglas legales de la empresa.Si has recibido este correo por error, porfavor contacta al departamento de Tesoreria o Soporte y eliminalo de tu sistema; no debes copiar este mensaje o su contenido a nadien no autorizado.Porfavor envianos un mensaje con la fecha en la que recibio el mensaje. Atte. Gerencia GRUPO DESUR" +
                                            "</p>" +
                                    "</td>" +
                                  "</tr>";
                        Mail += "</table><br><br>";

                        mail.Body = Mail;
                        client.Send(mail);
                        client.Dispose();
                        mail.Dispose();
                    }
                    catch (Exception e)
                    {
                        return e.ToString();
                    }

                    return "Guardado";
                }
                else
                { throw new Exception("Lista de pagos Vacia"); }
            }

            catch (DbEntityValidationException ex)
            {
                foreach (var entityValidationErrors in ex.EntityValidationErrors)
                {
                    foreach (var validationError in entityValidationErrors.ValidationErrors)
                    {
                        System.Diagnostics.Debug.WriteLine("Property: " + validationError.PropertyName + " Error: " + validationError.ErrorMessage);
                    }
                }
                return ex.ToString();
            }

            catch (SqlException e) { 
                return e.ToString();
            }

            catch (Exception e)
            {
                return e.ToString();
            }

        }

        public bool BorrarPago(int pag, string email)
        {
            if (pag > 0)
            {
                try
                {

                    var pago = contexto.Pagos.FirstOrDefault(ps => ps.ID == pag);
                    pago.Eliminado = true;
                    pago.FechaEliminado = DateTime.Now.Date;
                    contexto.SaveChanges();

                    var p = pago;
                    SmtpClient client = new SmtpClient();
                    client.Host = "mail.grupodesur.com";
                    client.Port = 587;
                    client.EnableSsl = true;
                    client.DeliveryMethod = SmtpDeliveryMethod.Network;
                    client.UseDefaultCredentials = false;
                    client.Credentials = new NetworkCredential("pagos@grupodesur.com", "}fUrvHvI*0Hw");
                    //Enviando correo
                    MailMessage mail = new MailMessage();
                    mail.From = new MailAddress(email);
                    mail.To.Add(new MailAddress("solicitudes@grupodesur.com"));
                    mail.To.Add(new MailAddress("tesoreria@grupodesur.com"));
                    mail.To.Add(new MailAddress(email));
                    mail.Subject = "CANCELACION DE PAGO ";
                    mail.IsBodyHtml = true;
                    string Mail = string.Empty;

                    string ColorProgramado = "#e53935";


                    Mail += "<br><br><h2> <span style =\"color:" + ColorProgramado + ";\">Cancelacion del Pago " + pago.folio + "</span><br>" + "</h2>" +
                        "<h4> <span style =\"color:" + ColorProgramado + ";\">El siguente pago ha sido solicitado para cancelar</span><br>" + "</h4><br>" +
                                   "FOLIO:  <b>" + pago.folio + "</b><br>" +
                                   "Movimiento interno:  <b>" + (pago.MovInt == true ? "Si" : "No") + "</b><br>" +
                                   "Beneficiario:  <b>" + pago.Beneficiario + "</b><br>" +
                                   "Forma de Pago: <b>" + pago.FormaPago + "</b><br>" +
                                   "Razon Social:  <b>" + pago.Razon + "</b><br>" +
                                   "Solicitante:   <b>" + pago.Solicito + "</b><br>" +
                                   "Responsable del NP: <b>" + (pago.CategoriaNP ?? "&nbsp") + "</b><br>" +
                                   "Nombre de responsable del NP: <b>" + (pago.ResponsableNP ?? "&nbsp") + "</b><br>" +
                                   "Autorizo: <b>" + pago.Autorizo + "</b><br>" +
                                   "Fecha de Pago: <b>" + pago.FechaDePago.Date.ToLongDateString() + "</b><br>" +
                                   "Observaciones: <b>" + pago.Observaciones + "</b><br>";
                    //Añade la table en html
                    Mail += "<table style=\"border-collapse:collapse; text-align:center;\">" +
                               "<tr style =\"background-color:#1e88e5; color:#ffffff;\">" +
                               "<th style =\"width:150;font-size:small;\">PROYECTO</th>" +
                               "<th style =\"width:150;font-size:small;\">CUENTA</th>" +
                               "<th style =\"width:150;font-size:small;\">SUBCUENTA</th>" +
                               "<th style =\"width:300;font-size:small;\">CONCEPTO</th>" +
                               "<th style =\"width:150;font-size:small;\">MONTO</th>" +
                               "</tr>";
                    foreach (var m in pago.Conceptos)
                    {
                        Mail += "<tr>" +
                               "<td style=\" border-color:#5c87b2; border-style:solid; width:150; border-width:thin; padding: 5px;\">" + m.Proyecto + "</td>" +
                               "<td style=\" border-color:#5c87b2; border-style:solid; width:150; border-width:thin; padding: 5px;\">" + m.Cuenta + "</td>" +
                               "<td style=\" border-color:#5c87b2; border-style:solid; width:150; border-width:thin; padding: 5px;\">" + m.Subcuenta + "</td>" +
                               "<td style=\" border-color:#5c87b2; border-style:solid; width:300; border-width:thin; padding: 5px; max-width: 200px; \">" + m.Concepto + "</td>" +
                               "<td style=\" border-color:#5c87b2; border-style:solid; width:150; border-width:thin; padding: 5px;\">" + String.Format("$ {0:0,0.00}", m.Monto) + "</td>" +
                               "</tr>";

                    }


                    Mail += "<tr>" +
                              "<td colspan=\"3\" style =\" border-color:#5c87b2; border-style:solid; width:150; border-width:thin; padding: 3px; background-color:#1e88e5; color:#ffffff;\"></td>" +
                              "<td style=\" border-color:#5c87b2; border-style:solid; width:300; border-width:thin; padding: 3px; max-width: 200px; font-size:small; background-color:#1e88e5; color:#ffffff; \"> MONTO TOTAL: </td>" +
                              "<td style=\" border-color:#5c87b2; border-style:solid; width:150; border-width:thin; padding: 3px; font-size:medium; background-color:#1e88e5; color:#ffffff; \">" + String.Format("$ {0:0,0.00}", pago.Conceptos.Sum(s => s.Monto)) + "</td>" +
                              "</tr>" +
                              "<tr>" +
                                "<td  colspan=\"5\"  style = \"font-size:8px; font-family:Verdana; color:#959595; line-height: 10px;\">" +
                                        "<p style = \"margin: 0px; padding-top: 10px; \" >" +
                                        "<span style = \"font-size:10px; \" >GRUPO DESUR SA DE CV &bull;Prol. Montejo No. 497a x 25 y 56ª. Torre Banorte Nivel 4. Col. Centro &bull;Merida &bull;97000 &bull;Yucatan</span><br/>" +
                                        "Este mensaje es confidencial.Igualmente protegido por reglas legales de la empresa.Si has recibido este correo por error, porfavor contacta al departamento de Tesoreria o Soporte y eliminalo de tu sistema; no debes copiar este mensaje o su contenido a nadien no autorizado.Porfavor envianos un mensaje con la fecha en la que recibio el mensaje. Atte. Gerencia GRUPO DESUR" +
                                "</p>" +
                              "</td>" +
                              "</tr>";
                    Mail += "</table><br><br>";

                    mail.Body = Mail;
                    client.Send(mail);
                    client.Dispose();
                    mail.Dispose();


                    return true;
                }
                catch
                {
                    return false;
                }

            }

            return false;
        }

    }
}
