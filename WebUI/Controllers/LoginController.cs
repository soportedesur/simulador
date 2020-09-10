using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Dominio.Abstracto;
using Dominio.Entidades;
using Dominio.Concreto;
using Microsoft.AspNet.Identity;
using Microsoft.Owin.Security;
using System.Security.Claims;
using System.Web.Script.Serialization;

namespace WebUI.Controllers
{
    public class LoginController : Controller
    {
        // GET: Login
        IProyectManagersRepository repositorio;
        // GET: Login
        public LoginController(IProyectManagersRepository repo)
        {
            repositorio = repo;
        }

        [AllowAnonymous]
        public ActionResult Login(string returnUrl)
        {
            try
            {
                // Verification.    
                if (this.Request.IsAuthenticated)
                {
                    // Info.    
                    //return this.RedirectToLocal(returnUrl);
                    return this.RedirectToAction("Pagos", "Main");
                }
             
            }
            catch (Exception ex)
            {
                // Info    
                //Console.Write(ex);
                System.Diagnostics.Debug.WriteLine("LoginError: " + ex.Message);
            }
            // Info. 
            return this.View("Login");
        }

        [HttpPost]
        [AllowAnonymous]
        public ActionResult Login(string correo, string contra)
        {
            //JavaScriptSerializer ser = new JavaScriptSerializer();
            //var res = ser.Deserialize<string[]>(model);
            try
            {
                // Initialization.    
                List<Usuarios> loginInfo = repositorio.usuario.Where(u => u.Correo == correo && u.Contraseña == contra).ToList();
                // Verification.    
                if (loginInfo != null && loginInfo.Count() > 0)
                {
                    // Initialization.    
                    Usuarios logindetails = loginInfo.First();
                    // Login In.    
                    this.SignInUser(logindetails, false);
                    // Info.
                    return Json(new { success = true, responseText = "Acceso" }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    // Setting.    
                    //ModelState.AddModelError(string.Empty, "Invalid username or password.");
                    return Json(new { success = false, responseText = "usuario o contraseña invalida" }, JsonRequestBehavior.AllowGet);
                }

            }
            catch (Exception ex)
            {
                // Info    
                Console.Write(ex);
                return Json(new { success = false, responseText = ex.Message }, JsonRequestBehavior.AllowGet);
            }
            // If we got this far, something failed, redisplay form    
            //return this.View("Login");
        }

        private void SignInUser(Usuarios user, bool isPersistent)
        {
            // Initialization.    
            var claims = new List<Claim>();
            try
            {
                // Setting    
                claims.Add(new Claim(ClaimTypes.Name, user.Nombre + ' ' + user.Apellidos));
                claims.Add(new Claim(ClaimTypes.Surname, user.Apellidos));
                claims.Add(new Claim(ClaimTypes.Sid, user.ID.ToString()));
                claims.Add(new Claim(ClaimTypes.Email, user.Correo));
              
                var claimIdenties = new ClaimsIdentity(claims, DefaultAuthenticationTypes.ApplicationCookie);
             
                var ctx = Request.GetOwinContext();
                var authenticationManager = ctx.Authentication;
                // Sign In.    
                authenticationManager.SignIn(new AuthenticationProperties() { IsPersistent = isPersistent }, claimIdenties);
               
            }
            catch (Exception ex)
            {
                // Info    
                throw ex;
            }
        }

        [HttpPost]
        //[ValidateAntiForgeryToken]
        public ActionResult LogOff()
        {
            try
            {
                // Setting.    
                var ctx = Request.GetOwinContext();
                var authenticationManager = ctx.Authentication;
                // Sign Out.    
                authenticationManager.SignOut();
                //return this.RedirectToAction("Login", "Login");
               return Json(new { success = true, responseText = "Salio" }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                // Info    
                //throw ex;
                return Json(new { success = false, responseText = ex.Message }, JsonRequestBehavior.AllowGet);
            }
            // Info.    
           
        }

        //private ActionResult RedirectToLocal(string returnUrl)
        //{
        //    try
        //    {
        //        // Verification.    
        //        if (Url.IsLocalUrl(returnUrl))
        //        {
        //            // Info.    
        //            return this.Redirect(returnUrl);
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        // Info    
        //        throw ex;
        //    }
        //    // Info.    
        //    return this.RedirectToAction("Dash", "Dash");
        //}
    }
}