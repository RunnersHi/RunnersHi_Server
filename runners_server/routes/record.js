const express = require('express');
const router = express.Router;

const recordController = require('../controllers/recordController');
const authMiddleWare = require('../middleware/auth');

module.exports = router => {

  //token 확인필요!
  router.get('/all', recordController.getAllRecords);

  //기록 상세보기
  router.get('/detail/:id', recordController.getDetailRecord);

  //러닝뱃지
  router.get('/badge', recordController.getBadge);

  //사용자의 최근 기록 :id
  router.get('/recent/:id', recordController.getUserRecentRecord);

  //:user_idx, :run_idx를 통해 기록 보여주기
  router.get('/:user_idx/:run_idx', recordController.getUserIdxRunIdxRecord);

  return router;
};

