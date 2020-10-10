const symblAPi = require('../../symbl')

const logger = require('../util/logger').createLogger('SymblService')

let isInitialized = false

const initSdk = async () => {
    try {
        await symblAPi.initSdk()
        isInitialized = true
    } catch (e) {
        logger.error('Could not init symbl SDK')
        throw new Error('Symbl SDK failed ot init')
    }
}

const connectToPstn = async (pstnNumber) => {
    logger.debug(`connectToPstn() called with pstnNumber: ${pstnNumber}`)

    if (!isInitialized) {
        await initSdk()
    }

    await symblAPi.createPstnConnection(pstnNumber)
}

module.exports = {
    connectToPstn
}
