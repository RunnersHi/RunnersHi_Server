
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
  
  getDetailRecord: async(req, res, next) => {
    const token = req.headers.token;
    const run_idx = req.params.run_idx;

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
      const result = await recordModel.getDetailRecord(user_idx, run_idx);
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
      return next(result);

    } catch(error){
      return next(error);
    }
  },

  getUserRecentRecord: async(req, res, next) => {
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
      const result = await recordModel.getUserRecentRecord(user_idx);
      return next(result);

    } catch(error){
      return next(error);
    }
  },

  getUserRunIdxRecord: async(req, res, next) => {
    const token = req.headers.token;
    const run_idx = req.params.run_idx;
  
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
      const result = await recordModel.getUserIdxRunIdxRecord(user_idx, run_idx);
      
      return next(result);

    } catch(error){
      return next(error);
    }
  },
  //상대방기록
  getOpponentRecord: async(req, res, next) => {

    const token = req.headers.token;
    const game_idx = req.params.game_idx;

    const user_idx = await authModel.verify(token);
    console.log("recordController userIDX" + user_idx);

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
      const result = await recordModel.getOpponentRecord(user_idx, game_idx);
      console.log("controller result : " + result);
      return next(result);

    } catch(error){
      return next(error);
    }
  }
};

module.exports = record;