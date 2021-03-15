const sql = require('mssql');
const server = require('./server');
const { Sequelize } = require('sequelize');
async function runsp(req, res, sqlquery, connection) {
    let ev = req.body;


    const pool = new sql.ConnectionPool(connection);
    pool.on('error', err => {
        // ... error handler 
        console.log('sql errors', err);

        logger.log('info', `sql errors: ${err}`);

    });

    try {
        await pool.connect();
        let result = await pool.request().query(sqlquery);
        res.send(result);
        return { success: result };
    } catch (err) {

        return { err: err };
    } finally {
        pool.close(); //closing connection after request is finished.
    }
}

async function simpleSum(req, res, n1, n2) {
    let sum = Number(n1) + Number(n2);
    res.send(`The sum was: ${n1} + ${n2} = ${sum}`);
}


async function runQuerySequelize(req, res) {
    // Option 2: Passing parameters separately (other dialects)
    let ev = req.body;
    let q = ev.sp;
    const sequelize = new Sequelize('mindchallenge', 'sa', 'R0bertStrife', {
        host: 'localhost',
        dialect: 'mssql' /* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */
    });
    const [results, metadata] = await sequelize.query(q);
    res.send(results);
}

module.exports = {
    runsp: runsp,
    simpleSum: simpleSum,
    runQuerySequelize:runQuerySequelize
}