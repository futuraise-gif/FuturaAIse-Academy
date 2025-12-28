# FuturaAIse Academy - Learning Management System

A comprehensive Learning Management System (LMS) built with modern web technologies, designed for FuturaAIse Academy.

## Overview

FuturaAIse Academy is a full-stack LMS platform that provides a complete solution for educational institutions. It supports multiple user roles (Students, Instructors, and Admins) with role-based access control, secure authentication, and a modern, responsive user interface.

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs, Helmet, CORS

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS

## Features

### Authentication & Authorization
- Secure user registration and login
- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Protected routes and API endpoints

### User Roles
1. **Student**: Access courses, view materials, submit assignments
2. **Instructor**: Create and manage courses, grade assignments
3. **Admin**: Full system access, user management, system settings

### Current Functionality
- User registration with role selection
- Secure login with credential validation
- User profile management
- Role-based dashboard views
- Token-based session management

## Project Structure

```
FuturaAIse-Academy/
├── backend/
│   ├── src/
│   │   ├── config/          # Database and app configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── database/        # Database schema and migrations
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── models/          # Data models
│   │   ├── routes/          # API routes
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Utility functions
│   │   ├── validators/      # Input validation
│   │   └── server.ts        # Express server setup
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Page components
│   │   ├── store/           # Zustand state management
│   │   ├── config/          # API configuration
│   │   ├── types/           # TypeScript types
│   │   ├── App.tsx          # Main app component
│   │   ├── main.tsx         # Entry point
│   │   └── index.css        # Global styles
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── README.md
│
└── README.md (this file)
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a PostgreSQL database:
```sql
CREATE DATABASE futuraaise_academy;
```

4. Copy and configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your database credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=futuraaise_academy
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_super_secret_jwt_key
```

5. Run database migrations:
```bash
npm run db:migrate
```

6. Start the backend server:
```bash
npm run dev
```

Backend will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Copy and configure environment variables:
```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

4. Start the frontend development server:
```bash
npm run dev
```

Frontend will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/profile` - Get current user profile
- `PUT /api/v1/auth/profile` - Update user profile
- `POST /api/v1/auth/change-password` - Change password

### Users (Admin/Instructor)
- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/:id` - Get user by ID
- `PATCH /api/v1/users/:id/status` - Update user status
- `DELETE /api/v1/users/:id` - Delete user

### Health Check
- `GET /api/v1/health` - API health status

## Database Schema

### Users Table
```sql
- id (UUID)
- email (VARCHAR, UNIQUE)
- password_hash (VARCHAR)
- first_name (VARCHAR)
- last_name (VARCHAR)
- role (ENUM: student, instructor, admin)
- status (ENUM: active, inactive, suspended)
- profile_image_url (VARCHAR)
- bio (TEXT)
- phone (VARCHAR)
- date_of_birth (DATE)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- last_login (TIMESTAMP)
```

### Courses Table
```sql
- id (UUID)
- title (VARCHAR)
- description (TEXT)
- instructor_id (UUID, FK)
- thumbnail_url (VARCHAR)
- status (VARCHAR)
- start_date (DATE)
- end_date (DATE)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Enrollments Table
```sql
- id (UUID)
- course_id (UUID, FK)
- student_id (UUID, FK)
- enrolled_at (TIMESTAMP)
- status (VARCHAR)
- progress (DECIMAL)
```

## Security Features

- Password hashing with bcrypt (10 rounds)
- JWT token-based authentication
- HTTP security headers with Helmet
- CORS protection
- Input validation with express-validator
- SQL injection prevention with parameterized queries
- Environment variable protection

## Development

### Backend Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run db:migrate  # Run database migrations
```

### Frontend Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Future Enhancements

- Course content management (videos, documents, quizzes)
- Assignment submission and grading system
- Real-time notifications
- Discussion forums
- Live video classes integration
- Advanced analytics and reporting
- Mobile application
- Email notifications
- File upload and management
- Calendar integration

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Contact

FuturaAIse Academy
- Email: info@futuraaise.com
- Website: https://futuraaise.com

## Acknowledgments

- Built with modern web technologies
- Designed for scalability and security
- Community-driven development
