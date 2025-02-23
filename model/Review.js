import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const ReviewSchema = new Schema(
    {
        user:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, 'Review Must Belong To A User'],
        }, 
        product:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: [true, 'Review Must Belong To A Product'] 
        },
        message:{
            type: String,
            required: [true, 'Please Add A Message'] 
        },
        rating:{
            type: Number,
            required: [true, 'Please Add A Rating Between 1 And 5'],
            min: 1,
            max: 5
        },
    },
    {
        timestamps:true,
    }
);
const Review = mongoose.model('Review', ReviewSchema)
export default Review