export interface ProblemSubmissions {
    id: string;
    problem_id: string;
    verdict: string;
    code: string;
    language: string;
    execution_time?: number;
    memory_used?: number;
    submitted_by: string;
    submitted_at: Date;
}
