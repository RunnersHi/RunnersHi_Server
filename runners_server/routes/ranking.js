const express = require('express');
const router = express.Router;

const rankingController = require('../controllers/rankingController');
const authMiddleWare = require('../middleware/auth');

module.exports = router => {

    //이달의 러너
    router.get('/runner', rankingController.runner);

    //승리
    router.get('/winner', rankingController.winner);
    
    //졌잘싸
    router.get('/loser', rankingController.loser);

    //러너DetailProfile
    router.get('/detail', rankingController.getDetailProfile);

    return router;
};

