import mongoose, { Schema, Types, model } from "mongoose";

// some string => some-string

const subcategorySchema = new Schema({
    name: { type: String, required: true, unique: true, trim: true, lower: true },
    slug: { type: String, required: true },
    image: { type: Object, required: true },
    categoryId: {
        type: Types.ObjectId,
        ref: 'Category', required: true
    },
    createdBy: { type: Types.ObjectId, ref: 'User', required: true },
}, {
    timestamps: true
})





const subcategoryModel = mongoose.models.Subcategory || mongoose.model("Subcategory", subcategorySchema)
export default subcategoryModel