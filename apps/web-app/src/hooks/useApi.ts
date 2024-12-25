import apiService from "@/api/apiService";
import { CreateProblem } from "@/types";

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
        return await apiService.put(`/api/admins/contests/${contest_id}`, {
            ...contestData,
        });
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

    /*
        // ----------------------------------- User routes --------------------------------
    */
    const fetchUsers = async () => {
        return await apiService.get("/api/admins/users");
    };

    return {
        fetchContestById,
        fetchContests,
        fetchProblems,
        updateContestProblems,
        updateContestById,
        updateContestUsers,
        fetchUsers,
        fetchProblemById,
        fetchTags,
        createProblem,
        updateProblem,
    };
};
