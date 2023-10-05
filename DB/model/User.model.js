import mongoose, { Schema, Types, model } from "mongoose";
const userSchema = new Schema({
    userName: {
        type: String,
        required: [true, 'userName is required'],
        min: [2, 'minimum length 2 char'],
        max: [20, 'max length 2 char']

    },
    email: {
        type: String,
        unique: [true, 'email must be unique value'],
        required: [true, 'userName is required'],
        lower: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'password is required'],
    },
    phone: {
        type: String,
    },
    address: String,
    gender: {
        type: String,
        default: 'male',
        enum: ['male', 'female']
    },
    role: {
        type: String,
        default: 'User',
        enum: ['User', 'Admin']
    },
    confirmEmail: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        default: 'offline',
        enum: ['offline', 'online', ]
    },
    image: String,
    DOB: String,
    code: {
        type: Number,
        default: null
    },
    changePasswordTime: Date,
    wishlist: [{ type: Types.ObjectId, ref: 'Product' }]
}, {
    timestamps: true
})


const userModel = mongoose.models.User || model('User', userSchema)
export default userModel