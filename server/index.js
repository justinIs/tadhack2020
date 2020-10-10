const routes = require("./routes");
const Hapi = require('@hapi/hapi');
const RingCentralController = require('./controllers/ringCentralController')

require('dotenv').config()

const logger = require('./util/logger').createLogger('main')

const init = async () => {
    const server = Hapi.server({
        port: 3030,
        host: 'localhost'
    })

    server.route(routes)

    await server.start()
    server.events.on('response', (request) => {
        const logLine = request.info.remoteAddress + ': ' + request.method.toUpperCase() + ' ' + request.path + ' --> ' + request.response.statusCode

        let logObject
        if (request.response._payload && request.response._payload._data) {
            logObject = { payload: request.response._payload._data }
        }

        logger.info(logLine, logObject)
    })

    logger.log('Server running on %s', server.info.uri)
}

process.on('unhandledRejection', (err) => {
    logger.error(err);
    process.exit(1);
});

// Main
(async () => {
    try {
        await init()
    } catch (e) {
        logger.error(`Could not init server: ${e.message}`, e)
    }

    // try {
    //     logger.debug('registering inbound SMS now')
    //     await RingCentralController.registerInboundSMS()
    // } catch(e) {
    //     logger.error(`Could not register for inbound SMS ${e.message}`, e)
    // }
    //
    // await RingCentralController.placeOutboundCall()
})()
