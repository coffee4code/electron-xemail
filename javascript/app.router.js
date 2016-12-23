var angular = require('angular'),
    ngRouter = require('angular-ui-router');

angular
    .module('app.router',[ngRouter])
    .config([
        '$stateProvider',
        '$urlRouterProvider',
        '$locationProvider',
        function ($stateProvider, $urlRouterProvider, $locationProvider) {
            $locationProvider.hashPrefix('!');

            $urlRouterProvider.otherwise('/open');

            $stateProvider
            .state('app', {
                url: '',
                abstract: true,
                views: {
                    menu: {
                        templateUrl:'tmpls/menu.html',
                        controller: 'menuCtrl'
                    },
                    content: {
                        templateUrl:'tmpls/content.html',
                        controller: 'contentCtrl'
                    }
                }
            })
            .state('app.open', {
                url: '/open',
                views: {
                    main: {
                        templateUrl:'tmpls/pages/open.html',
                        controller: 'openCtrl'
                    }
                }
            })
            .state('app.sheet', {
                url: '/sheet',
                abstract: true,
                views: {
                    main: {
                        templateUrl:'tmpls/pages/sheet/sheet.html',
                        controller: 'sheetCtrl'
                    },
                }
            })
            .state('app.sheet.load', {
                url: '/load?filePath',
                views: {
                    step: {
                        templateUrl:'tmpls/pages/sheet/load.html',
                        controller: 'sheetLoadCtrl',
                        params: ['filePath'],
                        resolve:{
                            filePath: ['$stateParams',function($stateParams){
                                return $stateParams.filePath;
                            }]
                        },
                    },
                }
            })
            .state('app.sheet.list', {
                url: '/list',
                views: {
                    step: {
                        templateUrl:'tmpls/pages/sheet/list.html',
                        controller: 'sheetListCtrl',
                        resolve: {
                            templateDetail: ['templateService', function (templateService){
                                return templateService.getDetail();
                            }]
                        }
                    },
                }
            })
            .state('app.setting', {
                url: '/setting',
                absolute: true,
                views: {
                    main: {
                        templateUrl:'tmpls/pages/setting/setting.html',
                        controller: 'settingCtrl'
                    }
                }
            })
            .state('app.setting.user', {
                url: '/user',
                views: {
                    list: {
                        templateUrl:'tmpls/pages/setting/user.html',
                        controller: 'settingUserCtrl',
                        resolve: {
                            setting: ['settingService', function (settingService){
                                return settingService.getAll();
                            }]
                        }
                    }
                }
            })
            .state('app.setting.template', {
                url: '/template',
                views: {
                    list: {
                        templateUrl:'tmpls/pages/setting/template.html',
                        controller: 'settingTemplateCtrl',
                        resolve: {
                            template: ['templateService', function (templateService){
                                return templateService.getAll();
                            }],
                            templateDetail: ['templateService', function (templateService){
                                return templateService.getDetail();
                            }]
                        }
                    }
                }
            })
        }
    ]);

