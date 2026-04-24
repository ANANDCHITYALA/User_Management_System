# User Management System Backend

## Description
This is the backend API for the User Management System, built with Node.js and Express. It provides endpoints for user registration, authentication, and management.

## Features
- User registration and login
- JWT-based authentication
- User profile management
- Role-based access control

## Installation
1. Clone the repository.
2. Navigate to the backend directory.
3. Run `npm install` to install dependencies.
4. Set up environment variables in a `.env` file (e.g., database URL, JWT secret).
5. Run `npm start` to start the server.

## API Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Technologies Used
- Node.js
- Express.js
- MongoDB (or your database)
- JWT for authentication

