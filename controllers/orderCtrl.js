import Order from '../model/Order.js';
import Product from '../model/Product.js';
import User from '../model/User.js';
import asyncHandler from "express-async-handler";
import Stripe from 'stripe';
import dotenv from "dotenv";
import Coupon from '../model/Coupon.js';
dotenv.config();

// @desc Create new order
// @route POST /api/v1/orders
// @access Private

//stripe instance
const stripe = new Stripe(process.env.STRIPE_KEY)
export const createOrderCtrl = asyncHandler(async (req, res) => {
    //Get the coupon
    const {coupon} = req?.query
    const couponFound = await Coupon.findOne({
        code: coupon?.toUpperCase(),
    });
    if(couponFound?.isExpired){
        throw new Error('Coupon has expired')
    }
    if(!couponFound){
        throw new Error('Coupon does not exist')
    }
    const discount = couponFound?.discount / 100;
    //Get the payload(customer,orderitems,shippingAddress,totalPrice)
    const { orderItems, shippingAddress, totalPrice } = req.body;
    //Find the user
    const user = await User.findById(req.userAuthId);
    //Check if user has shipping address
    if(!user?.hasShippingAddress){
        throw new Error('User has no shipping address');
    }
    //Check if order is not empty
    if(orderItems?.length <= 0){
        throw new Error('No order items')
    }
    //Place/create the order and save into DB
    const order = await Order.create({
        user: user?._id,
        orderItems,
        shippingAddress,
        totalPrice: couponFound ? totalPrice - totalPrice * discount : totalPrice,
    });
    console.log(order)
    //update the product qty
    const products = await Product.find({ _id: { $in: orderItems.map(item => item._id) } });
    orderItems?.map(async (order)=>{
        const product = products?.find((product) =>{
            return product?._id?.toString() === order?._id?.toString();
        });
        if(product){
            product.totalSold += order.qty;
        }
        await product.save()
    });
    //push order into user
    user.orders.push(order?._id);
    await user.save();
    //make payment(stripe)
    // convert order items to have same structure that stripe need
    const convertedOrders = orderItems.map((item) =>{
        return { 
            price_data:{
                currency: "usd",
                product_data: {
                    name: item?.name,
                    description: item?.description,
                },
                unit_amount: (couponFound ? item?.price - item?.price * discount : item?.price) * 100,
            },
            quantity: item?.qty,
        };
    });
    // // session
    const session = await stripe.checkout.sessions.create({
        line_items: convertedOrders,
        metadata:{
            orderId : JSON.stringify(order?._id)                
        },
        mode:'payment',
        success_url:'http://localhost:3000/success',
        cancel_url:'http://localhost:3000/cancel'
    });
    res.send({url: session.url});
});

// @desc get all orders
// @route GET /api/v1/orders
// @access Private

export const getAllordersCtrl = asyncHandler(async(req,res) =>{
    const orders = await Order.find();
    res.json({
        status: 'success',
        message: 'All Orders fetched successfully',
        orders
    })
})

// @desc get single order
// @route GET /api/v1/orders/:id
// @access Private

export const getSingleOrderCtrl = asyncHandler(async(req,res) =>{
    const id = req.params.id;
    const order = await Order.findById(id);
    res.status(200).json({
        success: true,
        message: 'Single Order fetched successfully',
        order
    })
})

// @desc update order to delivered
// @route PUT /api/v1/orders/update/:id
// @access private/admin

export const updateOrderCtrl = asyncHandler(async(req,res) =>{
    const id = req.params.id;
    const updatedOrder = await Order.findByIdAndUpdate(
        id,
        {
            status: req.body.status,
        },
        {new: true}
    );
    res.status(200).json({
        success: true,
        message: 'Order updated',
        updatedOrder
    })
})

export const getOrderStatsCtrl = asyncHandler(async (req,res) =>{
    //get order stats
    const orders = await Order.aggregate([
        {
            $group: {
                _id: null,
                minimumSale:{
                    $min: "$totalPrice",
                },
                totalSales:{
                    $sum: "$totalPrice",
                },
                maxSale:{
                    $max: "$totalPrice",
                },
                avgSale:{
                    $avg: "$totalPrice",
                },
            }
        }
    ]);
    //get the date
    const date = new Date();
    const today = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const saleToday = await Order.aggregate([
        {
            $match:{
                createdAt: {
                    $gte: today
                }
            }
        },
        {
            $group:{
                _id:null,
                totalSales:{
                    $sum:"$totalPrice"
                }
            }
        }
    ])
    res.status(200).json({
        success: true,
        message: 'Sum of orders',
        orders,
        saleToday
    })
})