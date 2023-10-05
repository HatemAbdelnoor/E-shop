import cartModel from "../../../../DB/model/Cart.model.js";
import couponModel from "../../../../DB/model/Coupon.model.js";
import orderModel from "../../../../DB/model/Order.model.js";
import productModel from "../../../../DB/model/Product.mode.js";
import sendEmail from "../../../utils/email.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import createInvoice from "../../../utils/pdf.js";
 import { clearCartProducts, deleteElementsFromCart } from "../../cart/controller/cart.js";
import cloudinary from '../../../utils/cloudinary.js'
import fs from 'fs'
import { buffer } from 'micro';

import path from 'path'
import { fileURLToPath } from 'url'
import { nanoid } from "nanoid";
import Stripe from 'stripe';
const stripe = new Stripe(process.env.Secret_key);





const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const createOrder = async (req, res, next) => {
    const { address, phone, note, couponName, paymentType } = req.body;

    if (!req.body.products) {
        const cart = await cartModel.findOne({ userId: req.user._id })
        if (!cart.products?.length) {
            return next(new Error(`empty cart`, { cause: 400 }))
        }
        req.body.isCart = true
        req.body.products = cart.products
    }


    if (couponName) {
        const coupon = await couponModel.findOne({ name: couponName.toLowerCase() })

        if (!coupon || coupon.expire.getTime() < Date.now()) {
            return next(new Error(`In-valid or expire coupon`, { cause: 400 }))
        }
        req.body.coupon = coupon;
    }

    const productsIds = []
    const finalProductsList = []
    let subtotal = 0;
    for (let product of req.body.products) {

        const checkProduct = await productModel.findOne({
            _id: product.productId,
            stock: { $gte: product.quantity },
        })
        if (!checkProduct) {
            return next(new Error(`In-valid product ${product.productId}`, { cause: 400 }))
        }
        productsIds.push(product.productId)
        product = req.body.isCart ? product.toObject() : product
        product.name = checkProduct.name;
        product.unitPrice = checkProduct.finalPrice;
        product.finalPrice = product.unitPrice * product.quantity;
        finalProductsList.push(product)
        subtotal += product.finalPrice
        await checkProduct.save();


    }
    console.log({finalProductsList});
    const order = await orderModel.create({
        userId: req.user._id,
        address,
        note,
        phone,
        products: finalProductsList,
       
        couponId: req.body.coupon?._id,
        subtotal,
        finalPrice: subtotal - (subtotal * ((req.body.coupon?.amount || 0) / 100)),
        paymentType,
        status: paymentType == 'card' ? 'waitPayment' : 'placed'
    } , 
    )

    for (const product of req.body.products) {
        await productModel.updateOne({ _id: product.productId }, { $inc: { stock: -parseInt(product.quantity) } })
    }

    if (req.body.coupon?._id) {
        await couponModel.updateOne({ _id: req.body.coupon?._id }, { $addToSet: { usedBy: req.user._id } })
    }

    if (!req.body.isCart) {
        await deleteElementsFromCart(productsIds, req.user._id)
    } else {
        await clearCartProducts(req.user._id)
    }



    if (order.paymentType == 'card') {
        

           const session= await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            customer_email: req.user.email,
            cancel_url: 'https://res.cloudinary.com/dczrkoxuk/image/upload/v1694048131/acsfo9mkbfugzxnr6mfy.jpg',
            success_url: 'https://res.cloudinary.com/dczrkoxuk/image/upload/v1694048131/mmal35kpagvhrjwd7laj.jpg',
            metadata:{
                order_id: order._id.toString()
            },
            discounts:[],
            line_items: finalProductsList.map(ele=>{
                return{     
                        price_data:{
                    currency:"EGP",
                    product_data:{
                        name:ele.name,
                        
                    

                    },
       unit_amount:ele.unitPrice *100
                },
                quantity:ele.quantity
            ,
}
            }) 
                
       

           })   
            
           try {

               const invoice = {
                   shipping: {
                       name: req.user.userName,
                       address: order.address,
            
                   },
                   items: order.products,
                   subtotal: subtotal,
                   paid: order.finalPrice,
                   invoice_nr: order._id.toString(),
                   discount: req.body.coupon?.amount || 0,
                   createAt: order.createdAt
               };
       
               const customId = Date.now()
               await createInvoice(invoice, path.join(__dirname, `../PDF/invoice${customId}.pdf`));
             const { secure_url } = await cloudinary.uploader.upload(path.join(__dirname, `../PDF/invoice${customId}.pdf`),
            { folder: `${process.env.APP_NAME}/Invoice` })

      

   await sendEmail({
       to: req.user.email, subject: "Invoice", attachments: [{
           filename: `invoice${customId}.pdf`,

           path: path.join(__dirname,`../PDF/invoice${customId}.pdf`), 
           contentType: 'application/pdf'

       }]
   })
         console.log({filename,content});
      
               setTimeout(() => {
                   try {
                       fs.unlinkSync(path.join(__dirname, `../PDF/invoice${customId}.pdf`))
                   } catch (error) {
                       console.log(error);
                   }
               }, 0)
               req.body.Invoice = true
       
           } catch (error) {
               req.body.Invoice = false
               console.log(error);
       
           }

  

 

        return res.status(201).json({ message: "Done" ,order,session ,invoice: req.body.Invoice })


    }
    return res.status(201).json({ message: "Done", order })

    }
export const webHook = asyncHandler(async (req, res, next) => {

    const sig = req.headers['stripe-signature'];
       const request= req.body
    let event;

    try {
        event = stripe.webhooks.constructEvent(request, sig, process.env.endpointSecret);
    } catch (err) {
        res.status(400).send(`Webhook Error: ${err.message}`);
        return; 
    }

    const { orderId } = event.data.object.metadata
    if (event.type != 'checkout.session.completed') {
        await orderModel.updateOne({ _id: orderId }, { status: "rejected" })
        return res.status(400).json({ message: "Rejected payment" })
    }
    await orderModel.updateOne({ _id: orderId }, { status: "placed" })
    return res.status(200).json({ message: "Done" ,event})
 
})

export const cancelOrder = asyncHandler(async (req, res, next) => {
    const { orderId } = req.params;
    const { reason } = req.body
    const order = await orderModel.findOne({ _id: orderId, userId: req.user._id })
    if (!order) {
        return next(new Error(`In-valid `, { cause: 400 }))
    }
    if ((order.status != 'placed' && order.paymentType == 'cash') ||
        (order.status != 'waitPayment' && order.paymentType == 'card')) {
        return next(new Error(`Cannot cancel your order  after it been changed to ${order.status} `, { cause: 400 }))
    }

    await orderModel.updateOne({ _id: orderId, userId: req.user._id }, { status: 'canceled', updatedBy: req.user._id, reason })
    for (const product of order.products) {
        await productModel.updateOne({ _id: product.productId }, { $inc: { stock: parseInt(product.quantity) } })
    }

    if (order.couponId) {
        await couponModel.updateOne({ _id: order.couponId }, { $pull: { usedBy: req.user._id } })
    }

    return res.status(201).json({ message: "Done", order })
})

export const deliveredOrder = asyncHandler(async (req, res, next) => {
    const { orderId } = req.params;
    const order = await orderModel.findOne({ _id: orderId })
    if (!order) {
        return next(new Error(`In-valid Id`, { cause: 400 }))
    }
    if (['waitPayment', 'canceled', 'rejected', 'delivered'].includes(order.status)) {
        return next(new Error(`Cannot update your order  after it been changed to ${order.status} `, { cause: 400 }))
    }

    await orderModel.updateOne({ _id: orderId }, { status: 'delivered', updatedBy: req.user._id })

    return res.status(201).json({ message: "Done", order })
})

  export const getAllOrder= asyncHandler(async(req, res, next) => {
    
     const order = await orderModel.find()



    return res.status(201).json({ message: "Done", order })



})

