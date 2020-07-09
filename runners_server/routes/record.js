const express = require('express');
const router = express.Router;

const recordController = require('../controllers/recordController');
const authMiddleWare = require('../middleware/auth');

module.exports = router => {

  //token 확인필요!
  router.get('/all', recordController.getAllRecords);

  //기록 상세보기(좌표, 등등) **토큰필요 ###다시보기 좌표도 넘겨줘야함
  router.get('/detail/:run_idx', recordController.getDetailRecord);

  //token과 :game_idx 상대방 USER 기록 보여주기 
  router.get('/opponent/:game_idx', recordController.getOpponentRecord);

  //러닝뱃지 **토큰필요
  router.get('/badge', recordController.getBadge);

  //사용자의 최근 기록 :id
  router.get('/recent', recordController.getUserRecentRecord);

  //token, :run_idx를 통해 기록 조회
  router.get('/run/:run_idx', recordController.getUserRunIdxRecord);

  return router;
};

