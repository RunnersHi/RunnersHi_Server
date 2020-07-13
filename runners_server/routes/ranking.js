const rankingController = require('../controllers/rankingController');
const authController = require('../controllers/authController');

module.exports = router => {

    //이달의 러너
    router.get('/runner', rankingController.runner);

    //승리
    router.get('/winner', rankingController.winner);
    
    //졌잘싸
    router.get('/loser', rankingController.loser);

    //러너DetailProfile 
    router.get('/detail/:user_idx', authController.auth, rankingController.getDetailProfile);

    return router;
};