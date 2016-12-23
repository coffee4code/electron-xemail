var angular = require('angular'),
    remote = require('electron').remote,
    path = require('path');

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
                .title('关闭')
                .textContent('确定退出应用程序？')
                .ariaLabel('退出程序')
                .targetEvent(event)
                .ok('确定退出')
                .cancel('取消');

            $mdDialog.show(confirm).then(function() {
                $scope.window.close();
            }, function() {
                return false;
            });
        }
        function onMaximum() {
            // $scope.window.maximize();
            if($scope.window.isMaximized()){
                $scope.window.unmaximize();
            } else {
                $scope.window.maximize();
            }
        }
        function onMinimize() {
            $scope.window.minimize();
        }
        function onDevTool() {
            $scope.window.webContents.openDevTools({mode: 'detach'});
        }
        function onSetting() {
            $state.go('app.setting.user');
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
                $state.go('app.sheet.load',{filePath:$scope.current.file.path})
            }
        }
    }])
    .controller('sheetCtrl',['$scope', function($scope){
        $scope.current = {
            progress: 0
        };
    }])
    .controller('sheetLoadCtrl',['$scope', '$state', 'xlsxService', 'filePath',function($scope, $state, xlsxService, filePath){
        $scope.path = filePath;
        $scope.fileName = path.basename(filePath);
        $scope.current.progress= 25;
        $scope.sheets = xlsxService.load(filePath);
    }])
    .controller('listCtrl',['$scope', function($scope){
    }])
    .controller('settingCtrl',['$scope', function($scope){
    }])
    .controller('settingUserCtrl',['$scope', '$mdToast', 'settingService', 'setting', function($scope, $mdToast, settingService, setting){
        $scope.setting = setting;
        $scope.current = {
            status : 1
        };
        $scope.onSave = onSave;


        function onSave() {
            settingService.setItemBatch({
                sender_email: $scope.setting.sender_email,
                sender_password: $scope.setting.sender_password,
                smtp_host: $scope.setting.smtp_host,
                smtp_port: $scope.setting.smtp_port,
            });
            $mdToast.show(
                $mdToast.simple()
                    .textContent('保存成功！')
                    .position('left bottom')
                    .hideDelay(3000)
            );
        }
    }])
    .controller('settingTemplateCtrl',['$scope', '$mdToast', 'templateService', 'template', function($scope, $mdToast, templateService, template){
        $scope.template = template;
        $scope.current = {
            status : 1
        };
        $scope.onSave = onSave;


        function onSave() {
            templateService.setAll(template);
            $mdToast.show(
                $mdToast.simple()
                    .textContent('保存成功！')
                    .position('left bottom')
                    .hideDelay(3000)
            );
        }
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
            '   <div class="drop-area" id="file-drop-area"  layout="column" flex layout-align="center center" my-drop-zone on-file-drop="onFileDrop">' +
            '      <div class="drop-area-icon" layout="column" flex layout-align="center bottom">' +
            '          <ng-md-icon icon="cloud_download" size="100" style="fill:{{$root.mdPrimaryColor}};"></ng-md-icon>' +
            '      </div>' +
            '      <div class="drop-area-tip" layout="column" layout-align="center center" flex ng-if="!!current.filePath" ng-bind="current.filePath"></div>' +
            '      <div class="drop-area-tip" layout="column" layout-align="center center" flex ng-if="!current.filePath">点击选择xls文件或将文件拖放到这里</div>' +
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
    }])
    .directive('myInputUppercase', ['$filter', function($filter) {
        return {
            restrict: 'EA',
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                function toUpper(text) {
                    return (text || '').toUpperCase();
                }
                ngModel.$parsers.push(toUpper);
                ngModel.$formatters.push(toUpper);
            }
        }
    }])
;
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
                        templateUrl:'tmpls/pages/open.html',
                        controller: 'openCtrl'
                    }
                }
            })
            .state('app.sheet', {
                url: '/sheet',
                abstract: true,
                views: {
                    main: {
                        templateUrl:'tmpls/pages/sheet/sheet.html',
                        controller: 'sheetCtrl'
                    },
                }
            })
            .state('app.sheet.load', {
                url: '/load?filePath',
                views: {
                    step: {
                        templateUrl:'tmpls/pages/sheet/load.html',
                        controller: 'sheetLoadCtrl',
                        params: ['filePath'],
                        resolve:{
                            filePath: ['$stateParams',function($stateParams){
                                return $stateParams.filePath;
                            }]
                        },
                    },
                }
            })
            .state('app.sheet.list', {
                url: '/list',
                views: {
                    main: {
                        templateUrl:'tmpls/pages/sheet/list.html',
                        controller: 'sheetListCtrl'
                    },
                }
            })
            .state('app.setting', {
                url: '/setting',
                absolute: true,
                views: {
                    main: {
                        templateUrl:'tmpls/pages/setting/setting.html',
                        controller: 'settingCtrl'
                    }
                }
            })
            .state('app.setting.user', {
                url: '/user',
                views: {
                    list: {
                        templateUrl:'tmpls/pages/setting/user.html',
                        controller: 'settingUserCtrl',
                        resolve: {
                            setting: ['settingService', function (settingService){
                                return settingService.getAll();
                            }]
                        }
                    }
                }
            })
            .state('app.setting.template', {
                url: '/template',
                views: {
                    list: {
                        templateUrl:'tmpls/pages/setting/template.html',
                        controller: 'settingTemplateCtrl',
                        resolve: {
                            template: ['templateService', function (templateService){
                                return templateService.getAll();
                            }]
                        }
                    }
                }
            })
        }
    ]);

;var angular = require('angular'),
    XLSX = require('xlsx');
angular
    .module('app.service',[])
    .service('xlsxService',['config', function(config) {

        var WORKBOOK = null;
        return {
            load: load
        };

        function load(filePath) {
            WORKBOOK = XLSX.readFile(filePath);
            return WORKBOOK.Sheets;
        }
    }])
    .service('templateService',['config', 'databaseService' ,function(config, databaseService) {
        var TEMPLATES = config.get().TEMPLATES,
            dbName = 'template';

        return {
            init: init,
            getAll: getAll,
            setAll: setAll
        };

        function init() {
            var settingSql = 'DROP TABLE IF EXISTS '+dbName+'; CREATE TABLE ' + dbName + ' (id INTEGER PRIMARY KEY AUTOINCREMENT, cell STRING, cellColumn STRING);';
            var sqls = [];
            for(var key in TEMPLATES) {
                sqls.push("INSERT INTO " + dbName + " VALUES (NULL, '" + key +"','"+ TEMPLATES[key] +"')");
            }
            databaseService.create(dbName, settingSql+sqls.join(';'));
        }

        function getAll() {
            var data = {},
                query = databaseService.table(dbName);
            data = _getValues(query);
            return data;
        }

        function setAll(data) {
            var sqls = [];
            for(var key in data) {
                sqls.push('UPDATE '+dbName+' SET cellColumn="'+data[key]+'" WHERE cell="'+key+'"');
            }
            sqls = sqls.join(';');
            return databaseService.execute(dbName,sqls);
        }



        function _getValues(query) {
            var data = {};
            if(query && query.length){
                query = query[0].values;
            }
            if(query && query.length) {
                for(var item in query) {
                    data[query[item][1]] = query[item][2];
                }
            }
            return data;
        }
    }])
    .service('settingService',['config', 'databaseService' ,function(config, databaseService) {

        var SETTINGS = config.get().SETTINGS,
            dbName = 'setting';

        return {
            init: init,
            getAll: getAll,
            getItem: getItem,
            setItem: setItem,
            getItemBatch: getItemBatch,
            setItemBatch: setItemBatch
        };

        function init() {
            var settingSql = 'DROP TABLE IF EXISTS '+dbName+'; CREATE TABLE ' + dbName + ' (id INTEGER PRIMARY KEY AUTOINCREMENT, itemKey STRING, itemValue STRING);';
            var sqls = [];
            for(var key in SETTINGS) {
                sqls.push("INSERT INTO " + dbName + " VALUES (NULL, '" + key +"','"+ SETTINGS[key] +"')");
            }
            databaseService.create(dbName, settingSql+sqls.join(';'));
        }

        function getAll() {
            var data = {},
                query = databaseService.table(dbName);
            data = _getValues(query);
            return data;
        }

        function getItem(key) {
            var data = null,
                query = databaseService.filter(dbName, 'SELECT * FROM '+ dbName + ' WHERE itemKey=:key;', {':key': key});
            if(query) {
                data = {};
                data[query['itemKey']] = query['itemValue'];
            }
            return data;
        }

        function setItem(key, value) {
            return databaseService.execute(dbName,'UPDATE '+dbName+' SET itemValue="'+value+'" WHERE itemKey="'+key+'";');
        }

        function getItemBatch(keys) {
            var sqls = [];
            for(var index in keys) {
                sqls.push((sqls.length ?' OR ' :'') +' itemKey="'+keys[index]+'" ');
            }
            sqls = sqls.join(' ');
            sqls = 'SELECT * FROM '+dbName+' WHERE '+ sqls;
            var query = databaseService.execute(dbName,sqls);
            var data = _getValues(query);
            return data;
        }

        function setItemBatch(data) {
            var sqls = [];
            for(var key in data) {
                sqls.push('UPDATE '+dbName+' SET itemValue="'+data[key]+'" WHERE itemKey="'+key+'"');
            }
            sqls = sqls.join(';');
            return databaseService.execute(dbName,sqls);
        }

        function _getValues(query) {
            var data = {};
            if(query && query.length){
                query = query[0].values;
            }
            if(query && query.length) {
                for(var item in query) {
                    data[query[item][1]] = query[item][2];
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
            SETTINGS: {},
            TEMPLATES: {}
        };
        this.setSetting = setSetting;
        this.setTemplate = setTemplate;
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
        function setTemplate(template) {
            options.TEMPLATES = template;
        }
    }])
    .config(['$mdThemingProvider',function($mdThemingProvider) {
        //red,
        // pink,
        // purple,
        // deep-purple,
        // indigo,
        // blue,
        // light-blue,
        // cyan,
        // teal,
        // green,
        // light-green,
        // lime,
        // yellow,
        // amber,
        // orange,
        // deep-orange,
        // brown,
        // grey,
        // blue-grey
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
        var template = {
            employee_email : 'K',
            employee_name : 'B',
            employee_department : 'C',
            employee_workday : 'R',
            employee_attendance : 'T',
            wage_base : 'L',
            wage_allowance : 'M',
            wage_reward : 'N',
            wage_everyday : 'Q',
            wage_total : 'O',
            deductions_absence : 'U',
            deductions_sick_leave : 'V',
            deductions_other : 'W',
            deductions_social_security : 'X',
            deductions_provident_fund : 'Y',
            deductions_personal_tax : 'Z',
            final_amount : 'AC'
        };
        configProvider.setSetting(setting);
        configProvider.setTemplate(template);
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
            filter: filter,
            execute: execute,
            table: table,
            create: create
        };

        /**
         * Create database with sql, by default table name will be database name
         * @param database
         * @param sql
         * @returns {boolean}
         */
        function create(database, sql) {

            if(DB && DB[database]){
                return ;
            }
            if(!_exist(database)) {
                var db = new SQL.Database();
                db.run(sql);
                DB[database] = db;
                _commit(database);
                return true;
            }
            return false;
        }

        /**
         * Query data by filtered sql with filter data
         * @param database
         * @param string
         * @param filter
         * @returns {*}
         */
        function filter(database, string, filter) {
            var data = null;
            if(_open(database) && _isopen(database)){
                var db = DB[database];
                var stmt = db.prepare(string);
                data = stmt.getAsObject(filter);
            }
            return data;
        }

        /**
         * Execute sql and return result
         * @param database
         * @param sql
         * @returns {*}
         */
        function execute(database, sql) {
            var data = null;
            if(_open(database) && _isopen(database)){
                var db = DB[database];
                data = db.exec(sql);
                _commit(database);
            }
            return data;
        }

        /**
         * Query all data in a table
         * @param database
         * @returns {*}
         */
        function table(database) {
            var data = null;
            if(_open(database) && _isopen(database)) {
                var db = DB[database];
                data = db.exec("SELECT * FROM "+ database);
            }
            return data;
        }

        /**
         * Check database exist status
         * @param database
         * @returns {*}
         * @private
         */
        function _exist(database) {
            return fs.existsSync(_getDbPath(database));
        }

        /**
         * Check database open status
         * @param database
         * @returns {Array|*}
         * @private
         */
        function _isopen(database) {
            return DB && DB[database] && DB[database]['db'];
        }

        /**
         * Open database
         * @param database
         * @returns {boolean}
         * @private
         */
        function _open(database) {
            if(_isopen(database)){
                return true;
            }
            try {
                var fileBuffer = fs.readFileSync(_getDbPath(database));
                DB[database] = new SQL.Database(fileBuffer);
                return true;
            } catch (e) {
                return false;
            }

        }

        /**
         * Export and persistent database data
         * @param database
         * @private
         */
        function _commit(database) {
            try {
                if(_isopen(database)) {
                    var db = DB[database],
                        data = db.export(),
                        buffer = new Buffer(data);
                    fs.writeFileSync(_getDbPath(database), buffer);
                }
            }catch (e){

            }finally {
                return ;
            }
        }

        /**
         * Get database file full path
         * @param database
         * @private
         */
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
    angularAnimiate = require('angular-animate'),
    angularAria = require('angular-aria'),
    angularMaterial = require('angular-material'),
    angularMdIcons = require('angular-material-icons'),
    app = angular.module('app', [
        angularAnimiate,
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

app.run(['$rootScope', '$state', '$mdColors', 'settingService', 'templateService' ,function ($rootScope, $state,$mdColors, settingService, templateService) {

    $rootScope.mdPrimaryColor = $mdColors.getThemeColor('pink');

    settingService.init();
    templateService.init();


}])
;
app.bootstrap = function () {
    angular.bootstrap(window.document, ['app']);
};
app.bootstrap();

