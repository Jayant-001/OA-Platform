import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdminContestProblem, Contest, LeaderboardUser } from "@/types";
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
import { adminContestApi, leaderboardApi, useAdminApi } from "@/hooks/useApi";
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
    Shield,
    Book,
    BarChart2,
    CheckCircle2,
    Tag,
    Hash,
} from "lucide-react";
import { LeaderboardCard } from "@/components/LeaderboardCard";
import { LoadingPage } from "@/components/LoadingPage";
import LoadingPageWithNavbar from "@/components/LoadingPageWithNavbar";

export function AdminContestDetailPage() {
    const { contest_id } = useParams();
    const navigate = useNavigate();
    const [contest, setContest] = useState<Contest | null>(null);
    const [problems, setProblems] = useState<AdminContestProblem[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState<string | null>(null);
    const [endTimeLeft, setEndTimeLeft] = useState<string | null>(null);

    const { fetchContestById, deleteContestById } = useAdminApi();
    const { getContestProblemsForAdmin } = adminContestApi();
    const { getContestLeaderboard } = leaderboardApi();
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>(
        []
    );

    const fetchContestLeaderboard = async (contestId: string) => {
        try {
            const data = await getContestLeaderboard(contestId, 5, 1);
            const modelData = data?.data?.map((e) => ({
                id: e.userId,
                name: e.userName,
                rank: e.rank,
                finishTime: e.finishTime,
                score: e.totalPoints,
            }));
            setLeaderboardData(modelData);
        } catch (error) {
            console.log(error);
            toast.error("Failed to fetch contest leaderboard");
        }
    };

    const fetchContestProblems = async (contestId: string) => {
        try {
            const data = await getContestProblemsForAdmin(contestId);
            setProblems(data);
        } catch (error) {
            console.log(error);
            toast.error("Failed to fetch contest problems");
        }
    };

    const fetchContestDetails = async (contestId: string) => {
        try {
            const data = await fetchContestById(contestId);
            setContest(data);
        } catch (error) {
            console.log(error);
            toast.error("Failed to fetch contest details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (contest_id) {
            fetchContestProblems(contest_id);
            fetchContestDetails(contest_id);
            fetchContestLeaderboard(contest_id);
        } else {
            toast.error("Contest id not found");
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

    const handleDeleteContest = async (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
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
            console.log(error);
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

    if(loading) {
        return <LoadingPageWithNavbar />
    }

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

    if (!contest) return <LoadingPage />;

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
                                <p className="text-slate-600 flex items-center gap-2">
                                    <Trophy className="w-4 h-4" />
                                    Contest Code: {contest.contest_code}
                                </p>
                            </div>
                            {getStatusBadge()}
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-8">
                        {/* Common Content */}
                        <div className="max-w-none">
                            <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-purple-600" />
                                Description
                            </h3>
                            <div
                                className="prose lg:prose-xl"
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

                            <div className="space-y-2">
                                <h4 className="font-medium flex items-center gap-2 text-slate-700">
                                    <Users className="w-4 h-4 text-purple-600" />
                                    Registered Users
                                </h4>
                                <p className="text-slate-600">
                                    {contest.registered_users}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold flex items-center gap-2">
                                <Shield className="w-5 h-5 text-purple-600" />
                                Administrative Details
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                                <div className="space-y-1">
                                    <h4 className="text-sm text-slate-500">
                                        Created By
                                    </h4>
                                    <p className="text-slate-700">
                                        {contest.created_by}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-sm text-slate-500">
                                        Created At
                                    </h4>
                                    <p className="text-slate-700">
                                        {format(
                                            new Date(contest.created_at),
                                            "PPp"
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <LeaderboardCard
                                leaderboardUsers={leaderboardData}
                            />
                        </div>

                        <Button
                            onClick={() => navigate(`activities`)}
                            className="w-full bg-gradient-to-r from-purple-500 to-blue-500"
                        >
                            Monitor User's Activities
                        </Button>

                        {/* Problems Section */}
                        <div>
                            <h3 className="text-xl font-semibold flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-purple-600" />
                                Contest Problems
                            </h3>
                            <Card className="mt-4 backdrop-blur-sm bg-white/90 border-slate-200/60 shadow-lg">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-slate-50">
                                            <TableRow>
                                                <TableHead className="w-5">
                                                    <span className="flex items-center gap-2">
                                                        <Hash className="w-4 h-4 text-purple-600" />
                                                    </span>
                                                </TableHead>
                                                <TableHead>
                                                    <span className="flex items-center gap-2">
                                                        <Book className="w-4 h-4 text-purple-600" />
                                                        Title
                                                    </span>
                                                </TableHead>
                                                <TableHead className="w-32">
                                                    <span className="flex items-center gap-2">
                                                        <BarChart2 className="w-4 h-4 text-purple-600" />
                                                        Difficulty
                                                    </span>
                                                </TableHead>
                                                <TableHead className="w-32">
                                                    <span className="flex items-center gap-2">
                                                        <CheckCircle2 className="w-4 h-4 text-purple-600" />
                                                        Acceptance
                                                    </span>
                                                </TableHead>
                                                <TableHead>
                                                    <span className="flex items-center gap-2">
                                                        <Tag className="w-4 h-4 text-purple-600" />
                                                        Tags
                                                    </span>
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {problems.map((problem, index) => (
                                                <TableRow
                                                    key={problem.id}
                                                    className="hover:bg-slate-50/50"
                                                >
                                                    <TableCell className="font-medium">
                                                        {String.fromCharCode(
                                                            65 + index
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="font-medium text-slate-900 hover:text-purple-600 cursor-pointer">
                                                            {problem.title}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant="outline"
                                                            className={`${
                                                                problem.level ===
                                                                "easy"
                                                                    ? "bg-green-50 text-green-700 border-green-200"
                                                                    : problem.level ===
                                                                      "medium"
                                                                    ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                                                    : "bg-red-50 text-red-700 border-red-200"
                                                            }`}
                                                        >
                                                            {problem.level
                                                                .charAt(0)
                                                                .toUpperCase() +
                                                                problem.level.slice(
                                                                    1
                                                                )}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-slate-600">
                                                            10%
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex gap-1 flex-wrap">
                                                            {problem.tags.map(
                                                                (tag) => (
                                                                    <Badge
                                                                        key={
                                                                            tag.id
                                                                        }
                                                                        variant="secondary"
                                                                        className="bg-slate-100 text-slate-700"
                                                                    >
                                                                        {
                                                                            tag.name
                                                                        }
                                                                    </Badge>
                                                                )
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </Card>
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
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
