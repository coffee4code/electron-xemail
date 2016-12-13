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
            .state('home', {
                url: '/home',
                views: {
                    main: {
                        templateUrl:'tmpls/home.html',
                        controller: 'homeCtrl'
                    }
                },
                data: {
                    role: 'user'
                }
            })
        }
    ]);

