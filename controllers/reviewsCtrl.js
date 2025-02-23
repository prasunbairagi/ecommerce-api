import Review from '../model/Review.js';
import Product from '../model/Product.js';
import asyncHandler from "express-async-handler";

// @desc Create new review
// @route POST /api/v1/reviews
// @access Public
export const createReviewCtrl = asyncHandler(async (req, res) => {
    const {product,message,rating} = req.body;
    //1. Find the product 
    const { productID } = req.params;
    const productFound = await Product.findById(productID).populate('reviews');
    if(!productFound){
        throw new Error('Product Not Found')
    }
    //check if user already reviewed the product
    const hasReviewed = productFound?.reviews?.find(
        (review) => review?.user?.toString() === req?.userAuthId?.toString()
    );
    if(hasReviewed){
        throw new Error('You have already reviewed this product')
    };
    //create review
    const review = await Review.create({
        message,
        rating,
        product:productFound?._id,
        user:req.userAuthId,
    });
    //push review to product
    productFound.reviews.push(review?._id)
    //resave
    await productFound.save();
    res.json({
        status: 'success',
        message: 'Review created successfully',
        review
    })
});