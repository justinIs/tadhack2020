const callLogsRepository = require('../repository/callLogs')
const config = require('../util/config')
const symblService = require('../services/symblService')
const avayaApi = require('../../avaya')
const cpaas = require('@avaya/cpaas')
const ix = cpaas.inboundXml
const enums = cpaas.enums

const logger = require('../util/logger').createLogger('AvayaController')

const answerWithSampleText = async () => {
    const xmlDefinition = ix.response({
        content: [
            ix.say({
                language: enums.Language.EN,
                loop: 3,
                text: 'Everything is actually kind of jokes',
                voice: enums.Voice.FEMALE
            })
        ]
    })

    try {
        return await ix.build(xmlDefinition)
    } catch (e) {
        logger.error('Unable to build XML for answer with sample text')
    }
}

const sayLotsOfText = async () => {
    const xmlDefinition = ix.response({
        content: [
            ix.say({
                language: enums.Language.EN,
                text: 'Hey I just wanted to sync up about what we did today. Can you send me your diagnostics results when you get a chance?\n' +
                    'I was talking to Bob about the server optimizations, can you run Bob\'s optimization scripts tomorrow?\n' +
                    'I thought it was quite difficult to run the provisioning scripts haha.\n' +
                    'Can you also review my Pul Request for the auth flow update.'
            }),
            ix.hangup({
                schedule: 5
            })
        ]
    })

    try {
        return await ix.build(xmlDefinition)
    } catch (e) {
        logger.error('Unable to build XML for sayLotsOfText', e)
    }
}

const startConferenceCall = async (disablePrompt) => {
    const content = []
    if (!disablePrompt) {
        content.push(ix.say({
            language: enums.Language.EN,
            text: 'Welcome to our AI voice service, please wait while we connect the AI to your call',
            voice: enums.Voice.FEMALE
        }))
    }
    content.push(ix.dial({
        content: [
            ix.conference({
                callbackUrl: `${config.hostEndpoint}/avaya/webhook/conference`,
                hangupOnStar: true,
                maxParticipants: 3,
                beep: true,
                name: 'CPaaSExampleChat'
            })
        ]
    }))

    const xmlDefinition = ix.response({
        content
    })

    try {
        return await ix.build(xmlDefinition)
    } catch (e) {
        logger.error('Unable to build XML for startConferenceCall', e)
    }
}

const terminateConference = async () => {
    logger.info('terminating conference')
    await avayaApi.terminateConferences()
}

const joinSymblToConference = async () => {
    await symblService.connectToPstn(process.env.AVAYA_USERNAME)
}

const placeOutboundSymblCall = async (phoneNumber) => {
    // Save insights from outbound symbl call
    await symblService.connectToPstn(
        phoneNumber
    )
}

const getCallLogs = () => callLogsRepository.getCallLogs()

const sendSms = (destination, body) => avayaApi.sendSms(destination, body)

module.exports = {
    answerWithSampleText,
    sayLotsOfText,
    startConferenceCall,
    terminateConference,
    joinSymblToConference,
    placeOutboundSymblCall,
    getCallLogs,
    sendSms
}
