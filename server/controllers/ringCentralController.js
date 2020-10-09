const ringCentralApi = require('../../ringCentral')
const logger = require('../util/logger').createLogger('RingCentralController')

class SmsSubscriptionError extends Error {
    constructor(message) {
        super(message);
        this.name = 'SmsSubscriptionError'
    }
}

let rcSdk;
let platform;

let isInitialized = false
let isLoggedIn = false
let inboundSmsRegistered = false

const init = () => {
    if (isInitialized) {
        return
    }

    ringCentralApi.loadConfig()
    rcSdk = ringCentralApi.createRC_SDK()
    platform = rcSdk.platform()
    isInitialized = true
}

const login = async () => {
    if (!isInitialized) {
        init()
    }

    try {
        const response = await ringCentralApi.loginPlatform(platform)
        logger.info('Successfully logged into ringcentral', { response })
        isLoggedIn = true
    } catch (e) {
        logger.error('Could not log in', e)
    }
}

const registerInboundSMS = async () => {
    if (!isLoggedIn) {
        await login()
    }

    if (inboundSmsRegistered) {
        return
    }

    try {
        const subscriptionAddress = ringCentralApi.registerSMSSubscription(platform)
        logger.info('Ready to receive incoming SMS via WebHook.', { subscriptionAddress })
        inboundSmsRegistered = true
    } catch (e) {
        logger.error('Could not subscribe to SMS webhook', e)
        throw new SmsSubscriptionError(e.message)
    }
}

const placeOutboundCall = async () => {
    if (!isLoggedIn) {
        await login()
    }

    await ringCentralApi.ringoutCall(platform)
}

module.exports = {
    registerInboundSMS,
    placeOutboundCall
}
