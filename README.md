# Full Stack eCommerce Application

A fully integrated production-ready eCommerce architecture built with React + Vite, Node.js + Express, and Supabase (PostgreSQL).

## Project Structure

This is a monorepo setup containing both frontend and backend.
- `/client`: React application (using Redux Toolkit, React Router, Vite)
- `/server`: Node.js Express application offering RESTful APIs
- `/database.sql`: SQL snippet to set up your Supabase Database Schema

## Setup Instructions

### 1. Database Setup
1. Go to [Supabase](https://supabase.com/) and create a new project.
2. In your Supabase dashboard, go to the SQL Editor and run the SQL commands found in `database.sql` to create all necessary tables.

### 2. Backend Setup
1. Navigate to `cd server`.
2. Copy `.env.example` to `.env` (`cp .env.example .env`).
3. Fill in your environment variables:
   - `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`
   - `JWT_SECRET` (Use a secure string)
   - `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` (If testing payments)
4. Run `npm install` (if not already installed).
5. Run `npm run dev` to start the Node server on port 5000.

### 3. Frontend Setup
1. Navigate to `cd client`.
2. Copy `.env.example` to `.env` (`cp .env.example .env`).
3. Fill in environment variables (Vite API URL defaults correctly to port 5000 in dev).
4. Run `npm install` (if not already installed).
5. Run `npm run dev` to start the Vite React server on port 5173.

## Features
- **Frontend State Management**: Handled gracefully using `@reduxjs/toolkit` (auth, products, cart).
- **Authentication**: JWT Based Auth interacting seamlessly between Axios interceptors and the Express server.
- **Modern UI**: Pure CSS implementation focusing on aesthetics with a Dark/Light Theme toggle capability, adhering strictly to clean structure natively.
- **Payments Check**: Razorpay initialization script setup inside the checkout page natively.
- **Database**: Strictly typed PostgreSQL interface using Supabase service-role in the backend to ensure zero credentials leak in the front end.
