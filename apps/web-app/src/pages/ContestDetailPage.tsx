import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Contest } from "@/types";
import toast from "react-hot-toast";
import { useUsersApi } from "@/hooks/useApi";
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
} from "lucide-react";
import { LoadingPage } from "@/components/LoadingPage";
import LoadingPageWithNavbar from "@/components/LoadingPageWithNavbar";

export function ContestDetailPage() {
    const { contest_id } = useParams();
    const navigate = useNavigate();
    const [contest, setContest] = useState<Contest | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState<string | null>(null);
    const [endTimeLeft, setEndTimeLeft] = useState<string | null>(null);

    const { fetchContestById, registerToContest } = useUsersApi();

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
            fetchContestDetails(contest_id);
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

    const handleRegisterToContest = async (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        e.preventDefault();

        if (!contest) {
            toast.error("Can't get contest");
            return;
        }

        try {
            await registerToContest(contest.id);
            window.location.reload();
        } catch (error) {
            console.log(error);
            toast.error("Registration failed. Try again");
        }
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
                        </div>

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
                                        getContestStatus() === "completed" ||
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
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
