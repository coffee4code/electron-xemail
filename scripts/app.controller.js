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

