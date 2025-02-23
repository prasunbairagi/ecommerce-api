import Coupon from '../model/Coupon.js';
import asyncHandler from "express-async-handler";

// @desc Create new Coupon
// @route POST /api/v1/coupons
// @access Private/Admin
export const createCouponCtrl = asyncHandler(async(req,res)=>{
    const {code, startDate, endDate, discount} = req.body;
    // check if admin
    const couponsExists = await Coupon.findOne({
        code,
    });
    // check if coupon already exists
    if (couponsExists){
        throw new Error("Coupon already exists");
    }
    // check if discount is a number
    if (isNaN(discount)){
        throw new Error("Discount value must be a number")
    }
    //create coupon
    const coupon = await Coupon.create({
        code: code?.toUpperCase(), startDate, endDate, discount, user: req.userAuthId
    })
    res.status(200).json({
        status: "success",
        message: 'Coupon Created successfully',
        coupon
    });
})

// @desc Get all coupons
// @route GET /api/v1/coupons
// @access Private/Admin
export const getAllCouponsCtrl = asyncHandler(async(req,res)=>{
    const coupons = await Coupon.find();
    res.status(200).json({
        status: 'success',
        message: 'All coupons',
        coupons,
    });
});
// @desc Get Single Coupon
// @route GET /api/v1/coupons/:id
// @access Private/Admin
export const getSingleCouponCtrl = asyncHandler(async(req,res)=>{
    const coupon = await Coupon.findById(req.params.id);
    res.status(200).json({
        status: 'success',
        message: 'Coupon fetched successfully',
        coupon,
    });
});
// @desc Update Coupon
// @route PUT /api/v1/coupons/:id
// @access Private/Admin
export const updateCouponCtrl = asyncHandler(async(req,res)=>{
    const {code, startDate, endDate, discount} = req.body;
    const coupon = await Coupon.findByIdAndUpdate(
        req.params.id,
        {
            code: code?.toUpperCase(),
            discount,
            startDate,
            endDate,
        },
        {
            new: true
        }
    );
    res.status(200).json({
        status: 'success',
        message: 'Coupon updated successfully',
        coupon,
    });
});
// @desc Delete Coupon
// @route DELETE /api/v1/coupons/:id
// @access Private/Admin
export const deleteCouponCtrl = asyncHandler(async(req,res)=>{
    const coupon = await Coupon.findbyIdAndDelete(req.params.id);
    res.status(200).json({
        status: 'success',
        message: 'Coupon deleted successfully',
        coupon,
    });
});