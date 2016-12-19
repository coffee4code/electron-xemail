var angular = require('angular'),
    fs = require('fs'),
    SQL = require('sql.js'),
    path = require('path');


angular
    .module('app.database',[])
    .service('databaseService',[function(){

        var DB = [];

        return {
            filter: filter,
            execute: execute,
            table: table,
            create: create
        };

        /**
         * Create database with sql, by default table name will be database name
         * @param database
         * @param sql
         * @returns {boolean}
         */
        function create(database, sql) {

            if(DB && DB[database]){
                return ;
            }
            if(!_exist(database)) {
                var db = new SQL.Database();
                db.run(sql);
                DB[database] = db;
                _commit(database);
                return true;
            }
            return false;
        }

        /**
         * Query data by filtered sql with filter data
         * @param database
         * @param string
         * @param filter
         * @returns {*}
         */
        function filter(database, string, filter) {
            var data = null;
            if(_open(database) && _isopen(database)){
                var db = DB[database];
                var stmt = db.prepare(string);
                data = stmt.getAsObject(filter);
            }
            return data;
        }

        /**
         * Execute sql and return result
         * @param database
         * @param sql
         * @returns {*}
         */
        function execute(database, sql) {
            var data = null;
            if(_open(database) && _isopen(database)){
                var db = DB[database];
                data = db.exec(sql);
                _commit(database);
            }
            return data;
        }

        /**
         * Query all data in a table
         * @param database
         * @returns {*}
         */
        function table(database) {
            var data = null;
            if(_open(database) && _isopen(database)) {
                var db = DB[database];
                data = db.exec("SELECT * FROM "+ database);
            }
            return data;
        }

        /**
         * Check database exist status
         * @param database
         * @returns {*}
         * @private
         */
        function _exist(database) {
            return fs.existsSync(_getDbPath(database));
        }

        /**
         * Check database open status
         * @param database
         * @returns {Array|*}
         * @private
         */
        function _isopen(database) {
            return DB && DB[database] && DB[database]['db'];
        }

        /**
         * Open database
         * @param database
         * @returns {boolean}
         * @private
         */
        function _open(database) {
            if(_isopen(database)){
                return true;
            }
            try {
                var fileBuffer = fs.readFileSync(_getDbPath(database));
                DB[database] = new SQL.Database(fileBuffer);
                return true;
            } catch (e) {
            } finally {
                return false;
            }

        }

        /**
         * Export and persistent database data
         * @param database
         * @private
         */
        function _commit(database) {
            try {
                if(_isopen(database)) {
                    var db = DB[database],
                        data = db.export(),
                        buffer = new Buffer(data);
                    fs.writeFileSync(_getDbPath(database), buffer);
                }
            }catch (e){

            }finally {
                return ;
            }
        }

        /**
         * Get database file full path
         * @param database
         * @private
         */
        function _getDbPath(database) {
            return path.resolve(__dirname, 'database', database)
        }

    }])
;
