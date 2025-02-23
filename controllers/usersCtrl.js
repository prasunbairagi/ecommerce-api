import User from "../model/User.js";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import { getTokenFromHeader } from "../utils/getTokenFromHeader.js";
import { verifyToken } from "../utils/verifyToken.js";

// @desc Register User
// @route POST/api/v1/users/register
// @access Private/Admin
export const registerUserCtrl = asyncHandler(async (req, res) => {
    const { fullname, email, password } = req.body;
    //Check USer exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new Error("User already exists");
    } else {
        //hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        //create the user
        const user = await User.create({
            fullname,
            email,
            password: hashedPassword,
        });
        res.status(201).json({
            status: "success",
            message: "User registered successfully",
            data: user,
        });
    }
});

// @desc Login User
// @route POST/api/v1/users/login
// @access Public
export const loginUserCtrl = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    // Find the user in db by email only
    const userFound = await User.findOne({ email });
    if (userFound) {
        const isMatch = await bcrypt.compare(password, userFound.password);
        if (isMatch) {
            return res.json({
                status: "success",
                message: "Successfully logged in",
                userFound,
                token: generateToken(userFound?._id),
            });
        } else {
            throw new Error("Invalid login");
        }
    } else {
        throw new Error("Invalid login");
    }
});

// @desc Get User Profile
// @route POST/api/v1/users/profile
// @access Private
export const getUserProfileCtrl = asyncHandler(async (req, res) => {
    const user = await User.findById(req.userAuthId).populate('orders');
    res.json({
        status: "success",
        message: 'User profile fetched successfully',
        user
    });
});

// @desc Update User Shipping Address
// @route PUT/api/v1/users/update/shipping
// @access Private
export const updateShippingAddressCtrl = asyncHandler(async (req, res) => {
    const { firstName, lastName, address, city, postalCode, province, phone } = req.body;
    const user = await User.findByIdAndUpdate( req.userAuthId, 
        {   
            shippingAddress: {
                firstName,
                lastName,
                address,
                city,
                postalCode,
                province,
                phone,
            },
            hasShippingAddress: true,
        },
        {
            new:true,
        }
    );
    //send response
    res.json({
        status: 'success',
        message: 'User Shipping Address Updated Successfully',
        user
    })
});
