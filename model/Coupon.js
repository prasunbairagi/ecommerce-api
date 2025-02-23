import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const CouponSchema = new Schema(
    {
        code:{
            type: String,
            required: true
        },
        startDate:{
            type: Date,
            required: true,
        },
        endDate:{
            type: Date,
            required: true,
        },
        discount:{
            type: Number,
            required: true,
            default: 0
        },
        user:{
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        }
    },
    {
        timestamps:true,
        toJSON: { virtuals: true}
    }
);

//coupon is expired
CouponSchema.virtual("isExpired").get(function(){
    return this.endDate < Date.now();
});
CouponSchema.virtual("daysLeft").get(function(){
    const endDate = new Date(this.endDate);
    const today = new Date();

    // Set time to 00:00:00 UTC for accuracy
    endDate.setUTCHours(0, 0, 0, 0);
    today.setUTCHours(0, 0, 0, 0);

    const days = Math.floor((endDate - today) / (1000 * 60 * 60 * 24));
    return days + " Days left";
});

//validation
CouponSchema.pre('validate',function(next){
    if(this.endDate < this.startDate){
        next(new Error('End Date cannot be less than the start date'));
    }
    next();
})
CouponSchema.pre('validate',function(next){
    if(this.startDate < Date.now()){
        next(new Error('Start Date cannot be less than today'));
    }
    next();
})
CouponSchema.pre('validate', function(next){
    if(this.discount <=0 || this.discount > 100){
        next(new Error('Discount cant be less than 0 or greater than 100'))
    }
    next();
})
const Coupon = mongoose.model('Coupon', CouponSchema)
export default Coupon