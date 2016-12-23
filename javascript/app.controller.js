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
            $scope.window.webContents.openDevTools();
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
            progress: 0,
            filePath:'',
            fileName:'',
            sheetName:''
        };
    }])
    .controller('sheetLoadCtrl',['$scope', '$state', 'xlsxService', 'filePath',function($scope, $state, xlsxService, filePath){
        $scope.current.progress= 25;
        $scope.current.filePath = filePath;
        $scope.current.fileName = path.basename(filePath);
        $scope.sheetNames = xlsxService.load(filePath);
        $scope.onNext = onNext;

        function onNext() {
            $state.go('app.sheet.list');
        }
    }])
    .controller('sheetListCtrl',['$scope', 'xlsxService', 'templateDetail', function($scope, xlsxService, templateDetail){
        var rowList = xlsxService.list($scope.current.sheetName);
        $scope.current.progress= 50;
        $scope.templateDetail = templateDetail;
        $scope.rowListClone = angular.copy(rowList);
        $scope.selected = [];
        $scope.keyword = '';
        $scope.onNext = onNext;

        onWatchFilter();
        function onWatchFilter() {
            $scope.$watch('keyword', function(newValue) {
                $scope.rowList = $scope.rowListClone.filter(function(val){
                    return _search(val,newValue);
                });
            });
        }
        function onNext() {
            console.info($scope.selected);
        }

        function _search(row, kw) {
            if(!kw) {
                return row;
            }
            for(var key in row) {
                if(String(row[key]).indexOf(kw) > -1){
                    return row;
                }
            }
            return null;
        }

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
    .controller('settingTemplateCtrl',['$scope', '$mdToast', 'templateService', 'template', 'templateDetail', function($scope, $mdToast, templateService, template, templateDetail){
        $scope.template = template;
        $scope.templateDetail = templateDetail;
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

