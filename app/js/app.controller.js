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

