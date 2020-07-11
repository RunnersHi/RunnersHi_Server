const rankingModel = require("../models/rankingModel");
const userModel = require("../models/userModel");

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
    const user_idx = req.params.user_idx;
    let result = "";

    try{
      result = await userModel.selectUserData(user_idx);
      result = await userModel.selectRun(result);
      return next({"code" : "RUNNER_DETAIL_PROFILE_SUCCESS", result : result});
    } catch(error){
      return next(error);
    }
  }
};

module.exports = ranking;