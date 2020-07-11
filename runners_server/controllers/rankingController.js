const rankingModel = require("../models/rankingModel");
const recordModel = require("../models/recordModel");

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
    let final_data = {};

    try{
      const user_data = await rankingModel.getDetailProfile(user_idx);
      const badge = await recordModel.getBadge(user_idx);
      final_data = user_data;
      final_data.badge = badge.badge;

      return next({code : "RUNNER_DETAIL_PROFILE_SUCCESS", result : final_data});
    } catch(error){
      return next(error);
    }
  }
};

module.exports = ranking;