var angular = require('angular'),
    app = angular.module('app', ['app.router', 'app.controller','app.service']);

app.run(['$rootScope', '$state', function ($rootScope, $state) {
    $rootScope.$on('$stateChangeStart', function (event, toState) {

    });
}]);
app.bootstrap = function () {
    angular.bootstrap(window.document, ['app']);
};
app.bootstrap();

