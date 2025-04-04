import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { X, Edit2, Plus, Save, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { Checkbox } from "../ui/checkbox";
import { useTestCaseApi } from "@/hooks/useApi";

interface TestCase {
    id: string;
    input: string;
    output: string;
    is_sample: boolean;
}

interface TestCaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    problemId: string;
}

export function TestCaseModal({
    isOpen,
    onClose,
    problemId,
}: TestCaseModalProps) {
    const [testCases, setTestCases] = useState<TestCase[]>([]);
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [isSample, setIsSample] = useState(false);
    const [editingIndex, setEditingIndex] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    const { getTestCasesByProblemId, addTestCase, updateTestCase } =
        useTestCaseApi();

    useEffect(() => {
        if (!problemId) {
            return;
        }

        (async () => {
            const existingTestcases = await getTestCasesByProblemId(problemId);
            const temp = existingTestcases.map((tc) => ({
                id: tc.id,
                input: tc.input,
                output: tc.output,
                is_sample: tc.is_sample,
            }));
            setTestCases(temp);
        })();
    }, []);

    const handleAddTestCase = async () => {
        if (!input.trim() || !output.trim()) {
            toast.error("Both input and output are required");
            return;
        }

        if (!problemId || problemId == "") {
            toast.error("Problem id not found");
            return;
        }

        if (editingIndex !== null) {
            try {
                setIsAdding(true);
                const updatedTestCase = await updateTestCase(
                    problemId,
                    editingIndex,
                    { input, output, is_sample: isSample }
                );
                setTestCases((prev) =>
                    prev.map((tc) => {
                        if (tc.id == editingIndex)
                            return {
                                id: editingIndex,
                                input: updatedTestCase.input,
                                output: updatedTestCase.output,
                                is_sample: updatedTestCase.is_sample,
                            };
                        return tc;
                    })
                );
                setEditingIndex(null);
                toast.success("Test case updated");
            } catch (error) {
                toast.error("Failed to update testcase");
            }
            finally {
                setIsAdding(false);
            }
        } else {
            try {
                setIsAdding(true);
                const addedTestCase = await addTestCase(problemId, {
                    input,
                    output,
                    is_sample: isSample,
                });
                console.log(addedTestCase);
                setTestCases([
                    ...testCases,
                    {
                        id: addedTestCase.id,
                        input,
                        output,
                        is_sample: isSample,
                    },
                ]);
                toast.success("Test case added");
            } catch (error) {
                toast.error("Failed to add test case");
            }
            finally {
                setIsAdding(false);
            }
        }

        setInput("");
        setOutput("");
        setIsSample(false);
    };

    const handleEdit = (testCase: TestCase) => {
        setInput(testCase.input);
        setOutput(testCase.output);
        setIsSample(testCase.is_sample);
        setEditingIndex(testCase.id);
    };

    const handleDelete = (index: number) => {
        setTestCases(testCases.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (testCases.length === 0) {
            toast.error("Add at least one test case");
            return;
        }

        try {
            setIsSubmitting(true);
            toast.success("Test cases updated successfully");
            onClose();
        } catch (error) {
            toast.error("Failed to update test cases");
        } finally {
            setIsSubmitting(false);
        }
    };

    const truncateText = (text: string, lines: number = 2) => {
        const lineArray = text.split("\n");
        if (lineArray.length > lines) {
            return lineArray.slice(0, lines).join("\n") + "\n...";
        }
        return text;
    };

    return (
        <Dialog isOpen={isOpen} onClose={onClose}>
            <DialogContent className="max-w-[90vw] w-[90vw] h-[90vh] flex flex-col">
                <DialogHeader className="flex flex-row items-center justify-between border-b pb-4">
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Manage Test Cases
                    </DialogTitle>
                    <DialogClose onClose={onClose} />
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-4">
                    <div className="space-y-6">
                        {/* Test Cases List */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg text-slate-700">
                                Test Cases ({testCases.length})
                            </h3>
                            <div className="space-y-3">
                                {testCases.map((testCase, index) => (
                                    <Card
                                        key={index}
                                        className="p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex gap-4">
                                            <div className="flex-1 space-y-2">
                                                <div className="space-y-1">
                                                    <label className="text-sm font-medium text-slate-500">
                                                        Input:
                                                    </label>
                                                    <pre className="p-2 bg-slate-50 rounded-md text-sm font-mono">
                                                        {truncateText(
                                                            testCase.input
                                                        )}
                                                    </pre>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-sm font-medium text-slate-500">
                                                        Output:
                                                    </label>
                                                    <pre className="p-2 bg-slate-50 rounded-md text-sm font-mono">
                                                        {truncateText(
                                                            testCase.output
                                                        )}
                                                    </pre>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleEdit(testCase)
                                                    }
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleDelete(index)
                                                    }
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {/* Add New Test Case */}
                        <Card className="p-4 bg-slate-50">
                            <h4 className="font-medium mb-4 text-slate-700">
                                {editingIndex !== null
                                    ? "Edit Test Case"
                                    : "Add New Test Case"}
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-500">
                                        Input:
                                    </label>
                                    <Textarea
                                        value={input}
                                        onChange={(e) =>
                                            setInput(e.target.value)
                                        }
                                        className="font-mono"
                                        rows={5}
                                        placeholder="Enter test case input..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-500">
                                        Output:
                                    </label>
                                    <Textarea
                                        value={output}
                                        onChange={(e) =>
                                            setOutput(e.target.value)
                                        }
                                        className="font-mono"
                                        rows={5}
                                        placeholder="Enter expected output..."
                                    />
                                </div>
                            </div>
                            <div className="mt-4 flex justify-between">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="terms"
                                        checked={isSample}
                                        onCheckedChange={(checked) => {
                                            setIsSample(checked as boolean);
                                        }}
                                    />
                                    <label
                                        htmlFor="terms"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700"
                                    >
                                        Is Sample
                                    </label>
                                </div>
                                <Button
                                    onClick={handleAddTestCase}
                                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                                >
                                    {isAdding ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Plus className="w-4 h-4 mr-2" />
                                    )}
                                    {editingIndex !== null
                                        ? "Update Test Case"
                                        : "Add Test Case"}
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="border-t pt-4 mt-auto">
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4 mr-2" />
                        )}
                        Save All Test Cases
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
