"use strict";

//mysql connection
const mysql = require("mysql");
const DBConfig = require("./../config/DBConfig");
const pool = mysql.createPool(DBConfig);

//cipher
const jwt = require("jsonwebtoken");
const config = require("../config/config");

/*******************
 *  Register
 *  @param: userData = {email, pw, name, age, gender, profile, height, weight, private}
 ********************/

exports.register = userData => {
    return new Promise((resolve, reject) => {
        const sql =
            "INSERT INTO User(nickname, id, password, salt, gender, level, log_visibility, img) " +
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?) ";

        pool.query(
            sql,
            [
                userData.nickname,
                userData.id,
                userData.password,
                userData.crypto.randomBytes(128).toString('base64'),
                userData.gender,
                userData.level,
                userData.log_visibility,
                userData.img,
            ],
            (err, rows) => {
                // 가입 시도
                if (err) {
                    reject(err);
                } else {
                    if (rows.affectedRows === 1) {
                        const token = jwt.sign(userData.id, config.jwt.cert, {
                            expiresIn: "12h"
                        });
                        resolve(token);
                    } else {
                        const _err = new Error("User Register Custom error");
                        reject(_err);
                    }
                }
            }
        );
    });
};

exports.login = userData => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT email FROM users WHERE email = ?";

        pool.query(sql, [userData.email], (err, rows) => {
            // 아이디 존재 검사
            if (err) {
                reject(err);
            } else {
                if (rows.length === 0) {
                    // 아이디 없음
                    reject(1402);
                } else {
                    resolve(userData);
                }
            }
        });
    }).then(userData => {
        return new Promise((resolve, reject) => {
            /*******************
             *  id, email, name, profile
             ********************/
            const sql =
                "SELECT email, name, id, profile, salt " +
                "FROM users " +
                "WHERE email = ? and pw = ?";

            pool.query(sql, [userData.email, userData.pw], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    if (rows.length === 0) {
                        // 비밀번호 틀림
                        reject(1403);
                    } else {
                        const profile = {
                            email: rows[0].email,
                            nickname: rows[0].nickname,
                            profile: rows[0].profile,
                            id: rows[0].id
                        };
                        const token = jwt.sign(profile, config.jwt.cert, {
                            expiresIn: "10h"
                        });

                        const result = {
                            profile,
                            token
                        };
                        resolve(result);
                    }
                }
            });
        });
    });
};

// 토큰 업데이트
exports.updateToken = (token, id) => {
    return new Promise((resolve, reject) => {
        const sql = "UPDATE users SET token = ? WHERE id = ?";
        pool.query(sql, [token, id], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

//id 있는지 검사
exports.checkName = name => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT name FROM users WHERE name = ?";

        pool.query(sql, [name], (err, rows) => {
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

//id 있는지 검사
exports.checkEmail = email => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT email FROM users WHERE email = ?";

        pool.query(sql, [email], (err, rows) => {
            // email 존재 검사
            if (err) {
                reject(err);
            } else {
                if (rows.length === 0) {
                    // email 없음
                    resolve();
                } else {
                    reject(1401);
                }
            }
        });
    });
};

//id 있는지 검사
exports.findNameById = id => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT name FROM users WHERE id = ?";

        pool.query(sql, [id], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                if (rows.length === 0) {
                    reject(1402);
                } else {
                    resolve(rows[0].name);
                }
            }
        });
    });
};
