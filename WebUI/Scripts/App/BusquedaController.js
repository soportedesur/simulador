appPago.controller('BusquedaController', ['$scope', '$mdSidenav', '$mdMedia', '$timeout', '$location', '$mdDialog', '$mdStepper', '$timeout', '$filter', '$q', '$log', '$window', 'NgTableParams', 'PagosLista', 'BusquedaDetalles', 'Reenviar', 'Eliminar', function ($scope, $mdSidenav, $mdMedia, $timeout, $location, $mdDialog, $mdStepper, $timeout, $filter, $q, $log, $window, NgTableParams, PagosLista, BusquedaDetalles, Reenviar, Eliminar) {
    var selft = this;
    $scope.dataset = [];
    $scope.TipoProgramado = [{ id: '', title: 'AMBOS' }, { id: 'SI', title: 'SI' }, { id: 'NO', title: 'NO' }]

    $scope.tableParams = {};

    //Lista de años del 2016 hasta el presente
    $scope.YearBusqueda = (new Date()).getFullYear();

    var yearList = 2016;
    var yearFinal = (new Date()).getFullYear();
    var yearStop = yearFinal - yearList;
    var rangeYear = [];
    rangeYear.push(yearList);
    for (var i = 1; i <= yearStop; i++) {
        rangeYear.push(yearList + i);
    }
    $scope.yearsListaMostrar = rangeYear;

    //Obtener Datos del Servidor en la primera carga
    Cargar();
    PagosLista.requerir($scope.YearBusqueda).then(function (response) {

        if (response.data.success != false) {

            angular.forEach(response.data, function (value, key) {
                value.FechaDePago = moment(new Date(value.FechaDePago.match(/\d+/)[0] * 1)).format("DD-MM-YYYY");
                value.FechaSolicitud = moment(new Date(value.FechaSolicitud.match(/\d+/)[0] * 1)).format("DD-MM-YYYY");
                value.Programacion = value.Programacion == "PROGRAMADO" ? "SI" : "NO";
                $scope.dataset.push(value);
            });

            $scope.tableParams = new NgTableParams({
                count: 10
            }, {
                total: $scope.dataset.length,
                    dataset: $scope.dataset
                });
            $scope.CerrarCargar();
        }
        else {
            //toastr.error(response.data.response, 'Error');
            console.log(response.status + ":ERROR:" + response.statusText);
        }
    });

    //Foltra la Tabla por Año
    $scope.filtrarYear = function () {
        $scope.dataset = [];
        PagosLista.requerir($scope.YearBusqueda).then(function (response) {

            if (response.data.success != false) {

                angular.forEach(response.data, function (value, key) {
                    value.FechaDePago = moment(new Date(value.FechaDePago.match(/\d+/)[0] * 1)).format("DD-MM-YYYY");
                    value.FechaSolicitud = moment(new Date(value.FechaSolicitud.match(/\d+/)[0] * 1)).format("DD-MM-YYYY");
                    value.Programacion = value.Programacion == "PROGRAMADO" ? "SI" : "NO";
                    $scope.dataset.push(value);
                });

                $scope.tableParams = new NgTableParams({
                    count: 10
                }, {
                        total: $scope.dataset.length,
                        dataset: $scope.dataset
                    });
            }
            else {
                //toastr.error(response.data.response, 'Error');
                console.log(response.status + ":ERROR:" + response.statusText);
            }
        });
    }

    $scope.cancelDialog = function () {
        $mdDialog.cancel();
    };

    function Cargar() {
        $mdDialog.show({
            multiple: true,
            controller: function () {
                $scope.CerrarCargar = function () {
                    $mdDialog.hide();
                }
            },
            template: '<md-dialog class="confirm" style="min-width: 140px !important;padding-top: 20px; min-height: 140px !important;"> <div layout="column"  layout-sm="column" layout-align="space-around"> <md-progress-circular style="margin-left:35px;" md-mode="indeterminate" md-diameter="70"></md-progress-circular><h4 style="margin-left:30px;">Cargando...</h4></div></md-dialog>'
        })
    }

    $scope.Detalles = function (ID) {

        $mdDialog.show({
            multiple: true,
            controllerAs: 'VerDetalles',
            bindToController: true,
            locals: { parent: $scope },
            controller: function ($scope) {
                $scope.pago = {};
                $scope.Eliminado = false;
                $scope.CerrarDetalles = function () { $mdDialog.cancel(); }
                BusquedaDetalles.requerir(ID).then(function (response) {
                    if (response.data.success != false) {
                        $scope.pago = response.data[0];
                        $scope.Eliminado = $scope.pago.Eliminado;
                    }
                    else {
                        console.log(response.status + ":ERROR:" + response.statusText);
                    }
                    $scope.BtnConsolidado = false;
                });

                $scope.Reenviar = function (ev, IDp) {
                    // Appending dialog to document.body to cover sidenav in docs app
                    var confirm = $mdDialog.confirm()
                        .title('Desea reenviar el pago?')
                        .textContent('El pago se reenviara a solicitudes')
                        .ariaLabel('ReenviarPago')
                        .targetEvent(ev)
                        .ok('Si')
                        .multiple(true)
                        .cancel('No');

                    $mdDialog.show(confirm).then(function () {
                        Reenviar.requerir(IDp).then(function (response) {
                            if (response.data.success != false) {
                                $mdDialog.cancel();
                            }
                            else {
                                //toastr.error(response.data.response, 'Error');
                                console.log(response.status + ":ERROR:" + response.statusText);
                                
                            }
                        });

                    }, function () {

                    });
                };

                $scope.Eliminar = function (ev, IDp) {
                    // Appending dialog to document.body to cover sidenav in docs app
                    var confirm = $mdDialog.confirm()
                        .title('Realmente desea cancelar el pago?')
                        .textContent('El pago cambiara a estatus de cancelado y se enviara un correo de notificacion a solicitudes')
                        .ariaLabel('CalcelarPago')
                        .targetEvent(ev)
                        .ok('Si')
                        .multiple(true)
                        .cancel('No');

                    $mdDialog.show(confirm).then(function () {
                        Eliminar.requerir(IDp).then(function (response) {
                            if (response.data.success != false) {
                                $scope.Eliminado = true;
                            }
                            else {
                                //toastr.error(response.data.response, 'Error');
                                console.log(response.status + ":ERROR:" + response.statusText);
                            }
                        });
                    }, function () {

                    });
                };
            },
            templateUrl: '/Main/BusquedaDetallePago'
        })
    }


}]);