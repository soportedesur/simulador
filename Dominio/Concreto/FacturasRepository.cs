using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Dominio.Abstracto;
using Dominio.Entidades;

namespace Dominio.Concreto
{
   public class FacturasRepository:IFacturasRepository
    {
        TesoreriaEntities contexto = new TesoreriaEntities();

        public IEnumerable<Facturas> facturas
        {
            get { return contexto.Facturas; }
            set { }
        }
    }
}
