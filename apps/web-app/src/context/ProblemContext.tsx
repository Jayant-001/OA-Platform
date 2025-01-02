import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { Problem } from '@/types';
import { useUsersApi } from "@/hooks/useApi";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";

interface ProblemContextType {
    problems: Problem[];
    setProblems: React.Dispatch<React.SetStateAction<Problem[]>>;
    loading: boolean;

}

const ProblemContext = createContext<ProblemContextType | undefined>(undefined);

export const ProblemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [problems, setProblems] = useState<Problem[]>([]);
    const { getContestProblems } = useUsersApi();
    const { contest_id } = useParams();
    const useparam = useParams();
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

    const clearProblems = () => {
        setProblems([]);
    };

    useEffect(() => {
        fetchProblems(contest_id as string);
        //clearProblems();
    }, [contest_id]);

    return (
        <ProblemContext.Provider value={{ problems, setProblems, loading }}>
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
