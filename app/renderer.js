// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
XLSX = require('xlsx');
console.info(XLSX)

var workbook = XLSX.readFile('user.xls')

console.info(workbook)

var sheet = workbook.Sheets[workbook.SheetNames[0]];

var A6 = sheet['A6'];
console.info(A6)

var nodemailer = require('nodemailer');

var sendEmail = function(somedata){
    var smtpConfig = {
        host: 'smtp.qq.com',
        port: 465,
        secure: true, // use SSL,
                      // you can try with TLS, but port is then 587
        auth: {
            user: '1062893543@qq.com', // Your email id
            pass: 'anqckibffhrpbcef' // Your password
        }
    };

    var transporter = nodemailer.createTransport(smtpConfig);
    // replace hardcoded options with data passed (somedata)
    var mailOptions = {
        from: '1062893543@qq.com', // sender address
        to: '826849018@qq.com', // list of receivers
        subject: 'Test email', // Subject line
        text: 'this is some text', //, // plaintext body
        html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
    }

    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return false;
        }else{
            console.log('Message sent: ' + info.response);
            return true;
        };
    });
}
sendEmail();