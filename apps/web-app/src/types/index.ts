export interface User {
    id: string;
    email: string;
    name: string;
    role: "user" | "admin";
}

// export interface Contest {
//   id: string;
//   title: string;
//   description: string;
//   startTime: Date;
//   duration: number;
//   rules: string[];
//   problemCount: number;
//   status: 'upcoming' | 'live' | 'past';
// }

export interface Contest {
    id: string;
    title: string; // Contest title (required field)
    description: string; // Contest description (optional)
    duration: number; // Duration in minutes (required field)
    start_time: string; // Start time of the contest (ISO string or Date object)
    contest_code: string; // Unique contest code (required field)
    buffer_time?: number; // Duration (in minutes) to join after the contest starts (optional)
    strict_time: boolean; // Boolean indicating whether strict time rules apply
    created_by: string; // The ID of the admin who created the contest (foreign key reference)
    created_at: string; // Timestamp when the contest was created (ISO string)
    updated_at: string; // Timestamp when the contest was last updated (ISO string)
    is_registration_open: boolean;
    is_registered: boolean;
}

export interface Problem {
    id: string;
    title: string;
    problem_statement: string;
    example: string;
    constraints: string;
    difficulty: string;
    input_format: string;
    output_format: string;
    time_limit: string;
    memory_limit: string;
    created_by: string;
    created_at: string;
    updated_at: string;
    tags: string[];
    points: number;
    status: "Solved" | "Attempted" | "Not Attempted"; // Add this line
}

export interface ContestProblems {
    id: string;
    title: string;
    points: number;
    status: string;
}

export interface Tag {
    id: string;
    name: string;
    code: string;
    created_at: Date;
    updated_at: Date;
}

export interface CreateProblem {
    title: string;
    problem_statement: string;
    example: string;
    constraints: string;
    level: string;
    input_format: string;
    output_format: string;
    time_limit: string;
    memory_limit: string;
    tags: string[];
}

export interface Submission {
    id: string;
    verdict: "accepted" | "wrong_answer" | "time_limit_exceeded" | "memory_limit_exceeded" | null;
    language: string;
    execution_time: string | null;
    memory_used: string | null;
    submitted_at: Date;
    status: string;
}

export interface AddTestCase {
    input: string;
    output: string;
    is_sample: boolean;
}

export interface TestCase {
    id: string;
    input: string;
    output: string;
    is_sample: boolean;
}


export interface CreateContest {
    title: string;
    description: string;
    start_time: string;
    duration: string;
    buffer_time: string;
    contest_code: string;
    strict_time: boolean;
   
}


