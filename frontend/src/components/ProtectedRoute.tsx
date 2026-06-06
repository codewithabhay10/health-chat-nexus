import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';

const ProtectedRoute = ({ children, requiredRole }) => {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const [hasRequiredRole, setHasRequiredRole] = useState(false);

    useEffect(() => {
        // Check authentication status from localStorage
        const userId = localStorage.getItem('userId');
        const userRole = localStorage.getItem('userRole');
        
        console.log("Auth check:", { userId, userRole, requiredRole });
        
        setAuthenticated(!!userId);
        setHasRequiredRole(userRole === requiredRole);
        setLoading(false);
    }, [requiredRole]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!authenticated) {
        return <Navigate to="/" replace />;
    }

    if (requiredRole && !hasRequiredRole) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
