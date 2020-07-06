"use strict";

const config = require("../config/config");
const resMsg = require("../errors.json");

const userModel = require("../models/UserModel");

/*******************
 *  login
 ********************/
exports.login = async (req, res, next) => {
    if (!req.body.id || !req.body.password) {
        return res.status(400).end();
    }

    let result = "";

    try {
        const userData = {
            id: req.body.id,
            salt : "",
            password: config.do_cipher(req.body.password),
            token: req.body.token ? req.body.token : "token"
        };

        result = await userModel.login(userData);
        await userModel.updateToken(result.token, result.profile.id);
    } catch (error) {
        return next(error);
    }
    return res.r(result);
};

/*******************
 *  Register
 ********************/
exports.register = async (req, res, next) => {
    console.log(req.body);
    let result = "";

    try {
        const userData = {
            email: req.body.email,
            pw: config.do_cipher(req.body.pw),
            name: req.body.name,
            age: req.body.age ? parseInt(req.body.age) : null,
            gender: req.body.gender ? parseInt(req.body.gender) : null,
            height: req.body.height ? parseFloat(req.body.height) : null,
            weight: req.body.weight ? parseFloat(req.body.weight) : null,
            private: req.body.private ? parseInt(req.body.private) : null,
            profile: req.file ? req.file.location : null
        };

        await userModel.checkEmail(userData.email);
        await userModel.checkName(userData.name);

        result = await userModel.register(userData);
    } catch (error) {
        return next(error);
    }

    return res.r(result[0]);
};
