const logger = require('./util/logger').createLogger('Route')
const ringCentralController = require('./controllers/ringCentralController')
const avayaController = require('./controllers/avayaController')

const routes = []

const debugLogRequest = (request, payload) => {
    const options = { headers: request.headers }
    if (payload) {
        options.payload = payload
    }
    if (Object.keys(request.query).length) {
        options.query = request.query
    }

    logger.debug('request params', options)
}

// routes.push({
//     method: 'GET',
//     path: '/',
//     handler: (request, h) => {
//         logger.info('GET /')
//         debugLogRequest(request)
//         return 'Hello World'
//     }
// })

routes.push({
    method: 'POST',
    path: '/webhook',
    handler: (request, h) => {
        logger.info('POST /webhook')
        debugLogRequest(request, request.body)

        const response = h.response('OK')
        response.code(200)

        if (request.headers.hasOwnProperty('validation-token')) {
            response.header('Validation-Token', request.headers['validation-token'])
        }
        return response
    }
})

routes.push({
    method: 'POST',
    path: '/avaya/webhook',
    handler: (request, h) => {
        logger.info('POST /avaya/webhook')
        debugLogRequest(request, request.payload)

        if (request.payload.CallStatus === 'in-progress' && request.payload.CallDuration === '0') {
            return avayaController.startConferenceCall()
        }
        return 'OK'
    }
})

routes.push({
    method: 'POST',
    path: '/avaya/webhook/call_end',
    handler: (request, h) => {
        logger.info('POST /avaya/webhook/call_end')
        debugLogRequest(request, request.payload)

        return 'OK'
    }
})

routes.push({
    method: 'POST',
    path: '/avaya/webhook/conference',
    handler: (request, h) => {
        logger.info('POST /avaya/webhook/conference')
        debugLogRequest(request, request.payload)

        if (request.payload && request.payload.ConferenceAction === 'enter' &&
            request.payload.ConferenceParticipantCount === '1') {
            logger.debug('Received enter conference event for user, adding symbl AI to call')
            avayaController.joinSymblToConference()
        }

        return 'OK'
    }
})


routes.push({
    method: 'POST',
    path: '/avaya/webhook/sms',
    handler: (request, h) => {
        logger.info('POST /avaya/webhook/sms')
        debugLogRequest(request, request.payload)

        return 'OK'
    }
})

module.exports = routes
