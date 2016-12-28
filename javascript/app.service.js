var angular = require('angular'),
    XLSX = require('xlsx'),
    NODE_MAILER = require('nodemailer');
angular
    .module('app.service',[])
    .service('historyService',['config', 'databaseService', function(config,databaseService){
        var dbPrefix = 'history',
            nameSeparator = '_',
            STATUS = config.get().STATUS;
        return {
            list: list,
            save: save,
            detail: detail
        };

        function list() {
            var format= new RegExp("^"+dbPrefix+nameSeparator+"[\\d]{4}"+nameSeparator+"[\\d]{2}$");
            return databaseService.databases(format);
        }

        function save(year,month,data) {
            var dbName = _getDbName(year, month);
            if(!databaseService.exist(dbName)){
                _create(dbName);
            }

            var saveSql = [];
            for(var i=0;i<data.length;i++) {
                var row = data[i];
                var sql = "INSERT INTO " + dbName + " VALUES ( " +
                    "NULL" +
                    ", '" + row.uuid +"'" +
                    ", '" + STATUS.INIT +"'" +
                    ", '" + row.employee_email +"'" +
                    ", '" + row.employee_name +"'" +
                    ", '" + row.employee_department +"'" +
                    ", '" + row.employee_workday +"'" +
                    ", '" + row.employee_attendance +"'" +
                    ", '" + row.wage_base +"'" +
                    ", '" + row.wage_allowance +"'" +
                    ", '" + row.wage_reward +"'" +
                    ", '" + row.wage_everyday +"'" +
                    ", '" + row.wage_total +"'" +
                    ", '" + row.deductions_absence +"'" +
                    ", '" + row.deductions_sick_leave +"'" +
                    ", '" + row.deductions_other +"'" +
                    ", '" + row.deductions_social_security +"'" +
                    ", '" + row.deductions_provident_fund +"'" +
                    ", '" + row.deductions_personal_tax +"'" +
                    ", '" + row.final_amount +"'" +
                    " )";
                saveSql.push(sql);
            }
            return databaseService.execute(dbName,saveSql.join(';'));
        }

        function detail(year, month) {
            var dbName = _getDbName(year, month);
            return databaseService.table(dbName);
        }

        function _create(dbName) {
            var createSql = 'DROP TABLE IF EXISTS '+dbName+'; ' +
                'CREATE TABLE ' + dbName + ' (' +
                '  id INTEGER PRIMARY KEY AUTOINCREMENT' +
                ', uuid STRING' +
                ', statusSent STRING' +
                ', employee_email STRING' +
                ', employee_name STRING' +
                ', employee_department STRING' +
                ', employee_workday STRING' +
                ', employee_attendance STRING' +
                ', wage_base STRING' +
                ', wage_allowance STRING' +
                ', wage_reward STRING' +
                ', wage_everyday STRING' +
                ', wage_total STRING' +
                ', deductions_absence STRING' +
                ', deductions_sick_leave STRING' +
                ', deductions_other STRING' +
                ', deductions_social_security STRING' +
                ', deductions_provident_fund STRING' +
                ', deductions_personal_tax STRING' +
                ', final_amount STRING' +
                ');';
            databaseService.create(dbName, createSql);
        }

        function _getDbName(year,month) {
            month = String(month).replace(/^([\d])$/, '0$1');
            return [dbPrefix,year,month].join(nameSeparator);
        }
    }])
    .service('deliveryService',['$q',function($q){
        return {
            send: send
        };

        function send(email) {
            var deferred = $q.defer(),
                smtpConfig = {
                    host: email.setting.smtp_host,
                    port: email.setting.smtp_port,
                    secure: true,
                    auth: {
                        user: email.setting.sender_email,
                        pass: email.setting.sender_password
                    }
                },
                transporter = NODE_MAILER.createTransport(smtpConfig),
                mailOptions = {
                    from: email.setting.sender_email,
                    to: email.data.employee_email,
                    subject: email.subject,
                    text: email.text.replace(/<br\/>/ig,''),
                    html: email.html
                };

            transporter.sendMail(mailOptions, function(error, info){
                if(error){
                    deferred.reject(error);
                }else{
                    deferred.resolve(info);
                }
            });
            return deferred.promise;
        }
    }])
    .service('emailService',['$sce', 'settingService',function($sce, settingService){
        var TYPE = {
            html: 'html',
            text: 'text'
        };
        return {
            generate: generate
        };

        function generate(data, year, month) {
            return {
                data: data,
                year: year,
                month: month,
                setting: settingService.getAll(),
                subject: generateSubject(data, year, month),
                html: renderHtml(data, year, month),
                text: renderText(data, year, month),
                htmlIframe: renderHtmlIframe(data, year, month),
                textIframe: renderTextIframe(data, year, month)
            };
        }

        function generateSubject(data, year, month) {
            return ''+year+'年'+month+'月工资条'
        }

        function _renderIframe(type,data,year,month) {
            var iframe = document.createElement('iframe');
            var html = '';
            switch(type) {
                case TYPE.html:
                    html = renderHtml(data,year,month);
                    break;
                case TYPE.text:
                    html = renderText(data,year,month);
                    break;
                default:
                    break;
            }
            iframe.src = 'data:text/html;charset=utf-8,' + encodeURI(html);
            iframe.width = '100%';
            iframe.height = '100%';
            return $sce.trustAsHtml(iframe.outerHTML);
        }

        function renderHtmlIframe (data,year,month) {
            return _renderIframe(TYPE.html, data, year, month);
        }

        function renderTextIframe (data,year,month) {
            return _renderIframe(TYPE.text, data, year, month);
        }

        function renderHtml(data,year,month) {
            return `
                <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
                <html xmlns="http://www.w3.org/1999/xhtml">
                <head>
                    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
                    <meta name="viewport" content="width=device-width, initial-scale=1"/>
                    <title>汇誉财经邮件</title>
                    <style type="text/css">
                        * {
                            color: #555;
                        }
                        table {
                            table-layout: fixed;
                            border-collapse: collapse;
                            border: none;
                            width: 100%;
                        }
                        td {
                            border: solid windowtext 1pt;
                            border-collapse: collapse;
                            padding: 0 10px;
                        }
                        .container {
                            max-width: 900px;
                            margin: 0 auto;
                        }
                        .item-line td {
                            background: #FBE5D6;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <br />
                        <h4>你好，${year}年${month}月工资表明细如下，请注意查收，如果在工资方面有任何疑问，请及时反馈！</h4>
                        <br />
                        <table border="1" cellspacing="0" cellpadding="0" width="100%">
                            <tbody>
                            <tr class="item-line">
                                <td width="100%" colspan="9" valign="top">
                                    <p align="center">
                                        <strong>
                                            <span>员工信息</span>
                                        </strong>
                                    </p>
                                </td>
                            </tr>
                            <tr class="item-cells">
                                <td valign="top">
                                    <p>
                                        <span>年度</span>
                                    </p>
                                </td>
                                <td colspan="2" valign="top">
                                    <p>
                                        <span lang="EN-US">${year}</span>
                                    </p>
                                </td>
                                <td valign="top">
                                    <p>
                                        <span>月份</span>
                                    </p>
                                </td>
                                <td colspan="2" valign="top">
                                    <p>
                                        <span lang="EN-US">${month}</span>
                                    </p>
                                </td>
                                <td colspan="2" valign="top">
                                    <p>
                                        <span>姓名</span>
                                    </p>
                                </td>
                                <td valign="top">
                                    <p>
                                        <span>${data.employee_name}</span>
                                    </p>
                                </td>
                            </tr>
                            <tr class="item-cells">
                                <td valign="top">
                                    <p>
                                        <span>部门</span>
                                    </p>
                                </td>
                                <td colspan="2" valign="top">
                                    <p>
                                        <span>${data.employee_department}</span>
                                    </p>
                                </td>
                                <td valign="top">
                                    <p>
                                        <span>满勤天数</span>
                                    </p>
                                </td>
                                <td colspan="2" valign="top">
                                    <p>
                                        <span lang="EN-US">${data.employee_workday}</span>
                                    </p>
                                </td>
                                <td colspan="2" valign="top">
                                    <p>
                                        <span>实际出勤</span>
                                    </p>
                                </td>
                                <td valign="top">
                                    <p>
                                        <span lang="EN-US">${data.employee_attendance}</span>
                                    </p>
                                </td>
                            </tr>
                            <tr class="item-line">
                                <td width="100%" colspan="9" valign="top">
                                    <p align="center">
                                        <strong>
                                            <span>应发项目</span>
                                        </strong>
                                    </p>
                                </td>
                            </tr>
                            <tr class="item-cells">
                                <td valign="top">
                                    <p>
                                        <span>基本工资</span>
                                    </p>
                                </td>
                                <td colspan="2" valign="top">
                                    <p>
                                        <span lang="EN-US">${data.wage_base}</span>
                                    </p>
                                </td>
                                <td valign="top">
                                    <p>
                                        <span>岗位津贴</span>
                                    </p>
                                </td>
                                <td colspan="2" valign="top">
                                    <p>
                                        <span lang="EN-US">${data.wage_allowance}</span>
                                    </p>
                                </td>
                                <td colspan="2" valign="top">
                                    <p>
                                        <span>奖金</span>
                                    </p>
                                </td>
                                <td valign="top">
                                    <p>
                                        <span lang="EN-US">${data.wage_reward}</span>
                                    </p>
                                </td>
                            </tr>
                            <tr class="item-cells">
                                <td valign="top">
                                    <p>
                                        <span>日工资</span>
                                    </p>
                                </td>
                                <td colspan="2" valign="top">
                                    <p>
                                        <span lang="EN-US">${data.wage_everyday}</span>
                                    </p>
                                </td>
                                <td valign="top">
                                    <p>
                                        <span>应发合计</span>
                                    </p>
                                </td>
                                <td colspan="2" valign="top">
                                    <p>
                                        <span lang="EN-US">${data.wage_total}</span>
                                    </p>
                                </td>
                                <td colspan="2" valign="top">
                                    <p>
                                        <span lang="EN-US">&nbsp;</span>
                                    </p>
                                </td>
                                <td valign="top">
                                    <p>
                                        <span lang="EN-US">&nbsp;</span>
                                    </p>
                                </td>
                            </tr>
                            <tr class="item-line">
                                <td width="100%" colspan="9" valign="top">
                                    <p align="center">
                                        <strong>
                                            <span>扣除项目</span>
                                        </strong>
                                    </p>
                                </td>
                            </tr>
                            <tr class="item-cells">
                                <td colspan="2" valign="top">
                                    <p>
                                        <span>缺勤扣款</span>
                                    </p>
                                </td>
                                <td valign="top">
                                    <p>
                                        <span lang="EN-US">${data.deductions_absence}</span>
                                    </p>
                                </td>
                                <td colspan="2" valign="top">
                                    <p>
                                        <span>病事假扣款</span>
                                    </p>
                                </td>
                                <td colspan="2" valign="top">
                                    <p>
                                        <span lang="EN-US">${data.deductions_sick_leave}</span>
                                    </p>
                                </td>
                                <td valign="top">
                                    <p>
                                        <span>其他扣款</span>
                                    </p>
                                </td>
                                <td valign="top">
                                    <p>
                                        <span lang="EN-US">${data.deductions_other}</span>
                                    </p>
                                </td>
                            </tr>
                            <tr class="item-cells">
                                <td colspan="2" valign="top">
                                    <p>
                                        <span>社保个人部分</span>
                                    </p>
                                </td>
                                <td valign="top">
                                    <p>
                                        <span lang="EN-US">${data.deductions_social_security}</span>
                                    </p>
                                </td>
                                <td colspan="2" valign="top">
                                    <p>
                                        <span>公积金个人部分</span>
                                    </p>
                                </td>
                                <td colspan="2" valign="top">
                                    <p>
                                        <span lang="EN-US">${data.deductions_provident_fund}</span>
                                    </p>
                                </td>
                                <td valign="top">
                                    <p>
                                        <span>个税</span>
                                    </p>
                                </td>
                                <td valign="top">
                                    <p>
                                        <span lang="EN-US">${data.deductions_personal_tax}</span>
                                    </p>
                                </td>
                            </tr>
                            <tr class="item-line">
                                <td width="100%" colspan="9" valign="top">
                                    <p align="center">
                                        <strong>
                                            <span>实发项目</span>
                                        </strong>
                                    </p>
                                </td>
                            </tr>
                            <tr class="item-cells">
                                <td valign="top">
                                    <p>
                                        <span>实发工资</span>
                                    </p>
                                </td>
                                <td colspan="8" valign="top">
                                    <p>
                                        <span lang="EN-US">${data.final_amount}</span>
                                    </p>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </body>
                </html>
            `;
        }

        function renderText(data,year,month) {
            return `
            你好，${year}年${month}月工资表明细如下，请注意查收，如果在工资方面有任何疑问，请及时反馈！<br/>
            <br/>
            ╔══════════════════════════════════════════════════════════<br/>
            ║ 员工信息<br/>
            ║──────────────────────────────────────────────────────────<br/>
            ║           年度：${year}<br/>
            ║           月份：${month}<br/>
            ║           姓名：${data.employee_name}<br/>
            ║           部门：${data.employee_department}<br/>
            ║           满勤天数：${data.employee_workday}<br/>
            ║           实际出勤：${data.employee_attendance}<br/>
            ╟──────────────────────────────────────────────────────────<br/>
            ║ 应发项目<br/>
            ╟──────────────────────────────────────────────────────────<br/>
            ║           基本工资：${data.wage_base}<br/>
            ║           岗位津贴：${data.wage_allowance}<br/>
            ║           奖金：${data.wage_reward}<br/>
            ║           日工资：${data.wage_everyday}<br/>
            ║           应发合计：${data.wage_total}<br/>
            ╟──────────────────────────────────────────────────────────<br/>
            ║ 扣除项目<br/>
            ╟──────────────────────────────────────────────────────────<br/>
            ║           缺勤扣款：${data.deductions_absence}<br/>
            ║           病事假扣款：${data.deductions_sick_leave}<br/>
            ║           其他扣款：${data.deductions_other}<br/>
            ║           社保个人部分：${data.deductions_social_security}<br/>
            ║           公积金个人部分：${data.deductions_provident_fund}<br/>
            ║           个税：${data.deductions_personal_tax}<br/>
            ╟──────────────────────────────────────────────────────────<br/>
            ║ 实发项目<br/>
            ╟──────────────────────────────────────────────────────────<br/>
            ║           实发工资：${data.final_amount}<br/>
            ╚══════════════════════════════════════════════════════════<br/>
            `
        }
    }])
    .service('xlsxService',['$filter', 'UtilService' , 'templateService', function($filter, UtilService, templateService) {

        var WORKBOOK = null,
            WOOKSHEET = null;
        return {
            load: load,
            list: list
        };

        function load(filePath) {
            WORKBOOK = XLSX.readFile(filePath);
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
                        row['uuid'] = UtilService.guid();
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
            setAll: setAll,
            getDetail: getDetail
        };

        function init() {
            var settingSql = 'DROP TABLE IF EXISTS '+dbName+'; ' +
                'CREATE TABLE ' + dbName + ' ( ' +
                'id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
                'cell STRING, ' +
                'cellColumn STRING ' +
                ');';
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

        function getDetail() {
            var result = {},
                data = getAll();
            for(var key in data) {
                result[key] = {
                    value: data[key],
                    show: _getShow(key),
                    label: _getLabel(key)
                };
            }
            return result;
        }

        function _getShow(key) {
            var hiddens = [
                'employee_department',
                'employee_workday',
                'wage_everyday',
                'deductions_other',
                'deductions_social_security',
                'deductions_provident_fund',
                'deductions_personal_tax'
            ];
            return !(hiddens.indexOf(key)>-1)
        }

        function _getLabel(key) {
            switch (key) {
                case 'employee_email':
                    return '员工邮箱';
                case 'employee_name':
					return '员工姓名';
                case 'employee_department':
					return '员工部门';
                case 'employee_workday':
					return '满勤天数';
                case 'employee_attendance':
					return '实际出勤';
                case 'wage_base':
					return '基本工资';
                case 'wage_allowance':
					return '岗位津贴';
                case 'wage_reward':
					return '员工奖金';
                case 'wage_everyday':
					return '日工资';
                case 'wage_total':
					return '应发合计';
                case 'deductions_absence':
					return '缺勤扣款';
                case 'deductions_sick_leave':
					return '病事假扣款';
                case 'deductions_other':
					return '其他扣款';
                case 'deductions_social_security':
					return '社保个人部分';
                case 'deductions_provident_fund':
					return '公积金个人部分';
                case 'deductions_personal_tax':
					return '个税';
                case 'final_amount':
                    return '实发工资';
                default:
                    break;
            }
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
            var settingSql = 'DROP TABLE IF EXISTS '+dbName+'; ' +
                'CREATE TABLE ' + dbName + ' ( ' +
                'id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
                'itemKey STRING, ' +
                'itemValue STRING ' +
                ');';
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
    .service('UtilService', [function () {
        return {
            guid: guid
        };

        function guid () {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                return v.toString(16);
            });
        }
    }])
;
