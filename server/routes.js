const logger = require('./util/logger').createLogger('Route')
const ringCentralController = require('./controllers/ringCentralController')
const avayaController = require('./controllers/avayaController')
const symblService = require('./services/symblService');
const Boom = require('@hapi/boom')
const { isPhoneNumberValid } = require('./util/phonenumber')

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

// APIs for Client

routes.push({
    method: 'POST',
    path: '/api/placeCall',
    handler: async (request, h) => {
        logger.info('POST /api/placeCall')
        debugLogRequest(request, request.payload)

        const { phone_number } = request.payload
        if (!isPhoneNumberValid(phone_number)) {
            throw Boom.badRequest('Invalid phone number: ' + phone_number)
        }

        await avayaController.placeOutboundSymblCall(phone_number)

        return 'OK'
    }
})

routes.push({
    method: 'GET',
    path: '/api/callLogs',
    handler: (request, h) => {
        logger.info('GET /api/callLogs')
        debugLogRequest(request)

        return h.response({
            callLogs: avayaController.getCallLogs()
        })
    }
})

// RingCentral WebHooks

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

// AVAYA WebHooks

routes.push({
    method: 'POST',
    path: '/avaya/webhook',
    handler: (request, h) => {
        logger.info('POST /avaya/webhook')
        debugLogRequest(request, request.payload)

        if (request.payload.CallerName === '+12015947998') {
            return avayaController.startConferenceCall(true)
        }
        if (request.payload.CallStatus === 'in-progress') {
            logger.info('Starting new conference')
            return avayaController.startConferenceCall()
        }
        return 'OK'
    }
})

routes.push({
    method: 'POST',
    path: '/avaya/webhook/call_end',
    handler: async (request, h) => {
        logger.info('POST /avaya/webhook/call_end')
        debugLogRequest(request, request.payload)

        // env variable needs to be the same as the number calling from for the conference to trigger this
        // when person calling for the conference ends the call, terminate the other leg
        if (request.payload.From === process.env.RECIPIENT_PHONE) {
            await avayaController.terminateConference()
        } else {
            await symblService.getTranscript(transcript => {
                logger.debug('Transcript:', transcript)
            })
        }

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
