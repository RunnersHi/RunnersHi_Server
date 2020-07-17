//mysql connection
const pool = require('./pool');
const recordModel = require('../models/recordModel');

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
            "INSERT INTO user(nickname, id, password, salt, gender, level, log_visibility, image, badge) " +
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ";
        const rows = await pool.queryParamArr(sql, [
            userData.nickname,
            userData.id,
            userData.password,
            userData.salt,
            userData.gender,
            userData.level,
            userData.log_visibility,
            userData.image,
            "000000000000"]);
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
            return {"code" : "LOGIN_FAIL", result : {}};
        } else{
            if(rows[0].password === config.do_cipher(userData.password, rows[0].salt)) {
                const token = {
                    "token": jwt.sign(userData, config.jwt.cert, {
                        expiresIn: "10h"
                    })
                };
                return ({"code": "LOGIN_SUCCESS", result: token});
            } else{
                return {"code" : "LOGIN_FAIL", result : {token : ""}};
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
        const sql = "SELECT nickname, gender, level, image, badge FROM user WHERE user_idx = ? ";

        const rows = await pool.queryParamArr(sql, [user_idx]);
        if(rows.length === 0) {
            return "NON_EXISTENT_DATA";
        } else{
            const result = rows[0];
            const bin = rows[0].badge;
            result.badge = [];
            for(let i = 0; i < bin.length; i++){
                result.badge.push(bin[i] === '1');
            }
            return result;
        }
    },
    selectUserDataNoBadge: async(user_idx) => {
        const sql = "SELECT user_idx, nickname, gender, level, image FROM user WHERE user_idx = ? ";

        const rows = await pool.queryParamArr(sql, [user_idx]);
        if(rows.length === 0) {
            return "NON_EXISTENT_DATA";
        } else{
            return rows[0];
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
                case 5:
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
            done("INVALID_AUTH", null);
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

    /******************
     * ID 찾기
     * @param userData : {email}
     *********************/
    findID : async(userData)=>{
        const sql = `SELECT id FROM users WHERE email = ?`;
        const rows = await pool.queryParamArr(sql, [userData.email]);
        if (rows.length === 0) {
            return "NON_EXISTENT_DATA";
        } else {
            return rows[0].id;
        }
    },

    /*********************
     * PW 찾기 -> email로 임시비밀번호 보내고 임시비밀번호로 변경
     * @param id : {id, email}
     * @return userData : {user_idx, email}
     *********************/
    findEmailById : async(id)=>{
        const sql = `SELECT user_idx, email FROM user WHERE id = ?`;
        const rows = await pool.queryParamArr(sql, [id]);
        if (rows.length === 0) {
            return "NON_EXISTENT_DATA";
        } else {
            return rows[0];
        }
    },

    /*********************
     * PW 찾기 -> email로 임시비밀번호 보내고 임시비밀번호로 변경
     * @param userData : {secretNumber, user_idx, salt}
     *********************/
    updatePassword : async(userData)=>{
        const sql = `UPDATE user SET password = ?, salt = ?  WHERE user_idx = ?`;
        const rows = await pool.queryParamArr(sql, [userData.secretNumber, userData.salt, userData.user_idx]);
        if (rows.length === 0) {
            return "NON_EXISTENT_DATA";
        } else {
            return {"code" : "SEND_PASSWORD", result : {}};
        }
    },
};

module.exports = userModel;


