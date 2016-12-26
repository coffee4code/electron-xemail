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

            $urlRouterProvider.otherwise('/home');

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
            .state('app.home', {
                url: '/home',
                views: {
                    main: {
                        templateUrl:'tmpls/pages/home.html',
                        controller: 'homeCtrl'
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
                    }
                }
            })
            .state('app.sheet.open', {
                url: '/open',
                views: {
                    step: {
                        templateUrl:'tmpls/pages/sheet/open.html',
                        controller: 'sheetOpenCtrl'
                    }
                }
            })
            .state('app.sheet.load', {
                url: '/load',
                views: {
                    step: {
                        templateUrl:'tmpls/pages/sheet/load.html',
                        controller: 'sheetLoadCtrl'
                    }
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
                    }
                }
            })
            .state('app.sheet.send', {
                url: '/send',
                views: {
                    step: {
                        templateUrl:'tmpls/pages/sheet/send.html',
                        controller: 'sheetSendCtrl'
                    }
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

