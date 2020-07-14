const recordController = require('../controllers/recordController');
const authController = require('../controllers/authController');

module.exports = router => {
  
  router.get('/all', authController.auth, recordController.getAllRecords);

  //기록 상세보기(좌표, 등등)
  router.get('/detail/:run_idx', authController.auth, recordController.getDetailRecord);

  router.get('/run/:run_idx', authController.auth, recordController.getUserRunIdxRecord);

  router.get('/opponent/:game_idx', authController.auth, recordController.getOpponentRecord);

  router.get('/badge', authController.auth, recordController.getBadge);

  //사용자의 최근 기록
  router.get('/recent', authController.auth, recordController.getUserRecentRecord);

  //dummy data
  router.post('/match/opponent', recordController.postFindRunner);


  return router;
};