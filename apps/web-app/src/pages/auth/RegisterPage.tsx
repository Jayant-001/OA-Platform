import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/lib/routes";

const colleges = ["MIT", "Harvard", "Stanford", "UC Berkeley", "Caltech"];
const branches = [
    "Computer Science",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Biotechnology",
];
const currentYear = new Date().getFullYear();
const batches = Array.from({ length: currentYear - 1999 }, (_, i) =>
    (2000 + i).toString()
);

export function RegisterPage() {
    const navigate = useNavigate();
    const { userRegister: register } = useAuth();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        name: "",
        college: "",
        batch: "",
        branch: "",
    });
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            const data = await register(
                formData.email,
                formData.password,
                formData.name,
                formData.college,
                formData.batch,
                formData.branch
            );
            console.log(data);
            navigate(ROUTES.LOGIN);
        } catch (error: any) {
            console.log(error);
            setError("Registration failed. Please try again.");
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const filterOptions = (options: string[], input: string) => {
        return options.filter((option) =>
            option.toLowerCase().includes(input.toLowerCase())
        );
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <Card className="w-[400px]">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">
                        Register
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label htmlFor="name">Full Name</label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-1">
                            <label htmlFor="email">Email</label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-1">
                            <label htmlFor="password">Password</label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-1">
                            <label htmlFor="confirmPassword">
                                Confirm Password
                            </label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-1">
                            <label htmlFor="college">College</label>
                            <Input
                                id="college"
                                name="college"
                                type="text"
                                required
                                value={formData.college}
                                onChange={handleChange}
                                list="colleges"
                            />
                            <datalist id="colleges">
                                {filterOptions(colleges, formData.college).map(
                                    (college) => (
                                        <option key={college} value={college} />
                                    )
                                )}
                            </datalist>
                        </div>
                        <div className="space-y-1">
                            <label htmlFor="branch">Branch</label>
                            <Input
                                id="branch"
                                name="branch"
                                type="text"
                                required
                                value={formData.branch}
                                onChange={handleChange}
                                list="branches"
                            />
                            <datalist id="branches">
                                {filterOptions(branches, formData.branch).map(
                                    (branch) => (
                                        <option key={branch} value={branch} />
                                    )
                                )}
                            </datalist>
                        </div>
                        <div className="space-y-1">
                            <label htmlFor="batch">Batch</label>
                            <Input
                                id="batch"
                                name="batch"
                                type="text"
                                required
                                value={formData.batch}
                                onChange={handleChange}
                                list="batches"
                            />
                            <datalist id="batches">
                                {filterOptions(batches, formData.batch).map(
                                    (batch) => (
                                        <option key={batch} value={batch} />
                                    )
                                )}
                            </datalist>
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm">{error}</div>
                        )}

                        <Button type="submit" className="w-full">
                            Register
                        </Button>

                        <div className="text-center text-sm">
                            Already have an account?{" "}
                            <Link
                                to={ROUTES.LOGIN}
                                className="text-primary hover:underline"
                            >
                                Login
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
