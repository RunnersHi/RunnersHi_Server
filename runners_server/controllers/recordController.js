
const util = require("../modules/utils");
const statusCode = require("../modules/statusCode");
const resMessage = require("../modules/responseMessage");

const recordModel = require("../models/recordModel");

const record = {
  getAllRecords: async(req, res) => {
    console.log(req.headers.token);

    const token = req.headers.token;
    
    //token을 이용하여 user_id 값으로 변환
    //user_id가 FK인 모든 run table을 찾아 반환

    const result = await recordModel.getAllRecords();




  },
  getDetailRecord: async(req, res) => {

    //user_idx 또는 token && run_idx가 같은 table 중에서
    // 자신의 정보 및 상대방에 정보도 같이 보내준다..(이걸 분리해야할까?! 그럼 복잡해질 것 같다..)
    //상대방의 정보는 game_idx가 같지만, user_idx가 다른 것이 상대방 그 테이블로 가서 그 상대방의 정보를 빼온다.
  } 

};

module.exports = record;