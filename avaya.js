const cpaas = require('@avaya/cpaas');
const enums = cpaas.enums;
const logger = require('./server/util/logger').createLogger('avaya')

const ConferencesConnector = () => new cpaas.ConferencesConnector({
    accountSid: process.env.AVAYA_SID,
    authToken: process.env.AVAYA_AUTH_TOKEN
});

const hangupParticipants = async (participants, connector) => {
    for (let i = 0; i < participants.length; i++) {
        const participant = participants[i]

        logger.info('Hanging up participant', { participant })

        const response = await connector.hangupParticipant({
            conferenceSid: participant.conference_sid,
            participantSid: participant.sid
        })

        logger.info('participant hung up',  response)
    }
}

const terminateConferences = async () => {
    const connector = ConferencesConnector()

    const response = await connector.listConferences()
    logger.log('Got response: ', JSON.stringify(response.conferences))

    const inProgressConfs = response.conferences.filter(c => c.status === 'in-progress')
    if (inProgressConfs.length === 0) {
        logger.log('No more in progress conferences')
        return
    }

    logger.log('Found in progress conferences', inProgressConfs.length)

    for (let i = 0; i < inProgressConfs.length; i++) {
        const conf = inProgressConfs[i]
        try {
            const participantsResp = await connector.listParticipants({
                conferenceSid: conf.sid
            })

            logger.log('Got participants', participantsResp)
            await hangupParticipants(participantsResp.participants, connector)
        } catch (e) {
            logger.error(`Could not get participants for sid: ${conf.sid}`, e)
        }
    }
}

const sendSms = async (destination, body) => {
    try {
        const SmsConnector = new cpaas.SmsConnector({
            accountSid: process.env.AVAYA_SID,
            authToken: process.env.AVAYA_AUTH_TOKEN
        });

        await SmsConnector.sendSmsMessage({
            from: process.env.AVAYA_USERNAME,
            to: destination,
            body
        })
    } catch (e) {
        logger.error('Could not send sms message', e)
    }
}

module.exports = {
    terminateConferences,
    sendSms
}

if (require.main === module) {
    (async () => {
        require('dotenv').config()

        terminateConferences()
    })();
}
