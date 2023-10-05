import mongoose, { Schema, Types, model } from "mongoose";


const couponSchema = new Schema({
    name: { type: String, required: true, unique: true, trim: true, lower: true },
    amount: { type: Number, default: 0 },
    image: { type: Object },
    expire: { type: Date, required: true },
    usedBy: [{ type: Types.ObjectId, ref: 'User' }],
    createdBy: { type: Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Types.ObjectId, ref: 'User' },
}, {
    timestamps: true
})





const couponModel = mongoose.models.Coupon || model("Coupon", couponSchema)
export default couponModel