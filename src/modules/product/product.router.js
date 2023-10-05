import reviewRouter from '../reviews/reviews.router.js'
import * as productController from './controller/product.js'
import * as validators from './product.validation.js'
import { fileUpload, fileValidation } from '../../utils/multer.js'
import { generalFields, validation } from '../../middleware/validation.js'
import { endpoint } from './product.endPoint.js';
import { auth, roles } from '../../middleware/auth.js'
import { Router } from "express";
const router = Router()


router.use("/:productId/review", reviewRouter)

router.get("/", productController.products)

router.post("/",
    auth(endpoint.create),
    fileUpload(fileValidation.image).fields([
        { name: 'mainImage', maxCount: 1 },
        { name: 'subImages', maxCount: 5 },

    ]),
    validation(validators.createProduct),
    productController.createProduct)


router.put("/:productId",
    auth(endpoint.update),
    fileUpload(fileValidation.image).fields([
        { name: 'mainImage', maxCount: 1 },
        { name: 'subImages', maxCount: 5 },

    ]),
    validation(validators.updateProduct),
    productController.updateProduct)

router.delete('/',
auth(endpoint.delete),
validation(validators.deleteProduct),
productController.deleteProduct)


export default router