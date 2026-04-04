import { supabase } from '../utils/db.js';

// @desc    Fetch all products (with optional search & filtering & pagination)
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res, next) => {
  try {
    const { search, category, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase.from('products').select(`*, categories(name)`, { count: 'exact' });

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    if (category) {
      query = query.eq('category_id', category);
    }

    query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false });

    const { data: products, count, error } = await query;

    if (error) {
      res.status(400);
      throw new Error('Failed to fetch products');
    }

    res.json({
      products,
      page: Number(page),
      pages: Math.ceil(count / limit),
      total: count
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res, next) => {
  try {
    const { data: product, error } = await supabase
      .from('products')
      .select('*, categories(name)')
      .eq('id', req.params.id)
      .single();

    if (error || !product) {
      res.status(404);
      throw new Error('Product not found');
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res, next) => {
  try {
    const { name, price, description, image_url, category_id, stock, discount_price, offer_label } = req.body;

    const { data: product, error } = await supabase
      .from('products')
      .insert([{ name, price, description, image_url, category_id, stock, discount_price: discount_price || null, offer_label }])
      .select()
      .single();

    if (error) {
      res.status(400);
      throw new Error('Failed to create product');
    }

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res, next) => {
  try {
    const { name, price, description, image_url, category_id, stock, discount_price, offer_label } = req.body;

    const { data: product, error } = await supabase
      .from('products')
      .update({ name, price, description, image_url, category_id, stock, discount_price: discount_price || null, offer_label })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !product) {
      res.status(404);
      throw new Error('Product not found or update failed');
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      res.status(400);
      throw new Error('Failed to delete product');
    }

    res.json({ message: 'Product removed' });
  } catch (error) {
    next(error);
  }
};
