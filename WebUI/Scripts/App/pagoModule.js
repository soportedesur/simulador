var appPago = angular.module('PagosApp', ['ngMaterial', 'ngMdIcons', 'ngMessages', 'ngRoute', 'angularMoment', 'ngAnimate', 'toastr', 'mdSteppers', 'uimaskmoney', 'vAccordion', 'md.data.table', 'ng-mfb', 'ngTable'])
.config(["$routeProvider", "$locationProvider", function ($routeProvider, $locationProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "/Main/Programar",
            controller: "ProgramacionController"
        })
        //.when("/Informatica/Suministro/Articulos", {
        //    templateUrl: "/Informatica/Suministro/Articulos",
        //    controller: "articulosCtrl"
        //})
        //.when("/Informatica/Asignaciones/Asignaciones", {
        //    templateUrl: "/Informatica/Asignaciones/Asignaciones",
        //    controller: "AsignacionesCtrl"
        //})
        //.when("/contact", { templateUrl: "/Home/Contact" })
        .otherwise({ redirectTo: "/" });

    $locationProvider.html5Mode(false).hashPrefix("!");
}])
    .config(function ($mdThemingProvider) { 
    $mdThemingProvider.theme('default')
      .primaryPalette('teal')
      .accentPalette('blue-grey')
        .warnPalette('red');

    $mdThemingProvider.theme('docs-dark')
        .primaryPalette('yellow', { 'default': '500' })
        .backgroundPalette('grey')
        .accentPalette('yellow')
        .dark();

    $mdThemingProvider.theme('Consolidado-dark')
        .primaryPalette('grey')
        .dark();
})


// Configurcion de DatePicker en español y Formta de momentjs
.config(function ($mdDateLocaleProvider) {
    // Example of a Spanish localization.
    $mdDateLocaleProvider.months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    $mdDateLocaleProvider.shortMonths = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
        'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    $mdDateLocaleProvider.days = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sábado'];
    $mdDateLocaleProvider.shortDays = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];
    // Can change week display to start on Monday.
    $mdDateLocaleProvider.firstDayOfWeek = 1;
    // Optional.
    //$mdDateLocaleProvider.dates = [1, 2, 3, 4, 5, 6, 7,8,9,10,11,12,13,14,15,16,17,18,19,
    //                               20,21,22,23,24,25,26,27,28,29,30,31];
    // In addition to date display, date components also need localized messages
    // for aria-labels for screen-reader users.
    $mdDateLocaleProvider.weekNumberFormatter = function (weekNumber) {
        return 'Semana ' + weekNumber;
    };
    $mdDateLocaleProvider.msgCalendar = 'Calendario';
    $mdDateLocaleProvider.msgOpenCalendar = 'Abrir calendario';
    $mdDateLocaleProvider.formatDate = function (date) {
        return moment(date).format('DD-MM-YYYY');
    };
});

appPago.factory('LoginOut', function ($http) {
    return {
        requerir: function () {
            return $http({
                method: 'POST',
                url: '/Login/LogOff'
            })
        }
    };
});

appPago.factory('PagosPendientes', function () {
   
    var Pendientes = [];
    return {
        requerir: function () {
            return Pendientes;
        },
        asignar: function (pagos) {
            Pendientes = pagos;
        }
    };

});

appPago.factory('ConsolidadoListas', function ($http) {
    var Consolidado = [];
    return {
        requerir: function(consol){
           return $http({
                method: 'POST',
                url: '/Pagos/ConsolidadosAction',
                data: { 'consolidado': consol }
            })
        },
        Consolidados: function () {
            return Consolidado;
        }
    };
});

appPago.factory('GuardarPago', function ($http) {
    var Consolidado;
    return {
        requerir: function (pago) {
            return $http({
                method: 'POST',
                url: '/Pagos/GuardarUnicoPago',
                data: { 'Pago': JSON.stringify(pago) }
            })
        },
        Consolidados: function () {
            return Consolidado;
        }
    };
});


appPago.factory('PagosLista', function ($http) {
    var Consolidado = [];
    return {
        requerir: function (year) {
            console.log("Año: "+ year);
            return $http({
                method: 'POST',
                url: '/Pagos/PagosLista',
                data:{'year':year}
            })
        },
        Consolidados: function () {
            return Consolidado;
        }
    };
}); 

appPago.factory('BusquedaDetalles', function ($http) {
    var Consolidado = [];
    return {
        requerir: function (id) {
            return $http({
                method: 'POST',
                url: '/Pagos/BusquedaDetalles',
                data: { 'ID': id }
            })
        },
        Consolidados: function () {
            return Consolidado;
        }
    };
});

appPago.factory('Eliminar', function ($http) {
    return {
        requerir: function (id) {
            return $http({
                method: 'POST',
                url: '/Pagos/EliminarElemento',
                data: { 'ID': id }
            })
        }
    };
});

appPago.factory('Reenviar', function ($http) {
    return {
        requerir: function (id) {
            return $http({
                method: 'POST',
                url: '/Pagos/Reenviar',
                data: { 'ID': id }
            })
        }
    };
});

appPago.factory('ValidacionFactura', function ($http) {
    return {
        Asignados:function() {
            return $http({ method: 'GET', url:'/Pagos/FacturasAsignadasLista'})
        },
        NoAsignados:function() {
            return $http({ method: 'GET', url:'/Pagos/FacturasNoAsignadasLista'})
        }
    };
});

appPago.factory('BusquedaDetallesFactura', function ($http) {
    return {
        requerir: function (id) {
            return $http({
                method: 'POST',
                url: '/Pagos/FacturasDetalles',
                data: { 'id': id }
            })
        }
    };
});

appPago.factory('ActualizarFactura', function ($http) {
    return {
        Enviar: function (Fact) {
            return $http({
                method: 'POST',
                url: '/Pagos/FacturasGuardado',
                data: { 'Factur': JSON.stringify(Fact) }
            })
        }
    };
});


appPago.filter("ConvertirFecha", function () {
    var re = /\/Date\(([0-9]*)\)\//;
    return function (x) {
        var m = x.match(re);
        if (m) return new Date(parseInt(m[1]));
        else return null;
    };
});