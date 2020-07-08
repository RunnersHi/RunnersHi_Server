const express = require('express');
const router = express.Router;

const rankingController = require('../controllers/rankingController');
const authMiddleWare = require('../middleware/auth');

module.exports = router => {

    router.get('/ranking/runner', rankingController.runner);

    return router;
};

