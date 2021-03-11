
require("dotenv").config();
module.exports = {

    /**Declaration of databases for my development environment**/

    "databases": [
        {
            "name": "MINDCHALLENGE",
            "server": process.env.MINDCHALLENGE_SERVER,
            "port": parseInt(process.env.MINDCHALLENGE_PORT),
            "database": process.env.MINDCHALLENGE_DATABASE, //you should always save these values in environment variables
            "user": process.env.MINDCHALLENGE_USER,  //only for testing purposes you can also define the values here
            "password": process.env.MINDCHALLENGE_PASSWORD
        }
    ],

}