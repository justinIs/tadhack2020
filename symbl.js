const {sdk, SpeakerEvent} = require("symbl-node");

const subscribeToConnection = (sdk, connectionId) => {
    sdk.subscribeToConnection(connectionId, data => {
        console.log('Subscription received data: ', JSON.stringify(data))

        const { type } = data;
        switch (type) {
            case 'transcript_response': {
                const {payload} = data;

                // You get live transcription here!!
                process.stdout.write('Live: ' + payload && payload.content + '\r');
                break;
            }
            case 'message_response': {
                const {messages} = data;

                // You get processed messages in the transcript here!!! Real-time but not live! :)
                messages.forEach(message => {
                    process.stdout.write('Message: ' + message.payload.content + '\n');
                });
                break;
            }
            case 'insight_response': {
                const {insights} = data;
                // You get any insights here!!!
                insights.forEach(insight => {
                    process.stdout.write(`Insight: ${insight.type} - ${insight.text} \n\n`);
                });
                break;
            }
            default:
                console.log('idk what to do')
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
        const { connectionId } = connection
        console.log('Successfully connected. Connection Id: ', connectionId);

        subscribeToConnection(sdk, connectionId)

        // Stop call after 60 seconds to automatically.
        setTimeout(async () => {
            const connection = await sdk.stopEndpoint({ connectionId });
            console.log('Stopped the connection');
            console.log('Conversation ID:', connection.conversationId);
        }, 60000);
    } catch (e) {
        console.error('Could not start endpoint')
    }
}

(async () => {
    require('dotenv').config()

    await sdk.init({
        "appId": process.env.SYMBL_APP_ID,
        "appSecret": process.env.SYMBL_APP_SECRET
    })

    console.log('SDK initialized')

    await createConnection(sdk)
})()
