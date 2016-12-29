var angular = require('angular'),
    remote = require('electron').remote,
    path = require('path');

angular
    .module('app.controller',[])
    .controller('appCtrl',['$rootScope', '$scope',function($rootScope, $scope){

    }])
    .controller('menuCtrl',['$scope', '$state', '$mdDialog',function($scope, $state, $mdDialog){
        $scope.window = remote.getCurrentWindow();
        $scope.onExit = onExit;
        $scope.onMaximum = onMaximum;
        $scope.onDevTool = onDevTool;
        $scope.onMinimize = onMinimize;
        $scope.onHelp = onHelp;
        $scope.onAbout = onAbout;

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
            $scope.window.webContents.openDevTools();
        }
        function onHelp(event) {
            _dialogOpen('help', event);
        }
        function onAbout(event) {
            _dialogOpen('about', event);
        }

        function _dialogOpen(type, event) {
            $mdDialog
                .show({
                    templateUrl: 'tmpls/dialogs/dialog.' + type + '.html',
                    parent: angular.element(document.body),
                    targetEvent: event,
                    clickOutsideToClose:true,
                    fullscreen: false,
                    controller: ['$scope', '$mdDialog', function($scope, $mdDialog) {
                            $scope.hide = function() {
                            $mdDialog.hide();
                        };
                    }],
                })
            ;
        }

    }])
    .controller('contentCtrl',['$scope', '$mdDialog', 'config','templateDetail',function($scope, $mdDialog, config, templateDetail){
        $scope.templateDetail = templateDetail;
        $scope.onDetailDialog = onDetailDialog;
        $scope.STATUS = config.get().STATUS;

        function onDetailDialog(event) {
            $mdDialog
                .show({
                    templateUrl: 'tmpls/dialogs/dialog.template.detail.html',
                    parent: angular.element(document.body),
                    targetEvent: event,
                    clickOutsideToClose:true,
                    fullscreen: false,
                    locals: {
                        templateDetail: $scope.templateDetail
                    },
                    controller: ['$scope','$mdDialog', 'templateDetail',function ($scope, $mdDialog, templateDetail) {
                        $scope.templateDetail = templateDetail;
                        $scope.onClose = function() {
                            $mdDialog.hide();
                        };
                    }]
                })
            ;
        }
    }])
    .controller('homeCtrl',['$scope',function($scope){

    }])
    .controller('sheetCtrl',['$scope', function($scope){
        var now = new Date();
        $scope.current = {
            year: now.getFullYear(),
            month: now.getMonth() + 1,
            progress: 0,
            filePath:'',
            fileName:'',
            sheetName:'',
            imported: []
        };
    }])
    .controller('sheetOpenCtrl',['$scope', '$state', '$filter', '$mdToast',function($scope, $state, $filter, $mdToast){
        $scope.current.progress= 0;
        $scope.openner = {
            status : 0,
            fileType: ['xls','xlsx'],
            file: null
        };
        $scope.onFileChange = onFileChange;
        $scope.onStart = onStart;

        function onFileChange(file) {
            var isValid = false;
            if(file && file.path) {
                isValid = $filter('filetype')(file.path, $scope.openner.fileType.join(','));
            }
            if(!isValid) {
                $scope.openner.status = -1;
                $mdToast.show(
                    $mdToast.simple()
                        .textContent('不支持的文件类型!')
                        .position('bottom center')
                );
                return false;
            }
            $scope.openner.status = 1;
            $scope.openner.file = file;
        }
        function onStart() {
            if($scope.openner.file) {
                $scope.current.filePath = $scope.openner.file.path;
                $state.go('app.sheet.load');
            }
        }
    }])
    .controller('sheetLoadCtrl',['$scope', '$state', 'xlsxService',function($scope, $state, xlsxService){
        $scope.current.progress= 25;
        $scope.current.fileName = path.basename($scope.current.filePath);
        $scope.sheetNames = xlsxService.load($scope.current.filePath);
        $scope.current.sheetName = $scope.sheetNames[0];
        $scope.onNext = onNext;

        function onNext() {
            $state.go('app.sheet.list');
        }
    }])
    .controller('sheetListCtrl',['$scope', '$state', '$mdDialog', 'xlsxService', 'historyService', function($scope, $state, $mdDialog, xlsxService, historyService){
        $scope.current.progress= 50;
        $scope.current.imported= [];
        $scope.keyword = '';
        $scope.onNext = onNext;

        onPreSelect();
        onWatchFilter();
        function onWatchFilter() {
            $scope.$watch('keyword', function(newValue) {
                $scope.rowList.map(function(val){
                    val.show = _search(val,newValue);
                });
            });
        }
        function onPreSelect() {
            $scope.rowList = xlsxService.list($scope.current.sheetName);
            for(var i=0;i<$scope.rowList.length;i++) {
                $scope.current.imported.push($scope.rowList[i]);
            }
        }
        function onNext(event) {
            var unchecked =$scope.rowList.length - $scope.current.imported.length,
                uncheckStr = unchecked + '条数据未选择';
            if(!unchecked) {
                _goNext();
                return false;
            }
            $mdDialog.show($mdDialog.confirm()
                .title('确定下一步')
                .textContent('确定下一步('+uncheckStr+')？')
                .ariaLabel('确定继续')
                .targetEvent(event)
                .ok('返回重新选择')
                .cancel('确定下一步')
            ).then(function() {
            }, function() {
                _goNext();
            });
        }

        function _goNext(event) {
            var save = historyService.save($scope.current.year, $scope.current.month, $scope.current.imported);
            if(!save) {
                $mdDialog.show(
                    $mdDialog.alert()
                        .title('导入数据')
                        .textContent('导入数据发生错误，请重试')
                        .ariaLabel('导入数据')
                        .ok('确定')
                        .targetEvent(event)
                );
                return false;
            }
            $state.go('app.sheet.send');
        }

        function _search(row, kw) {
            if(!kw) {
                return true;
            }
            for(var key in row) {
                if(String(row[key]).indexOf(kw) > -1){
                    return true;
                }
            }
            return false;
        }

    }])
    .controller('sheetSendCtrl',['$scope', '$state', '$mdDialog', '$mdPanel', 'settingService', 'emailService', 'deliveryService', function($scope, $state, $mdDialog, $mdPanel, settingService, emailService, deliveryService){
        $scope.current.progress = 75;
        $scope.nowTab= 0;
        $scope.nowChecked= [];
        $scope.progress = {
            now: 0,
            total: 0,
            panel: null
        };
        $scope.onDeselectItem = onDeselectItem;
        $scope.onSelectItem = onSelectItem;
        $scope.onViewItem = onViewItem;
        $scope.onSendItem = onSendItem;
        $scope.onSendAll = onSendAll;
        $scope.onNext = onNext;

        onPreCheck();
        function onPreCheck() {
            for(var i=0;i<$scope.current.imported.length;i++) {
                $scope.current.imported[i].statusChecked = true;
                $scope.current.imported[i].statusSent = $scope.STATUS.INIT;
                $scope.nowChecked.push($scope.current.imported[i]);
            }
        }

        function onDeselectItem(item) {
            $scope.current.imported.map(function(val){
                if(val.uuid === item.uuid) {
                    val.statusChecked = false;
                }
            });
        }

        function onSelectItem(item) {
            $scope.current.imported.map(function(val){
                if(val.uuid === item.uuid) {
                    val.statusChecked = true;
                }
            });
        }

        function onViewItem(type, item) {
            $mdPanel.open( {
                animation:$mdPanel.newPanelAnimation().withAnimation($mdPanel.animation.FADE),
                attachTo: angular.element(document.body),
                disableParentScroll: this.disableParentScroll,
                templateUrl: 'tmpls/dialogs/dialog.preview.html',
                hasBackdrop: true,
                panelClass: 'dialog-preview',
                position: $mdPanel.newPanelPosition().absolute().center(),
                trapFocus: true,
                zIndex: 150,
                clickOutsideToClose: true,
                escapeToClose: true,
                focusOnOpen: true,
                locals: {
                    STATUS: $scope.STATUS,
                    type: type,
                    email: emailService.generate(item, $scope.current.year, $scope.current.month)
                },
                controller: ['$scope', 'mdPanelRef', 'STATUS', 'type', 'email', function ($scope, mdPanelRef, STATUS, type, email) {
                    $scope.STATUS = STATUS;
                    $scope.type = type;
                    $scope.email = email;
                    $scope.preview = 'html';
                    $scope.onClose = function() {
                        mdPanelRef.close();
                    };
                }]
            });
        }

        function onSendItem(item) {
            _sendList([item]);
        }

        function onSendAll() {
            _sendList(angular.copy($scope.nowChecked));
        }

        function onNext(event) {
            var inited = 0,
                failed = 0,
                initedStr = '',
                failedStr = '';
            $scope.current.imported.map(function(val){
                switch(val.statusSent) {
                    case $scope.STATUS.INIT:
                        inited += 1;
                        break;
                    case $scope.STATUS.FAIL:
                        failed += 1;
                        break;
                    case $scope.STATUS.SUCCESS:
                    default:
                        break;
                }
            });

            if( !inited && !failed ) {
                _goNext();
                return false;
            }

            initedStr += inited ? inited + '条未发送' : '';
            failedStr += (initedStr && failed) ? '，' + '' : '';
            failedStr += failed ? failed + '条发送失败' : '';

            $mdDialog.show($mdDialog.confirm()
                .title('完成发送')
                .textContent('确定完成发送('+initedStr+failedStr+')？')
                .ariaLabel('完成发送')
                .targetEvent(event)
                .ok('返回继续发送')
                .cancel('确定完成')
            ).then(function() {
            }, function() {
                _goNext();
            });
            return false;
        }

        function _goNext() {
            $state.go('app.sheet.done');
        }

        function _sendList(list) {
            $scope.progress.now = 1;
            $scope.progress.total = list.length;
            deliveryService.queue($scope.current.year, $scope.current.month, list, _progressCallback, _finishCallback);
            $scope.progress.panel = $mdPanel.create( {
                animation:$mdPanel.newPanelAnimation().withAnimation($mdPanel.animation.FADE),
                attachTo: angular.element(document.body),
                disableParentScroll: this.disableParentScroll,
                templateUrl: 'tmpls/dialogs/dialog.progress.html',
                hasBackdrop: true,
                panelClass: 'dialog-progress',
                position: $mdPanel.newPanelPosition().absolute().center(),
                trapFocus: true,
                zIndex: 150,
                clickOutsideToClose: false,
                escapeToClose: false,
                focusOnOpen: true,
                locals: {
                    progress: $scope.progress
                },
                controller: ['$scope', 'mdPanelRef', 'progress', function ($scope, mdPanelRef, progress) {
                    $scope.progress = progress;
                }]
            });
            $scope.progress.panel.open();
        }

        function _progressCallback(status, data, list, index) {
            var location = null,
                item = list[index];

            $scope.progress.now = index + 1;
            $scope.progress.total = list.length;

            $scope.current.imported.map(function(val){
                if(val.uuid === item.uuid) {
                    val.statusSent = status;
                }
            });

            $scope.nowChecked.map(function(val,ind){
                if(val.uuid === item.uuid) {
                    location = ind;
                    return false;
                }
            });
            if(location !== null){
                $scope.nowChecked.splice(location,1);
            }
        }

        function _finishCallback(list) {
            if ($scope.progress.panel) {
                $scope.progress.panel.close();
            }
        }

    }])
    .controller('sheetDoneCtrl',['$scope', function($scope){
        $scope.current.progress = 100;
    }])
    .controller('historyCtrl',['$scope', '$state', '$mdDialog', '$mdPanel', 'config', 'historyService', function($scope, $state, $mdDialog, $mdPanel, config, historyService){

        $scope.historyList = historyService.list();
        $scope.current = {
            year: '',
            month: '',
            historyDetail: null,
            filter: {}
        };

        $scope.onDelete = onDelete;
        $scope.onSelectMenu = onSelectMenu;

        function onDelete(event) {
            var confirm = $mdDialog.confirm()
                .title('删除记录')
                .textContent('确定删除'+$scope.current.year+'年'+$scope.current.month+'月记录（不可恢复）？')
                .ariaLabel('删除记录')
                .targetEvent(event)
                .ok('取消')
                .cancel('确定删除');

            $mdDialog.show(confirm).then(function() {
            }, function() {
                var remove = historyService.remove($scope.current.year,$scope.current.month);
                if(remove) {
                    $scope.historyList.map(function(val){
                        if(val.year === $scope.current.year) {
                            val.month = val.month.filter(function(item){
                                return item !== $scope.current.month;
                            });
                        }
                    });
                    $state.go('app.history.list');
                    return false;
                }
            });
        }
        function onSelectMenu(event) {
            $mdPanel.open({
                attachTo: angular.element(document.body),
                controllerAs: 'ctrl',
                templateUrl: 'tmpls/dialogs/dialog.menu.list.html',
                panelClass: 'dropmenu',
                position: $mdPanel.newPanelPosition().relativeTo(event.currentTarget).addPanelPosition($mdPanel.xPosition.ALIGN_END, $mdPanel.yPosition.BELOW),
                openFrom: event,
                clickOutsideToClose: true,
                escapeToClose: true,
                focusOnOpen: false,
                zIndex: 2,
                locals: {
                    STATUS: $scope.STATUS,
                    filter: $scope.current.filter
                },
                controller: ['$scope','mdPanelRef', 'STATUS','filter',function($scope,mdPanelRef,STATUS,filter) {
                    $scope.STATUS = STATUS;
                    $scope.filter = filter;
                    $scope.onCheckMenu = onCheckMenu;

                    function onCheckMenu(event, status) {
                        switch(status) {
                            case STATUS.SUCCESS:
                            case STATUS.FAIL:
                            case STATUS.INIT:
                                $scope.filter.statusSent = status;
                                break;
                            case null:
                            default:
                                delete $scope.filter.statusSent;
                                break;
                        }
                        mdPanelRef.close();
                    }
                }],
            });
        }
    }])
    .controller('historyListCtrl',['$scope', function($scope){
        $scope.now = new Date();
        $scope.current.year= '';
        $scope.current.month = '';
        $scope.current.historyDetail = null;
    }])
    .controller('historyDetailCtrl',['$scope', 'historyService', 'year', 'month', function($scope, historyService, year, month){
        $scope.current.year= year;
        $scope.current.month = month;
        $scope.current.historyDetail = historyService.detail(year,month);
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
            '      <div flex></div>' +
            '      <div class="drop-area-icon" layout="column" layout-align="center bottom">' +
            '          <ng-md-icon icon="cloud_download" size="100" style="fill:{{$root.mdPrimaryColor}};"></ng-md-icon>' +
            '      </div>' +
            '      <div class="drop-area-tip" layout="column" layout-align="center center" ng-if="!!current.filePath" ng-bind="current.filePath"></div>' +
            '      <div class="drop-area-tip" layout="column" layout-align="center center" ng-if="!current.filePath">点击选择xls文件或将文件拖放到这里</div>' +
            '      <div flex></div>' +
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

            $urlRouterProvider.otherwise('/home');

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
                        controller: 'contentCtrl',
                        resolve: {
                            templateDetail: ['templateService', function (templateService){
                                return templateService.getDetail();
                            }]
                        }
                    }
                }
            })
            .state('app.home', {
                url: '/home',
                views: {
                    main: {
                        templateUrl:'tmpls/pages/home.html',
                        controller: 'homeCtrl'
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
                    }
                }
            })
            .state('app.sheet.open', {
                url: '/open',
                views: {
                    step: {
                        templateUrl:'tmpls/pages/sheet/open.html',
                        controller: 'sheetOpenCtrl'
                    }
                }
            })
            .state('app.sheet.load', {
                url: '/load',
                views: {
                    step: {
                        templateUrl:'tmpls/pages/sheet/load.html',
                        controller: 'sheetLoadCtrl'
                    }
                }
            })
            .state('app.sheet.list', {
                url: '/list',
                views: {
                    step: {
                        templateUrl:'tmpls/pages/sheet/list.html',
                        controller: 'sheetListCtrl'
                    }
                }
            })
            .state('app.sheet.send', {
                url: '/send',
                views: {
                    step: {
                        templateUrl:'tmpls/pages/sheet/send.html',
                        controller: 'sheetSendCtrl'
                    }
                }
            })
            .state('app.sheet.done', {
                url: '/done',
                views: {
                    step: {
                        templateUrl:'tmpls/pages/sheet/done.html',
                        controller: 'sheetDoneCtrl'
                    }
                }
            })
            .state('app.history', {
                url: '/history',
                abstract: true,
                views: {
                    main: {
                        templateUrl:'tmpls/pages/history/history.html',
                        controller: 'historyCtrl'
                    }
                }
            })
            .state('app.history.list', {
                url: '/list',
                views: {
                    list: {
                        templateUrl:'tmpls/pages/history/list.html',
                        controller: 'historyListCtrl'
                    }
                }
            })
            .state('app.history.detail', {
                url: '/detail?year&month',
                views: {
                    list: {
                        templateUrl:'tmpls/pages/history/detail.html',
                        controller: 'historyDetailCtrl',
                        params: ["year", "month"],
                        resolve:{
                            year: ["$stateParams",function($stateParams){
                                return $stateParams.year;
                            }],
                            month: ["$stateParams",function($stateParams){
                                return $stateParams.month;
                            }]
                        }
                    }
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
    XLSX = require('xlsx'),
    NODE_MAILER = require('nodemailer');
angular
    .module('app.service',[])
    .service('historyService',['config', 'databaseService', function(config,databaseService){
        var dbPrefix = 'history',
            nameSeparator = '_',
            STATUS = config.get().STATUS;
        return {
            list: list,
            save: save,
            detail: detail,
            remove: remove,
            updateRow: updateRow,
        };

        function list() {
            var list= [],
                format= new RegExp("^"+dbPrefix+nameSeparator+"[\\d]{4}"+nameSeparator+"[\\d]{2}$"),
                dbs = databaseService.databases(format);
            for(var i=0;i<dbs.length;i++) {
                var matches = dbs[i].match(new RegExp("^"+dbPrefix+nameSeparator+"([\\d]{4})"+nameSeparator+"([\\d]{2})$")),
                    year= matches[1],
                    month = matches[2],
                    isInList = false;
                list.map(function(val){
                    if(val && val.year && val.year === year) {
                        isInList= true;
                        if(!val.month){
                            val.month = [];
                        }
                        val.month.push(month);
                    }
                });
                if(!isInList) {
                    list.push({
                        year: year,
                        month:[month]
                    });
                }
            }
            return list;
        }

        function updateRow(year, month, uuid, field, value) {
            var dbName = _getDbName(year, month);
            if(!databaseService.exist(dbName)) {
                return false;
            }
            var updateSql = "UPDATE " + dbName + " SET " + field + "='" + value +"'" +"  WHERE " +" uuid='"+uuid+"'";
            return databaseService.execute(dbName,updateSql);
        }

        function save(year,month,data) {
            var dbName = _getDbName(year, month);
            if(!databaseService.exist(dbName)){
                _create(dbName);
            }

            var saveSql = [];
            for(var i=0;i<data.length;i++) {
                var row = data[i];
                var sql = "INSERT INTO " + dbName + " VALUES ( " +
                    "NULL" +
                    ", '" + row.uuid +"'" +
                    ", '" + STATUS.INIT +"'" +
                    ", '" + row.employee_email +"'" +
                    ", '" + row.employee_name +"'" +
                    ", '" + row.employee_department +"'" +
                    ", '" + row.employee_workday +"'" +
                    ", '" + row.employee_attendance +"'" +
                    ", '" + row.wage_base +"'" +
                    ", '" + row.wage_allowance +"'" +
                    ", '" + row.wage_reward +"'" +
                    ", '" + row.wage_everyday +"'" +
                    ", '" + row.wage_total +"'" +
                    ", '" + row.deductions_absence +"'" +
                    ", '" + row.deductions_sick_leave +"'" +
                    ", '" + row.deductions_other +"'" +
                    ", '" + row.deductions_social_security +"'" +
                    ", '" + row.deductions_provident_fund +"'" +
                    ", '" + row.deductions_personal_tax +"'" +
                    ", '" + row.final_amount +"'" +
                    " )";
                saveSql.push(sql);
            }
            return databaseService.execute(dbName,saveSql.join(';'));
        }

        function remove(year,month) {
            var dbName = _getDbName(year, month);
            if(!databaseService.exist(dbName)) {
                return true;
            }
            return databaseService.clean(dbName);
        }

        function detail(year, month) {
            var result = [],
                dbName = _getDbName(year, month),
                data = databaseService.table(dbName);
            if(data && data.length) {
                data = data[0];
                if(data && data.columns && data.values) {
                    var columns = data.columns,
                        values = data.values;
                    for(var k in values) {
                        var item = {};
                        for(var i in data.columns) {
                            item[columns[i]] = values[k][i];
                        }
                        result.push(item);
                    }
                }
            }
            return result;
        }

        function _create(dbName) {
            var createSql = 'DROP TABLE IF EXISTS '+dbName+'; ' +
                'CREATE TABLE ' + dbName + ' (' +
                '  id INTEGER PRIMARY KEY AUTOINCREMENT' +
                ', uuid STRING' +
                ', statusSent STRING' +
                ', employee_email STRING' +
                ', employee_name STRING' +
                ', employee_department STRING' +
                ', employee_workday STRING' +
                ', employee_attendance STRING' +
                ', wage_base STRING' +
                ', wage_allowance STRING' +
                ', wage_reward STRING' +
                ', wage_everyday STRING' +
                ', wage_total STRING' +
                ', deductions_absence STRING' +
                ', deductions_sick_leave STRING' +
                ', deductions_other STRING' +
                ', deductions_social_security STRING' +
                ', deductions_provident_fund STRING' +
                ', deductions_personal_tax STRING' +
                ', final_amount STRING' +
                ');';
            databaseService.create(dbName, createSql);
        }

        function _getDbName(year,month) {
            month = String(month).replace(/^([\d])$/, '0$1');
            return [dbPrefix,year,month].join(nameSeparator);
        }
    }])
    .service('deliveryService',['$q', 'config', '$timeout', 'emailService', 'historyService', function($q, config, $timeout, emailService, historyService){
        var STATUS = config.get().STATUS;
        return {
            queue: queue
        };

        function _send(email) {
            var deferred = $q.defer(),
                smtpConfig = {
                    host: email.setting.smtp_host,
                    port: email.setting.smtp_port,
                    secure: true,
                    auth: {
                        user: email.setting.sender_email,
                        pass: email.setting.sender_password
                    }
                },
                transporter = NODE_MAILER.createTransport(smtpConfig),
                mailOptions = {
                    from: email.setting.sender_email,
                    to: email.data.employee_email,
                    subject: email.subject,
                    text: email.text.replace(/<br\/>/ig,''),
                    html: email.html
                };

            transporter.sendMail(mailOptions, function(error, info){
                if(error){
                    historyService.updateRow(email.year,email.month, email.data.uuid, 'statusSent', STATUS.FAIL);
                    deferred.reject(error);
                }else{
                    historyService.updateRow(email.year,email.month, email.data.uuid, 'statusSent', STATUS.SUCCESS);
                    deferred.resolve(info);
                }
            });
            return deferred.promise;
        }

        function send(email) {
            var deferred = $q.defer();

            $timeout(function(){
                var result = Math.floor(Math.random() * 100 ) %2 === 0;
                if(result) {
                    deferred.resolve(result);
                }else {
                    deferred.reject(result);
                }
            }, 1000);
            return deferred.promise;
        }

        function queue(year, month, list, progress, finish, index, sleeper) {
            index = index || 0;
            sleeper = sleeper || 2000;
            var total = list.length,
                email = emailService.generate(year, month, list[index]);

            send(email)
                .then(function(info){
                    progress(STATUS.SUCCESS, info, list, index);
                },function(error){
                    progress(STATUS.FAIL, error, list, index);
                })
                .finally(function () {
                    if(index < total - 1) {
                        index = index +1;
                        $timeout(function(){
                            queue(year, month, list, progress, finish, index, sleeper);
                        }, sleeper);
                        return false;
                    }
                    finish(list);
                })
            ;
        }
    }])
    .service('emailService',['$sce', 'settingService',function($sce, settingService){
        var TYPE = {
            html: 'html',
            text: 'text'
        };
        return {
            generate: generate
        };

        function generate(data, year, month) {
            return {
                data: data,
                year: year,
                month: month,
                setting: settingService.getAll(),
                subject: generateSubject(data, year, month),
                html: renderHtml(data, year, month),
                text: renderText(data, year, month),
                htmlIframe: renderHtmlIframe(data, year, month),
                textIframe: renderTextIframe(data, year, month)
            };
        }

        function generateSubject(data, year, month) {
            return ''+year+'年'+month+'月工资条'
        }

        function _renderIframe(type,data,year,month) {
            var iframe = document.createElement('iframe');
            var html = '';
            switch(type) {
                case TYPE.html:
                    html = renderHtml(data,year,month);
                    break;
                case TYPE.text:
                    html = renderText(data,year,month);
                    break;
                default:
                    break;
            }
            iframe.src = 'data:text/html;charset=utf-8,' + encodeURI(html);
            iframe.width = '100%';
            iframe.height = '100%';
            return $sce.trustAsHtml(iframe.outerHTML);
        }

        function renderHtmlIframe (data,year,month) {
            return _renderIframe(TYPE.html, data, year, month);
        }

        function renderTextIframe (data,year,month) {
            return _renderIframe(TYPE.text, data, year, month);
        }

        function renderHtml(data,year,month) {
            return `
                <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
                <html xmlns="http://www.w3.org/1999/xhtml">
                <head>
                    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
                    <meta name="viewport" content="width=device-width, initial-scale=1"/>
                    <title>汇誉财经邮件</title>
                    <style type="text/css">
                        * {
                            color: #555;
                        }
                        table {
                            table-layout: fixed;
                            border-collapse: collapse;
                            border: none;
                            width: 100%;
                        }
                        td {
                            border: solid windowtext 1pt;
                            border-collapse: collapse;
                            padding: 0 10px;
                        }
                        .container {
                            max-width: 900px;
                            margin: 0 auto;
                        }
                        .item-line td {
                            background: #FBE5D6;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <br />
                        <h4>你好，${year}年${month}月工资表明细如下，请注意查收，如果在工资方面有任何疑问，请及时反馈！</h4>
                        <br />
                        <table border="1" cellspacing="0" cellpadding="0" width="100%">
                            <tbody>
                            <tr class="item-line">
                                <td width="100%" colspan="9" valign="top">
                                    <p align="center">
                                        <strong>
                                            <span>员工信息</span>
                                        </strong>
                                    </p>
                                </td>
                            </tr>
                            <tr class="item-cells">
                                <td valign="top">
                                    <p>
                                        <span>年度</span>
                                    </p>
                                </td>
                                <td colspan="2" valign="top">
                                    <p>
                                        <span lang="EN-US">${year}</span>
                                    </p>
                                </td>
                                <td valign="top">
                                    <p>
                                        <span>月份</span>
                                    </p>
                                </td>
                                <td colspan="2" valign="top">
                                    <p>
                                        <span lang="EN-US">${month}</span>
                                    </p>
                                </td>
                                <td colspan="2" valign="top">
                                    <p>
                                        <span>姓名</span>
                                    </p>
                                </td>
                                <td valign="top">
                                    <p>
                                        <span>${data.employee_name}</span>
                                    </p>
                                </td>
                            </tr>
                            <tr class="item-cells">
                                <td valign="top">
                                    <p>
                                        <span>部门</span>
                                    </p>
                                </td>
                                <td colspan="2" valign="top">
                                    <p>
                                        <span>${data.employee_department}</span>
                                    </p>
                                </td>
                                <td valign="top">
                                    <p>
                                        <span>满勤天数</span>
                                    </p>
                                </td>
                                <td colspan="2" valign="top">
                                    <p>
                                        <span lang="EN-US">${data.employee_workday}</span>
                                    </p>
                                </td>
                                <td colspan="2" valign="top">
                                    <p>
                                        <span>实际出勤</span>
                                    </p>
                                </td>
                                <td valign="top">
                                    <p>
                                        <span lang="EN-US">${data.employee_attendance}</span>
                                    </p>
                                </td>
                            </tr>
                            <tr class="item-line">
                                <td width="100%" colspan="9" valign="top">
                                    <p align="center">
                                        <strong>
                                            <span>应发项目</span>
                                        </strong>
                                    </p>
                                </td>
                            </tr>
                            <tr class="item-cells">
                                <td valign="top">
                                    <p>
                                        <span>基本工资</span>
                                    </p>
                                </td>
                                <td colspan="2" valign="top">
                                    <p>
                                        <span lang="EN-US">${data.wage_base}</span>
                                    </p>
                                </td>
                                <td valign="top">
                                    <p>
                                        <span>岗位津贴</span>
                                    </p>
                                </td>
                                <td colspan="2" valign="top">
                                    <p>
                                        <span lang="EN-US">${data.wage_allowance}</span>
                                    </p>
                                </td>
                                <td colspan="2" valign="top">
                                    <p>
                                        <span>奖金</span>
                                    </p>
                                </td>
                                <td valign="top">
                                    <p>
                                        <span lang="EN-US">${data.wage_reward}</span>
                                    </p>
                                </td>
                            </tr>
                            <tr class="item-cells">
                                <td valign="top">
                                    <p>
                                        <span>日工资</span>
                                    </p>
                                </td>
                                <td colspan="2" valign="top">
                                    <p>
                                        <span lang="EN-US">${data.wage_everyday}</span>
                                    </p>
                                </td>
                                <td valign="top">
                                    <p>
                                        <span>应发合计</span>
                                    </p>
                                </td>
                                <td colspan="2" valign="top">
                                    <p>
                                        <span lang="EN-US">${data.wage_total}</span>
                                    </p>
                                </td>
                                <td colspan="2" valign="top">
                                    <p>
                                        <span lang="EN-US">&nbsp;</span>
                                    </p>
                                </td>
                                <td valign="top">
                                    <p>
                                        <span lang="EN-US">&nbsp;</span>
                                    </p>
                                </td>
                            </tr>
                            <tr class="item-line">
                                <td width="100%" colspan="9" valign="top">
                                    <p align="center">
                                        <strong>
                                            <span>扣除项目</span>
                                        </strong>
                                    </p>
                                </td>
                            </tr>
                            <tr class="item-cells">
                                <td colspan="2" valign="top">
                                    <p>
                                        <span>缺勤扣款</span>
                                    </p>
                                </td>
                                <td valign="top">
                                    <p>
                                        <span lang="EN-US">${data.deductions_absence}</span>
                                    </p>
                                </td>
                                <td colspan="2" valign="top">
                                    <p>
                                        <span>病事假扣款</span>
                                    </p>
                                </td>
                                <td colspan="2" valign="top">
                                    <p>
                                        <span lang="EN-US">${data.deductions_sick_leave}</span>
                                    </p>
                                </td>
                                <td valign="top">
                                    <p>
                                        <span>其他扣款</span>
                                    </p>
                                </td>
                                <td valign="top">
                                    <p>
                                        <span lang="EN-US">${data.deductions_other}</span>
                                    </p>
                                </td>
                            </tr>
                            <tr class="item-cells">
                                <td colspan="2" valign="top">
                                    <p>
                                        <span>社保个人部分</span>
                                    </p>
                                </td>
                                <td valign="top">
                                    <p>
                                        <span lang="EN-US">${data.deductions_social_security}</span>
                                    </p>
                                </td>
                                <td colspan="2" valign="top">
                                    <p>
                                        <span>公积金个人部分</span>
                                    </p>
                                </td>
                                <td colspan="2" valign="top">
                                    <p>
                                        <span lang="EN-US">${data.deductions_provident_fund}</span>
                                    </p>
                                </td>
                                <td valign="top">
                                    <p>
                                        <span>个税</span>
                                    </p>
                                </td>
                                <td valign="top">
                                    <p>
                                        <span lang="EN-US">${data.deductions_personal_tax}</span>
                                    </p>
                                </td>
                            </tr>
                            <tr class="item-line">
                                <td width="100%" colspan="9" valign="top">
                                    <p align="center">
                                        <strong>
                                            <span>实发项目</span>
                                        </strong>
                                    </p>
                                </td>
                            </tr>
                            <tr class="item-cells">
                                <td valign="top">
                                    <p>
                                        <span>实发工资</span>
                                    </p>
                                </td>
                                <td colspan="8" valign="top">
                                    <p>
                                        <span lang="EN-US">${data.final_amount}</span>
                                    </p>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </body>
                </html>
            `;
        }

        function renderText(data,year,month) {
            return `
            你好，${year}年${month}月工资表明细如下，请注意查收，如果在工资方面有任何疑问，请及时反馈！<br/>
            <br/>
            ╔══════════════════════════════════════════════════════════<br/>
            ║ 员工信息<br/>
            ║──────────────────────────────────────────────────────────<br/>
            ║           年度：${year}<br/>
            ║           月份：${month}<br/>
            ║           姓名：${data.employee_name}<br/>
            ║           部门：${data.employee_department}<br/>
            ║           满勤天数：${data.employee_workday}<br/>
            ║           实际出勤：${data.employee_attendance}<br/>
            ╟──────────────────────────────────────────────────────────<br/>
            ║ 应发项目<br/>
            ╟──────────────────────────────────────────────────────────<br/>
            ║           基本工资：${data.wage_base}<br/>
            ║           岗位津贴：${data.wage_allowance}<br/>
            ║           奖金：${data.wage_reward}<br/>
            ║           日工资：${data.wage_everyday}<br/>
            ║           应发合计：${data.wage_total}<br/>
            ╟──────────────────────────────────────────────────────────<br/>
            ║ 扣除项目<br/>
            ╟──────────────────────────────────────────────────────────<br/>
            ║           缺勤扣款：${data.deductions_absence}<br/>
            ║           病事假扣款：${data.deductions_sick_leave}<br/>
            ║           其他扣款：${data.deductions_other}<br/>
            ║           社保个人部分：${data.deductions_social_security}<br/>
            ║           公积金个人部分：${data.deductions_provident_fund}<br/>
            ║           个税：${data.deductions_personal_tax}<br/>
            ╟──────────────────────────────────────────────────────────<br/>
            ║ 实发项目<br/>
            ╟──────────────────────────────────────────────────────────<br/>
            ║           实发工资：${data.final_amount}<br/>
            ╚══════════════════════════════════════════════════════════<br/>
            `
        }
    }])
    .service('xlsxService',['$filter', 'UtilService' , 'templateService', function($filter, UtilService, templateService) {

        var WORKBOOK = null,
            WOOKSHEET = null;
        return {
            load: load,
            list: list
        };

        function load(filePath) {
            WORKBOOK = XLSX.readFile(filePath);
            return WORKBOOK.SheetNames;
        }

        function list(sheetName) {
            var data = [],
                template = templateService.getAll();
            WOOKSHEET = WORKBOOK.Sheets[sheetName];

            data = _parse(WOOKSHEET, template);
            return data;
        }

        function _parse(sheet, template) {
            var data = [];
            if(sheet['!ref']) {
                var match = sheet['!ref'].match(/^([A-Z]+?)([\d]+?):([A-Z]+?)([\d]+?)$/),
                    maxRow = match[4],
                    rowIndex = 0;
                for(;rowIndex<maxRow;rowIndex++) {
                    if(_isValidRow(sheet,rowIndex,template.employee_email)) {
                        var row= {};
                        for(var t in template) {
                            var cell = sheet[(template[t]+''+rowIndex)];
                            if(cell && cell.v){
                                row[t] = cell.v;
                                if(t=='wage_everyday') {
                                    row[t] = Number(cell.v).toFixed(2);
                                }
                            }else {
                                row[t] = '-';
                            }
                        }
                        row['uuid'] = UtilService.guid();
                        data.push(row);
                    }
                }
            }
            return data;
        }
        function _isValidRow(sheet, rowIndex, emailColumn) {
            var cell = sheet[emailColumn+''+rowIndex];
            if(cell && cell.v && $filter('isemail')(cell.v)) {
                return true;
            }
            return false;
        }
    }])
    .service('templateService',['config', 'databaseService' ,function(config, databaseService) {
        var TEMPLATES = config.get().TEMPLATES,
            dbName = 'template';

        return {
            init: init,
            getAll: getAll,
            setAll: setAll,
            getDetail: getDetail
        };

        function init() {
            var settingSql = 'DROP TABLE IF EXISTS '+dbName+'; ' +
                'CREATE TABLE ' + dbName + ' ( ' +
                'id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
                'cell STRING, ' +
                'cellColumn STRING ' +
                ');';
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

        function getDetail() {
            var result = {},
                data = getAll();
            for(var key in data) {
                result[key] = {
                    disabled: _getDisable(key),
                    value: data[key],
                    show: _getShow(key),
                    label: _getLabel(key)
                };
            }
            return result;
        }

        function _getDisable(key) {
            var disables = [
                'employee_email',
                'employee_name',
            ];
            return (disables.indexOf(key)>-1);
        }

        function _getShow(key) {
            var hiddens = [
                'employee_department',
                'employee_workday',
                'wage_everyday',
                'wage_reward',
                'deductions_other',
                'deductions_social_security',
                'deductions_provident_fund',
                'deductions_personal_tax'
            ];
            return !(hiddens.indexOf(key)>-1)
        }

        function _getLabel(key) {
            switch (key) {
                case 'employee_email':
                    return '员工邮箱';
                case 'employee_name':
					return '员工姓名';
                case 'employee_department':
					return '员工部门';
                case 'employee_workday':
					return '满勤天数';
                case 'employee_attendance':
					return '实际出勤';
                case 'wage_base':
					return '基本工资';
                case 'wage_allowance':
					return '岗位津贴';
                case 'wage_reward':
					return '员工奖金';
                case 'wage_everyday':
					return '日工资';
                case 'wage_total':
					return '应发合计';
                case 'deductions_absence':
					return '缺勤扣款';
                case 'deductions_sick_leave':
					return '病事假扣款';
                case 'deductions_other':
					return '其他扣款';
                case 'deductions_social_security':
					return '社保个人部分';
                case 'deductions_provident_fund':
					return '公积金个人部分';
                case 'deductions_personal_tax':
					return '个税';
                case 'final_amount':
                    return '实发工资';
                default:
                    break;
            }
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
            var settingSql = 'DROP TABLE IF EXISTS '+dbName+'; ' +
                'CREATE TABLE ' + dbName + ' ( ' +
                'id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
                'itemKey STRING, ' +
                'itemValue STRING ' +
                ');';
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
    .service('UtilService', [function () {
        return {
            guid: guid
        };

        function guid () {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                return v.toString(16);
            });
        }
    }])
;
;var angular = require('angular');

angular
    .module('app.config',[])
    .provider("config",[function(){
        var options = {
            SETTINGS: {},
            TEMPLATES: {},
            STATUS: {}
        };
        this.setSetting = setSetting;
        this.setTemplate = setTemplate;
        this.setStatus = setStatus;
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
        function setStatus(status) {
            options.STATUS = status;
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
            .accentPalette('pink');
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
        var status = {
            INIT: 'init',
            SUCCESS: 'success',
            FAIL: 'fail'
        };
        configProvider.setSetting(setting);
        configProvider.setTemplate(template);
        configProvider.setStatus(status);
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
            databases: databases,
            filter: filter,
            execute: execute,
            table: table,
            create: create,
            exist: exist,
            clean: clean
        };

        /**
         * Get all databases by format from db files directory
         * @param format
         * @returns {Array}
         */
        function databases(format) {
            var result = [],
                path = _getDbPath(''),
                files = fs.readdirSync(path);
            for (var i=0;i<files.length;i++) {
                var fileName = files[i];
                if(format.test(fileName)){
                    result.push(fileName);
                }
            }
            return result;
        }

        /**
         * Clean a database by move db file unrecognized
         * @param database
         * @returns {boolean}
         */
        function clean(database) {
            var path = _getDbPath(database),
                newPath = path + '.' + (new Date()).getTime() + '.backup' ;
            try {
                fs.renameSync(path, newPath);
            }catch (e) {
                return false;
            }
            return true;
        }

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
            if(!exist(database)) {
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
        function exist(database) {
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
    .filter('isemail',[function(){
        return function(input){
            return input && /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i.test(input);
        }
    }])
;;var angular = require('angular'),
    angularAnimiate = require('angular-animate'),
    angularAria = require('angular-aria'),
    angularMaterial = require('angular-material'),
    angularMdIcons = require('angular-material-icons'),
    angularMdTable = require('angular-material-data-table'),
    app = angular.module('app', [
        angularAnimiate,
        angularAria,
        angularMaterial,
        angularMdIcons,
        angularMdTable,
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

