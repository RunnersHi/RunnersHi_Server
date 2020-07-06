const express = require('express');
const router = express.Router;

const recordController = require('../../controllers/recordController');
const authMiddleWare = require('../middleware/auth');

router.get('/');
