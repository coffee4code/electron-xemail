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
        'app.database',
        'app.config',
        'app.service',
        'app.filter',
        ]);

app.run(['$rootScope', '$state', '$mdColors', 'settingService',function ($rootScope, $state,$mdColors, settingService) {

    $rootScope.mdPrimaryColor = $mdColors.getThemeColor('pink');

    settingService.init();


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

