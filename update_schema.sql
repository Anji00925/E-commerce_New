-- Add Offer fields to products table
ALTER TABLE public.products
ADD COLUMN discount_price DECIMAL(10, 2),
ADD COLUMN offer_label TEXT;
