"use strict";

const config = require("../config/config");
const resMsg = require("../errors.json");
const crypto = require('crypto');
const userModel = require("../models/userModel");

/*******************
 *  login
 *  body {id, password}
 ********************/
exports.login = async (req, res, next) => {
    //body check
    if (!req.body.id || !req.body.password) {
        return res.status(400).end();
    }

    let result = "";

    try {
        const userData = {
            id: req.body.id,
            password: req.body.password,
            token: "token"
        };
        //login model
        result = await userModel.login(userData);

    } catch (error) {
        return next(error);
    }
    //password fail
    if(result === undefined){
        return res.r(result, false, "login fail");
    }
    //login success
    else{
        return res.r(result, true, "login success");
    }
};

/*******************
 *  Register
 *  body {id, password, nickname, gender, level, log_visibility, image}
 ********************/
exports.register = async (req, res, next) => {
    console.log(req.body.id);
    console.log(req.body);
    //body check
    if(!req.body.id || !req.body.password || !req.body.nickname || !req.body.gender || !req.body.level || !req.body.image){
        console.log(req.body.password);
        return res.status(400).end();
    }
    let result = "";

    try {
        let salt = crypto.randomBytes(128).toString('base64');
        const userData = {
            id: req.body.id,
            password :config.do_cipher(req.body.password, salt),
            salt : salt,
            nickname : req.body.nickname,
            gender : req.body.gender,
            level : req.body.level,
            log_visibility : req.body.log_visibility,
            image: req.body.image
        };
        console.log(userData);

        //check id, nickname
        await userModel.checkId(userData.id);
        await userModel.checkNickname(userData.nickname);

        //register model
        result = await userModel.register(userData);
    } catch (error) {
        return next(error);
    }

    return res.r(result, true, "register success");
};

/*******************
 *  Duplicates
 *  body {check_name, flag}
 ********************/
exports.duplicates = async(req, res, next) => {
    const result = {};
    if(!req.body.check_name || !req.body.flag){
        return res.status(400).end();
    }
    try{
        if(req.body.flag === 1){
            await userModel.checkId(req.body.check_name);
        } else {
            await userModel.checkNickname(req.body.check_name);
        }

    } catch(error){
        return next(error);
    }
    return res.r(result, true, "duplicate check success");
};