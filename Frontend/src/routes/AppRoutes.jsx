// routes/AppRoutes.jsx
import React, { Suspense, lazy } from "react";
import { createBrowserRouter } from "react-router-dom";

import ProtectedRoute from "../components/ProtectedRoute";



// Lazy loaded pages
const Signup = lazy(() => import("../pages/Signup"));
const Login = lazy(() => import("../pages/Login"));
const Dashboard = lazy(() => import("../pages/Dashboard"));


const AdminPanel = lazy(() => import("../pages/AdminPanel"));
const StudentPanel = lazy(() => import("../pages/StudentPanel"));
const DriverPanel = lazy(() => import("../pages/Driverpanel"));
const StudentAuth = lazy(() => import("../pages/StudentAuth"));
const StudentTest = lazy(() => import("../pages/StudentTest"));
const EmailVerification = lazy(() => import("../pages/EmailVerification"));
const ForgotPassword = lazy(() => import("../pages/ForgotPassword")); // ✅ Added
const ResetPassword = lazy(() => import("../pages/ResetPassword"));   // ✅ Added
const NotFound = lazy(() => import("../pages/NotFound"));

const router = createBrowserRouter([

      {
        path: "/",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <Dashboard />
          </Suspense>
        ),
      },

      {
        path: "/auth",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <Login />
          </Suspense>
        ),
      },
      {
        path: "/login",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <Login />
          </Suspense>
        ),
      },
      {
        path: "/signup",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <Signup />
          </Suspense>
        ),
      },

      {
        path: "/verify-email",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <EmailVerification />
          </Suspense>
        ),
      },
      {
        path: "/forgot-password", // ✅ Forgot Password Route
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ForgotPassword />
          </Suspense>
        ),
      },
      {
        path: "/reset-password/:token", // ✅ Reset Password Route
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ResetPassword />
          </Suspense>
        ),
      },
      // {
      //   path: "/Dashboard",
      //   element: (
          
      //       <Suspense fallback={<div>Loading...</div>}>
      //         <Dashboard />
      //       </Suspense>
          
      //   ),
      // },
      // Uncomment if you want to use admin route later
      {
        path: "/admin",
        element: (
          <ProtectedRoute requiredRole="admin">
            <Suspense fallback={<div>Loading...</div>}>
              <AdminPanel />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin-dashboard",
        element: (
          <ProtectedRoute requiredRole="admin">
            <Suspense fallback={<div>Loading...</div>}>
              <AdminPanel />
            </Suspense>
          </ProtectedRoute>
        ),
      },
        {
        path: "/driver-dashboard",
        element: (
          <ProtectedRoute requiredRole="driver">
            <Suspense fallback={<div>Loading...</div>}>
              <DriverPanel />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "/student-auth",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <StudentAuth />
          </Suspense>
        ),
      },
      {
        path: "/student-panel",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <StudentPanel />
          </Suspense>
        ),
      },
      {
        path: "/student-dashboard",
        element: (
          <ProtectedRoute requiredRole="student">
            <Suspense fallback={<div>Loading...</div>}>
              <StudentPanel />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "/student-test",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <StudentTest />
          </Suspense>
        ),
      },



      {
        path: "*",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <NotFound />
          </Suspense>
        ),
      },
    
  
]);

export default router;