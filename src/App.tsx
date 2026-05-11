import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import ProtectedRoute from './features/auth/components/ProtectedRoute'
import Layout from './shared/components/Layout'
import DashboardPage from './pages/DashboardPage'
import LecturePage from './pages/LecturePage'
import AssignmentPage from './pages/AssignmentPage'
import CoursesPage from './pages/CoursesPage'
import AttendancePage from './pages/AttendancePage'
import GradesPage from './pages/GradesPage'
import EnrollmentPage from './pages/EnrollmentPage'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminPage from './pages/AdminPage'
import useAdminStore from './store/adminStore'

function AdminProtectedRoute() {
  const { isAdminAuthenticated } = useAdminStore()
  if (!isAdminAuthenticated) return <Navigate to="/admin/login" replace />
  return <Outlet />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:courseId/lectures/:lectureId?" element={<LecturePage />} />
            <Route path="/enrollment" element={<EnrollmentPage />} />
            <Route path="/assignments" element={<DashboardPage />} />
            <Route path="/assignments/:assignmentId" element={<AssignmentPage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/grades" element={<GradesPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
