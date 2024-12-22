export interface Problem {
    id: string;
    title: string;
    problem_statement: string;
    example?: string;
    constraints?: string;
    level: string;
    input_format?: string;
    output_format?: string;
    time_limit?: string;
    memory_limit?: string;
    created_by: string;
    created_at: Date;
    updated_at: Date;
}