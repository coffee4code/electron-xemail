var angular = require('angular'),
    fs = require('fs'),
    SQL = require('sql.js'),
    path = require('path');


angular
    .module('app.database',[])
    .service('databaseService',[function(){

        var DB = [];

        return {
            queryByString: queryByString,
            executeByString: executeByString,
            queryTableData: queryTableData,
            createWithData: createWithData,
        };

        function createWithData(database, sql) {

            if(DB && DB[database]){
                return ;
            }
            if(!_exist(database)) {
                var db = new SQL.Database();
                db.run(sql);
                DB[database] = db;
                _commit(database);
            }
        }

        function queryByString(database, string, filter) {
            var data = null;
            _open(database);
            if(_isopen(database)){
                var db = DB[database];
                var stmt = db.prepare(string);
                data = stmt.getAsObject(filter);
            }
            return data;
        }

        function executeByString(database, sql) {
            var data = null;
            _open(database);
            if(_isopen(database)){
                var db = DB[database];
                data = db.exec(sql);
                _commit(database);
            }
            return data;
        }

        function queryTableData(database) {
            var data = null;
            _open(database);
            if(_isopen(database)) {
                var db = DB[database];
                data = db.exec("SELECT * FROM "+ database);
                db.close();
            }
            return data;
        }

        function _exist(database) {
            return fs.existsSync(_getDbPath(database));
        }

        function _isopen(database) {
            return DB && DB[database] && DB[database]['db'];
        }

        function _open(database) {
            if(_isopen(database)){
                return;
            }
            var fileBuffer = fs.readFileSync(_getDbPath(database));
            DB[database] = new SQL.Database(fileBuffer);
        }
        function _commit(database) {
            if(_isopen(database)) {
                var db = DB[database],
                    data = db.export(),
                    buffer = new Buffer(data);
                fs.writeFileSync(_getDbPath(database), buffer);
            }
        }
        function _getDbPath(database) {
            return path.resolve(__dirname, 'database', database)
        }

    }])
;
