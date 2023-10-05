import cloudinary from '../../../utils/cloudinary.js'
import brandModel from '../../../../DB/model/Brand.model.js'
import { asyncHandler } from '../../../utils/errorHandling.js';
import slugify from 'slugify';


export const getBrand = asyncHandler(async (req, res, next) => {

    const brandList = await brandModel.find({
        isDeleted: false
    })
    return res.status(200).json({ message: "Done", brandList })

})

export const createBrand = asyncHandler(async (req, res, next) => {
    const name = req.body.name.toLowerCase();
    if (await brandModel.findOne({ name })) {
        return next(new Error(`Duplicated brand name ${name}`, { cause: 409 }))
    }
    const slug = slugify(name)
    const createdBy= req.user._id
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, { folder: `${process.env.APP_NAME}/brand` })
    const brand = await brandModel.create({
        name,
        slug,
        image: { secure_url, public_id },
        createdBy
    })
    return res.status(201).json({ message: "Done", brand })

})



export const updateBrand = asyncHandler(async (req, res, next) => {
    const { brandId } = req.params;
    const brand = await brandModel.findById(brandId)
    if (!brand) {
        return next(new Error(`In-valid brandId`, { cause: 400 }))

    }
    if (req.body.name) {
        req.body.name = req.body.name.toLowerCase()
        if (req.body.name == brand.name) {
            return next(new Error(`Cannot update brand with the same old name`, { cause: 400 }))
        }
        if (await brandModel.findOne({ name: req.body.name })) {
            return next(new Error(`Duplicated brand name ${req.body.name}`, { cause: 409 }))

        }
        brand.name = req.body.name
    }

    if (req.file) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, { folder: `${process.env.APP_NAME}/brand` })
        await cloudinary.uploader.destroy(brand.image.public_id)
        brand.image = { secure_url, public_id }
    }

    brand.updatedBy = req.user._id
    await brand.save()
    return res.status(200).json({ message: "Done", brand })

})