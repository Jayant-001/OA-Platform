import React, { createContext, useState, useContext, useEffect } from 'react';
import { ContestProblems } from '@/types';
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

interface ProblemContextType {
    problems: ContestProblems[];
    setProblems: React.Dispatch<React.SetStateAction<ContestProblems[]>>;
    loading: boolean;
    leaderboard: LeaderboardUser[];
}

const ProblemContext = createContext<ProblemContextType | undefined>(undefined);

export const ProblemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [problems, setProblems] = useState<ContestProblems[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardUser[] | []>([]);
    const { getContestProblems } = useUsersApi();
    const {getContestLeaderboard} = leaderboardApi();
    const { contest_id } = useParams();
    const [loading, setLoading] = useState(true);

    const fetchProblems = async (contestId: string) => {
        try {
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

    return (
        <ProblemContext.Provider value={{ problems, setProblems, loading, leaderboard, setLeaderboard }}>
            {children}
        </ProblemContext.Provider>
    );
};

export const useProblemContext = () => {
    const context = useContext(ProblemContext);
    if (!context) {
        throw new Error('useProblemContext must be used within a ProblemProvider');
    }
    return context;
};
