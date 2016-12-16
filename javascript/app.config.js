var angular = require('angular');

angular
    .module('app.config',[])
    .provider("config",[function(){
        var options = {
            SETTINGS: {}
        };
        this.setSetting = setSetting;
        this.$get=function(){
            return {
                get:get
            }
        };

        function get(){
            return options;
        }
        function setSetting(setting){
            options.SETTINGS = setting;
        }
    }])
    .config(['$mdThemingProvider',function($mdThemingProvider) {
        //red,
        // pink,
        // purple,
        // deep-purple,
        // indigo,
        // blue,
        // light-blue,
        // cyan,
        // teal,
        // green,
        // light-green,
        // lime,
        // yellow,
        // amber,
        // orange,
        // deep-orange,
        // brown,
        // grey,
        // blue-grey
        $mdThemingProvider.theme('default')
            .primaryPalette('pink')
            .accentPalette('orange');
    }])
    .config(['configProvider',function(configProvider){
        var setting = {
            smtp_host: 'smtp.qq.com',
            smtp_port: '465',
            sender_email : '1062893543@qq.com',
            sender_password : 'anqckibffhrpbcef'
        };
        configProvider.setSetting(setting);
    }])

;