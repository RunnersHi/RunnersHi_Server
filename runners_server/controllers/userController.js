const config = require("../config/config");
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
            return next("NON_EXISTENT_DATA");
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
            return next("NON_EXISTENT_DATA");
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
            //check id, nickname
            let checkId = await userModel.checkId(userData.id);
            if(checkId.code === "DUPLICATE_FAIL"){
                return next("EXIST_ID");
            }

            let checkName = await userModel.checkNickname(userData.nickname);
            if(checkName.code === "DUPLICATE_FAIL"){
                return next("EXIST_NICKNAME");
            }

            //register model
            result = await userModel.register(userData);
            return next(result);
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
            return next("NON_EXISTENT_DATA");
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
     *  modify
     *  body {nickname, gender, level, log_visibility, image}
     ********************/
    modify : async(req, res, next) => {
        let result = "";
        try{
            const userData = {
                id : req.user_id,
                user_idx : req.user_idx,
                nickname : req.body.nickname,
                gender : req.body.gender,
                level : req.body.level,
                log_visibility : req.body.log_visibility,
                image : req.body.image
            };
            result = await userModel.modify(userData);
            return next(result);
        } catch(error){
            return next(error);
        }
    },

    /*******************
     *  myProfile
     *  body {}
     ********************/
    myProfile : async(req, res, next) => {
        try{
            let userData = await userModel.selectUserData(req.user_idx);
            userData = await userModel.selectRun(userData);
            return next({"code" : "MY_PROFILE", result : userData});
        } catch(error){
            return next(error);
        }
    },
    /*******************
     *  myProfile
     *  body {}
     ********************/
    findPassword : async(req, res, next) => {
        try{
            //email 조회
            let userData = await userModel.findEmailById(req.params.id);
            //salt 생성
            userData.salt = crypto.randomBytes(128).toString('base64');
            //secretNumber 생성
            let secretNumber = Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000;
            userData.secretNumber = config.do_cipher(secretNumber + '', userData.salt);
            console.log(secretNumber + '');
            //update password
            let result = await userModel.updatePassword(userData);
            //mail 보내기
            return next(result);
        } catch(error){
            return next(error);
        }
    },
};

module.exports = userController;