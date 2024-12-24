import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { UserProvider } from "@/context/UserContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { HomePage } from "@/pages/HomePage";
import { ContestDetailPage } from "@/pages/ContestDetailPage";
import { ContestProblemsPage } from "@/pages/ContestProblemsPage";
import { DashboardPage } from "@/pages/admin/DashboardPage";
import { AddProblemPage } from "@/pages/admin/AddProblemPage";
import { ROUTES } from "@/lib/routes";
import "./App.css";
import TestPage from "./pages/test/TestPage";
import TestPage2 from "./pages/test/TestPage2";
import { ProblemDescriptionPage } from "./pages/ProblemDescriptionPage";
import { CreateContestPage } from "./pages/admin/CreateContestPage";
import { ContestLeaderboardPage } from "./pages/ContestLeaderboardPage";
import { UpdateContestPage } from "./pages/dashboard/UpdateContestPage";
import { AdminLoginPage } from "./pages/admin/AdminLoginPage";
import { AdminRegisterPage } from "./pages/admin/AdminRegisterPage";
import { Toaster } from "react-hot-toast";

function App() {
    return (
        <BrowserRouter>
            <Toaster />
            <AuthProvider>
                <UserProvider>
                    <Routes>
                        {/* Public routes */}
                        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
                        <Route
                            path={ROUTES.REGISTER}
                            element={<RegisterPage />}
                        />
                        <Route
                            path={ROUTES.ADMIN_LOGIN}
                            element={<AdminLoginPage />}
                        />
                        <Route
                            path={ROUTES.ADMIN_REGISTER}
                            element={<AdminRegisterPage />}
                        />

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
                                <ProtectedRoute>
                                    <HomePage />
                                </ProtectedRoute>
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
                            path={ROUTES.CONTEST.SOLVE_PROBLEMS}
                            element={
                                // <ProtectedRoute>
                                <ProblemDescriptionPage />
                                // </ProtectedRoute>
                            }
                        />

                        {/*  ------------------------------- Dashboard routes ------------------------------------  */}

                        <Route
                            path={ROUTES.DASHBOARD.HOME}
                            element={
                                // <ProtectedRoute requireAdmin>
                                <DashboardPage />
                                //  </ProtectedRoute>
                            }
                        />

                        <Route
                            path={ROUTES.DASHBOARD.CONTEST}
                            element={
                                // <ProtectedRoute requireAdmin>
                                <ContestDetailPage />
                                // </ProtectedRoute>
                            }
                        />

                        <Route
                            path={ROUTES.DASHBOARD.ADD_CONTEST}
                            element={
                                // <ProtectedRoute>
                                <CreateContestPage />
                                // </ProtectedRoute>
                            }
                        />

                        <Route
                            path={ROUTES.DASHBOARD.UPDATE_CONTEST}
                            element={
                                // <ProtectedRoute>
                                <UpdateContestPage />
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

                        <Route
                            path="/contests/:id/leaderboard"
                            element={
                                // <ProtectedRoute>
                                <ContestLeaderboardPage />
                                // </ProtectedRoute>
                            }
                        />

                        {/* Admin routes */}
                        <Route
                            path={ROUTES.DASHBOARD.ADD_PROBLEM}
                            element={
                                // <ProtectedRoute requireAdmin>
                                <AddProblemPage />
                                // {/* </ProtectedRoute> */}
                            }
                        />

                        <Route
                            path={ROUTES.DASHBOARD.PROBLEM}
                            element={
                                // <ProtectedRoute requireAdmin>
                                <ProblemDescriptionPage />
                                // {/* </ProtectedRoute> */}
                            }
                        />

                        <Route
                            path={ROUTES.DASHBOARD.UPDATE_PROBLEM}
                            element={
                                // <ProtectedRoute requireAdmin>
                                <AddProblemPage />
                                // {/* </ProtectedRoute> */}
                            }
                        />
                    </Routes>
                </UserProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
