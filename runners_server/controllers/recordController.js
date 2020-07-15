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

    console.log(gender);

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
  //배지 업데이트
  updateBadge: async(req, res, next) => {
    const user_idx = req.user_idx;

    try{
      const badgeFlag = "111111111111";
      const badge = await recordModel.getBadge(req.user_idx);
      
      if(!badge[0]){
        const result = await recordModel.updateBadgeByWin(req.user_idx, 1);
        if(!result)
          badgeFlag[0] = "0";
      }
      if(!badge[1]){
        const result = await recordModel.updateBadgeByWin(req.user_idx, 5);
        if(!result)
          badgeFlag[1] = "0";
      }
      if(!badge[2]){
        const result = await recordModel.updateBadgeByWin(req.user_idx, 10);
        if(!result)
          badgeFlag[2] = "0";
      }
      if(!badge[3]){
        const result = await recordModel.updateBadgeByPace(req.user_idx, true);
        if(!result)
          badgeFlag[3] = "0";
      }
      if(!badge[4]){
        const result = await recordModel.updateBadgeByDistance(req.user_idx);
        if(!result)
          badgeFlag[4] = "0";
      }
      if(!badge[5]){
        const result = await recordModel.updateBadgeByPace(req.user_idx, false);
        if(!result)
          badgeFlag[5] = "0";
      }
 
      if(!badge[6] || !badge[7] || !badge[8])
      {
        const total_time = await recordModel.getSumRunningTime(user_idx);
        if( 180000 <= total_time && total_time < 360000)
          badgeFlag[6] = "0";
        if( 36000 <= total_time && total_time < 540000)
          badge[7] = 1;
        if( total_time >= 54000 )
          badge[8] = 1;
      }
      if(!badge[9])
      {
        const coutinuous = await recordModel.getContinuityRunning(user_idx);

        if(coutinuous >= 10) 
          badge[9] = 1; 
      }

      if(!badge[10] || !badge[11]) {
        const continuityWin = await recordModel.getContinuityWin(user_idx);
        
        if(continuityWin >= 5 && continuityWin < 10)
        {
          badge[10] = 1;
        }
        else if(continuityWin >= 10){
          badge[11] = 1;
        }
      }
      
      await recordModel.updateBadge(req.user_idx, badgeFlag);

      return next();
    } catch(error){
      return next(error);
    }
  }

};

module.exports = record;