import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Problem {
    id: string;
    title: string;
    difficulty: "easy" | "medium" | "hard";
    solved: boolean;
    points: number;
}

export function ContestProblemsPage() {
    const { id: contestId } = useParams();
    const [problems, setProblems] = useState<Problem[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                // TODO: Replace with actual API call
                const mockProblems = [
                    {
                        id: "1",
                        title: "Two Sum",
                        difficulty: "easy",
                        solved: false,
                        points: 100,
                    },
                    {
                        id: "2",
                        title: "Binary Tree Maximum Path",
                        difficulty: "hard",
                        solved: false,
                        points: 300,
                    },
                ] as Problem[];

                setProblems(mockProblems);
            } catch (error) {
                console.error("Failed to fetch problems:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProblems();
    }, [contestId]);

    const getDifficultyColor = (difficulty: Problem["difficulty"]) => {
        switch (difficulty) {
            case "easy":
                return "bg-green-100 text-green-800";
            case "medium":
                return "bg-yellow-100 text-yellow-800";
            case "hard":
                return "bg-red-100 text-red-800";
            default:
                return "";
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">
                        Contest Problems
                    </h1>
                    <p className="text-muted-foreground">
                        Solve all problems within the time limit to win the
                        contest
                    </p>
                </div>

                {loading ? (
                    <div>Loading problems...</div>
                ) : (
                    <div className="space-y-4">
                        {problems.map((problem) => (
                            <Card
                                key={problem.id}
                                className="hover:shadow-md transition-shadow"
                            >
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="text-xl">
                                        {problem.title}
                                    </CardTitle>
                                    <div className="flex items-center gap-4">
                                        <Badge
                                            className={getDifficultyColor(
                                                problem.difficulty
                                            )}
                                        >
                                            {problem.difficulty}
                                        </Badge>
                                        <span className="text-sm text-muted-foreground">
                                            {problem.points} points
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            {problem.solved && (
                                                <Badge
                                                    variant="outline"
                                                    className="text-green-600"
                                                >
                                                    Solved
                                                </Badge>
                                            )}
                                        </div>
                                        <Button
                                            onClick={() =>
                                                navigate(`${problem.id}/solve`)
                                            }
                                            variant="outline"
                                        >
                                            Solve Problem
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
