const express = require('express');

const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.get('/logout', authController.logout);

router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);

// protect all routes after this middleware
router.use(authController.protect);

router.get('/me', userController.getMe, userController.getUser);
router.patch('/update-password', authController.updatePassword);

router.patch(
    '/update-me', 
    userController.uploadUserPhoto, 
    userController.resizeUserPhoto, 
    userController.updateMe
);

router.delete('/delete-me', userController.deleteMe);

// only admin can access the routes after this middleware
router.use(authController.restrictTo('admin'));

router
 .route('/')
 .get(userController.getAllUsers)
 .post(userController.createUser);

router
 .route('/:id')
 .get(userController.getUser)
 .patch(userController.updateUser)
 .delete(userController.deleteUser);



 module.exports = router;