import cloudinary from '../../../utils/cloudinary.js'
import couponModel from '../../../../DB/model/Coupon.model.js'
import { asyncHandler } from '../../../utils/errorHandling.js';


export const getCoupon = asyncHandler(async (req, res, next) => {

    const couponList = await couponModel.find({
        isDeleted: false
    })
    return res.status(200).json({ message: "Done", couponList })

})

export const createCoupon = asyncHandler(async (req, res, next) => {
    req.body.name = req.body.name.toLowerCase();
    if (await couponModel.findOne({ name: req.body.name })) {
        return next(new Error(`Duplicated coupon name ${req.body.name}`, { cause: 409 }))
    }


    req.body.createdBy = req.user._id
    const coupon = await couponModel.create(req.body)

    return res.status(201).json({ message: "Done", coupon })

})



export const updateCoupon = asyncHandler(async (req, res, next) => {
    const { couponId } = req.params;
    const coupon = await couponModel.findById(couponId)
    if (!coupon) {
        return next(new Error(`In-valid coupon Id`, { cause: 400 }))

    }
    if (req.body.name) {
        req.body.name = req.body.name.toLowerCase()
        if (req.body.name == coupon.name) {
            return next(new Error(`Cannot update coupon with the same old name`, { cause: 400 }))
        }
        if (await couponModel.findOne({ name: req.body.name })) {
            return next(new Error(`Duplicated coupon name ${req.body.name}`, { cause: 409 }))

        }
    }


    req.body.updatedBy = req.user._id
    const updatedCoupon = await couponModel.updateOne({ _id: couponId }, req.body)
    return res.status(200).json({ message: "Done", updatedCoupon })

})