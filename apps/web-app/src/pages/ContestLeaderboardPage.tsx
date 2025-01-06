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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogBody,
    DialogOverlay,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import {
    Trophy,
    Medal,
    Clock,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Users,
    Timer,
    ArrowUpRight,
} from "lucide-react";
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
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
                        <Trophy className="w-10 h-10" />
                        Contest Leaderboard
                    </h1>
                    <p className="text-slate-600 max-w-2xl mx-auto">
                        Track real-time rankings and performance metrics of all participants
                    </p>
                </div>

                <Card className="backdrop-blur-sm bg-white/90 border-slate-200/60 shadow-lg">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead className="w-20">
                                        <span className="flex items-center gap-2">
                                            <Medal className="w-4 h-4 text-purple-600" />
                                            Rank
                                        </span>
                                    </TableHead>
                                    <TableHead>
                                        <span className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-purple-600" />
                                            Username
                                        </span>
                                    </TableHead>
                                    {problems.slice(0, 4).map((problem, index) => (
                                        <TableHead key={problem.id} className="text-center">
                                            <span className="flex items-center gap-1 justify-center">
                                                {String.fromCharCode(65 + index)}
                                                <ArrowUpRight className="w-3 h-3" />
                                            </span>
                                        </TableHead>
                                    ))}
                                    <TableHead className="text-right">
                                        <span className="flex items-center gap-2 justify-end">
                                            <Trophy className="w-4 h-4 text-purple-600" />
                                            Total Score
                                        </span>
                                    </TableHead>
                                    <TableHead className="text-right">
                                        <span className="flex items-center gap-2 justify-end">
                                            <Timer className="w-4 h-4 text-purple-600" />
                                            Finish Time
                                        </span>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedUsers.map((user, index) => {
                                    let totalScore = 0;
                                    let finishTime = "";
                                    return (
                                        <TableRow key={user.id} className="hover:bg-slate-50/50">
                                            <TableCell className="font-medium">
                                                {(currentPage - 1) * usersPerPage + index + 1}
                                            </TableCell>
                                            <TableCell>{user.name}</TableCell>
                                            {problems.slice(0, 4).map((problem) => {
                                                const userSubmissions = mockSubmissions.filter(
                                                    (s) => s.userId === user.id && s.questionId === problem.id
                                                );
                                                const solved = userSubmissions.some((s) => s.verdict === "Accepted");
                                                if (solved) {
                                                    totalScore += problem.points;
                                                    finishTime = userSubmissions.find(
                                                        (s) => s.verdict === "Accepted"
                                                    )?.timestamp || "";
                                                }
                                                return (
                                                    <TableCell
                                                        key={problem.id}
                                                        className="text-center cursor-pointer hover:bg-slate-100 transition-colors"
                                                        onClick={() => handleCellClick(user.id, problem.id)}
                                                    >
                                                        <div className="flex items-center justify-center gap-1">
                                                            <span className="text-slate-600">
                                                                {userSubmissions.length}
                                                            </span>
                                                            {solved ? (
                                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                            ) : userSubmissions.length > 0 ? (
                                                                <XCircle className="w-4 h-4 text-red-500" />
                                                            ) : null}
                                                        </div>
                                                    </TableCell>
                                                );
                                            })}
                                            <TableCell className="text-right font-semibold">
                                                {totalScore}
                                            </TableCell>
                                            <TableCell className="text-right font-mono">
                                                {finishTime}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </Card>

                <div className="mt-6">
                    <Pagination
                        itemsPerPage={usersPerPage}
                        totalItems={users.length}
                        paginate={paginate}
                        currentPage={currentPage}
                    />
                </div>

                <Dialog isOpen={isModalOpen} onClose={handleCloseModal}>
                    <DialogOverlay className="backdrop-blur-sm" />
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-purple-600" />
                                Submission History
                            </DialogTitle>
                        </DialogHeader>
                        <DialogBody>
                            <div className="space-y-4">
                                {currentSubmissions.map((submission) => (
                                    <Card key={submission.id} className="overflow-hidden">
                                        <div className="p-4 flex justify-between items-center gap-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    {submission.verdict === "Accepted" ? (
                                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                    ) : submission.verdict === "Wrong Answer" ? (
                                                        <XCircle className="w-4 h-4 text-red-500" />
                                                    ) : (
                                                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                                                    )}
                                                    <span className={`font-medium ${
                                                        submission.verdict === "Accepted"
                                                            ? "text-green-600"
                                                            : submission.verdict === "Wrong Answer"
                                                            ? "text-red-600"
                                                            : "text-yellow-600"
                                                    }`}>
                                                        {submission.verdict}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                                    <Clock className="w-4 h-4" />
                                                    <span>{submission.timestamp}</span>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="bg-slate-50">
                                                {submission.questionId}
                                            </Badge>
                                        </div>
                                    </Card>
                                ))}
                            </div>

                            <div className="mt-4">
                                <Pagination
                                    itemsPerPage={submissionsPerPage}
                                    totalItems={filteredSubmissions.length}
                                    paginate={paginate}
                                    currentPage={currentPage}
                                />
                            </div>
                        </DialogBody>
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    );
}
