const mysql = require("mysql");
const DBConfig = require("./../config/DBConfig");
const pool = mysql.createPool(DBConfig);

const poolModel = require('../models/pool');

const jwt = require("jsonwebtoken");

const config = require("../config/config");


const TOKEN_EXPIRED = -3;
const TOKEN_INVALID = -2;

/*******************
 *  Authenticate
 *  @param: token
 ********************/
exports.auth = (token, done) => {
  jwt.verify(token, config.jwt.cert, (err, decoded) => {
    if (err) {
      switch (err.message) {
        case "jwt expired":
          return done(10401);
        case "invalid token":
          return done(10403);
        default:
          return done(err.message);
        }
      } else {
        const sql = "SELECT user_idx FROM User WHERE id = ?";

        pool.query(sql, [decoded.id], (err, rows) => {
          if (err) {
            return done(err);
          } else {
            if (rows.length === 0) {
              return done(401);
          } else {
              // 인증 성공
            return done(null, rows[0].user_idx);
         }
        }
      });
    }
  });
};


exports.verify = async(token) => {
  let decoded;
  try {
    decoded = jwt.verify(token, config.jwt.cert);
    console.log(decoded);
  } catch (err) {
    if (err.message === "jwt expired") {
      console.log("expired token");
      return TOKEN_EXPIRED;
    } else if (err.message === "invalid token") {
      console.log("invalid token");
      console.log(TOKEN_INVALID);
      return TOKEN_INVALID;
    } else {
      console.log("invalid token");
      return TOKEN_INVALID;
    }
  }
  const id = decoded.id;
  console.log("model  " + id);

  const query = `SELECT user_idx FROM user WHERE id = "${id}" `;
  const data = await poolModel.queryParam(query);

  console.log("usususu  " + data[0].user_idx);

  return data[0].user_idx;
};