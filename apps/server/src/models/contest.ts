export interface Contest {
    id: string;
    title: string;
    description?: string;
    start_time: Date;
    duration: number;
    contest_code: string;
    buffer_time: number;
    strict_time: boolean;
    created_by: string;
    created_at: Date;
    updated_at: Date;
    is_registration_open: boolean;
    problems?: ContestProblem[]; // Add problems property
    users?:Number; // Add users property
}

export interface ContestProblem {
    problem_id: string;
    problem_name: string;
    points: number;
}