const symblAPi = require('../../symbl')

const logger = require('../util/logger').createLogger('SymblService')

let isInitialized = false

let conversationId;

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

    conversationId = await symblAPi.createPstnConnection(pstnNumber)
}

const getTranscript = () => {
    return symblAPi.getConversationTranscript(conversationId);
}

module.exports = {
    connectToPstn,
    getTranscript
}
