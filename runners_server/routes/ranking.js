const rankingController = require('../controllers/rankingController');
const authController = require('../controllers/authController');

module.exports = router => {

  router.get('/runner', authController.auth, rankingController.runner);

  router.get('/winner', authController.auth, rankingController.winner);
    
  router.get('/loser', authController.auth, rankingController.loser);

  router.get('/detail/:user_idx', authController.auth, rankingController.getDetailProfile);

  router.get('/opponent/recent/:user_idx', authController.auth, rankingController.getOpponentRecent);

  return router;
};