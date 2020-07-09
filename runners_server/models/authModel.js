const jwt = require("jsonwebtoken");
const poolModel = require('./pool');
const config = require("../config/config");


const TOKEN_EXPIRED = -3;
const TOKEN_INVALID = -2;

/*******************
 *  Authenticate
 *  @param: token
 ********************/
const authModel = {
  auth : (token, done) => {
    jwt.verify(token, config.jwt.cert, (err, decoded) => {
      if (err) {
        switch (err.message) {
          case "jwt expired":
            return done("EXPIRED_TOKEN");
          case "invalid token":
            return done("INVALID_AUTH");
          default:
            return done(err.message);
        }
      } else {
        return done(null, decoded.id);
      }
    });
  },
  verify : async(token) => {
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.cert);
    } catch (err) {
      if (err.message === "jwt expired") {
        return TOKEN_EXPIRED;
      } else if (err.message === "invalid token") {
        console.log(TOKEN_INVALID);
        return TOKEN_INVALID;
      } else {
        return TOKEN_INVALID;
      }
    }
    const id = decoded.id;

    const query = `SELECT user_idx FROM user WHERE id = "${id}" `;
    const data = await poolModel.queryParam(query);


    return data[0].user_idx;
  }

};


module.exports = authModel;