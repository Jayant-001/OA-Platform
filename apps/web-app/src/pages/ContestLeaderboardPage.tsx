import { useState, useEffect, useMemo } from "react";
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
    AlignLeft,
    Cpu,
} from "lucide-react";
import { users } from "@/data";
import { leaderboardApi } from "@/hooks/useApi";
import toast from "react-hot-toast";
import { Skeleton } from "@/components/ui/skeleton";
import CopyToClipboard from "react-copy-to-clipboard";
import { Button } from "@/components/ui/button";
import classNames from "classnames";

// interface Submission {
//     id: string;
//     questionId: string;
//     userId: string;
//     verdict: "Accepted" | "Wrong Answer" | "Time Limit Exceeded";
//     timestamp: string;
// }

interface Submission {
    id: string;
    verdict: 'solved' | 'unSolved' | 'notAttempted' | null;
    code: string;
    language: string;
    execution_time: number;
    memory_used: number;
    submitted_at: string; // ISO 8601 date string
  }

interface SubmissionProblem {
    problemId: string;
    verdict: 'solved' | 'unSolved' | 'notAttempted' | null;
    noOfAttempts: number;
    acceptedTime: string | null;
}

interface UserSubmission {
    userId: string;
    userName: string;
    rank: number;
    problems: SubmissionProblem[];
    totalPoints: number;
    finishTime: string;
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
    const { contest_id: contestId } = useParams();
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(5);
    const [submissionsPerPage] = useState(10);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [selectedQuestion, setSelectedQuestion] = useState<string | null>(
        null
    );
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [paginatedUsers, setPaginatedUsers] = useState(
        users.slice(0, usersPerPage)
    );
    const [leaderboardData, setLeaderboardData] = useState<UserSubmission[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { getContestLeaderboard, getUserSubmissionForLeaderboard } = leaderboardApi();
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null> (null);

    const fetchLeaderboard = async (contestId: string) => {
        try {
            setIsLoading(true);
            const leaderboard = await getContestLeaderboard(contestId);
            setLeaderboardData(leaderboard.data);
        } catch (error) {
            console.log(error);
            toast.error("Failed to fetch leaderboard data");
        }
        finally {
            setIsLoading(false);
        }
    };

    

    useEffect(() => {
        if(contestId) {

            fetchLeaderboard(contestId as string);
        }
    }, [contestId]);

    useEffect(() => {
        // Simulate API call for pagination
        const fetchUsers = async () => {
            const startIndex = (currentPage - 1) * usersPerPage;
            const endIndex = startIndex + usersPerPage;
            setPaginatedUsers(users.slice(startIndex, endIndex));
        };

        fetchUsers();
    }, [currentPage, usersPerPage]);

    const handleCellClick = async (userId: string, questionId: string) => {
        // console.log(userId, questionId);
        // return;
        try {
            const data = await getUserSubmissionForLeaderboard(contestId as string, questionId, userId);
            setSelectedSubmission(data);
        } catch (error) {
            console.log(error);
            toast.error("Failed to fetch user's submission")
        }
        // setSelectedUser(userId);
        // setSelectedQuestion(questionId);
        setIsModalOpen(true);
    };

    const verdictClass = useMemo(
            () => ({
                solved: "text-green-500",
                unsolved: "text-red-500",
                notAttempted: "text-amber-600",
                Unknown: "text-gray-500",
            }),
            []
        );

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

    // Helper function to get problem verdict display
    const getProblemVerdict = (problem: SubmissionProblem) => {
        if (problem.verdict === 'solved') {
            return (
                <div className="flex items-center justify-center gap-1">
                    <span className="text-slate-600">{problem.noOfAttempts}</span>
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                </div>
            );
        }
        if (problem.verdict === 'unSolved' && problem.noOfAttempts > 0) {
            return (
                <div className="flex items-center justify-center gap-1">
                    <span className="text-slate-600">{problem.noOfAttempts}</span>
                    <XCircle className="w-4 h-4 text-red-500" />
                </div>
            );
        }
        return null;
    };

    // Get total number of problems from first submission
    const totalProblems = leaderboardData[0]?.problems.length || 0;

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
                        Track real-time rankings and performance metrics of all
                        participants
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
                                            Name
                                        </span>
                                    </TableHead>
                                    {Array.from({ length: totalProblems }, (_, index) => (
                                        <TableHead key={index} className="text-center w-24">
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
                                {isLoading ? <TableSkeleton /> : leaderboardData.map((user, index) => (
                                    <TableRow key={user.userId} className="hover:bg-slate-50/50">
                                        <TableCell className="font-medium">
                                            {user.rank}
                                        </TableCell>
                                        <TableCell>{user.userName}</TableCell>
                                        {user.problems.map((problem, problemIndex) => (
                                            <TableCell
                                                key={problem.problemId}
                                                className="text-center cursor-pointer hover:bg-slate-100 transition-colors"
                                                onClick={() => handleCellClick(user.userId, problem.problemId)}
                                            >
                                                {getProblemVerdict(problem)}
                                            </TableCell>
                                        ))}
                                        <TableCell className="text-right font-semibold">
                                            {user.totalPoints}
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            {user.finishTime}
                                        </TableCell>
                                    </TableRow>
                                ))}
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
                                {selectedSubmission && 
                                    // <Card
                                    //     key={selectedSubmission.id}
                                    //     className="overflow-hidden"
                                    // >
                                    //     <div className="p-4 flex justify-between items-center gap-4">
                                    //         <div className="space-y-1">
                                    //             <div className="flex items-center gap-2">
                                    //                 {selectedSubmission.verdict ===
                                    //                 "Accepted" ? (
                                    //                     <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    //                 ) : selectedSubmission.verdict ===
                                    //                   "Wrong Answer" ? (
                                    //                     <XCircle className="w-4 h-4 text-red-500" />
                                    //                 ) : (
                                    //                     <AlertTriangle className="w-4 h-4 text-yellow-500" />
                                    //                 )}
                                    //                 <span
                                    //                     className={`font-medium ${
                                    //                         selectedSubmission.verdict ===
                                    //                         "Accepted"
                                    //                             ? "text-green-600"
                                    //                             : selectedSubmission.verdict ===
                                    //                               "Wrong Answer"
                                    //                             ? "text-red-600"
                                    //                             : "text-yellow-600"
                                    //                     }`}
                                    //                 >
                                    //                     {selectedSubmission.verdict}
                                    //                 </span>
                                    //             </div>
                                    //             <div className="flex items-center gap-2 text-sm text-slate-500">
                                    //                 <Clock className="w-4 h-4" />
                                    //                 <span>
                                    //                     {selectedSubmission.submitted_at}
                                    //                 </span>
                                    //             </div>
                                    //         </div>
                                    //         <Badge
                                    //             variant="outline"
                                    //             className="bg-slate-50"
                                    //         >
                                    //             {selectedSubmission.id}
                                    //         </Badge>
                                    //     </div>
                                    // </Card>
                                    <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                                    <div className="space-y-1">
                                        <label className="text-sm text-slate-500">
                                            Status
                                        </label>
                                        <p
                                            className={classNames(
                                                "font-semibold",
                                                verdictClass[
                                                    selectedSubmission.verdict ||
                                                        "Unknown"
                                                ]
                                            )}
                                        >
                                            {selectedSubmission.verdict?.replace(
                                                /_/g,
                                                " "
                                            ).replace(/\b\w/g, char => char.toUpperCase()) || "Unknown"}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm text-slate-500">
                                            Language
                                        </label>
                                        <p className="font-semibold">
                                            {selectedSubmission.language?.replace(/\b\w/g, char => char.toUpperCase())}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm text-slate-500">
                                            <Clock className="w-4 h-4 inline mr-1" />
                                            Execution Time
                                        </label>
                                        <p className="font-mono">
                                            {selectedSubmission.execution_time}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm text-slate-500">
                                            <Cpu className="w-4 h-4 inline mr-1" />
                                            Memory Used
                                        </label>
                                        <p className="font-mono">
                                            {selectedSubmission.memory_used}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-medium flex items-center gap-2">
                                            <AlignLeft className="w-4 h-4" />
                                            Submitted Code
                                        </label>
                                        <CopyToClipboard
                                            text={selectedSubmission.code}
                                        >
                                            <Button variant="outline" size="sm">
                                                Copy Code
                                            </Button>
                                        </CopyToClipboard>
                                    </div>
                                    <div className="relative rounded-lg overflow-hidden">
                                        <pre className="p-4 bg-slate-900 text-slate-50 overflow-x-auto max-h-[60vh]">
                                            <code className="text-sm font-mono">
                                                {selectedSubmission.code}
                                            </code>
                                        </pre>
                                    </div>
                                </div>
                            </div>
                                }
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


const TableSkeleton = () => {
    const totalProblems = 10;
    return (
    //     <div className="space-y-4">
    //     {/* Loop for skeleton loaders */}
    //     {Array(5).fill(0).map((_, index) => (
    //       <Card key={index} className="overflow-hidden animate-pulse">
    //         <div className="p-4 flex justify-between items-center gap-4">
    //           <div className="space-y-1">
    //             <div className="flex items-center gap-2">
    //               <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
    //               <div className="w-24 h-4 bg-gray-300 rounded"></div>
    //             </div>
    //             <div className="flex items-center gap-2 text-sm text-slate-500">
    //               <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
    //               <div className="w-16 h-4 bg-gray-300 rounded"></div>
    //             </div>
    //           </div>
    //           <div className="w-24 h-8 bg-gray-300 rounded-md"></div>
    //         </div>
    //       </Card>
    //     ))}
    //   </div>
        <>
        {Array.from({ length: 10 }).map((_, index) => (
          <TableRow key={index} className="hover:bg-slate-50/50">
            <TableCell className="font-medium">
              <Skeleton className="h-4 w-8" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-3" />
            </TableCell>
            {Array.from({ length: totalProblems }).map((_, problemIndex) => (
              <TableCell key={problemIndex} className="text-center">
                <Skeleton className="h-4 w-8 mx-auto" />
              </TableCell>
            ))}
            <TableCell className="text-right">
              <Skeleton className="h-4 w-1 ml-auto" />
            </TableCell>
            <TableCell className="text-right">
              <Skeleton className="h-4 w-2 ml-auto" />
            </TableCell>
          </TableRow>
        ))}
      </>
    );
  };