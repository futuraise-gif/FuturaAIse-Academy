# FuturaAIse Academy - Learning Management System (Firebase Edition)

A comprehensive Learning Management System (LMS) built with modern web technologies and Firebase, designed for FuturaAIse Academy.

## Overview

FuturaAIse Academy is a full-stack LMS platform that provides a complete solution for educational institutions. It supports multiple user roles (Students, Instructors, and Admins) with role-based access control, secure authentication via Firebase, and a modern, responsive user interface.

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: Firebase Firestore
- **Authentication**: Firebase Authentication
- **Admin SDK**: Firebase Admin SDK
- **Security**: Helmet, CORS

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand
- **Routing**: React Router v6
- **Authentication**: Firebase SDK
- **Styling**: Tailwind CSS

## Key Features

### Authentication & Authorization
- Firebase Authentication with Email/Password
- Custom role-based claims
- Role-based access control (RBAC)
- Protected routes and API endpoints
- Secure Firestore security rules

### User Roles
1. **Student**: Access courses, view materials, submit assignments
2. **Instructor**: Create and manage courses, grade assignments
3. **Admin**: Full system access, user management, system settings

### Current Functionality
- User registration with role selection
- Secure login with Firebase Authentication
- User profile management stored in Firestore
- Role-based dashboard views
- Real-time data synchronization

## Quick Start

See [QUICK_START.md](QUICK_START.md) for a 10-minute setup guide!

## Detailed Setup

See [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for comprehensive Firebase configuration.

## Project Structure

```
FuturaAIse-Academy/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── firebase.ts          # Firebase Admin initialization
│   │   ├── controllers/
│   │   │   ├── auth.firebase.ts     # Auth controllers
│   │   │   └── user.controller.ts   # User management
│   │   ├── middleware/
│   │   │   ├── auth.firebase.ts     # Firebase auth middleware
│   │   │   ├── validation.middleware.ts
│   │   │   └── error.middleware.ts
│   │   ├── models/
│   │   │   └── user.firebase.ts     # Firestore user model
│   │   ├── routes/
│   │   │   ├── auth.firebase.ts
│   │   │   ├── user.firebase.ts
│   │   │   └── index.firebase.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── validators/
│   │   │   └── auth.validator.ts
│   │   └── server.firebase.ts       # Express server
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── ProtectedRoute.tsx
│   │   ├── config/
│   │   │   ├── firebase.ts          # Firebase client initialization
│   │   │   └── api.ts
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── Dashboard.tsx
│   │   ├── store/
│   │   │   └── authStore.firebase.ts  # Zustand + Firebase
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── FIREBASE_SETUP.md
├── QUICK_START.md
└── README.md
```

## Getting Started

### 1. Firebase Setup

Create a Firebase project and enable Authentication and Firestore. See [FIREBASE_SETUP.md](FIREBASE_SETUP.md).

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Add your Firebase config to .env
npm run dev
```

Frontend runs at: http://localhost:3000

### 3. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Configure Firebase credentials
npm run dev
```

Backend API runs at: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user (creates Firebase user + Firestore document)
- `POST /api/v1/auth/login` - Login user (verifies Firebase ID token)
- `GET /api/v1/auth/profile` - Get current user profile
- `PUT /api/v1/auth/profile` - Update user profile

### Users (Admin/Instructor)
- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/:id` - Get user by ID
- `PATCH /api/v1/users/:id/status` - Update user status
- `DELETE /api/v1/users/:id` - Delete user

### Health Check
- `GET /api/v1/health` - API health status

## Firestore Collections

### users
```javascript
{
  email: string
  first_name: string
  last_name: string
  role: 'student' | 'instructor' | 'admin'
  status: 'active' | 'inactive' | 'suspended'
  profile_image_url?: string
  bio?: string
  phone?: string
  date_of_birth?: string
  created_at: timestamp
  updated_at: timestamp
  last_login?: timestamp
}
```

### courses (planned)
```javascript
{
  title: string
  description: string
  instructor_id: string
  thumbnail_url?: string
  status: string
  start_date: timestamp
  end_date: timestamp
  created_at: timestamp
  updated_at: timestamp
}
```

### enrollments (planned)
```javascript
{
  course_id: string
  student_id: string
  enrolled_at: timestamp
  status: string
  progress: number
}
```

## Security Features

- Firebase Authentication for secure user management
- Firestore security rules for data protection
- Custom claims for role-based authorization
- Firebase Admin SDK for server-side operations
- HTTP security headers with Helmet
- CORS protection
- Input validation with express-validator
- Environment variable protection

## Development Scripts

### Backend
```bash
npm run dev      # Start development server with nodemon
npm run build    # Build TypeScript to JavaScript
npm start        # Start production server
```

### Frontend
```bash
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Firebase Advantages

✅ **No database installation** - Cloud-hosted Firestore
✅ **Built-in authentication** - Email, Google, GitHub, etc.
✅ **Real-time updates** - Live data synchronization
✅ **Scalable** - Auto-scales with usage
✅ **Secure** - Built-in security rules
✅ **Easy deployment** - Firebase Hosting integration
✅ **Free tier** - Generous free tier for development

## Future Enhancements

- [ ] Course content management (videos, documents, quizzes)
- [ ] Assignment submission and grading system
- [ ] Real-time notifications using Firebase Cloud Messaging
- [ ] Discussion forums with Firestore
- [ ] Live video classes integration
- [ ] Advanced analytics with Firebase Analytics
- [ ] Mobile application with React Native
- [ ] File upload using Firebase Storage
- [ ] Email notifications using Cloud Functions
- [ ] Calendar integration

## Deployment

### Frontend (Firebase Hosting)
```bash
cd frontend
npm run build
firebase deploy --only hosting
```

### Backend (Cloud Functions or Cloud Run)
```bash
cd backend
npm run build
# Deploy to Firebase Cloud Functions or Google Cloud Run
```

## Environment Variables

### Frontend (.env)
```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
FIREBASE_SERVICE_ACCOUNT=<JSON string or leave empty for CLI auth>
ALLOWED_ORIGINS=http://localhost:3000
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## License

MIT License - see LICENSE file

## Support

- **Documentation**: See FIREBASE_SETUP.md and QUICK_START.md
- **Issues**: Report bugs via GitHub Issues
- **Questions**: Check Firebase documentation

## Resources

- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Authentication](https://firebase.google.com/docs/auth)

---

**Built with ❤️ for FuturaAIse Academy**

Frontend: http://localhost:3000 | Backend: http://localhost:5000 | Firebase Console: https://console.firebase.google.com/
