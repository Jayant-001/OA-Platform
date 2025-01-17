import { useSubmissionApi } from "@/hooks/useApi";
import { Submission } from "@/types";
import { useMemo, useState } from "react";
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
} from "@/components/ui/dialog";
import { AlignLeft, Clock, Cpu, FileCode } from "lucide-react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { Button } from "../ui/button";

type Props = {
    submissions: Submission[];
};

const ContestSubmissions = ({ submissions }: Props) => {
    const { getSubmissionById } = useSubmissionApi();
    const [selectedSubmission, setSelectedSubmission] =
        useState<Submission | null>(null);

    const verdictClass = useMemo(
        () => ({
            accepted: "text-green-500",
            wrong_answer: "text-red-500",
            time_limit_exceeded: "text-yellow-500",
            memory_limit_exceeded: "text-purple-500",
            runtime_error: "text-amber-600",
            Unknown: "text-gray-500",
        }),
        []
    );

    const handleSubmissionClick = async (submissionId: string) => {
        try {
            const submission = await getSubmissionById(submissionId);
            setSelectedSubmission(submission);
        } catch (error) {
            console.log(error);
            toast.error("Failed to fetch submission details");
        }
    };

    return (
        <>
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
                                        {new Date(
                                            submission.submitted_at
                                        ).toLocaleString()}
                                    </span>
                                    <div className="text-sm text-gray-500">
                                        {submission.language.replace(/\b\w/g, (char) => char.toUpperCase())}
                                    </div>
                                </div>
                                <span
                                    className={classNames(
                                        verdictClass[
                                            submission.verdict || "Unknown"
                                        ],
                                        "font-semibold"
                                    )}
                                >
                                    {submission.verdict
                                        ? submission.verdict
                                              .replace(/_/g, " ") // Replace underscores with spaces
                                              .replace(/\b\w/g, (char) =>
                                                  char.toUpperCase()
                                              ) // Capitalize first letter of each word
                                        : "Executing..."}
                                </span>
                            </div>
                        </div>
                    ))
                )}
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
                                                        "Unknown"
                                                ]
                                            )}
                                        >
                                            {selectedSubmission.verdict?.replace(
                                                /_/g,
                                                " "
                                            ).replace(/\b\w/g, char => char.toUpperCase()) || "Processing"}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm text-slate-500">
                                            Language
                                        </label>
                                        <p className="font-semibold">
                                            {selectedSubmission.language.replace(/\b\w/g, char => char.toUpperCase())}
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
        </>
    );
};

export default ContestSubmissions;
