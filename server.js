const express = require('express');
const bodyParser = require('body-parser');
const swaggerJsdoc = require('swagger-jsdoc');
const sql = require('mssql');
const jwt = require('jsonwebtoken');
const config = require('./config');
const logger = require('./logger');
//const { Sequelize } = require('sequelize');
require("dotenv").config();
const swaggerUi = require('swagger-ui-express');

const swaggerjson = require('../ChallengeApi/swagger.json');
const fileUpload = require('express-fileupload');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const cors = require("cors");
const fs = require('fs');
const serverV2 = require('./serverV2')



require("dotenv").config();


const swaggerDocument = require('./swagger.json');
//const swaggerDocs = swaggerJsdoc(swaggerjson);
const app = express();
const port = 40000;
const rutasProtegidas = express.Router();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));







const path = require('path');
//const __dirname = path.resolve(path.dirname(''));
const log_file_err = fs.createWriteStream(__dirname + '/error.log', { flags: 'a' });




app.set('llave', process.env.JWT_KEY);

//enable files upload
app.use(fileUpload({
    createParentPath: true
}));

app.use('/archivos', express.static('archivos'));


app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({
    extended: true,
    limit: '100mb'
}));
app.use(cors());




app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});


//middleware para proteger la rest api de rutas indebidas, en particular cuando la llamada viene sin headers

rutasProtegidas.use((req, res, next) => {
    const token = req.headers['authorization'];

    if (token) {
        jwt.verify(token, app.get('llave'), (err, decoded) => {
            if (err) {
                return res.json({ mensaje: 'Token inválida' });
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        res.send(401, 'Token no provista');
        /*   res.send({
              mensaje: 'Token no provista.'
          }); */
    }
});


///

function sendEmail(mailInfo) {

    var mailOptions = {
        from: mailInfo.from,
        to: mailInfo.to,
        subject: mailInfo.subject,
        text: mailInfo.text,
        html: mailInfo.html
    };


    //si se va a mandar por gmail activar el acceso de aplicacones poco seguros en el propio GMAIL
    //https://myaccount.google.com/lesssecureapps?pli=1

    try {
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'roberto.aguirre.rodriguez@gmail.com',
                pass: '********'
            }
        });


        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                logger.log('info', `sendMail error: ${error}`);
            } else {
                console.log('Correo enviado: ' + info.response);

                logger.log('info', `mail sent: ${error}`);
            }
        });


    } catch (e) {
        console.log(e);
        logger.log('info', `sendmail transporter error: ${e}`);

    }
}

function getConnectionString(appname) {
    let connection;
    for (let i = 0; i <= config.databases.length; i++) {
        if (config.databases[i].name == appname) {
            return connection = config.databases[i];
        }
    }

}

async function execSql(req, res) {
    let ev = req.body;
    let sqlquery = buildQuery(ev.sp, ev.params);
    let connection = getConnectionString(ev.appname);


    const pool = new sql.ConnectionPool(connection);
    pool.on('error', err => {
        // ... error handler 
        console.log('sql errors', err);

        logger.log('info', `sql errors: ${err}`);

    });

    try {
        await pool.connect();
        let result = await pool.request().query(sqlquery);
        return { success: result };
    } catch (err) {

        return { err: err };
    } finally {
        pool.close(); //closing connection after request is finished.
    }
};



function buildQuery(sp, params) {
    var query = "";
    let p = ""
    params.forEach(element => {

        p = p + element

    });

    query = sp + ' ' + p;
    console.log(query);
    logger.log('info', `run query: ${query}`);
    return query;
}

app.get('/api/hello', function (req, res) {
    res.send('Inicio pruebas REST');
});

module.exports = {
    greetings:greetings,
    sendEmail:sendEmail,
    getConnectionString:getConnectionString,
    findUser:findUser,
    execSql:execSql,
    buildQuery:buildQuery
    
}
function greetings (name){
    return `Hello ${name}`;
}




//creacion de registro de usuario con clave usuario encriptado
app.post('/api/register', (req, res) => {

    var ev = req.body;
    let params = ev.params;
    var connection = getConnectionString(ev.appname);

    bcrypt.hash(params.pass, 10, async function (err, hash) {

        let q = `Register '${params.userName}', '${params.mail}','${hash}' `;

        const pool = new sql.ConnectionPool(connection);
        pool.on('error', err => {
            // ... error handler 
            console.log('sql errors', err);

            logger.log('info', `sql errors: ${err}`);
        });

        try {
            await pool.connect();
            let result = await pool.request().query(q);
            res.send({ success: result.recordset[0] });
            return { success: result.recordset[0] };
        } catch (err) {

            console.log(err);

            logger.log('info', `register user error: ${err}`);
            return { err: err };
        } finally {
            pool.close(); //closing connection after request is finished.
        }
    })

})

app.post('/api/updateuser', (req, res) => {

    var ev = req.body;
    let params = ev.params;
    var connection = getConnectionString(ev.appname);

    bcrypt.hash(params.pass, 10, async function (err, hash) {

        let q = `UpdateUser ${params.idUser}, '${params.userName}', '${params.mail}','${hash}' `;

        const pool = new sql.ConnectionPool(connection);
        pool.on('error', err => {
            // ... error handler 
            console.log('sql errors', err);
            logger.log('info', `update user error: ${err}`);
        });

        try {
            await pool.connect();
            let result = await pool.request().query(q);
            res.send({ success: result.rowsAffected[0] });
            return { success: result.rowsAffected[0] };
        } catch (err) {

            console.log(err);
            logger.log('info', `update user error: ${err}`);
            return { err: err };
        } finally {
            pool.close(); //closing connection after request is finished.
        }
    })

})



app.post('/api/authenticate', async (req, res) => {

    var ev = req.body;
    let params = ev.params;

    let sqlquery = `Authenticate '${params.userName}'`;
    var connection = getConnectionString(ev.appname);

    const pool = new sql.ConnectionPool(connection);
    pool.on('error', err => {
        // ... error handler 
        console.log('sql errors', err);
        logger.log('info', `Sql errors: ${err}`);
    });

    try {
        await pool.connect();
        let result = await pool.request().query(sqlquery);

        let passInTheDatabase = result.recordset[0].pass;


        // Pass saved encrypted password as second parameter
        bcrypt.compare(params.pass, passInTheDatabase, function (err, _res) {
            if (_res == true) {
                /*   res.send({ success: "OK", access: true });
                  return { success: "OK", access: true }; */

                ///generating and sending the token

                if (result.recordset.length < 0) {
                    res.send('USER NOT FOUND');
                } else {
                    //res.send(recordset);

                    let _u = result.recordset[0];



                    if (_u !== undefined) {
                        const payload = {
                            user: _u,
                            check: true
                        };
                        const token = jwt.sign(payload, app.get('llave'), {
                            expiresIn: 1440  //el tiempo de expiración del token
                        });
                        res.json({
                            acceso: true,
                            mensaje: 'Autenticación correcta',
                            token: token,
                            id: _u.idUser
                        });
                    } else {
                        res.json(
                            {
                                acceso: false,
                                mensaje: "Usuario o contraseña incorrectos"
                            }
                        )
                    }
                }

                //



            } else {
                res.send({ success: "OK", access: false, message: "usuario no encontrado" });
                return { success: "OK", access: false };
            }
        });



        //return { success: result };
    } catch (err) {
        logger.log('info', `${err}`);
        res.send({ success: "OK", access: false, message: "Usuario no encontrado", error: err });
        return { err: err };
    } finally {
        pool.close(); //closing connection after request is finished.
    }

})


app.post('/api/runsp/', rutasProtegidas, function (req, res) {

    var ev = req.body;

    let sp = ev.sp;


    execSql(req, res).then(function (d) {
        console.log(d);
        logger.log('info', `DBOperation ${d}`);
        res.send(d);
    });

})
/// ENDPOINTS FOR VERSION 2
app.post('/api/v2/runsp/', function (req, res) {
    let ev = req.body;
    let sqlquery = buildQuery(ev.sp, ev.params);
    let connection = getConnectionString(ev.appname);
     serverV2.runsp(req,res,sqlquery,connection);
})

app.get('/api/v2/simpleSum/:n1/:n2',function(req,res){
    let n1 = req.params.n1;
    let n2 = req.params.n2;
    serverV2.simpleSum(req,res,n1,n2);

})

app.post('/api/v2/sequelize/', function (req, res) {
    let ev = req.body;
     serverV2.runQuerySequelize(req,res);
})



//////////////////////////////////


// Simple user controller implementation.
var users = [
    { username: 'jamsesso', age: 20, gender: 'M' },
    { username: 'bettycrocker', age: 20, gender: 'F' }
];


// Version 1 (Old)
function findUser(req, res) {
    res.json(users[req.params.id]);
}

// Version 2 (New & improved)
function findUser2(req, res) {
    if (!users.hasOwnProperty(req.params.id)) {
        res.send(404);
    }
    else {
        res.json(users[req.params.id]);
    }
}





app.listen(port, function () {
    console.log(`RESTApi corriendo en el puerto: ${port}`);
    logger.log('info', `RESTApi usando winston`);
});