var $ = require('jquery'),
    angular = require('angular');

angular
    .module('app.directive',[])
    .directive('myContent', [function(){
        return {
            restrict:'EAC',
            link:function (scope, element, attrs) {
                $(element).css({
                    'min-height': (768-96)+'px'
                });
            }
        }
    }])
    .directive('myFilePicker', [function() {
        return {
            restrict: 'EA',
            scope: {
                filePath: '=',
                myOnChange: '='
            },
            template:'' +
                '<div>' +
                '   <input type="text" readonly ng-value="filePath" />' +
                '   <button id="file-button">添加文件</button>' +
                '   <input id="file-input" type="file" my-on-change="onFileChange" style="display: none;" >' +
                '</div>',
            replace:true,
            link: function (scope, element, attrs) {
                var $element = $(element),
                    $input = $element.find('#file-input'),
                    $button = $element.find('#file-button');
                $input.bind('change', function(event){
                    scope.$apply(function(){
                        scope.myOnChange(event);
                    });
                });
                $button.bind('click', function(event){
                    $input.trigger('click');
                });
            }
        };
    }]);
