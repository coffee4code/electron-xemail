var $ = require('jquery'),
    angular = require('angular'),
    remote = require('electron').remote;

angular
    .module('app.controller',[])
    .controller('appCtrl',['$scope',function($scope){
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

    }])
    .controller('contentCtrl',['$scope',function($scope){

    }])
    .controller('openCtrl',['$scope', '$state', '$filter',function($scope, $state, $filter){
        $scope.current = {
            status : 0,
            fileType: ['xls','xlsx'],
            file: null
        };
        $scope.onFileChange = onFileChange;
        $scope.onStart = onStart;

        function onFileChange(file) {
            var isValid = $filter('filetype')(file.path, $scope.current.fileType.join(','));
            if(isValid) {
                $scope.current.status = 1;
                $scope.current.file = file;
            }
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

