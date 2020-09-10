using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Dominio.Abstracto;
using Dominio.Entidades;

namespace Dominio.Concreto
{
    public class ReasonRepository:IReasonRepository
    {
        TesoreriaEntities contexto = new TesoreriaEntities();
        public IEnumerable<Cuentas> Razon
        {
            get { return contexto.Cuentas; }
            set { }
        }
    }
}
