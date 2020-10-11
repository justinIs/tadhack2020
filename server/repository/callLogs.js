const callLogs = []

const getCallLogs = () => callLogs
const saveCallLog = (phoneNumber, insights, transcript) => {
    callLogs.push({
        time: Date.now(),
        phoneNumber,
        insights,
        transcript
    })
}

module.exports = {
    getCallLogs,
    saveCallLog
}
