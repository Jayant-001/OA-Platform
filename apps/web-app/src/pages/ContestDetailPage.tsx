import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Contest, Problem } from "@/types";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import toast from "react-hot-toast";
import { useAdminApi, useUsersApi } from "@/hooks/useApi";
import { Navbar } from "@/components/layout/Navbar";
import {
    format,
    isPast,
    isFuture,
    isWithinInterval,
    addMinutes,
} from "date-fns";
import {
    Trophy,
    Calendar,
    Clock,
    Timer,
    Users,
    AlertCircle,
    Play,
    Shield,
} from "lucide-react";
import { LeaderboardCard } from "@/components/LeaderboardCard";

const dummyProblems: Problem[] = [
    {
        id: "55c18fb1-72b6-478e-84ed-f3e180cd0261",
        title: "Sample Problem 1",
        problem_statement: "Write a function to add two numbers.",
        example: "Input: 1, 2\nOutput: 3",
        constraints: "1 <= a, b <= 1000",
        difficulty: "easy",
        input_format: "Two integers a and b",
        output_format: "An integer representing the sum of a and b",
        time_limit: "1s",
        memory_limit: "256MB",
        created_by: "544d4a2e-305e-4354-aa62-2d5081da40b0",
        created_at: "2024-12-24T02:18:46.634Z",
        updated_at: "2024-12-24T02:18:46.634Z",
        tags: ["Array", "Hash Table"],
    },
    {
        id: "b3a7eaf8-cbf1-47a1-b9a3-a8d4350c0800",
        title: "Sample Problem 2",
        problem_statement: "Write a function to add two numbers.",
        example: "Input: 1, 2\nOutput: 3",
        constraints: "1 <= a, b <= 1000",
        difficulty: "easy",
        input_format: "Two integers a and b",
        output_format: "An integer representing the sum of a and b",
        time_limit: "1s",
        memory_limit: "256MB",
        created_by: "544d4a2e-305e-4354-aa62-2d5081da40b0",
        created_at: "2024-12-24T02:55:15.094Z",
        updated_at: "2024-12-24T03:09:04.236Z",
        tags: ["Greedy"],
    },
];

export function ContestDetailPage() {
    const { contest_id } = useParams();
    const navigate = useNavigate();
    const [contest, setContest] = useState<Contest | null>(null);
    const [problems, setProblems] = useState<Problem[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState<string | null>(null);
    const [endTimeLeft, setEndTimeLeft] = useState<string | null>(null);

    const location = useLocation();
    const isDashboard = location.pathname.includes("/dashboard/");
    const { fetchContestById, deleteContestById } = useAdminApi();
    const { fetchContestById: fetchUserContestById, registerToContest } =
        useUsersApi();

    const mockLeaderboardUsers = [
        { id: "1", name: "Alex Johnson", score: 300, finishTime: "1:45:30", rank: 1 },
        { id: "2", name: "Sarah Smith", score: 275, finishTime: "1:50:20", rank: 2 },
        { id: "3", name: "Michael Brown", score: 250, finishTime: "2:00:15", rank: 3 },
        { id: "4", name: "Emily Davis", score: 225, finishTime: "2:15:45", rank: 4 },
        { id: "5", name: "David Wilson", score: 200, finishTime: "2:30:00", rank: 5 },
    ];

    useEffect(() => {
        if (contest_id) {
            (async () => {
                try {
                    let fetched_contest;
                    if (isDashboard)
                        fetched_contest = await fetchContestById(contest_id);
                    else
                        fetched_contest = await fetchUserContestById(
                            contest_id
                        );

                    setContest(fetched_contest);
                    setProblems(dummyProblems);
                    setLoading(false);
                } catch (error) {
                    console.log(error);
                    setLoading(false);
                    toast.error("Failed to fetch contest data");
                }
            })();
        } else {
            toast.error("Contest not found");
            navigate(-1);
        }
    }, [contest_id]);

    useEffect(() => {
        if (contest) {
            const now = new Date().getTime();
            const startTime = new Date(contest.start_time).getTime();
            const distance = startTime - now;

            if (distance <= 0) {
                setTimeLeft("");
                return;
            }

            const interval = setInterval(() => {
                const now = new Date().getTime();
                const distance = startTime - now;

                if (distance <= 0) {
                    clearInterval(interval);
                    window.location.reload();
                } else {
                    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                    const hours = Math.floor(
                        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
                    );
                    const minutes = Math.floor(
                        (distance % (1000 * 60 * 60)) / (1000 * 60)
                    );
                    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                    setTimeLeft(
                        `${days * 24 + hours}:${minutes
                            .toString()
                            .padStart(2, "0")}:${seconds
                            .toString()
                            .padStart(2, "0")}`
                    );
                }
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [contest]);

    useEffect(() => {
        if (contest) {
            const status = getContestStatus();

            if (status !== "live") {
                return;
            }
            const now = new Date().getTime();
            const startTime = new Date(contest.start_time);
            const endTime = addMinutes(startTime, contest.duration);
            const distance = new Date(endTime).getTime() - now;

            if (distance <= 0) {
                setTimeLeft("");
                return;
            }

            const interval = setInterval(() => {
                const now = new Date().getTime();
                const distance = new Date(endTime).getTime() - now;

                if (distance <= 0) {
                    clearInterval(interval);
                    window.location.reload();
                } else {
                    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                    const hours = Math.floor(
                        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
                    );
                    const minutes = Math.floor(
                        (distance % (1000 * 60 * 60)) / (1000 * 60)
                    );
                    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                    setEndTimeLeft(
                        `${days * 24 + hours}:${minutes
                            .toString()
                            .padStart(2, "0")}:${seconds
                            .toString()
                            .padStart(2, "0")}`
                    );
                }
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [contest]);

    const handleDeleteContest = async (e) => {
        e.preventDefault();

        try {
            if (!contest || !contest.id) {
                toast.error("Failed to get contest data");
                return;
            }
            await deleteContestById(contest.id);
            toast.success("Contest deleted successfully");
            navigate(-1);
        } catch (error) {
            toast.error("Failed to delete contest");
        }
    };

    const getContestStatus = () => {
        if (!contest) return null;

        const now = new Date();
        const startTime = new Date(contest.start_time);
        const endTime = addMinutes(startTime, contest.duration);

        if (isPast(endTime)) return "completed";
        if (isWithinInterval(now, { start: startTime, end: endTime }))
            return "live";
        if (isFuture(startTime)) return "upcoming";
    };

    const getStatusBadge = () => {
        const status = getContestStatus();
        const styles = {
            completed: "bg-slate-100 text-slate-700 border-slate-200",
            live: "bg-green-100 text-green-700 border-green-200",
            upcoming: "bg-blue-100 text-blue-700 border-blue-200",
        }[status || "upcoming"];

        return (
            <span
                className={`px-3 py-1 rounded-full text-sm border ${styles} font-medium`}
            >
                {status?.toUpperCase()}
            </span>
        );
    };

    const handleRegisterToContest = async (e) => {
        e.preventDefault();

        if (!contest) {
            toast.error("Can't get contest");
            return;
        }

        try {
            await registerToContest(contest.id);
            window.location.reload();
        } catch (error) {
            toast.error("Registration failed. Try again");
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto py-8">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-12 w-1/2" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!contest) return <div>Loading...</div>;

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
            <Navbar />
            <div className="container mx-auto py-8 px-4">
                <Card className="backdrop-blur-sm bg-white/90 border-slate-200/60 shadow-lg">
                    <CardHeader className="space-y-4">
                        <div className="flex justify-between items-start flex-wrap gap-4">
                            <div className="space-y-1">
                                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                    {contest.title}
                                </CardTitle>
                                {isDashboard && (
                                    <p className="text-slate-600 flex items-center gap-2">
                                        <Trophy className="w-4 h-4" />
                                        Contest Code: {contest.contest_code}
                                    </p>
                                )}
                            </div>
                            {getStatusBadge()}
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-8">
                        {/* Common Content */}
                        <div className="prose prose-slate max-w-none">
                            <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-purple-600" />
                                Description
                            </h3>
                            <div
                                className="text-slate-600"
                                dangerouslySetInnerHTML={{
                                    __html: contest.description,
                                }}
                            />
                        </div>

                        {/* Contest Details Grid */}
                        <div className="grid md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="space-y-2">
                                <h4 className="font-medium flex items-center gap-2 text-slate-700">
                                    <Calendar className="w-4 h-4 text-purple-600" />
                                    Start Time
                                </h4>
                                <p className="text-slate-600">
                                    {format(
                                        new Date(contest.start_time),
                                        "PPpp"
                                    )}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-medium flex items-center gap-2 text-slate-700">
                                    <Calendar className="w-4 h-4 text-purple-600" />
                                    End Time
                                </h4>
                                <p className="text-slate-600">
                                    {format(
                                        addMinutes(
                                            new Date(contest.start_time),
                                            contest.duration
                                        ),
                                        "PPpp"
                                    )}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-medium flex items-center gap-2 text-slate-700">
                                    <Clock className="w-4 h-4 text-purple-600" />
                                    Duration
                                </h4>
                                <p className="text-slate-600">
                                    {contest.duration} minutes
                                </p>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-medium flex items-center gap-2 text-slate-700">
                                    <Timer className="w-4 h-4 text-purple-600" />
                                    Buffer Time
                                </h4>
                                <p className="text-slate-600">
                                    {contest.buffer_time} minutes
                                </p>
                            </div>
                            {timeLeft && timeLeft != "" && (
                                <div className="space-y-2">
                                    <h4 className="font-medium flex items-center gap-2 text-slate-700">
                                        <Timer className="w-4 h-4 text-purple-600" />
                                        Starts in
                                    </h4>
                                    <p className="text-slate-600">{timeLeft}</p>
                                </div>
                            )}
                            {endTimeLeft && endTimeLeft != "" && (
                                <div className="space-y-2">
                                    <h4 className="font-medium flex items-center gap-2 text-slate-700">
                                        <Timer className="w-4 h-4 text-purple-600" />
                                        Ends in
                                    </h4>
                                    <p className="text-slate-600">
                                        {endTimeLeft}
                                    </p>
                                </div>
                            )}

                            {isDashboard && (
                                <div className="space-y-2">
                                    <h4 className="font-medium flex items-center gap-2 text-slate-700">
                                        <Users className="w-4 h-4 text-purple-600" />
                                        Registered Users
                                    </h4>
                                    <p className="text-slate-600">
                                        {contest.registered_users}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Admin-specific content */}
                        {isDashboard && (
                            <>
                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-purple-600" />
                                        Administrative Details
                                    </h3>
                                    <div className="grid md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                                        <div className="space-y-1">
                                            <h4 className="text-sm text-slate-500">Created By</h4>
                                            <p className="text-slate-700">{contest.created_by}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-sm text-slate-500">Created At</h4>
                                            <p className="text-slate-700">
                                                {format(new Date(contest.created_at), "PPp")}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <LeaderboardCard leaderboardUsers={mockLeaderboardUsers} />
                                </div>

                                {/* Problems Table - existing admin table code */}
                                <div>
                                    <h3 className="text-lg font-semibold">
                                        Problems
                                    </h3>
                                    <div className="border rounded-lg">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[50px]">
                                                        S.No
                                                    </TableHead>
                                                    <TableHead>Title</TableHead>
                                                    <TableHead>
                                                        Difficulty
                                                    </TableHead>
                                                    <TableHead>
                                                        Acceptance
                                                    </TableHead>
                                                    <TableHead>Tags</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {problems.map(
                                                    (problem, index) => (
                                                        <TableRow
                                                            key={problem.id}
                                                        >
                                                            <TableCell>
                                                                {index + 1}
                                                            </TableCell>
                                                            <TableCell className="font-medium hover:text-primary cursor-pointer">
                                                                {problem.title}
                                                            </TableCell>
                                                            <TableCell
                                                                className={
                                                                    problem.difficulty ===
                                                                    "easy"
                                                                        ? "text-green-500"
                                                                        : problem.difficulty ===
                                                                          "medium"
                                                                        ? "text-yellow-500"
                                                                        : "text-red-500"
                                                                }
                                                            >
                                                                {problem.difficulty
                                                                    .charAt(0)
                                                                    .toUpperCase() +
                                                                    problem.difficulty.slice(
                                                                        1
                                                                    )}
                                                            </TableCell>
                                                            <TableCell>
                                                                {
                                                                    problem.acceptance
                                                                }
                                                                %
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex gap-1 flex-wrap">
                                                                    {problem.tags.map(
                                                                        (
                                                                            tag
                                                                        ) => (
                                                                            <Badge
                                                                                key={
                                                                                    tag
                                                                                }
                                                                                variant="secondary"
                                                                                className="cursor-pointer"
                                                                            >
                                                                                {
                                                                                    tag
                                                                                }
                                                                            </Badge>
                                                                        )
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>

                                {/* Admin Actions */}
                                <div className="flex gap-4">
                                    <Button
                                        onClick={() => navigate(`update`)}
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600"
                                    >
                                        Update Contest
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={handleDeleteContest}
                                        className="flex-1"
                                    >
                                        Delete Contest
                                    </Button>
                                </div>
                            </>
                        )}

                        {/* User-specific content */}
                        {!isDashboard && (
                            <div className="space-y-4">
                                {contest.is_registered ? (
                                    <Button
                                        onClick={() =>
                                            navigate(
                                                `/contests/${contest_id}/problems`
                                            )
                                        }
                                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                                        disabled={
                                            !getContestStatus() ||
                                            getContestStatus() ===
                                                "completed" ||
                                            getContestStatus() === "upcoming"
                                        }
                                    >
                                        {timeLeft ? (
                                            <>
                                                <Timer className="w-4 h-4 mr-2" />
                                                Starts in {timeLeft}
                                            </>
                                        ) : (
                                            <>
                                                <Play className="w-4 h-4 mr-2" />
                                                Start Contest
                                            </>
                                        )}
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleRegisterToContest}
                                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                                        disabled={
                                            !contest.is_registration_open ||
                                            getContestStatus() === "completed"
                                        }
                                    >
                                        <Users className="w-4 h-4 mr-2" />
                                        {contest.is_registration_open
                                            ? "Register Now"
                                            : "Registration Closed"}
                                    </Button>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
