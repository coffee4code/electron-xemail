var angular = require('angular');

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
            '      <div class="drop-area-tip" layout="column" flex ng-if="!!current.filePath" ng-bind="current.filePath"></div>' +
            '      <div class="drop-area-tip" layout="column" flex ng-if="!current.filePath">点击选择xls文件或将文件拖放到这里</div>' +
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
    }]);
