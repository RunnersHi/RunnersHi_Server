const response = require('./response');

module.exports = (app) => {

    app.use((response, req, res, next) => {
        console.log(response);
        if(response.result === undefined)
            return next(response);

        const response_message = response[response.code];
        console.log(response_message);
        response_message.result = response.result ? response.result : "";

        return res.status(response_message.status).json(
            response_message
        );
    });
};