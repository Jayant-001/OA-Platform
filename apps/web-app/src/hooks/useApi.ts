import apiService from "@/api/apiService";
import { AddTestCase, CreateProblem, CreateContest } from "@/types";

export const useAdminApi = () => {
    /*
        // ----------------------------------- Contest routes --------------------------------
    */
    const fetchContests = async () => {
        return await apiService.get("/api/admins/contests");
    };

    const fetchContestById = async (contest_id: string) => {
        const data = await apiService.get(`/api/admins/contests/${contest_id}`);
        return data;
    };

    const updateContestById = async (contest_id: string, contestData: any) => {
        return await apiService.put(
            `/api/admins/contests/${contest_id}`,
            contestData
        );
    };

    const updateContestProblems = async (
        contestId: string,
        problemsList: { problem_id: string; points: number }[]
    ) => {
        return await apiService.put(
            `/api/admins/contests/${contestId}/problems`,
            { problems: problemsList }
        );
    };

    const updateContestUsers = async (
        contestId: string,
        user_ids: string[] | []
    ) => {
        return await apiService.put(`/api/admins/contests/${contestId}/users`, {
            user_ids,
        });
    };

    const deleteContestById = async (contest_id: string) => {
        return await apiService.delete(`/api/admins/contests/${contest_id}`);
    };

    /*
        // ----------------------------------- Problem routes --------------------------------
    */
    const fetchProblems = async () => {
        return await apiService.get("/api/admins/problems");
    };

    const fetchProblemById = async (problemId: string) => {
        return await apiService.get(`/api/admins/problems/${problemId}`);
    };

    const fetchTags = async () => {
        return await apiService.get("/api/admins/tags");
    };

    const createProblem = async (problemData: CreateProblem) => {
        return await apiService.post("/api/admins/problems", problemData);
    };

    const updateProblem = async (
        problemId: string,
        problemData: CreateProblem
    ) => {
        return await apiService.put(
            `/api/admins/problems/${problemId}`,
            problemData
        );
    };

    const fetchUsers = async () => {
        return await apiService.get("/api/admins/users");
    };

    return {
        fetchContestById,
        fetchContests,
        fetchProblems,
        deleteContestById,
        updateContestProblems,
        updateContestById,
        updateContestUsers,
        fetchProblemById,
        fetchTags,
        createProblem,
        updateProblem,
        fetchUsers,
    };
};

export const useUsersApi = () => {
    /*
        // ----------------------------------- User routes --------------------------------
    */

    const searchContestByCode = async (code: string) => {
        return await apiService.get(
            `/api/users/contests/search?contestCode=${code}`
        );
    };

    const fetchAllRegisteredContests = async () => {
        return await apiService.get(`/api/users/contests`);
    };

    const registerToContest = async (contestId: string) => {
        return await apiService.post(
            `/api/users/contests/${contestId}/register`,
            {}
        );
    };

    const fetchUpcomingContests = async () => {
        return await apiService.get("/api/users/contests/upcoming-contests");
    };

    const fetchContestById = async (contest_id: string) => {
        return await apiService.get(`/api/users/contests/${contest_id}`);
    };

    const getContestProblems = async (contest_id: string) => {
        return await apiService.get(
            `/api/users/contests/${contest_id}/problems`
        );
    };

    const getContestProblemById = async (
        contest_id: string,
        problem_id: string
    ) => {
        return await apiService.get(
            `/api/users/contests/${contest_id}/problems/${problem_id}`
        );
    };

    return {
        fetchUpcomingContests,
        fetchContestById,
        getContestProblems,
        getContestProblemById,
        searchContestByCode,
        fetchAllRegisteredContests,
        registerToContest,
    };
};

export const useSubmissionApi = () => {
    const getSubmissionsByProblemId = async (
        contestId: string,
        problemId: string
    ) => {
        return await apiService.get(
            `/api/users/contests/${contestId}/problems/${problemId}/submissions`
        );
    };

    const getSubmissionById = async (submissionId: string) => {
        return await apiService.get(
            `/api/users/contests/submissions/${submissionId}`
        );
    };

    const createSubmission = async ({
        code,
        language,
        problemId,
        contestId,
    }: {
        code: string;
        language: string;
        problemId: string;
        contestId: string;
    }) => {
        const url = `/api/users/contests/${contestId}/problems/${problemId}/submit`;
        return await apiService.post(url, { code, language });
    };

    const getSubmissionResult = async (submission_id: string) => {
        return await apiService.get(
            `/api/users/contests/submit/${submission_id}/result`
        );
    };

    const runCode = async (content: any) => {
        return await apiService.post(`/api/run-code`, content);
    };

    const getRunCodeResult = async (submission_id: string) => {
        return await apiService.get(`/api/run-code/${submission_id}/result`);
    };

    return {
        getSubmissionsByProblemId,
        getSubmissionById,
        createSubmission,
        getSubmissionResult,
        runCode,
        getRunCodeResult,
    };
};

export const useTestCaseApi = () => {
    const addTestCase = async (problemId: string, testCase: AddTestCase) => {
        return await apiService.post(
            `/api/admins/problems/${problemId}/test-cases`,
            testCase
        );
    };

    const addBulkTestCases = async (
        problemId: string,
        testCases: AddTestCase[]
    ) => {
        return await apiService.post(
            `/api/admins/problems/${problemId}/test-cases/bulk`,
            testCases
        );
    };

    const updateTestCase = async (
        problemId: string,
        testCaseId: string,
        testCase: AddTestCase
    ) => {
        return await apiService.put(
            `/api/admins/problems/${problemId}/test-cases/${testCaseId}`,
            testCase
        );
    };

    const getTestCasesByProblemId = async (problemId: string) => {
        return await apiService.get(
            `/api/admins/problems/${problemId}/test-cases`
        );
    };

    return {
        addTestCase,
        addBulkTestCases,
        getTestCasesByProblemId,
        updateTestCase,
    };
};

export const adminContestApi = () => {
    const createContest = async (contestData: CreateContest) => {
        return await apiService.post("api/admins/contests", contestData);
    };
    return { createContest };
};

export const leaderboardApi = () => {
    const getContestLeaderboard = async (contestId: string) => {
        return await apiService.get(`/api/leaderboard/${contestId}`);
    };

    return { getContestLeaderboard };
};

export const useCommonApi = () => {
    const fetchProfile = async () => {
        return await apiService.get(`/api/me`);
    };

    const logout = async () => {
        return await apiService.post('/api/logout', {});
    }

    return { fetchProfile, logout };
};
