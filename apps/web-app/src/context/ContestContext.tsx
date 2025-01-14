import React, { createContext, useState, useContext, useEffect } from "react";
import { ContestProblems } from "@/types";
import { leaderboardApi, useUsersApi } from "@/hooks/useApi";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";

interface LeaderboardProblem {
    problemId: string;
    verdict: string;
    noOfAttempts: number;
    finishTime: string;
}

interface LeaderboardUser {
    userId: string;
    userName: string;
    rank: number;
    totalPoints: number;
    finishTime: string;
    problems: LeaderboardProblem[];
}

interface ContestContextType {
    problems: ContestProblems[];
    setProblems: React.Dispatch<React.SetStateAction<ContestProblems[]>>;
    loading: boolean;
    leaderboard: LeaderboardUser[];
}

const ContestContext = createContext<ContestContextType | undefined>(undefined);

export const ContestProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [problems, setProblems] = useState<ContestProblems[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardUser | []>([]);
    const { getContestProblems } = useUsersApi();
    const { getContestLeaderboard } = leaderboardApi();
    const { contest_id } = useParams();
    const [loading, setLoading] = useState(true);

    const fetchProblems = async (contestId: string) => {
        try {
            console.log("Contest_Id Changes", contest_id);

            const problems = await getContestProblems(contestId);
            setProblems(problems);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error("Failed to fetch problems:", error);
            toast.error("Failed to fetch problems");
        }
    };

    const fetchLeaderboard = async (contestId: string) => {
        try {
            const leaderboardData = await getContestLeaderboard(contestId);
            setLeaderboard(leaderboardData);
        } catch (error) {
            console.log(error);
            toast.error("Failed to fetch leaderboard");
        }
    };

    useEffect(() => {
        fetchProblems(contest_id as string);
        fetchLeaderboard(contest_id as string);
    }, [contest_id]);

    useEffect(() => {
        console.log(leaderboard);
    }, [leaderboard]);

    return (
        <ContestContext.Provider value={{ problems, setProblems, loading }}>
            {children}
        </ContestContext.Provider>
    );
};

export const useContestContext = () => {
    const context = useContext(ContestContext);
    if (!context) {
        throw new Error(
            "useContestContext must be used within a ProblemProvider"
        );
    }
    return context;
};
