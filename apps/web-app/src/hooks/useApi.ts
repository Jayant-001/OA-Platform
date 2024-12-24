import apiService from "@/api/apiService";

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
        return await apiService.put(`/api/admins/contests/${contest_id}`, {...contestData})
    }
    
    const updateProblemSelection = async (contestId: string, problemsList: [{problemId: string, points: number}]) => {
        return await apiService.put(`api/admins/contests/${contestId}/problems`, problemsList);
    }

    /*
        // ----------------------------------- Problem routes --------------------------------
    */
    const fetchProblems = async () => {
        return await apiService.get("/api/admins/problems");
    };


    return { fetchContestById, fetchContests, fetchProblems, updateProblemSelection, updateContestById };
};
