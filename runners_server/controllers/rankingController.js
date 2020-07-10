
const util = require("../modules/utils");
const statusCode = require("../modules/statusCode");
const resMessage = require("../modules/responseMessage");

const rankingModel = require("../models/rankingModel");
const authModel = require("../models/authModel");


const ranking = {
  runner: async(req, res, next) => {
    try{
      const result = await rankingModel.runner();
      return next(result);
    } catch(error){
      return next(error);
    }
  },
  winner: async(req, res, next) => {
    
    try{
      const result = await rankingModel.winner();
      return next(result);
    } catch(error){
      return next(error);
    }

  },
  loser: async(req, res, next) => {

    try{
      const result = await rankingModel.loser();
      return next(result);
    } catch(error){
      return next(error);
    }

  },
  getDetailProfile: async(req, res, next) => {

    const token = req.headers.token;
    const user_idx = await authModel.verify(token);

    if(token === undefined || token === null) {
      return next("EMPTY_TOKEN");
    }

    //expired_token
    if(user_idx === -3) {
      return next("EXPIRED_TOKEN");
    }

    //invalid_token
    if(user_idx === -2) {
      return next("INVALID_TOKEN");
    }


    try{
      console.log(user_idx);
      const result = await rankingModel.getDetailProfile(user_idx);
      console.log(result);
      return next(result);
    } catch(error){
      return next(error);
    }
    
  }
};

module.exports = ranking;