import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { HomePage } from "@/pages/HomePage";
import { ContestDetailPage } from "@/pages/ContestDetailPage";
import { ContestProblemsPage } from "@/pages/ContestProblemsPage";
import { AdminDashboardPage } from "@/pages/admin/DashboardPage";
import { AddProblemPage } from "@/pages/admin/AddProblemPage";
import { ROUTES } from "@/lib/routes";
import "./App.css";
import TestPage from "./pages/test/TestPage";
import TestPage2 from "./pages/test/TestPage2";
import { ProblemDescriptionPage } from "./pages/ProblemDescriptionPage";

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    {/* Public routes */}
                    <Route path={ROUTES.LOGIN} element={<LoginPage />} />
                    <Route path={ROUTES.REGISTER} element={<RegisterPage />} />

                    <Route path="/test" element={<TestPage />} />
                    <Route
                        path="/test2"
                        element={
                            <TestPage2 content={""} setContent={() => {}} />
                        }
                    />

                    {/* Protected routes */}
                    <Route
                        path={ROUTES.HOME}
                        element={
                            // <ProtectedRoute>
                            <HomePage />
                            // </ProtectedRoute>
                        }
                    />
                    <Route
                        path={ROUTES.CONTEST.DETAIL}
                        element={
                            // <ProtectedRoute>
                            <ContestDetailPage />
                            // </ProtectedRoute>
                        }
                    />
                    <Route
                        path={ROUTES.CONTEST.PROBLEMS}
                        element={
                            // <ProtectedRoute>
                            <ContestProblemsPage />
                            // </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/problems/:id"
                        element={
                            // <ProtectedRoute>
                            <ProblemDescriptionPage />
                            // </ProtectedRoute>
                        }
                    />

                    {/* Admin routes */}
                    <Route
                        path={ROUTES.ADMIN.DASHBOARD}
                        element={
                            // <ProtectedRoute requireAdmin>
                            <AdminDashboardPage />
                            // </ProtectedRoute>
                        }
                    />
                    <Route
                        path={ROUTES.ADMIN.ADD_PROBLEM}
                        element={
                            // <ProtectedRoute requireAdmin>
                            <AddProblemPage />
                            // {/* </ProtectedRoute> */}
                        }
                    />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
