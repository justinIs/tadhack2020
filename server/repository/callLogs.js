const createGUID = require('uuid').v1;
const callLogs = []

const getCallLogs = () => callLogs
const saveCallLog = (phoneNumber, insights, transcript) => {
    callLogs.push({
        time: Date.now(),
        phoneNumber,
        insights,
        transcript,
        meetingLink: `https://webrtcventures.azurewebsites.net/?groupId=${createGUID()}`
    })
}

module.exports = {
    getCallLogs,
    saveCallLog
}
