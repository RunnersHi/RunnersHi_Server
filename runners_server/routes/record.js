const express = require('express');
const router = express.Router;

const recordController = require('../controllers/recordController');
const authMiddleWare = require('../middleware/auth');

module.exports = router => {


    router.get('/');

    return router;
};

