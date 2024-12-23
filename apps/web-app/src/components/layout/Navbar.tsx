import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/lib/routes";

export function Navbar() {
    const { user, logout } = useAuth();

    return (
        <nav className="border-b">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <Link to={ROUTES.HOME} className="font-bold text-xl">
                    OA Platform
                </Link>

                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            {user.role === "admin" && (
                                <Link to={ROUTES.DASHBOARD.HOME}>
                                    <Button variant="ghost">
                                        Admin Dashboard
                                    </Button>
                                </Link>
                            )}
                            <Button variant="ghost" onClick={logout}>
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link to={ROUTES.LOGIN}>
                                <Button variant="ghost">Login</Button>
                            </Link>
                            <Link to={ROUTES.REGISTER}>
                                <Button>Register</Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
