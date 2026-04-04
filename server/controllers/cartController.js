import { supabase } from '../utils/db.js';

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res, next) => {
  try {
    const { data: cartItems, error } = await supabase
      .from('cart')
      .select('*, products(id, name, price, image_url, stock)')
      .eq('user_id', req.user.id);

    if (error) {
      res.status(400);
      throw new Error('Failed to fetch cart');
    }

    res.json(cartItems);
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = async (req, res, next) => {
  try {
    const { product_id, quantity } = req.body;

    // Check if it already exists in cart
    const { data: existingItem } = await supabase
      .from('cart')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('product_id', product_id)
      .single();

    if (existingItem) {
      // Update quantity
      const { data, error } = await supabase
        .from('cart')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id)
        .select('*, products(id, name, price, image_url, stock)')
        .single();
      
      if (error) throw new Error('Update failed');
      return res.json(data);
    }

    // Insert new item
    const { data, error } = await supabase
      .from('cart')
      .insert([{ user_id: req.user.id, product_id, quantity }])
      .select('*, products(id, name, price, image_url, stock)')
      .single();

    if (error) {
      res.status(400);
      throw new Error('Failed to add to cart');
    }

    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Private
export const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const { productId } = req.params;

    const { data, error } = await supabase
      .from('cart')
      .update({ quantity })
      .eq('user_id', req.user.id)
      .eq('product_id', productId)
      .select('*, products(id, name, price, image_url, stock)')
      .single();

    if (error) {
      res.status(400);
      throw new Error('Failed to update cart item');
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
export const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', req.user.id)
      .eq('product_id', productId);

    if (error) {
      res.status(400);
      throw new Error('Failed to remove from cart');
    }

    res.json({ message: 'Item removed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear user cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', req.user.id);

    if (error) {
      res.status(400);
      throw new Error('Failed to clear cart');
    }

    res.json({ message: 'Cart cleared' });
  } catch (error) {
    next(error);
  }
};
