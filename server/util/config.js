require('dotenv').config()

const config = {
    hostEndpoint: process.env.NGROK_ENDPOINT
}

module.exports = config;
