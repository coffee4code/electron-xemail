var angular = require('angular'),
    remote = require('electron').remote;

angular
    .module('app.controller',[])
    .controller('appCtrl',['$rootScope', '$scope', '$mdColors',function($rootScope, $scope, $mdColors){

    }])
    .controller('menuCtrl',['$scope', '$state', '$mdDialog',function($scope, $state, $mdDialog){
        $scope.window = remote.getCurrentWindow();
        $scope.onOpen = onOpen;
        $scope.onExit = onExit;
        $scope.onMaximum = onMaximum;
        $scope.onDevTool = onDevTool;
        $scope.onMinimize = onMinimize;
        $scope.onSetting = onSetting;
        $scope.onHelp = onHelp;
        $scope.onAbout = onAbout;

        function onOpen() {
            $state.go('app.open');
        }
        function onExit() {
            var confirm = $mdDialog.confirm()
                .title('退出程序?')
                .textContent('退出应用程序或最小化到托盘.')
                .ariaLabel('退出程序')
                .targetEvent(event)
                .ok('确定退出')
                .cancel('最小化');

            $mdDialog.show(confirm).then(function() {
                $scope.window.close();
            }, function() {
                $scope.window.minimize();
                return false;
            });
        }
        function onMaximum() {
            $scope.window.maximize();
        }
        function onMinimize() {
            $scope.window.minimize();
        }
        function onDevTool() {
            $scope.window.webContents.openDevTools({mode: 'detach'});
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
    .controller('settingCtrl',['$scope', 'settingService',function($scope, settingService){
        // var a1 = settingService.getItem('smtp_host');
        // console.info(a1);
        // settingService.setItem('smtp_host','smtp.163.com');
        // var a2 = settingService.getItem('smtp_host');
        // console.info(a2);
        // settingService.setItemBatch({'smtp_host':'smtp.yin.com','smtp_port':'123'});
        // var v = settingService.getItemBatch(['smtp_host','smtp_port']);
        // var all = settingService.getAll();
        // console.info(v);
        // console.info(all);
    }])
;

;var angular = require('angular');

angular
    .module('app.directive',[])
    .directive("myDropZone", [function() {
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
    }])
    .directive('myFilePicker', [function() {
        return {
            restrict: 'EA',
            scope: {
                fileType:'=',
                myOnChange: '='
            },
            template:'' +
            '<div>' +
            '   <div class="drop-area" id="file-drop-area"  layout="column" flex layout-column layout-align="center center" my-drop-zone on-file-drop="onFileDrop">' +
            '      <div class="drop-area-icon" layout="column" flex layout-column layout-align="center bottom">' +
            '          <ng-md-icon icon="cloud_download" size="100" style="fill:{{$root.mdPrimaryColor}};"></ng-md-icon>' +
            '      </div>' +
            '      <div class="drop-area-tip" layout="column" flex layout-column ng-if="!!current.filePath" ng-bind="current.filePath"></div>' +
            '      <div class="drop-area-tip" layout="column" flex layout-column ng-if="!current.filePath">点击选择xls文件或将文件拖放到这里</div>' +
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
    .module('app.service',[])
    .service('settingService',['config', 'databaseService' ,function(config, databaseService) {

        var SETTINGS = config.get().SETTINGS,
            dbName = 'setting';

        return {
            init: init,
            getAll: getAll,
            getItem: getItem,
            setItem: setItem,
            getItemBatch: getItemBatch,
            setItemBatch: setItemBatch,
        };

        function init() {
            var settingSql = 'DROP TABLE IF EXISTS '+dbName+'; CREATE TABLE ' + dbName + ' (itemKey, itemValue);';
            var sqls = [];
            for(var key in SETTINGS) {
                sqls.push("INSERT INTO " + dbName + " VALUES ('" + key +"','"+ SETTINGS[key] +"')");
            }
            databaseService.createWithData(dbName, settingSql+sqls.join(';'));
        }

        function getAll() {
            var data = [],
                query = databaseService.queryTableData(dbName);
            data = _getValues(query);
            return data;
        }

        function getItem(key) {
            var data = null,
                query = databaseService.queryByString(dbName, 'SELECT * FROM '+ dbName + ' WHERE itemKey=:key;', {':key': key});
            if(query) {
                data = [];
                data[query['itemKey']] = query['itemValue'];
            }
            return data;
        }

        function setItem(key, value) {
            return databaseService.executeByString(dbName,'UPDATE '+dbName+' SET itemValue="'+value+'" WHERE itemKey="'+key+'";');
        }

        function getItemBatch(keys) {
            var sqls = [];
            for(var index in keys) {
                sqls.push((sqls.length ?' OR ' :'') +' itemKey="'+keys[index]+'" ');
            }
            sqls = sqls.join(' ');
            sqls = 'SELECT * FROM '+dbName+' WHERE '+ sqls;
            var query = databaseService.executeByString(dbName,sqls);
            var data = _getValues(query);
            return data;
        }

        function setItemBatch(data) {
            var sqls = [];
            for(var key in data) {
                sqls.push('UPDATE '+dbName+' SET itemValue="'+data[key]+'" WHERE itemKey="'+key+'"');
            }
            sqls = sqls.join(';');
            return databaseService.executeByString(dbName,sqls);
        }

        function _getValues(query) {
            var data = [];
            if(query && query.length){
                query = query[0].values;
            }
            if(query && query.length) {
                for(var item in query) {
                    data[query[item][0]] = query[item][1];
                }
            }
            return data;
        }

    }])
;
;var angular = require('angular');

angular
    .module('app.config',[])
    .provider("config",[function(){
        var options = {
            SETTINGS: {}
        };
        this.setSetting = setSetting;
        this.$get=function(){
            return {
                get:get
            }
        };

        function get(){
            return options;
        }
        function setSetting(setting){
            options.SETTINGS = setting;
        }
    }])
    .config(['$mdThemingProvider',function($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('pink')
            .accentPalette('orange');
    }])
    .config(['configProvider',function(configProvider){
        var setting = {
            smtp_host: 'smtp.qq.com',
            smtp_port: '465',
            sender_email : '1062893543@qq.com',
            sender_password : 'anqckibffhrpbcef'
        };
        configProvider.setSetting(setting);
    }])

;;var angular = require('angular'),
    fs = require('fs'),
    SQL = require('sql.js'),
    path = require('path');


angular
    .module('app.database',[])
    .service('databaseService',[function(){

        var DB = [];

        return {
            queryByString: queryByString,
            executeByString: executeByString,
            queryTableData: queryTableData,
            createWithData: createWithData,
        };

        function createWithData(database, sql) {

            if(DB && DB[database]){
                return ;
            }
            if(!_exist(database)) {
                var db = new SQL.Database();
                db.run(sql);
                DB[database] = db;
                _commit(database);
            }
        }

        function queryByString(database, string, filter) {
            var data = null;
            _open(database);
            if(DB && DB[database]){
                var db = DB[database];
                var stmt = db.prepare(string);
                data = stmt.getAsObject(filter);
            }
            return data;
        }

        function executeByString(database, sql) {
            var data = null;
            _open(database);
            if(DB && DB[database]){
                var db = DB[database];
                data = db.exec(sql);
                _commit(database);
            }
            return data;
        }

        function queryTableData(database) {
            var data = null;
            _open(database);
            if(DB && DB[database]) {
                var db = DB[database];
                data = db.exec("SELECT * FROM "+ database);
                db.close();
            }
            return data;
        }

        function _exist(database) {
            return fs.existsSync(_getDbPath(database));
        }

        function _open(database) {
            if(DB && DB[database]){
                return;
            }
            var fileBuffer = fs.readFileSync(_getDbPath(database));
            DB[database] = new SQL.Database(fileBuffer);
        }
        function _commit(database) {
            if(DB && DB[database]) {
                var db = DB[database],
                    data = db.export(),
                    buffer = new Buffer(data);
                fs.writeFileSync(_getDbPath(database), buffer);
            }
        }
        function _getDbPath(database) {
            return path.resolve(__dirname, 'database', database)
        }

    }])
;
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
        'app.database',
        'app.config',
        'app.service',
        'app.filter',
        ]);

app.run(['$rootScope', '$state', '$mdColors', 'settingService',function ($rootScope, $state,$mdColors, settingService) {

    $rootScope.mdPrimaryColor = $mdColors.getThemeColor('pink');

    settingService.init();


}])
;
app.bootstrap = function () {
    angular.bootstrap(window.document, ['app']);
};
app.bootstrap();

