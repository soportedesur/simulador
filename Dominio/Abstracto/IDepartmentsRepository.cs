using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Dominio.Entidades;

namespace Dominio.Abstracto
{
    public interface IDepartmentsRepository
    {
        IEnumerable<Departamentos> departamentos { get; set; }
    }
}
