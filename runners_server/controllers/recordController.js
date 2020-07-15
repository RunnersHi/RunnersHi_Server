
const matchingModel = require("../models/matchingModel");
const recordModel = require("../models/recordModel");

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
      const data = await recordModel.getUserRecentRecord(user_idx);
      const image = await recordModel.getUserImg(user_idx);

      let result_num = 2;
      if(data[0].result === 1 || data[0].result === 5) {
        result_num = 1;
      }
      
      const pace_data = await record.getPace(data[0].time, data[0].distance);

      const final_data =  {
        distance: data[0].distance,
        time: data[0].time_diff,
        pace_minute: pace_data.pace_minute,
        pace_second: pace_data.pace_second,
        image: image[0].image,
        result: data[0].result,
        created_time: data[0].created_time
      };

    return next({code: "GET_RECENT_RECORD_SUCCESS", result: final_data});

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

  //time고려 
  postFindRunner: async(req, res, next) => {
    const {level, gender, time} = req.body;
    let pace;
    let win;
    let lose;

    if(req.body.level === undefined || req.body.gender === undefined || req.body.time === undefined )
      return next("NON_EXISTENT_DATA");

    if(level <= 0 || level > 3 || gender <= 0 || gender > 2)
      return next("CODITION_NOT_MATCH");

    //성별이 1 : 남, 2 : 여, 3 : 상관X?
    if(gender === '2') {
      switch(level) {
        case '1':
          win = 3;
          lose = 2;
          pace = 10.9;
          break;
        case '2':
          win = 5;
          lose = 3;
          pace = 8.5;
          break;
        case '3':
          win = 4;
          lose = 1;
          pace = 6.9;
          break;
      }
    } else {
      switch(level) {
        case '1':
          win = 3;
          lose = 2;
          pace = 7.9;
          break;
        case '2':
          win = 11;
          lose = 5;
          pace = 6.3;
          break;
        case '3':
          win = 4;
          lose = 1;
          pace = 4.9;
          break;
      }
    }

    if(gender === null)
      return next("NON_EXISTENT_DATA");

    try{
      const result = {};
      result.level = level;
      result.win = win;
      result.lose = lose;
      result.nickname = "성북천치타";
      result.img = 3;
      result.pace = pace;
      result.distance = (time / pace).toFixed(2);

      return next({code: "OPPONENT_RECORD_SUCCESS", result: result});

    } catch(error){
      return next(error);
    }
  },
  //배지 상세 조회
  getBadgeDetail: async(req, res, next) => {

    try{
      const result = await recordModel.getBadgeDetail(req.user_idx, parseInt(req.params.flag));
      return next(result);

    } catch(error){
      return next(error);
    }
  },

  postRun: async(req, res, next) => {
    if(!req.body.distance || !req.body.time || !req.body.result || !req.body.created_time || !req.body.end_time || !req.body.coordinates){
      return next("NON_EXISTENT_DATA");
    }
    try{
      const game_idx = await matchingModel.newGameIdx();
      const userData = {
        "distance" : req.body.distance,
        "time" : req.body.time,
        "result" : parseInt(req.body.result),
        "created_time" : req.body.created_time,
        "end_time" : req.body.end_time,
        "user_idx" : req.user_idx,
        "game_idx" : game_idx,
        "coordinates" : req.body.coordinates
      };
      const result = await recordModel.postRun(userData);
      return next({"code" : "POST_RUN", result : {"run_idx" : result}});
    } catch(error){
      return next(error);
    }
  },
  //배지 업데이트
  updateBadge: async(req, res, next) => {

    try{
      const result = await recordModel.getBadge(req.params.user_idx);
      const badge = result.badge;

      if(!badge[0]){
        const result = await recordModel.updateBadgeByWin(req.params.user_idx, 1);
        if(result){
          badge[0] = true;
        }
      }
      if(!badge[1]){
        const result = await recordModel.updateBadgeByWin(req.params.user_idx, 5);
        if(result){
          badge[1] = true;
        }
      }
      if(!badge[2]){
        const result = await recordModel.updateBadgeByWin(req.params.user_idx, 10);
        if(result){
          badge[2] = true;
        }
      }
      if(!badge[3]){
        const result = await recordModel.updateBadgeByPace(req.params.user_idx, true);
        if(result){
          badge[3] = true;
        }
      }
      if(!badge[4]){
        const result = await recordModel.updateBadgeByDistance(req.params.user_idx);
        if(result)
          badge[4] = true;
      }
      if(!badge[5]){
        const result = await recordModel.updateBadgeByPace(req.params.user_idx, false);
        if(result)
          badge[5] = true;
      }

      if(!badge[6] || !badge[7] || !badge[8])
      {

        const total_time = await recordModel.getSumRunningTime(req.params.user_idx);

        if(!badge[6] && total_time >= 180000)
          badge[6] = true;
        if(!badge[7] && total_time >= 360000)
          badge[7] = true;
        if(!badge[8] && total_time >= 540000)
          badge[8] = true;

      }
      if(!badge[9])
      {
        const coutinuous = await recordModel.getContinuityRunning(req.params.user_idx);

        if(coutinuous >= 10)
          badge[9] = '0';
      }

      if(!badge[10] || !badge[11]) {
        const continuityWin = await recordModel.getContinuityWin(req.params.user_idx);
        if(!badge[10] && continuityWin >= 5)
          badge[10] = '0';
        if(!badge[11] && continuityWin >= 10)
          badge[11] = '0';
      }
      let badgeFlag = "";
      for(let i = 0; i < badge.length; i++){
        if(badge[i])
          badgeFlag += "1";
        else badgeFlag += "0";
      }

      await recordModel.updateBadge(req.params.user_idx, badgeFlag);

      return next();
    } catch(error){
      return next(error);
    }
  }

};

module.exports = record;