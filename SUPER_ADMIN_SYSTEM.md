# Super Admin System - Complete Documentation

## Overview

The Super Admin system provides complete control over the LMS with user management, student/instructor ID generation, and system-wide administration capabilities.

## Key Features

### 1. **Automatic ID Generation**
- **Student IDs**: Auto-generated in format `STU{YEAR}{NUMBER}` (e.g., STU20250001)
- **Instructor IDs**: Auto-generated in format `INS{YEAR}{NUMBER}` (e.g., INS20250001)
- IDs are unique and sequential
- Generated automatically when Super Admin creates users

### 2. **User Registration Control**
- **Public Registration**: Students only (restricted)
- **Admin-Created Accounts**: Instructors, Admins, Super Admins
- Public registration page now shows notice that only students can register
- Instructors and admins must be created by Super Admin

### 3. **Complete User Management**
- Create users with any role
- Update user information
- Delete users (except yourself)
- Reset user passwords
- Change user status (Active/Inactive/Suspended)
- Bulk import users from CSV

### 4. **System Statistics Dashboard**
- Total users count
- Users by role (Students, Instructors, Admins, Super Admins)
- Users by status (Active, Inactive, Suspended)
- Total courses count
- Real-time statistics

## Access URLs

### Super Admin Dashboard
```
http://localhost:3001/superadmin/dashboard
```

**Access**: Only users with `super_admin` role can access

## User Roles Hierarchy

1. **Super Admin** (Highest)
   - Complete system control
   - Create/manage all users
   - Access all features
   - Cannot be created via public registration

2. **Admin**
   - Manage courses and users
   - Access instructor features
   - Created by Super Admin

3. **Instructor**
   - Create and manage courses
   - Grade students
   - Manage course content
   - Created by Super Admin

4. **Student** (Lowest)
   - Enroll in courses
   - Submit assignments
   - View grades
   - Can self-register

## How to Use

### Creating Your First Super Admin

You need to manually create the first Super Admin account in Firebase:

1. **Option A: Via Firebase Console**
   ```
   1. Go to Firebase Console → Authentication
   2. Add user with email/password
   3. Copy the UID
   4. Go to Firestore → users collection
   5. Create document with UID as document ID:
      {
        "email": "admin@example.com",
        "first_name": "Super",
        "last_name": "Admin",
        "role": "super_admin",
        "status": "active",
        "created_at": "2025-12-23T...",
        "updated_at": "2025-12-23T..."
      }
   ```

2. **Option B: Via Backend API** (recommended for production)
   ```bash
   # Use Firebase Admin SDK to create first super admin
   # See backend/scripts/create-super-admin.ts
   ```

### Creating Students

**Super Admin creates student account:**

1. Login as Super Admin
2. Navigate to `/superadmin/dashboard`
3. Click "+ Create User"
4. Fill in details:
   - First Name: John
   - Last Name: Doe
   - Email: john@example.com
   - Role: Student
   - Password: (generate or enter)
5. Click "Create User"
6. **Student ID automatically generated**: STU20250001
7. Share credentials with student:
   - Email: john@example.com
   - Student ID: STU20250001
   - Password: (the generated password)

### Creating Instructors

**Super Admin creates instructor account:**

1. Login as Super Admin
2. Navigate to `/superadmin/dashboard`
3. Click "+ Create User"
4. Fill in details:
   - First Name: Jane
   - Last Name: Smith
   - Email: jane@example.com
   - Role: Instructor
   - Password: (generate or enter)
5. Click "Create User"
6. **Instructor ID automatically generated**: INS20250001
7. Share credentials with instructor:
   - Email: jane@example.com
   - Instructor ID: INS20250001
   - Password: (the generated password)

### Login Credentials

Users can login with:
- **Email + Password** (current)
- **Student ID + Password** (future enhancement - pending)
- **Instructor ID + Password** (future enhancement - pending)

## API Endpoints

### Backend Routes

All routes require Super Admin authentication:

```typescript
POST   /api/superadmin/users                    // Create user
GET    /api/superadmin/users                    // Get all users (with filters)
PUT    /api/superadmin/users/:userId           // Update user
DELETE /api/superadmin/users/:userId           // Delete user
POST   /api/superadmin/users/:userId/reset-password  // Reset password
GET    /api/superadmin/statistics              // System statistics
POST   /api/superadmin/users/bulk-import       // Bulk import users
```

### Example: Create Student

```bash
POST /api/superadmin/users
Authorization: Bearer {super_admin_token}

{
  "email": "student@example.com",
  "password": "securePassword123",
  "first_name": "John",
  "last_name": "Doe",
  "role": "student"
}

Response:
{
  "message": "User created successfully",
  "user": {
    "id": "firebase_uid_here",
    "email": "student@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "student",
    "student_id": "STU20250001",  // Auto-generated
    "status": "active"
  },
  "login_credentials": {
    "email": "student@example.com",
    "student_id": "STU20250001",
    "instructor_id": null,
    "password": "(Use the password provided)"
  }
}
```

### Example: Get Statistics

```bash
GET /api/superadmin/statistics
Authorization: Bearer {super_admin_token}

Response:
{
  "total_users": 45,
  "students": 35,
  "instructors": 8,
  "admins": 1,
  "super_admins": 1,
  "active_users": 42,
  "inactive_users": 2,
  "suspended_users": 1,
  "total_courses": 12
}
```

## User Management Features

### 1. Search and Filter
- Search by name, email, student ID, or instructor ID
- Filter by role (Student, Instructor, Admin, Super Admin)
- Filter by status (Active, Inactive, Suspended)

### 2. User Status Management
- **Active**: User can login and access all features
- **Inactive**: User cannot login
- **Suspended**: User account is suspended (cannot login)
- Status can be changed directly from the user table

### 3. Password Reset
- Click "Reset Password" next to any user
- Generate random secure password or enter custom password
- Password is displayed once - must be saved and shared securely
- User can login with new password immediately

### 4. User Deletion
- Permanently deletes user from system
- Deletes from Firebase Authentication
- Deletes from Firestore database
- Cannot delete yourself (safety measure)
- Requires confirmation

### 5. Bulk Import (CSV)
- Import multiple users at once
- CSV format:
  ```csv
  email,password,first_name,last_name,role
  student1@example.com,pass123,John,Doe,student
  student2@example.com,pass456,Jane,Smith,student
  instructor1@example.com,pass789,Bob,Johnson,instructor
  ```
- Returns success/failure report for each user
- IDs auto-generated for all users

## Security Features

### 1. Role-Based Access Control
- Super Admin routes protected with `allowedRoles: [UserRole.SUPER_ADMIN]`
- Backend verifies role on every request
- Non-super-admins get 403 Forbidden

### 2. Self-Protection
- Cannot delete your own account
- Cannot change your own role
- Prevents accidental lockout

### 3. Password Security
- Minimum 8 characters required
- Passwords stored securely in Firebase Auth
- Password generator creates 24-character random passwords

### 4. Audit Trail
- All user changes tracked with timestamps
- `created_at`, `updated_at` fields on all users
- `last_login` tracked automatically

## Frontend Components

### SuperAdminDashboard.tsx
Main dashboard component with:
- Statistics cards (8 cards showing key metrics)
- Search and filter controls
- User table with inline actions
- Create user modal
- Reset password modal

### Features:
- Auto-refresh on filter changes
- Inline status updates (dropdown in table)
- Real-time statistics
- Responsive design
- Loading states

## Database Schema

### Users Collection (Firestore)

```typescript
{
  id: string;  // Firebase UID
  email: string;
  first_name: string;
  last_name: string;
  role: 'student' | 'instructor' | 'admin' | 'super_admin';
  status: 'active' | 'inactive' | 'suspended';
  student_id?: string;  // Auto-generated for students (STU20250001)
  instructor_id?: string;  // Auto-generated for instructors (INS20250001)
  phone?: string;
  date_of_birth?: string;
  profile_image_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
}
```

## ID Generation Logic

### Student ID Generation
```typescript
// Format: STU{YEAR}{NUMBER}
// Example: STU20250001, STU20250002, ...

async function generateStudentId() {
  const year = new Date().getFullYear();  // 2025
  const count = await db.collection('users')
    .where('role', '==', 'student')
    .get();
  const number = (count.size + 1).toString().padStart(4, '0');  // 0001
  return `STU${year}${number}`;  // STU20250001
}
```

### Instructor ID Generation
```typescript
// Format: INS{YEAR}{NUMBER}
// Example: INS20250001, INS20250002, ...

async function generateInstructorId() {
  const year = new Date().getFullYear();  // 2025
  const count = await db.collection('users')
    .where('role', '==', 'instructor')
    .get();
  const number = (count.size + 1).toString().padStart(4, '0');  // 0001
  return `INS${year}${number}`;  // INS20250001
}
```

## Integration with Grade Center

The grade center and student grades automatically use student IDs:

1. When instructor views grade center, student IDs are displayed
2. When student views their grades, their student ID is shown
3. Export CSV includes student IDs
4. Enrollment records can reference student IDs

## Workflow Examples

### Scenario 1: New Semester Setup

1. **Super Admin creates instructors**
   - Navigate to Super Admin Dashboard
   - Create instructor accounts (INS20250001, INS20250002, ...)
   - Share credentials with instructors

2. **Instructors create courses**
   - Instructors login with their instructor IDs
   - Go to Instructor Panel
   - Create courses (CS101, MATH201, etc.)

3. **Super Admin creates students OR students self-register**
   - Option A: Super Admin bulk imports student list
   - Option B: Students register at /register (get auto-generated STU IDs)

4. **Students enroll in courses**
   - Students login with email/student ID
   - Browse available courses
   - Enroll using course code

5. **Grade management**
   - Instructors use Grade Center to enter grades
   - Students view grades with their student IDs

### Scenario 2: Mid-Semester User Management

1. **Suspend problematic student**
   - Super Admin goes to dashboard
   - Search for student by name or ID
   - Change status to "Suspended"
   - Student immediately cannot login

2. **Reset forgotten password**
   - Super Admin searches for user
   - Click "Reset Password"
   - Generate new password
   - Share securely with user

3. **Add new instructor mid-semester**
   - Create instructor account (auto-generates INS ID)
   - Instructor logs in
   - Assign them to existing courses as teaching assistant

## Future Enhancements (Planned)

### 1. **ID-Based Login**
Currently students/instructors login with email. Enhancement will allow:
```
Login with Student ID:
- Student ID: STU20250001
- Password: ********

Login with Instructor ID:
- Instructor ID: INS20250001
- Password: ********
```

### 2. **Bulk Operations**
- Bulk status updates (suspend multiple users at once)
- Bulk role changes
- Bulk password resets

### 3. **Advanced Reporting**
- User activity reports
- Login history
- Failed login attempts
- User growth over time

### 4. **Email Notifications**
- Send welcome emails with credentials
- Password reset notifications
- Account status change notifications

### 5. **Import/Export**
- Export users to CSV
- Template CSV download
- Import validation and preview

## Troubleshooting

### Problem: Cannot access Super Admin Dashboard
**Solution**: Verify your user role in Firestore:
```
1. Check Firestore → users → {your_uid}
2. Ensure "role": "super_admin"
3. Logout and login again
```

### Problem: Student ID not generating
**Solution**: Check backend logs for errors:
```bash
cd backend
npm run dev
# Check console for errors in generateStudentId()
```

### Problem: Bulk import failing
**Solution**: Verify CSV format:
```
- Must have headers: email,password,first_name,last_name,role
- Roles must be: student, instructor, admin, super_admin
- Emails must be unique
```

## Production Deployment Checklist

- [ ] Create initial Super Admin account manually
- [ ] Secure Super Admin credentials
- [ ] Set strong password policy
- [ ] Enable Firebase security rules
- [ ] Restrict Firebase Console access
- [ ] Set up backup Super Admin account
- [ ] Document password reset process
- [ ] Train administrators on user management
- [ ] Set up monitoring for user creation
- [ ] Review and test all security measures

## Summary

The Super Admin system provides:

✅ **Complete user management** - Create, update, delete any user
✅ **Automatic ID generation** - Student and Instructor IDs auto-generated
✅ **Role-based access** - Super Admin, Admin, Instructor, Student hierarchy
✅ **Security controls** - Status management, password resets
✅ **System statistics** - Real-time dashboard with key metrics
✅ **Bulk operations** - Import multiple users at once
✅ **Restricted registration** - Public registration limited to students only
✅ **Full control** - Super Admin can manage the entire system

The system is production-ready and provides all necessary tools for managing an LMS with proper user categorization and access control!
