var logger;
var client;
var lastSleep = 0;
// The object returned from setTimeout. It holds the setTimeout object so we can calcle it if a previouse message need to be timedout 
var getNextMessageFunc = null;
// The key name used
var mqname = "mqtest24";
// For testing locally on my computer. If true the redis is not used
var dev = false;
// If Redis is ready, switch to true. This is checked to make sure that access to Redis is done only when Redis is ready
var redisReady = false;

module.exports = {
    InitializeBL: function (log) {
        logger = log;
        logger.debug('Enter InitializeBL()');
        try {
            // Create the Redis client and start the MQ server.
            if (dev == false) {
                var redis = require('redis');
                logger.debug('Create redis client');
                client = redis.createClient(process.env.port, process.env.redisurl);
                logger.debug('Connect to the redis');
                client.on('connect', function () {
                    redisReady = true;

                    // Start the timer that will check the list in Redis only after Redis is ready. 
                    // When the server is loaded for the first time or after a disaster it will stasrt the MQ server. 
                    // The MQ server immediatly checks messages with a time before now to display.
                    module.exports.initializeMQServer();
                    logger.debug('Redis is connected');
                });
            }
        } catch (e) {
            logger.debug('Error - ' + e);
        }
        logger.debug('Exit InitializeBL()');
    },
    initializeMQServer: function () {
        logger.debug('Enter initializeMQServer()');
        try {
            var displayMsgAt = new Date().getTime();
            // Starts immesiatly to check if there are messages to display
            getNextMessageFunc = setTimeout(module.exports.getNextMessage, 1, displayMsgAt);
        } catch (e) {
            logger.debug('Error - ' + e);
        }
        logger.debug('Exit initializeMQServer()');
    },
    // Return help. For testing!!!
    returnHelp: function (res) {
        logger.debug('Enter returnHelp()');
        try {
            res.send('Post echoAtTime with the message you want to display and the time when to display the message. Pass json object with message and timer parameters')
        } catch (e) {
            logger.debug('Error - ' + e);
        }
        logger.debug('Exit returnHelp()');
    },
    // Add a message to Redis.
    echoAtTime: function (echoMsgAt, res) {
        logger.debug('Enter echoAtTime()');
        logger.debug('Try to addMsg with the following: ' + echoMsgAt);

        try {
            if (redisReady == true) {
                var displayMsgAt = new Date(echoMsgAt.time).getTime();
                var timeToDisplayNextMsg = displayMsgAt - new Date().getTime();
                logger.debug('Going to setTimout for: ' + timeToDisplayNextMsg);
                // Don't register messages in the past.
                if (timeToDisplayNextMsg < 0) {
                    res.send("Cannot display message in the past!");
                } else {
                    if (dev == false) {
                        // Register the new message in Redis
                        var JsonMessage = '{"message":' + echoMsgAt.message + ', "displayat":' + displayMsgAt + '}';
                        logger.debug('Before zadd score: ' + displayMsgAt);
                        client.zadd(mqname, displayMsgAt, JsonMessage, function (err, reply) {
                            logger.debug('After zadd: ' + reply);

                            // Check if the new message sould be echo before the previouse message registered. If yes, cancle the previouse message and setTimeout for the new message
                            if (lastSleep == 0 || lastSleep > displayMsgAt) {
                                lastSleep = displayMsgAt;
                                if (getNextMessageFunc) {
                                    clearTimeout(getNextMessageFunc);
                                }

                                logger.debug('Going to setTimout with displayMsgAt: ' + displayMsgAt);
                                getNextMessageFunc = setTimeout(module.exports.getNextMessage, timeToDisplayNextMsg, displayMsgAt);
                            }

                            res.send('OK');
                        });
                    } else {
                        res.send('OK');
                    }
                }
            } else {
                logger.debug('Failed, Redis not ready yet');
                res.send('Failed, Redis not ready yet');
            }
        } catch (e) {
            logger.debug('Error - ' + e);
        }
        logger.debug('Exit echoAtTime()');
    },
    getNextMessage: function (displayMsgAt) {
        logger.debug('Enter getNextMessage()');

        try {
            if (redisReady == true) {
                lastSleep = 0;
                // Get the next message
                client.zrange(mqname, 0, 0, function (err, reply) {
                    if (reply && reply.length > 0) {
                        displayMsgAt = new Date().getTime();
                        logger.debug('After zrange: ' + reply);
                        const datareply = JSON.parse(reply);
                        logger.debug('Try to compare datareply.displayat: ' + datareply.displayat + ' with displayMsgAt: ' + displayMsgAt);
                        // If need to display (the current time is bigger or equal to the time registered)
                        if (datareply.displayat <= displayMsgAt) {
                            // Echo a message
                            console.info('The message is: %s', datareply.message);
                            // Delete the message
                            client.zrem(mqname, reply, function (err, reply) {
                                logger.debug('After zrem: ' + reply);
                                // After handling one entry and remove that entry, get the next message in 1 millisecond. Loop until no more messages
                                getNextMessageFunc = setTimeout(module.exports.getNextMessage, 1, displayMsgAt);
                            });
                        } else {
                            // no more messages perior to the time we were a sleep, Sleep again to the next message
                            var displayMsgAt = datareply.displayat;
                            var timeToDisplayNextMsg = displayMsgAt - new Date().getTime();
                            logger.debug('Going to setTimout with timeToDisplayNextMsg: ' + timeToDisplayNextMsg + ' and displayMsgAt: ' + displayMsgAt);
                            lastSleep = displayMsgAt;
                            getNextMessageFunc = setTimeout(module.exports.getNextMessage, timeToDisplayNextMsg, displayMsgAt);
                        }
                    } else {
                        logger.debug('No messages lst to wait for!');
                    }
                });
            }
        } catch (e) {
            logger.debug('Error - ' + e);
        }
        logger.debug('Exit getNextMessage()');
    },
    // get a list of all messages, only for testing!!!
    getAllMsgs: function (res) {
        logger.debug('Enter getAllMsgs()');

        try {
            if (redisReady == true) {
                client.zrange(mqname, 0, -1, function (err, reply) {
                    logger.debug('After zrange: ' + reply);

                    if (reply) {
                        res.send(reply);
                    } else {
                        res.send('Nothing');
                    }
                });
            }
        } catch (e) {
            logger.debug('Error - ' + e);
        }
        logger.debug('Exit getAllMsgs()');
    },
    // delete a message, only for testing!!!
    deleteMsg: function (message, res) {
        logger.debug('Enter deleteMsg() with message: ' + message);
        try {
            if (redisReady == true) {
                client.zrem(mqname, message, function (err, reply) {
                    logger.debug('After zrem: ' + reply);
                    if (reply) {
                        res.send('OK');
                    } else {
                        return ('OK');
                    }
                });
            }
        } catch (e) {
            logger.debug('Error - ' + e);
        }
        logger.debug('Exit deleteMsg()');
    }
};
