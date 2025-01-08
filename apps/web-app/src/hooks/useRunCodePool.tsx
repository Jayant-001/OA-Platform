import { useCallback, useEffect, useState } from "react";
import { useSubmissionApi } from "./useApi";

interface TaskResult {
    status: string;
    result: string;
    error?: string;
    exetution_time?: string;
    memory_used?: string;
}

// Custom hook for handling long-running task polling
export const useLongRunningTask = (maxPollingTime: number = 20 * 1000) => {
    // Default 20 seconds
    const [requestId, setRequestId] = useState<string | null>(null);
    const [result, setResult] = useState<TaskResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { runCode, getRunCodeResult} = useSubmissionApi();

    // Submit the long-running task
    const submitTask = async (taskData: any) => {
        try {
            setIsLoading(true);
            setError(null);

            // Send task to backend
            const {submission_id} = await runCode(taskData);

            // Store the request ID
            setRequestId(submission_id);
        } catch (err) {
            setError("Failed to submit task");
            setIsLoading(false);
        }
    };

    // Poll for task result
    const pollTaskResult = useCallback(async () => {
        if (!requestId) return;

        try {
            const taskResult = await getRunCodeResult(requestId);

            // Update result based on status
            if (taskResult.status === "COMPLETED") {
                setResult(taskResult);
                setIsLoading(false);
                return true; // Stop polling
            } else if (taskResult.status === "ERROR") {
                setError(taskResult.result || "Task failed");
                setIsLoading(false);
                return true; // Stop polling
            }

            return false; // Continue polling
        } catch (err) {
            setError("Error fetching task result");
            setIsLoading(false);
            return true; // Stop polling on error
        }
    }, [requestId]);

    // Polling logic with timeout
    useEffect(() => {
        if (!requestId) return;

        const startTime = Date.now();
        let intervalId: NodeJS.Timeout;

        const pollWithTimeout = async () => {
            // Check if we've exceeded max polling time
            if (Date.now() - startTime > maxPollingTime) {
                setError("Polling timeout: Could not retrieve result");
                setIsLoading(false);
                clearInterval(intervalId);
                return;
            }

            const shouldStopPolling = await pollTaskResult();
            if (shouldStopPolling) {
                clearInterval(intervalId);
            }
        };

        // Initial poll
        pollWithTimeout();

        // Start interval polling
        intervalId = setInterval(pollWithTimeout, 2000); // Poll every 5 seconds

        // Cleanup
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [requestId, pollTaskResult, maxPollingTime]);

    // Reset the state
    const reset = () => {
        setRequestId(null);
        setResult(null);
        setIsLoading(false);
        setError(null);
    };

    return {
        submitTask,
        requestId,
        result,
        isLoading,
        error,
        reset,
    };
};