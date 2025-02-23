import Color from '../model/Color.js';
import asyncHandler from "express-async-handler";

// @desc Create new color
// @route POST /api/v1/colors
// @access Private/Admin
export const createColorCtrl = asyncHandler(async (req, res) => {
    const { name } = req.body;
    // color exists
    const colorFound = await Color.findOne({ name });
    if ( colorFound ){
        throw new Error('Color already exists');
    }
    // create
    const color = await Color.create({
        name: name.toLowerCase(),
        user: req.userAuthId,
    });
    res.json({
        status: 'success',
        message: 'Color created successfully',
        color
    })
});

// @desc Get All Colors
// @route GET /api/v1/colors
// @access Public
export const getAllColorsCtrl = asyncHandler(async (req, res) => {
    const colors = await Color.find()
    res.json({
        status: 'success',
        message: 'Colors fetched successfully',
        colors
    })
});

// @desc Get Single Color
// @route GET /api/v1/colors/:id
// @access Public
export const getSingleColorCtrl = asyncHandler(async (req, res) => {
    const color = await Color.findById(req.params.id);
    if(!color){
        throw new Error('No Color Found')
    }
    res.json({
        status: 'success',
        message: 'Color fetched successfully',
        color
    })
});

// @desc Update color
// @route PUT /api/colors/:id
// @access Private/ Admin
export const updateColorCtrl = asyncHandler(async (req, res) => {
    const { name } = req.body;
    const color = await Color.findByIdAndUpdate(req.params.id,
        {name},
        {new: true}
    );
    if(!color){
        throw new Error('No Color Found By this Id to Update')
    }
    res.json({
        status: 'success',
        message: 'Color updated successfully',
        color
    });
})

// @desc Delete color
// @route DELETE /api/colors/:id
// @access Private/ Admin
export const deleteColorCtrl = asyncHandler(async (req, res) => {
    const color = await Color.findByIdAndDelete(req.params.id);
    if(!color){
        throw new Error('No Color Found By this Id to Delete')
    }
    res.json({
        status: 'success',
        message: 'Color deleted successfully',
        color
    });
})

// @desc Delete All colors
// @route DELETE /api/colors/delete/all
// @access Private/ Admin
export const deleteAllColorsCtrl = asyncHandler(async (req, res) => {
    // Delete all documents in the Color collection
    const result = await Color.deleteMany();
    res.json({
        status: 'success',
        message: 'All colors deleted successfully',
        deletedCount: result.deletedCount, // Number of documents deleted
    });
});
