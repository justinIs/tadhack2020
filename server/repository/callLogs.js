const logger = require('../util/logger').createLogger('callLogRepository')

const createGUID = require('uuid').v1;
const callLogs = []

const getCallLogs = () => callLogs
const saveCallLog = (phoneNumber, insights, transcript) => {
    const callLog = {
        time: Date.now(),
        phoneNumber,
        insights,
        transcript,
        meetingLink: `https://webrtcventures.azurewebsites.net/?groupId=${createGUID()}`
    }
    logger.debug('Saving Call log', { callLog })
    callLogs.push(callLog)

    return callLog
}

module.exports = {
    getCallLogs,
    saveCallLog
}
