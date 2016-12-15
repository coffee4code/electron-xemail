var angular = require('angular'),
    angularAnamiate = require('angular-animate'),
    angularAria = require('angular-aria'),
    angularMaterial = require('angular-material'),
    angularMdIcons = require('angular-material-icons'),
    app = angular.module('app', [
        angularAnamiate,
        angularAria,
        angularMaterial,
        angularMdIcons,
        'app.router',
        'app.directive',
        'app.controller',
        'app.service',
        'app.filter',
        ]);

app.run(['$rootScope', '$state', function ($rootScope, $state) {
    $rootScope.$on('$stateChangeStart', function (event, toState) {

    });
}])
    .config(['$mdThemingProvider',function($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('pink')
            .accentPalette('orange');
    }]);
app.bootstrap = function () {
    angular.bootstrap(window.document, ['app']);
};
app.bootstrap();

