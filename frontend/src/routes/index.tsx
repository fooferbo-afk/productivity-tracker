/**
 * Application routes configuration.
 * 
 * Defines all routes with protected/public access.
 */

import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { Layout } from '../components/common/Layout';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { CalculatorPage } from '../pages/CalculatorPage';
import { HistoryPage } from '../pages/HistoryPage';
import { FacilitiesPage } from '../pages/FacilitiesPage';
import { ProfilePage } from '../pages/ProfilePage';

export const router = createBrowserRouter([
    // Public routes
    {
        path: '/login',
        element: <LoginPage />,
    },

    // Protected routes with layout
    {
        path: '/',
        element: (
            <ProtectedRoute>
                <Layout />
            </ProtectedRoute>
        ),
        children: [
            {
                index: true,
                element: <Navigate to="/dashboard" replace />,
            },
            {
                path: 'dashboard',
                element: <DashboardPage />,
            },
            {
                path: 'calculator',
                element: <CalculatorPage />,
            },
            {
                path: 'history',
                element: <HistoryPage />,
            },
            {
                path: 'facilities',
                element: <FacilitiesPage />,
            },
            {
                path: 'profile',
                element: <ProfilePage />,
            },
        ],
    },

    // Catch-all redirect
    {
        path: '*',
        element: <Navigate to="/" replace />,
    },
]);
