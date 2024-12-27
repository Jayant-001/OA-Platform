import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Contest, Problem, User } from "@/types";
import { DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { userColumns } from "./admin/columns/userColumns"; // Add this import
import toast from "react-hot-toast";
import { useAdminApi, useUsersApi } from "@/hooks/useApi";
import { Navbar } from "@/components/layout/Navbar";

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

const dummyUsers: User[] = [
    {
        id: "57fe641a-f251-4fc5-9217-f43ced9dd982",
        email: "user1@example.com",
        name: "User One",
        role: "user",
    },
    {
        id: "c6f9a1d6-c04d-443c-b7a2-d1e3f1342c4a",
        email: "user2@example.com",
        name: "User Two",
        role: "user",
    },
    {
        id: "dd149bdc-478f-4fd7-abcd-a364866df5a2",
        email: "user3@example.com",
        name: "User Three",
        role: "user",
    },
];

export function ContestDetailPage() {
    const { contest_id } = useParams();
    const navigate = useNavigate();
    const [contest, setContest] = useState<Contest | null>(null);
    const [problems, setProblems] = useState<Problem[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState<string | null>(null);

    const location = useLocation();
    const isDashboard = location.pathname.includes("/dashboard/");
    const { fetchContestById, deleteContestById } = useAdminApi();
    const { fetchContestById: fetchUserContestById } = useUsersApi();

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
                    setUsers(dummyUsers);
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
                        (distance % (1000 * 60 * 60 * 24)) /
                            (1000 * 60 * 60)
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
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="container mx-auto py-8">
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {contest.title}{" "}
                            {isDashboard && `| ${contest.contest_code}`}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold">
                                Description
                            </h3>
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: contest.description,
                                }}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-semibold">Start Time</h3>
                                <p>
                                    {new Date(
                                        contest.start_time
                                    ).toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold">Duration</h3>
                                <p>{contest.duration} minutes</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-semibold">Join Duration</h3>
                                <p>{contest.join_duration} minutes</p>
                            </div>
                            <div>
                                <h3 className="font-semibold">Strict Time</h3>
                                <p>{contest.strict_time ? "Yes" : "No"}</p>
                            </div>
                        </div>
                        {isDashboard && (
                            <div className="grid grid-cols-2 gap-4">
                                Created By: {contest.created_by}
                            </div>
                        )}

                        {isDashboard && (
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
                                            {problems.map((problem, index) => (
                                                <TableRow key={problem.id}>
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
                                                        {problem.acceptance}%
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex gap-1 flex-wrap">
                                                            {problem.tags.map(
                                                                (tag) => (
                                                                    <Badge
                                                                        key={
                                                                            tag
                                                                        }
                                                                        variant="secondary"
                                                                        className="cursor-pointer"
                                                                    >
                                                                        {tag}
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
                            </div>
                        )}

                        {isDashboard && (
                            <div>
                                <h3 className="text-lg font-semibold">Users</h3>
                                <DataTable
                                    columns={userColumns}
                                    data={users}
                                    selectedRows={[]}
                                    setSelectedRows={() => {}}
                                />
                            </div>
                        )}

                        {isDashboard ? (
                            <div className="space-y-5">
                                <Button
                                    onClick={() => navigate(`update`)}
                                    className="w-full"
                                >
                                    Update Contest
                                </Button>
                                <Button
                                    variant={"destructive"}
                                    onClick={handleDeleteContest}
                                    className="w-full"
                                >
                                    Delete Contest
                                </Button>
                            </div>
                        ) : (
                            <Button
                                onClick={() =>
                                    navigate(`/contests/${contest_id}/problems`)
                                }
                                className="w-full"
                                disabled={timeLeft === null || timeLeft !== ""}
                            >
                                {timeLeft === null
                                    ? "Loading..."
                                    : timeLeft !== ""
                                    ? `Starts in ${timeLeft}`
                                    : "Join Contest"}
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );

}
