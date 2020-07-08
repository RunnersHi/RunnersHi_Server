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
        return res.r(200, {}, false, "login fail");
    }
    //login success
    else{
        next({"code" : "LOGIN_SUCCESS", result : result.token});
    }
};

/*******************
 *  Register
 *  body {id, password, nickname, gender, level, log_visibility, image}
 ********************/
exports.register = async (req, res, next) => {
    //body check
    if(!req.body.id || !req.body.password || !req.body.nickname || !req.body.gender || !req.body.level || !req.body.image){
        return next(400);
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

    return res.r(200, result, true, "register success");
};

/*******************
 *  Duplicates
 *  body {check_name, flag}
 ********************/
exports.duplicates = async(req, res, next) => {
    let result = "";
    if(!req.body.check_name || !req.body.flag){
        return res.status(400).end();
    }
    try{
        if(req.body.flag === 1){
            result = await userModel.checkId(req.body.check_name);
        } else {
            result = await userModel.checkNickname(req.body.check_name);
        }

    } catch(error){
        return next(error);
    }
    if(result.length !== 0){
        return res.r(200, {}, false, "duplicate check fail");
    } else{
        return res.r(200, {}, true, "duplicate check success");
    }
};

/*******************
 *  myProfile
 *  body {}
 ********************/
exports.myProfile = async(req, res, next) => {
    let result = "";
    try{
        result = await userModel.profile(req.user_idx);

    } catch(error){
        return next(error);
    }
    return res.r(200, result, true, "lookup my profile success");
};