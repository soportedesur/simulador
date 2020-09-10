using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Dominio.Abstracto;
using Dominio.Entidades;

namespace Dominio.Concreto
{
   public class DepartmentsRepository:IDepartmentsRepository
    {
        TesoreriaEntities contexto = new TesoreriaEntities();
        
        public IEnumerable<Departamentos> departamentos
        {
            get { return contexto.Departamentos; }
            set { }
        }
    }
}
