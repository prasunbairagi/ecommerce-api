import asyncHandler from "express-async-handler";
import Product from "../model/Product.js";
import Category from "../model/Category.js";
import Brand from "../model/Brand.js";

// @desc Create new product
// @route POST /api/v1/products
// @access Private/Admin
export const createProductCtrl = asyncHandler(async (req, res) => {
	const {
		name,
		description,
		category,
		sizes,
		colors,
		user,
		price,
		totalQty,
		brand,
	} = req.body;
	//product exists?
	const productExists = await Product.findOne({ name });
	if (productExists) {
		throw new Error("Product Already Exists");
	}
	//find the category
	const categoryFound = await Category.findOne({
		name: category.toLowerCase(),
	});
	if (!categoryFound) {
		throw new Error(
		"Category not found, please create category first or check category name"
		);
	}
	//find the brand
	const brandFound = await Brand.findOne({
		name: brand.toLowerCase(),
	});
	if (!brandFound) {
		throw new Error(
		"Brand not found, please create brand first or check brand name"
		);
	}
	//create the product
	const product = await Product.create({
		name,
		description,
		category: category.toLowerCase(),
		sizes,
		colors,
		user: req.userAuthId,
		price,
		totalQty,
		brand: brand.toLowerCase(),
		images: req.files.map(file=>file.path)
	});
	//Push the product into Category
	categoryFound.products.push(product._id);
	//re-save categories
	await categoryFound.save();
	//Push the product into Brand
	brandFound.products.push(product._id);
	//re-save brands
	await brandFound.save();
	//send response
	res.json({
		status: "success",
		message: "Product created successfully",
		product,
	});
});

// @desc Get All products
// @route GET /api/v1/products
// @access Public
export const getProductsCtrl = asyncHandler(async (req, res) => {
	let productQuery = Product.find();
	//search by name
	if (req.query.name) {
		productQuery = productQuery.find({
		name: { $regex: req.query.name, $options: "i" },
		});
	}
	//filter by brand
	if (req.query.brand) {
		productQuery = productQuery.find({
		brand: { $regex: req.query.brand, $options: "i" },
		});
	}
	//filter by category
	if (req.query.category) {
		productQuery = productQuery.find({
		category: { $regex: req.query.category, $options: "i" },
		});
	}
	//filter by colors
	if (req.query.colors) {
		productQuery = productQuery.find({
		colors: { $regex: req.query.colors, $options: "i" },
		});
	}
	//filter by sizes
	if (req.query.size) {
		productQuery = productQuery.find({
		sizes: { $regex: req.query.size, $options: "i" },
		});
	}
	//filter by price range
	if (req.query.price) {
		const priceRange = req.query.price.split("-");
		//gte: greater or equal
		//lte: less than or equal to
		productQuery = productQuery.find({
		price: { $gte: priceRange[0], $lte: priceRange[1] },
		});
	}
	//pagination
	//page
	const page = parseInt(req.query.page) ? parseInt(req.query.page) : 1;
	//limit
	const limit = parseInt(req.query.limit) ? parseInt(req.query.limit) : 1;
	//startIndex
	const startIndex = (page - 1) * limit;
	//endIndex
	const endIndex = page * limit;
	//total
	const total = await Product.countDocuments();
	productQuery = productQuery.skip(startIndex).limit(limit);
	//pagination results
	const pagination = {};
	if (endIndex < total) {
		pagination.next = {
		page: page + 1,
		limit,
		};
	}
	if (startIndex > 0) {
		pagination.prev = {
		page: page - 1,
		limit,
		};
	}
	//await the query
	const products = await productQuery.populate("reviews");
	res.json({
		status: "success",
		total,
		results: products.length,
		pagination,
		message: "Products Fetched Successfully",
		products,
	});
});

// @desc Get single product
// @route GET /api/products/:id
// @access Public
export const getProductCtrl = asyncHandler(async (req, res) => {
	const product = await Product.findById(req.params.id).populate("reviews");
	if (!product) {
		throw new Error("Product not found");
	}
	res.json({
		status: "success",
		message: "Product fetched successfully",
		product,
	});
});

// @desc Update product
// @route PUT /api/products/:id
// @access Private/ Admin
export const updateProductCtrl = asyncHandler(async (req, res) => {
	const {
		name,
		description,
		category,
		sizes,
		colors,
		user,
		price,
		totalQty,
		brand,
	} = req.body;
	const product = await Product.findByIdAndUpdate(
		req.params.id,
		{
		name,
		description,
		category,
		sizes,
		colors,
		user,
		price,
		totalQty,
		brand,
		},
		{ new: true }
	);
	res.json({
		status: "success",
		message: "Product updated successfully",
		product,
	});
});

// @desc Delete product
// @route DELETE /api/products/:id
// @access Private/ Admin
export const deleteProductCtrl = asyncHandler(async (req, res) => {
	const product = await Product.findByIdAndDelete(req.params.id);
	res.json({
		status: "success",
		message: "Product deleted successfully",
		product,
	});
});
