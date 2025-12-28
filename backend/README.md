# FuturaAIse Academy - Backend API

Backend API for FuturaAIse Academy Learning Management System.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs

## Features

- User authentication (register, login)
- Role-based access control (Student, Instructor, Admin)
- User profile management
- Secure password handling
- JWT-based authentication
- Input validation
- Error handling middleware

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a PostgreSQL database:
```sql
CREATE DATABASE futuraaise_academy;
```

3. Copy the environment file:
```bash
cp .env.example .env
```

4. Update the `.env` file with your database credentials and JWT secret.

5. Run database migrations:
```bash
npm run db:migrate
```

6. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:5000/api/v1`

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/profile` - Get current user profile (requires authentication)
- `PUT /api/v1/auth/profile` - Update user profile (requires authentication)
- `POST /api/v1/auth/change-password` - Change password (requires authentication)

### Users (Admin/Instructor only)

- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/:id` - Get user by ID
- `PATCH /api/v1/users/:id/status` - Update user status (Admin only)
- `DELETE /api/v1/users/:id` - Delete user (Admin only)

### Health Check

- `GET /api/v1/health` - API health check

## User Roles

1. **Student** - Can enroll in courses and access learning materials
2. **Instructor** - Can create and manage courses
3. **Admin** - Full system access and user management

## Database Schema

### Users Table
- id (UUID, Primary Key)
- email (Unique)
- password_hash
- first_name
- last_name
- role (student/instructor/admin)
- status (active/inactive/suspended)
- profile_image_url
- bio
- phone
- date_of_birth
- created_at
- updated_at
- last_login

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:migrate` - Run database migrations

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation
- CORS protection
- Helmet security headers
- Role-based authorization

## Environment Variables

See `.env.example` for all required environment variables.

## Development

The project uses:
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Nodemon for hot reloading during development
