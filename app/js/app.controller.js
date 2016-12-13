var $ = require('jquery'),
    angular = require('angular');

angular
    .module('app.controller',[])
    .controller('appCtrl',[function(){

    }])
    .controller('homeCtrl',['$scope',function($scope){
        $scope.name = 'ssss';
        $scope.onFileChange = onFileChange;

        function onFileChange(event) {
            $scope.name = event.target.files[0].name;
            console.info($scope.name)
        }
    }]);

