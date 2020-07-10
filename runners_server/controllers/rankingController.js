const rankingModel = require("../models/rankingModel");

const ranking = {
  runner: async(req, res, next) => {
    try{
      const result = await rankingModel.runner();
      return next(result);
    } catch(error){
      return next(error);
    }
  },
  winner: async(req, res, next) => {
    try{
      const result = await rankingModel.winner();
      
    console.log("winner controller");
    console.log(result);
      return next(result);
    } catch(error){
      return next(error);
    }
  },
  loser: async(req, res, next) => {
    try{
      const result = await rankingModel.loser();
      return next(result);
    } catch(error){
      return next(error);
    }
  },
  getDetailProfile: async(req, res, next) => {

    //이 함수가 호출되기 전, token을 부여 받는 것은
    //권한(로그인을 한 사람)이 있는 사람만 이 API에 접근할 수 있다는 것이다.
    const user_idx = req.params.user_idx;

    try{
      const result = await rankingModel.getDetailProfile(user_idx);
      return next(result);
    } catch(error){
      return next(error);
    }
  }
};

module.exports = ranking;