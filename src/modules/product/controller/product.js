
import subcategoryModel from '../../../../DB/model/Subcategory.model.js'
import brandModel from '../../../../DB/model/Brand.model.js'
import productModel from '../../../../DB/model/Product.mode.js'

import slugify from 'slugify';
import cloudinary from '../../../utils/cloudinary.js'
import { asyncHandler } from '../../../utils/errorHandling.js'
import { nanoid } from 'nanoid';
import userModel from '../../../../DB/model/User.model.js';
import { paginate } from '../../../utils/paginate.js';
import ApiFeatures from '../../../utils/apiFeatures.js';


export const products = asyncHandler(async (req, res, next) => {


    const apiFeature = new ApiFeatures(productModel.find().populate([{path:"review"}]), req.query).paginate().filter().search().select()
    const productList = await apiFeature.mongooseQuery
    for (let i = 0; i < productList.length; i++) {
        let calcRating = 0;
        for (let j = 0; j < productList[i].review.length; j++) {
            calcRating += productList[i].review[j].rating
        }
        const convObject = productList[i].toObject()
        convObject.rating = calcRating / productList[i].review.length
        productList[i] = convObject

    }
    return res.status(200).json({ message: "Done", productList })




   
})
export const createProduct = async (req, res, next) => {
  
    const { name, price, discount,stock , categoryId, subcategoryId, brandId } = req.body;
    

          
    const isNameExist = await productModel.findOne({name})
    if (isNameExist ) {

        isNameExist.stock = Number(req.body?.stock)+isNameExist.stock || isNameExist.stock+1

       await isNameExist.save();
       return res.status(200).json({message:"done",product:isNameExist })
    }

    if (!await subcategoryModel.findOne({ _id: subcategoryId, categoryId })) {
        return next(new Error("In-valid category or subcategory ids", { cause: 400 }))
    }
    if (!await brandModel.findById(brandId)) {
        return next(new Error("In-valid category or brand ids", { cause: 400 }))
    }

    req.body.slug = slugify(name, {
        replacement: '-',
        trim: true,
        lower: true
    })

    req.body.finalPrice = price - (price * ((discount || 0) / 100)) 
    req.body.customId = nanoid()
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.files?.mainImage[0].path, { folder: `$/product/${req.body.customId}` })
    req.body.mainImage = { secure_url, public_id }

    if (req.files?.subImages?.length) {
        req.body.subImages = []
        for (const file of req.files.subImages) {
            const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, { folder: `${process.env.APP_NAME}/product/${req.body.customId}/subImages` })
            req.body.subImages.push({ secure_url, public_id })
        }
    }
const r =req.body?.stock 
    req.body.createdBy = req.user._id
    const product = await productModel.create(req.body);
    return res.status(201).json({  message: "Done", product,  })
}


export const updateProduct = asyncHandler(async (req, res, next) => {
    const { productId } = req.params;
    const product = await productModel.findById(productId)
    if (!product) {
        return next(new Error("In-valid product id", { cause: 404 }))
    }

    const { name, price, discount, categoryId, subcategoryId, brandId } = req.body;
    if (categoryId && subcategoryId) {
        if (!await subcategoryModel.findOne({ _id: subcategoryId, categoryId })) {
            return next(new Error("In-valid category or subcategory ids", { cause: 400 }))
        }
    }
    if (brandId) {
        if (!await brandModel.findById(brandId)) {
            return next(new Error("In-valid category or subcategory ids", { cause: 400 }))
        }
    }


    if (name) {
        req.body.slug = slugify(name, {
            replacement: '-',
            trim: true,
            lower: true
        })
    }


    req.body.finalPrice = (price || discount) ? (price || product.price) - ((price || product.price) * ((discount || product.discount) / 100)) : product.finalPrice;

    if (req.files?.mainImage?.length) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.files?.mainImage[0].path, { folder: `${process.env.APP_NAME}/product/${product.customId}` })
        req.body.mainImage = { secure_url, public_id }
        await cloudinary.uploader.destroy(product.mainImage.public_id)

    }


    if (req.files?.subImages?.length) {
        req.body.subImages = []
        for (const file of req.files.subImages) {
            const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, { folder: `${process.env.APP_NAME}/product/${product.customId}/subImages` })
            req.body.subImages.push({ secure_url, public_id })
        }

    }
    req.body.updatedBy = req.user._id
    await productModel.updateOne({ _id: productId }, req.body)
    return res.status(200).json({ message: "Done" })
})

 export const deleteProduct = async(req, res, next) => {

    const { productId }=req.body
     

    if (  ! await productModel.findOne({_id: productId})){

        return next(new Error("In-valid  productId ids", { cause: 400 }))

     
    }


    const   product = await productModel.findByIdAndDelete({_id: productId})
        
     
    return res.status(201).json({ message: "Done", product })


 }