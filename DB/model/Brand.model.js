import mongoose, { Schema, Types, model } from "mongoose";

// some string => some-string

const brandSchema = new Schema({
    name: { type: String, required: true, unique: true, trim: true, lower: true },
    slug:{ type: String, unique: true, trim: true},
    image: { type: Object, required: true },
    createdBy: { type: Types.ObjectId, ref: 'User', required: true }, 
    updatedBy: { type: Types.ObjectId, ref: 'User' }, 
}, {
    timestamps: true
})





const brandModel = mongoose.models.Brand || model("Brand", brandSchema)
export default brandModel