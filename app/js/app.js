var angular = require('angular'),
    remote = require('electron').remote;

angular
    .module('app.controller',[])
    .controller('appCtrl',['$rootScope', '$scope', '$mdColors',function($rootScope, $scope, $mdColors){

    }])
    .controller('menuCtrl',['$scope', '$state', '$mdDialog',function($scope, $state, $mdDialog){
        $scope.onOpen = onOpen;
        $scope.onExit = onExit;
        $scope.onSetting = onSetting;
        $scope.onHelp = onHelp;
        $scope.onAbout = onAbout;

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
        function onHelp(event) {
            dialogOpen('help', event);
        }
        function onAbout(event) {
            dialogOpen('about', event);
        }

        function dialogOpen(type, event) {
            $mdDialog
                .show({
                    controller: dialogCtrl,
                    templateUrl: 'tmpls/dialogs/dialog.' + type + '.html',
                    parent: angular.element(document.body),
                    targetEvent: event,
                    clickOutsideToClose:true,
                    fullscreen: false
                })
            ;
        }
        function dialogCtrl($scope, $mdDialog) {
            $scope.hide = function() {
                $mdDialog.hide();
            };
        }

    }])
    .controller('dialogHelpCtrl',['$scope',function($scope){

    }])
    .controller('contentCtrl',['$scope',function($scope){

    }])
    .controller('contentCtrl',['$scope',function($scope){

    }])
    .controller('openCtrl',['$scope', '$state', '$filter', '$mdToast',function($scope, $state, $filter, $mdToast){
        $scope.current = {
            status : 0,
            fileType: ['xls','xlsx'],
            file: null
        };
        $scope.onFileChange = onFileChange;
        $scope.onStart = onStart;

        function onFileChange(file) {
            var isValid = false;
            if(file && file.path) {
                isValid = $filter('filetype')(file.path, $scope.current.fileType.join(','));
            }
            if(!isValid) {
                $scope.current.status = -1;
                $mdToast.show(
                    $mdToast.simple()
                        .textContent('不支持的文件类型!')
                        .position('bottom center')
                );
                return false;
            }
            $scope.current.status = 1;
            $scope.current.file = file;
        }
        function onStart() {
            if($scope.current.file) {
                $state.go('app.list',{path:$scope.current.file.path})
            }
        }
    }])
    .controller('listCtrl',['$scope', '$state', 'path',function($scope, $state, path){
        $scope.path = path;
    }])
    .controller('settingCtrl',['$scope',function($scope){
        console.info('settingCtrl')
    }])
;

;var angular = require('angular');

angular
    .module('app.directive',[])
    .directive('myContent', [function(){
        return {
            restrict:'EAC',
            link:function (scope, element, attrs) {
                $(element).addClass('min-content')
            }
        }
    }])
    .directive("myDropZone", function() {
        return {
            restrict : "A",
            scope: {
                onFileDrop: '='
            },
            link: function (scope, element) {
                element.bind('drop', function(event) {
                    event.stopPropagation();
                    event.preventDefault();

                    var file = null;
                    if(event && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length) {
                        file = event.dataTransfer.files[0];
                    }
                    scope.onFileDrop(file);
                });

                element.bind('dragover', function(event){
                    event.preventDefault();
                    $(this).addClass('drop-active');
                });
                element.bind('dragleave', function(event){
                    event.preventDefault();
                    $(this).removeClass('drop-active');
                });
                $(window).bind('drop dragover', function(event) {
                    event.preventDefault();
                });
            }
        }
    })
    .directive('myFilePicker', [function() {
        return {
            restrict: 'EA',
            scope: {
                fileType:'=',
                myOnChange: '='
            },
            template:'' +
            '<div>' +
            '   <div class="drop-area" id="file-drop-area" my-drop-zone on-file-drop="onFileDrop">' +
            '      <div class="drop-area-icon">' +
            '          <ng-md-icon icon="cloud_download" size="100" style="fill:{{$root.mdPrimaryColor}};"></ng-md-icon>' +
            '      </div>' +
            '      <div class="drop-area-tip" ng-if="!!current.filePath" ng-bind="current.filePath"></div>' +
            '      <div class="drop-area-tip" ng-if="!current.filePath">点击选择xls文件或将文件拖放到这里</div>' +
            '   </div>' +
            '   <input id="file-input" type="file" my-on-change="onFileChange" style="display: none;">' +
            '</div>',
            replace:true,
            link: function (scope, element, attrs) {
                scope.current = {
                    filePath: '',
                };
                scope.onFileDrop = onFileDrop;
                var $element = $(element),
                    $input = $element.find('#file-input'),
                    $area = $element.find('#file-drop-area');

                init();
                function onFileDrop (file) {
                    scope.current.filePath = file.path;
                    scope.$apply(function(){
                        scope.myOnChange(file);
                    });
                }
                function init () {
                    $input.bind('change', function(event){
                        scope.$apply(function(){
                            var file = null;
                            if(event.target && event.target.files && event.target.files.length){
                                file = event.target.files[0];
                            }
                            scope.current.filePath = file.path;
                            scope.myOnChange(file);
                        });
                    });
                    $area.bind('click', function(event){
                        $input.trigger('click');
                    });
                }
            }
        };
    }]);
;var angular = require('angular'),
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
            .state('app.list', {
                url: '/list?path',
                views: {
                    main: {
                        templateUrl:'tmpls/list.html',
                        controller: 'listCtrl',
                        params: ['path'],
                        resolve:{
                            path: ['$stateParams',function($stateParams){
                                return $stateParams.path;
                            }]
                        },
                    },
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

;var angular = require('angular');
angular
    .module('app.service',[]);
;var angular = require('angular');

angular
    .module('app.filter',[])
    .filter('filetype',[function(){
        return function (path, limit) {
            limit = limit.split(',');
            var suffix = path.match(/\.([\w\W]+)/)[1];
            return limit.indexOf(suffix) > -1
        }
    }])
;;var angular = require('angular'),
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

app.run(['$rootScope', '$state', '$mdColors',function ($rootScope, $state,$mdColors) {
    $rootScope.mdPrimaryColor = $mdColors.getThemeColor('grey');

    $rootScope.$on('$stateChangeStart', function (event, toState) {
    });
}])
    .config(['$mdThemingProvider',function($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('grey')
            .accentPalette('orange');
    }]);
app.bootstrap = function () {
    angular.bootstrap(window.document, ['app']);
};
app.bootstrap();

