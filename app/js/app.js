var $ = require('jquery'),
    angular = require('angular'),
    remote = require('electron').remote;

angular
    .module('app.controller',[])
    .controller('appCtrl',['$scope',function($scope){
        console.info('appCtrl');
        $scope.data = {
            filePath: ''
        }
    }])
    .controller('menuCtrl',['$scope', '$state',function($scope, $state){
        $scope.onOpen = onOpen;
        $scope.onExit = onExit;
        $scope.onSetting = onSetting;

        function onOpen() {
            $state.go('app.open');
        }
        function onExit() {
            var window = remote.getCurrentWindow();
            window.close();
        }
        function onSetting() {
            $state.go('app.setting');
        }

    }])
    .controller('contentCtrl',['$scope',function($scope){
        console.info('bodyCtrl')
    }])
    .controller('openCtrl',['$scope', '$state',function($scope, $state){
        console.info('openCtrl');
        $scope.onFileChange = onFileChange;

        function onFileChange(event) {
            $scope.data.filePath = event.target.files[0].path;
        }
    }])
    .controller('settingCtrl',['$scope',function($scope){
        console.info('settingCtrl')
    }])
;

;var $ = require('jquery'),
    angular = require('angular');

angular
    .module('app.directive',[])
    .directive('myContent', [function(){
        return {
            restrict:'EAC',
            link:function (scope, element, attrs) {
                $(element).css({
                    'min-height': (768-96)+'px'
                });
            }
        }
    }])
    .directive('myFilePicker', [function() {
        return {
            restrict: 'EA',
            scope: {
                filePath: '=',
                myOnChange: '='
            },
            template:'' +
                '<div>' +
                '   <input type="text" readonly ng-value="filePath" />' +
                '   <button id="file-button">添加文件</button>' +
                '   <input id="file-input" type="file" my-on-change="onFileChange" style="display: none;" >' +
                '</div>',
            replace:true,
            link: function (scope, element, attrs) {
                var $element = $(element),
                    $input = $element.find('#file-input'),
                    $button = $element.find('#file-button');
                $input.bind('change', function(event){
                    scope.$apply(function(){
                        scope.myOnChange(event);
                    });
                });
                $button.bind('click', function(event){
                    $input.trigger('click');
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

            $urlRouterProvider.otherwise('/open');

            $stateProvider
            .state('app', {
                url: '',
                abstract: true,
                views: {
                    menu: {
                        templateUrl:'tmpls/menu.html',
                        controller: 'menuCtrl'
                    },
                    content: {
                        templateUrl:'tmpls/content.html',
                        controller: 'contentCtrl'
                    }
                }
            })
            .state('app.open', {
                url: '/open',
                views: {
                    main: {
                        templateUrl:'tmpls/open.html',
                        controller: 'openCtrl'
                    }
                }
            })
            .state('app.setting', {
                url: '/setting',
                views: {
                    main: {
                        templateUrl:'tmpls/setting.html',
                        controller: 'settingCtrl'
                    }
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

