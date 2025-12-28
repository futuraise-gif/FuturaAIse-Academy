# FuturaAIse Academy - Frontend

Frontend application for FuturaAIse Academy Learning Management System.

## Tech Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS

## Features

- User authentication (login/register)
- Role-based dashboards (Student, Instructor, Admin)
- Protected routes
- Persistent authentication state
- Responsive design
- Modern UI with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Install Tailwind CSS dependencies:
```bash
npm install -D tailwindcss postcss autoprefixer
```

3. Copy the environment file:
```bash
cp .env.example .env
```

4. Update the `.env` file with your API base URL.

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/       # Reusable components
├── pages/           # Page components
├── store/           # Zustand state management
├── config/          # Configuration files
├── types/           # TypeScript type definitions
├── App.tsx          # Main app component
├── main.tsx         # Entry point
└── index.css        # Global styles
```

## Features by Role

### Student
- Access enrolled courses
- View assignments and grades
- Track learning progress

### Instructor
- Create and manage courses
- Grade student assignments
- Interact with students

### Admin
- Manage all users
- Oversee all courses
- Access system settings
- View platform analytics

## Authentication Flow

1. User registers or logs in
2. Backend returns JWT token and user data
3. Token stored in localStorage
4. Token included in all API requests
5. Protected routes check authentication state
6. Auto-logout on token expiration

## Environment Variables

- `VITE_API_BASE_URL` - Backend API base URL

## Building for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

## Development Notes

- The app uses Vite's proxy feature to avoid CORS issues during development
- Authentication state persists across browser sessions
- API interceptors handle token injection and error responses
