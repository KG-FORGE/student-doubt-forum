import { Routes, Route } from 'react-router';

import MainLayout from '../layouts/MainLayout.jsx';
import Landing from '../pages/public/Landing.jsx';
import Login from '../pages/auth/Login.jsx';
import Register from '../pages/auth/Register.jsx';
import ForgotPassword from '../pages/auth/ForgotPassword.jsx';
import ResetPassword from '../pages/auth/ResetPassword.jsx';
import Questions from '../pages/public/Questions.jsx';
import AskQuestion from '../pages/questions/AskQuestion.jsx';
import QuestionDetails from '../pages/questions/QuestionDetails.jsx';
import StudentDashboard from '../pages/student/Dashboard.jsx';
import TeacherDashboard from '../pages/teacher/Dashboard.jsx';
import AdminDashboard from '../pages/admin/Dashboard.jsx';

import ProtectedRoute from '../components/ui/ProtectedRoute.jsx';
import RoleRoute from '../components/ui/RoleRoute.jsx';

function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/questions" element={<Questions />} />
        <Route path="/questions/:id" element={<QuestionDetails />} />

        {/* Protected Doubt Creation */}
        <Route
          path="/ask"
          element={
            <ProtectedRoute>
              <AskQuestion />
            </ProtectedRoute>
          }
        />

        {/* Role-Specific Dashboards */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/dashboard"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['teacher', 'admin']}>
                <TeacherDashboard />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
