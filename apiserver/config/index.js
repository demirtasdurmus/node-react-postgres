var API_URL;

if (process.env.NODE_ENV === 'production') {
    API_URL = process.env.API_URL_PROD;
} else if (process.env.NODE_ENV === 'test') {
    API_URL = process.env.API_URL_TEST;
} else {
    API_URL = "http://localhost:" + PORT;
};

module.exports = { API_URL };
