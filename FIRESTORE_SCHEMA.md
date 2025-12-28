# Firestore Database Schema - Professor Panel

## Collections Structure

```
firestore/
├── users/
│   └── {userId}
│       ├── id: string
│       ├── email: string
│       ├── first_name: string
│       ├── last_name: string
│       ├── role: 'student' | 'instructor' | 'admin'
│       ├── status: 'active' | 'inactive' | 'suspended'
│       └── created_at: timestamp
│
├── courses/
│   └── {courseId}
│       ├── id: string
│       ├── title: string
│       ├── course_code: string
│       ├── description: string
│       ├── instructor_id: string
│       ├── instructor_name: string
│       ├── status: 'draft' | 'published' | 'archived'
│       ├── enrollment_code: string (generated)
│       ├── requires_approval: boolean
│       ├── enrolled_count: number
│       ├── max_students: number
│       ├── start_date: timestamp
│       ├── end_date: timestamp
│       ├── created_at: timestamp
│       └── updated_at: timestamp
│
├── enrollments/
│   └── {enrollmentId}
│       ├── id: string
│       ├── course_id: string
│       ├── student_id: string
│       ├── student_name: string
│       ├── student_email: string
│       ├── status: 'pending' | 'active' | 'dropped' | 'rejected'
│       ├── enrolled_at: timestamp
│       ├── approved_by: string (instructor_id)
│       └── approved_at: timestamp
│
├── assignments/
│   └── {assignmentId}
│       ├── id: string
│       ├── course_id: string
│       ├── title: string
│       ├── description: string
│       ├── instructions: string
│       ├── points: number
│       ├── due_date: timestamp
│       ├── available_from: timestamp
│       ├── available_until: timestamp
│       ├── allow_late_submissions: boolean
│       ├── late_penalty_per_day: number
│       ├── max_attempts: number
│       ├── status: 'draft' | 'published' | 'closed'
│       ├── created_by: string
│       ├── created_at: timestamp
│       └── updated_at: timestamp
│
├── submissions/
│   └── {submissionId}
│       ├── id: string
│       ├── assignment_id: string
│       ├── course_id: string
│       ├── student_id: string
│       ├── student_name: string
│       ├── attempt_number: number
│       ├── text_submission: string
│       ├── files: array
│       ├── submitted_at: timestamp
│       ├── is_late: boolean
│       ├── days_late: number
│       ├── status: 'submitted' | 'graded' | 'returned'
│       ├── grade: number
│       ├── adjusted_grade: number
│       ├── feedback: string
│       ├── graded_by: string
│       ├── graded_at: timestamp
│       └── grade_history: array
│
├── grades/
│   └── {gradeId}
│       ├── id: string
│       ├── course_id: string
│       ├── student_id: string
│       ├── student_name: string
│       ├── assignment_id: string
│       ├── assignment_title: string
│       ├── grade: number
│       ├── max_score: number
│       ├── percentage: number
│       ├── weighted_score: number
│       ├── graded_by: string
│       ├── graded_at: timestamp
│       ├── updated_at: timestamp
│       └── history: array
│
├── quizzes/
│   └── {quizId}
│       ├── id: string
│       ├── course_id: string
│       ├── title: string
│       ├── description: string
│       ├── instructions: string
│       ├── time_limit_minutes: number
│       ├── max_attempts: number
│       ├── shuffle_questions: boolean
│       ├── show_correct_answers: boolean
│       ├── available_from: timestamp
│       ├── available_until: timestamp
│       ├── total_points: number
│       ├── passing_score: number
│       ├── questions: array
│       ├── status: 'draft' | 'published' | 'closed'
│       ├── created_by: string
│       └── created_at: timestamp
│
├── quiz_attempts/
│   └── {attemptId}
│       ├── id: string
│       ├── quiz_id: string
│       ├── course_id: string
│       ├── student_id: string
│       ├── student_name: string
│       ├── attempt_number: number
│       ├── started_at: timestamp
│       ├── submitted_at: timestamp
│       ├── time_taken_minutes: number
│       ├── answers: array
│       ├── score: number
│       ├── percentage: number
│       ├── passed: boolean
│       └── auto_graded: boolean
│
├── announcements/
│   └── {announcementId}
│       ├── id: string
│       ├── course_id: string (optional for global)
│       ├── type: 'course' | 'global'
│       ├── title: string
│       ├── content: string
│       ├── priority: 'low' | 'normal' | 'high' | 'urgent'
│       ├── pinned: boolean
│       ├── status: 'draft' | 'published' | 'archived'
│       ├── visible_from: timestamp
│       ├── visible_until: timestamp
│       ├── author_id: string
│       ├── author_name: string
│       └── created_at: timestamp
│
├── notifications/
│   └── {notificationId}
│       ├── id: string
│       ├── user_id: string
│       ├── type: 'announcement' | 'assignment' | 'grade' | 'discussion'
│       ├── title: string
│       ├── message: string
│       ├── link: string
│       ├── is_read: boolean
│       ├── read_at: timestamp
│       └── created_at: timestamp
│
└── content/
    └── {contentId}
        ├── id: string
        ├── course_id: string
        ├── type: 'folder' | 'file' | 'link' | 'text'
        ├── title: string
        ├── description: string
        ├── file_url: string
        ├── file_type: string
        ├── file_size: number
        ├── parent_id: string
        ├── order: number
        ├── visible_to_students: boolean
        ├── available_from: timestamp
        ├── available_until: timestamp
        └── created_at: timestamp
```

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isAdmin() {
      return isAuthenticated() &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    function isInstructor() {
      return isAuthenticated() &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'instructor';
    }

    function isStudent() {
      return isAuthenticated() &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'student';
    }

    function isCourseInstructor(courseId) {
      return isAuthenticated() &&
             get(/databases/$(database)/documents/courses/$(courseId)).data.instructor_id == request.auth.uid;
    }

    function isEnrolledInCourse(courseId) {
      return exists(/databases/$(database)/documents/enrollments/$(request.auth.uid + '_' + courseId)) &&
             get(/databases/$(database)/documents/enrollments/$(request.auth.uid + '_' + courseId)).data.status == 'active';
    }

    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
      allow delete: if isAdmin();
    }

    // Courses collection
    match /courses/{courseId} {
      allow read: if isAuthenticated();
      allow create: if isInstructor() || isAdmin();
      allow update: if isCourseInstructor(courseId) || isAdmin();
      allow delete: if isCourseInstructor(courseId) || isAdmin();
    }

    // Enrollments collection
    match /enrollments/{enrollmentId} {
      allow read: if isAuthenticated() &&
                    (request.auth.uid == resource.data.student_id ||
                     isCourseInstructor(resource.data.course_id) ||
                     isAdmin());
      allow create: if isAuthenticated();
      allow update: if isCourseInstructor(resource.data.course_id) || isAdmin();
      allow delete: if isCourseInstructor(resource.data.course_id) || isAdmin();
    }

    // Assignments collection
    match /assignments/{assignmentId} {
      allow read: if isAuthenticated() &&
                    (isEnrolledInCourse(resource.data.course_id) ||
                     isCourseInstructor(resource.data.course_id) ||
                     isAdmin());
      allow create: if isCourseInstructor(request.resource.data.course_id) || isAdmin();
      allow update: if isCourseInstructor(resource.data.course_id) || isAdmin();
      allow delete: if isCourseInstructor(resource.data.course_id) || isAdmin();
    }

    // Submissions collection
    match /submissions/{submissionId} {
      allow read: if isAuthenticated() &&
                    (request.auth.uid == resource.data.student_id ||
                     isCourseInstructor(resource.data.course_id) ||
                     isAdmin());
      allow create: if isAuthenticated() &&
                      request.auth.uid == request.resource.data.student_id &&
                      isEnrolledInCourse(request.resource.data.course_id);
      allow update: if isCourseInstructor(resource.data.course_id) || isAdmin();
      allow delete: if isCourseInstructor(resource.data.course_id) || isAdmin();
    }

    // Grades collection
    match /grades/{gradeId} {
      allow read: if isAuthenticated() &&
                    (request.auth.uid == resource.data.student_id ||
                     isCourseInstructor(resource.data.course_id) ||
                     isAdmin());
      allow create, update: if isCourseInstructor(request.resource.data.course_id) || isAdmin();
      allow delete: if isCourseInstructor(resource.data.course_id) || isAdmin();
    }

    // Quizzes collection
    match /quizzes/{quizId} {
      allow read: if isAuthenticated() &&
                    (isEnrolledInCourse(resource.data.course_id) ||
                     isCourseInstructor(resource.data.course_id) ||
                     isAdmin());
      allow create: if isCourseInstructor(request.resource.data.course_id) || isAdmin();
      allow update: if isCourseInstructor(resource.data.course_id) || isAdmin();
      allow delete: if isCourseInstructor(resource.data.course_id) || isAdmin();
    }

    // Quiz attempts collection
    match /quiz_attempts/{attemptId} {
      allow read: if isAuthenticated() &&
                    (request.auth.uid == resource.data.student_id ||
                     isCourseInstructor(resource.data.course_id) ||
                     isAdmin());
      allow create: if isAuthenticated() &&
                      request.auth.uid == request.resource.data.student_id &&
                      isEnrolledInCourse(request.resource.data.course_id);
      allow update: if request.auth.uid == resource.data.student_id ||
                      isCourseInstructor(resource.data.course_id) ||
                      isAdmin();
      allow delete: if isCourseInstructor(resource.data.course_id) || isAdmin();
    }

    // Announcements collection
    match /announcements/{announcementId} {
      allow read: if isAuthenticated();
      allow create: if isInstructor() || isAdmin();
      allow update, delete: if isAuthenticated() &&
                              (request.auth.uid == resource.data.author_id || isAdmin());
    }

    // Notifications collection
    match /notifications/{notificationId} {
      allow read, update, delete: if isAuthenticated() &&
                                    request.auth.uid == resource.data.user_id;
      allow create: if isAuthenticated();
    }

    // Content collection
    match /content/{contentId} {
      allow read: if isAuthenticated() &&
                    (isEnrolledInCourse(resource.data.course_id) ||
                     isCourseInstructor(resource.data.course_id) ||
                     isAdmin());
      allow create: if isCourseInstructor(request.resource.data.course_id) || isAdmin();
      allow update, delete: if isCourseInstructor(resource.data.course_id) || isAdmin();
    }
  }
}
```

## Indexes Required

```
// Composite indexes for efficient querying

courses:
  - instructor_id, status
  - status, created_at

enrollments:
  - course_id, status
  - student_id, status
  - course_id, student_id

assignments:
  - course_id, status, due_date
  - created_by, status

submissions:
  - assignment_id, student_id
  - course_id, status
  - student_id, submitted_at

grades:
  - course_id, student_id
  - student_id, course_id

quizzes:
  - course_id, status

quiz_attempts:
  - quiz_id, student_id
  - student_id, quiz_id

announcements:
  - course_id, status, created_at
  - type, status, created_at

notifications:
  - user_id, is_read, created_at

content:
  - course_id, parent_id, order
```
