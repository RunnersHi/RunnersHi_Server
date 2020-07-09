
const util = require("../modules/utils");
const statusCode = require("../modules/statusCode");
const resMessage = require("../modules/responseMessage");

const rankingModel = require("../models/rankingModel");


const ranking = {
  runner: async(req, res, next) => {
    try{
      const result = await rankingModel.runner();
      console.log(result);
      return next(result);
    } catch(error){
      return next(error);
    }
  },
  winner: async(req, res, next) => {
    
    try{
      const result = await rankingModel.winner();
      console.log(result);
      return next(result);
    } catch(error){
      return next(error);
    }

  },
  loser: async(req, res, next) => {

    try{
      const result = await rankingModel.loser();
      console.log(result);
      return next(result);
    } catch(error){
      return next(error);
    }

  },
  getDetailProfile: async(req, res, next) => {

    try{
      const user_id = req.params.id;
      console.log(user_id);
      const result = await rankingModel.getDetailProfile(user_id);
      console.log(result);
      return next(result);
    } catch(error){
      return next(error);
    }
    
  }
};

module.exports = ranking;