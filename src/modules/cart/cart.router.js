import * as cartController from './controller/cart.js'
import * as validators from './cart.validation.js'
import { validation } from '../../middleware/validation.js';
import { endpoint } from './cart.endPoint.js'
import { auth } from '../../middleware/auth.js';
import { Router } from "express";
const router = Router()



router.get('/',
auth(endpoint.addToCart),
cartController.getCart)

router.post("/",
    auth(endpoint.addToCart),
    validation(validators.addToCart),
    cartController.addToCart)


router.patch("/remove",
    auth(endpoint.deleteFromCart),
    validation(validators.deleteFromCart),
    cartController.deleteFromCart)


router.patch("/clear",
    auth(endpoint.deleteFromCart),
    cartController.clearCart)




export default router