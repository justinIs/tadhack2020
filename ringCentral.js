const SDK = require('@ringcentral/sdk').SDK;
const Subscriptions = require('@ringcentral/subscriptions').Subscriptions;
const logger = require('./server/util/logger').createLogger('ringcentral')

let config;
const loadConfig = () => {
    config = {
        RECIPIENT: process.env.RECIPIENT_PHONE,

        RINGCENTRAL_CLIENT_ID: process.env.RINGCENTRAL_CLIENT_ID,
        RINGCENTRAL_CLIENT_SECRET: process.env.RINGCENTRAL_CLIENT_SECRET,
        RINGCENTRAL_SERVER: process.env.RINGCENTRAL_SERVER,

        RINGCENTRAL_USERNAME: process.env.RINGCENTRAL_USERNAME,
        RINGCENTRAL_PASSWORD: process.env.RINGCENTRAL_PASSWORD,
        RINGCENTRAL_EXTENSION: process.env.RINGCENTRAL_EXTENSION,

        SUBSCRIPTION_PARAMS: {
            eventFilters: ['/restapi/v1.0/account/~/extension/~/message-store/instant?type=SMS'],
            deliveryMode: {
                transportType: "WebHook",
            }
        }
    }
    config.SUBSCRIPTION_PARAMS.deliveryMode.address = process.env.NGROK_URL
}

/**
 * Ring Central APIs wrapped up
 */

/**
 * Creates Ring Central SDK instance
 * @GodVariable
 * @return {SDK}
 */
const createRC_SDK = () => new SDK({
    server: config.RINGCENTRAL_SERVER,
    clientId: config.RINGCENTRAL_CLIENT_ID,
    clientSecret: config.RINGCENTRAL_CLIENT_SECRET
})

/**
 * Authenticate to Ring Central platform
 * TODO: may require some sort of refresh, not sure if we have to manually do it, just keep that in mind
 * @param platform
 * @return {Promise<Response>}
 */
const loginPlatform = async (platform) => await platform.login({
    username: config.RINGCENTRAL_USERNAME,
    password: config.RINGCENTRAL_PASSWORD,
    extension: config.RINGCENTRAL_EXTENSION
})

/**
 * Registers to receive callbacks for SMS
 * @param platform
 * @return {Promise<*>}
 */
const registerSMSSubscription = async (platform) => await platform.post('/restapi/v1.0/subscription', config.SUBSCRIPTION_PARAMS)

/**
 * Places a post request to ring out a call
 * @param platform
 * @param recipient
 * @return {Promise<void>}
 */
const ringoutCall = async (platform, recipient) => {
    if (!recipient) {
        recipient = config.RECIPIENT
    }
    try {
        logger.info('Posting for ringout', { recipient })
        const response = await platform.post('/restapi/v1.0/account/~/extension/~/ring-out', {
            from: { phoneNumber: config.RINGCENTRAL_USERNAME},
            to: { phoneNumber: recipient },
            playPrompt: false
        })

        logger.debug('Ringout post complete', { response })
    } catch (e) {
        logger.error('Could not post for ringout', e)
    }
}

const sendSMS = async (platform) => {
    const response = await platform.post('/restapi/v1.0/account/~/extension/~/sms', {
        from: {'phoneNumber': config.RINGCENTRAL_USERNAME},
        to: [{'phoneNumber': config.RECIPIENT}],
        text: 'Hello World from JavaScript'
    });

    logger.log("SMS sent. Message status", JSON.stringify(await response.json()))
}

module.exports.loadConfig = loadConfig
module.exports.createRC_SDK = createRC_SDK
module.exports.registerSMSSubscription = registerSMSSubscription
module.exports.loginPlatform = loginPlatform
module.exports.registerSMSSubscription = registerSMSSubscription
module.exports.ringoutCall = ringoutCall

/**
 * Execute as a script below
 */

const runTest = async () => {
    let resolveLoopPromise
    const loopPromise = new Promise(resolve => resolveLoopPromise = resolve)

    const rcSdk = createRC_SDK()
    const platform = rcSdk.platform();
    const loginResponse = await loginPlatform(platform);
    logger.log("Logged in successfully: " + JSON.stringify(await loginResponse.json()))

    const subscriptions = new Subscriptions({
        sdk: rcSdk
    });

    const subscription = subscriptions.createSubscription()
    subscription.on(subscription.events.notification, function (msg) {
        logger.log(msg, msg.body);
    });

    try {
        const response = await subscription.setEventFilters(['/restapi/v1.0/account/~/extension/~/presence']) // a list of server-side events
        .register();

        logger.log('registered event filters on subscription', JSON.stringify(response))
    } catch (e) {
        logger.error('unable to register event filters on subscription', e.message)
        return
    }

    await loopPromise

    await sendSMS(platform)
}

if (require.main === module) {
    require('dotenv').config()

    loadConfig()

    runTest()
    .catch(e => logger.error('Error running test', e))
}
