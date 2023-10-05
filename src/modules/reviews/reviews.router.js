import { auth } from '../../middleware/auth.js';
import { validation } from '../../middleware/validation.js';
import * as validators from './reviews.validation.js'
import * as  reviewController from './controller/review.js'
import { Router } from "express";
import { endpoint } from './reviews.endPoint.js';
const router = Router({ mergeParams: true })



router.post('/',
    auth(endpoint.create),
    validation(validators.createReview),
    reviewController.createReview)

router.patch('/:reviewId',
    auth(endpoint.update),
    validation(validators.updateReview),
    reviewController.updateReview)



export default router