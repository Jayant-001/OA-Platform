import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/lib/routes";
import { Code, UserCircle } from "lucide-react";

export function Navbar() {
    const { user, logout } = useAuth();

    return (
        <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <Link to={ROUTES.HOME} className="flex items-center gap-2 text-purple-600">
                    <Code className="w-6 h-6" />
                    <span className="font-bold text-xl">Code Clash</span>
                </Link>

                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            <div className="flex items-center gap-2 text-slate-600">
                                <UserCircle className="w-5 h-5" />
                                <span>{user.username}</span>
                            </div>
                            {user.role === "admin" && (
                                <Link to={ROUTES.DASHBOARD.HOME}>
                                    <Button variant="outline" className="border-purple-200 hover:bg-purple-50">
                                        Admin Dashboard
                                    </Button>
                                </Link>
                            )}
                            <Button variant="ghost" onClick={logout} className="text-red-600 hover:bg-red-50">
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link to={ROUTES.LOGIN}>
                                <Button variant="ghost" className="hover:bg-purple-50">Login</Button>
                            </Link>
                            <Link to={ROUTES.REGISTER}>
                                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                                    Register
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
