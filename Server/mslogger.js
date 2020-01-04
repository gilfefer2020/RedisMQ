const winston = require('winston');

module.exports = {
    InitializeLogger: function () {
        //
        // All Info will go to the console and debug and error will go to ebug.log and error..og respectivly
        //
        const logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
            defaultMeta: { service: 'user-service' },
            transports: [
                new winston.transports.Console(),
                new winston.transports.File({ filename: 'error.log', level: 'error' }),
                new winston.transports.File({ filename: 'debug.log', level: 'debug' })
            ]
        });
        return logger;
    }
};