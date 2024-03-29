const recordController = require('../controllers/recordController');
const authController = require('../controllers/authController');

module.exports = router => {
  
  router.get('/all', authController.auth, recordController.getAllRecords);

  router.get('/detail/:run_idx', authController.auth, recordController.getDetailRecord);

  router.get('/run/:run_idx', authController.auth, recordController.getUserRunIdxRecord);

  router.get('/opponent/:game_idx', authController.auth, recordController.getOpponentRecord);

  router.get('/badge', authController.auth, recordController.getBadge);

  router.get('/recent', authController.auth, recordController.getUserRecentRecord);

  router.post('/match/opponent', recordController.postFindRunner);

  router.get('/badge/detail/:flag', authController.auth, recordController.getBadgeDetail);

  router.get('/badge/update/:user_idx', recordController.updateBadge);

  router.post('/run/post', authController.auth, recordController.postRun);

  router.post('/run/withme', authController.auth, recordController.withMe);

  return router;
};