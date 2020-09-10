using System;
using System.Threading.Tasks;
using Microsoft.Owin;
using Owin;
using Microsoft.AspNet.Identity;
using Microsoft.Owin.Security.Cookies;
using Microsoft.Owin.Security.DataProtection;

[assembly: OwinStartup(typeof(WebUI.App_Start.Startup1))]

namespace WebUI.App_Start
{
    public class Startup1
    {
        public void Configuration(IAppBuilder app)
        {  // Para obtener más información acerca de cómo configurar su aplicación, visite http://go.microsoft.com/fwlink/?LinkID=316888
            app.UseCookieAuthentication(new CookieAuthenticationOptions
            {
                AuthenticationType = DefaultAuthenticationTypes.ApplicationCookie,
                LoginPath = new PathString("/Login"),
                CookieSecure = CookieSecureOption.SameAsRequest
            });
            //app.UseCookieAuthentication(new CookieAuthenticationOptions
            //{
            //    AuthenticationType = DefaultAuthenticationTypes.ApplicationCookie,
            //    LoginPath = new PathString("/Account/Login"),
            //    LogoutPath = new PathString("/Account/LogOff"),
            //    ExpireTimeSpan = TimeSpan.FromMinutes(5.0)
            //});
        }
    }
}
