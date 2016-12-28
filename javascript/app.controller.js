var angular = require('angular'),
    remote = require('electron').remote,
    path = require('path');

angular
    .module('app.controller',[])
    .controller('appCtrl',['$rootScope', '$scope', '$mdColors',function($rootScope, $scope, $mdColors){

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
    .controller('contentCtrl',['$scope',function($scope){

    }])
    .controller('homeCtrl',['$scope',function($scope){

    }])
    .controller('sheetCtrl',['$scope', 'config', function($scope, config){
        var now = new Date();
        $scope.STATUS = config.get().STATUS;
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
    .controller('sheetListCtrl',['$scope', '$state', '$mdDialog', 'xlsxService', 'historyService', 'templateDetail', function($scope, $state, $mdDialog, xlsxService, historyService, templateDetail){
        $scope.current.progress= 50;
        $scope.current.imported= [];
        $scope.templateDetail = templateDetail;
        $scope.keyword = '';
        $scope.onNext = onNext;
        $scope.onDetailDialog = onDetailDialog;

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
    .controller('sheetSendCtrl',['$scope', '$state', '$mdDialog', '$mdPanel', 'settingService', 'templateDetail', 'emailService', 'deliveryService', function($scope, $state, $mdDialog, $mdPanel, settingService, templateDetail, emailService, deliveryService){
        $scope.current.progress = 75;
        $scope.nowTab= 0;
        $scope.nowChecked= [];
        $scope.templateDetail = templateDetail;
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
                controller: ['$scope', '$mdPanel', 'mdPanelRef', 'STATUS', 'type', 'email', function ($scope, $mdPanel, mdPanelRef, STATUS, type, email) {
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
            // var email = emailService.generate(item, $scope.current.year, $scope.current.month);
            // deliveryService
            //     .send(email)
            //     .then(function (info) {
            //         console.info('success', info);
            //     }, function (error) {
            //         console.info('errow', info);
            //     })
            //     .finally(function () {
            //         console.info('finally');
            //     });



            var uuid = item.uuid;
            $scope.current.imported.map(function(val){
                if(val.uuid === uuid) {
                    val.statusSent = Math.floor(Math.random() * 100) % 2 === 0 ? $scope.STATUS.SUCCESS : $scope.STATUS.FAIL;
                }
            });
            $scope.nowChecked = $scope.nowChecked.filter(function(val){
                return val.uuid !== uuid;
            });
        }

        function onSendAll() {
            var uuids = $scope.nowChecked.map(function(val){
                return val.uuid;
            });
            $scope.nowChecked.length = 0;
            $scope.current.imported.map(function(val){
                if(uuids.indexOf(val.uuid) > -1 ) {
                    val.statusSent = Math.floor(Math.random() * 100) % 2 === 0 ? $scope.STATUS.SUCCESS : $scope.STATUS.FAIL;
                }
            });
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

    }])
    .controller('sheetDoneCtrl',['$scope', function($scope){
        $scope.current.progress = 100;
    }])
    .controller('historyCtrl',['$scope', function($scope){
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

