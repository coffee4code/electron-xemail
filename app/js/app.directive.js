var $ = require('jquery'),
    angular = require('angular');

angular
    .module('app.directive',[])
    .directive('myOnChange', [function() {
        return {
            restrict: 'A',
            scope: {
                myOnChange:'='
            },
            link: function (scope, element, attrs) {
                element.bind('change', function(event){
                    scope.$apply(function(){
                        scope.myOnChange(event);
                    });
                });
            }
        };
    }]);
