import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
import { problems } from "@/data";
import { Problem } from "@/types";
import MonacoEditor from "@monaco-editor/react";
import { Resizable } from "re-resizable";
import { ChevronDown, ChevronUp } from "lucide-react";

export function ProblemDescriptionPage() {
    const { problem_id } = useParams();
    const [problem, setProblem] = useState<Problem | null>(null);
    const [language, setLanguage] = useState("javascript");
    const [code, setCode] = useState("");
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [isConsoleCollapsed, setIsConsoleCollapsed] = useState(false);

    useEffect(() => {
        // Fetch problem data
        if (problem_id) {
            setProblem(problems.find((p) => p.id === problem_id) || null);
        }
    }, [problem_id]);

    const handleRun = () => {
        // Handle running code
        setOutput("Running code...");
    };

    const handleSubmit = () => {
        // Handle submitting code
        setOutput("Submitting solution...");
    };

    if (!problem) return <div>Loading...</div>;

    return (
        <div className="h-screen flex flex-col">
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

                        <TabsContent value="description">
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
                                {/* Submissions list will go here */}
                                <p>No submissions yet</p>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Code Editor Panel */}
                <div className="h-full flex flex-col">
                    {/* Editor Header */}
                    <div className="bg-secondary p-2 flex justify-between items-center border-b">
                        <Select value={language} onValueChange={setLanguage}>
                            <SelectTrigger className="w-[180px]">
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
    );
}
