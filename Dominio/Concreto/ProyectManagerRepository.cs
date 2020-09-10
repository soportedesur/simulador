using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Dominio.Abstracto;
using Dominio.Entidades;

namespace Dominio.Concreto
{
    public class ProyectManagerRepository:IProyectManagersRepository
    {
        TesoreriaEntities contexto = new TesoreriaEntities();

        public IEnumerable<Usuarios> usuario
        {
            get { return contexto.Usuarios; }
            set { }
        }

    }
}
