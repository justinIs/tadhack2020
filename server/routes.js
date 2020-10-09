const logger = require('./util/logger').createLogger('Route')
const ringCentralController = require('./controllers/ringCentralController')

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

routes.push({
    method: 'GET',
    path: '/',
    handler: (request, h) => {
        logger.info('GET /')
        debugLogRequest(request)
        return 'Hello World'
    }
})

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

module.exports = routes
