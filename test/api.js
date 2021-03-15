
const { findUser } = require('../server.js');
const api = require('../server.js');

describe("Endpoint for testing the greeting function", function () {
    // specification code
    describe("Sends a hello message with a name", function () {
        // specification for RGB to HEX converter
        it("literally just says hello", function () {
            var _hello = api.greetings('roberto');

            return _hello;

        });

    });
});

describe("Get connection string based on request", function () {
    it("Get connection string to databse from .env file", function () {
        let connection = api.getConnectionString("MINDCHALLENGE")
        console.log(connection);
        return connection;
    })
})

describe("Sends email using nodemailer", function () {
    it("Sending email", function () {

        let mailOptions = {
            from: 'roberto.aguirre.rodriguez@gmail.com',
            to: 'roberto.aguirre.rodriguez@gmail.com',
            subject: 'test email from rest api',
            text: 'test email from rest api'
            //html: mailInfo.html
        };

        let  sent = api.sendEmail(mailOptions);
        console.log(sent);
        return sent;
    })
})

describe("Finds try versioning v1",function(){
    it("Will return the users",function(){
        
        let req = {
            params:{
                id:1
            }
        }

        let res = {
            "msg":"ok"
        }


        return api.findUser(req,res);
    })
})

describe("Executes sql query",function(){
    it("Will return query resulting recorset", function(){

        //let connection = api.getConnectionString("MINDCHALLENGE");
        let req = {
            
            body:{
                "appname":"MINDCHALLENGE",
                "sp":"GetAllUsers",
                "params":[]
            }
        }
    
        res = {}


       return api.execSql(req,res);
    })
})