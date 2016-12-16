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
                        templateUrl:'tmpls/open.html',
                        controller: 'openCtrl'
                    }
                }
            })
            .state('app.list', {
                url: '/list?path',
                views: {
                    main: {
                        templateUrl:'tmpls/list.html',
                        controller: 'listCtrl',
                        params: ['path'],
                        resolve:{
                            path: ['$stateParams',function($stateParams){
                                return $stateParams.path;
                            }]
                        },
                    },
                }
            })
            .state('app.setting', {
                url: '/setting',
                views: {
                    main: {
                        templateUrl:'tmpls/setting.html',
                        controller: 'settingCtrl'
                    }
                }
            })
        }
    ]);

