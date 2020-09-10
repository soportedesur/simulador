using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Dominio.Concreto;
using Dominio.Entidades;
using Dominio.Abstracto;
using System.Web.Mvc;
using System.Data.Sql;
using System.Data.OleDb;
using System.Data;

namespace WebUI.Models
{
    public class PaymentsModel
    {
        public Pagos NuevoPago { get; set; }
        public Conceptos NuevoConcepto { get; set; }
        public IEnumerable<Cuentas> Razon { get; set; }
        public IEnumerable<SelectListItem> EncargadosLista { get; set; }
        public IEnumerable<SelectListItem> Usuarios { get; set; }
        public IEnumerable<SelectListItem> Departamentos { get; set; }
        public ConceptosTemp MostrarConsolidado { get; set; }
        public List<ConceptosTemp> Consolidados { get; set; }
        public string UsuarioNombre { get; set; }
        public bool ProgramaJueves { get; set; }


        public string GetAdminPaqSQL()
        {
            string mensaje = null;
            DataTable _DTProyecto = new DataTable();
            DataTable _DTCuenta = new DataTable();
            DataTable _DTSubcuenta = new DataTable();
            DataTable _DTCliente = new DataTable();
            Consolidados = new List<ConceptosTemp>();
            OleDbConnection conexion;
            Dictionary<string, string> GrupoConsolidados = new Dictionary<string, string>();
            GrupoConsolidados.Add("DESUR",
                "Provider=SQLOLEDB;" +
                "Data Source=WIN-CGI3IFHU141;" +
                "Initial Catalog=adCONS_DESUR;" +
                "User id = desur;" +
                "Password = desur$TD350;"
                );
            GrupoConsolidados.Add("GMOCA",
                 "Provider = SQLOLEDB;" +
                 "Data Source = WIN-CGI3IFHU141;" +
                 "Initial Catalog = adCONS_GMOCA;" +
                 "User id = desur;" +
                 "Password = desur$TD350;"
                 );

             GrupoConsolidados.Add("FUTURA",
                 "Provider = SQLOLEDB;" +
                 "Data Source = WIN-CGI3IFHU141;" +
                 "Initial Catalog = adCONS_FUTURA;" +
                 "User id = desur;" +
                 "Password = desur$TD350;"
                 );

            try
            {
                foreach (var consol in GrupoConsolidados)
                {
                    conexion = new OleDbConnection(consol.Value);
                    conexion.Open();
                    if (conexion.State == ConnectionState.Open)
                    {
                        _DTProyecto.Clear();
                        _DTCuenta.Clear();
                        _DTSubcuenta.Clear();
                        _DTCliente.Clear();

                        string miSQL = "SELECT CNOMBRE¿ AS PROYECTOS FROM dbo.admaml";
                        OleDbCommand MiQuery = new OleDbCommand(miSQL, conexion);
                        OleDbDataAdapter Adaptador = new OleDbDataAdapter(MiQuery);
                        Adaptador.Fill(_DTProyecto);

                        string miSQL2 = "SELECT CVALOR AS CUENTA FROM dbo.admitemsval";
                        OleDbCommand MiQuery2 = new OleDbCommand(miSQL2, conexion);
                        OleDbDataAdapter Adaptador2 = new OleDbDataAdapter(MiQuery2);
                        Adaptador2.Fill(_DTCuenta);

                        string miSQL3 = "SELECT CNOMBRE AS SUBCUENTA FROM dbo.admitemsprod";
                        OleDbCommand MiQuery3 = new OleDbCommand(miSQL3, conexion);
                        OleDbDataAdapter Adaptador3 = new OleDbDataAdapter(MiQuery3);
                        Adaptador3.Fill(_DTSubcuenta);
                        conexion.Close();

                        string miSQL4 = "SELECT CRAZON AS CLIENTE FROM  dbo.admcustomers";
                        OleDbCommand MiQuery4 = new OleDbCommand(miSQL4, conexion);
                        OleDbDataAdapter Adaptador4 = new OleDbDataAdapter(MiQuery4);
                        Adaptador4.Fill(_DTCliente);
                        conexion.Close();
                    }

                    var ProyectoTemp = _DTProyecto.AsEnumerable().Select(s => s.Field<string>("PROYECTOS").TrimStart().TrimEnd()).ToList();
                    var CuentaTemp = _DTCuenta.AsEnumerable().Select(s => s.Field<string>("CUENTA").TrimStart().TrimEnd()).ToList();
                    var SubCuentaTemp = _DTSubcuenta.AsEnumerable().Select(s => s.Field<string>("SUBCUENTA").TrimStart().TrimEnd()).ToList();
                    var Clientess = _DTCliente.AsEnumerable().Select(s => s.Field<string>("CLIENTE").TrimStart().TrimEnd()).ToList();

                    Consolidados.Add(new ConceptosTemp()
                    {
                        Consolidado = consol.Key.ToString(),
                        Proyecto = ProyectoTemp,
                        Cuenta = CuentaTemp,
                        SubCuenta = SubCuentaTemp,
                        Clientes = Clientess
                    });
                }
                return mensaje;
            }//Try
            catch (Exception msj)
            {
                return mensaje = msj.Message;
            }

        }//AdminPAq

    }//PaymentModel

    public class ConceptosTemp
    {
        public string Consolidado { get; set; }
        public List<string> Proyecto { get; set; }
        public List<string> Cuenta { get; set; }
        public List<string> SubCuenta { get; set; }
        public List<string> Clientes { get; set; }
    }
}