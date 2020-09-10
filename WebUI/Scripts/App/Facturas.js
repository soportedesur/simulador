appPago.controller('FacturaController', ['$scope', '$mdSidenav', '$mdMedia', '$timeout', '$location', '$mdDialog', '$timeout', '$filter', '$q', '$log', '$window', 'NgTableParams', 'ValidacionFactura', 'BusquedaDetallesFactura', 'ActualizarFactura', function ($scope, $mdSidenav, $mdMedia, $timeout, $location, $mdDialog, $timeout, $filter, $q, $log, $window, NgTableParams, ValidacionFactura, BusquedaDetallesFactura, ActualizarFactura) {

    var selft = this;
    $scope.dataset = [];
    $scope.datasetNA = [];
    $scope.tableParamsFac = {};


    Cargar();
    ValidacionFactura.Asignados().then(function (response) {
        if (response.data.success != false) {
            angular.forEach(response.data, function (value, key) {
                value.Fecha = moment(new Date(value.Fecha.match(/\d+/)[0] * 1)).format("DD-MM-YYYY");
                //value.FechaPago = moment(new Date(value.FechaPago.match(/\d+/)[0] * 1)).format("DD-MM-YYYY");
                $scope.dataset.push(value);
            });
        }
        else {
            //toastr.error(response.data.response, 'Error');
            console.log(response.status + ":ERROR:" + response.statusText);
        }
    });

    ValidacionFactura.NoAsignados().then(function (response) {
        if (response.data.success != false) {
            angular.forEach(response.data, function (value, key) {
                value.Fecha= moment(new Date(value.Fecha.match(/\d+/)[0] * 1)).format("DD-MM-YYYY");
                //value.FechaPago = moment(new Date(value.FechaPago.match(/\d+/)[0] * 1)).format("DD-MM-YYYY");
                $scope.datasetNA.push(value);
            });
            //$scope.tableParamsFac = new NgTableParams({
            //    count: 10
            //}, {
            //        total: $scope.dataset.length,
            //        dataset: $scope.dataset
            //    });
            $scope.CerrarCargar();
        }
        else {
            //toastr.error(response.data.response, 'Error');
            console.log(response.status + ":ERROR:" + response.statusText);
        }
    });


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
            locals: { parent: $scope },
            controller: function ($scope) {
                var selft = this;
                $scope.minDate = new Date();
                $scope.FacturasForm;
                $scope.FacturaT = {};
                $scope.CerrarDetallesFac = function () {
                    $mdDialog.cancel();
                }

                $scope.Estatus = [
                    { id: 1, name: 'NO PAGADA' },
                    { id: 2, name: 'PAGADA' }
                ];
                $scope.StatusFactura = { id: 1, name: '' };

                BusquedaDetallesFactura.requerir(ID).then(function (response) {
                    if (response.data.success != false) {
                        console.log(response.data);

                        if (response.data.FechaPago == "No Especificado") {
                            response.data.FechaPago = null;
                        }
                        else {
                            response.data.FechaPago = new Date(response.data.FechaPago)
                        }

                        response.data.Fecha = moment(new Date(response.data.Fecha.match(/\d+/)[0] * 1)).format("DD-MM-YYYY");
                        $scope.StatusFactura.name = response.data.EstatusPago;
                        $scope.FacturaT = response.data;
                    }
                    else {
                        console.log(response.status + ":ERROR:" + response.statusText);
                    }
                });

                $scope.GuardarFac = function () {

                    if (selft.FacturasForm.$invalid) {
                        angular.forEach(selft.FacturasForm.$error, function (field) {
                            angular.forEach(field, function (errorField) {
                                errorField.$setTouched();
                            })
                        });
                    }
                    else {
                        var Fac = {
                            Id: ID,
                            Estatus: $scope.StatusFactura.name,
                            Fecha: $scope.FacturaT.FechaPago
                        }
                        ActualizarFactura.Enviar(Fac).then(function (response) {
                            console.log(response);
                            $scope.FacturaT.Block = true;
                            $scope.CerrarDetallesFac();
                        });
                    }
                }
            },
            controllerAs:'selft',
            templateUrl: '/Main/DetalleFactura'
        })
    }
}]);

//appPago.controller('ValidacionFactura', ['$scope', '$mdSidenav', '$mdMedia', '$timeout', '$location', '$mdDialog', 'BusquedaDetallesFactura', function ($scope, $mdSidenav, $mdMedia, $timeout, $location, $mdDialog, BusquedaDetallesFactura) {
   
       
//}]);