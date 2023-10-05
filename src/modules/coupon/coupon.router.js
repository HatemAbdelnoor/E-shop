
import * as couponController from './controller/coupon.js'
import * as validators from './coupon.validation.js'
import { validation } from '../../middleware/validation.js';
import { Router } from "express";
import { auth } from '../../middleware/auth.js';
import { endpoint } from './coupon.endPoint.js';
const router = Router()


router.get('/',
    couponController.getCoupon)


router.post('/',
    auth(endpoint.create),
    validation(validators.createCoupon),
    couponController.createCoupon)

router.put('/:couponId',
    auth(endpoint.update),
    validation(validators.updateCoupon),
    couponController.updateCoupon)



export default router