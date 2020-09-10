appPago.controller('ProgramacionController', ['$scope', '$mdSidenav', '$mdMedia', '$timeout', '$location', '$mdDialog', '$mdStepper', '$timeout', '$filter', '$q', '$log', '$window', 'ConsolidadoListas', 'toastr', 'PagosPendientes', '$timeout', 'GuardarPago', '$mdToast', 'LoginOut', function ($scope, $mdSidenav, $mdMedia, $timeout, $location, $mdDialog, $mdStepper, $timeout, $filter, $q, $log, $window, ConsolidadoListas, toastr, PagosPendientes, $timeout, GuardarPago, $mdToast, LoginOut) {

    //Variable para ng-model
    var ctrl = this;
    //Referencia a Forms
    ctrl.formConcept;
    ctrl.formGen;
   

    $scope.PagoNuevo = {
        ID: 0,
        ID_Usuario: 0,
        Beneficiario: '',
        Razon: '',
        Autorizo: '',
        Solicito: '',
        FechaDePago: new Date(moment().day(12)),
        FechaSolicitud: new Date(),
        Programacion: 'PROGRAMADO',
        FormaPago: '',
        folio: '',
        Observaciones: '',
        HoraSolicitud: '',
        Eliminado: '',
        FechaEliminado: '',
        CategoriaNP: '',
        ResponsableNP: '',
        Conceptos: '',
        MontoT: 0.0,
        MovInt: false
    };

    $scope.Conceptos = {
        ID: '',
        Proyecto: '',
        Cuenta: '',
        Subcuenta: '',
        Concepto: '',
        Monto: 0.0
    };
    //Autocompletar CtaBancarios
    $scope.isDisabledAutoCompleteRazon = false;
    //
    $scope.FechaImpuestoNomina;
    $scope.listaConceptos = [];
    $scope.listaPagos = [];
    //NoProgramados
    $scope.tipos=[];
    //Variables de los autocomplete
    var allProyectos = [];
    var allCuentas = [];
    var allsubCuentas = [];
    var allBeneficiarios = [];
    var allRazon = [];
    var encargadosLista = [];

    $scope.formasDePago = ["EFECTIVO","CHEQUE","TRANSFERENCIA"];

    //Llenar consolidados
    $scope.RepoConsolidado = [];
    //$scope.Consolidados = ["GRUPO DESUR", "GMOCA", "INVESUR", "FUTURA"];
    $scope.Consolidados = ["GRUPO DESUR","GMOCA","FUTURA"];
    $scope.Consolidado = "GRUPO DESUR";
    $scope.RopositorioConsolidado = {};

    //Variables 
    $scope.razonSocial = [];
    $scope.fecha = new Date();
    $scope.NoPagosPendientes = '0';
    //Valores de No programados
    $scope.Deptos = []
    $scope.responsableJP = [];
    $scope.Director = ['Jorge Montalvo', 'Miguel Angel Vales', 'Raul Montalvo', 'Mauricio Montalvo', 'Alvaro Camacho', 'Eduardo Vales'];
    //Default seleccio uno raioButton del grupo de radioButtons de NO proegramados
    $scope.NoNpRequerido = false;
    $scope.JefeResponsable = { responsable: '' };
    $scope.TempPuesto = { puesto: '' };
    $scope.DeptoResponsable = '';
    $scope.DirectorResponsable = '';
    $scope.ExternoResponsable = '';
    $scope.grupoBtn = { seleccion: 1 };
    $scope.ProgramaEnJueves = false;
    $scope.CerrarSesion = function () {
        LoginOut.requerir().then(function (response) {
            if (response.data.success != false) {
                console.log("Se cerro la sesion");
                window.location.pathname = 'Login/Login';
            }
            else {
                //toastr.error(response.data.response, 'Error');
                console.log(response.status + ":ERROR:" + response.statusText);
            }
        });
    }

    //Obtener Datos del Servidor
    ConsolidadoListas.requerir($scope.Consolidado).then(function (response) {
        console.log(response.data);
        if (response.data.success != false) {
           
            //$scope.RepositorioConsolidado = response.data;
            angular.forEach(response.data.Departamentos, function (value, key) {
                $scope.Deptos.push(value.Text);
            });
            angular.forEach(response.data.Razon, function (value, key) {
                $scope.razonSocial.push(value.Text);
            });

            if (response.data.ProgramaJueves)
            {
                $scope.ProgramaEnJueves = true;
                //console.log($scope.ProgramaEnJueves);
            }

            $scope.JefeResponsable.responsable = response.data.UsuarioNombre;

            //$scope.RepoConsolidado = response.data.Consolidados;
            $scope.RepoConsolidado = Object.assign({}, response.data.Consolidados);
            //Asigna el Proyecto y la carga al AutoComplete input
            allProyectos = response.data.Consolidados[0].Proyecto;
            ctrl.proys = loadAll();
            //Asigna la Cuenta y la carga al AutoComplete input
            allCuentas = response.data.Consolidados[0].Cuenta;
            ctrl.cuentas = loadAll2();
            //Asigna la Subcuenta y la carga al AutoComplete input
            allsubCuentas = response.data.Consolidados[0].SubCuenta;
            ctrl.subcuentas = loadAll3();
            //Asigna la lista de Encargados
            encargadosLista = response.data.EncargadosLista;
            ctrl.encargados = loadAll4();
            //Asigna la lista de Beneficiario
            allBeneficiarios = response.data.Consolidados[0].Clientes;
            ctrl.Beneficiarios = loadAll5();
            //Asigna la lista de Beneficiario
            ////allRazon = response.data.Razon;
            allRazon = response.data.Razon;
            ctrl.Razon = loadAll6();
        }
        else {
            //toastr.error(response.data.response, 'Error');
            console.log(response.status + ":ERROR:");
            console.log(response.responseText);
        }
        $scope.BtnConsolidado = false;
    });

    //Variable para que rote el btn de busqueda de consolidado
    $scope.BtnConsolidado = false;

    //Cambia el consolidado y vuelve a llenar los AutoComplete
    $scope.RequirirConsolidado = function () {
        ctrl.formConcept.AutoProyecto.$setUntouched();
        ctrl.formConcept.AutoCuenta.$setUntouched();
        ctrl.formConcept.AutoSubCuenta.$setUntouched();
        //ctrl.fomrConcept.concep.$setUntouched();
        ctrl.formConcept.mont.$setUntouched();
        ctrl.searchText = "";
        ctrl.searchText2 = "";
        ctrl.searchText3 = "";
        ctrl.searchText4 = "";

        $scope.isDisabledAutoComplete = true;
        $scope.BtnConsolidado = true;

        switch ($scope.Consolidado) {
            case "GRUPO DESUR":
                //Asigna el Proyecto y la carga al AutoComplete input
                allProyectos = $scope.RepoConsolidado[0].Proyecto;
                ctrl.proys = loadAll();
                //Asigna la Cuenta y la carga al AutoComplete input
                allCuentas = $scope.RepoConsolidado[0].Cuenta;
                ctrl.cuentas = loadAll2();
                //Asigna la Subcuenta y la carga al AutoComplete input
                allsubCuentas = $scope.RepoConsolidado[0].SubCuenta;
                ctrl.subcuentas = loadAll3();
                break;
            case "GMOCA":
                //Asigna el Proyecto y la carga al AutoComplete input
                allProyectos = $scope.RepoConsolidado[1].Proyecto;
                ctrl.proys = loadAll();
                //Asigna la Cuenta y la carga al AutoComplete input
                allCuentas = $scope.RepoConsolidado[1].Cuenta;
                ctrl.cuentas = loadAll2();
                //Asigna la Subcuenta y la carga al AutoComplete input
                allsubCuentas = $scope.RepoConsolidado[1].SubCuenta;
                ctrl.subcuentas = loadAll3();
                break;
            case "FUTURA":
                //Asigna el Proyecto y la carga al AutoComplete input
                allProyectos = $scope.RepoConsolidado[2].Proyecto;
                ctrl.proys = loadAll();
                //Asigna la Cuenta y la carga al AutoComplete input
                allCuentas = $scope.RepoConsolidado[2].Cuenta;
                ctrl.cuentas = loadAll2();
                //Asigna la Subcuenta y la carga al AutoComplete input
                allsubCuentas = $scope.RepoConsolidado[2].SubCuenta;
                ctrl.subcuentas = loadAll3();
                break;
            case "INVESUR":
                //Asigna el Proyecto y la carga al AutoComplete input
                allProyectos = $scope.RepoConsolidado[3].Proyecto;
                ctrl.proys = loadAll();
                //Asigna la Cuenta y la carga al AutoComplete input
                allCuentas = $scope.RepoConsolidado[3].Cuenta;
                ctrl.cuentas = loadAll2();
                //Asigna la Subcuenta y la carga al AutoComplete input
                allsubCuentas = $scope.RepoConsolidado[3].SubCuenta;
                ctrl.subcuentas = loadAll3();
                break;
        }
        $timeout(function () {
            $scope.BtnConsolidado = false;
            $scope.isDisabledAutoComplete = false;
        }, 2000);

    }

    //Valores Defaults
    function ValDefaultsCampos() {

        $scope.PagoNuevo.ID = 0;
        $scope.PagoNuevo.ID_Usuario = 0;
        $scope.PagoNuevo.Beneficiario = '';
        $scope.PagoNuevo.Razon = '';
        $scope.PagoNuevo.Autorizo = '';
        $scope.PagoNuevo.Solicito = '';
        $scope.PagoNuevo.FechaDePago = new Date(moment().day(12));
        $scope.PagoNuevo.FechaSolicitud = new Date();
        $scope.PagoNuevo.Programacion = 'PROGRAMADO';
        $scope.PagoNuevo.FormaPago = '';
        $scope.PagoNuevo.folio = '';
        $scope.PagoNuevo.Observaciones = '';
        $scope.PagoNuevo.HoraSolicitud = '';
        $scope.PagoNuevo.Eliminado = '';
        $scope.PagoNuevo.FechaEliminado = '';
        $scope.PagoNuevo.CategoriaNP = '';
        $scope.PagoNuevo.ResponsableNP = '';
        $scope.PagoNuevo.Conceptos = '';
        $scope.PagoNuevo.MontoT = 0.0;
        $scope.PagoNuevo.MovInt = false;

        $scope.listaConceptos = [];
        //Reset Campos No Programados
        $scope.NoNpRequerido = false;
        //$scope.DeptoResponsable = '';
        //$scope.DirectorResponsable = '';
        $scope.ExternoResponsable = '';
        $scope.grupoBtn.seleccion = 1;

        $scope.Conceptos.ID = '';
        $scope.Conceptos.Proyecto = '';
        $scope.Conceptos.Cuenta = '';
        $scope.Conceptos.Subcuenta = '';
        $scope.Conceptos.Concepto = '';
        $scope.Conceptos.Monto = 0.0;

        ctrl.formGen.bene.$setUntouched();
        ctrl.formGen.Auto.$setUntouched();
        ctrl.formGen.Fpago.$setUntouched();
        ctrl.formGen.Rsocial.$setUntouched();
        ctrl.formGen.raidioBtn.$setUntouched();
        //ctrl.formGen.Jproy.$setUntouched();
        //ctrl.formGen.dept.$setUntouched();
        //ctrl.formGen.direct.$setUntouched();
        ctrl.formGen.Ext.$setUntouched();
        ctrl.formGen.Observ.$setUntouched();

        ctrl.searchText4 = "";
        ctrl.searchText3 = "";
        ctrl.searchText2 = "";
        ctrl.searchText = "";

        ctrl.formConcept.AutoProyecto.$setUntouched();
        ctrl.formConcept.AutoCuenta.$setUntouched();
        ctrl.formConcept.AutoSubCuenta.$setUntouched();
        ctrl.formConcept.concepag.$setUntouched();
        ctrl.formConcept.mont.$setUntouched();
        //ctrl.formGen.Jproy.$setUntouched();
        //ctrl.formGen.dept.$setUntouched();
        //ctrl.formGen.direct.$setUntouched();
        ctrl.formGen.Ext.$setUntouched();

        //ResetRadio Buttom
        angular.copy($scope.tiposDefault, $scope.tipos);
        $scope.selecteRadio.selected = 1;

        ctrl.formGen.AutEncargado.$setUntouched();        
    }

    $scope.showGuardarToast = function () {
        $mdToast.show(
            $mdToast.simple()
                .textContent('Guardado pago con exio!')
                .parent(document.querySelectorAll('#FormPagos'))
                .position('top right')
                .hideDelay(1500))
            .then(function () {
                $log.log('Toast dismissed.');
            }).catch(function () {
                $log.log('Toast failed or was forced to close early by another toast.');
            });
    };

    $scope.addConcepto = function () {
        //console.log($scope.listaConceptos.length);

        $scope.Conceptos.ID = $scope.listaConceptos.length;

       /* console.log($scope.Conceptos.ID)*/;
        $scope.listaConceptos.push(
            {
                'ID': $scope.Conceptos.ID,
                'Proyecto': $scope.Conceptos.Proyecto,
                'Cuenta': $scope.Conceptos.Cuenta,
                'Subcuenta': $scope.Conceptos.Subcuenta,
                'Concepto': $scope.Conceptos.Concepto,
                'Monto': $scope.Conceptos.Monto
            }
        );

    };

    $scope.GuardarLista = function () {

        if ($scope.listaPagos.length > 0) {
            $mdDialog.show({
                multiple: true,
                controller: function () {
                    $scope.CerrarGuardarProgress = function () {
                        $mdDialog.hide();
                    }
                },
                template: '<md-dialog class="confirm" style="min-width: 140px !important;padding-top: 20px; min-height: 140px !important;"> <div layout="column"  layout-sm="column" layout-align="space-around"> <md-progress-circular style="margin-left:35px;" md-mode="indeterminate" md-diameter="70"></md-progress-circular><h4 style="margin-left:30px;">Guardando...</h4></div></md-dialog>'
            })
            GuardarPago.requerir($scope.listaPagos[0]).then(function (response) {
               
                if (response.data.success != false && response.data.cod == 0) {
                    $scope.listaPagos = [];
                    $scope.CerrarLista();
                    $scope.CerrarGuardarProgress();
                    $scope.showGuardarToast();
                    //ValDefaultsCampos();
                   
                    //document.getElementById('NoPagosPendientes').innerHTML = '';
                    //document.getElementsByClassName('mfb-component__button--main')[0].style.backgroundColor = '#009688';
                    $timeout(function () { $window.location.href = '/'; }, 1600);
                   
                }
                else {
                    console.log(response.status + ":ERROR:" + response.responseText);
                    //console.log(response.status + ":ERROR:" + response.statusText);
                    alert("Problema al guardar en el servidor");
                    $scope.listaPagos = [];
                    $scope.CerrarLista();
                    $scope.CerrarGuardarProgress();
                    //toastr.error(response.data.response, 'Error');
                    
                }
            });
        }
        else {
            alert("No hay pagos para enviar!");
        }
    }

    //Agregar Pago
    $scope.PreGuardarPago = function () {

        if ($scope.listaConceptos.length > 0) {

            if (ctrl.formGen.$invalid) {
                angular.forEach(ctrl.formGen.$error, function (field) {
                    angular.forEach(field, function (errorField) {
                        errorField.$setTouched();
                        console.log(errorField);
                    })
                });
            }
            else {
                try {

                    $scope.PagoNuevo.Conceptos = $scope.listaConceptos;
                    $scope.PagoNuevo.ID = $scope.listaPagos.length + 1;
                    $scope.PagoNuevo.MontoT = $scope.MontoTotal;

                    if ($scope.NoNpRequerido) {
                        switch ($scope.grupoBtn.seleccion) {
                            case 1:
                                //$scope.PagoNuevo.CategoriaNP = 'Jefe del Proyecto';
                                $scope.PagoNuevo.ResponsableNP = $scope.JefeResponsable.responsable;
                                $scope.PagoNuevo.CategoriaNP = $scope.TempPuesto.puesto
                                break;
                            case 2:
                                $scope.PagoNuevo.CategoriaNP = 'Departamento';
                                $scope.PagoNuevo.ResponsableNP = $scope.DeptoResponsable;
                                break;
                            case 3:
                                $scope.PagoNuevo.CategoriaNP = 'Director';
                                $scope.PagoNuevo.ResponsableNP = $scope.DirectorResponsable;
                                break;
                            case 4:
                                $scope.PagoNuevo.CategoriaNP = 'Responsable Externo';
                                $scope.PagoNuevo.ResponsableNP = $scope.ExternoResponsable;
                                break;
                        }
                    }
                    //Agrega ala lista los pagos
                    $scope.listaPagos.push(angular.copy($scope.PagoNuevo));
                   
                    $scope.VerPagosLista()
                    //Modifican el Btn Float para mostrar los pagos pendientes a enviar
                    //document.getElementById('NoPagosPendientes').innerHTML = $scope.listaPagos.length.toString()
                    //document.getElementsByClassName('mfb-component__button--main')[0].style.backgroundColor = '#F44336';
     
                }
                catch (err) {
                    console.log(err.message);
                }
            }
        }
        else {
            angular.forEach(ctrl.formConcept.$error, function (field) {
                angular.forEach(field, function (errorField) {
                    errorField.$setTouched();
                })
            });
        }

    };

    //Variables para valor de los campos
    $scope.MontoTotal = 0.0;

    //Watchers
    $scope.$watchCollection('listaConceptos', function () {
        var Total = 0.0;
       
        angular.forEach($scope.listaConceptos, function (value, key) {
            Total += value.Monto;

        });
        $scope.MontoTotal = Total;
    })

   
    //Reglas si seleccion Efectivo o Cuenta Banaria
    $scope.selectChangedFormaPago = function () {
        if ($scope.PagoNuevo.FormaPago == 'EFECTIVO') {
            //$scope.PagoNuevo.Razon = 'NINGUNO::S/V';
            ctrl.selectedItem6 = {
                value: "NINGUNO::S/V",
                Cuenta: "NINGUNO",
                Banco: "NINGUNO",
                CtaBancaria: "S/V"
            }
            //$scope.isDisabledAutoCompleteRazon = true;
        }
        else
        { /*$scope.isDisabledAutoCompleteRazon = false;*/ }
    }

    $scope.selectChangedRazon = function () {
        if ($scope.PagoNuevo.Razon == 'NINGUNO::S/V') {
            $scope.PagoNuevo.FormaPago = 'EFECTIVO';
        }
        else if ($scope.PagoNuevo.FormaPago == 'EFECTIVO')
        {
            $scope.PagoNuevo.FormaPago ='';
        }
    }

    //EliminarConcepto
    $scope.EliminarConcepto = function (id) {
        var index = $scope.listaConceptos.map(function (e) { return e.ID; }).indexOf(id)
        $scope.listaConceptos.splice(index, 1);
    };


    $scope.QuitarPago = function (id) {
        var index = $scope.listaPagos.map(function (e) { return e.ID; }).indexOf(id);
        $scope.listaPagos.splice(index, 1);

        document.getElementById('NoPagosPendientes').innerHTML = $scope.listaPagos.length == 0 ? '' : $scope.listaPagos.length;
        document.getElementsByClassName('mfb-component__button--main')[0].style.backgroundColor = $scope.listaPagos.length == 0 ? '#009688':'#F44336';
    }

    //Llena la tabla de cuantos tipos de pago se pueden capturar
    $scope.tiposDefault = [{
        'id': 1,
        'title': "PROGRAMADO",
        'fecha': new Date(moment().day(12)),
        'minDate': new Date()
    }, {
        'id': 2,
        'title': "CAJA CHICA",
        'fecha': new Date(moment().day(10)),
        'minDate': new Date()
    }, {
        'id': 3,
        'title': "ESPECIAL",
        'fecha': new Date(moment().day(4)),
        'minDate': new Date()
    }, {
        'id': 4,
        'title': "IMPUESTO NOMINA",
        'fecha': (function () {
            var tempDia = new Date(moment().date(10));
            if (moment.weekdays(10) == "Saturday") {
                tempDia = new Date(moment().date(12));
            }

            if (moment.weekdays(10) == "Sunday") {
                tempDia = new Date(moment().date(11));
            }
            //*****************************************************//
            if (new Date().getDate() > tempDia) {
                tempDia.moment.add(1, 'months');
                $scope.FechaImpuestoNomina = tempDia;
                return tempDia;
            }
            $scope.FechaImpuestoNomina = tempDia;
            return tempDia;
        })(),
        'minDate': new Date()
    }, {
        'id': 5,
        'title': "IMSS",
        'fecha': (function () {
            if (new Date().getDate() > 17) {
                return new Date(moment().add(1, 'months').date(17));
            }
            else {
                return new Date(moment().date(17))
            }
        })(),
        'minDate': new Date()
    }, {
        'id': 6,
        'title': "IMPUESTO MENSUAL",
        'fecha': (function () {
            if (new Date().getDate() > 14) {
                return new Date(moment().add(1, 'months').date(14));
            }
            else {
                return new Date(moment().date(14))
            }
        })(),
        'minDate': new Date()
    }, {
        'id': 7,
        'title': "NOMINA ADMON",
        'fecha': new Date(moment().add(2,'days')),
        'minDate': new Date()
    }, {
        'id': 8,
        'title': "NOMINA PLAYA",
        'fecha': new Date(moment().add(2, 'days')),
        'minDate': new Date()
    }];
    //Crea una copia de los valores para usarlo en la inteface, esto con la finalidad de resetearlos luego
    angular.copy($scope.tiposDefault, $scope.tipos);
   
    //HAy que poner el id en un objeto o no se actualizara 
    //correctamento el radio buttom seleccionado del Tipo de pago a requerir
    $scope.selecteRadio = { selected: 1 };

    //Variable del NP
    $scope.NoNpRequerido = false;
    //Oculta los campos del np cuando cambia la seleccion
    $scope.ResetNoProgramadoFields = function ()
    {
        //ctrl.selectedItem4 = null;
        ctrl.searchText4 = "";
        ctrl.formGen.AutoEncargado.$setUntouched();
        $scope.NoNpRequerido = false;
    }
    $scope.ValidarRadioCambio = function ()
    {
        if ($scope.selecteRadio.selected == 3)
        {
            $scope.CalcularDatosFecha();
        }
        else
        {
            $scope.ResetNoProgramadoFields();
        }
    }

    $scope.VerificarDatosGen = function () {
        if (ctrl.formConcept.$invalid) {
            angular.forEach(ctrl.formConcept.$error, function (field) {
                angular.forEach(field, function (errorField) {
                    errorField.$setTouched();
                })
            });
        }
        else
        {
            $scope.addConcepto();
        }
    }

    $scope.BorrarContenidoConceptos = function () {
        $scope.Conceptos = {
            ID: '',
            Proyectos: '',
            Cuenta: '',
            Subcuenta: '',
            Concepto: '',
            Monto: 0.0
        };
        ctrl.formConcept.AutoProyecto.$setUntouched();
        ctrl.formConcept.AutoCuenta.$setUntouched();
        ctrl.formConcept.AutoSubCuenta.$setUntouched();
      
        ctrl.formConcept.concepag.$setUntouched();
        ctrl.formConcept.mont.$setUntouched();
       
        //ctrl.selectedItem = null;
        ctrl.searchText = "";
        //ctrl.selectedItem2 = null;
        ctrl.searchText2 = "";
        //ctrl.selectedItem3 = null;
        ctrl.searchText3 = "";
    }

    $scope.CalcularDatosFecha = function () {
        //Establece como obliogatorio o no los campos de no programado
        $scope.NoNpRequerido = false;
        $scope.JefeResponsable.responsable = '';
        $scope.ExternoResponsable = '';

       $scope.TempPuesto.puesto = '';
            var Program = $filter('filter')($scope.tipos, { id: $scope.selecteRadio.selected })[0].title;
            var Fecha = $filter('filter')($scope.tipos, { id: $scope.selecteRadio.selected })[0].fecha;
 
            var SiguienteViernes = moment().day(12);
            SiguienteViernes = SiguienteViernes.hour(0);
            SiguienteViernes = SiguienteViernes.minute(0);
            SiguienteViernes = SiguienteViernes.second(0);

            var SiguienteJueves = moment().day(11);
            SiguienteJueves = SiguienteJueves.hour(0);
            SiguienteJueves = SiguienteJueves.minute(0);
            SiguienteJueves = SiguienteJueves.second(0);

            var SiguienteMiercoles = moment().day(10);
            SiguienteMiercoles = SiguienteMiercoles.hour(0);
            SiguienteMiercoles = SiguienteMiercoles.minute(0);
            SiguienteMiercoles = SiguienteMiercoles.second(0);

            var currentJuevesAt13 = moment().day(4);
            currentJuevesAt13 = currentJuevesAt13.hour(13);
            currentJuevesAt13 = currentJuevesAt13.minute(0);
            currentJuevesAt13 = currentJuevesAt13.second(0);

            var SiguienteViernes2 = moment().day(5);

            var ProgramRule = $scope.ProgramaEnJueves ? new Date(SiguienteJueves): new Date(SiguienteViernes) 

            //console.log(currentJuevesAt13);
            ////console.log('Es fecha2' + angular.isDate(new Date(SiguienteViernes)));
            ////console.log(SiguienteViernes);
            //console.log(new Date(SiguienteViernes));
            //console.log(new Date(SiguienteJueves));
            switch (Program)
            {
                case "PROGRAMADO":
                    if (Fecha < ProgramRule)
                    {
                      
                        $scope.PagoNuevo.Programacion = "NO PROGRAMADO"
                        $scope.PagoNuevo.FechaDePago = Fecha
                        $scope.NoNpRequerido = true;
                    }
                    else
                    {
                       
                        $scope.PagoNuevo.Programacion = "PROGRAMADO"
                        $scope.PagoNuevo.FechaDePago = Fecha
                    }
                    break;
                case "CAJA CHICA":
                    if (new Date(moment().day(4)).getHours() > new Date(currentJuevesAt13)) {
                        $scope.PagoNuevo.Programacion = "CAJA CHICA NP"
                        $scope.PagoNuevo.FechaDePago = Fecha
                    }
                    else
                    {
                        if (Fecha < new Date(SiguienteMiercoles))
                        {
                            $scope.PagoNuevo.Programacion = "CAJA CHICA NP"
                            $scope.PagoNuevo.FechaDePago = Fecha
                            $scope.NoNpRequerido = true;
                        }
                        else
                        {
                            $scope.PagoNuevo.Programacion = "CAJA CHICA"
                            $scope.PagoNuevo.FechaDePago = Fecha
                        }
                    }
                    break;
                case "ESPECIAL":
                    if (new Date() >= new Date(currentJuevesAt13)) {
                        $scope.PagoNuevo.Programacion = "ESPECIAL NP"
                        $scope.PagoNuevo.FechaDePago = new Date(SiguienteViernes2);
                        $scope.NoNpRequerido = true;
                    }
                    else {
                        $scope.PagoNuevo.Programacion = "ESPECIAL"
                        $scope.PagoNuevo.FechaDePago = new Date(SiguienteViernes2);
                    }
                    break;
                case "IMPUESTO NOMINA":
                    if (Fecha.getDate() > $scope.FechaImpuestoNomina.getDate() ) {
                        $scope.PagoNuevo.Programacion = "IMPUESTO NOMINA NP"
                        $scope.PagoNuevo.FechaDePago = Fecha
                        $scope.NoNpRequerido = true;
                    }
                    else {
                        $scope.PagoNuevo.Programacion = "IMPUESTO NOMINA"
                        $scope.PagoNuevo.FechaDePago = Fecha
                    }
                    break;
                case "IMSS":
                    if (Fecha.getDate() > 17) {
                        $scope.PagoNuevo.Programacion = "IMSS NP"
                        $scope.PagoNuevo.FechaDePago = Fecha
                        $scope.NoNpRequerido = true;
                    }
                    else {
                        $scope.PagoNuevo.Programacion = "IMSS"
                        $scope.PagoNuevo.FechaDePago = Fecha
                    }
                    break;
                case "IMPUESTO MENSUAL":
                    if (Fecha.getDate() > 14) {
                        $scope.PagoNuevo.Programacion = "IMPUESTO MENSUAL NP"
                        $scope.PagoNuevo.FechaDePago = Fecha
                        $scope.NoNpRequerido = true;
                    }
                    else {
                        $scope.PagoNuevo.Programacion = "IMPUESTO MENSUAL"
                        $scope.PagoNuevo.FechaDePago = Fecha
                    }
                    break;
                case "NOMINA ADMON":
                    if ((Fecha.getDate() - new Date().getDate()) >= 2) {
                        //var dat = new Date();
                        //dat.setDate(dat.getDate() + 2);
                        $scope.PagoNuevo.Programacion = "NOMINA ADMON"
                        $scope.PagoNuevo.FechaDePago = Fecha
                    }
                    else
                    {
                        $scope.PagoNuevo.Programacion = "NOMINA ADMON NP"
                        $scope.PagoNuevo.FechaDePago = Fecha
                        $scope.NoNpRequerido = true;
                    }
                        break;
                case "NOMINA PLAYA":
                    if ((Fecha.getDate() - new Date().getDate()) >= 2)
                    {
                        //var dat = new Date();
                        //dat.setDate(dat.getDate() + 2);
                        $scope.PagoNuevo.Programacion = "NOMINA PLAYA"
                        $scope.PagoNuevo.FechaDePago = Fecha
                        
                    }
                    else
                    {
                        $scope.PagoNuevo.Programacion = "NOMINA PLAYA NP"
                        $scope.PagoNuevo.FechaDePago = Fecha
                        $scope.NoNpRequerido = true;
                    }
                        break;
            }

    }

    //Tablas de concepto
    $scope.selectedTable = [];
    $scope.query = {
        order: 'Concepto',
        limit: 10,
        page: 1
    };
    ctrl.simulateQuery = false;
    ctrl.isDisabled = false;

    //Auto Completar Proyecto
    ctrl.querySearch = querySearch;
    ctrl.selectedItemChange = selectedItemChange;
    ctrl.searchTextChange = searchTextChange;
    // ******************************
    // Internal methods
    // ******************************
    function querySearch(query) {
        var results = query ? ctrl.proys.filter(createFilterFor(query)) : ctrl.proys,
            deferred;
        if (ctrl.simulateQuery) {
            deferred = $q.defer();
            $timeout(function () { deferred.resolve(results); }, Math.random() * 1000, false);
            return deferred.promise;
        } else {
            return results;
        }
    }

    function searchTextChange(text) {
    }

    function selectedItemChange(item) {
        $scope.Conceptos.Proyecto = item.display;
        $log.info('Item changed to ' + JSON.stringify(item));
    }
    /* Build `states` list of key/value pairs */
    function loadAll() {
        return allProyectos.map(function (proy) {
            return {
                value: proy.toLowerCase(),
                display: proy.toUpperCase()
            };
        });
    }
    /* Create filter function for a query string */
    function createFilterFor(query) {
        var lowercaseQuery = angular.lowercase(query);

        return function filterFn(state) {
            return (state.value.includes(lowercaseQuery) == true);
        };

    }

    //Auto Completar Cuenta
    
    ctrl.querySearch2 = querySearch2;
    ctrl.selectedItemChange2 = selectedItemChange2;
    ctrl.searchTextChange2 = searchTextChange2;
    // ******************************
    // Internal methods
    // ******************************
    function querySearch2(query) {
        var results = query ? ctrl.cuentas.filter(createFilterFor2(query)) : ctrl.cuentas,
            deferred;
        if (ctrl.simulateQuery) {
            deferred = $q.defer();
            $timeout(function () { deferred.resolve(results); }, Math.random() * 1000, false);
            return deferred.promise;
        } else {
            return results;
        }
    }

    function searchTextChange2(text) {
    }

    function selectedItemChange2(item) {
        $scope.Conceptos.Cuenta = item.display;
        $log.info('Item changed to ' + JSON.stringify(item));
    }
    /* Build `cuentas` list of key/value pairs */
    function loadAll2() {
        return allCuentas.map(function (cuenta) {
            return {
                value: cuenta.toLowerCase(),
                display: cuenta.toUpperCase()
            };
        });
    }
    /* Create filter function for a query string */
    function createFilterFor2(query) {
        var lowercaseQuery = angular.lowercase(query);

        return function filterFn(cuenta) {
            //return (cuenta.value.indexOf(lowercaseQuery) === 0);
            return (cuenta.value.includes(lowercaseQuery) == true);
        };

    }

    //Auto Completar SubCuenta
    ctrl.querySearch3 = querySearch3;
    ctrl.selectedItemChange3 = selectedItemChange3;
    ctrl.searchTextChange3 = searchTextChange3;
    // ******************************
    // Internal methods
    // ******************************
    function querySearch3(query) {
        var results = query ? ctrl.subcuentas.filter(createFilterFor3(query)) : ctrl.subcuentas,
            deferred;
        if (ctrl.simulateQuery) {
            deferred = $q.defer();
            $timeout(function () { deferred.resolve(results); }, Math.random() * 1000, false);
            return deferred.promise;
        } else {
            return results;
        }
    }

    function searchTextChange3(text) {}

    function selectedItemChange3(item) {
        $scope.Conceptos.Subcuenta = item.display;
        $log.info('Item changed to ' + JSON.stringify(item));
    }
    /* Build `cuentas` list of key/value pairs */
    function loadAll3() {
        return allsubCuentas.map(function (subcuenta) {
            return {
                value: subcuenta.toLowerCase(),
                display: subcuenta.toUpperCase()
            };
        });
    }
    /* Create filter function for a query string */
    function createFilterFor3(query) {
        var lowercaseQuery = angular.lowercase(query);
        return function filterFn(subcuenta) {
            //return (subcuenta.value.indexOf(lowercaseQuery) === 0);
            return (subcuenta.value.includes(lowercaseQuery) == true);
        };
    }

    //Auto Completar Encargados
    ctrl.querySearch4 = querySearch4;
    ctrl.selectedItemChange4 = selectedItemChange4;
    ctrl.searchTextChange4 = searchTextChange4;
    // ******************************
    // Internal methods
    // ******************************
    function querySearch4(query) {
        var results = query ? ctrl.encargados.filter(createFilterFor4(query)) : ctrl.encargados,
            deferred;
        if (ctrl.simulateQuery) {
            deferred = $q.defer();
            $timeout(function () { deferred.resolve(results); }, Math.random() * 1000, false);
            return deferred.promise;
        } else {
            return results;
        }
    }

    function searchTextChange4(text) { }

    function selectedItemChange4(item) {
        $scope.JefeResponsable.responsable = item.value;
        $scope.TempPuesto.puesto = item.puesto;
        //$log.info('Item changed to ' + JSON.stringify(item));
    }
    /* Build `cuentas` list of key/value pairs */
    function loadAll4() {
        return encargadosLista.map(function (encargado) {
            return {
                value: encargado.Value.toUpperCase(),
                puesto: encargado.Text.toUpperCase()
            };
        });
    }
    /* Create filter function for a query string */
    function createFilterFor4(query) {
        var uppercaseQuery = angular.uppercase(query);
        return function filterFn(encargado) {
            return (encargado.value.indexOf(uppercaseQuery) === 0);
        };
    }

    //Auto Completar Clientes
    ctrl.querySearch5 = querySearch5;
    ctrl.selectedItemChange5 = selectedItemChange5;
    ctrl.searchTextChange5 = searchTextChange5;
    // ******************************
    // Internal methods
    // ******************************
    function querySearch5(query) {
        var results = query ? ctrl.Beneficiarios.filter(createFilterFor5(query)) : ctrl.Beneficiarios,
            deferred;
        if (ctrl.simulateQuery) {
            deferred = $q.defer();
            $timeout(function () { deferred.resolve(results); }, Math.random() * 1000, false);
            return deferred.promise;
        } else {
            return results;
        }
    }

    function searchTextChange5(text) { }

    function selectedItemChange5(item) {
        //$scope.JefeResponsable.responsable = item.value;
        //$scope.TempPuesto.puesto = item.puesto;
        $scope.PagoNuevo.Beneficiario = item.nombre;
        $log.info('Item changed to ' + JSON.stringify(item));
    }
    /* Build `cuentas` list of key/value pairs */
    function loadAll5() {
        return allBeneficiarios.map(function (bene) {
            return {
                value: bene.toUpperCase(),
                nombre: bene.toUpperCase()
            };
        });
    }
    /* Create filter function for a query string */
    function createFilterFor5(query) {
        var uppercaseQuery = angular.uppercase(query);

        return function filterFn(bene) {
            return (bene.value.includes(uppercaseQuery) == true);
        };
    }

    //Auto Completar Razon
    ctrl.querySearch6 = querySearch6;
    ctrl.selectedItemChange6 = selectedItemChange6;
    ctrl.searchTextChange6 = searchTextChange6;
    // ******************************
    // Internal methods
    // ******************************
    function querySearch6(query) {
        var results = query ? ctrl.Razon.filter(createFilterFor6(query)) : ctrl.Razon,
            deferred;
        if (ctrl.simulateQuery) {
            deferred = $q.defer();
            $timeout(function () { deferred.resolve(results); }, Math.random() * 1000, false);
            return deferred.promise;
        } else {
            return results;
        }
    }

    function searchTextChange6(text) { }

    function selectedItemChange6(item) {
        //$scope.JefeResponsable.responsable = item.value;
        //$scope.TempPuesto.puesto = item.puesto;
        $scope.PagoNuevo.Razon = item.Cuenta + '::' + item.CtaBancaria;
        $scope.selectChangedRazon(); 
        $log.info('Item changed to ' + JSON.stringify(item));
    }

    function loadAll6() {
        return allRazon.map(function (itm) {
            return {
                value: itm.Cuenta + '::' + itm.CtaBancaria,
                Cuenta:itm.Cuenta,
                Banco: itm.Banco,
                CtaBancaria: itm.CtaBancaria
            };
        });
    }

    function createFilterFor6(query) {
        var uppercaseQuery = angular.uppercase(query);

        return function filterFn(raz) {
            return (raz.Cuenta.includes(uppercaseQuery) == true) | (raz.CtaBancaria.includes(uppercaseQuery) == true) ;
        };
    }


    // Prevenir cerrar la pagina
    //$window.onbeforeunload = function (event) {
    //    ////Check if there was any change, if no changes, then simply let the user leave
    //    if ($scope.listaPagos.lenght == 0) {
    //        return;
    //    }

    //    var message = 'Es posible que los cambios que implementaste no se puedan guardar';
    //    if (typeof event == 'undefined') {
    //        event = $window.event;
    //    }
    //    if (event) {
    //        event.returnValue = message;
    //    }
    //    return message;
    //}
    //Dialog No Programados


    $scope.VerPagosLista = function () {
        PagosPendientes.asignar($scope.listaPagos);
        var padre = document.getElementById("CuerpoPagos");
        $mdDialog.show({
            controller: 'VerPagosController',
            //templateUrl: '/Main/ResponsableNp',
            template:'<div layout="column"  style="width:890px;height:auto;background-color:#ECEFF1 !important" ng-controller="VerPagosController as ctrl">'+
            '<md-toolbar style="background-color:#1565C0">' +
            '    <div class="md-toolbar-tools">' +
            '        <h4>Revisa el pago antes de enviar</h4>' +
            '        <span flex></span>' +
            '        <md-button class="md-icon-button" aria-label="Cloce" ng-click="CerrarLista()">' +
            '            <ng-md-icon icon="clear" style="fill:ghostwhite" size="24"></ng-md-icon>' +
            '        </md-button>' +
            '    </div>' +
            '</md-toolbar>' +
            '<md-content layout-padding style="background-color:#ECEFF1 !important; min-height:280px;max-height:80%">' +
            '<v-accordion class="v-accordion-material">' +
            '<v-pane id="{{ ::pane.ID }}" ng-repeat="pago in listaPagos" expanded disabled>' +
            '<v-pane-header id="{{ ::pago.ID }}-header" aria-controls="{{ ::pago.ID }}-content">' +
            '<div layout="row" layout-fill >' +
            ' <md-button style="margin-top:3px;margin-left:-15px; !important" class="md-icon-button" aria-label="Cloce" ng-click="QuitarPago(pago.ID)">'+
            '<ng-md-icon icon="cancel" style="fill:#607D8B" size="24" ></ng-md-icon>' +
            '</md-button >'+
            '<div flex="80"><strong>Beneficiario:</strong> {{ ::pago.Beneficiario }}</div>' +
            '<div flex="20" style="font-size:smaller;font-family:sans-serif"><strong>${{::pago.MontoT | number: 2}}</strong></div>' +
            '</div>' +
            '</v-pane-header>' +
            '<v-pane-content id="{{ ::pane.ID }}-content" aria-labelledby="{{ ::pane.ID }}-header">' +
            '<div layout-padding>' +
            '<div layout="row">' +
            '<div layout="column" flex="30">' +
            '                                  <span class="md-caption"><strong>Fecha de pago:</strong></span>' +
            '                                 <span class="md-caption">{{ pago.FechaDePago | amDateFormat:\'DD/MM/YYYY\'}}</span>'+
            '                             </div>' +
            '                             <div layout="column" flex="30">' +
            '                                 <span class="md-caption"><strong>Autorizo:</strong></span>' +
            '                                 <span class="md-caption">{{ pago.Autorizo | uppercase }}</span>' +
            '                             </div>' +
            '                             <div layout="column" flex="30">' +
            '                                 <span class="md-caption"><strong>Forma de pago:</strong></span>' +
            '                                 <span class="md-caption">{{ pago.FormaPago | uppercase }}</span>' +
            '                             </div>' +
            '                         </div>' +
            '                         <md-divider></md-divider>' +
            '                        <div layout="row" layout-align="space-between center">' +
            '                             <div layout="column" flex="70">' +
            '                                 <span class="md-caption"><strong>Razon:</strong></span>' +
            '                                 <span class="md-caption" md-truncate>{{ pago.Razon | uppercase }}</span>' +
            '                             </div>' +
            '                             <div layout="column" flex="30">' +
            '                                 <span class="md-caption"><strong>Pago:</strong></span>' +
            '                                 <span class="md-caption">{{ pago.Programacion | uppercase }}</span>' +
            '                             </div>' +
            '                         </div>' +
            '                         <md-divider ng-show="pago.CategoriaNpag.length > 0"></md-divider>' +
            '                         <div layout="row" layout-align="space-between center" ng-show="pago.CategoriaNpag.length > 0">' +
            '                             <div layout="column" flex="45">' +
            '                                 <span class="md-caption"><strong>Responsable del NP:</strong></span>' +
            '                                 <span class="md-caption" md-truncate>{{ pago.CategoriaNP | uppercase }}</span>' +
            '                             </div>' +
            '                            <div layout="column" flex="45">' +
            '                                 <span class="md-caption"><strong>Nombre del responsable de NP:</strong></span>' +
            '                                 <span class="md-caption">{{ pago.ResponsableNP | uppercase }}</span>' +
            '                             </div>' +
            '                         </div>' +
            '                        <md-divider></md-divider>' +
            '                         <div layout="row" layout-align="start center">' +
            '                                 <span class="md-caption"><strong>Es un movimiento interno:</strong> {{pago.MovInt === true ?\'Si\': \'No\'}}</span>' +
            '                        </div>' +
            '                         <md-divider></md-divider>' +
            '                         <div layout="row" layout-align="start center">' +
            '                             <div layout="column" flex="95">' +
            '                                 <span class="md-caption"><strong>Observaciones:</strong></span>' +
            '                                <p class="md-caption" md-truncate>{{ pago.Observaciones | uppercase }}</p>' +
            '                            </div>' +
            '                        </div>' +
            '                        <md-divider></md-divider>' +
            '                    </div>' +
            '                    <md-list>' +
            '                        <md-list-item class="md-3-line" ng-repeat="concept in pago.Conceptos">' +
            '                            <div class="md-list-item-text" layout-padding>' +
            '                                <div style="border-left:solid 5px #01579B;background-color:#E3F2FD" layout-padding>' +
            '                                    <strong>Concepto:</strong>' +
            '                                    <p style="font-style:italic">{{ concept.Concepto }}</p>' +
            '                                </div>' +
            '                                <div layout="row" style="border:dotted 1px 0px 1px #ECEFF1">' +
            '                                    <div flex="30">' +
            '                                       <h4>Proyecto:</h4>' +
            '                                       <p md-truncate>{{ concept.Proyecto }}</p>' +
            '                                   </div>' +
            '                                   <div flex="30">' +
            '                                       <h4>Cuenta:</h4>' +
            '                                       <p md-truncate>{{ concept.Cuenta }}</p>' +
            '                                   </div>' +
            '                                   <div flex="30">' +
            '                                      <h4>SubCuenta:</h4>' +
            '                                      <p md-truncate>{{ concept.Subcuenta }}</p>' +
            '                                  </div>' +
            '                              </div>' +
            '                              <h4 style="border-left:solid 5px #01579B;background-color:#ECEFF1">$ {{ concept.Monto | number: 2}}</h4>' +
            '                          </div>' +
            '                          <md-divider></md-divider>' +
            '                      </md-list-item>' +
            '                  </md-list>' +
            '              </v-pane-content>' +
            '          </v-pane>' +
            '      </v-accordion>' +
            '  </md-content>' +
            '  <md-divider></md-divider>' +
            '<md-toolbar style="background-color:#CFD8DC">' +
            '    <div class="md-toolbar-tools">' +
            '        <span flex></span>' +
            '        <md-button  class="md-primary" ng-click="GuardarLista()">De acuerdo</md-button>' +
            '    </div>' +
            '</md-toolbar>' +
           ' </div>',
            parent: angular.element(padre),
            className: 'ngdialog-theme-plain',
            scope: $scope.$new(), 
            clickOutsideToClose: true,
            fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
        }).then(function (answer) {
        }, function () {
        
        });
    }
    $scope.CerrarLista = function () {
        $scope.listaPagos = [];
        $mdDialog.cancel();
    }
    $scope.CerrarGuardarProgress;
   

    $scope.BusquedaPagos = function () {
        var padre = document.getElementById("CuerpoPagos");
        $mdDialog.show({
            controller: 'BusquedaController',
            templateUrl: '/Main/BusquedaVista',
            parent: angular.element(padre),
            className: 'ngdialog-theme-plain',
            scope: $scope.$new(),
            clickOutsideToClose: false,
            fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
        }).then(function (answer) {
        }, function () {
        });
    }

    $scope.Facturas = function () {
        var padre = document.getElementById("CuerpoPagos");
        $mdDialog.show({
            controller: 'FacturaController',
            templateUrl: '/Main/FacturaVista',
            parent: angular.element(padre),
            className: 'ngdialog-theme-plain',
            scope: $scope.$new(),
            clickOutsideToClose: false,
            fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
        }).then(function (answer) {
        }, function () {
        });
    }

}]);

appPago.controller('VerPagosController', ['$scope', '$mdSidenav', '$mdMedia', '$timeout', '$location', '$mdDialog', '$mdStepper', '$timeout', '$filter', '$q', '$log', '$window', 'PagosPendientes', function ($scope, $mdSidenav, $mdMedia, $timeout, $location, $mdDialog, $mdStepper, $timeout, $filter, $q, $log, $window, PagosPendientes) {
    $scope.listaPagos = PagosPendientes.requerir()
    //console.log("Prueba NP: "+$scope.listaPagos[0].CategoriaNP);
}]);







