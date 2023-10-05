import * as authController from './controller/registration.js'
import * as validators from './auth.validation.js'
import { validation } from '../../middleware/validation.js'
import { Router } from "express";
const router = Router()



router.post('/signup',
    validation(validators.signup),
    authController.signup)


router.get('/confirmEmail/:token',
    validation(validators.token),
    authController.confirmEmail)

router.get('/NewConfirmEmail/:token',
    validation(validators.token),
    authController.RequestNewConfirmEmail)

router.post('/login',
    validation(validators.login),
    authController.login)

router.patch("/sendCode",
    validation(validators.sendCode),
    authController.sendCode)

router.patch("/forgetPassword",
    validation(validators.forgetPassword),
    authController.forgetPassword)
    
    router.get("/Logout", 
    authController.logout)
    
export default router