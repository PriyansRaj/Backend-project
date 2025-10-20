import { Category } from '../models/Category.model.js';
import { Product } from '../models/Product.model.js';
import { ApiError } from '../utils/error.utils.js';
import { Response } from '../utils/Response.utils.js';

export const addProduct = async (req, res, next) => {
  try {
    const { name, description, price, discount, stock, brand, category } = req.body;

    if (
      [name, description, price, discount, stock, brand, category].some(
        (v) => v == null || v === ''
      )
    ) {
      throw new ApiError(400, 'All fields are required');
    }

    if (typeof category !== 'object' || category === null)
      throw new ApiError(400, 'Category must be a valid object');

    let avatar = '';
    if (req.file?.path) {
      avatar = {
        url: req.file.path,
        public_id: req.file.filename,
      };
    }

    // Check or create category
    let newCategory = await Category.findOne({ name: category.name });
    if (!newCategory) {
      newCategory = new Category({
        name: category.name,
        description: category.description,
        parentCategory: category.parentCategory || null,
      });
      await newCategory.save();
    }

    const newProduct = new Product({
      name,
      description,
      price,
      discount,
      stock,
      brand,
      images: avatar ? [avatar] : [],
      category: newCategory._id,
    });

    const savedProduct = await newProduct.save();
    return res.status(200).json(new Response(200, savedProduct, 'Product added successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { name } = req.params;
    const { description, price, discount, stock, brand } = req.body;

    if ([name, description, price, discount, stock, brand].some((v) => v == null || v === '')) {
      throw new ApiError(400, 'All fields are required');
    }

    const product = await Product.findOneAndUpdate(
      { name },
      { $set: { description, price, discount, stock, brand } },
      { new: true, runValidators: true }
    );

    if (!product) throw new ApiError(404, 'Product not found');

    return res.status(200).json(new Response(200, product, 'Product details updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateProductImage = async (req, res, next) => {
  try {
    const { name } = req.params;
    if (!name) throw new ApiError(400, 'Product name is required');

    let image = '';
    if (req.file?.path) {
      image = {
        url: req.file.path,
        public_id: req.file.filename,
      };
    }

    const product = await Product.findOneAndUpdate(
      { name },
      { $set: { images: image ? [image] : [] } },
      { new: true }
    );

    if (!product) throw new ApiError(404, 'Product not found');

    return res.status(200).json(new Response(200, product, 'Product image updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const removeProduct = async (req, res, next) => {
  try {
    const { name } = req.params;
    if (!name) throw new ApiError(400, 'Product name is required');

    const product = await Product.findOneAndDelete({ name });
    if (!product) throw new ApiError(404, 'Product not found');

    return res.status(200).json(new Response(200, {}, 'Product deleted successfully'));
  } catch (error) {
    next(error);
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const { name } = req.params;
    if (!name) throw new ApiError(400, 'Product name is required');

    const product = await Product.findOne({ name }).populate('category');
    if (!product) throw new ApiError(404, 'Product not found');

    return res.status(200).json(new Response(200, product, 'Product info fetched successfully'));
  } catch (error) {
    next(error);
  }
};

export const getAllProductByCategory = async (req, res, next) => {
  try {
    const { categoryName } = req.params;
    if (!categoryName) throw new ApiError(400, 'Category name is required');

    const category = await Category.findOne({ name: categoryName });
    if (!category) throw new ApiError(404, 'Category not found');

    const products = await Product.find({ category: category._id }).populate('category');
    if (products.length === 0) throw new ApiError(404, 'No products found for this category');

    return res.status(200).json(new Response(200, products, 'Products fetched successfully'));
  } catch (error) {
    next(error);
  }
};

export const getAllProduct = async (req, res) => {
  try {
    const { sortBy, order } = req.body;
    const validFields = ['price', 'name', 'discount', 'createdAt'];
    if (!validFields.includes(sortBy)) {
      throw new ApiError(400, 'Invalid sort field');
    }
    const sortOrder = order.toLowerCase === 'asc' ? 1 : -1;
    const products = await Product.find({}).sort({ [sortBy]: sortOrder });

    return res.status(200).json(new Response(200, products, 'Products fetched successfully'));
  } catch (error) {
    next(error);
  }
};
