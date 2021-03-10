const {
    createLogger,
    transports,
    format
} = require('winston');

const logger = createLogger({
    transports:[
        new transports.Console({
            level:'info',
            format: format.combine(format.timestamp(),format.simple())
        }),
        new transports.File({
            filename:'error.log',
            level:'info',
            format: format.combine(format.timestamp(),format.simple())
        }),
    ]
})

module.exports = logger;