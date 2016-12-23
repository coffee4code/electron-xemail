var angular = require('angular'),
    XLSX = require('xlsx');
angular
    .module('app.service',[])
    .service('xlsxService',['$filter','templateService', function($filter, templateService) {

        var WORKBOOK = null,
            WOOKSHEET = null;
        return {
            load: load,
            list: list
        };

        function load(filePath) {
            WORKBOOK = XLSX.readFile(filePath);
            console.info(WORKBOOK);
            return WORKBOOK.SheetNames;
        }

        function list(sheetName) {
            var data = [],
                template = templateService.getAll();
            WOOKSHEET = WORKBOOK.Sheets[sheetName];

            data = _parse(WOOKSHEET, template);
            return data;
        }

        function _parse(sheet, template) {
            var data = [];
            if(sheet['!ref']) {
                var match = sheet['!ref'].match(/^([A-Z]+?)([\d]+?):([A-Z]+?)([\d]+?)$/),
                    maxRow = match[4],
                    rowIndex = 0;
                for(;rowIndex<maxRow;rowIndex++) {
                    if(_isValidRow(sheet,rowIndex,template.employee_email)) {
                        var row= {};
                        for(var t in template) {
                            var cell = sheet[(template[t]+''+rowIndex)];
                            if(cell && cell.v){
                                row[t] = cell.v;
                                if(t=='wage_everyday') {
                                    row[t] = Number(cell.v).toFixed(2);
                                }
                            }else {
                                row[t] = '-';
                            }
                        }
                        data.push(row);
                    }
                }
            }
            return data;
        }
        function _isValidRow(sheet, rowIndex, emailColumn) {
            var cell = sheet[emailColumn+''+rowIndex];
            if(cell && cell.v && $filter('isemail')(cell.v)) {
                return true;
            }
            return false;
        }
    }])
    .service('templateService',['config', 'databaseService' ,function(config, databaseService) {
        var TEMPLATES = config.get().TEMPLATES,
            dbName = 'template';

        return {
            init: init,
            getAll: getAll,
            setAll: setAll
        };

        function init() {
            var settingSql = 'DROP TABLE IF EXISTS '+dbName+'; CREATE TABLE ' + dbName + ' (id INTEGER PRIMARY KEY AUTOINCREMENT, cell STRING, cellColumn STRING);';
            var sqls = [];
            for(var key in TEMPLATES) {
                sqls.push("INSERT INTO " + dbName + " VALUES (NULL, '" + key +"','"+ TEMPLATES[key] +"')");
            }
            databaseService.create(dbName, settingSql+sqls.join(';'));
        }

        function getAll() {
            var data = {},
                query = databaseService.table(dbName);
            data = _getValues(query);
            return data;
        }

        function setAll(data) {
            var sqls = [];
            for(var key in data) {
                sqls.push('UPDATE '+dbName+' SET cellColumn="'+data[key]+'" WHERE cell="'+key+'"');
            }
            sqls = sqls.join(';');
            return databaseService.execute(dbName,sqls);
        }



        function _getValues(query) {
            var data = {};
            if(query && query.length){
                query = query[0].values;
            }
            if(query && query.length) {
                for(var item in query) {
                    data[query[item][1]] = query[item][2];
                }
            }
            return data;
        }
    }])
    .service('settingService',['config', 'databaseService' ,function(config, databaseService) {

        var SETTINGS = config.get().SETTINGS,
            dbName = 'setting';

        return {
            init: init,
            getAll: getAll,
            getItem: getItem,
            setItem: setItem,
            getItemBatch: getItemBatch,
            setItemBatch: setItemBatch
        };

        function init() {
            var settingSql = 'DROP TABLE IF EXISTS '+dbName+'; CREATE TABLE ' + dbName + ' (id INTEGER PRIMARY KEY AUTOINCREMENT, itemKey STRING, itemValue STRING);';
            var sqls = [];
            for(var key in SETTINGS) {
                sqls.push("INSERT INTO " + dbName + " VALUES (NULL, '" + key +"','"+ SETTINGS[key] +"')");
            }
            databaseService.create(dbName, settingSql+sqls.join(';'));
        }

        function getAll() {
            var data = {},
                query = databaseService.table(dbName);
            data = _getValues(query);
            return data;
        }

        function getItem(key) {
            var data = null,
                query = databaseService.filter(dbName, 'SELECT * FROM '+ dbName + ' WHERE itemKey=:key;', {':key': key});
            if(query) {
                data = {};
                data[query['itemKey']] = query['itemValue'];
            }
            return data;
        }

        function setItem(key, value) {
            return databaseService.execute(dbName,'UPDATE '+dbName+' SET itemValue="'+value+'" WHERE itemKey="'+key+'";');
        }

        function getItemBatch(keys) {
            var sqls = [];
            for(var index in keys) {
                sqls.push((sqls.length ?' OR ' :'') +' itemKey="'+keys[index]+'" ');
            }
            sqls = sqls.join(' ');
            sqls = 'SELECT * FROM '+dbName+' WHERE '+ sqls;
            var query = databaseService.execute(dbName,sqls);
            var data = _getValues(query);
            return data;
        }

        function setItemBatch(data) {
            var sqls = [];
            for(var key in data) {
                sqls.push('UPDATE '+dbName+' SET itemValue="'+data[key]+'" WHERE itemKey="'+key+'"');
            }
            sqls = sqls.join(';');
            return databaseService.execute(dbName,sqls);
        }

        function _getValues(query) {
            var data = {};
            if(query && query.length){
                query = query[0].values;
            }
            if(query && query.length) {
                for(var item in query) {
                    data[query[item][1]] = query[item][2];
                }
            }
            return data;
        }

    }])
;
