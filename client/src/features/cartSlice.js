import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  cartItems: [],
  cartTotal: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCartItems: (state, action) => {
      state.cartItems = action.payload;
      state.cartTotal = state.cartItems.reduce((acc, item) => 
        acc + (item.quantity * item.products.price), 0);
    },
    addToCartSuccess: (state, action) => {
      const item = action.payload;
      const existingItem = state.cartItems.find(x => x.product_id === item.product_id);
      
      if (existingItem) {
        state.cartItems = state.cartItems.map(x => 
          x.product_id === item.product_id ? item : x);
      } else {
        state.cartItems.push(item);
      }
      state.cartTotal = state.cartItems.reduce((acc, item) => 
        acc + (item.quantity * item.products.price), 0);
    },
    removeFromCartSuccess: (state, action) => {
      state.cartItems = state.cartItems.filter(x => x.product_id !== action.payload);
      state.cartTotal = state.cartItems.reduce((acc, item) => 
        acc + (item.quantity * item.products.price), 0);
    },
    clearCartSuccess: (state) => {
      state.cartItems = [];
      state.cartTotal = 0;
    }
  },
});

export const { setCartItems, addToCartSuccess, removeFromCartSuccess, clearCartSuccess } = cartSlice.actions;
export default cartSlice.reducer;
