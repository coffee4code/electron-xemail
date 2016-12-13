var $ = require('jquery'),
    angular = require('angular');

angular
    .module('app.controller',[])
    .controller('appCtrl',['$scope',function($scope){
        $scope.data = {
            filePath: ''
        }
    }])
    .controller('homeCtrl',['$scope',function($scope){
        $scope.onFileChange = onFileChange;

        function onFileChange(event) {
            $scope.data.filePath = event.target.files[0].path;
        }
    }]);

;var $ = require('jquery'),
    angular = require('angular');

angular
    .module('app.directive',[])
    .directive('myOnChange', [function() {
        return {
            restrict: 'A',
            scope: {
                myOnChange:'='
            },
            link: function (scope, element, attrs) {
                element.bind('change', function(event){
                    scope.$apply(function(){
                        scope.myOnChange(event);
                    });
                });
            }
        };
    }]);
;var $ = require('jquery'),
    angular = require('angular'),
    ngRouter = require('angular-ui-router');

angular
    .module('app.router',[ngRouter])
    .config([
        '$stateProvider',
        '$urlRouterProvider',
        '$locationProvider',
        function ($stateProvider, $urlRouterProvider, $locationProvider) {
            $locationProvider.hashPrefix('!');

            $urlRouterProvider.otherwise('/home');

            $stateProvider
            .state('home', {
                url: '/home',
                views: {
                    main: {
                        templateUrl:'tmpls/home.html',
                        controller: 'homeCtrl'
                    }
                },
                data: {
                    role: 'user'
                }
            })
        }
    ]);

;var $ = require('jquery'),
    angular = require('angular');
angular
    .module('app.service',[]);
;var $ = require('jquery'),
    angular = require('angular'),
    app = angular.module('app', [
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

