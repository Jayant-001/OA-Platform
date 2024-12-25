import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Contest, Problem, User } from "@/types";
import { DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { userColumns } from "./admin/columns/userColumns"; // Add this import

const dummyContest = {
    id: "a8bab1e6-09a3-459d-8027-a57e4eb131e9",
    title: "DP Contest updated by mirdul",
    description: "<h1><span style=\"color: rgb(230, 0, 0);\">About the Contest Updated</span></h1><p>This is an unofficial contest to practice DP (Dynamic Programming). We selected 26 DPs, mostly basic ones, and prepared a problem to learn each of them. Test your skills during the real contest, and brush them up after it ends.</p><p><br></p><h3><strong>Details</strong></h3><ol><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Time (YY-MM-DD): 2019-01-06(Sun) 11:00-16:00 UTC (postponed)</li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Duration: 5 hours</li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Number of Tasks: 26</li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Point Values: 100 points each</li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Rated: No</li></ol><p><br></p><h3><strong>Rules</strong></h3><p>The rules for ABC, ARC and AGC apply. The important points are:</p><p><br></p><ol><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>This is an individual match; no teams allowed.</li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Revealing the solutions to others during the contest is prohibited.</li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>The penalty for an incorrect submission is 5 minutes.</li></ol><p><br></p><h3><strong>Notices</strong></h3><ol><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>The problems may NOT be arranged in ascending order of difficulty.</li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>There are many famous problems.</li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>The contest is not intended for experts such as reds (anyone can compete, though).</li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>It is recommended to use languages that are not too slow (such as C++ and Java).</li></ol><p><br></p><h3><strong>Staff</strong></h3><ol><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Problems written by: sugim48</li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Tested by: asi1024, camypaper</li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Translated by: evima</li></ol>",
    duration: 1000,
    start_time: "2024-12-24T12:35:00.000Z",
    contest_code: "DP_CONTEST_update_bymridul",
    join_duration: 100,
    strict_time: true,
    created_by: "544d4a2e-305e-4354-aa62-2d5081da40b0",
    created_at: "2024-12-24T04:26:52.227Z",
    updated_at: "2024-12-24T01:30:44.887Z",
    problems: [
        {
            problem_id: "55c18fb1-72b6-478e-84ed-f3e180cd0261",
            points: 10
        },
        {
            problem_id: "b3a7eaf8-cbf1-47a1-b9a3-a8d4350c0800",
            points: 123
        }
    ],
    users: [
        "57fe641a-f251-4fc5-9217-f43ced9dd982",
        "c6f9a1d6-c04d-443c-b7a2-d1e3f1342c4a",
        "dd149bdc-478f-4fd7-abcd-a364866df5a2"
    ]
};

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
        tags: ["Array", "Hash Table"]
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
        tags: ["Greedy"]
    }
];

const dummyUsers: User[] = [
    {
        id: "57fe641a-f251-4fc5-9217-f43ced9dd982",
        email: "user1@example.com",
        name: "User One",
        role: "user"
    },
    {
        id: "c6f9a1d6-c04d-443c-b7a2-d1e3f1342c4a",
        email: "user2@example.com",
        name: "User Two",
        role: "user"
    },
    {
        id: "dd149bdc-478f-4fd7-abcd-a364866df5a2",
        email: "user3@example.com",
        name: "User Three",
        role: "user"
    }
];

export function ContestDetailPage() {
    const { contest_id } = useParams();
    const navigate = useNavigate();
    const [contest, setContest] = useState<Contest | null>(null);
    const [problems, setProblems] = useState<Problem[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const location = useLocation();
    const isDashboard = location.pathname.includes("/dashboard/");

    useEffect(() => {
        if (contest_id) {
            setTimeout(() => {
                setContest(dummyContest);
                setProblems(dummyProblems);
                setUsers(dummyUsers);
                setLoading(false);
            }, 1000);
        }
    }, [contest_id]);

    if (loading) {
        return (
            <div className="container mx-auto py-8">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-1/2" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!contest) return <div>Loading...</div>;

    return (
        <div className="container mx-auto py-8">
            <Card>
                <CardHeader>
                    <CardTitle>{contest.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold">Description</h3>
                        <div dangerouslySetInnerHTML={{ __html: contest.description }} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h3 className="font-semibold">Start Time</h3>
                            <p>{new Date(contest.start_time).toLocaleString()}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold">Duration</h3>
                            <p>{contest.duration} minutes</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold">Problems</h3>
                        <div className="border rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">S.No</TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Difficulty</TableHead>
                                        <TableHead>Acceptance</TableHead>
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
                                                    problem.difficulty === "easy"
                                                        ? "text-green-500"
                                                        : problem.difficulty === "medium"
                                                        ? "text-yellow-500"
                                                        : "text-red-500"
                                                }
                                            >
                                                {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                                            </TableCell>
                                            <TableCell>
                                                {problem.acceptance}%
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1 flex-wrap">
                                                    {problem.tags.map((tag) => (
                                                        <Badge
                                                            key={tag}
                                                            variant="secondary"
                                                            className="cursor-pointer"
                                                        >
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold">Users</h3>
                        <DataTable
                            columns={userColumns}
                            data={users}
                            selectedRows={[]}
                            setSelectedRows={() => {}}
                        />
                    </div>

                    {isDashboard ? (
                        <div className="space-y-5">
                            <Button
                                onClick={() =>
                                    navigate(`/contests/${contest_id}/update`)
                                }
                                className="w-full"
                            >
                                Update Contest
                            </Button>
                            <Button
                                variant={"destructive"}
                                onClick={() => {
                                    // Delete contest api call
                                }}
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
                        >
                            Join Contest
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
