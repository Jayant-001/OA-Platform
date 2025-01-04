import { useState, useEffect, useMemo, useContext } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Problem, Submission } from "@/types";
import MonacoEditor from "@monaco-editor/react";
import { Resizable } from "re-resizable";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useAdminApi, useUsersApi, useSubmissionApi } from "@/hooks/useApi";
import toast from "react-hot-toast";
import classNames from "classnames";
import { Dialog, DialogOverlay, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogBody } from "../components/ui/dialog";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { FaBars, FaTimes } from "react-icons/fa";
import { useProblemContext } from "@/context/ProblemContext";

export function ProblemDescriptionPage() {
    const { problem_id: paramProblemId, contest_id } = useParams();
    const location = useLocation();
    const [problemId, setProblemId] = useState<string | undefined>(paramProblemId);
    const [problem, setProblem] = useState<Problem | null>(null);
    const [language, setLanguage] = useState("javascript");
    const [code, setCode] = useState("");
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [isConsoleCollapsed, setIsConsoleCollapsed] = useState(false);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { fetchProblemById } = useAdminApi();
    const { getContestProblemById } = useUsersApi();
    const { getSubmissionsByProblemId, getSubmissionById, createSubmission } = useSubmissionApi();
    const { problems } = useProblemContext();
    const isDashboardPage = location.pathname.includes("/dashboard");
    const navigate = useNavigate();


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
                    fetched_problem = await getContestProblemById(contest_id as string, problemId as string);
                    fetched_submissions = await getSubmissionsByProblemId(contest_id as string, problemId as string);

                }
                setProblem(fetched_problem);
                setSubmissions(fetched_submissions);
            } catch (error) {
                console.log(error);
                toast.error("Failed to fetch problem data");
            }
        })();
    }, [problemId, contest_id, isDashboardPage]);

    const handleRun = () => {
        // Handle running code
        setOutput("Running code...");
    };

    const handleSubmit = async () => {
        setOutput("Submitting solution...");
        try {
            const response = await createSubmission({
                code,
                language,
                problemId: problemId || "",
                contestId: contest_id || ""
            });
            setOutput("Submission successful!");
            toast.success("Submission successful!");
        } catch (error) {
            console.log(error);
            setOutput("Submission failed.");
            toast.error("Submission failed.");
        }
    };

    const verdictClass = useMemo(() => ({
        accepted: "text-green-500",
        wrong_answer: "text-red-500",
        time_limit_exceeded: "text-yellow-500",
        memory_limit_exceeded: "text-purple-500",
        default: "text-gray-500"
    }), []);

    const handleProblemClick = (id: string) => {
        if (id !== problemId) {
            console.log("Problem ID Switched To:", id);
            setProblemId(id); // Update local state
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
        <div className="h-screen flex">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 bg-gray-800 shadow-lg z-50 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out`}>
                <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-white">Problems</h2>
                        <button onClick={() => setIsSidebarOpen(false)} className="text-gray-500 hover:text-gray-300">
                            <FaTimes size={20} />
                        </button>
                    </div>
                    <ul className="space-y-2">
                        {problems.map((prob) => (
                            <li key={prob.id} className="cursor-pointer hover:bg-gray-700 p-2 rounded text-white" onClick={() => handleProblemClick(prob.id)}>
                                {prob.title}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="flex-grow flex flex-col">
                <div className="bg-gray-700 p-2 flex justify-between items-center border-b">
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-white">
                        <FaBars size={20} />
                    </button>
                    <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="w-[180px] bg-white text-black">
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
                    <div className="flex space-x-2">
                        <Button variant="outline" onClick={handleRun}>
                            Run
                        </Button>
                        <Button onClick={handleSubmit}>Submit</Button>
                    </div>
                </div>

                <div className="flex-grow flex flex-col">
                    <Split
                        horizontal={false}
                        initialPrimarySize="40%"
                        minPrimarySize="20%"
                        minSecondarySize="40%"
                    >
                        {/* Problem Description Panel */}
                        <div className="h-full overflow-y-auto bg-background p-4">
                            <Tabs defaultValue="description">
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
                                                    onClick={() => handleSubmissionClick(submission.id)}
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <span className="font-medium">
                                                                {new Date(submission.submitted_at).toLocaleString()}
                                                            </span>
                                                            <div className="text-sm text-gray-500">
                                                                {submission.language}
                                                            </div>
                                                        </div>
                                                        <span className={classNames(verdictClass[submission.verdict || "default"], "font-semibold")}>
                                                            {submission.verdict ? submission.verdict.replace(/_/g, " ") : "No Verdict"}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>

                        {/* Code Editor Panel */}
                        <div className="h-full flex flex-col">
                            {/* Editor */}
                            <div className="flex-grow">
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
                                    }}
                                />
                            </div>

                            {/* Console */}
                            <Resizable
                                enable={{ top: true }}
                                defaultSize={{ width: "100%", height: 200 }}
                                minHeight={40}
                                maxHeight={400}
                            >
                                <div className="bg-secondary border-t">
                                    <div
                                        className="flex items-center justify-between p-2 cursor-pointer"
                                        onClick={() =>
                                            setIsConsoleCollapsed(!isConsoleCollapsed)
                                        }
                                    >
                                        <span className="font-medium">Console</span>
                                        {isConsoleCollapsed ? (
                                            <ChevronUp size={20} />
                                        ) : (
                                            <ChevronDown size={20} />
                                        )}
                                    </div>
                                    {!isConsoleCollapsed && (
                                        <div className="p-2 space-y-2">
                                            <div>
                                                <label className="text-sm font-medium">
                                                    Input:
                                                </label>
                                                <Textarea
                                                    value={input}
                                                    onChange={(e) =>
                                                        setInput(e.target.value)
                                                    }
                                                    placeholder="Enter input here..."
                                                    className="font-mono"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium">
                                                    Output:
                                                </label>
                                                <Textarea
                                                    value={output}
                                                    readOnly
                                                    className="font-mono bg-muted"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Resizable>
                        </div>
                    </Split>
                </div>
            </div>

            {/* Submission Code Modal */}
            {selectedSubmission && (
                <Dialog isOpen={!!selectedSubmission} onClose={() => setSelectedSubmission(null)}>
                    <DialogOverlay>
                        <></>
                    </DialogOverlay>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Submission Code</DialogTitle>
                            <DialogClose onClose={() => setSelectedSubmission(null)} />
                        </DialogHeader>
                        <DialogBody>
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-medium">Code:</span>
                                <CopyToClipboard text={selectedSubmission.code}>
                                    <Button variant="outline">Copy Code</Button>
                                </CopyToClipboard>
                            </div>
                            <pre className="whitespace-pre-wrap overflow-auto max-h-96">{selectedSubmission.code}</pre>
                            <div className="mt-4">
                                <p><strong>Execution Time:</strong> {selectedSubmission.execution_time}</p>
                                <p><strong>Memory Used:</strong> {selectedSubmission.memory_used}</p>
                            </div>
                        </DialogBody>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
