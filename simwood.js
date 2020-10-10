const Sipcentric = require('@sipcentric/pbx-client')
const logger = require('./server/util/logger').createLogger('simwood')

;(async () => {
    require('dotenv').config()

    let sipcentric
    try {
        sipcentric = new Sipcentric({
            username: process.env.SIPCENTRIC_USERNAME,
            password: process.env.SIPCENTRIC_PASSWORD
        })
    } catch (e) {
        logger.error('Unable to create instance', e)
    }
    try {
        const customers = await sipcentric.customers.get();

        logger.info('got customers', { length: customers.items.length })

        const customer = customers.items[0]
        logger.info('Customer 0', { id: customer.id })
    } catch (e) {
        logger.error('Unable to get customers', e)
    }
})();
