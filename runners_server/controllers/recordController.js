
const util = require("../modules/utils");
const statusCode = require("../modules/statusCode");
const resMessage = require("../modules/responseMessage");

const recordModel = require("../models/recordModel");
const authModel = require("../models/authModel");

const record = {
  getAllRecords: async(req, res, next) => {

    const token = req.headers.token;
    //##수정
    const id = await authModel.verify(token);

    console.log(req.headers.token);
    console.log("user_id : " + id);

    if(token === undefined || token === null) {
      //throw(400);
      return next("EMPTY_TOKEN");
     // return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, resMessage.EMPTY_TOKEN));
    }

    //expired_token
    if(id === -3) {
      return next("EXPIRED_TOKEN");
     // return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, resMessage.EXPIRED_TOKEN));
    }

    //invalid_token
    if(id === -2) {
      return next("INVALID_TOKEN");
      //return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, resMessage.INVALID_TOKEN));
    }

    try{
      const result = await recordModel.getAllRecords(id);
      console.log(result);
      return next(result);
    } catch(error){
      return next(error);
    }

  },

  //##구현해야함
  getDetailRecord: async(req, res, next) => {
    //user_idx 또는 token && run_idx가 같은 table 중에서
    //자신의 정보 및 상대방에 정보도 같이 보내준다..(이걸 분리해야할까?! 그럼 복잡해질 것 같다..)
    //상대방의 정보는 game_idx가 같지만, user_idx가 다른 것이 상대방 그 테이블로 가서 그 상대방의 정보를 빼온다.

    const token = req.headers.token;
    const run_idx = req.params.id;
    const id = await authModel.verify(token);

    console.log(req.headers.token);
    console.log("user_id : " + id);
    console.log("run_idx" + run_idx);

    if(token === undefined || token === null) {
      return next("EMPTY_TOKEN");
    }

    //expired_token
    if(id === -3) {
      return next("EXPIRED_TOKEN");
    }

    //invalid_token
    if(id === -2) {
      return next("INVALID_TOKEN");
    }

    try{
      //user_id가 FK인 모든 run table을 찾아 반환
      const result = await recordModel.getDetailRecord(id);
      console.log(result);
      return next(result);

    } catch(error){
      return next(error);
    }

  },
  
  getBadge: async(req, res, next) => {
    const token = req.headers.token;

    //##에러 다 처리하는지 확인하기!
    const id = await authModel.verify(token);
    console.log(id);

    if(token === undefined || token === null) {
      return next("EMPTY_TOKEN");
    }

    //expired_token
    if(id === -3) {
      return next("EXPIRED_TOKEN");
    }

    //invalid_token
    if(id === -2) {
      return next("INVALID_TOKEN");
    }

    try{
      const result = await recordModel.getBadge(id);
      console.log("controller result : " + result);
      return next(result);

    } catch(error){
      return next(error);
    }
  },

  getUserRecentRecord: async(req, res, next) => {
    const id = req.params.id;
    console.log(id);

    try{
      const result = await recordModel.getUserRecentRecord(id);
      console.log("controller result : " + result);
      return next(result);

    } catch(error){
      return next(error);
    }
  },

  getUserIdxRunIdxRecord: async(req, res, next) => {
    const user_idx = req.params.user_idx;
    const run_idx = req.params.run_idx;
    console.log(user_idx);
    console.log(run_idx);

    try{
      const result = await recordModel.getUserIdxRunIdxRecord(user_idx, run_idx);
      console.log("controller result : " + result);
      return next(result);

    } catch(error){
      return next(error);
    }
  }
};

module.exports = record;