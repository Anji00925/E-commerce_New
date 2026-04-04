import { supabase } from '../utils/db.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res, next) => {
  try {
    const { orderItems, totalPrice } = req.body;

    if (orderItems && orderItems.length === 0) {
      res.status(400);
      throw new Error('No order items');
    } else {
      // 1. Create order in database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{ user_id: req.user.id, total: totalPrice, status: 'Pending', payment_status: 'Pending' }])
        .select()
        .single();

      if (orderError) throw new Error('Order creation failed');

      // 2. Insert order items
      const itemsToInsert = orderItems.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price_at_purchase: item.product.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsToInsert);

      if (itemsError) throw new Error('Failed to insert order items');

      // 3. Clear the user's cart
      await supabase.from('cart').delete().eq('user_id', req.user.id);

      // 4. (Optional) Create Razorpay Order
      let razorpayOrder = null;
      if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
         try {
           const instance = new Razorpay({
             key_id: process.env.RAZORPAY_KEY_ID,
             key_secret: process.env.RAZORPAY_KEY_SECRET,
           });

           const options = {
             amount: Math.round(totalPrice * 100), // amount in smallest currency unit
             currency: "INR",
             receipt: order.id,
           };

           razorpayOrder = await instance.orders.create(options);
           
           // update order with razorpay_order_id
           await supabase
             .from('orders')
             .update({ razorpay_order_id: razorpayOrder.id })
             .eq('id', order.id);

         } catch (rpe) {
           console.error("Razorpay integration error", rpe);
         }
      }

      res.status(201).json({
        order,
        razorpayOrder // send to client to open checkout
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay Payment
// @route   POST /api/orders/verify-payment
// @access  Private
export const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body;
    
    // Create signature to verify
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Payment is successful
      const { data: order, error } = await supabase
        .from('orders')
        .update({ 
          payment_status: 'Paid',
          razorpay_payment_id,
          razorpay_signature,
          status: 'Processing' 
        })
        .eq('id', order_id)
        .select()
        .single();
        
      if(error) throw new Error('Failed to update order status');

      return res.status(200).json({ message: "Payment verified successfully", order });
    } else {
      res.status(400);
      throw new Error("Invalid payment signature");
    }
  } catch (error) {
    next(error);
  }
}

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getUserOrders = async (req, res, next) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(name, image_url))')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      res.status(400);
      throw new Error('Failed to fetch orders');
    }

    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res, next) => {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select('*, users(name, email), order_items(*, products(name, image_url, price))')
      .eq('id', req.params.id)
      .single();

    if (error || !order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Check if user is admin or owns the order
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
       res.status(403);
       throw new Error('Not authorized to view this order');
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = async (req, res, next) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, users(id, name)')
      .order('created_at', { ascending: false });

    if (error) {
      res.status(400);
      throw new Error('Failed to fetch all orders');
    }

    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // e.g., 'Shipped', 'Delivered'

    const { data: order, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !order) {
      res.status(404);
      throw new Error('Order not found or update failed');
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};
