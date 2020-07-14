const recordController = require('../controllers/recordController');
const authController = require('../controllers/authController');

module.exports = router => {
  
  //token 확인필요!
  router.get('/all', authController.auth, recordController.getAllRecords);

  //기록 상세보기(좌표, 등등) **토큰필요
  router.get('/detail/:run_idx', authController.auth, recordController.getDetailRecord);

  //token과 :game_idx 상대방 USER 기록 보여주기 
  router.get('/opponent/:game_idx', authController.auth, recordController.getOpponentRecord);

  //러닝뱃지 **토큰필요
  router.get('/badge', authController.auth, recordController.getBadge);

  //사용자의 최근 기록 token
  router.get('/recent', authController.auth, recordController.getUserRecentRecord);

  //token, :run_idx를 통해 기록 조회
  router.get('/run/:run_idx', authController.auth, recordController.getUserRunIdxRecord);

  //dummy data
  router.post('/match/opponent', recordController.postFindRunner);

  //badge detail
  router.get('/badge/detail/:flag', authController.auth, recordController.getBadgeDetail);


  return router;
};