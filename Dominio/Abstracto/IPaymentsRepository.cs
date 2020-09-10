using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Dominio.Entidades;

namespace Dominio.Abstracto
{
    public interface IPaymentsRepository
    {
        IEnumerable<Pagos> pagos { get; set; }

        string SalvarPago(Pagos[] pag, int idUsuario, string email);
        string SalvarUnicoPago(Pagos pag, int idUsuario, string email);
        bool BorrarPago(int pag, string email);
    }
}
