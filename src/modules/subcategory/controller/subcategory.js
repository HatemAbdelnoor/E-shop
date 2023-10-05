import cloudinary from '../../../utils/cloudinary.js'
import subcategoryModel from '../../../../DB/model/Subcategory.model.js'
import categoryModel from '../../../../DB/model/Category.model.js';
import slugify from 'slugify';
import { asyncHandler } from '../../../utils/errorHandling.js';



export const getSubcategories = asyncHandler(async (req, res, next) => {

    const subcategoryList = await subcategoryModel.find({
        isDeleted: false
    }).populate([
        {
            path: 'categoryId'
        }
    ])
    return res.status(200).json({ message: "Done", subcategoryList })

})

export const createSubcategory = asyncHandler(async (req, res, next) => {

    const { categoryId } = req.body;

    if (!await categoryModel.findById(categoryId)) {
        return next(new Error(`In-valid category Id`, { cause: 400 }))
    }

    const name = req.body.name.toLowerCase();
    if (await subcategoryModel.findOne({ name })) {
        return next(new Error(`Duplicated subcategory name ${name}`, { cause: 409 }))
    }
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, { folder: `${process.env.APP_NAME}/category/${categoryId}` })
    const subcategory = await subcategoryModel.create({
        name,
        slug: slugify(name),
        image: { secure_url, public_id },
        categoryId,
        createdBy: req.user._id
    })

    return res.status(201).json({ message: "Done", subcategory })

})



export const updateSubcategory = asyncHandler(async (req, res, next) => {
    const { subcategoryId, categoryId } = req.params;
    const subcategory = await subcategoryModel.findOne({ _id: subcategoryId, categoryId })
    if (!subcategory) {
        return next(new Error(`In-valid subcategory Id`, { cause: 400 }))

    }
    if (req.body.name) {
        req.body.name = req.body.name.toLowerCase()
        if (req.body.name == subcategory.name) {
            return next(new Error(`Cannot update subcategory with the same old name`, { cause: 400 }))
        }
        if (await subcategoryModel.findOne({ name: req.body.name })) {
            return next(new Error(`Duplicated subcategory name ${req.body.name}`, { cause: 409 }))

        }
        subcategory.slug = slugify(req.body.name)
        subcategory.name = req.body.name
    }

    if (req.file) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, { folder: `${process.env.APP_NAME}/category/${categoryId}` })
        await cloudinary.uploader.destroy(subcategory.image.public_id)
        subcategory.image = { secure_url, public_id }
    }

    subcategory.updatedBy = req.user._id
    await subcategory.save()
    return res.status(200).json({ message: "Done", subcategory })

})