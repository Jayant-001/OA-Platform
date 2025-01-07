import { useState, useEffect, useMemo } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { Split } from "@geoffcox/react-splitter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Problem, Submission } from "@/types";
import MonacoEditor from "@monaco-editor/react";
import { useAdminApi, useUsersApi, useSubmissionApi } from "@/hooks/useApi";
import toast from "react-hot-toast";
import classNames from "classnames";
import {
    Dialog,
    DialogOverlay,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
    DialogBody,
} from "../components/ui/dialog";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useProblemContext } from "@/context/ProblemContext";
import {
    BookOpen,
    Menu,
    Code as CodeIcon,
    PlayCircle,
    SendHorizonal,
    XCircle,
    Clock,
    Cpu,
    FileCode,
    AlignLeft,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RunConsole from "@/components/problems/RunConsole";
import { useLongRunningTask } from "@/hooks/useRunCodePool";

export function ProblemDescriptionPage() {
    const { problem_id: problemId, contest_id } = useParams();
    const location = useLocation();
    const [problem, setProblem] = useState<Problem | null>(null);
    const [language, setLanguage] = useState("javascript");
    const [code, setCode] = useState("");
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [isConsoleCollapsed, setIsConsoleCollapsed] = useState(false);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [selectedSubmission, setSelectedSubmission] =
        useState<Submission | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { fetchProblemById } = useAdminApi();
    const { getContestProblemById } = useUsersApi();
    const { getSubmissionsByProblemId, getSubmissionById, createSubmission } =
        useSubmissionApi();
    const { problems } = useProblemContext();
    const isDashboardPage = location.pathname.includes("/dashboard");
    const navigate = useNavigate();
    const [contestEndTime] = useState(
        new Date(Date.now() + 2 * 60 * 60 * 1000)
    ); // 2 hours from now
    const [timeToEnd, setTimeToEnd] = useState<string>("");
    const [consoleSize, setConsoleSize] = useState(30); // default size 30%

    /**
    *
    * ------------------------------------------ Run code pooling ------------------------------------------------
    *
    */
    const { submitTask, requestId, result, isLoading, error, reset } =
        useLongRunningTask();


    useEffect(() => {
        if (!problemId) {
            toast.error("Problem ID not provided");
            return;
        }

        (async () => {
            try {
                let fetched_problem, fetched_submissions;
                if (isDashboardPage) {
                    fetched_problem = await fetchProblemById(problemId);
                } else {
                    fetched_problem = await getContestProblemById(
                        contest_id as string,
                        problemId as string
                    );
                    fetched_submissions = await getSubmissionsByProblemId(
                        contest_id as string,
                        problemId as string
                    );
                }
                setProblem(fetched_problem);
                setSubmissions(fetched_submissions);
            } catch (error) {
                console.log(error);
                toast.error("Failed to fetch problem data");
            }
        })();
    }, [problemId, contest_id, isDashboardPage]);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            if (now >= contestEndTime) {
                setTimeToEnd("Contest Ended");
                clearInterval(interval);
                return;
            }

            const hours = Math.floor(
                (contestEndTime.getTime() - now.getTime()) / (1000 * 60 * 60)
            );
            const minutes = Math.floor(
                ((contestEndTime.getTime() - now.getTime()) %
                    (1000 * 60 * 60)) /
                    (1000 * 60)
            );
            const seconds = Math.floor(
                ((contestEndTime.getTime() - now.getTime()) % (1000 * 60)) /
                    1000
            );

            setTimeToEnd(
                `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
                    .toString()
                    .padStart(2, "0")}`
            );
        }, 1000);

        return () => clearInterval(interval);
    }, [contestEndTime]);

    const handleRun = () => {
        // Handle running code
        console.log("Running code")
        setOutput("Running code...");
    };

    const handleSubmit = async () => {
        setOutput("Submitting solution...");
        try {
            await createSubmission({
                code,
                language,
                problemId: problemId || "",
                contestId: contest_id || "",
            });
            setOutput("Submission successful!");
            toast.success("Submission successful!");
        } catch (error) {
            console.log(error);
            setOutput("Submission failed.");
            toast.error("Submission failed.");
        }
    };

    const verdictClass = useMemo(
        () => ({
            accepted: "text-green-500",
            wrong_answer: "text-red-500",
            time_limit_exceeded: "text-yellow-500",
            memory_limit_exceeded: "text-purple-500",
            default: "text-gray-500",
        }),
        []
    );

    const handleProblemClick = (id: string) => {
        if (id !== problemId) {
            console.log("Problem ID Switched To:", id);
            navigate(`/contests/${contest_id}/problems/${id}/solve`);
            setIsSidebarOpen(false);
        }
    };

    const handleSubmissionClick = async (submissionId: string) => {
        try {
            const submission = await getSubmissionById(submissionId);
            setSelectedSubmission(submission);
        } catch (error) {
            console.log(error);
            toast.error("Failed to fetch submission details");
        }
    };

    if (!problem) return <div>Loading...</div>;

    return (
        <div className="h-screen flex overflow-hidden">
            {/* Problems List Drawer - Floating */}
            <div
                className={`fixed top-4 ${
                    isSidebarOpen ? "left-4" : "left-0"
                } z-50 transition-transform duration-300 ease-in-out ${
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <Card className="w-72 shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between py-3">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-purple-600" />
                            Problems
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsSidebarOpen(false)}
                            className="hover:bg-slate-100"
                        >
                            <XCircle className="w-5 h-5" />
                        </Button>
                    </CardHeader>
                    <CardContent className="px-2 py-2">
                        <div className="space-y-1">
                            {problems.map((prob, index) => (
                                <button
                                    key={prob.id}
                                    onClick={() => handleProblemClick(prob.id)}
                                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                                        prob.id === problemId
                                            ? "bg-purple-100 text-purple-700"
                                            : "hover:bg-slate-100"
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">
                                            {String.fromCharCode(65 + index)}
                                        </span>
                                        <span className="truncate">
                                            {prob.title}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <div className="flex-grow flex flex-col h-screen">
                {/* Top Bar */}
                <div className="bg-white border-b px-4 py-2 flex items-center justify-between">
                    <Button
                        title="Toggle Problems List"
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsSidebarOpen(true)}
                        className="hover:bg-slate-100"
                    >
                        <Menu className="w-5 h-5" />
                    </Button>

                    {/* Contest Timer */}
                    <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full">
                        <Clock className="w-4 h-4 text-purple-600 animate-pulse" />
                        <span className="font-medium text-slate-700">
                            Ends in:
                        </span>
                        <span className="font-mono text-purple-600 font-bold">
                            {timeToEnd}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Select value={language} onValueChange={setLanguage}>
                            <SelectTrigger className="w-[150px] border-slate-200">
                                <CodeIcon className="w-4 h-4 mr-2 text-slate-500" />
                                <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="javascript">
                                    JavaScript
                                </SelectItem>
                                <SelectItem value="python">Python</SelectItem>
                                <SelectItem value="cpp">C++</SelectItem>
                                <SelectItem value="java">Java</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            variant="outline"
                            onClick={handleRun}
                            className="gap-2 border-slate-200 hover:bg-slate-50"
                        >
                            <PlayCircle className="w-4 h-4" />
                            Run
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        >
                            <SendHorizonal className="w-4 h-4" />
                            Submit
                        </Button>
                    </div>
                </div>

                {/* Main Split */}
                <Split
                    className={"h-[calc(100vh-4rem)]"}
                    initialPrimarySize="40%"
                    minPrimarySize="30%"
                    maxPrimarySize="70%"
                >
                    {/* Left Panel - Problem Description */}
                    <div className="h-full overflow-y-auto bg-white p-2">
                        <Tabs defaultValue="description" className="space-y-6">
                            <TabsList>
                                <TabsTrigger value="description">
                                    Description
                                </TabsTrigger>
                                <TabsTrigger value="submissions">
                                    Submissions
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent key={problem.id} value="description">
                                <h1 className="text-2xl font-bold mb-4">
                                    {problem.title}
                                </h1>
                                <div
                                    className="prose max-w-none"
                                    dangerouslySetInnerHTML={{
                                        __html: problem.problem_statement,
                                    }}
                                />

                                <h3 className="text-lg font-semibold mt-6 mb-2">
                                    Examples
                                </h3>
                                <div
                                    className="prose max-w-none"
                                    dangerouslySetInnerHTML={{
                                        __html: problem.example,
                                    }}
                                />

                                <h3 className="text-lg font-semibold mt-6 mb-2">
                                    Constraints
                                </h3>
                                <p>{problem.constraints}</p>
                            </TabsContent>

                            <TabsContent value="submissions">
                                <div className="space-y-4">
                                    {submissions.length === 0 ? (
                                        <p>No submissions yet</p>
                                    ) : (
                                        submissions.map((submission) => (
                                            <div
                                                key={submission.id}
                                                className="p-4 border rounded-md cursor-pointer hover:bg-gray-100 transition"
                                                onClick={() =>
                                                    handleSubmissionClick(
                                                        submission.id
                                                    )
                                                }
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <span className="font-medium">
                                                            {new Date(
                                                                submission.submitted_at
                                                            ).toLocaleString()}
                                                        </span>
                                                        <div className="text-sm text-gray-500">
                                                            {
                                                                submission.language
                                                            }
                                                        </div>
                                                    </div>
                                                    <span
                                                        className={classNames(
                                                            verdictClass[
                                                                submission.verdict ||
                                                                    "default"
                                                            ],
                                                            "font-semibold"
                                                        )}
                                                    >
                                                        {submission.verdict
                                                            ? submission.verdict.replace(
                                                                  /_/g,
                                                                  " "
                                                              )
                                                            : "No Verdict"}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Right Panel - Editor and Console */}
                    <Split
                        className="h-full"
                        horizontal
                        initialPrimarySize={isConsoleCollapsed ? "92%" : "70%"}
                        primarySize={
                            isConsoleCollapsed ? "92%" : `${100 - consoleSize}%`
                        }
                        minPrimarySize="60%"
                        maxPrimarySize="92%"
                        onDragEnd={(e) => {
                            if (!isConsoleCollapsed) {
                                setConsoleSize(
                                    100 - Number(e.toString().replace("%", ""))
                                );
                            }
                        }}
                    >
                        {/* Editor */}
                        <div className="h-full">
                            <MonacoEditor
                                height="100%"
                                language={language}
                                theme="vs-dark"
                                value={code}
                                onChange={(value) => setCode(value || "")}
                                options={{
                                    minimap: { enabled: false },
                                    scrollBeyondLastLine: false,
                                    fontSize: 14,
                                    lineNumbers: "on",
                                    roundedSelection: false,
                                    scrollbar: {
                                        vertical: "hidden",
                                        horizontal: "hidden",
                                    },
                                }}
                            />
                        </div>

                        {/* Console */}
                        <RunConsole
                            setIsConsoleCollapsed={setIsConsoleCollapsed}
                            isConsoleCollapsed={isConsoleCollapsed}
                            input={input}
                            setInput={setInput}
                        />
                    </Split>
                </Split>
            </div>

            {/* Submission Modal */}
            <Dialog
                isOpen={!!selectedSubmission}
                onClose={() => setSelectedSubmission(null)}
            >
                <DialogOverlay className="backdrop-blur-sm" />
                <DialogContent className="max-w-[90vw] w-[1000px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileCode className="w-5 h-5 text-purple-600" />
                            Submission Details
                        </DialogTitle>
                        <DialogClose
                            onClose={() => setSelectedSubmission(null)}
                        />
                    </DialogHeader>
                    <DialogBody className="max-h-[80vh] overflow-y-auto">
                        {selectedSubmission && (
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
                                                        "default"
                                                ]
                                            )}
                                        >
                                            {selectedSubmission.verdict?.replace(
                                                /_/g,
                                                " "
                                            ) || "Processing"}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm text-slate-500">
                                            Language
                                        </label>
                                        <p className="font-semibold">
                                            {selectedSubmission.language}
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
                        )}
                    </DialogBody>
                </DialogContent>
            </Dialog>
        </div>
    );
}
