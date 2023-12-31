import mongoose, { Schema, Types, model } from "mongoose";

const productSchema = new Schema({
    customId: { type: String, required: true },
    name: { type: String, required: true, trim: true, lower: true },
    slug: { type: String, required: true, trim: true, lower: true },
    description: { type: String, trim: true },
    colors: [String],
    size: {
        type: [String],
        enum: ['s', 'm', 'lg', 'xl','xxl']
    },

    stock: { type: Number, default: 1 },
    price: { type: Number, required: true, default: 1 },
    discount: { type: Number, default: 0 },
    finalPrice: { type: Number, required: true, default: 1 },



    mainImage: { type: Object, required: true },
    subImages: { type: [Object] },

    categoryId: { type: Types.ObjectId, ref: 'Category', required: true },
    subcategoryId: { type: Types.ObjectId, ref: 'Subcategory', required: true },
    brandId: { type: Types.ObjectId, ref: 'Brand', required: true },
    createdBy: { type: Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Types.ObjectId, ref: 'User' },
    wishUser: [{ type: Types.ObjectId, ref: 'User' }],
    isDeleted: { type: Boolean, default: false }
}, {

    toJSON:{virtuals:true},
    toObject:{virtuals:true},
    timestamps: true
})


productSchema.virtual('review', {
    ref: "Review",
    localField: "_id",
    foreignField: 'productId'
})




const productModel = mongoose.models.Product || model("Product", productSchema)
export default productModel