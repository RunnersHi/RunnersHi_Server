const rankingController = require('../controllers/rankingController');
const authController = require('../controllers/authController');

module.exports = router => {

  router.get('/runner', rankingController.runner);

  router.get('/winner', rankingController.winner);
    
  router.get('/loser', rankingController.loser);

  router.get('/detail/:user_idx', authController.auth, rankingController.getDetailProfile);

  router.get('/opponent/recent/:user_idx', authController.auth, rankingController.getOpponentRecent);

  return router;
};