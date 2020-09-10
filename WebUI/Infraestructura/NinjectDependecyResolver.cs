using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Ninject;
using Dominio.Abstracto;
using Dominio.Concreto;
using System.Web.Mvc;

namespace WebUI.Infraestructura
{
    public class NinjectDependecyResolver:IDependencyResolver
    {
        public IKernel kernel;
        public NinjectDependecyResolver(IKernel kern)
        {
            kernel = kern;
            AddBindigs();
        }

        public object GetService(Type serviceType)
        {
            return kernel.TryGet(serviceType);
        }

        public IEnumerable<object> GetServices(Type serviceType)
        {
            return kernel.GetAll(serviceType);
        }

        private void AddBindigs()
        {
            kernel.Bind<IPaymentsRepository>().To<PaymentsRepository>();
            kernel.Bind<IReasonRepository>().To<ReasonRepository>();
            kernel.Bind<IDepartmentsRepository>().To<DepartmentsRepository>();
            kernel.Bind<IProyectManagersRepository>().To<ProyectManagerRepository>();
            kernel.Bind<IFacturasRepository>().To<FacturasRepository>();
            kernel.Bind<IEncargados>().To<EncargadoRepository>();
            //kernel.Bind<IComputadorasRepositorio>().To<ComputadoraRepositorio>();
        }
    }
}