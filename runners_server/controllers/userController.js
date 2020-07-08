const config = require("../config/config");
const resMsg = require("../errors.json");
const crypto = require('crypto');
const userModel = require("../models/userModel");

const userController = {
    /*******************
     *  login
     *  body {id, password}
     ********************/
    login : async(req, res, next) => {

        //body check
        if (!req.body.id || !req.body.password) {
            return next("1700");
        }

        try {
            const userData = {
                id: req.body.id,
                password: req.body.password,
                token: "token"
            };
            //login model
            const result = await userModel.login(userData);
            return next(result);
        } catch (error) {
            return next(error);
        }
    },

    /*******************
     *  Register
     *  body {id, password, nickname, gender, level, log_visibility, image}
     ********************/
    register : async(req, res, next) => {
        //body check
        if(!req.body.id || !req.body.password || !req.body.nickname || !req.body.gender || !req.body.level || !req.body.image){
            return next("400");
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

            //TODO
            //check id, nickname
            await userModel.checkId(userData.id);
            await userModel.checkNickname(userData.nickname);

            //register model
            result = await userModel.register(userData);
            return next({"code" : "REGISTER_SUCCESS", result : result});
        } catch (error) {
            return next(error);
        }

    },

    /*******************
     *  Duplicates
     *  body {check_name, flag}
     ********************/
    duplicates : async(req, res, next)=>{
        let result = "";
        if(!req.body.check_name || !req.body.flag){
            return next(400);
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
        return next(result);

    },

    /*******************
     *  myProfile
     *  body {}
     ********************/
    myProfile : async(req, res, next) => {
        let result = "";
        try{
            result = await userModel.profile(req.user_idx);
        } catch(error){
            return next(error);
        }
        return res.r(200, result, true, "lookup my profile success");
    }


};

module.exports = userController;