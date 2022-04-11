module.exports = () => {
    if (process.env.NODE_ENV == "production") {
        return `https://somedomain.com/`
    } else if (process.env.NODE_ENV == "test") {
        return `https://test.somedomain.com`
    } else {
        return `http://localhost:${process.env.PORT}`
    };
};