const {sdk, SpeakerEvent} = require("symbl-node");
const request = require("request");
const logger = require('./server/util/logger').createLogger('symbl')
let symblAccessToken;

const subscribeToConnection = (sdk, connectionId, onInsightResponse) => {
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
                    if (typeof onInsightResponse === 'function') {
                        onInsightResponse(insight)
                    }
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

const createConnection = async (sdk, onConnectionClosed) => {
    try {
        const connection = await sdk.startEndpoint({
            endpoint: {
                type: 'pstn',
                phoneNumber: process.env.RECIPIENT_PHONE
            }
        })
        const {connectionId} = connection
        logger.log('Successfully connected. Connection Id: ', connectionId);

        const speakerEvent = new SpeakerEvent({
            type: SpeakerEvent.types.startedSpeaking,
            user: {
                userId: 'mnasir@hawk.iit.edu',
                name: 'Hamza',
            },
            timestamp: new Date().toISOString()
        })

        sdk.pushEventOnConnection(
          connectionId,
          speakerEvent.toJSON(),
          (err) => {
              if (err) {
                  console.error('Error during push event.', err)
              } else {
                  console.log('Event pushed!')
              }
          },
        )

        const insights = []
        subscribeToConnection(sdk, connectionId, insight => {
            insights.push(insight)
        })

        // Stop call after 60 seconds automatically
        setTimeout(async () => {
            const connection = await sdk.stopEndpoint({connectionId});
            logger.log('Stopped the connection');
            logger.log('Conversation ID:', connection.conversationId);

            getConversationTranscript(connection.conversationId).then(transcript => {
                console.log(transcript);
                if (typeof onConnectionClosed === 'function') {
                    onConnectionClosed(insights)
                }
            });
        }, 20000);
    } catch (e) {
        logger.error('Could not start endpoint')
    }
}

const initSdk = async () => {
    await sdk.init({
        "appId": process.env.SYMBL_APP_ID,
        "appSecret": process.env.SYMBL_APP_SECRET
    })

    await setAccessToken();
}

/**
 * Symbl call to PSTN destination
 * @param phoneNumber
 * @param callLogCallback - invoked with array of insights and transcript when call ends
 * @return {Promise<*>}
 */
const createPstnConnection = async (phoneNumber) => {
    logger.debug('Create ptsn connection')
    let connectionId, conversationId;
    try {
        const connection = await sdk.startEndpoint({
            endpoint: {
                type: 'pstn',
                phoneNumber
            }
        })

        connectionId = connection.connectionId;
        conversationId = connection.conversationId;
        logger.log('Successfully connected. Connection::: ', connection);

        const speakerEvent = new SpeakerEvent({
            type: SpeakerEvent.types.startedSpeaking,
            user: {
                userId: 'mnasir@hawk.iit.edu',
                name: 'Hamza',
            },
            timestamp: new Date().toISOString()
        })

        sdk.pushEventOnConnection(
          connectionId,
          speakerEvent.toJSON(),
          (err) => {
              if (err) {
                  console.error('Error during push event.', err)
              } else {
                  console.log('Event pushed!')
              }
          },
        )

        subscribeToConnection(sdk, connectionId, insight => {
        })

        // Stop call after 30 seconds automatically
        setTimeout(async () => {
            logger.info('Stopping symbl call')

            const connection = await sdk.stopEndpoint({connectionId});

            setTimeout(async () => {
                const transcript = await getConversationTranscript(connection.conversationId);
                const insights = (await getInsights(connection.conversationId)).insights;
                const concatInsights = insights.map(insight => insight.text);

                logger.log('Stopped the connection', {insights: concatInsights, transcript, conversationId: connection.conversationId});

                await sendCallData({insights: concatInsights, transcript, phoneNumber});
            }, 5000);
        }, 30000);
    } catch (e) {
        logger.error('Could not start PSTN endpoint connection', e)
        throw new Error(e.message)
    }

    return conversationId;
}

const setAccessToken =  () => {
    const options = { method: 'POST',
        url: 'https://api.symbl.ai/oauth2/token:generate',
        headers:
          { 'Postman-Token': '8450901c-80ae-425f-a6a9-ba2414018e20',
              'cache-control': 'no-cache',
              'Content-Type': 'application/json' },
        body:
          { type: 'application',
              appId: process.env.SYMBL_APP_ID,
              appSecret: process.env.SYMBL_APP_SECRET },
        json: true };

    return new Promise(resolve => {
        request(options, function (error, response, body) {
            if (error) throw new Error(error);
            symblAccessToken = body.accessToken;
            resolve()
        });
    })
}

const getConversationTranscript = (conversationId) => {
    logger.debug(`getConversationTranscript(): conversationId = "${conversationId}"`)

    return new Promise(resolve => {
        const options = { method: 'GET',
            url: `https://api.symbl.ai/v1/conversations/${conversationId}/messages`,
            headers:
              { 'Postman-Token': 'b7ee1979-674d-4f29-baea-706363e21a6e',
                  'cache-control': 'no-cache',
                  'x-api-key': symblAccessToken } };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);
            body = JSON.parse(body);
            logger.info('Body', body);

            let transcript = '';
            if (body.messages) {
                body.messages.forEach(message => {
                    transcript += ' ';
                    transcript += message.text;
                });
            }
            resolve({transcript, messages: body.messages});
        });
    });
}

const sendCallData = (data) => {
    return new Promise(resolve => {
        const options = { method: 'POST',
            url: `${process.env.NGROK_ENDPOINT}/callData`,
            headers:
              { 'Postman-Token': 'b7ee1979-674d-4f29-baea-706363e21a6e',
                  'cache-control': 'no-cache',
                  'x-api-key': symblAccessToken },
            body: data,
            json: true
        };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);
            resolve(body);
        });
    });
}

const getInsights = (conversationId) => {
    return new Promise(resolve => {
        const options = { method: 'GET',
            url: `https://api.symbl.ai/v1/conversations/${conversationId}/insights`,
            headers:
              { 'Postman-Token': 'b7ee1979-674d-4f29-baea-706363e21a6e',
                  'cache-control': 'no-cache',
                  'x-api-key': symblAccessToken } };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);
            resolve(JSON.parse(body));
        });
    });
}

module.exports = {
    initSdk,
    createPstnConnection,
    getConversationTranscript
}

if (require.main === module) {
    (async () => {
        require('dotenv').config()

        await sdk.init({
            "appId": process.env.SYMBL_APP_ID,
            "appSecret": process.env.SYMBL_APP_SECRET
        })

        await setAccessToken();

        logger.log('SDK initialized')

        await createConnection(sdk, (insights) => {
            logger.info('connection now closed', { insights })
        })
    })()
}
