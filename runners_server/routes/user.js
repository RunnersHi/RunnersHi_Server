const userController = require('../controllers/userController');
const authController = require('../controllers/authController');


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


    router.route('/users/myProfile')
        .get(authController.auth, userController.myProfile);

    return router;
};
