export interface ContestSubmissions {
    id: string;
    user_id: string;
    contest_id: string;
    problem_id: string;
    verdict: string; 
    code: string;
    language: string;
    execution_time?: number;
    memory_used?: number;
    submitted_at: Date;
}
