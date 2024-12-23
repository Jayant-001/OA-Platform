import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { users, problems } from "@/data";

interface Submission {
    id: string;
    questionId: string;
    userId: string;
    verdict: "Accepted" | "Wrong Answer" | "Time Limit Exceeded";
    timestamp: string;
}

const mockSubmissions: Submission[] = [
    {
        id: "1",
        questionId: "1",
        userId: "1",
        verdict: "Accepted",
        timestamp: "01:-5:00",
    },
    {
        id: "2",
        questionId: "1",
        userId: "1",
        verdict: "Wrong Answer",
        timestamp: "2:05:00",
    },
    {
        id: "3",
        questionId: "2",
        userId: "1",
        verdict: "Accepted",
        timestamp: "0:40:00",
    },
    {
        id: "4",
        questionId: "2",
        userId: "2",
        verdict: "Time Limit Exceeded",
        timestamp: ".4:15:00",
    },
    // Add more mock submissions data here
];

export function ContestLeaderboardPage() {
    const { id: contestId } = useParams();
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(5);
    const [submissionsPerPage] = useState(10);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [selectedQuestion, setSelectedQuestion] = useState<string | null>(
        null
    );
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [paginatedUsers, setPaginatedUsers] = useState(users.slice(0, usersPerPage));

    useEffect(() => {
        // Simulate API call for pagination
        const fetchUsers = async () => {
            const startIndex = (currentPage - 1) * usersPerPage;
            const endIndex = startIndex + usersPerPage;
            setPaginatedUsers(users.slice(startIndex, endIndex));
        };

        fetchUsers();
    }, [currentPage, usersPerPage]);

    const handleCellClick = (userId: string, questionId: string) => {
        setSelectedUser(userId);
        setSelectedQuestion(questionId);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
        setSelectedQuestion(null);
    };

    const filteredSubmissions = mockSubmissions.filter(
        (submission) =>
            submission.userId === selectedUser &&
            submission.questionId === selectedQuestion
    );

    const indexOfLastSubmission = currentPage * submissionsPerPage;
    const indexOfFirstSubmission = indexOfLastSubmission - submissionsPerPage;
    const currentSubmissions = filteredSubmissions.slice(
        indexOfFirstSubmission,
        indexOfLastSubmission
    );

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    const truncateProblemName = (name: string) => {
        return name.length > 15 ? `${name.slice(0, 15)}...` : name;
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Contest Leaderboard</h1>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Rank</TableHead>
                                <TableHead>Username</TableHead>
                                {problems.slice(0, 4).map((problem) => (
                                    <TableHead key={problem.id}>
                                        {truncateProblemName(problem.title)}
                                    </TableHead>
                                ))}
                                <TableHead>Total Score</TableHead>
                                <TableHead>Finish Time</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedUsers.map((user, index) => {
                                let totalScore = 0;
                                let finishTime = "";
                                return (
                                    <TableRow key={user.id}>
                                        <TableCell>{(currentPage - 1) * usersPerPage + index + 1}</TableCell>
                                        <TableCell>{user.name}</TableCell>
                                        {problems.slice(0, 4).map((problem) => {
                                            const userSubmissions =
                                                mockSubmissions.filter(
                                                    (submission) =>
                                                        submission.userId ===
                                                            user.id &&
                                                        submission.questionId ===
                                                            problem.id
                                                );
                                            const solved = userSubmissions.some(
                                                (submission) =>
                                                    submission.verdict ===
                                                    "Accepted"
                                            );
                                            if (solved) {
                                                totalScore += problem.points;
                                                finishTime =
                                                    userSubmissions.find(
                                                        (submission) =>
                                                            submission.verdict ===
                                                            "Accepted"
                                                    )?.timestamp || "";
                                            }
                                            return (
                                                <TableCell
                                                    key={problem.id}
                                                    className="cursor-pointer"
                                                    onClick={() =>
                                                        handleCellClick(
                                                            user.id,
                                                            problem.id
                                                        )
                                                    }
                                                >
                                                    {userSubmissions.length}{" "}
                                                    {solved ? (
                                                        <span className="text-green-600">
                                                            ✔
                                                        </span>
                                                    ) : (
                                                        <span className="text-red-600">
                                                            ✘
                                                        </span>
                                                    )}
                                                </TableCell>
                                            );
                                        })}
                                        <TableCell>{totalScore}</TableCell>
                                        <TableCell>{finishTime}</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>

                <Pagination
                    itemsPerPage={usersPerPage}
                    totalItems={users.length}
                    paginate={paginate}
                    currentPage={currentPage}
                />

                <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
                    <h2 className="text-xl font-bold mb-4">Submissions</h2>
                    <div className="space-y-4">
                        {currentSubmissions.map((submission) => (
                            <div
                                key={submission.id}
                                className="border p-4 rounded-md"
                            >
                                <p>
                                    <strong>Verdict:</strong>{" "}
                                    {submission.verdict}
                                </p>
                                <p>
                                    <strong>Timestamp:</strong>{" "}
                                    {submission.timestamp}
                                </p>
                            </div>
                        ))}
                    </div>
                    <Pagination
                        itemsPerPage={submissionsPerPage}
                        totalItems={filteredSubmissions.length}
                        paginate={paginate}
                        currentPage={currentPage}
                    />
                </Modal>
            </main>
        </div>
    );
}
