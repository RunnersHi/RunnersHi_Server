
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
      return next({code: "BADGE_SUCCESS", result: result});

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
  },

  postFindRunner: async(req, res, next) => {
    const {level, gender, time} = req.body;
    let pace;

    //성별이 1 : 남, 2 : 여, 3 : 상관X?
    if(gender === 2) {
      switch(level) {
        case 1:
          pace = 8.45;
          break;
        case 2:
          pace = 6.33;
          break;
        case 3:
          pace = 4.35;
          break;
      }
    } else {
      switch(level) {
        case 1:
          pace = 9.45;
          break;
        case 2:
          pace = 7.33;
          break;
        case 3:
          pace = 5.35;
          break;
      }
    }

    try{
      const result = {};
      result.level = level;
      result.win = 11;
      result.lose = 5;
      result.nickname = "성북천치타";
      result.img = 3;
      result.pace = pace;
      result.distance = time * 1000 / pace;

      return {code: "OPPONENT_RECORD_SUCCESS", result: result};

    } catch(error){
      return next(error);
    }
    
  }
};

module.exports = record;