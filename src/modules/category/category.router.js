import subcategoryRouter from '../subcategory/subcategory.router.js'
import * as categoryController from './controller/category.js'
import * as validators from './category.validation.js'
import { validation } from '../../middleware/validation.js';
import { fileUpload, fileValidation } from '../../utils/multer.js'
import { Router } from "express";
import { auth, roles } from '../../middleware/auth.js';
import { endpoint } from './category.endPoint.js';
const router = Router()


router.use("/:categoryId/subcategory", subcategoryRouter)
router.get('/',
    // auth(Object.values(roles)),
    categoryController.getCategories)


router.post('/',
    validation(validators.headers, true),
    auth(endpoint.create),
    fileUpload(fileValidation.image).single('image'),
    validation(validators.createCategory),
    categoryController.createCategory)

router.put('/:categoryId',
    validation(validators.headers, true),
    auth(endpoint.update),
    fileUpload(fileValidation.image).single('image'),
    validation(validators.updateCategory),
    categoryController.updateCategory)



export default router