
const util = require("../modules/utils");
const statusCode = require("../modules/statusCode");
const resMessage = require("../modules/responseMessage");

const recordModel = require("../models/recordModel");
const authModel = require("../models/authModel");

const record = {
  getAllRecords: async(req, res, next) => {
    const id = req.user_idx;

    try{
      const result = await recordModel.getAllRecords(id);
      return next(result);
    } catch(error){
      return next(error);
    }
  },
  
  getDetailRecord: async(req, res, next) => {
    const run_idx = req.params.run_idx;
    const user_idx = req.user_idx;

    try{
      const result = await recordModel.getDetailRecord(user_idx, run_idx);
      return next(result);

    } catch(error){
      return next(error);
    }
  },
  
  getBadge: async(req, res, next) => {
    const id = req.user_idx;

    try{
      const result = await recordModel.getBadge(id);
      return next(result);

    } catch(error){
      return next(error);
    }
  },

  getUserRecentRecord: async(req, res, next) => {
    const user_idx = req.user_idx;

    try{
      const result = await recordModel.getUserRecentRecord(user_idx);
      return next(result);

    } catch(error){
      return next(error);
    }
  },

  getUserRunIdxRecord: async(req, res, next) => {
    const run_idx = req.params.run_idx;
    const user_idx = req.user_idx;

    try{
      const result = await recordModel.getUserIdxRunIdxRecord(user_idx, run_idx);
      console.log(result);
      return next(result);
    } catch(error){
      return next(error);
    }
  },
  //상대방기록
  getOpponentRecord: async(req, res, next) => {
    const game_idx = req.params.game_idx;
    const user_idx = req.user_idx;

    try{
      const result = await recordModel.getOpponentRecord(user_idx, game_idx);
      return next(result);

    } catch(error){
      return next(error);
    }
  }
};

module.exports = record;