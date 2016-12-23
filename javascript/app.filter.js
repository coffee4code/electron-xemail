var angular = require('angular');

angular
    .module('app.filter',[])
    .filter('filetype',[function(){
        return function (path, limit) {
            limit = limit.split(',');
            var suffix = path.match(/\.([\w\W]+)/)[1];
            return limit.indexOf(suffix) > -1
        }
    }])
    .filter('isemail',[function(){
        return function(input){
            return input && /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i.test(input);
        }
    }])
;