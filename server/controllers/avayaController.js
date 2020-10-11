const callLogsRepository = require('../repository/callLogs')
const config = require('../util/config')
const symblService = require('../services/symblService')
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

const startConferenceCall = async () => {
    const xmlDefinition = ix.response({
        content: [
            ix.say({
                language: enums.Language.EN,
                text: 'Welcome to our AI voice service, please wait while we connect the AI to your call',
                voice: enums.Voice.FEMALE
            }),
            ix.dial({
                content: [
                    ix.conference({
                        callbackUrl: `${config.hostEndpoint}/avaya/webhook/conference`,
                        hangupOnStar: true,
                        maxParticipants: 3,
                        beep: true,
                        name: 'CPaaSExampleChat'
                    })
                ]
            })
        ]
    })

    try {
        return await ix.build(xmlDefinition)
    } catch (e) {
        logger.error('Unable to build XML for startConferenceCall')
    }
}

const joinSymblToConference = async () => {
    // sleep for conference to start up good
    await new Promise(resolve => setTimeout(resolve, 2000))

    await symblService.connectToPstn(process.env.AVAYA_USERNAME)
}

const placeOutboundSymblCall = async (phoneNumber) => {
    // Save insights from outbound symbl call
    await symblService.connectToPstn(
        phoneNumber,
        ({insights, transcript}) => callLogsRepository.saveCallLog(phoneNumber, insights, transcript))
}

const getCallLogs = () => callLogsRepository.getCallLogs()

module.exports = {
    answerWithSampleText,
    startConferenceCall,
    joinSymblToConference,
    placeOutboundSymblCall,
    getCallLogs
}
