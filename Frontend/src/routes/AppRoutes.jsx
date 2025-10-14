// routes/AppRoutes.jsx
import React, { Suspense, lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../components/layouts/MainLayout";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";


// Lazy loaded pages
const Signup = lazy(() => import("../pages/Signup"));
const Login = lazy(() => import("../pages/Login"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const StudentPanel = lazy(() => import("../pages/StudentPanel"));
 const DriverPanel = lazy(() => import("../pages/DriverPanel"));



const AdminPanel = lazy(() => import("../pages/AdminPanel"));
const VerifyEmail = lazy(() => import("../pages/VerifyEmail"));
const ForgotPassword = lazy(() => import("../pages/ForgotPassword")); // ✅ Added
const ResetPassword = lazy(() => import("../pages/ResetPassword"));   // ✅ Added
const NotFound = lazy(() => import("../pages/NotFound"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <Dashboard />
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
            <VerifyEmail />
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
      {
        path: "/Dashboard",
        element: (
          <ProtectedRoute>
            <Suspense fallback={<div>Loading...</div>}>
              <Dashboard />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      // Uncomment if you want to use admin route later
      {
        path: "/admin-dashboard",
        element: (
          <ProtectedRoute>
            <RoleRoute role="admin">
              <Suspense fallback={<div>Loading...</div>}>
                <AdminPanel />
              </Suspense>
            </RoleRoute>
          </ProtectedRoute>
        ),
      },
        {
        path: "/driver-dashboard",
        element: (
          <ProtectedRoute>
            <RoleRoute role="Driver">
              <Suspense fallback={<div>Loading...</div>}>
                <DriverPanel/>
              </Suspense>
            </RoleRoute>
          </ProtectedRoute>
        ),
      },
       {
        path: "/student-dashboard",
        element: (
          <ProtectedRoute>
            <RoleRoute role="student">
              <Suspense fallback={<div>Loading...</div>}>
                <StudentPanel />
              </Suspense>
            </RoleRoute>
          </ProtectedRoute>
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
    ],
  },
]);

export default router;
