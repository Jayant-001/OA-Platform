export interface TestCase {
    id: string;
    input: string;
    output: string;
    problem_id: string;
    is_sample: boolean;
    input_url?: string;
    output_url?: string;
    created_at: Date;
    updated_at: Date;
}
