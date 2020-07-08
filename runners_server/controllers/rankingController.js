
const util = require("../modules/utils");
const statusCode = require("../modules/statusCode");
const resMessage = require("../modules/responseMessage");

const rankingModel = require("../models/rankingModel");


const ranking = {
  runner: async(req, res) => {
    const result = await rankingModel.runner();

    console.log(result);
    res.status(statusCode.OK).send(util.success(statusCode.OK, "네네 성공성공", {result}));
    
    //createTime에 있는 것의 값 중, month가 thisMonth랑 같은 것을 찾는다...
    // 찾을 수야 있어,, 근데 어떻게 가져와서 어떻게 저장해서 어떻게 해야하죠>'

  },
  winner: async(req, res) => {
    
    const result = await rankingModel.winner();

    console.log(result);
    res.status(statusCode.OK).send(util.success(statusCode.OK, "네네 성공성공", {result}));

  },
  loser: async(req, res) => {
    
    const result = await rankingModel.loser();

    
    console.log(result);
    res.status(statusCode.OK).send(util.success(statusCode.OK, "네네 성공성공", {result}));

  }
};

module.exports = ranking;