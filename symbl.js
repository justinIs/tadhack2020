const {sdk} = require("symbl-node");
const logger = require('./server/util/logger').createLogger('symbl')

const subscribeToConnection = (sdk, connectionId) => {
    sdk.subscribeToConnection(connectionId, data => {
        logger.log('Subscription received data: ', JSON.stringify(data))

        const {type} = data;
        switch (type) {
            case 'transcript_response': {
                const {payload} = data;

                // You get live transcription here!!
                logger.log('Live: ' + payload && payload.content + '\r');
                break;
            }
            case 'message_response': {
                const {messages} = data;

                // You get processed messages in the transcript here!!! Real-time but not live! :)
                messages.forEach(message => {
                    logger.log('Message: ' + message.payload.content + '\n');
                });
                break;
            }
            case 'insight_response': {
                const {insights} = data;
                // You get any insights here!!!
                insights.forEach(insight => {
                    logger.log(`Insight: ${insight.type} - ${insight.text} \n\n`);
                });
                break;
            }
            default: {
                logger.log('idk what to do')
                break;
            }
        }
    })
}

const createConnection = async (sdk) => {
    try {
        const connection = await sdk.startEndpoint({
            endpoint: {
                type: 'pstn',
                phoneNumber: process.env.RECIPIENT_PHONE
            }
        })
        const {connectionId} = connection
        logger.log('Successfully connected. Connection Id: ', connectionId);

        subscribeToConnection(sdk, connectionId)

        // Stop call after 60 seconds to automatically.
        setTimeout(async () => {
            const connection = await sdk.stopEndpoint({connectionId});
            logger.log('Stopped the connection');
            logger.log('Conversation ID:', connection.conversationId);
        }, 60000);
    } catch (e) {
        logger.error('Could not start endpoint')
    }
}

(async () => {
    require('dotenv').config()

    await sdk.init({
        "appId": process.env.SYMBL_APP_ID,
        "appSecret": process.env.SYMBL_APP_SECRET
    })

    logger.log('SDK initialized')

    await createConnection(sdk)
})()
