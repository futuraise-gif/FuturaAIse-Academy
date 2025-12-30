import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Assignments from './pages/Assignments';
import AssignmentDetail from './pages/AssignmentDetail';
import Grades from './pages/Grades';
import Calendar from './pages/Calendar';
import Discussions from './pages/Discussions';
import DiscussionBoard from './pages/DiscussionBoard';
import ThreadView from './pages/ThreadView';
import ContentModule from './pages/ContentModule';
import CourseDetail from './pages/CourseDetail';
import Announcements from './pages/Announcements';
import AnnouncementDetail from './pages/AnnouncementDetail';
import Users from './pages/Users';
import Profile from './pages/Profile';
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import GradeCenter from './pages/instructor/GradeCenter';
import InstructorHome from './pages/instructor/InstructorHome';
import Programs from './pages/instructor/Programs';
import InstructorCourses from './pages/instructor/Courses';
import Attendance from './pages/instructor/Attendance';
import InstructorAssignments from './pages/instructor/Assignments';
import AssignmentSubmissions from './pages/instructor/AssignmentSubmissions';
import InstructorAnnouncements from './pages/instructor/InstructorAnnouncements';
import InstructorAnalytics from './pages/instructor/Analytics';
import LiveSessions from './pages/instructor/LiveSessions';
import InstructorLiveClasses from './pages/instructor/LiveClasses';
import InstructorBetaTesting from './pages/instructor/BetaTesting';
import StudentLiveClasses from './pages/student/LiveClasses';
import StudentBetaTesting from './pages/student/BetaTesting';
import StudentGrades from './pages/StudentGrades';
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import SuperAdminCourses from './pages/superadmin/SuperAdminCourses';
import StudentRegistration from './pages/admin/StudentRegistration';
import StudentManagement from './pages/admin/StudentManagement';
import InstructorManagement from './pages/admin/InstructorManagement';
import CRMDashboard from './pages/admin/CRMDashboard';
import LeadManagement from './pages/admin/LeadManagement';
import InvoiceManagement from './pages/admin/InvoiceManagement';
import PaymentManagement from './pages/admin/PaymentManagement';
import TaskManagement from './pages/admin/TaskManagement';
import BetaTesting from './pages/admin/BetaTesting';
import UpcomingClasses from './pages/UpcomingClasses';
import LiveClass from './pages/LiveClass';
import LiveClassRoom from './pages/LiveClassRoom';
import WebRTCTest from './pages/WebRTCTest';
import WebRTCTestRoom from './pages/WebRTCTestRoom';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuthStore } from './store/authStore.firebase';
import { UserRole } from './types';

function App() {
  const { isAuthenticated } = useAuthStore();

  console.log('App component rendering, isAuthenticated:', isAuthenticated);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses"
          element={
            <ProtectedRoute>
              <Courses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assignments"
          element={
            <ProtectedRoute>
              <Assignments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assignments/:courseId/:assignmentId"
          element={
            <ProtectedRoute>
              <AssignmentDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/grades"
          element={
            <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
              <Grades />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses/:courseId/grades"
          element={
            <ProtectedRoute>
              <StudentGrades />
            </ProtectedRoute>
          }
        />
        <Route
          path="/live-classes"
          element={
            <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
              <StudentLiveClasses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/beta-testing"
          element={
            <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
              <StudentBetaTesting />
            </ProtectedRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <Calendar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/discussions"
          element={
            <ProtectedRoute>
              <Discussions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses/:courseId/discussions"
          element={
            <ProtectedRoute>
              <DiscussionBoard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses/:courseId/discussions/:threadId"
          element={
            <ProtectedRoute>
              <ThreadView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses/:courseId"
          element={
            <ProtectedRoute>
              <CourseDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses/:courseId/content"
          element={
            <ProtectedRoute>
              <ContentModule />
            </ProtectedRoute>
          }
        />
        <Route
          path="/announcements"
          element={
            <ProtectedRoute>
              <Announcements />
            </ProtectedRoute>
          }
        />
        <Route
          path="/announcements/:id"
          element={
            <ProtectedRoute>
              <AnnouncementDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Instructor Routes */}
        <Route
          path="/instructor"
          element={
            <ProtectedRoute allowedRoles={[UserRole.INSTRUCTOR, UserRole.ADMIN]}>
              <InstructorHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/dashboard"
          element={
            <ProtectedRoute allowedRoles={[UserRole.INSTRUCTOR, UserRole.ADMIN]}>
              <InstructorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/programs"
          element={
            <ProtectedRoute allowedRoles={[UserRole.INSTRUCTOR, UserRole.ADMIN]}>
              <Programs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/courses"
          element={
            <ProtectedRoute allowedRoles={[UserRole.INSTRUCTOR, UserRole.ADMIN]}>
              <InstructorCourses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/attendance"
          element={
            <ProtectedRoute allowedRoles={[UserRole.INSTRUCTOR, UserRole.ADMIN]}>
              <Attendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/assignments"
          element={
            <ProtectedRoute allowedRoles={[UserRole.INSTRUCTOR, UserRole.ADMIN]}>
              <InstructorAssignments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/courses/:courseId/assignments/:assignmentId/submissions"
          element={
            <ProtectedRoute allowedRoles={[UserRole.INSTRUCTOR, UserRole.ADMIN]}>
              <AssignmentSubmissions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/announcements"
          element={
            <ProtectedRoute allowedRoles={[UserRole.INSTRUCTOR, UserRole.ADMIN]}>
              <InstructorAnnouncements />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/analytics"
          element={
            <ProtectedRoute allowedRoles={[UserRole.INSTRUCTOR, UserRole.ADMIN]}>
              <InstructorAnalytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/courses/:courseId/grades"
          element={
            <ProtectedRoute allowedRoles={[UserRole.INSTRUCTOR, UserRole.ADMIN]}>
              <GradeCenter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/live-sessions"
          element={
            <ProtectedRoute allowedRoles={[UserRole.INSTRUCTOR, UserRole.ADMIN]}>
              <LiveSessions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/live-classes"
          element={
            <ProtectedRoute allowedRoles={[UserRole.INSTRUCTOR, UserRole.ADMIN]}>
              <InstructorLiveClasses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/beta-testing"
          element={
            <ProtectedRoute allowedRoles={[UserRole.INSTRUCTOR, UserRole.ADMIN]}>
              <InstructorBetaTesting />
            </ProtectedRoute>
          }
        />

        {/* Live Class Routes */}
        <Route
          path="/live/:sessionId"
          element={
            <ProtectedRoute>
              <LiveClass />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upcoming-classes"
          element={
            <ProtectedRoute>
              <UpcomingClasses />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/student-registration"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
              <StudentRegistration />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
              <StudentManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/instructors"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
              <InstructorManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/beta-testing"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
              <BetaTesting />
            </ProtectedRoute>
          }
        />

        {/* CRM Routes */}
        <Route
          path="/admin/crm"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
              <CRMDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/crm/leads"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
              <LeadManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/crm/invoices"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
              <InvoiceManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/crm/payments"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
              <PaymentManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/crm/tasks"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
              <TaskManagement />
            </ProtectedRoute>
          }
        />

        {/* Super Admin Routes */}
        <Route
          path="/superadmin/dashboard"
          element={
            <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/courses"
          element={
            <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
              <SuperAdminCourses />
            </ProtectedRoute>
          }
        />

        <Route
          path="/unauthorized"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">403</h1>
                <p className="text-xl text-gray-600">Unauthorized Access</p>
              </div>
            </div>
          }
        />
        <Route
          path="/live-class/:classId"
          element={
            <ProtectedRoute allowedRoles={[UserRole.STUDENT, UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
              <LiveClassRoom />
            </ProtectedRoute>
          }
        />
        <Route
          path="/webrtc-test"
          element={
            <ProtectedRoute allowedRoles={[UserRole.STUDENT, UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
              <WebRTCTest />
            </ProtectedRoute>
          }
        />
        <Route
          path="/webrtc-test/:roomId"
          element={
            <ProtectedRoute allowedRoles={[UserRole.STUDENT, UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
              <WebRTCTestRoom />
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-xl text-gray-600">Page Not Found</p>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
