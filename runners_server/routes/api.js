const userController = require('../controllers/userController');


module.exports = router => {

    // Register
    router.route('/users/register')
        .post(userController.register);

    //duplicates
    router.route('/users/duplicates')
        .post(userController.duplicates);

    //login
    router.route('/users/login')
        .post(userController.login);

    return router;
};
