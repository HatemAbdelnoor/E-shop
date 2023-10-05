import { auth } from '../../middleware/auth.js';
import { endpoint } from './order.endPoint.js';
import * as orderController from './controller/order.js'
import { Router } from "express";
import { validation } from '../../middleware/validation.js';
import * as validators from './order.validation.js'
import express from 'express';
const router = Router()




router.post('/',
    auth(endpoint.create),
    validation(validators.createOrder),
    orderController.createOrder)


router.patch('/:orderId/cancel',
    auth(endpoint.cancel),
    validation(validators.cancel),
    orderController.cancelOrder)

router.patch('/:orderId/delivered',
    auth(endpoint.delivered),
    validation(validators.deliveredOrder),
    orderController.deliveredOrder)
    

    router.get("/"       ,
    orderController.getAllOrder)



router.post('/webhook', express.raw({ type: 'application/json' }), orderController.webHook);


export default router