import Brand from '../model/Brand.js';
import asyncHandler from "express-async-handler";

// @desc Create new brand
// @route POST /api/v1/brands
// @access Private/Admin
export const createBrandCtrl = asyncHandler(async (req, res) => {
    const { name } = req.body;
    // brand exists
    const brandFound = await Brand.findOne({ name });
    if ( brandFound ){
        throw new Error('Brand already exists');
    }
    // create
    const brand = await Brand.create({
        name: name.toLowerCase(),
        user: req.userAuthId,
    });
    res.json({
        status: 'success',
        message: 'Brand created successfully',
        brand
    })
});

// @desc Get All Brands
// @route GET /api/v1/brands
// @access Public
export const getAllBrandsCtrl = asyncHandler(async (req, res) => {
    const brands = await Brand.find()
    res.json({
        status: 'success',
        message: 'Brands fetched successfully',
        brands
    })
});

// @desc Get Single Brand
// @route GET /api/v1/brands/:id
// @access Public
export const getSingleBrandCtrl = asyncHandler(async (req, res) => {
    const brand = await Brand.findById(req.params.id);
    if(!brand){
        throw new Error('No Brand Found')
    }
    res.json({
        status: 'success',
        message: 'Brand fetched successfully',
        brand
    })
});

// @desc Update brand
// @route PUT /api/brands/:id
// @access Private/ Admin
export const updateBrandCtrl = asyncHandler(async (req, res) => {
    const { name } = req.body;
    const brand = await Brand.findByIdAndUpdate(req.params.id,
        {name},
        {new: true}
    );
    if(!brand){
        throw new Error('No Brand Found By this Id to Update')
    }
    res.json({
        status: 'success',
        message: 'Brand updated successfully',
        brand
    });
})

// @desc Delete brand
// @route DELETE /api/brands/:id
// @access Private/ Admin
export const deleteBrandCtrl = asyncHandler(async (req, res) => {
    const brand = await Brand.findByIdAndDelete(req.params.id);
    if(!brand){
        throw new Error('No Brand Found By this Id to Delete')
    }
    res.json({
        status: 'success',
        message: 'Brand deleted successfully',
        brand
    });
})

// @desc Delete All brands
// @route DELETE /api/brands/delete/all
// @access Private/ Admin
export const deleteAllBrandsCtrl = asyncHandler(async (req, res) => {
    // Delete all documents in the Brand collection
    const result = await Brand.deleteMany();
    res.json({
        status: 'success',
        message: 'All brands deleted successfully',
        deletedCount: result.deletedCount, // Number of documents deleted
    });
});
