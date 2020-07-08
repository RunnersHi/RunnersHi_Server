const response_code = require('./response');

module.exports = (app) => {

    /*
    response : {code, result}
     */
    app.use((response, req, res, next) => {
        if(response.result === undefined)
            return next(response);

        const response_message = response_code[response.code];
        response_message.result = response.result ? response.result : "";

        return res.status(response_message.status).json(
            response_message
        );
    });
};