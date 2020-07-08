const express = require('express');
const router = express.Router;

const recordController = require('../controllers/recordController');
const authMiddleWare = require('../middleware/auth');

module.exports = router => {

    //token 확인필요!
    router.get('/record/all', recordController.getAllRecords);

    router.get('/record/detail/:id', recordController.getDetailRecord);

    return router;
};

