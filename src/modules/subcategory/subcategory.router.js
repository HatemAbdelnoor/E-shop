import * as subcategoryController from './controller/subcategory.js'
import { fileUpload, fileValidation } from '../../utils/multer.js'
import { Router } from "express";
import { auth } from '../../middleware/auth.js';
import { endpoint } from './subcategory.endPoint.js';
const router = Router({ mergeParams: true })


router.get('/',
    subcategoryController.getSubcategories)


router.post('/',
    auth(endpoint.create),
    fileUpload(fileValidation.image).single('image'),
    subcategoryController.createSubcategory)

router.put('/:subcategoryId',
    auth(endpoint.update),

    fileUpload(fileValidation.image).single('image'),
    subcategoryController.updateSubcategory)



export default router