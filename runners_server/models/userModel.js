//mysql connection
const mysql = require("mysql");
const DBConfig = require("./../config/DBConfig");
const pool = mysql.createPool(DBConfig);

//cipher
const jwt = require("jsonwebtoken");
const config = require("../config/config");

/*******************
 *  Register
 *  @param: userData = {nickname, id, password, salt, gender, level, log_visibility, image}
 ********************/
exports.register = userData => {
    return new Promise((resolve, reject) => {
        const sql =
            "INSERT INTO User(nickname, id, password, salt, gender, level, log_visibility, image) " +
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?) ";

        pool.query(
            sql,
            [
                userData.nickname,
                userData.id,
                userData.password,
                userData.salt,
                userData.gender,
                userData.level,
                userData.log_visibility,
                userData.image,
            ],
            (err, rows) => {
                // 가입 시도
                if (err) {
                    reject(err);
                } else {
                    if (rows.affectedRows === 1) {
                        const result = {"token" : jwt.sign(userData, config.jwt.cert, {
                                expiresIn: "10h"
                            })
                        };
                        resolve(result);
                    } else {
                        const _err = new Error("User Register Custom error");
                        reject(_err);
                    }
                }
            }
        );
    });
};

/*******************
 *  Register
 *  @param: userData = {id, password}
 ********************/
exports.login = userData => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT password, salt FROM User WHERE id = ?";

        pool.query(sql, [userData.id], (err, rows) => {
            // 아이디 존재 검사
            if (err) {
                reject(err);
            } else {
                if (rows.length === 0) {
                    // 아이디 없음
                    reject(1402);
                } else {
                    if(rows[0].password === config.do_cipher(userData.password, rows[0].salt)) {
                        userData.token = {
                            "token": jwt.sign(userData, config.jwt.cert, {
                                expiresIn: "10h"
                            })
                        };
                        userData.password = undefined;
                        userData.id = undefined;
                        resolve(userData);
                    } else{
                        resolve();
                    }

                }
            }
        });
    });
};

/*******************
 *  Register
 *  @param: userData = {id}
 ********************/
exports.checkId = id => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT id FROM User WHERE id = ?";

        pool.query(sql, [id], (err, rows) => {
            // 아이디 존재 검사
            if (err) {
                reject(err);
            } else {
                if (rows.length === 0) {
                    // 아이디 없음
                    resolve();
                } else {
                    reject(1400);
                }
            }
        });
    });
};

/*******************
 *  Register
 *  @param: userData = {nickname}
 ********************/
exports.checkNickname = nickname => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT nickname FROM User WHERE nickname = ?";

        pool.query(sql, [nickname], (err, rows) => {
            // nickname 존재 검사
            if (err) {
                reject(err);
            } else {
                if (rows.length === 0) {
                    // nickname 없음
                    resolve();
                } else {
                    reject(1401);
                }
            }
        });
    });
};
