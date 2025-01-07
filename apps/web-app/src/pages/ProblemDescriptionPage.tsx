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

import { useProblemContext } from "@/context/ProblemContext";
import {
    BookOpen,
    Menu,
    Code as CodeIcon,
    PlayCircle,
    SendHorizonal,
    XCircle,
    Clock,
    Loader,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RunConsole from "@/components/problems/RunConsole";
import { useLongRunningTask } from "@/hooks/useRunCodePool";
import ContestSubmissions from "@/components/contest/ContestSubmissions";
import { useSubmissionPool } from "@/hooks/useSubmissionPool";

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

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { fetchProblemById } = useAdminApi();
    const { getContestProblemById } = useUsersApi();
    const { createSubmission, getSubmissionsByProblemId } = useSubmissionApi();
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

    const {
        submitTask: submitCode,
        result: submissionResult,
        isLoading: submissionIsLoading,
    } = useSubmissionPool();

    useEffect(() => {
        if (submissionIsLoading == false && submissionResult != null) {
            const updatedSubmissions = submissions.map((sub) => {
                if (sub.id == submissionResult.id) {
                    return submissionResult as Submission;
                }
                return sub;
            });
            setSubmissions(updatedSubmissions);
        }
    }, [submissionIsLoading, submissionResult]);

    useEffect(() => {
        if (!problemId || !contest_id) {
            toast.error("Problem ID not provided");
            return;
        }

        (async () => {
            try {
                let fetched_problem;
                if (isDashboardPage) {
                    fetched_problem = await fetchProblemById(problemId);
                } else {
                    fetched_problem = await getContestProblemById(
                        contest_id as string,
                        problemId as string
                    );
                    const fetched_submissions = await getSubmissionsByProblemId(
                        contest_id as string,
                        problemId as string
                    );

                    setSubmissions(fetched_submissions);
                    setProblem(fetched_problem);
                }
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
        submitTask({ code, language, input });
    };

    const handleSubmit = async () => {
        if (!contest_id || !problemId) {
            toast.error("INvalid contestId or problemId");
            return;
        }

        setOutput("Submitting solution...");
        try {
            const createdSubmission = await submitCode({
                code,
                language,
                contestId: contest_id,
                problemId,
            });

            const new_submisisons = [createdSubmission!, ...submissions];
            setSubmissions(new_submisisons);

            setOutput("Submission successful!");
            toast.success("Submission successful!");
        } catch (error) {
            console.log(error);
            setOutput("Submission failed.");
            toast.error("Submission failed.");
        }
    };

    const handleProblemClick = (id: string) => {
        if (id !== problemId) {
            console.log("Problem ID Switched To:", id);
            navigate(`/contests/${contest_id}/problems/${id}/solve`);
            setIsSidebarOpen(false);
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
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader className="animate-spin w-16 h-16" />
                            ) : (
                                <PlayCircle className="w-4 h-4" />
                            )}
                            Run
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                            disabled={submissionIsLoading}
                        >
                            {submissionIsLoading ? (
                                <Loader className="animate-spin w-16 h-16" />
                            ) : (
                                <SendHorizonal className="w-4 h-4" />
                            )}
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
                                <ContestSubmissions submissions={submissions} />
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
                        onDragEnd={(e: any) => {
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
                            result={result?.result}
                        />
                    </Split>
                </Split>
            </div>
        </div>
    );
}
