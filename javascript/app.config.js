var angular = require('angular');

angular
    .module('app.config',[])
    .provider("config",[function(){
        var options = {
            SETTINGS: {},
            TEMPLATES: {}
        };
        this.setSetting = setSetting;
        this.setTemplate = setTemplate;
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
        function setTemplate(template) {
            options.TEMPLATES = template;
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
        var template = {
            employee_email : 'K',
            employee_name : 'B',
            employee_department : 'C',
            employee_workday : 'R',
            employee_attendance : 'T',
            wage_base : 'L',
            wage_allowance : 'M',
            wage_reward : 'N',
            wage_everyday : 'Q',
            wage_total : 'O',
            deductions_absence : 'U',
            deductions_sick_leave : 'V',
            deductions_other : 'W',
            deductions_social_security : 'X',
            deductions_provident_fund : 'Y',
            deductions_personal_tax : 'Z',
            final_amount : 'AC'
        };
        configProvider.setSetting(setting);
        configProvider.setTemplate(template);
    }])

;