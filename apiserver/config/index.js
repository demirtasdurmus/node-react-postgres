var API_URL,
    CLIENT_URL;

if (process.env.NODE_ENV === 'production') {
    API_URL = process.env.API_URL_PROD;
    CLIENT_URL = process.env.CLIENT_URL_PROD;
} else if (process.env.NODE_ENV === 'test') {
    API_URL = process.env.API_URL_TEST;
    CLIENT_URL = process.env.CLIENT_URL_TEST;
} else {
    API_URL = "http://localhost:" + process.env.PORT;
    CLIENT_URL = process.env.CLIENT_URL_DEV;
};

module.exports = { API_URL, CLIENT_URL };
