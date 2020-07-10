"use strict";

const authModel = require("../models/authModel");
const userModel = require("../models/userModel");

/*******************
 *  Authenticate
 ********************/

exports.auth = async (req, res, next) => {
    if (!req.headers.token) {
        return next("EMPTY_TOKEN");
    } else {
        authModel.auth(req.headers.token, (err, id) => {
            if (err) {
                return next(err);
            } else {
                req.user_id = id;
            }
        });
        await userModel.findUserIdxById(req.user_id, (err, user_idx)=>{
            if(err){
                return next(err);
            } else{
                req.user_idx = user_idx;
            }
        });
        return next();
    }
};