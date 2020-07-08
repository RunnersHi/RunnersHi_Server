
const util = require("../modules/utils");
const statusCode = require("../modules/statusCode");
const resMessage = require("../modules/responseMessage");

const recordModel = require("../models/recordModel");
const authModel = require("../models/authModel");

const record = {
  getAllRecords: async(req, res, next) => {

    const token = req.headers.token;
    const id = await authModel.verify(token);

    console.log(req.headers.token);
    console.log("user_id : " + id);

    if(token === null) {
      res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, resMessage.EMPTY_TOKEN));
    }

    //expired_token
    if(id === -3) {
      res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, resMessage.EXPIRED_TOKEN));
    }

    //invalid_token
    if(id === -2) {
      res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, resMessage.INVALID_TOKEN));
    }

    //user_id가 FK인 모든 run table을 찾아 반환

    const result = await recordModel.getAllRecords(id);

    res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.GET_ALL_RECORDS_SUCCESS, {result}));

    console.log(result);

  },
  getDetailRecord: async(req, res) => {

    //user_idx 또는 token && run_idx가 같은 table 중에서
    // 자신의 정보 및 상대방에 정보도 같이 보내준다..(이걸 분리해야할까?! 그럼 복잡해질 것 같다..)
    //상대방의 정보는 game_idx가 같지만, user_idx가 다른 것이 상대방 그 테이블로 가서 그 상대방의 정보를 빼온다.
  } 

};

module.exports = record;