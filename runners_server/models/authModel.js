const jwt = require("jsonwebtoken");

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
  }
};


module.exports = authModel;



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