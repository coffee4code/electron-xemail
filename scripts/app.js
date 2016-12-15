var $ = require('jquery'),
    angular = require('angular'),
    angularAnamiate = require('angular-animate'),
    angularAria = require('angular-aria'),
    angularMaterial = require('angular-material'),
    app = angular.module('app', [
        angularAnamiate,
        angularAria,
        angularMaterial,
        'app.router',
        'app.directive',
        'app.controller',
        'app.service'
        ]);

app.run(['$rootScope', '$state', function ($rootScope, $state) {
    $rootScope.$on('$stateChangeStart', function (event, toState) {

    });
}]);
app.bootstrap = function () {
    angular.bootstrap(window.document, ['app']);
};
app.bootstrap();

