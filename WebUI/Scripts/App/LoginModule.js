var appLogin = angular.module('LoginApp', ['ngMaterial', 'ngMdIcons', 'ngMessages', 'ngRoute'])

    .config(function ($mdThemingProvider) { 
    $mdThemingProvider.theme('default')
      .primaryPalette('teal')
      .accentPalette('blue-grey')
        .warnPalette('red');

    $mdThemingProvider.theme('docs-dark')
        .primaryPalette('grey')
        .accentPalette('amber')
        .dark();

    $mdThemingProvider.theme('Consolidado-dark')
        .primaryPalette('grey')
        .accentPalette('yellow')
        .dark();
    })

appLogin.factory('LoginSearch', function ($http) {
    return {
        requerir: function (usuario) {
            return $http({
                method: 'POST',
                url: '/Login/Login',
                data: { 'correo': usuario.correo, 'contra': usuario.contra }
            })
        }
    };
});


appLogin.controller('LoginController', ['$scope', '$mdSidenav', '$mdMedia', '$timeout', '$location', '$mdDialog', 'LoginSearch', function ($scope, $mdSidenav, $mdMedia, $timeout, $location, $mdDialog, LoginSearch) {

    $scope.ProgresVer = false;
    $scope.ErrorMensaje = false;
    $scope.usuario = {correo :"",contra:""}
    var ctrl = this;
    ctrl.login;

    $scope.Autenticar = function () {
        $scope.ErrorMensaje =false;
        $scope.ProgresVer = true;

        if (ctrl.login.$invalid) {
            angular.forEach(ctrl.login.$error, function (field) {
                angular.forEach(field, function (errorField) {
                    errorField.$setTouched();
                    $scope.ProgresVer = false;
                })
            });
        }
        else {

            //Obtener Datos del Servidor
            LoginSearch.requerir($scope.usuario).then(function (response) {
                if (response.data.success != false) {
                   
                    window.location.pathname = 'Main/Pagos';
                    $scope.ProgresVer = false;
                }
                else {
                    //toastr.error(response.data.response, 'Error');
                    $scope.ErrorMensaje = true;
                    console.log(response.status + ":ERROR:" + response.responseText);
                    $scope.ProgresVer = false;
                }
            });

        }

    }

}]);