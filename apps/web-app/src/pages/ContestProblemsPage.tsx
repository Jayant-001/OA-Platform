import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useProblemContext } from "@/context/ProblemContext";
import {
    BookOpen,
    Check,
    AlertTriangle,
    XCircle,
    Clock,
    ArrowRight,
    BrainCircuit,
} from "lucide-react";
import { LeaderboardCard } from "@/components/LeaderboardCard";
import { useEffect, useState } from "react";
import { LeaderboardUser } from "@/types";
import LoadingPageWithNavbar from "@/components/LoadingPageWithNavbar";

export function ContestProblemsPage() {
    const navigate = useNavigate();
    const { problems, loading, leaderboard } = useProblemContext();
    const [leaderboardUsers, setLeaderboardUsers] = useState<LeaderboardUser[]>(
        []
    );

    const getStatusColor = (status: string) => {
        const colors = {
            Solved: "bg-green-100 text-green-700 border-green-200",
            Attempted: "bg-yellow-100 text-yellow-700 border-yellow-200",
            "Not Attempted": "bg-red-100 text-red-700 border-red-200",
        };
        return colors[status] || "bg-gray-100 text-gray-700 border-gray-200";
    };

    const getStatusIcon = (status: string) => {
        const icons = {
            Solved: <Check className="w-4 h-4" />,
            Attempted: <AlertTriangle className="w-4 h-4" />,
            "Not Attempted": <XCircle className="w-4 h-4" />,
        };
        return icons[status] || null;
    };

    useEffect(() => {
        if (leaderboard.length > 0) {
            const data = leaderboard.map((item) => ({
                id: item.userId,
                name: item.userName,
                score: item.totalPoints,
                finishTime: item.finishTime,
                rank: item.rank
            }));
            setLeaderboardUsers(data);
        }
    }, [leaderboard]);

    if (loading) {
        return (
            <LoadingPageWithNavbar />
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
                        <BrainCircuit className="w-10 h-10" />
                        Contest Problems
                    </h1>
                    <p className="text-slate-600 max-w-2xl mx-auto">
                        Solve all problems within the time limit to win the
                        contest. Good luck and happy coding!
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        {problems.map((problem, index) => (
                            <Card
                                key={problem.id}
                                className="group hover:shadow-lg transition-all duration-300 border-slate-200 hover:border-purple-200 backdrop-blur-sm bg-white/90"
                            >
                                <CardHeader>
                                    <div className="flex items-center justify-between flex-wrap gap-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl font-bold text-purple-600 w-8">
                                                {String.fromCharCode(
                                                    65 + index
                                                )}
                                            </span>
                                            <div className="space-y-1">
                                                <CardTitle className="text-xl font-semibold">
                                                    {problem.title}
                                                </CardTitle>
                                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4 text-purple-600" />
                                                        {problem.points} points
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={`flex items-center gap-1 ${getStatusColor(
                                                problem.status
                                            )}`}
                                        >
                                            {getStatusIcon(problem.status)}
                                            {problem.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Button
                                        onClick={() =>
                                            navigate(`${problem.id}/solve`)
                                        }
                                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 group-hover:shadow-md transition-all duration-300"
                                    >
                                        <BookOpen className="w-4 h-4 mr-2" />
                                        Solve Problem
                                        <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    <div className="lg:col-span-1">
                        <LeaderboardCard leaderboardUsers={leaderboardUsers} />
                    </div>
                </div>
            </main>
        </div>
    );
}
