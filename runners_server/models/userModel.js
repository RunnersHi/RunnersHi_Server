//mysql connection
const pool = require('./pool');

//cipher
const jwt = require("jsonwebtoken");
const config = require("../config/config");

const userModel = {

    /*******************
     *  Register
     *  @param: userData = {nickname, id, password, salt, gender, level, log_visibility, image}
     ********************/
    register: async(userData)=>{
        const sql =
            "INSERT INTO user(nickname, id, password, salt, gender, level, log_visibility, image) " +
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?) ";
        const rows = await pool.queryParamArr(sql, [
            userData.nickname,
            userData.id,
            userData.password,
            userData.salt,
            userData.gender,
            userData.level,
            userData.log_visibility,
            userData.image,]);
        if (rows.affectedRows === 1) {
            //response message result 에 들어갈 값들
            return {
                "code" : "REGISTER_SUCCESS",
                result : {
                    "token": jwt.sign(userData, config.jwt.cert, {
                        expiresIn: "10h"
                    })
                }
            };
        } else {
            return "SERVER_ERROR";
        }
    },

    /*******************
     *  Login
     *  @param: userData = {id, password}
     ********************/
    login: async(userData) => {

        const sql = "SELECT password, salt FROM user WHERE id = ?";
        const rows = await pool.queryParamArr(sql, [userData.id]);
        if(rows.length === 0){
            return "NON_EXIST_ID";
        } else{
            if(rows[0].password === config.do_cipher(userData.password, rows[0].salt)) {
                userData.token = {
                    "token": jwt.sign(userData, config.jwt.cert, {
                        expiresIn: "10h"
                    })
                };
                userData.password = undefined;
                userData.id = undefined;
                return ({"code": "LOGIN_SUCCESS", result: userData.token});
            } else{
                return ({"code" : "LOGIN_FAIL", result : {}});
            }
        }
    },

    /*******************
     *  CheckId
     *  @param: userData = {id}
     ********************/
    checkId: async(id) => {
        const sql = "SELECT id FROM user WHERE id = ?";
        const rows = await pool.queryParamArr(sql, [id]);
        if(rows.length !== 0) {
            return {code : "DUPLICATE_FAIL", result : {}};
        } else{
            return  {code : "DUPLICATE_SUCCESS", result : {}};
        }
    },

    /*******************
     *  CheckNickname
     *  @param: userData = {nickname}
     ********************/
    checkNickname: async (nickname) => {
        const sql = "SELECT nickname FROM user WHERE nickname = ?";
        const rows = await pool.queryParamArr(sql, [nickname]);
        if(rows.length !== 0) {
            return {code : "DUPLICATE_FAIL", result : {}};
        } else{
            return  {code : "DUPLICATE_SUCCESS", result : {}};
        }
    },
    /*******************
     *  Profile
     *  @param: user_idx
     ********************/
    selectUserData: async(user_idx) => {
        const sql = "SELECT user_idx, nickname, gender, level, image, badge FROM user WHERE user_idx = ? ";

        const rows = await pool.queryParamArr(sql, [user_idx]);
        if(rows.length === 0) {
            return "NON_EXISTENT_DATA";
        } else{
            let result = rows[0];
            let bin = rows[0].badge;
            result.badge = [];
            for(let i = 0; i < bin.length; i++){
                result.badge.push(bin[i] === '1');
            }
            return result;
        }
    },
    /*******************
     *  Profile
     *  @param: userData : {user_idx}
     ********************/
    selectRun: async(userData) => {
        const sql = "SELECT result FROM run WHERE user_idx = ? ";
        const rows = await pool.queryParamArr(sql, [userData.user_idx]);
        userData.win = 0;
        userData.lose = 0;
        for(let i = 0; i < rows.length; i++){
            switch(rows[i].result){
                case 1:
                case 4:
                    userData.win++;
                    break;
                case 2:
                case 3:
                    userData.lose++;
                    break;
            }
        }
        return userData;
    },
    findUserIdxById : async (id, done) => {
        const sql = "SELECT user_idx FROM user WHERE id = ?";
        const rows = await pool.queryParamArr(sql, [id]);
        if(rows.length === 0){
            done("LOGIN_FAIL", null);
        } else{
            done(null, rows[0].user_idx);
        }
    },
    /*******************
     *  modify
     *  @param: userData = {user_idx, nickname, gender, level, log_visibility, image}
     ********************/
    modify: async(userData)=>{
        const sql =
            "UPDATE user SET nickname = ?, gender = ?, level = ?, log_visibility = ?, image = ? WHERE user_idx = ?";
        const rows = await pool.queryParamArr(sql, [
            userData.nickname,
            userData.gender,
            userData.level,
            userData.log_visibility,
            userData.image,
            userData.user_idx]);
        if (rows.affectedRows === 1) {
            //response message result 에 들어갈 값들
            return {
                "code" : "PROFILE_MODIFY",
                result : {
                    "token": jwt.sign(userData, config.jwt.cert, {
                        expiresIn: "10h"
                    })
                }
            };
        } else {
            return "SERVER_ERROR";
        }
    },
};

module.exports = userModel;


