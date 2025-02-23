import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const CategorySchema = new Schema(
    {
        name:{
            type: String,
            required: true
        },
        user:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },        
        images:{
                type: String,
                default: 'https://via.placeholder.com/150',
                required: true,
        },
        products:[
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product" 
            }
        ],
    },
    {
        timestamps:true,
    }
);
const Category = mongoose.model('Category', CategorySchema)
export default Category