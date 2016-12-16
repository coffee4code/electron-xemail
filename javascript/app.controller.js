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

