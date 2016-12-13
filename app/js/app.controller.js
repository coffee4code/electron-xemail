var angular = require('angular');

angular
    .module('app.controller',[])
    .controller('appCtrl',function(){
    console.info('appCtrl')
})
    .controller('homeCtrl',function(){
    console.info('homeCtrl')

});

