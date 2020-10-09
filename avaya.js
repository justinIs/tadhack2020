const cpaas = require('@avaya/cpaas');
const enums = cpaas.enums;

(async () => {
    require('dotenv').config()

    const connector = new cpaas.SmsConnector({
        accountSid: process.env.AVAYA_SID,
        authToken: process.env.AVAYA_AUTH_TOKEN
    });

    //send sms message
    try {
        const data = await connector.sendSmsMessage({
            to: process.env.RECIPIENT_PHONE,
            from: process.env.AVAYA_USERNAME,
            body: 'Hello from Avaya CPaaS!',
            statusCallback: 'http://mycallback.url.com',
            statusCallbackMethod: enums.HttpMethod.GET,
            allowMultiple: true
        });
        console.log(data);
    } catch (e) {
        console.error(e.message)
    }
})();
