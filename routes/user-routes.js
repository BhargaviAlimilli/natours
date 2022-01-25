const express= require('express')
const authControllers=require('./../controllers/authController')
const userControllers= require('./../controllers/user-controller')

const router= express.Router()

router.route('/signup').post( authControllers.signup)
router.route('/login').post( authControllers.login)
router.route('/forgotPassword').post(authControllers.forgotPassword)
router.route('/resetPassword/:token').patch(authControllers.resetPassword)

router.use(authControllers.protect)// all the below routes are now protected by protect midleware no need pass protect again in that routes

router.route('/updateMyPassword').patch(authControllers.updatePassword)
router.route('/updateMe').patch(userControllers.updateMe)
router.route('/deleteMe').delete(userControllers.deleteMe)
router.route('/me').get(authControllers.protect,userControllers.getMe,userControllers.getUser)

router.use(authControllers.restrictTo('admin'))// all the below routes are restricted to admin only

router.route('/:id').get(userControllers.getUser)
router.route('/allusers').get(userControllers.getAllUsers)
router.route('/update/:id').patch(userControllers.updateUser)
router.route('/:id').delete(userControllers.deleteUser)


module.exports= router

