const userController = require('../controllers/userController');
const authController = require('../controllers/authController');


module.exports = router => {

    // Register
    router.post('/register', userController.register);

    //duplicates
    router.post('/duplicates', userController.duplicates);

    //login
    router.post('/login', userController.login);

    //myProfile
    router.get('/myProfile', [authController.auth, userController.myProfile]);

    return router;
};
