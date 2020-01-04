const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');

// Initialize the logger
var mslogger = require('./mslogger');
const logger = mslogger.InitializeLogger();

// Initialieze the businees logic
var messageserverbl = require('./messageserverbl');
messageserverbl.InitializeBL(logger);

// Get the app
const app = express()
const port = 3000
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Call https://url:port
// This call will return usage message
app.get('/', (req, res) => {
    logger.debug('Enter Http Get /');
    try {
        messageserverbl.returnHelp(res);
    } catch (e) {
        logger.debug('Error - ' + e);
    }
    logger.debug('Exit Http Get /');
});
// Call POST https://url:port/echoAtTime
// This call will register a message to display on a certain time. Need to pass json with the message and time, for example: {"message: "The message", "time":"1-4-2020 15:12:31"}
app.post('/echoAtTime', (req, res) => {
    const echoMsgAt = req.body;
    rc = messageserverbl.echoAtTime(echoMsgAt, res);
});
// Call GET https://url:port/echoAtTime
// Thsi will get all current messages registered
app.get('/echoAllMsgs', (req, res) => {
    messageserverbl.getAllMsgs(res);
});
// Call DELETE https://url:port/echoAtTime/<message>
// Thsi will delete a registered messages
app.delete('/echoAtTime/:message', (req, res) => {
    const message = req.params.message;
    messageserverbl.deleteMsg(message, res);
});
// Start to listen
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
