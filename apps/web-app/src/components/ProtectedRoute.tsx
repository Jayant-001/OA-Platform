import { Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useUser } from "@/context/UserContext";

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
}

export function ProtectedRoute({
    children,
    requireAdmin = false,
}: ProtectedRouteProps) {
    const { user } = useUser();
    const location = useLocation();

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requireAdmin && user.role !== "admin") {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}
