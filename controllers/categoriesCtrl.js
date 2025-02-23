import Category from '../model/Category.js';
import asyncHandler from "express-async-handler";

// @desc Create new category
// @route POST /api/v1/categories
// @access Private/Admin
export const createCategoryCtrl = asyncHandler(async (req, res) => {
    const { name } = req.body;
    // category exists
    const categoryFound = await Category.findOne({ name });
    if ( categoryFound ){
        throw new Error('Category already exists');
    }
    // create
    const category = await Category.create({
        name: name.toLowerCase(),
        user: req.userAuthId,
        images: req.file.path
    });
    res.json({
        status: 'success',
        message: 'Category created successfully',
        category
    })
});

// @desc Get All Categories
// @route GET /api/v1/categories
// @access Public
export const getAllCategoriesCtrl = asyncHandler(async (req, res) => {
    const categories = await Category.find()
    res.json({
        status: 'success',
        message: 'Categories fetched successfully',
        categories
    })
});

// @desc Get Single Category
// @route GET /api/v1/categories/:id
// @access Public
export const getSingleCategoryCtrl = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);
    if(!category){
        throw new Error('No Category Found')
    }
    res.json({
        status: 'success',
        message: 'Category fetched successfully',
        category
    })
});

// @desc Update category
// @route PUT /api/categories/:id
// @access Private/ Admin
export const updateCategoryCtrl = asyncHandler(async (req, res) => {
    const { name } = req.body;
    const category = await Category.findByIdAndUpdate(req.params.id,
        {name},
        {new: true}
    );
    if(!category){
        throw new Error('No Category Found By this Id to Update')
    }
    res.json({
        status: 'success',
        message: 'Category updated successfully',
        category
    });
})

// @desc Delete category
// @route DELETE /api/categories/:id
// @access Private/ Admin
export const deleteCategoryCtrl = asyncHandler(async (req, res) => {
    const category = await Category.findByIdAndDelete(req.params.id);
    if(!brand){
        throw new Error('No Category Found By this Id to Delete')
    }
    res.json({
        status: 'success',
        message: 'Category deleted successfully',
        category
    });
})
