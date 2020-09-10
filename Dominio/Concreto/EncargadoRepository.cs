using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Dominio.Abstracto;
using Dominio.Entidades;

namespace Dominio.Concreto
{
   public class EncargadoRepository:IEncargados
    {
        TesoreriaEntities contexto = new TesoreriaEntities();

        public IEnumerable<Encargados> encargado
        {
            get { return contexto.Encargados; }
            set { }
        }
    }
}
