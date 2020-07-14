
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

      let result_num = 2;
      if(data[0].result === 1 || data[0].result === 5) {
        result_num = 1;
      } 
    
      final_data =  {
        distance: data[0].distance,
        time: data[0].time,
        pace: data[0].pace

    
//       const final_data =  {
//         date: data[0].date,
//         distance: data[0].distance,
//         time: data[0].time,
//         run_idx: data[0].run_idx,
//         result: (data[0].result === 1 || data[0].result === 5) ? 1 : 2,
//         game_idx: data[0].game_idx,

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
    let win;
    let lose;

    if(req.body.level === '' || req.body.gender === '' || req.body.time === '' )
      return next("NON_EXISTENT_DATA");

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
    try{
      const badge = await recordModel.getBadge();
      if(!badge[0])
        await recordModel.updateBadge1(req.user_idx);
      if(!badge[1])
        await recordModel.updateBadge2(req.user_idx);
      if(!badge[2])
        await recordModel.updateBadge3(req.user_idx);
      if(!badge[3])
        await recordModel.updateBadge4(req.user_idx);
      if(!badge[4])
        await recordModel.updateBadge5(req.user_idx);
      if(!badge[5])
        await recordModel.updateBadge6(req.user_idx);
      if(!badge[6])
        await recordModel.updateBadge7(req.user_idx);
      if(!badge[7])
        await recordModel.updateBadge8(req.user_idx);
      if(!badge[8])
        await recordModel.updateBadge9(req.user_idx);
      if(!badge[9])
        await recordModel.updateBadge10(req.user_idx);
      if(!badge[10])
        await recordModel.updateBadge11(req.user_idx);
      if(!badge[11])
        await recordModel.updateBadge12(req.user_idx);
      return next();
    } catch(error){
      return next(error);
    }
  }

};

module.exports = record;