var PORT,
    API_URL,
    CLIENT_URL

if (process.env.NODE_ENV === 'production') {
    PORT = process.env.PORT_PROD
    API_URL = process.env.API_URL_PROD
    CLIENT_URL = process.env.CLIENT_URL_PROD
} else if (process.env.NODE_ENV === 'test') {
    PORT = process.env.PORT_TEST
    API_URL = process.env.API_URL_TEST
    CLIENT_URL = process.env.CLIENT_URL_TEST
} else {
    PORT = process.env.PORT_DEV
    API_URL = "http://localhost:" + PORT
    CLIENT_URL = process.env.CLIENT_URL_DEV
}

module.exports = { API_URL, CLIENT_URL, PORT }
