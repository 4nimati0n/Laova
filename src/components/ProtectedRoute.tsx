import { Navigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

// Define your secret key here. Change this to something only you know!
const SECRET_KEY = 'laova2025admin';
const STORAGE_KEY = 'laova_access_granted';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const [searchParams] = useSearchParams();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        // Always allow localhost access
        const isLocalhost = window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1';
        if (isLocalhost) {
            setIsAuthorized(true);
            return;
        }

        // Check if key is in URL
        const keyParam = searchParams.get('key');
        if (keyParam === SECRET_KEY) {
            localStorage.setItem(STORAGE_KEY, 'true');
            setIsAuthorized(true);
            return;
        }

        // Check if already authorized via localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        setIsAuthorized(stored === 'true');
    }, [searchParams]);

    // Loading state
    if (isAuthorized === null) {
        return null;
    }

    // Not authorized - redirect to landing
    if (!isAuthorized) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
